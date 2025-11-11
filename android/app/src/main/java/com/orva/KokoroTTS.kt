package com.orva
import ai.onnxruntime.*
import android.content.Context
import android.util.Log
import org.json.JSONObject
import java.io.File
import java.io.FileOutputStream
import java.net.HttpURLConnection
import java.net.URL
import java.nio.ByteBuffer
import java.nio.ByteOrder
import java.nio.FloatBuffer
import java.nio.LongBuffer
import kotlinx.coroutines.*
import java.text.SimpleDateFormat
import java.util.Date
import java.util.Locale
import java.net.URLEncoder

class TTS(private val context: Context) {

    companion object {
        private const val TAG = "TTS"
        private const val MODEL_FILE = "tts.onnx"
        private const val TOKENIZER_FILE = "tokenizer.json"
        const val SAMPLE_RATE = 24000
        const val CHANNELS = 1
        private const val PAD_TOKEN_ID = 0
        private const val MAX_LENGTH = 512

        data class VoiceInfo(
            val id: Int,
            val name: String,
            val fileName: String,
            val accent: String,
            val gender: String
        )

        object Accent {
            const val US = "en-us"
            const val BRITISH = "en-gb"
        }

        // Voice ID mapping
        private val VOICES = mapOf(
            0 to VoiceInfo(0, "Bella", "af_bella", Accent.US, "Female"),
            1 to VoiceInfo(1, "Nicole", "af_nicole", Accent.US, "Female"),
            2 to VoiceInfo(2, "Adam", "am_adam", Accent.US, "Male"),
            3 to VoiceInfo(3, "Michael", "am_michael", Accent.US, "Male"),
            4 to VoiceInfo(4, "Emma", "bf_emma", Accent.BRITISH, "Female"),
            5 to VoiceInfo(5, "Isabella", "bf_isabella", Accent.BRITISH, "Female"),
            6 to VoiceInfo(6, "George", "bm_george", Accent.BRITISH, "Male"),
            7 to VoiceInfo(7, "Lewis", "bm_lewis", Accent.BRITISH, "Male"),
            8 to VoiceInfo(8, "Sarah", "af_sarah", Accent.US, "Female"),
            9 to VoiceInfo(9, "Sky", "af_sky", Accent.US, "Female"),
            10 to VoiceInfo(9, "Af", "af", Accent.US, "Female")
        )

        const val DEFAULT_VOICE_ID = 0
    }

    private val env: OrtEnvironment
    private val session: OrtSession
    private val tokenizer: Tokenizer
    private var isInitialized = false
    private val voiceStyles: MutableMap<String, Array<FloatArray>> = mutableMapOf()

    init {
        Log.d(TAG, "Initializing  TTS...")

        env = OrtEnvironment.getEnvironment()
        val sessionOptions = OrtSession.SessionOptions()
        val availableProviders = OrtEnvironment.getAvailableProviders()
        // Use NNAPI (GPU) if available, otherwise fallback to CPU
        if (availableProviders.contains(OrtProvider.NNAPI)) {
            sessionOptions.addNnapi()
            Log.d(TAG, "Using NNAPI for inference")
        } else {
            Log.d(TAG, "No GPU provider available, using CPU")
        }

        try {
            val modelPath = assetFilePath(context, MODEL_FILE)
            session = env.createSession(modelPath, sessionOptions)
            Log.d(TAG, "✓ Model loaded: $modelPath")

            val tokenizerPath = assetFilePath(context, TOKENIZER_FILE)
            tokenizer = Tokenizer(tokenizerPath)
            Log.d(TAG, "✓ Tokenizer loaded")

            // Preload all voice styles
            VOICES.values.forEach { voice ->
                try {
                    val voiceBytes = context.assets.open("voices/${voice.fileName}.bin").readBytes()
                    val voiceBuffer = ByteBuffer.wrap(voiceBytes).order(ByteOrder.LITTLE_ENDIAN).asFloatBuffer()
                    val numStyles = voiceBuffer.capacity() / 256
                    Log.d(TAG, "✓ Loaded ${voice.fileName}: $numStyles style vectors")
                    val styles = Array(numStyles) { FloatArray(256) { voiceBuffer.get() } }
                    voiceStyles[voice.fileName] = styles
                } catch (e: Exception) {
                    Log.e(TAG, "✗ Failed to load voice styles for ${voice.fileName}", e)
                    throw RuntimeException("Voice style loading failed for ${voice.fileName}: ${e.message}", e)
                }
            }
        } catch (e: Exception) {
            Log.e(TAG, "✗ Initialization failed", e)
            throw RuntimeException("TTS init failed: ${e.message}", e)
        }

        isInitialized = true
        Log.d(TAG, "✓  TTS ready (${VOICES.size} voices)")
    }

