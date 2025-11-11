package com.orva.rainagency

import ai.onnxruntime.*
import android.content.Context
import android.util.Log
import java.io.File
import java.io.FileOutputStream
import java.io.IOException

enum class ModelVersion {
    V8,
    V11a
}

// Tested and verified thresholds
object StrictThresholds {
    val HEY_ORVA =
        mapOf(
            "V8" to mapOf("high" to 0.995f, "medium" to 0.985f, "low" to 0.80f),
            "V11a" to mapOf("high" to 0.99953f, "medium" to 0.992f, "low" to 0.992f)
        )

    val OK_ORVA =
        mapOf(
            "V8" to mapOf("high" to 0.9999f, "medium" to 0.991f, "low" to 0.991f),
            "V11a" to mapOf("high" to 0.9999f, "medium" to 0.995f, "low" to 0.995f)
        )
}

// little relaxed thresholds for Arab health
object NormalThresholds {
    val HEY_ORVA =
        mapOf(
            "V8" to mapOf("high" to 0.995f, "medium" to 0.975f, "low" to 0.87f),
            "V11a" to mapOf("high" to 0.99953f, "medium" to 0.98f, "low" to 0.97f)
        )

    val OK_ORVA =
        mapOf(
            "V8" to mapOf("high" to 0.9999f, "medium" to 0.99f, "low" to 0.98f),
            "V11a" to mapOf("high" to 0.9999f, "medium" to 0.993f, "low" to 0.98f)
        )
}

object DefaultThresholds {
    val HEY_ORVA = NormalThresholds.HEY_ORVA
    val OK_ORVA = NormalThresholds.OK_ORVA
}

public val ACCEPTED_VARIATIONS =
    setOf(
        "hey alba",
        "he or what",
        "hora",
        "he or what",
        "hey on one",
        "hey or",
        "hey orva",
        "hey orma",
        "hey",
        "he or one",
        " he",
        "he or",
        "hey or low",
        "hey all what",
        "hey all on",
        "hey over what",
        "hey or what",
        "on what",
        "hey drdo",
        "or one while",
        "he orva",
        "hang over",
        "or wa",
        "or va",
        "orwa",
        "orva",
        "orma",
        "or ah",
        "hay fever",
        "hay o",
        "here or",
        "hiyorva",
        "he or ma",
        "hey aur wah",
        "ey or",
        "hey orpa",
        "hey va",
        "hey hover",
        "hey aura",
        "he alway",
        "hey cortana",
        "hey erva",
        "hey all",
        "here or wh",
        "hora",
        "he or",
        "he or w",
        "k orva",
        "py or",
        "hey orva",
        "heyo wa",
        "heyorva",
        "head over",
        "hey over",
        "hay over",
        "hold over",
        "a va",
        "hey orva",
        "a over",
        "headover",
        "orba",
        "eyorva",
        "aorva",
        "eorva",
        "eight orva",
        "pay or",
        "hey all over",
        "hi alba",
        "all ova",
        "hi ova",
        "a aura",
        "pay over",
        "aura",
        "may ova",
        "high ova",
        "hi obra",
        "hi era",
        "has trava",
        "in over",
        "ha orvu",
        "i aura",
        "hi oa",
        "hair or",
        "obra",
        "over",
        "ok o",
        "okay o",
        "okies o",
        "okay what",
        "key orva"
    )

