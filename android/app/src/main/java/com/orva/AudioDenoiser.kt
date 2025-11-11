package com.orva.rainagency

import android.content.Context
import android.util.Log
import ai.onnxruntime.*
import org.jtransforms.fft.FloatFFT_1D
import kotlin.math.cos
import kotlin.math.PI
import kotlin.math.sqrt
import java.io.File
import java.io.FileOutputStream
import java.nio.ByteBuffer
import java.nio.ByteOrder
import java.nio.FloatBuffer
import java.text.SimpleDateFormat
import java.util.Date
import java.util.Locale
import android.os.Environment

class AudioDenoiser(
    private val context: Context,
    private val frameSize: Int = 512,   // FFT window length
    private val hopSize: Int = 256      // hop between windows
) {
    companion object {
        fun assetFilePath(context: Context, assetName: String): String {
            val outFile = File(context.filesDir, assetName)
            if (!outFile.exists()) {
                context.assets.open(assetName).use { input ->
                    FileOutputStream(outFile).use { output ->
                        input.copyTo(output)
                    }
                }
            }
            return outFile.absolutePath
        }
    }

    private val TAG = "AudioDenoiser"
    private val env: OrtEnvironment
    private val session: OrtSession

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
        val modelPath = assetFilePath(context, "noise_supression.onnx")
        session = env.createSession(modelPath, sessionOptions)
        Log.d(TAG, "Loaded ONNX model: $modelPath")
    }

    /**
     * Feed in your raw FloatArray (–1..+1), get back a denoised FloatArray.
     */
    fun denoise(rawSignal: FloatArray): FloatArray {
        // 0) normalize (mean‐sub + rms → 0.1 + clip)
        val signal = normalizeBuffer(rawSignal.copyOf())

        // 1) STFT
        val (real0, imag0) = complexSTFT(signal)
        val numFrames = real0.size
        val numBins   = real0[0].size

        // 2) flatten into [1, bins, frames, 2]
        val flat = FloatArray(1 * numBins * numFrames * 2)
        var idx = 0
        for (b in 0 until numBins) {
            for (t in 0 until numFrames) {
                flat[idx++] = real0[t][b]
                flat[idx++] = imag0[t][b]
            }
        }
        val tensor = OnnxTensor.createTensor(
            env,
            FloatBuffer.wrap(flat),
            longArrayOf(1, numBins.toLong(), numFrames.toLong(), 2)
        )

        // 3) run ONNX
        val inputName = session.inputNames.iterator().next()
        val result    = session.run(mapOf(inputName to tensor))
        @Suppress("UNCHECKED_CAST")
        val enhanced4D = (result[0].value as Array<Array<Array<FloatArray>>>)[0]
        result.close()
        tensor.close()

        // 4) unpack back to [frames][bins]
        val real1 = Array(numFrames) { FloatArray(numBins) }
        val imag1 = Array(numFrames) { FloatArray(numBins) }
        for (b in 0 until numBins) {
            for (t in 0 until numFrames) {
                val pair = enhanced4D[b][t]
                real1[t][b] = pair[0]
                imag1[t][b] = pair[1]
            }
        }

        // 5) inverse STFT with per‐sample normalization (overlap‐add)
        return inverseSTFT(real1, imag1, signal.size)
    }

    private fun normalizeBuffer(buf: FloatArray): FloatArray {
        // subtract mean
        val mean = buf.sum() / buf.size
        for (i in buf.indices) buf[i] -= mean
        // rms → 0.1
        var sq = 0f
        for (v in buf) sq += v * v
        val rms = sqrt(sq / buf.size)
        if (rms > 1e-6f) {
            val factor = 0.1f / rms
            for (i in buf.indices) buf[i] *= factor
        }
        // clip
        for (i in buf.indices) buf[i] = buf[i].coerceIn(-0.95f, +0.95f)
        return buf
    }

    private fun complexSTFT(audio: FloatArray): Pair<Array<FloatArray>, Array<FloatArray>> {
        val numFrames = ((audio.size - frameSize) / hopSize + 1).let {
            if ((audio.size - frameSize) % hopSize != 0) it + 1 else it
        }
        val numBins = frameSize / 2 + 1
        val real = Array(numFrames) { FloatArray(numBins) }
        val imag = Array(numFrames) { FloatArray(numBins) }
        val window = FloatArray(frameSize) { i ->
            (0.5f * (1 - cos(2 * PI * i / (frameSize - 1)))).toFloat()
        }
        val fft = FloatFFT_1D(frameSize.toLong())
        val buf = FloatArray(frameSize * 2)

        for (f in 0 until numFrames) {
            val start = f * hopSize
            for (i in 0 until frameSize) {
                buf[i] = if (start + i < audio.size) audio[start + i] * window[i] else 0f
            }
            for (i in frameSize until buf.size) buf[i] = 0f
            fft.realForwardFull(buf)
            for (b in 0 until numBins) {
                real[f][b] = buf[2 * b]
                imag[f][b] = buf[2 * b + 1]
            }
        }
        return real to imag
    }

    private fun inverseSTFT(
        real: Array<FloatArray>,
        imag: Array<FloatArray>,
        outputLength: Int
    ): FloatArray {
        val numFrames = real.size
        val numBins   = real[0].size
        val out       = FloatArray(outputLength) { 0f }
        val norm      = FloatArray(outputLength) { 0f }

        val window = FloatArray(frameSize) { i ->
            (0.5f * (1 - cos(2 * PI * i / (frameSize - 1)))).toFloat()
        }
        val fft = FloatFFT_1D(frameSize.toLong())
        val buf = FloatArray(frameSize * 2)

        for (f in 0 until numFrames) {
            // fill spectrum + mirror
            for (b in 0 until numBins) {
                buf[2 * b]     = real[f][b]
                buf[2 * b + 1] = imag[f][b]
            }
            for (b in numBins until frameSize) {
                buf[2 * b]     = buf[2 * (frameSize - b)]
                buf[2 * b + 1] = -buf[2 * (frameSize - b) + 1]
            }
            fft.complexInverse(buf, true)
            val start = f * hopSize
            for (i in 0 until frameSize) {
                val idx = start + i
                if (idx < outputLength) {
                    val w = window[i]
                    out[idx]  += buf[2 * i] * w
                    norm[idx] += w * w
                }
            }
        }
        for (i in out.indices) {
            if (norm[i] > 1e-8f) out[i] /= norm[i]
        }
        return out
    }

    /** Save 16-bit PCM WAV to app storage */
    fun saveDenoisedAudioAsWav(
        audioData: FloatArray,
        baseFileName: String,
        sampleRate: Int = 16000
    ): String? {
        return try {
            val denoisedDir = File(context.getExternalFilesDir(null), "denoised_audios")
            if (!denoisedDir.exists() && !denoisedDir.mkdirs()) return null

            val ts = SimpleDateFormat("yyyyMMdd_HHmmss", Locale.US).format(Date())
            val name = baseFileName.substringBeforeLast('.') + "_$ts.wav"
            val outFile = File(denoisedDir, name)

            FileOutputStream(outFile).use { os ->
                os.write(createWavHeader(audioData.size * 2, sampleRate))
                val buf = ByteBuffer.allocate(audioData.size * 2).order(ByteOrder.LITTLE_ENDIAN)
                for (s in audioData) {
                    val pcm = (s * 32767f).toInt().coerceIn(-32768, 32767)
                    buf.putShort(pcm.toShort())
                }
                os.write(buf.array())
            }
            Log.d(TAG, "Saved WAV: ${outFile.absolutePath}")
            outFile.absolutePath
        } catch (e: Exception) {
            Log.e(TAG, "WAV save failed: ${e.message}")
            null
        }
    }

    private fun createWavHeader(dataSize: Int, sampleRate: Int): ByteArray {
        val header = ByteBuffer.allocate(44).order(ByteOrder.LITTLE_ENDIAN)
        header.put("RIFF".toByteArray())
        header.putInt(dataSize + 36)
        header.put("WAVE".toByteArray())
        header.put("fmt ".toByteArray())
        header.putInt(16)
        header.putShort(1)
        header.putShort(1)
        header.putInt(sampleRate)
        header.putInt(sampleRate * 2)
        header.putShort(2)
        header.putShort(16)
        header.put("data".toByteArray())
        header.putInt(dataSize)
        return header.array()
    }


    fun copyDenoisedToDownloads() {
        val srcDir = File(context.getExternalFilesDir(null), "denoised_audios")
        val destDir = File(Environment.getExternalStoragePublicDirectory(Environment.DIRECTORY_DOWNLOADS), "denoised_audios")
        if (!destDir.exists()) destDir.mkdirs()

        srcDir.listFiles()?.forEach { file ->
            try {
                file.copyTo(File(destDir, file.name), overwrite = true)
                Log.d(TAG, "Copied ${file.name} to Downloads/denoised_audios")
            } catch (e: Exception) {
                Log.e(TAG, "Failed to copy ${file.name}: ${e.message}")
            }
        }
    }

    /** Free native resources when you’re done */
    fun cleanup() {
        try {
            session.close()
            env.close()
            Log.d(TAG, "Resources released")
        } catch (_: Exception) { }
    }
}
