package com.orva.rainagency

import ai.onnxruntime.*
import android.content.Context
import android.util.Log
import java.io.File
import java.io.FileOutputStream
import java.nio.FloatBuffer
import kotlin.math.*
import org.jtransforms.fft.FloatFFT_1D

class Biometric(private val context: Context) {

    companion object {
        private const val TAG = "Biometric"

        /* ---------- Constants -------------------*/
        private const val TARGET_SR = 16_000
        private const val N_FFT = 512
        private const val WIN = 400 // 25 ms
        private const val HOP = 160 // 10 ms
        private const val N_MELS = 80
        private const val F_MIN_HZ = 0f
        private const val F_MAX_HZ = 8_000f
        private const val LOG_OFFS = 1e-5f
    }

    private val env: OrtEnvironment
    private val session: OrtSession

    // Cache for storing embeddings with their identifiers
    private val embeddingCache = mutableMapOf<String, FloatArray>()

    init {
        // 1) Create ONNX Runtime environment and session options
        env = OrtEnvironment.getEnvironment()
        val sessionOptions = OrtSession.SessionOptions()

        // 2) Try to enable NNAPI if available, else default to CPU
        if (OrtEnvironment.getAvailableProviders().contains(OrtProvider.NNAPI)) {
            sessionOptions.addNnapi()
            Log.d(TAG, "NNAPI enabled")
        } else {
            Log.e(TAG, "Using CPUExecutionProvider, NNAPI not enabled")
        }

        // 3) Copy the model from assets, then load it into a session
        val modelPath = assetFilePath(context, "biometric.onnx")
        session = env.createSession(modelPath, sessionOptions)
        Log.d(TAG, "Biometric ONNX model loaded successfully: $modelPath")
    }

    /* ---------- Hann window LUT ---------- */
    private val hannWindow =
            FloatArray(WIN) { i -> (0.5f - 0.5f * cos(2.0 * Math.PI * i / WIN)).toFloat() }

    /* ---------- Mel filter matrix ---------- */
    private val melFilter: Array<FloatArray> by lazy {
        fun hzToMel(hz: Float) = 2595f * log10(1f + hz / 700f)
        fun melToHz(mel: Float) = 700f * (10f.pow(mel / 2595f) - 1f)

        val melMin = hzToMel(F_MIN_HZ)
        val melMax = hzToMel(F_MAX_HZ)
        val melSteps =
                FloatArray(N_MELS + 2) { i -> melMin + (melMax - melMin) * i / (N_MELS + 1) }
                        .map(::melToHz)

        val bins = melSteps.map { ((it / TARGET_SR) * N_FFT).toInt() }

        Array(N_MELS) { m ->
            FloatArray(N_FFT / 2 + 1) { k ->
                val left = bins[m]
                val center = bins[m + 1]
                val right = bins[m + 2]
                when {
                    k < left -> 0f
                    k < center -> (k - left) / (center - left).toFloat()
                    k < right -> (right - k) / (right - center).toFloat()
                    else -> 0f
                }
            }
        }
    }

    /** Copy a file from assets to internal storage and return the file path */
    private fun assetFilePath(context: Context, assetName: String): String {
        val file = File(context.filesDir, assetName)
        if (file.exists() && file.length() > 0) {
            return file.absolutePath
        }

        try {
            context.assets.open(assetName).use { inputStream ->
                FileOutputStream(file).use { outputStream ->
                    val buffer = ByteArray(4 * 1024)
                    var read: Int
                    while (inputStream.read(buffer).also { read = it } != -1) {
                        outputStream.write(buffer, 0, read)
                    }
                    outputStream.flush()
                }
            }
            return file.absolutePath
        } catch (e: Exception) {
            Log.e(TAG, "Error copying asset file: $assetName", e)
            throw e
        }
    }

    private fun shortsToFloats(shorts: ShortArray): FloatArray {
        return FloatArray(shorts.size) { i -> shorts[i].toFloat() / Short.MAX_VALUE.toFloat() }
    }

    private fun stftPower(audio: FloatArray): Array<FloatArray> {
        val fft = FloatFFT_1D(N_FFT.toLong())
        val frames = 1 + max(0, audio.size - WIN) / HOP
        val spec = Array(frames) { FloatArray(N_FFT / 2 + 1) }
        var offset = 0
        repeat(frames) { f ->
            val frame = FloatArray(N_FFT)
            for (i in 0 until WIN) {
                if (offset + i < audio.size) {
                    frame[i] = audio[offset + i] * hannWindow[i]
                }
            }
            fft.realForward(frame)
            spec[f][0] = frame[0].pow(2)
            for (k in 1 until N_FFT / 2) {
                val r = frame[2 * k]
                val im = frame[2 * k + 1]
                spec[f][k] = r * r + im * im
            }
            spec[f][N_FFT / 2] = frame[1].pow(2)
            offset += HOP
        }
        return spec
    }

