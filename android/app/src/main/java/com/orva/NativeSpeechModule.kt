package com.orva.rainagency

// import java.util.concurrent.ConcurrentLinkedQueue
// import kotlinx.coroutines.*
// import android.util.Log

import android.media.AudioDeviceInfo
import android.media.MediaRecorder
import android.os.Handler
import android.os.Looper
import android.util.Log
import android.widget.Toast
import com.facebook.react.bridge.*
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod
import com.facebook.react.modules.core.DeviceEventManagerModule
import com.google.gson.Gson
import com.orva.TTS
import java.io.*
import java.net.URLEncoder
import java.security.cert.X509Certificate
import java.util.Arrays
import javax.net.ssl.*
import kotlin.coroutines.resume
import kotlin.coroutines.suspendCoroutine
import kotlinx.coroutines.*
import kotlinx.coroutines.channels.Channel
import kotlinx.coroutines.channels.Channel.Factory.BUFFERED
import okhttp3.*
import okhttp3.Callback
import okhttp3.MediaType.Companion.toMediaType
import org.json.JSONObject

enum class API_STATUS {
    SUCCESS,
    ERROR
}

class NativeSpeechModule(reactContext: ReactApplicationContext) :
        ReactContextBaseJavaModule(reactContext) {
    private val audioDetectionQueue = Channel<AudioData>(Channel.BUFFERED)
    private val reactContext = reactContext
    private var isRecording = false
    private var audioRecorder: AudioRecorder? = null
    private var intentHandler: IntentHandler? = null

    private var wakeWordDetectionJob: Job? = null
    private var AUDIO_RECORD_BUSY_FLAG = false
    private var DEFAULT_NOISE_THRESHOLD = -35.0

    private var isWWDetected = false
    private var isProcessingTranscription = false
    private var isDetectingIntent = false
    private var isVoiceNotesInProgress = false
    private var isProcessingIntent = false
    private var callCount = 0

    private val wwAudioBuffer = ShortArray(WW_CHUNK_SIZE) // 1.3 seconds buffer
    private val intentAudioBuffer = ShortArray(INTENT_CHUNK_SIZE) // 2.4 seconds buffer
    private var caseNoteAudioBuffer = mutableListOf<Short>()

    private var wavFile: File? = null

    private var tts: TTS? = null // TTS instance
    private val noiseLevels = mutableListOf<Float>() // Buffer for noise levels
    private val maxIterations = 35 // Number of samples to consider
    private var currentThresholds = "medium" // Default threshold level
    private val counterThresholdToChangeNoiseLevel = 16 // Minimum count to change noise level

    private var v8WWModelRecognizer: WakeWordRecognizer? = null
    private var v11aWWModelRecognizer: WakeWordRecognizer? = null
    private var sttRecognizer: STTRecognizer? = null
    private var biometric: Biometric

    private var lastResponse: String? = null // Track the last successful response
    private var numListeners = 0

    private var customWWThreshold: Float? = null
    private var audioDenoiser: AudioDenoiser? = null
    private var denoiserStft: STFT? = null

    private var initializedIntent: String? = null

    private var earlyDetectedIntent: String? = null
    private var earlyDetectedConfidence: Float? = null
    private var hasPerformedEarlyDetection = false
    private var earlyDetectionTimestamp: Long? = null

    private var connectedMicrophoneDevice: WritableMap =
            Arguments.createMap().apply {
                putInt("deviceId", 0)
                putInt("deviceType", AudioDeviceInfo.TYPE_BUILTIN_MIC)
                putString("deviceName", "Samsung Tab")
            }
    private var connectedMicrophoneAudioSource: Int = MediaRecorder.AudioSource.DEFAULT

    data class AudioData(val pcmData: ShortArray, val username: String?)

    companion object {
        const val TAG = "NativeSpeechModule"

        enum class VOICE_NOTE_TYPE {
            CASE_NOTE,
            SMS
        }

        private val CASE_NOTE_EVENT: Map<String, String> =
                mapOf(
                        // "INITIATED" to "CASE_NOTE_INITIATED",
                        "COMPLETED" to "CASE_NOTE_COMPLETED",
                        "CANCELED" to "CASE_NOTE_CANCELED",
                        "TRANSCRIPTION" to "CASE_NOTE_TRANSCRIPTION",
                        "CLASSIFICATION" to "CASE_NOTE_CLASSIFICATION",
                        "PROCESSING" to "CASE_NOTE_PROCESSING",
                        "CANCEL" to "CASE_NOTE_CANCEL",
                        "SAVE" to "CASE_NOTE_SAVE"
                )
        private val VOICE_PANEL_EVENT: Map<String, String> =
                mapOf(
                        "TRANSCRIPTION" to "VOICE_PANEL_TRANSCRIPTION",
                        "SILENCE_DETECTED" to "VOICE_PANEL_SILENCE_DETECTED",
                        "CANCEL" to "VOICE_PANEL_CANCEL",
                )

        private val VOICE_CAPABILITIES_EVENT: Map<String, String> =
                mapOf(
                        "INTENT_DETECTION" to "INTENT_DETECTION",
                        "WW_DETECTED" to "WW_DETECTED",
                        "AUDIO_DECIBEL" to "AUDIO_DECIBEL",
                        "PROCESSING_INTENT" to "PROCESSING_INTENT",
                )
        private const val DEFAULT_EVENT = "DEFAULT_EVENT"

        private const val ASR_LOG_EVENT = "ASR_LOG_EVENT"
        private const val TOAST_MESSAGE_EVENT = "TOAST_MESSAGE_EVENT"

        private val gson = Gson()
        private val MAX_CALLS = 3 // Maximum number of API calls
        private val terminatingIntents =
                listOf(
                        "wheels in",
                        "anaesthesia start",
                        "awaken from anesthesia",
                        "patient asleep",
                        "patient ready",
                        "procedure start",
                        "procedure end",
                        "ready to exit",
                        "wheels out",
                        "room clean",
                        "room ready",
                        "timeout",
                        "case select",
                        "confirm patient",
                        "navigation",
                        "enter patient information",
                        "add new case",
                        "skip entry",
                        "submit and close the case",
                        "navigate to caseboard",
                        "navigate to support",
                        "case list",
                        "skip anaesthesia start",
                        "skip patient asleep",
                        "skip patient awake",
                        "dismiss all tools",
                        "cancel all tools",
                        "resume all timers",
                        "pause all tools",
                        "dismiss tool",
                        "cancel tool",
                        "resume tool",
                        "pause tool",
                        "set timer",
                        "set alarm",
                        "navigate to settings",
                        "navigate to sidebar",
                        "navigate to case tracker",
                        "navigate to case summary",
                        "navigate to cases",
                        "yes",
                        "no",
                        "cancel"
                )

        private val nonTerminatingIntents = listOf("voice note", "on demand alerts")

        enum class INITIATED_INTENTS(val value: String) {
            VOICE_NOTE("voice note"),
            SET_TIMER("set timer");

            companion object {
                fun fromValue(value: String?): INITIATED_INTENTS? {
                    return values().find { it.value == value }
                }
            }
        }

        private const val PREDICTION_INTERVAL = 1600
        private const val SAMPLE_RATE = 16000

        // VAD parameters
        val frameMs = 200L // check every 300ms
        val eosMs = 1800L // treat 1.0s continuous silence as end
        val maxIntentMs = 34000L // hard cap at 30s

        private val WW_CHUNK_SIZE: Int = SAMPLE_RATE * 13 / 10 // 1.3 seconds

        // private val INTENT_CHUNK_SIZE: Int = SAMPLE_RATE * 24 / 10 // 2.4 seconds
        private val INTENT_CHUNK_SIZE: Int = SAMPLE_RATE * 30 // 30 seconds buffer
        private const val WINDOW_SIZE_MS = 2000 // 2 seconds
        private const val SLIDING_STEP_MS = 400 // Sliding window step size
        private const val MAX_BUFFER_SIZE =
                (SAMPLE_RATE * WINDOW_SIZE_MS / 1000) * 2 // 2 bytes per sample

        private var asrBaseUrl = BuildConfig.ASR_BASE_URL
        private var API_URL = asrBaseUrl + "transcribe-intent?username=" // Change to your API URL

        private var sttBaseUrl = BuildConfig.ASR_STT_BASE_URL
        private var STT_CASE_NOTE_URL = sttBaseUrl + "transcribe-text"
        private var STT_SMS_URL = sttBaseUrl + "transcribe-text-message"

        private var CLASSIFICATION_BASE_URL = BuildConfig.ASR_CLASSIFICATION_BASE_URL
        private var CLASSIFICATION_API_KEY = BuildConfig.ASR_CLASSIFICATION_API_KEY
        private val PHONEMIZER_API_URL = BuildConfig.ASR_PHONEMIZER_API_URL
    }

    init {
        biometric = Biometric(reactContext)
        audioRecorder =
                AudioRecorder(reactContext) { deviceId, deviceType, deviceName, audioSource ->
                    getSwitchedMicrophoneDevice(deviceId, deviceType, deviceName, audioSource)
                }
        startAudioProcessingCoroutine()
        v8WWModelRecognizer = WakeWordRecognizer(reactContext, "ww-v8.onnx", ModelVersion.V8)
        v11aWWModelRecognizer = WakeWordRecognizer(reactContext, "ww-v11a.onnx", ModelVersion.V11a)
        sttRecognizer = STTRecognizer(reactContext, "conformer.onnx")
        intentHandler = IntentHandler(reactContext, asrBaseUrl) // Initialize the variable
        audioDenoiser = AudioDenoiser(reactContext)
        denoiserStft = STFT(256, 128)

        // Initialize and test synthesize TTS
        val overallStartTime = System.currentTimeMillis()

        try {
            Log.d(TAG, "⏱️ Starting TTS initialization...")
            val initStartTime = System.currentTimeMillis()
            tts = TTS(reactContext)
            val initTime = System.currentTimeMillis() - initStartTime
            Log.d(TAG, "✓ KokoroTTS initialized (${initTime}ms / ${initTime / 1000.0}s)")

            // Get all available voices
            Log.d(
                    TAG,
                    "═══════════════════════════════════════ AVAILABLE VOICES ═══════════════════════════════════════"
            )
            val allVoices = tts!!.getAllVoices()
            allVoices.forEach { voice ->
                Log.d(TAG, "ID: ${voice.id} | ${voice.name} | ${voice.accent} | ${voice.gender}")
            }

            // Get voices grouped by accent
            val voicesByAccent = tts!!.getVoicesByAccent()
            Log.d(TAG, "VOICES BY ACCENT:")
            voicesByAccent.forEach { (accent, voices) ->
                Log.d(TAG, "  $accent: ${voices.size} voices")
                voices.forEach { voice ->
                    Log.d(TAG, "    - ID ${voice.id}: ${voice.name} (${voice.gender})")
                }
            }

            try {
                val text =
                        "This is a note that we have to capture note that cefazolin has been given and diabetes maladies is a third state"
                val voiceId = 0 // Bella (US Female)
                val speed = 1.0f

                Log.d(TAG, "⏱️ Starting TTS generation...")
                val ttsStartTime = System.currentTimeMillis()
                val audio = tts!!.textToSpeech(text, voiceId, speed, PHONEMIZER_API_URL)
                val ttsTime = System.currentTimeMillis() - ttsStartTime
                Log.d(
                        TAG,
                        "✓ TTS generation completed (${ttsTime}ms / ${String.format("%.2f", ttsTime / 1000.0)}s)"
                )
                Log.d(TAG, "  Audio samples: ${audio.size}")
                Log.d(TAG, "  Audio duration: ${String.format("%.2f", audio.size / 24000.0)}s")

                // Save to external storage with timestamped filename
                Log.d(TAG, "⏱️ Saving audio file...")
                val saveStartTime = System.currentTimeMillis()
                val savedPath = tts!!.saveToWav(audio, "capture_note")
                val saveTime = System.currentTimeMillis() - saveStartTime

                if (savedPath != null) {
                    Log.d(TAG, "✓ Audio saved (${saveTime}ms)")
                    Log.d(TAG, "  Path: $savedPath")

                    val totalTime = System.currentTimeMillis() - overallStartTime

                    Log.d(
                            TAG,
                            "═══════════════════════════════════════ PERFORMANCE SUMMARY ═══════════════════════════════════════"
                    )
                    Log.d(
                            TAG,
                            "Initialization:  ${String.format("%6d", initTime)}ms (${String.format("%5.2f", initTime / 1000.0)}s)"
                    )
                    Log.d(
                            TAG,
                            "TTS Generation:  ${String.format("%6d", ttsTime)}ms (${String.format("%5.2f", ttsTime / 1000.0)}s)"
                    )
                    Log.d(
                            TAG,
                            "File Save:       ${String.format("%6d", saveTime)}ms (${String.format("%5.2f", saveTime / 1000.0)}s)"
                    )
                    Log.d(TAG, "───────────────────────────────────────")
                    Log.d(
                            TAG,
                            "Total Time:      ${String.format("%6d", totalTime)}ms (${String.format("%5.2f", totalTime / 1000.0)}s)"
                    )
                    Log.d(TAG, "═══════════════════════════════════════")
                } else {
                    Log.e(TAG, "✗ Failed to save TTS audio")
                }
            } catch (e: Exception) {
                val failTime = System.currentTimeMillis() - overallStartTime
                Log.e(TAG, "✗ TTS synthesis failed after ${failTime}ms: ${e.message}")
                e.printStackTrace()
            }
        } catch (e: Exception) {
            val failTime = System.currentTimeMillis() - overallStartTime
            Log.e(TAG, "✗ Failed to initialize KokoroTTS after ${failTime}ms: ${e.message}")
            e.printStackTrace()
        }
    }

    override fun getName(): String {
        return TAG
    }

    @ReactMethod
    fun getAsrBaseUrl(promise: Promise): Unit {
        promise.resolve(BuildConfig.ASR_BASE_URL)
    }

    private fun getThresholdByNoiseLevel(noiseLevel: Float): String {
        noiseLevels.add(noiseLevel)

        // Keep only the last `maxIterations` noise levels
        if (noiseLevels.size > maxIterations) {
            noiseLevels.removeAt(0) // Remove the oldest noise level
        }

        // If enough noise levels are collected, determine the dominant category
        if (noiseLevels.size == maxIterations) {
            var lowCount = 0
            var mediumCount = 0
            var highCount = 0

            // Categorize each noise level
            for (nl in noiseLevels) {
                when {
                    nl <= -33 -> lowCount++ // Low noise
                    nl in -33.0..-26.0 -> mediumCount++ // Medium noise
                    else -> highCount++ // High noise
                }
            }

            // Determine the dominant noise category
            val maxCount = maxOf(lowCount, mediumCount, highCount)

            if (maxCount >= counterThresholdToChangeNoiseLevel) {
                currentThresholds =
                        when (maxCount) {
                            highCount -> "low" // Use low thresholds for high noise
                            mediumCount -> "medium" // Use medium thresholds for medium noise
                            lowCount -> "high" // Use high thresholds for low noise
                            else -> currentThresholds // Keep current thresholds
                        }
            }
        }

        return currentThresholds
    }

    private fun calculateDecibels(audioData: ShortArray): Double {
        var sum = 0.0
        for (sample in audioData) {
            sum += sample * sample
        }
        val mean = sum / audioData.size
        val rms = Math.sqrt(mean)
        // Convert RMS to decibels
        return 20 * Math.log10(rms / Short.MAX_VALUE)
    }

    // Calculate decibels for a single chunk
    private fun calculateChunkDecibels(audioSamples: ShortArray): Double {
        if (audioSamples.isEmpty()) {
            return -160.0
        }
        var sum = 0.0
        // Calculate the square of each sample
        for (sample in audioSamples) {
            sum += sample * sample
        }
        // Calculate the mean of the squares
        val mean = sum / audioSamples.size
        // Calculate the root mean square (RMS)
        val rms = Math.sqrt(mean)
        // Convert RMS to decibels
        return 20 * Math.log10(rms / Short.MAX_VALUE)
    }

    @ReactMethod
    fun startListening(options: ReadableMap) {
        if (isRecording) {
            return
        }
        isRecording = true

        val preferredDeviceId: Int? =
                if (options.hasKey("preferredDeviceId") && !options.isNull("preferredDeviceId"))
                        options.getDouble("preferredDeviceId").toInt()
                else null

        val preferredDeviceType: Int? =
                if (options.hasKey("preferredDeviceType") && !options.isNull("preferredDeviceType"))
                        options.getDouble("preferredDeviceType").toInt()
                else null

        val preferredDeviceName: String? =
                if (options.hasKey("preferredDeviceName") && !options.isNull("preferredDeviceName"))
                        options.getString("preferredDeviceName")
                else null

        val userName: String =
                if (options.hasKey("userName") && !options.isNull("userName"))
                        options.getString("userName") ?: ""
                else ""

        API_URL =
                asrBaseUrl +
                        "transcribe-intent?username=" +
                        (if (!userName.isNullOrEmpty()) "$userName" else "")

        try {
            // Convert Double? to Int? safely
            val deviceId: Int? = preferredDeviceId?.toInt()
            val deviceType: Int? = preferredDeviceType?.toInt()
            val deviceName: String? = preferredDeviceName

            audioRecorder?.init(SAMPLE_RATE, MAX_BUFFER_SIZE, deviceId, deviceType, deviceName)

            audioRecorder?.start(PREDICTION_INTERVAL) { buffer, _ -> audioCaptureRoutine(buffer) }

            wakeWordDetectionJob =
                    CoroutineScope(Dispatchers.IO).launch { wakeWordDetectionRoutine(userName) }
        } catch (e: Exception) {
            Log.e(TAG, "Start record audio error: ${e.message}")
        }
    }

    private suspend fun audioCaptureRoutine(tempBuffer: ShortArray): Boolean {
        Log.d(
                TAG,
                "audioCaptureRoutine is running isWWDetected: $isWWDetected, isVoiceNotesInProgress: $isVoiceNotesInProgress"
        )

        if (isWWDetected) {
            sendEventToReactNative(
                    VOICE_CAPABILITIES_EVENT["AUDIO_DECIBEL"],
                    calculateDecibels(tempBuffer).toFloat()
            )
        }

        if (AUDIO_RECORD_BUSY_FLAG) {
            delay(200)
            return false
        }

        synchronized(wwAudioBuffer) {
            // Shift the audio buffer to remove the oldest 300ms and make room for new data
            System.arraycopy(
                    wwAudioBuffer,
                    PREDICTION_INTERVAL,
                    wwAudioBuffer,
                    0,
                    WW_CHUNK_SIZE - PREDICTION_INTERVAL
            )

            // Add the latest 300ms of audio to the end of the buffer
            System.arraycopy(
                    tempBuffer,
                    0,
                    wwAudioBuffer,
                    WW_CHUNK_SIZE - PREDICTION_INTERVAL,
                    PREDICTION_INTERVAL
            )
        }
        synchronized(intentAudioBuffer) {
            System.arraycopy(
                    intentAudioBuffer,
                    PREDICTION_INTERVAL,
                    intentAudioBuffer,
                    0,
                    INTENT_CHUNK_SIZE - PREDICTION_INTERVAL
            )

            // Add the latest 300ms of audio to the end of the buffer
            System.arraycopy(
                    tempBuffer,
                    0,
                    intentAudioBuffer,
                    INTENT_CHUNK_SIZE - PREDICTION_INTERVAL,
                    PREDICTION_INTERVAL
            )
        }

        return true
    }

    private suspend fun wakeWordDetectionRoutine(userName: String?) {
        while (isRecording) {
            Log.d(TAG, "wakeWordDetectionRoutine is running isRecording: $isRecording")
            if (!isProcessingTranscription) {
                var chunkCopy: ShortArray
                synchronized(wwAudioBuffer) {
                    chunkCopy = Arrays.copyOf(wwAudioBuffer, wwAudioBuffer.size)
                }
                if (!isWWDetected) {
                    performWakeWordDetection(chunkCopy, userName)
                    delay(320) // Small delay to prevent busy-waiting
                } else {
                    val noiseLevelCategory =
                            getThresholdByNoiseLevel(calculateDecibels(chunkCopy).toFloat())
                    var wakeTimestampMs = System.currentTimeMillis()
                    processTranscription(userName, wakeTimestampMs, noiseLevelCategory)
                }
            }
        }
    }

    private suspend fun performWakeWordDetection(pcmData: ShortArray, userName: String?) {
        if (isWWDetected) {
            return
        }
        val (transcription, confidence) =
                sttRecognizer?.transcribe(pcmData) ?: TranscriptionResult("", 0.0f)
        val trans = transcription.trim().lowercase()
        val isTranscriptionWakeWord =
                ACCEPTED_VARIATIONS.any { variation ->
                    (" " + trans).contains(variation, ignoreCase = true)
                }
        val noiseLevelCategory = getThresholdByNoiseLevel(calculateDecibels(pcmData).toFloat())
        val floatInputBuffer = FloatArray(pcmData.size)
        for (i in pcmData.indices) {
            floatInputBuffer[i] = pcmData[i] / 32768.0f
        }
        val cleanedBuffer: FloatArray =
                try {
                    // If audioDenoiser is null, or denoise() returns null, default to
                    // floatInputBuffer
                    audioDenoiser?.denoise(floatInputBuffer) ?: floatInputBuffer
                } catch (e: Exception) {
                    Log.e(TAG, "Error during denoising: ${e.message}", e)
                    floatInputBuffer
                }

        val (v8WWDetected, v8WWthreshold) =
                v8WWModelRecognizer?.recognizeONNXWakeWord(
                        cleanedBuffer,
                        noiseLevelCategory,
                        customWWThreshold
                )
                        ?: Pair(false, 0.0f)
        val (v11WWDetected, v11WWthreshold) =
                v11aWWModelRecognizer?.recognizeONNXWakeWord(
                        cleanedBuffer,
                        noiseLevelCategory,
                        customWWThreshold
                )
                        ?: Pair(false, 0.0f)

        if ((isTranscriptionWakeWord && confidence > 0.87f && (v8WWDetected || v11WWDetected)) ||
                        (isTranscriptionWakeWord && v8WWDetected && v11WWDetected) ||
                        (noiseLevelCategory != "high" && v8WWDetected && v11WWDetected)
        ) {

            // Convert cleanedBuffer back to ShortArray
            val cleanedShortArray = ShortArray(cleanedBuffer.size)
            for (i in cleanedBuffer.indices) {
                cleanedShortArray[i] =
                        (cleanedBuffer[i] * 32768.0f).toInt().coerceIn(-32768, 32767).toShort()
            }

            // send it once into the processing queue
            audioDetectionQueue.send(AudioData(pcmData = cleanedShortArray, username = userName))

            // Mark the moment we detected “wake word”
            var wakeTimestampMs = System.currentTimeMillis()
            setWWDetected(true)
            processTranscription(
                    userName,
                    wakeTimestampMs,
                    noiseLevelCategory,
                    wakeword = trans,
                    v8WWthreshold,
                    v11WWthreshold
            )
        }

        println(
                "######### Not Accepted Conformer WW -------- " +
                        "[AudioSource: ${connectedMicrophoneAudioSource}] " +
                        "[Transcription: $trans] " +
                        "[Confidence: %.2f] ".format(confidence) +
                        "[v8WWDetected: $v8WWDetected] " +
                        "[v11WWDetected: $v11WWDetected] " +
                        "[v8WWThreshold: $v8WWthreshold] " +
                        "[v11WWThreshold: $v11WWthreshold] " +
                        "[NoiseLevel: $noiseLevelCategory] " +
                        "[CustomWWThreshold: %.2f]".format(customWWThreshold ?: 0.0)
        )

        if (confidence > 0.60f) {
            val jsonData: WritableMap = Arguments.createMap()
            val connectedDeviceClone = Arguments.createMap()
            // Clone the connectedMicrophoneDevice
            connectedDeviceClone.merge(connectedMicrophoneDevice)
            jsonData.putMap("connectedDevice", connectedDeviceClone)
            jsonData.putInt("audioSource", connectedMicrophoneAudioSource)
            jsonData.putString("Transcription", trans)
            jsonData.putDouble("Confidence", confidence.toDouble())
            jsonData.putBoolean("v8WWDetected", v8WWDetected)
            jsonData.putBoolean("v11WWDetected", v11WWDetected)
            jsonData.putDouble("v8WWThreshold", v8WWthreshold.toDouble())
            jsonData.putDouble("v11WWThreshold", v11WWthreshold.toDouble())
            jsonData.putString("NoiseLevel", noiseLevelCategory)
            jsonData.putDouble("CustomWWThreshold", (customWWThreshold ?: 0.0).toDouble())
            jsonData.putString("message", "Wake word detection")

            sendEventToReactNative(ASR_LOG_EVENT, jsonData)
        }
    }

    private fun startAudioProcessingCoroutine() =
            CoroutineScope(Dispatchers.IO).launch {
                while (isActive) {
                    try {
                        delay(20000)
                        val audioData = audioDetectionQueue.receive()

                        // Create temporary WAV file
                        val wavFile =
                                File(
                                        reactContext.cacheDir,
                                        "wakeword_audio_${System.currentTimeMillis()}_${audioData.username ?: "unknown"}.wav"
                                )

                        FileOutputStream(wavFile).use { fos ->
                            val wavHeader = Utils.createWavHeader(audioData.pcmData.size.toLong())
                            fos.write(wavHeader)

                            // Convert ShortArray to ByteArray
                            val byteArray = ByteArray(audioData.pcmData.size * 2)
                            for (i in audioData.pcmData.indices) {
                                byteArray[i * 2] = (audioData.pcmData[i].toInt() and 0xFF).toByte()
                                byteArray[i * 2 + 1] =
                                        ((audioData.pcmData[i].toInt() shr 8) and 0xFF).toByte()
                            }

                            fos.write(byteArray)
                            fos.flush()
                        }

                        // Send to Azure
                        println(
                                "Sending audio to Azure for user ${audioData.username}: ${wavFile.absolutePath}"
                        )
                        ww_sendAudio(wavFile, audioData.username)

                        // Clean up temporary file
                        try {
                            if (wavFile.delete()) {} else {

                                println(
                                        "Failed to delete temporary WAV file: ${wavFile.absolutePath}"
                                )
                            }
                        } catch (e: Exception) {
                            Log.e(TAG, "Failed to delete temporary wav file: ${e.message}")
                            println("File deletion failed due to: ${e.message}")
                        }
                    } catch (e: Exception) {
                        Log.e(TAG, "Error processing audio data: ${e.message}")
                    }
                }
            }

    private suspend fun detectIntentViaAPIForEarlyDetection(
            wavFile: File,
            userName: String?,
            localIntent: String?,
            transcription: String?,
            confidence: Float?,
            noiseLevelCategory: String? = null,
            wakeword: String? = null,
            v8WWthreshold: Float? = 0.0f,
            v11WWthreshold: Float? = 0.0f
    ): Triple<String?, Float?, String?>? = suspendCoroutine { continuation ->
        val originalWavData = wavFile.readBytes()

        // Since this is early detection with 4 seconds, we don't need to trim further
        // The audio is already 4 seconds from the calling function
        val wavData = originalWavData

        try {
            val headers =
                    Headers.Builder()
                            .add("Accept", "application/json, text/plain, */*")
                            .add("Accept-Language", "en-US,en;q=0.9")
                            .add("Connection", "keep-alive")
                            .add("Content-Type", "application/octet-stream")
                            .build()

            val requestBody = RequestBody.create("application/octet-stream".toMediaType(), wavData)

            // Use the same API_URL with username parameter
            val apiUrl = asrBaseUrl + "transcribe-intent?username=" + (userName ?: "")

            println("Early detection API call to: $apiUrl")
            Log.d(TAG, "Early detection - Sending ${wavData.size} bytes to API")

            val request = Request.Builder().url(apiUrl).headers(headers).post(requestBody).build()

            val client = getUnsafeOkHttpClient()

            client.newCall(request)
                    .enqueue(
                            object : Callback {
                                override fun onFailure(call: Call, e: IOException) {
                                    Log.e(TAG, "Early detection API failed: ${e.message}")
                                    trackApiLogs(
                                            API_STATUS.ERROR,
                                            "Early Detection API ERROR: $apiUrl",
                                            e.message
                                    )
                                    e.printStackTrace()

                                    // Return null to indicate failure
                                    continuation.resume(null)
                                }

                                override fun onResponse(call: Call, response: Response) {
                                    try {
                                        if (response.isSuccessful) {
                                            val responseBody = response.body?.string()

                                            trackApiLogs(
                                                    API_STATUS.SUCCESS,
                                                    "Early Detection API SUCCESS: $apiUrl",
                                                    responseBody
                                            )

                                            Log.d(
                                                    TAG,
                                                    "Early detection API response: $responseBody"
                                            )

                                            // Parse the response
                                            val intentResponse: TranscriptionResponse? =
                                                    gson.fromJson(
                                                            responseBody,
                                                            TranscriptionResponse::class.java
                                                    )

                                            val finalIntent =
                                                    intentResponse?.final_intent ?: "unknown"
                                            val finalConfidence =
                                                    intentResponse?.final_confidence?.toFloat()
                                                            ?: 0f
                                            val azureTranscription =
                                                    intentResponse?.azure_transcription ?: ""
                                            val canaryOrg = intentResponse?.canary_org ?: ""
                                            val filePath = intentResponse?.file_path ?: ""

                                            // Log early detection result
                                            Log.d(TAG, "Early Detection Result:")
                                            Log.d(TAG, "  - Intent: $finalIntent")
                                            Log.d(TAG, "  - Confidence: $finalConfidence")
                                            Log.d(
                                                    TAG,
                                                    "  - Azure Transcription: $azureTranscription"
                                            )
                                            Log.d(TAG, "  - Canary Org: $canaryOrg")

                                            // Send analytics for early detection
                                            val message =
                                                    when {
                                                        azureTranscription.isNotEmpty() -> {
                                                            if (finalConfidence < 90) {
                                                                "Early Detection - Azure callback - FAIL - Intent recognition"
                                                            } else if (finalIntent.isNotEmpty() &&
                                                                            finalIntent != "unknown"
                                                            ) {
                                                                "Early Detection - Azure callback - PASS"
                                                            } else {
                                                                "Early Detection - FAIL - FP WW"
                                                            }
                                                        }
                                                        (finalIntent == "unknown" ||
                                                                finalIntent.isEmpty() ||
                                                                canaryOrg.isEmpty()) ->
                                                                "Early Detection - FAIL - FP WW"
                                                        finalConfidence <= 90 ->
                                                                "Early Detection - FAIL - Intent recognition"
                                                        else -> "Early Detection - PASS"
                                                    }

                                            // Log analytics for early detection
                                            val analyticsData = buildString {
                                                append("Early Detection Analytics:\n")
                                                append("Canary Org: $canaryOrg\n")
                                                append("Conformer Org: $localIntent\n")
                                                append("Conformer Transcription: $transcription\n")
                                                append("Conformer Confidence: $confidence\n")
                                                append("Noise Category: $noiseLevelCategory\n")
                                                append("Wakeword Transcription: $wakeword\n")
                                                append("V8 Threshold: $v8WWthreshold\n")
                                                append("V11 Threshold: $v11WWthreshold")
                                            }

                                            azureanalyticscanary(
                                                    userName = userName ?: "unknown_user",
                                                    message = message,
                                                    finalIntent = finalIntent,
                                                    filePath = filePath,
                                                    confidenceScore = finalConfidence,
                                                    canary_org = analyticsData
                                            )

                                            // Return the results as a Triple
                                            if (finalIntent != "unknown" && finalIntent.isNotEmpty()
                                            ) {
                                                continuation.resume(
                                                        Triple(
                                                                finalIntent,
                                                                finalConfidence,
                                                                responseBody
                                                        )
                                                )
                                            } else {
                                                // Return null if intent is unknown
                                                continuation.resume(null)
                                            }
                                        } else {
                                            Log.e(
                                                    TAG,
                                                    "Early detection API response not successful: ${response.code}"
                                            )
                                            Log.e(TAG, "Response message: ${response.message}")

                                            val errorBody = response.body?.string()
                                            trackApiLogs(
                                                    API_STATUS.ERROR,
                                                    "Early Detection API ERROR: $apiUrl",
                                                    "Response code: ${response.code}, Body: $errorBody"
                                            )

                                            continuation.resume(null)
                                        }
                                    } catch (e: Exception) {
                                        Log.e(
                                                TAG,
                                                "Error parsing early detection response: ${e.message}"
                                        )
                                        trackApiLogs(
                                                API_STATUS.ERROR,
                                                "Early Detection API Parse ERROR: $apiUrl",
                                                e.message
                                        )
                                        continuation.resume(null)
                                    } finally {
                                        response.close()
                                    }
                                }
                            }
                    )
        } catch (e: Exception) {
            Log.e(TAG, "Early detection API exception: ${e.message}")
            trackApiLogs(
                    API_STATUS.ERROR,
                    "Early Detection API EXCEPTION: ${asrBaseUrl}",
                    e.message
            )
            e.printStackTrace()
            continuation.resume(null)
        }
    }

    private suspend fun performEarlyIntentDetection(
            wakeTimestampMs: Long,
            userName: String?,
            noiseLevelCategory: String?,
            wakeword: String?,
            v8WWthreshold: Float?,
            v11WWthreshold: Float?
    ) {
        // Calculate samples for first 4 seconds after wake word
        val fourSecondsInSamples = SAMPLE_RATE * 4
        val tenSecondsAfterWake =
                ((System.currentTimeMillis() - wakeTimestampMs) * SAMPLE_RATE / 1000).toInt()

        // Extract first 4 seconds of audio after wake word
        val bufSize = intentAudioBuffer.size
        val wakeIndex = (bufSize - tenSecondsAfterWake).coerceIn(0, bufSize)
        val endIndex = (wakeIndex + fourSecondsInSamples).coerceIn(0, bufSize)

        val earlyAudioChunk =
                synchronized(intentAudioBuffer) {
                    intentAudioBuffer.copyOfRange(wakeIndex, endIndex)
                }

        // Perform STT on the 4-second chunk
        val (trans, confidence) =
                sttRecognizer?.transcribe(earlyAudioChunk) ?: TranscriptionResult("", 0.0f)

        // Get intent from local handler
        val result = intentHandler!!.getIntent(trans ?: "")

        Log.d(
                TAG,
                "Early Detection - Intent: ${result.mainIntent}, Confidence: ${result.confidence}"
        )

        if (result.confidence > 0.85) {
            // Store the early detected intent
            earlyDetectedIntent = result.mainIntent
            earlyDetectedConfidence = result.confidence

            Log.d(TAG, "Early detection successful: $earlyDetectedIntent")
        } else {
            // Send to API for detection
            val wavFile = createTempWavFile(earlyAudioChunk)

            detectIntentViaAPIForEarlyDetection(
                    wavFile,
                    userName,
                    result.mainIntent,
                    trans,
                    confidence,
                    noiseLevelCategory,
                    wakeword,
                    v8WWthreshold,
                    v11WWthreshold
            )
        }
    }

    private fun createTempWavFile(audioChunk: ShortArray): File {
        val wavFile =
                File(reactContext.cacheDir, "early_detection_${System.currentTimeMillis()}.wav")
        FileOutputStream(wavFile).use { fos ->
            val wavHeader = Utils.createWavHeader(audioChunk.size.toLong())
            fos.write(wavHeader)

            val byteArray = ByteArray(audioChunk.size * 2)
            for (i in audioChunk.indices) {
                byteArray[i * 2] = (audioChunk[i].toInt() and 0xFF).toByte()
                byteArray[i * 2 + 1] = ((audioChunk[i].toInt() shr 8) and 0xFF).toByte()
            }

            fos.write(byteArray)
            fos.flush()
        }
        return wavFile
    }

    private suspend fun processTranscription(
            userName: String? = "",
            wakeTimestampMs: Long = 0L,
            noiseLevelCategory: String? = null,
            wakeword: String? = null,
            v8WWthreshold: Float? = 0.0f,
            v11WWthreshold: Float? = 0.0f
    ) {
        if (!(callCount < MAX_CALLS && isWWDetected)) {
            setWWDetected(false)
            return
        }
        isProcessingTranscription = true

        // Reset early detection variables
        var earlyDetectedIntent: String? = null
        var earlyDetectedConfidence: Float? = null
        var hasPerformedEarlyDetection = false
        var earlyDetectionResponseBody: String? = null
        var earlyAudioChunk: ShortArray? = null
        delay(1000)
        val neededFrames = 2 // = 3–4 frames
        var silentFrames = 0
        var elapsedMs = 0L
        val twentyeightSecondsInSamples = SAMPLE_RATE * 28
        var oldTranscription = ""

        // wait until we see enough silence or hit maxIntentMs
        while (elapsedMs < maxIntentMs && isProcessingTranscription) {
            elapsedMs += frameMs
            Log.d(TAG, "what is elapsed time: $elapsedMs")
            delay(2000)

            // Check for early detection at  seconds
            if (!hasPerformedEarlyDetection && elapsedMs >= 400) {
                Log.d(TAG, "yes you are write.")
                hasPerformedEarlyDetection = true

                // Calculate samples for first 4 seconds after wake word
                val fourSecondsInSamples = SAMPLE_RATE * 4
                val currentTimestamp = System.currentTimeMillis()
                val timeSinceWake = currentTimestamp - wakeTimestampMs

                // Get the audio buffer position at wake word time
                val totalSamplesSinceWake = ((timeSinceWake * SAMPLE_RATE) / 1000).toInt()
                val bufferSize = intentAudioBuffer.size

                // Calculate indices for the first 4 seconds after wake word
                val startIndex = (bufferSize - totalSamplesSinceWake).coerceIn(0, bufferSize)
                val endIndex = (startIndex + fourSecondsInSamples).coerceIn(startIndex, bufferSize)

                // Extract first 4 seconds of audio
                val earlyAudioChunk =
                        synchronized(intentAudioBuffer) {
                            intentAudioBuffer.copyOfRange(startIndex, endIndex)
                        }

                // Perform early intent detection
                Log.d(TAG, "Performing early intent detection at 4 seconds...")

                // Transcribe the 4-second chunk
                val (trans, confidence) =
                        sttRecognizer?.transcribe(earlyAudioChunk) ?: TranscriptionResult("", 0.0f)

                // Get intent from local handler
                val result = intentHandler!!.getIntent(trans ?: "")

                Log.d(TAG, "Early Detection - Transcription: $trans")
                Log.d(
                        TAG,
                        "Early Detection - Intent: ${result.mainIntent}, Confidence: ${result.confidence}"
                )

                if (result.confidence > 0.85) {
                    // Store the early detected intent (local detection)
                    earlyDetectedIntent = result.mainIntent
                    earlyDetectedConfidence = result.confidence

                    // Create response body similar to API response
                    val intentResponseJson =
                            JSONObject().apply {
                                put("final_intent", result.mainIntent)
                                put("final_confidence", result.confidence)
                            }
                    earlyDetectionResponseBody = intentResponseJson.toString()

                    Log.d(
                            TAG,
                            "Early detection successful (local): $earlyDetectedIntent with confidence $earlyDetectedConfidence"
                    )
                } else {
                    // Create WAV file for API detection
                    val wavFile =
                            File(
                                    reactContext.cacheDir,
                                    "early_detection_${System.currentTimeMillis()}.wav"
                            )
                    FileOutputStream(wavFile).use { fos ->
                        val wavHeader = Utils.createWavHeader(earlyAudioChunk.size.toLong())
                        fos.write(wavHeader)

                        val byteArray = ByteArray(earlyAudioChunk.size * 2)
                        for (i in earlyAudioChunk.indices) {
                            byteArray[i * 2] = (earlyAudioChunk[i].toInt() and 0xFF).toByte()
                            byteArray[i * 2 + 1] =
                                    ((earlyAudioChunk[i].toInt() shr 8) and 0xFF).toByte()
                        }

                        fos.write(byteArray)
                        fos.flush()
                    }

                    // Call API for early detection (synchronously wait for result)
                    try {
                        val apiResult =
                                detectIntentViaAPIForEarlyDetection(
                                        wavFile,
                                        userName,
                                        result.mainIntent,
                                        trans,
                                        confidence
                                )

                        earlyDetectedIntent = apiResult?.first
                        earlyDetectedConfidence = apiResult?.second
                        earlyDetectionResponseBody = apiResult?.third

                        Log.d(
                                TAG,
                                "Early detection from API: $earlyDetectedIntent with confidence $earlyDetectedConfidence"
                        )

                        // Clean up temp file
                        wavFile.delete()
                    } catch (e: Exception) {
                        Log.e(TAG, "Early detection API call failed: ${e.message}")
                    }
                }
            }

            // Continue with existing silence detection logic
            val newTranscription = sendTranscriptionToPanel(wakeTimestampMs)
            if (newTranscription.length - oldTranscription.length < 4) {
                println(
                        "*************  Silence Detected by speech $oldTranscription:$newTranscription"
                )
                break
            }
            oldTranscription = newTranscription

            val sinceWake =
                    ((System.currentTimeMillis() - wakeTimestampMs - 1000) * SAMPLE_RATE / 1000)
                            .toInt()

            if (sinceWake >= twentyeightSecondsInSamples) {
                Log.d(TAG, "***--buffer length reached 28s samples)")
                break
            }

            if (Utils.isSilenceEnergy(intentAudioBuffer, sinceWake, biometric)) {
                println(">>> Silence Detected" + silentFrames)
                if (++silentFrames >= neededFrames) {
                    println(">>> Silence Detected by energy")
                    break
                }
            } else {
                silentFrames = 0
            }
        }

        var silenceTimestampMs = System.currentTimeMillis()
        sendEventToReactNative(VOICE_PANEL_EVENT["SILENCE_DETECTED"], true)
        println(">>> Silence Detected >>>" + isProcessingTranscription)

        // Check if we have early detected intent
        if (earlyDetectedIntent != null && earlyDetectedIntent != "unknown") {
            Log.d(TAG, "Using early detected intent: $earlyDetectedIntent")

            // Send the early detected intent to frontend
            sendEventToReactNative(
                    VOICE_CAPABILITIES_EVENT["INTENT_DETECTION"],
                    earlyDetectionResponseBody
            )

            // Handle the intent based on type
            val intentResponse =
                    TranscriptionResponse(
                            final_intent = earlyDetectedIntent,
                            final_confidence = earlyDetectedConfidence?.toInt(),
                            azure_transcription = null,
                            file_path = null,
                            canary_org = null
                    )

            val sinceWake =
                    ((System.currentTimeMillis() - wakeTimestampMs) * SAMPLE_RATE / 1000).toInt()
            val sinceSilence =
                    ((System.currentTimeMillis() - silenceTimestampMs) * SAMPLE_RATE / 1000).toInt()
            val bufSize = intentAudioBuffer.size
            var wakeIndex = bufSize - sinceWake
            var silenceIndex = bufSize - sinceSilence

            val intentChunkCopy =
                    synchronized(intentAudioBuffer) {
                        intentAudioBuffer.copyOfRange(wakeIndex, silenceIndex)
                    }

            handleIntentResponse(intentResponse, earlyDetectionResponseBody, intentChunkCopy)

            // Log early detection success
            val jsonData: WritableMap = Arguments.createMap()
            jsonData.putString("message", "Early intent detection used")
            jsonData.putString("intent", earlyDetectedIntent)
            jsonData.putDouble("confidence", earlyDetectedConfidence?.toDouble() ?: 0.0)
            sendEventToReactNative(ASR_LOG_EVENT, jsonData)

            return
        }

        // If no early detection or it failed, continue with normal flow
        val sinceWake =
                ((System.currentTimeMillis() - wakeTimestampMs) * SAMPLE_RATE / 1000).toInt()
        val sinceSilence =
                ((System.currentTimeMillis() - silenceTimestampMs) * SAMPLE_RATE / 1000).toInt()

        val bufSize = intentAudioBuffer.size
        var wakeIndex = bufSize - sinceWake
        var silenceIndex = bufSize - sinceSilence

        wakeIndex = wakeIndex.coerceIn(0, bufSize)
        silenceIndex = silenceIndex.coerceIn(0, bufSize)

        if (silenceIndex < wakeIndex) silenceIndex = wakeIndex

        val intentChunkCopy =
                synchronized(intentAudioBuffer) {
                    intentAudioBuffer.copyOfRange(wakeIndex, silenceIndex)
                }

        println(">>> about to transcribe ${intentChunkCopy.size} samples…")

        val (trans, confidence) =
                sttRecognizer?.transcribe(intentChunkCopy) ?: TranscriptionResult("", 0.0f)
        sendEventToReactNative(VOICE_PANEL_EVENT["TRANSCRIPTION"], trans)

        initializedIntent?.let {
            val intentResponseJson = JSONObject().apply { put("final_intent", initializedIntent) }
            val responseBody = intentResponseJson.toString()

            val intentResponse: TranscriptionResponse? =
                    gson.fromJson(responseBody, TranscriptionResponse::class.java)
            handleIntentResponse(intentResponse, responseBody, intentChunkCopy)
            return
        }

        if (!isProcessingTranscription) {
            setWWDetected(false)
            return
        }

        detectIntent(
                trans,
                confidence,
                intentChunkCopy,
                userName,
                wakeTimestampMs,
                noiseLevelCategory,
                wakeword,
                v8WWthreshold,
                v11WWthreshold
        )
    }

    private suspend fun detectIntent(
            trans: String? = "",
            confidence: Float?,
            intentChunkCopy: ShortArray,
            userName: String? = "",
            wakeTimestampMs: Long = 0L,
            noiseLevelCategory: String? = null,
            wakeword: String? = null,
            v8WWthreshold: Float? = 0.0f,
            v11WWthreshold: Float? = 0.0f
    ) {
        if (isDetectingIntent) {
            return
        }

        isDetectingIntent = true

        val result = intentHandler!!.getIntent(trans ?: "")
        Log.d(TAG, "Best Similarity: ${result.confidence}")
        Log.d(TAG, "Main Intent: ${result.mainIntent}")

        val wavFile = File(reactContext.cacheDir, "temp_audio.wav")
        FileOutputStream(wavFile).use { fos ->
            val wavHeader = Utils.createWavHeader(intentChunkCopy.size.toLong())
            fos.write(wavHeader)

            // Convert ShortArray to ByteArray
            val byteArray = ByteArray(intentChunkCopy.size * 2)
            for (i in intentChunkCopy.indices) {
                byteArray[i * 2] = (intentChunkCopy[i].toInt() and 0xFF).toByte() // Lower byte
                byteArray[i * 2 + 1] =
                        ((intentChunkCopy[i].toInt() shr 8) and 0xFF).toByte() // Higher byte
            }

            fos.write(byteArray)
            fos.flush()
        }

        val intent = result.mainIntent
        var message = "PASS"

        if (!isDetectingIntent) {
            setWWDetected(false)
            return
        }

        Log.d(
                TAG,
                "****************** result.first =${result.confidence} | result.second = ${result.matchedSynonym} | result.third = ${result.mainIntent}"
        )
        if (result.confidence > 0.85) {
            // If similarity is greater than 0.86
            val intentResponseJson = JSONObject().apply { put("final_intent", intent) }
            val responseBody = intentResponseJson.toString()
            val intentResponse: TranscriptionResponse? =
                    gson.fromJson(responseBody, TranscriptionResponse::class.java)
            println("conformer intent response: $intentResponse")

            handleIntentResponse(intentResponse, responseBody, intentChunkCopy)
        } else {
            message = "FAIL_FE"
            // Calculate duration from ACTUAL AUDIO SAMPLES (most accurate)
            val audioDurationSec = intentChunkCopy.size.toFloat() / SAMPLE_RATE
            if (audioDurationSec <= 30.0f) {
                println("API call for ${"%.1f".format(audioDurationSec)}s audio")
                detectIntentViaAPI(
                        wavFile,
                        userName,
                        intent,
                        trans,
                        confidence,
                        noiseLevelCategory,
                        wakeword,
                        v8WWthreshold,
                        v11WWthreshold,
                        intentChunkCopy
                )
            } else {
                println("Skipping API - audio too long (${"%.1f".format(audioDurationSec)}s)")
                sendEventToReactNative(VOICE_CAPABILITIES_EVENT["INTENT_DETECTION"], "unknown")
                setWWDetected(false)
            }
        }

        sendAudioToSaveInBE(wavFile, userName, result.mainIntent, result.confidence, message)
    }

    private suspend fun sendTranscriptionToPanel(wakeTimestampMs: Long): String {
        val panelSinceWake =
                ((System.currentTimeMillis() - wakeTimestampMs) * SAMPLE_RATE / 1000).toInt()
        // safe slicing indices
        val panelBufSize = intentAudioBuffer.size
        var panelWakeIndex = panelBufSize - panelSinceWake
        // clamp into [0, bufSize]
        panelWakeIndex = panelWakeIndex.coerceIn(0, panelBufSize)
        // grab the segment from wake → silence
        val intentChunkCopy =
                synchronized(intentAudioBuffer) {
                    intentAudioBuffer.copyOfRange(panelWakeIndex, intentAudioBuffer.size)
                }
        val (trans) = sttRecognizer?.transcribe(intentChunkCopy) ?: TranscriptionResult("", 0.0f)
        if (trans.length > 2) {
            sendEventToReactNative(VOICE_PANEL_EVENT["TRANSCRIPTION"], trans)
            Log.d(TAG, "************ Live Transcription for panel --- " + trans)
            return trans
        } else {
            return ""
        }
    }

    private fun azureanalyticsconformer(
            userName: String, // Now required
            message: String, // Now required
            finalIntent: String? = null,
            filePath: String? = null,
            confidenceScore: Float? = null,
            conformer_org: String? = null
    ) {
        val API_URL_ANALYTICS = asrBaseUrl + "api/v1/analytics-azure?username=" + userName
        println("analytics-api-url---- $API_URL_ANALYTICS")

        // Create JSON with only the required field (message)
        val jsonObject =
                JSONObject().apply {
                    put("message", message)

                    // Optional fields - only add if not null
                    finalIntent?.let { put("final_intent", it) }
                    filePath?.let { put("file_path", it) }
                    confidenceScore?.let { put("final_confidence", it) }
                    conformer_org?.let { put("canary_org", it) } // Add this line
                }

        try {
            // Rest of the code remains the same
            val requestBody =
                    RequestBody.create(
                            "application/json; charset=utf-8".toMediaType(),
                            jsonObject.toString()
                    )
            val request =
                    Request.Builder()
                            .url(API_URL_ANALYTICS)
                            .post(requestBody)
                            .addHeader("Content-Type", "application/json")
                            .build()
            val client = OkHttpClient()
            client.newCall(request)
                    .enqueue(
                            object : Callback {
                                override fun onFailure(call: Call, e: IOException) {
                                    trackApiLogs(
                                            API_STATUS.ERROR,
                                            "API ERROR: $API_URL_ANALYTICS",
                                            e.message
                                    )
                                    Log.e(TAG, "Failed to send analytics data: ${e.message}")
                                }

                                override fun onResponse(call: Call, response: Response) {
                                    val responseBody = response.body?.string()
                                    trackApiLogs(
                                            API_STATUS.SUCCESS,
                                            "API SUCCESS: $API_URL_ANALYTICS",
                                            responseBody
                                    )
                                    Log.d(TAG, "Analytics Upload Response: $responseBody")
                                    response.close()
                                }
                            }
                    )
        } catch (e: Exception) {
            trackApiLogs(API_STATUS.ERROR, "API ERROR: $API_URL_ANALYTICS", e.message)
            Log.e(TAG, "API ERROR: azureanalyticsconformer - ${e.message}")
        }
    }

    private fun azureanalyticscanary(
            userName: String, // Now required
            message: String, // Now required
            finalIntent: String? = null,
            filePath: String? = null,
            confidenceScore: Float? = null,
            canary_org: String? = null
    ) {
        val API_URL_ANALYTICS = asrBaseUrl + "api/v1/analytics-azure?username=" + userName
        println("analytics-api-url---- $API_URL_ANALYTICS")

        // Create JSON with only the required field (message)
        val jsonObject =
                JSONObject().apply {
                    put("message", message)

                    // Optional fields - only add if not null
                    finalIntent?.let { put("final_intent", it) }
                    filePath?.let { put("file_path", it) }
                    confidenceScore?.let { put("final_confidence", it) }
                    canary_org?.let { put("canary_org", it) } // Add this line
                }

        // Rest of the code remains the same
        try {
            val requestBody =
                    RequestBody.create(
                            "application/json; charset=utf-8".toMediaType(),
                            jsonObject.toString()
                    )
            val request =
                    Request.Builder()
                            .url(API_URL_ANALYTICS)
                            .post(requestBody)
                            .addHeader("Content-Type", "application/json")
                            .build()
            val client = OkHttpClient()
            client.newCall(request)
                    .enqueue(
                            object : Callback {
                                override fun onFailure(call: Call, e: IOException) {
                                    trackApiLogs(
                                            API_STATUS.ERROR,
                                            "API ERROR: $API_URL_ANALYTICS",
                                            e.message
                                    )
                                    Log.e(TAG, "Failed to send analytics data: ${e.message}")
                                }

                                override fun onResponse(call: Call, response: Response) {
                                    val responseBody = response.body?.string()
                                    trackApiLogs(
                                            API_STATUS.SUCCESS,
                                            "API SUCCESS: $API_URL_ANALYTICS",
                                            responseBody
                                    )
                                    Log.d(TAG, "Analytics Upload Response: $responseBody")
                                    response.close()
                                }
                            }
                    )
        } catch (e: Exception) {
            trackApiLogs(API_STATUS.ERROR, "API ERROR: $API_URL_ANALYTICS", e.message)
            Log.e(TAG, "API ERROR: azureanalyticscanary - ${e.message}")
        }
    }

    private fun ww_sendAudio(wavFile: File, userName: String?) {
        val API_URL_SEND_AUDIO = asrBaseUrl + "api/v1/save-audio?username=ww_" + userName
        println("api-url---- $API_URL_SEND_AUDIO")
        val wavData = wavFile.readBytes()
        try {
            val requestBody = RequestBody.create("application/octet-stream".toMediaType(), wavData)
            val request = Request.Builder().url(API_URL_SEND_AUDIO).post(requestBody).build()
            val client = OkHttpClient()
            client.newCall(request)
                    .enqueue(
                            object : Callback {
                                override fun onFailure(call: Call, e: IOException) {
                                    trackApiLogs(
                                            API_STATUS.ERROR,
                                            "API ERROR: $API_URL_SEND_AUDIO",
                                            e.message
                                    )
                                    Log.e(TAG, "Failed to send audio to Azure: ${e.message}")
                                }

                                override fun onResponse(call: Call, response: Response) {
                                    val responseBody = response.body?.string()
                                    trackApiLogs(
                                            API_STATUS.SUCCESS,
                                            "API SUCCESS: $API_URL_SEND_AUDIO",
                                            responseBody
                                    )
                                    println("Azure submit response for wakeword: $responseBody")
                                    Log.d(TAG, "Azure Upload Response for wakeword: $responseBody")
                                    response.close()
                                }
                            }
                    )
        } catch (e: Exception) {
            trackApiLogs(API_STATUS.ERROR, "API ERROR: $API_URL_SEND_AUDIO", e.message)
            Log.e(TAG, "API ERROR: ww_sendAudio - ${e.message}")
        }
    }

    private suspend fun sendAudioToSaveInBE(
            wavFile: File,
            userName: String?,
            intent: String? = null,
            final_confidence: Float? = null,
            message: String
    ): String? {
        val urlBuilder =
                StringBuilder(asrBaseUrl + "api/v1/save-audio?username=" + (userName ?: ""))
        if (!intent.isNullOrEmpty()) {
            urlBuilder.append("&intent=").append(URLEncoder.encode(intent, "UTF-8"))
        }
        val API_URL_SEND_AUDIO = urlBuilder.toString()

        println("api-url---- $API_URL_SEND_AUDIO")
        val wavData = wavFile.readBytes()
        try {
            val requestBody = RequestBody.create("application/octet-stream".toMediaType(), wavData)
            val request = Request.Builder().url(API_URL_SEND_AUDIO).post(requestBody).build()

            // Using suspendCoroutine to properly wait for the async callback
            return suspendCoroutine { continuation ->
                val client = OkHttpClient()
                client.newCall(request)
                        .enqueue(
                                object : Callback {
                                    override fun onFailure(call: Call, e: IOException) {
                                        trackApiLogs(
                                                API_STATUS.ERROR,
                                                "API ERROR: $API_URL_SEND_AUDIO",
                                                e.message
                                        )
                                        Log.e(TAG, "Failed to send audio to Azure: ${e.message}")
                                        continuation.resume(null)
                                    }

                                    override fun onResponse(call: Call, response: Response) {
                                        try {
                                            val responseBody = response.body?.string()
                                            println("Azure Upload Response $responseBody")
                                            Log.d(TAG, "Azure Upload Response: $responseBody")

                                            var filePath: String? = null
                                            try {
                                                trackApiLogs(
                                                        API_STATUS.SUCCESS,
                                                        "API SUCCESS: $API_URL_SEND_AUDIO",
                                                        responseBody
                                                )
                                                val jsonResponse = JSONObject(responseBody ?: "{}")
                                                filePath = jsonResponse.optString("file_path", null)
                                                Log.d(TAG, "File path from API: $filePath")

                                                azureanalyticsconformer(
                                                        userName = userName ?: "unknown",
                                                        message = message,
                                                        finalIntent = intent,
                                                        filePath = filePath,
                                                        confidenceScore = final_confidence,
                                                        conformer_org = intent,
                                                )
                                            } catch (e: Exception) {
                                                trackApiLogs(
                                                        API_STATUS.ERROR,
                                                        "API ERROR: $API_URL_SEND_AUDIO",
                                                        e.message
                                                )
                                                Log.e(TAG, "Error parsing response: ${e.message}")
                                            }

                                            continuation.resume(filePath)
                                        } finally {
                                            response.close()
                                        }
                                    }
                                }
                        )
            }
        } catch (e: Exception) {
            trackApiLogs(API_STATUS.ERROR, "API ERROR: $API_URL_SEND_AUDIO", e.message)
            Log.e(TAG, "API ERROR: sendAudioToSaveInBE - ${e.message}")
            throw e
        }
    }

    private fun detectIntentViaAPI(
            wavFile: File,
            userName: String?,
            final_intent2: String?,
            trancription: String?,
            conformerconfidence: Float?,
            noiseLevelCategory: String?,
            wakeword: String?,
            v8WWthreshold: Float? = 0.0f,
            v11WWthreshold: Float? = 0.0f,
            intentChunkCopy: ShortArray
    ) {
        if (isProcessingIntent) {
            return
        }
        setProcessingIntent(true)
        val originalWavData = wavFile.readBytes()

        // Trim to first 6 seconds (44 bytes header + 6 seconds of audio data)
        val sixSecondsInBytes = SAMPLE_RATE * 6 * 2 // 16000 * 6 * 2 bytes per sample
        val wavHeaderSize = 44
        val maxSize = wavHeaderSize + sixSecondsInBytes

        val trimmedWavData =
                if (originalWavData.size > maxSize) {
                    originalWavData.copyOfRange(0, maxSize)
                } else {
                    originalWavData
                }

        try {
            val headers =
                    Headers.Builder()
                            .add("Accept", "application/json, text/plain, */*")
                            .add("Accept-Language", "en-US,en;q=0.9")
                            .add("Connection", "keep-alive")
                            .add("Content-Type", "application/octet-stream")
                            .build()

            val requestBody =
                    RequestBody.create("application/octet-stream".toMediaType(), trimmedWavData)
            println("request body is: $requestBody")

            val request = Request.Builder().url(API_URL).headers(headers).post(requestBody).build()

            val client = getUnsafeOkHttpClient()
            client.newCall(request)
                    .enqueue(
                            object : Callback {
                                override fun onFailure(call: Call, e: IOException) {
                                    trackApiLogs(API_STATUS.ERROR, "API ERROR: $API_URL", e.message)
                                    Log.d(TAG, "Failed to send audio data: ${e.message}")
                                    e.printStackTrace()
                                    sendEventToReactNative(
                                            VOICE_CAPABILITIES_EVENT["INTENT_DETECTION"],
                                            "unknown"
                                    )
                                    setWWDetected(false)
                                    setProcessingIntent(false)
                                }

                                override fun onResponse(call: Call, response: Response) {
                                    if (response.isSuccessful) {
                                        val responseBody = response.body?.string()
                                        trackApiLogs(
                                                API_STATUS.SUCCESS,
                                                "API SUCCESS: $API_URL",
                                                responseBody
                                        )
                                        lastResponse = responseBody
                                        println("****** Intent Response: $responseBody")
                                        val intentResponse: TranscriptionResponse? =
                                                gson.fromJson(
                                                        responseBody,
                                                        TranscriptionResponse::class.java
                                                )
                                        println("****** Intent Response2: $intentResponse")
                                        val finalIntent =
                                                intentResponse?.final_intent
                                                        ?: "" // Provide default empty string
                                        val canary_orginal =
                                                intentResponse?.canary_org
                                                        ?: "" // Added default empty string
                                        val finalconfidence =
                                                intentResponse?.final_confidence?.toFloat()
                                                        ?: 0f // Convert Int? to Float?
                                        val finalpath = intentResponse?.file_path ?: ""
                                        val azuretranscription =
                                                intentResponse?.azure_transcription ?: ""

                                        handleIntentResponse(
                                                intentResponse,
                                                responseBody,
                                                intentChunkCopy
                                        )
                                        val message =
                                                when {
                                                    azuretranscription.isNotEmpty() -> {
                                                        if (finalconfidence < 90) {
                                                            "Azure callback - FAIL - Intent recognition"
                                                        } else if (finalIntent.isNotEmpty()) {
                                                            "Azure callback - PASS"
                                                        } else {
                                                            "FAIL - FP WW" // Fallback for empty
                                                            // finalIntent with Azure
                                                            // transcription
                                                        }
                                                    }
                                                    (finalIntent == "unknown" ||
                                                            finalIntent.isEmpty() ||
                                                            canary_orginal.isEmpty()) ->
                                                            "FAIL - FP WW"
                                                    finalconfidence <= 90 ->
                                                            "FAIL - Intent recognition"
                                                    else -> "PASS"
                                                }

                                        val username = userName ?: "unknown_user"
                                        val canary_org =
                                                "$canary_orginal \n conformer_org: $final_intent2 \n Conformer Transcription: $trancription \n conformer confidence: $conformerconfidence \n Noise category: $noiseLevelCategory \n wakeword transcripton: $wakeword \n v8threshold: $v8WWthreshold \n v11threshold: $v11WWthreshold"
                                        azureanalyticscanary(
                                                userName = username,
                                                message = message,
                                                finalIntent = finalIntent,
                                                filePath = finalpath,
                                                confidenceScore = finalconfidence,
                                                canary_org = canary_org
                                        )
                                    } else {
                                        trackApiLogs(
                                                API_STATUS.ERROR,
                                                "API ERROR: $API_URL",
                                                response.body?.string()
                                        )
                                        onIntentDetected(response.message)
                                        setWWDetected(false)
                                    }
                                    // Increment the call count
                                    response.close()
                                    if (!isVoiceNotesInProgress) {
                                        callCount++
                                        if (callCount >= MAX_CALLS && isWWDetected) {
                                            sendLastResponse() // If wake word is set to false, send
                                            // the
                                            // last response
                                            setWWDetected(false)
                                        }
                                    }
                                    setProcessingIntent(false)
                                }
                            }
                    )
        } catch (e: Exception) {
            trackApiLogs(API_STATUS.ERROR, "API ERROR: $API_URL", e.message)
            sendEventToReactNative(VOICE_CAPABILITIES_EVENT["INTENT_DETECTION"], "unknown")
            setWWDetected(false)
            setProcessingIntent(false)
            Log.e(TAG, "API ERROR: detectIntentViaAPI - ${e.message}")
        }
    }

    private fun handleIntentResponse(
            intentResponse: TranscriptionResponse?,
            responseBody: String?,
            intentChunkCopy: ShortArray
    ) {
        Log.d(TAG, "handleIntentResponse: $responseBody")
        if (intentResponse?.final_intent?.lowercase() in nonTerminatingIntents) {
            sendEventToReactNative(VOICE_CAPABILITIES_EVENT["INTENT_DETECTION"], responseBody)
            // Launch coroutine to call the suspend function

            val voiceType: VOICE_NOTE_TYPE? =
                    if (intentResponse?.final_intent?.lowercase() == "on demand alerts") {
                        VOICE_NOTE_TYPE.SMS
                    } else {
                        VOICE_NOTE_TYPE.CASE_NOTE
                    }

            CoroutineScope(Dispatchers.IO).launch {
                processVoiceNoteAudioBufferAndWait(intentChunkCopy, voiceType)
            }
        } else if (intentResponse?.final_intent?.lowercase() in terminatingIntents) {
            sendEventToReactNative(VOICE_CAPABILITIES_EVENT["INTENT_DETECTION"], responseBody)
            setWWDetected(false)
        } else {
            sendEventToReactNative(
                    VOICE_CAPABILITIES_EVENT["INTENT_DETECTION"],
                    JSONObject().apply { put("final_intent", "unknown") }.toString()
            )
            setWWDetected(false)
        }
    }

    private fun getUnsafeOkHttpClient(): OkHttpClient {
        try {
            val trustAllCerts =
                    arrayOf<TrustManager>(
                            object : X509TrustManager {
                                override fun checkClientTrusted(
                                        chain: Array<out X509Certificate>?,
                                        authType: String?
                                ) {}

                                override fun checkServerTrusted(
                                        chain: Array<out X509Certificate>?,
                                        authType: String?
                                ) {}

                                override fun getAcceptedIssuers(): Array<X509Certificate> =
                                        arrayOf()
                            }
                    )

            val sslContext = SSLContext.getInstance("SSL")
            sslContext.init(null, trustAllCerts, java.security.SecureRandom())
            val sslSocketFactory = sslContext.socketFactory

            val builder = OkHttpClient.Builder()
            builder.sslSocketFactory(sslSocketFactory, trustAllCerts[0] as X509TrustManager)
            builder.hostnameVerifier { _, _ -> true }

            return builder.build()
        } catch (e: Exception) {
            throw RuntimeException(e)
        }
    }

    // Function to send the last response if no terminating intent was found
    private fun sendLastResponse() {
        if (lastResponse != null) {
            sendEventToReactNative(
                    VOICE_CAPABILITIES_EVENT["INTENT_DETECTION"],
                    lastResponse
            ) // Send the last successful response
            showToast("Sending last response: $lastResponse")
        }
    }

    fun ShortArray.toByteArray(): ByteArray {
        val byteArray = ByteArray(size * 2) // Each short is 2 bytes
        for (i in indices) {
            val short = this[i]
            byteArray[i * 2] = (short.toInt() and 0xFF).toByte() // Low byte
            byteArray[i * 2 + 1] = ((short.toInt() shr 8) and 0xFF).toByte() // High byte
        }
        return byteArray
    }

    private suspend fun processVoiceNoteAudioBufferAndWait(
            intentChunkCopy: ShortArray,
            voiceType: VOICE_NOTE_TYPE?
    ) {
        isVoiceNotesInProgress = true
        sendEventToReactNative(CASE_NOTE_EVENT["PROCESSING"], true)
        val completion = CompletableDeferred<Unit>()
        val byteArray = intentChunkCopy.toByteArray()

        val sttUrl =
                when (voiceType) {
                    VOICE_NOTE_TYPE.CASE_NOTE -> STT_CASE_NOTE_URL
                    VOICE_NOTE_TYPE.SMS -> STT_SMS_URL
                    else -> STT_CASE_NOTE_URL
                }

        try {

            // Send the WAV file to the API
            Utils.sendAudioForTranscription(
                    byteArray,
                    sttUrl,
                    onSuccess = { transcription, noiseLevel ->
                        Log.d(TAG, "********************* Transcription: $transcription")
                        if (transcription.length > 2) {
                            println("*** transcription--send--to---reactnative $transcription")
                            sendEventToReactNative(CASE_NOTE_EVENT["TRANSCRIPTION"], transcription)
                            Log.d(TAG, "Voice note event has been sent")
                        }
                        noiseLevel?.let {
                            // change default Noise level
                            DEFAULT_NOISE_THRESHOLD = noiseLevel
                            println(
                                    "********* Changing Default noise level to $DEFAULT_NOISE_THRESHOLD"
                            )
                        }
                        completion.complete(Unit)
                    },
                    onError = { error ->
                        Log.e(TAG, "Error during transcription: $error")
                        completion.complete(Unit)
                    },
                    sendAsrLog = { type, message, body -> trackApiLogs(type, message, body) }
            )
        } catch (e: Exception) {
            trackApiLogs(API_STATUS.ERROR, "API ERROR: $sttUrl", e.message)
            Log.e(TAG, "API ERROR: processVoiceNoteAudioBufferAndWait - ${e.message}")
        }

        // Await the result of the transcription
        completion.await()

        finishCaseNoteTranscription()
    }

    private suspend fun finishCaseNoteTranscription(
            eventName: String? = CASE_NOTE_EVENT["COMPLETED"]
    ) {
        isVoiceNotesInProgress = false
        setWWDetected(false)
        synchronized(intentAudioBuffer) { intentAudioBuffer.fill(0) }
        sendEventToReactNative(eventName, true)
    }

    @ReactMethod
    fun switchMicrophone(options: ReadableMap? = null) {
        if (options == null) {
            audioRecorder?.switchMicrophone()
            return
        }

        val preferredDeviceId: Int? =
                if (options.hasKey("preferredDeviceId") && !options.isNull("preferredDeviceId"))
                        options.getDouble("preferredDeviceId").toInt()
                else null

        val preferredDeviceType: Int? =
                if (options.hasKey("preferredDeviceType") && !options.isNull("preferredDeviceType"))
                        options.getDouble("preferredDeviceType").toInt()
                else null

        val preferredDeviceName: String? =
                if (options.hasKey("preferredDeviceName") && !options.isNull("preferredDeviceName"))
                        options.getString("preferredDeviceName")
                else null

        audioRecorder?.switchMicrophone(preferredDeviceId, preferredDeviceType, preferredDeviceName)
    }

    @ReactMethod
    fun stopListening() {
        if (!isRecording) {
            return
        }
        try {
            // Stop audio recording
            audioRecorder?.stop()
            isRecording = false

            audioRecorder?.release()

            wakeWordDetectionJob?.cancel()

            intentAudioBuffer.fill(0)

            wavFile?.delete()

            setWWDetected(false)
        } catch (e: Exception) {
            Log.e(TAG, "Stop record audio error: ${e.message}")
        }
    }

    // Helper function to set intent processing detection
    fun setProcessingIntent(isProcessing: Boolean) {
        isProcessingIntent = isProcessing
        sendEventToReactNative(VOICE_CAPABILITIES_EVENT["PROCESSING_INTENT"], isProcessingIntent)
    }

    fun getSwitchedMicrophoneDevice(
            deviceId: Int?,
            deviceType: Int?,
            deviceName: String?,
            audioSource: Int?
    ) {
        Log.d(
                TAG,
                "getSwitchedMicrophoneDevice ASR_LOG_EVENT: deviceId: $deviceId, deviceType: $deviceType, deviceName: $deviceName, audioSource: $audioSource"
        )

        // Update device properties with null-safe assignments
        connectedMicrophoneDevice.putInt("deviceId", deviceId ?: 0)
        connectedMicrophoneDevice.putInt(
                "deviceType",
                deviceType ?: AudioDeviceInfo.TYPE_BUILTIN_MIC
        )
        connectedMicrophoneDevice.putString("deviceName", deviceName ?: "Samsung Tab")

        // Set audio source with null coalescing
        connectedMicrophoneAudioSource = audioSource ?: MediaRecorder.AudioSource.DEFAULT
    }

    fun onIntentDetected(intent: String?) {
        sendEventToReactNative(VOICE_CAPABILITIES_EVENT["INTENT_DETECTION"], intent)
        val jsonData: WritableMap = Arguments.createMap()
        val connectedDeviceClone = Arguments.createMap()
        // Clone the connectedMicrophoneDevice
        connectedDeviceClone.merge(connectedMicrophoneDevice)
        jsonData.putMap("connectedDevice", connectedDeviceClone)
        jsonData.putInt("audioSource", connectedMicrophoneAudioSource)
        jsonData.putString("action", "Final_intent")
        jsonData.putString("details", intent)
        jsonData.putString("message", "Audit log entry for case update")

        sendEventToReactNative(ASR_LOG_EVENT, jsonData)
    }

    // Helper function to set wake word detection
    @ReactMethod
    fun setWWDetected(isDetected: Boolean, intent: String? = null) {
        val parsedIntent = INITIATED_INTENTS.fromValue(intent)
        initializedIntent = parsedIntent?.value
        isWWDetected = isDetected
        isProcessingTranscription = false
        isDetectingIntent = false
        callCount = 0 // Reset call count when wake word is detected
        sendEventToReactNative(VOICE_CAPABILITIES_EVENT["WW_DETECTED"], isWWDetected)

        if (isWWDetected) {
            val jsonData: WritableMap = Arguments.createMap()
            val connectedDeviceClone = Arguments.createMap()
            // Clone the connectedMicrophoneDevice
            connectedDeviceClone.merge(connectedMicrophoneDevice)
            jsonData.putMap("connectedDevice", connectedDeviceClone)
            jsonData.putInt("audioSource", connectedMicrophoneAudioSource)
            jsonData.putString("message", "Wake work detected")
            sendEventToReactNative(ASR_LOG_EVENT, jsonData)
        }

        if (parsedIntent == null && intent != null) {
            throw IllegalArgumentException("Invalid intent: $intent setting to null")
        }
    }

    @ReactMethod
    fun processCaseNoteClassification(caseNote: String, caseNoteId: Int, userName: String? = "") {
        var userNameVar = if (!userName.isNullOrEmpty()) userName else ""

        val CLASSIFICATION_API_URL =
                CLASSIFICATION_BASE_URL + "?username=${userNameVar}&voice_note_id=${caseNoteId}"

        try {
            val json = JSONObject()
            json.put("query-input", caseNote)
            val requestBody =
                    RequestBody.create(
                            "application/json; charset=utf-8".toMediaType(),
                            json.toString()
                    )

            val request =
                    Request.Builder()
                            .url(CLASSIFICATION_API_URL)
                            .post(requestBody)
                            .addHeader("X-API-Key", CLASSIFICATION_API_KEY)
                            .build()

            val client = OkHttpClient()
            client.newCall(request)
                    .enqueue(
                            object : Callback {
                                override fun onFailure(call: Call, e: IOException) {
                                    trackApiLogs(
                                            API_STATUS.ERROR,
                                            "API ERROR: $CLASSIFICATION_API_URL",
                                            e.message
                                    )
                                    e.printStackTrace()
                                }

                                override fun onResponse(call: Call, response: Response) {

                                    if (response.isSuccessful) {
                                        val responseBody = response.body?.string()

                                        trackApiLogs(
                                                API_STATUS.SUCCESS,
                                                "API SUCCESS: $CLASSIFICATION_API_URL",
                                                responseBody
                                        )

                                        val extractedCategories =
                                                responseBody
                                                        ?.substringAfter("Categories: ", "")
                                                        ?.split(", ")
                                                        ?.map { it.trim() }
                                                        ?: emptyList() // If responseBody is null,
                                        // return an empty list

                                        // Convert List<String> to WritableArray for React Native
                                        val categoriesArray: WritableArray = Arguments.createArray()
                                        extractedCategories.forEach {
                                            categoriesArray.pushString(it)
                                        }

                                        // Convert to WritableMap
                                        val eventParams: WritableMap = Arguments.createMap()
                                        eventParams.putArray("categories", categoriesArray)
                                        eventParams.putInt("caseNoteId", caseNoteId)

                                        // Send event
                                        sendEventToReactNative(
                                                CASE_NOTE_EVENT["CLASSIFICATION"],
                                                eventParams
                                        )
                                    } else {
                                        trackApiLogs(
                                                API_STATUS.ERROR,
                                                "API ERROR: $CLASSIFICATION_API_URL",
                                                response.body?.string()
                                        )
                                        println("Error: ${response.code} - ${response.message}")
                                    }
                                }
                            }
                    )
        } catch (e: Exception) {
            trackApiLogs(API_STATUS.ERROR, "API ERROR: $CLASSIFICATION_API_URL", e.message)
            Log.e(TAG, "API ERROR: processCaseNoteClassification - ${e.message}")
            setWWDetected(false)
        }
    }

    // Function to show toast
    private fun showToast(message: String) {
        Handler(Looper.getMainLooper()).post {
            Toast.makeText(reactContext, message, Toast.LENGTH_LONG).show()
        }
    }

    // Helper function to send events to JavaScript
    private fun sendEventToReactNative(eventName: String?, eventData: Any?) {
        reactContext
                .getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter::class.java)
                .emit(eventName ?: DEFAULT_EVENT, eventData)
    }

    // Helper function to receive events from react native
    @ReactMethod
    fun sendEventToSpeechModule(event: String) {
        CoroutineScope(Dispatchers.Default).launch {
            try {
                when (event) {
                    CASE_NOTE_EVENT["CANCEL"] -> {
                        resetSpeechProcessing()
                        finishCaseNoteTranscription(CASE_NOTE_EVENT["CANCELED"])
                    }
                    CASE_NOTE_EVENT["SAVE"] -> {
                        Log.d(TAG, "********** CASE_NOTE_EVENT_SAVE *******")
                        isProcessingTranscription = false
                    }
                    else -> {
                        Log.d(TAG, "********** sendEventToSpeechModule else statement *******")
                    }
                }
            } catch (e: Exception) {
                Log.e(TAG, "Error in sendEventToSpeechModule: ${e.message}")
            }
        }
    }

    // Required method to handle listener addition in React Native
    @ReactMethod
    fun addListener(eventName: String) {
        numListeners += 1
    }

    // Required method to handle listener removal in React Native
    @ReactMethod
    fun removeListeners(count: Int) {
        numListeners -= count
    }

    @ReactMethod
    fun resetSpeechProcessing() {
        isProcessingTranscription = false
        isDetectingIntent = false
        isProcessingIntent = false
        isVoiceNotesInProgress = false
        CoroutineScope(Dispatchers.Default).launch {
            synchronized(intentAudioBuffer) { intentAudioBuffer.fill(0) }
        }
        // if (isVoiceNotesInProgress) {
        //     isVoiceNotesInProgress = false
        //     CoroutineScope(Dispatchers.Default).launch {
        //         synchronized(intentAudioBuffer) { intentAudioBuffer.fill(0) }
        //     }
        // }
        sendEventToReactNative(CASE_NOTE_EVENT["CANCELED"], true)
    }

    @ReactMethod
    fun setWWThreshold(map: ReadableMap?) {
        if (map == null || !map.hasKey("threshold") || map.isNull("threshold")) {
            customWWThreshold = null
        } else {
            val threshold = map.getDouble("threshold")
            customWWThreshold = threshold.toFloat()
        }
    }

    @ReactMethod
    fun findTimer(candidateItems: ReadableArray, inputString: String, promise: Promise): Unit {
        val candidateItemsList =
                (0 until candidateItems.size()).map { i ->
                    val item = candidateItems.getMap(i)
                    TimerItem(
                            item.getInt("id").toString(),
                            item.getString("description") ?: "",
                            item.getString("type") ?: ""
                    )
                }

        // Step 1: Detect timer type using findBestMatch
        val timerTypes =
                listOf(
                        TimerItem("TIMER", "timer", ""),
                        TimerItem("ALARM", "alarm", ""),
                        TimerItem("STOPWATCH", "stopwatch", "")
                )
        val typeMatch = intentHandler!!.findBestMatch(timerTypes, inputString)
        val detectedType = typeMatch.first // This will be "TIMER", "ALARM", or "STOPWATCH"

        // Step 2: Filter items by detected type
        val filteredItems = candidateItemsList.filter { it.type == detectedType }

        // Step 3: Find best match on filtered items (or fallback to all if filter is empty)
        val findBestMatch =
                if (filteredItems.isNotEmpty()) {
                    intentHandler!!.findBestMatch(filteredItems, inputString)
                } else {
                    intentHandler!!.findBestMatch(candidateItemsList, inputString)
                }

        val id: String = findBestMatch.first
        Log.d(TAG, "SINGLE_TIMER_TEST findTimer result: $id (detected type: $detectedType)")
        promise.resolve(id)
    }

    // fun sendApiLogs(message: String?, body: String?) {
    //     val jsonData: WritableMap = Arguments.createMap()
    //     jsonData.putString("message", message ?: "No message")
    //     jsonData.putString("body", body ?: "No body")
    //     sendEventToReactNative(ASR_LOG_EVENT, jsonData)
    // }

    // fun triggreApiErrorToast(message: String? = "Something went wrong!") {
    //     sendEventToReactNative(TOAST_MESSAGE_EVENT, message)
    // }

    fun trackApiLogs(type: API_STATUS, message: String?, body: String?) {
        val jsonData: WritableMap = Arguments.createMap()
        jsonData.putString("message", message ?: "No message")
        jsonData.putString("body", body ?: "No body")
        sendEventToReactNative(ASR_LOG_EVENT, jsonData)

        if (type == API_STATUS.ERROR) {
            sendEventToReactNative(TOAST_MESSAGE_EVENT, body ?: "Something went wrong!")
        }
    }
}