    private fun assetFilePath(context: Context, assetName: String): String {
        val file = File(context.cacheDir, assetName)

        if (file.exists() && file.length() > 0) {
            return file.absolutePath
        }

        context.assets.open(assetName).use { input ->
            FileOutputStream(file).use { output ->
                input.copyTo(output)
            }
        }

        return file.absolutePath
    }

    /**
     * Convert text to speech
     * @param text Text to convert
     * @param voiceId Voice ID (0-8, default: 0)
     * @param speed Speech speed (default: 1.0)
     * @return Audio samples as FloatArray
     */
    fun textToSpeech(
        text: String,
        voiceId: Int = DEFAULT_VOICE_ID,
        speed: Float = 1.0f,
        url:String
    ): FloatArray {
        if (text.isBlank()) throw IllegalArgumentException("Text cannot be empty")

        val voice = VOICES[voiceId] ?: VOICES[DEFAULT_VOICE_ID]!!

        Log.d(TAG, "TTS: \"${text.take(50)}...\" | Voice: ${voice.name} (ID: $voiceId) | Accent: ${voice.accent}")

        // Time phonemization
        val phonemizeStart = System.currentTimeMillis()
        val phonemes = runBlocking {
            phonemizeText(text, voice.accent, url)
        }
        val phonemizeTime = System.currentTimeMillis() - phonemizeStart
        Log.d(TAG, "⏱️ Phonemization took: ${phonemizeTime}ms")

        // Time tokenization
        val tokenizeStart = System.currentTimeMillis()
        val tokens = tokenizer.encode(phonemes)
        val tokenizeTime = System.currentTimeMillis() - tokenizeStart
        Log.d(TAG, "⏱️ Tokenization took: ${tokenizeTime}ms (${tokens.size} tokens)")

        if (tokens.size > MAX_LENGTH - 2) {
            throw IllegalArgumentException("Text too long: ${tokens.size} tokens")
        }

        // Time inference
        val inferenceStart = System.currentTimeMillis()
        val result = generateSpeech(tokens, voice, speed)
        val inferenceTime = System.currentTimeMillis() - inferenceStart
        Log.d(TAG, "⏱️ ONNX Inference took: ${inferenceTime}ms")

        return result
    }

    /**
     * Get all available voices grouped by accent
     * @return Map of accent to list of voices
     */
    fun getVoicesByAccent(): Map<String, List<VoiceInfo>> {
        return VOICES.values.groupBy { it.accent }
    }

    /**
     * Get all available voices
     * @return List of all voice information
     */
    fun getAllVoices(): List<VoiceInfo> {
        return VOICES.values.sortedBy { it.id }
    }