    private fun melLog(spec: Array<FloatArray>): Array<FloatArray> {
        val frames = spec.size
        val mel = Array(N_MELS) { FloatArray(frames) }
        for (m in 0 until N_MELS) {
            val filt = melFilter[m]
            for (t in 0 until frames) {
                var e = 0f
                for (k in filt.indices) e += filt[k] * spec[t][k]
                mel[m][t] = ln(e + LOG_OFFS)
            }
        }
        return mel
    }

    // Returns both tensor and shape[2] (length) for use in embedding
    private fun preprocessFromBuffer(
            pcmShorts: ShortArray,
            sampleRate: Int = TARGET_SR
    ): Pair<OnnxTensor, Long> {
        val floats = shortsToFloats(pcmShorts)
        val power = stftPower(floats)
        val melLog = melLog(power)

        val time = melLog[0].size
        val flat = FloatArray(N_MELS * time)
        for (m in 0 until N_MELS) {
            System.arraycopy(melLog[m], 0, flat, m * time, time)
        }
        val shape = longArrayOf(1, N_MELS.toLong(), time.toLong())
        val buffer = FloatBuffer.wrap(flat)
        return Pair(OnnxTensor.createTensor(env, buffer, shape), shape[2])
    }

    private fun l2Norm(v: FloatArray) {
        var norm = 0f
        for (x in v) norm += x * x
        norm = sqrt(norm)
        for (i in v.indices) v[i] /= (norm + 1e-10f)
    }

    private fun runEmbedding(tensor: OnnxTensor, length: Long): FloatArray {
        val lengthTensor = OnnxTensor.createTensor(env, longArrayOf(length))
        return session.run(mapOf("audio_signal" to tensor, "length" to lengthTensor)).use { result
            ->
            (result[1].value as Array<FloatArray>)[0]
        }
    }

    fun storeEmbedding(identifier: String, buffer: ShortArray, sampleRate: Int = TARGET_SR) {
        val embedding = generateEmbedding(buffer, sampleRate)
        embeddingCache[identifier] = embedding
        Log.d(TAG, "Stored embedding for identifier: $identifier")
    }

    fun getCachedEmbedding(identifier: String): FloatArray? {
        return embeddingCache[identifier]
    }

    fun removeEmbedding(identifier: String) {
        embeddingCache.remove(identifier)
        Log.d(TAG, "Removed embedding for identifier: $identifier")
    }

    fun clearCache() {
        embeddingCache.clear()
        Log.d(TAG, "Cleared all cached embeddings")
    }

    fun getCachedIdentifiers(): Set<String> {
        return embeddingCache.keys
    }

    /**
     * Verify audio buffer against cached embedding
     *
     * @param identifier Identifier of the cached embedding to compare against
     * @param buffer Audio buffer to verify
     * @param sampleRate Sample rate of the audio (default: 16000 Hz)
     * @param threshold Similarity threshold for verification (default: 0.85)
     * @return Pair of (isMatch: Boolean, similarityScore: Float) or null if identifier not found
     */
    fun verifyAgainstCached(
            identifier: String,
            buffer: ShortArray,
            sampleRate: Int = TARGET_SR,
            threshold: Float = 0.85f
    ): Pair<Boolean, Float>? {
        val cachedEmbedding = getCachedEmbedding(identifier) ?: return null

        val newEmbedding = generateEmbedding(buffer, sampleRate)
        val similarity = calculateSimilarity(cachedEmbedding, newEmbedding)

        return (similarity >= threshold) to similarity
    }

    /**
     * Generate speaker embedding from audio buffer
     *
     * @param buffer Audio buffer as ShortArray (PCM 16-bit)
     * @param sampleRate Sample rate of the audio (default: 16000 Hz)
     * @return Normalized speaker embedding as FloatArray
     */
    fun generateEmbedding(buffer: ShortArray, sampleRate: Int = TARGET_SR): FloatArray {
        val (tensor, length) = preprocessFromBuffer(buffer, sampleRate)
        val embedding = runEmbedding(tensor, length)
        tensor.close()
        l2Norm(embedding)
        return embedding
    }

    /**
     * Calculate similarity between two embeddings
     *
     * @param embedding1 First embedding
     * @param embedding2 Second embedding
     * @return Similarity score between 0.0 and 1.0
     */
    fun calculateSimilarity(embedding1: FloatArray, embedding2: FloatArray): Float {
        val cos = embedding1.zip(embedding2) { a, b -> a * b }.sum()
        return (cos + 1f) / 2f
    }

    /** Clean up resources */
    fun close() {
        try {
            clearCache()
            session.close()
            env.close()
            Log.d(TAG, "Biometric resources cleaned up")
        } catch (e: Exception) {
            Log.e(TAG, "Error cleaning up resources", e)
        }
    }
}