class WakeWordRecognizer(
    private val context: Context,
    modelFileName: String,
    private val modelVersion: ModelVersion,
) {

    private val session: OrtSession
    private val env: OrtEnvironment
    private val stft: STFT
    private val requiredClassesV8 =
        listOf(2, 3) // Adjust this according to the model output classes
    private val requiredClassesV11a = listOf(1, 2)
    private val TAG = "WakeWordRecognizer"

    init {

        Log.d(TAG, "AudioDenoiser initialized")

        try {
            stft = STFT(256, 128)
            env = OrtEnvironment.getEnvironment()

            // Initialize session options for GPU/CPU usage
            val sessionOptions = OrtSession.SessionOptions()
            val availableProviders = OrtEnvironment.getAvailableProviders()

            Log.d(TAG, "Available Execution Providers: $availableProviders")

            // Use NNAPI (GPU) if available, otherwise fallback to CPU
            if (availableProviders.contains(OrtProvider.NNAPI)) {
                sessionOptions.addNnapi()
                Log.d(TAG, "Using NNAPI for inference")
            } else {
                Log.d(TAG, "No GPU provider available, using CPU")
            }

            val modelPath = assetFilePath(context, modelFileName)
            session = env.createSession(modelPath!!, sessionOptions)
        } catch (e: OrtException) {
            throw RuntimeException("Failed to load ONNX model", e)
        }
    }

    fun recognizeONNXWakeWord(
        cleanedBuffer: FloatArray,
        noiseLevel: String,
        customThreshold: Float? = null,
    ): Pair<Boolean, Float> {
        return try {
            val startTime = System.nanoTime()

            // assume spectrogram is [timeFrames][freqBins]
            val spectrogram = stft.computeSTFT(cleanedBuffer)

            // ONNX expects FloatArrays
            val inputArray =
                Array(1) { Array(spectrogram.size) { FloatArray(spectrogram[0].size) } }
            for (i in spectrogram.indices) {
                inputArray[0][i] = spectrogram[i]
            }

            // now build your tensor without that stray '+'
            val audioSignalTensor = OnnxTensor.createTensor(env, inputArray)
            val result = session.run(mapOf("input_1" to audioSignalTensor))
            val output = result[0].value as Array<FloatArray>
            Log.d(TAG, "Output of wake word recognizer: ${output.contentDeepToString()}")

            val (predictedClass, probability) =
                getPredictedClass(output, noiseLevel, customThreshold)
            audioSignalTensor.close()

            val inferenceTime = (System.nanoTime() - startTime) / 1_000_000
            Log.d(TAG, "Inference time: $inferenceTime ms")
            Log.d(TAG, "Predicted Class: $predictedClass with probability: $probability")

            val isWakeWord =
                when (modelVersion) {
                    ModelVersion.V8 -> requiredClassesV8.contains(predictedClass)
                    ModelVersion.V11a -> requiredClassesV11a.contains(predictedClass)
                }

            // Return Triple: (isDetected, confidence, cleanedAudio)
            Pair(isWakeWord, probability)
        } catch (e: OrtException) {
            Log.e(TAG, "Error running ONNX model", e)
            Pair(false, 0.0f)
        }
    }

    private fun pcmToFloatArray(pcmData: ByteArray): FloatArray {
        val floatArray = FloatArray(pcmData.size / 2)
        for (i in floatArray.indices) {
            val low = pcmData[2 * i].toInt() and 0xff
            val high = pcmData[2 * i + 1].toInt()
            floatArray[i] = (high shl 8 or low).toFloat() / 32768.0f // Normalize to -1 to 1
        }
        return floatArray
    }

    private fun getPredictedClass(
        output: Array<FloatArray>,
        noiseLevel: String,
        customThreshold: Float? = null
    ): Pair<Int, Float> {
        var maxProb = -1f
        var predictedClass = -1
        for (i in output[0].indices) {
            if (output[0][i] > maxProb) {
                maxProb = output[0][i]
                predictedClass = i
            }
        }
        Log.e(TAG, "Max prob for wake word - ${maxProb} class  - ${predictedClass}")

        // Determine thresholds based on predicted class and noise level
        val thresholds =
            when (modelVersion) {
                ModelVersion.V8 ->
                    when (predictedClass) {
                        2 -> DefaultThresholds.HEY_ORVA[modelVersion.name]
                        3 -> DefaultThresholds.OK_ORVA[modelVersion.name]
                        else -> null
                    }

                ModelVersion.V11a ->
                    when (predictedClass) {
                        1 -> DefaultThresholds.HEY_ORVA[modelVersion.name]
                        2 -> DefaultThresholds.OK_ORVA[modelVersion.name]
                        else -> null
                    }

                else -> null // To handle unexpected model versions
            }

        var effectiveThresholds = thresholds
        if (customThreshold != null && thresholds != null) {
            effectiveThresholds = thresholds.toMutableMap().apply { this["low"] = customThreshold }
        }

        // Use the `noiseLevel` to fetch the specific threshold value
        val threshold = effectiveThresholds?.get(noiseLevel) ?: 0.0f

        Log.d(
            TAG,
            "CUSTOM_THRESHOLD_TEST threshold: $threshold, effectiveThresholds: $effectiveThresholds"
        )

        return if (maxProb > threshold) {
            if (predictedClass >= 1) {
                Log.d(
                    TAG,
                    "********************** Class $predictedClass detected by version:$modelVersion with probability $maxProb exceeding threshold $threshold"
                )
            }
            //            println("maximum probability is : $maxProb")
            Pair(predictedClass, maxProb)
        } else {
            Log.d(
                TAG,
                "********************** Class $predictedClass not detected by version:$modelVersion. Probability $maxProb did not exceed threshold $threshold"
            )
            Pair(0, maxProb)
        }
    }

    @Throws(IOException::class)
    private fun assetFilePath(context: Context, assetName: String): String? {
        val file = File(context.filesDir, assetName)
        if (file.exists() && file.length() > 0) {
            return file.absolutePath
        }

        return try {
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
            file.absolutePath
        } catch (e: IOException) {
            Log.e(TAG, "$assetName: ${e.localizedMessage}")
            null
        }
    }
}