    private suspend fun phonemizeText(text: String, accent: String, url: String): String = withContext(Dispatchers.IO) {
        try {
            val encodedText = URLEncoder.encode(text, "UTF-8")
            val encodedAccent = URLEncoder.encode(accent, "UTF-8")
            val urlString = "$url?text=$encodedText&accent=$encodedAccent"

            val url = URL(urlString)
            val connection = url.openConnection() as HttpURLConnection

            connection.requestMethod = "GET"
            connection.connectTimeout = 10000
            connection.readTimeout = 10000
            connection.setRequestProperty("Accept", "application/json")

            val responseCode = connection.responseCode
            if (responseCode == HttpURLConnection.HTTP_OK) {
                val response = connection.inputStream.bufferedReader().use { it.readText() }
                val jsonResponse = JSONObject(response)
                val ipa = jsonResponse.getString("ipa")
                Log.d(TAG, "✓ Phonemized ($accent): $ipa")
                return@withContext ipa
            } else {
                throw RuntimeException("API error: $responseCode")
            }
        } catch (e: Exception) {
            Log.e(TAG, "✗ Phonemization failed: ${e.message}")
            throw RuntimeException("Phonemization failed: ${e.message}", e)
        }
    }

    private fun generateSpeech(tokens: IntArray, voice: VoiceInfo, speed: Float): FloatArray {
        if (!isInitialized) throw IllegalStateException("TTS not initialized")

        try {
            // PAD FIRST
            val inputIds = longArrayOf(PAD_TOKEN_ID.toLong()) +
                    tokens.map { it.toLong() }.toLongArray() +
                    longArrayOf(PAD_TOKEN_ID.toLong())

            Log.d(TAG, "Input IDs length after padding: ${inputIds.size}")

            val inputTensor = OnnxTensor.createTensor(
                env,
                LongBuffer.wrap(inputIds),
                longArrayOf(1, inputIds.size.toLong())
            )

            // Retrieve preloaded style vectors
            val styles = voiceStyles[voice.fileName]
                ?: throw IllegalStateException("Voice styles for ${voice.fileName} not loaded")

            val numStyles = styles.size
            Log.d(TAG, "Available style vectors: $numStyles")

            // Select the style vector - use direct indexing like Python
            val styleIndex = inputIds.size
            Log.d(TAG, "Style index (padded token count): $styleIndex")

            val styleVec = if (styleIndex < numStyles) {
                styles[styleIndex]
            } else {
                // Fallback if index exceeds available styles
                Log.w(TAG, "⚠️ Style index ($styleIndex) exceeds available styles ($numStyles), using last style")
                styles[numStyles - 1]
            }

            val styleTensor = OnnxTensor.createTensor(
                env,
                FloatBuffer.wrap(styleVec),
                longArrayOf(1, 256)
            )

            // Create speed tensor
            val speedTensor = OnnxTensor.createTensor(
                env,
                FloatBuffer.wrap(floatArrayOf(speed)),
                longArrayOf(1)
            )

            // Prepare inputs for ONNX model
            val inputs = mapOf(
                "input_ids" to inputTensor,
                "style" to styleTensor,
                "speed" to speedTensor
            )

            // Run inference
            val startTime = System.currentTimeMillis()
            val outputs = session.run(inputs)
            val inferenceTime = System.currentTimeMillis() - startTime

            // Extract audio samples from output
            val audioSamples = try {
                // Try 2D array first: [[samples]]
                @Suppress("UNCHECKED_CAST")
                (outputs[0].value as Array<FloatArray>)[0]
            } catch (e: Exception) {
                try {
                    // Try 1D array: [samples]
                    @Suppress("UNCHECKED_CAST")
                    outputs[0].value as FloatArray
                } catch (e2: Exception) {
                    // Try 3D array: [[[samples]]]
                    @Suppress("UNCHECKED_CAST")
                    (outputs[0].value as Array<Array<FloatArray>>)[0][0]
                }
            }

            // Calculate and log performance metrics
            val duration = audioSamples.size.toFloat() / SAMPLE_RATE
            val rtf = inferenceTime / (duration * 1000f)
            Log.d(TAG, "✓ Generated ${audioSamples.size} samples (%.2fs, %dms, RTF: %.2f)".format(
                Locale.US, duration, inferenceTime, rtf
            ))

            // Clean up tensors
            inputTensor.close()
            styleTensor.close()
            speedTensor.close()
            outputs.close()

            return audioSamples

        } catch (e: Exception) {
            Log.e(TAG, "✗ Generation failed", e)
            throw RuntimeException("Speech generation failed: ${e.message}", e)
        }
    }

