package com.orva.rainagency

import java.io.BufferedReader
import java.io.InputStreamReader
import ai.onnxruntime.*
import android.content.Context
import android.util.Log
import java.io.File
import java.io.FileOutputStream
import java.io.IOException
import java.util.EnumSet

public data class TranscriptionResult(
    val text: String,
    val confidence: Float
)

class STTRecognizer(
    private val context: Context,
    modelFileName: String
) {

    private val session: OrtSession
    private val ngramLM: NgramLM
    private val env: OrtEnvironment
    private val TAG = "STTRecognizer"
    private val vocabulary: Array<String>

    init {
        try {
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
            val modelPath = assetFilePath(context, modelFileName)
            session = env.createSession(modelPath!!, sessionOptions)
            ngramLM = NgramLM(context)
            vocabulary = loadVocabulary_Conformer(context)
        } catch (e: Exception) {
            throw RuntimeException("Failed to initialize STT", e)
        }
    }

    fun transcribe(audioSignal: ShortArray): TranscriptionResult {
        try {
            val floatArray = FloatArray(audioSignal.size) { index ->
                audioSignal[index] / 32768.0f // Normalize to range [-1.0, 1.0]
            }
            val inputArray = Array(1) { floatArray }
            val audioSignalTensor: OnnxTensor = OnnxTensor.createTensor(env, inputArray)
            val lengthArray = longArrayOf(audioSignal.size.toLong())
            val lengthTensor: OnnxTensor = OnnxTensor.createTensor(env, lengthArray)
            val timestamp: Long = System.currentTimeMillis()
            val result: OrtSession.Result = session.run(
                mapOf(
                    "audio_signal" to audioSignalTensor,
                    "length" to lengthTensor
                )
            )
            val outputArray = result.get(0).getValue() as Array<Array<FloatArray>>
            var decodedText: String = decodeOutput(outputArray)

            decodedText = decodedText.replace("▁", " ")
            Log.d(TAG, "Decoded Text ++++++++++ 1 ${decodedText}")

            try {
                var lmDecodedText = ngramLM.adjustment(decodedText)

                // Add your PACU replacements
                lmDecodedText =
                    (" " + lmDecodedText + " ")
                        // --- capture note variations ---
                        .replace("caution note", "capture note", ignoreCase = true)
                        .replace("catch a note", "capture note", ignoreCase = true)
                        .replace("action note", "capture note", ignoreCase = true)
                        .replace("caept a note", "capture note", ignoreCase = true)
                        .replace("cefexon note", "capture note", ignoreCase = true)
                        .replace("caption note", "capture note", ignoreCase = true)
                        .replace("suction note", "capture note", ignoreCase = true)
                        .replace("captue note", "capture note", ignoreCase = true)
                        .replace("captur note", "capture note", ignoreCase = true)

                        // --- voice note variations ---
                        .replace("voicenote", "voice note", ignoreCase = true)
                        .replace("vocie note", "voice note", ignoreCase = true)
                        .replace("vioce note", "voice note", ignoreCase = true)
                        .replace("voicenoe", "voice note", ignoreCase = true)
                        .replace("voicenot", "voice note", ignoreCase = true)

                        // --- case note variations ---
                        .replace("caes note", "case note", ignoreCase = true)
                        .replace("case not", "case note", ignoreCase = true)
                        .replace("cas note", "case note", ignoreCase = true)

                        // --- PACU variations ---
                        .replace(" pack you ", " PACU ", ignoreCase = true)
                        .replace(" paku ", " PACU ", ignoreCase = true)
                        .replace(" pacquiao ", " PACU ", ignoreCase = true)
                        .replace(" pack queue ", " PACU ", ignoreCase = true)
                        .replace(" parku ", " PACU ", ignoreCase = true)
                        .replace(" back you ", " PACU ", ignoreCase = true)
                        .replace(" back queue ", " PACU ", ignoreCase = true)

                        // --- create note variations ---
                        .replace("creat note", "create note", ignoreCase = true)
                        .replace("crete note", "create note", ignoreCase = true)

                        // --- medication corrections ---
                        .replace("safazoline", "cefazoline", ignoreCase = true)
                        .replace("safazillin", "cefazoline", ignoreCase = true)

                decodedText = lmDecodedText.replaceFirstChar {
                    if (it.isLowerCase()) it.titlecase() else it.toString()
                }
            } catch (e: IOException) {
                throw java.lang.RuntimeException(e)
            }

            Log.d(TAG, "Decoded Text ++++++++++ 2 ${decodedText}")
            val confidence = calculateConfidenceFromLogits(outputArray)
            return TranscriptionResult(decodedText, confidence)
        } catch (e: OrtException) {
            Log.e(TAG, "Error running ONNX model", e)
            return TranscriptionResult("", 0.0f)
        }
    }

    private fun calculateConfidenceFromLogits(outputArray: Array<Array<FloatArray>>): Float {
        var totalConfidence = 0.0f
        var tokenCount = 0

        // For each token prediction
        for (i in outputArray[0].indices) {
            // Apply softmax to convert logits to probabilities
            val probabilities = softmax(outputArray[0][i])

            // Find the maximum probability for this token
            val maxProb = probabilities.maxOrNull() ?: 0.0f
            totalConfidence += maxProb
            tokenCount++
        }

        return if (tokenCount > 0) totalConfidence / tokenCount else 0.0f
    }

    // Helper function to apply softmax
    private fun softmax(logits: FloatArray): FloatArray {
        val expValues = FloatArray(logits.size)
        var sumExp = 0.0f

        val maxLogit = logits.maxOrNull() ?: 0.0f
        // Calculate exp values with numerical stability
        for (i in logits.indices) {
            expValues[i] = exp(logits[i] - maxLogit)
            sumExp += expValues[i]
        }
        // Normalize to get probabilities
        for (i in expValues.indices) {
            expValues[i] /= sumExp
        }
        return expValues
    }

    private fun exp(x: Float): Float = kotlin.math.exp(x.toDouble()).toFloat()

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

    private fun decodeOutput(outputArray: Array<Array<FloatArray>>): String {
        val timeSteps = outputArray[0].size
        val numClasses = outputArray[0][0].size
        val indexToChar: Array<String> = vocabulary
        val decodedString: java.lang.StringBuilder = java.lang.StringBuilder()
        var prevClassIndex = -1

        for (t in 0 until timeSteps) {
            var maxProb = -Float.MAX_VALUE
            var classIndex = -1
            for (c in 0 until numClasses) {
                if (outputArray[0][t][c] > maxProb) {
                    maxProb = outputArray[0][t][c]
                    classIndex = c
                }
            }
            if (classIndex != prevClassIndex && classIndex != 0) {
                decodedString.append(indexToChar[classIndex])
            }
            prevClassIndex = classIndex
        }
        return decodedString.toString()
    }

    private fun loadVocabulary_Conformer(context: Context): Array<String> {
        val vocabulary = mutableListOf<String>()
        val assetManager = context.assets
        assetManager.open("stt_vocabulary.txt").use { inputStream ->
            BufferedReader(InputStreamReader(inputStream)).use { reader ->
                reader.forEachLine { line ->
                    vocabulary.add(line)
                }
            }
        }
        return vocabulary.toTypedArray()
    }
}