    fun saveToWav(audioData: FloatArray, baseFileName: String): String? {
        try {
            val audioDir = File(context.getExternalFilesDir(null), "tts_audios")
            audioDir.mkdirs()

            val timestamp = SimpleDateFormat("yyyyMMdd_HHmmss", Locale.US).format(Date())
            val outputFile = File(audioDir, "${baseFileName}_$timestamp.wav")

            FileOutputStream(outputFile).use { output ->
                output.write(createWavHeader(audioData.size * 2, SAMPLE_RATE))
                val buffer = ByteBuffer.allocate(audioData.size * 2).order(ByteOrder.LITTLE_ENDIAN)
                audioData.forEach { sample ->
                    val pcm = (sample.coerceIn(-1.0f, 1.0f) * 32767f).toInt().coerceIn(-32768, 32767)
                    buffer.putShort(pcm.toShort())
                }
                output.write(buffer.array())
            }

            Log.d(TAG, "✓ Saved: ${outputFile.absolutePath}")
            return outputFile.absolutePath
        } catch (e: Exception) {
            Log.e(TAG, "✗ Save failed: ${e.message}")
            return null
        }
    }

    private fun createWavHeader(dataLength: Int, sampleRate: Int): ByteArray {
        val header = ByteArray(44)
        val totalLength = dataLength + 36
        val byteRate = sampleRate * CHANNELS * 2

        "RIFF".toByteArray().copyInto(header, 0)
        ByteBuffer.wrap(header, 4, 4).order(ByteOrder.LITTLE_ENDIAN).putInt(totalLength)
        "WAVE".toByteArray().copyInto(header, 8)
        "fmt ".toByteArray().copyInto(header, 12)
        ByteBuffer.wrap(header, 16, 28).order(ByteOrder.LITTLE_ENDIAN).apply {
            putInt(16)                  // Subchunk1Size
            putShort(1)                 // AudioFormat (PCM)
            putShort(CHANNELS.toShort()) // NumChannels
            putInt(sampleRate)          // SampleRate
            putInt(byteRate)            // ByteRate
            putShort((CHANNELS * 2).toShort()) // BlockAlign
            putShort(16)                // BitsPerSample
        }
        "data".toByteArray().copyInto(header, 36)
        ByteBuffer.wrap(header, 40, 4).order(ByteOrder.LITTLE_ENDIAN).putInt(dataLength)

        return header
    }

    fun close() {
        try {
            session.close()
            env.close()
            isInitialized = false
            voiceStyles.clear()
            Log.d(TAG, "✓ Resources released")
        } catch (e: Exception) {
            Log.e(TAG, "✗ Close error: ${e.message}")
        }
    }

    private class Tokenizer(tokenizerPath: String) {
        private val vocab = mutableMapOf<String, Int>()
        private val unkToken = "$"

        init {
            val json = File(tokenizerPath).readText(Charsets.UTF_8)
            val jsonObj = JSONObject(json)
            val vocabObj = jsonObj.getJSONObject("model").getJSONObject("vocab")
            val keys = vocabObj.keys()
            while (keys.hasNext()) {
                val key = keys.next()
                vocab[key] = vocabObj.getInt(key)
            }
            Log.d(TAG, "✓ Loaded ${vocab.size} tokens")
        }

        fun encode(input: String): IntArray {
            return input.map { char ->
                vocab[char.toString()] ?: vocab[unkToken] ?: 0
            }.toIntArray()
        }
    }
}