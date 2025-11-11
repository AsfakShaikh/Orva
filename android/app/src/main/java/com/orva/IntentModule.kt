package com.orva.rainagency

import ai.onnxruntime.*
import android.content.Context
import android.util.Log
import com.facebook.react.bridge.*
import java.io.*
import java.io.BufferedReader
import java.io.IOException
import java.io.InputStreamReader
import java.nio.LongBuffer
import java.util.concurrent.ConcurrentHashMap
import javax.net.ssl.*
import kotlin.math.min
import kotlin.math.pow
import kotlin.math.sqrt
import kotlinx.coroutines.*
import okhttp3.*
import okhttp3.Callback
import org.json.JSONObject

private const val TAG = "IntentHandler"

data class IntentResult(val confidence: Float, val matchedSynonym: String, val mainIntent: String)

data class TimerItem(val id: String, val label: String, val type: String)

object EmbeddingCache {
    val cache = ConcurrentHashMap<String, FloatArray>()
}

object SynonymManager {
    private const val SYNONYMS_URL = "api/v1/get-synonyms-list"
    private var synonymsCache: String? = null

    fun loadSynonyms(asrBaseUrl: String, onSuccess: (String?) -> Unit, onError: (String) -> Unit) {
        // Return immediately if already cached
        synonymsCache?.let {
            onSuccess(it)
            return
        }

        // Otherwise fetch from the server
        try {
            OkHttpClient()
                    .newCall(Request.Builder().url(asrBaseUrl + SYNONYMS_URL).build())
                    .enqueue(
                            object : Callback {
                                override fun onFailure(call: Call, e: IOException) {
                                    onError("Failed to load synonyms: ${e.message}")
                                }

                                override fun onResponse(call: Call, response: Response) {
                                    if (!response.isSuccessful) {
                                        onError("Request failed with code ${response.code}")
                                        return
                                    }
                                    val csvData = response.body?.string()
                                    synonymsCache = csvData
                                    onSuccess(csvData)
                                }
                            }
                    )
        } catch (e: Exception) {
            onError("Failed to load synonyms: ${e.message}")
            Log.e(TAG, "API ERROR: ${asrBaseUrl + SYNONYMS_URL} - ${e.message}")
        }
    }
}

// Improved WordPiece Tokenizer
data class Encoding(val inputIds: List<Long>, val attentionMask: List<Long>)

class WordPieceTokenizer(private val vocab: Map<String, Int>) {
    companion object {
        private const val UNK_TOKEN = "[UNK]"
        private const val CLS_TOKEN = "[CLS]"
        private const val SEP_TOKEN = "[SEP]"
        private const val PAD_TOKEN = "[PAD]"
        private const val MASK_TOKEN = "[MASK]"
        private const val MAX_WORD_LENGTH = 100
    }

    private val unkId = vocab[UNK_TOKEN] ?: 100
    private val clsId = vocab[CLS_TOKEN] ?: 101
    private val sepId = vocab[SEP_TOKEN] ?: 102
    private val padId = vocab[PAD_TOKEN] ?: 0

    fun encode(text: String, maxLength: Int = 256): Encoding {
        // Normalize and clean text
        val normalizedText = text.lowercase().trim()

        // Basic pre-tokenization (split into words)
        val words = normalizedText.split(Regex("\\s+")).filter { it.isNotBlank() }

        val inputIds = mutableListOf<Long>()

        // Add [CLS] token
        inputIds.add(clsId.toLong())

        // Process each word with WordPiece
        for (word in words) {
            val subTokens = wordPieceTokenize(word)
            inputIds.addAll(subTokens)

            // Stop if we're getting close to max length (leave room for [SEP])
            if (inputIds.size >= maxLength - 1) {
                break
            }
        }

        // Add [SEP] token
        inputIds.add(sepId.toLong())

        // Truncate if necessary
        val truncatedIds =
                if (inputIds.size > maxLength) {
                    inputIds.subList(0, maxLength - 1).toMutableList().apply {
                        add(sepId.toLong()) // Ensure [SEP] at the end
                    }
                } else {
                    inputIds
                }

        // Create attention mask (1 for real tokens, 0 for padding)
        val attentionMask = List(truncatedIds.size) { 1L }

        return Encoding(inputIds = truncatedIds, attentionMask = attentionMask)
    }

    private fun wordPieceTokenize(word: String): List<Long> {
        if (word.length > MAX_WORD_LENGTH) {
            return listOf(unkId.toLong())
        }

        val outputTokens = mutableListOf<Long>()
        var start = 0

        while (start < word.length) {
            var end = word.length
            var currentToken: String? = null

            // Try to find the longest matching subword
            while (start < end) {
                var substr = word.substring(start, end)

                // Add "##" prefix for subwords (not at the beginning)
                if (start > 0) {
                    substr = "##$substr"
                }

                if (vocab.containsKey(substr)) {
                    currentToken = substr
                    break
                }
                end--
            }

            if (currentToken != null) {
                outputTokens.add(vocab[currentToken]!!.toLong())
                start = end
            } else {
                // If no match found, use [UNK]
                outputTokens.add(unkId.toLong())
                break
            }
        }

        return outputTokens
    }
}

class IntentHandler(private val context: Context, private val asrBaseUrl: String) {
    private val synonymToIntent = mutableMapOf<String, String>()
    private val intentsSynonyms = mutableMapOf<String, MutableList<String>>()
    private val candidateWords =
            listOf(
                    "anaesthesia",
                    "wheels",
                    "patient",
                    "procedure",
                    "timeout",
                    "case",
                    "board",
                    "milestone",
                    "status",
                    "start",
                    "end",
                    "confirm",
                    "delete",
                    "ready",
                    "exit",
                    "clean",
                    "submit",
                    "all",
                    "timers",
                    "check",
                    "pause",
                    "resume",
                    "cancel",
                    "dismiss",
                    "skip",
                    "navigate",
                    "set",
                    "caseboard",
                    "summary",
                    "timer",
                    "caselist",
                    "manual entry",
                    "stopwatches",
                    "alarm",
                    "timer",
                    "pacu",
                    "time",
                    "summary",
                    "capture",
                    "asleep",
                    "support",
                    "sign out",
                    "case",
                    "wheeled",
                    "or",
                    "sedated",
                    "stopwatch",
                    "alarms"
            )

    private lateinit var ortSession: OrtSession
    private val ortEnv: OrtEnvironment = OrtEnvironment.getEnvironment()
    private lateinit var tokenizer: WordPieceTokenizer // Changed to WordPieceTokenizer

    // Model-specific parameters for all-MiniLM-L6-v2
    private val MAX_SEQUENCE_LENGTH = 256
    private val EMBEDDING_DIM = 384

    init {
        loadONNXModel()
        loadVocabularyFromJSON("vocab.json")
        fetchSynonyms()
    }

    fun fetchSynonyms() {
        SynonymManager.loadSynonyms(
                asrBaseUrl,
                onSuccess = { csvData ->
                    processSynonyms(csvData ?: "")
                    Log.d(TAG, "Synonyms loaded successfully")
                },
                onError = { errorMsg -> Log.e(TAG, "Error loading synonyms: $errorMsg") }
        )
    }

    private fun loadONNXModel() {
        try {
            val modelPath = assetFilePath(context, "all-MiniLM-L6-v2.onnx")

            val sessionOptions =
                    OrtSession.SessionOptions().apply {
                        setOptimizationLevel(OrtSession.SessionOptions.OptLevel.ALL_OPT)
                    }

            ortSession = ortEnv.createSession(modelPath, sessionOptions)

            // Log model metadata
            val inputNames = ortSession.inputNames
            val outputNames = ortSession.outputNames
            Log.d(TAG, "Model loaded successfully.")
            Log.d(TAG, "Input names: $inputNames")
            Log.d(TAG, "Output names: $outputNames")

            // Verify expected inputs

            // Test the model
            testModelInference()
        } catch (e: OrtException) {
            Log.e(TAG, "Error loading ONNX model: ${e.message}", e)
            throw RuntimeException("Failed to load ONNX model", e)
        }
    }

    private fun testModelInference() {
        try {
            // Create test inputs
            val testInputIds = LongArray(MAX_SEQUENCE_LENGTH) { 0L }
            testInputIds[0] = 101 // [CLS]
            testInputIds[1] = 7592 // "hello"
            testInputIds[2] = 102 // [SEP]

            val testAttentionMask = LongArray(MAX_SEQUENCE_LENGTH) { 0L }
            testAttentionMask[0] = 1
            testAttentionMask[1] = 1
            testAttentionMask[2] = 1

            val testTokenTypeIds = LongArray(MAX_SEQUENCE_LENGTH) { 0L }

            // Create tensors
            val inputTensor =
                    OnnxTensor.createTensor(
                            ortEnv,
                            LongBuffer.wrap(testInputIds),
                            longArrayOf(1L, MAX_SEQUENCE_LENGTH.toLong())
                    )
            val attentionMaskTensor =
                    OnnxTensor.createTensor(
                            ortEnv,
                            LongBuffer.wrap(testAttentionMask),
                            longArrayOf(1L, MAX_SEQUENCE_LENGTH.toLong())
                    )
            val tokenTypeIdsTensor =
                    OnnxTensor.createTensor(
                            ortEnv,
                            LongBuffer.wrap(testTokenTypeIds),
                            longArrayOf(1L, MAX_SEQUENCE_LENGTH.toLong())
                    )

            // Run test inference
            val result =
                    ortSession.run(
                            mapOf(
                                    "input_ids" to inputTensor,
                                    "attention_mask" to attentionMaskTensor,
                                    "token_type_ids" to tokenTypeIdsTensor
                            )
                    )

            // Check output
            val output = result.get("last_hidden_state").orElse(null)
            if (output != null) {
                Log.d(TAG, "Test inference successful! Output shape verified.")
            } else {
                Log.e(TAG, "Test inference failed: no last_hidden_state output")
            }

            // Clean up
            inputTensor.close()
            attentionMaskTensor.close()
            tokenTypeIdsTensor.close()
            result.close()
        } catch (e: Exception) {
            Log.e(TAG, "Test inference failed", e)
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

    private fun loadVocabularyFromJSON(vocabFilePath: String) {
        try {
            val inputStream = context.assets.open(vocabFilePath)
            val reader = BufferedReader(InputStreamReader(inputStream))
            val jsonBuilder = StringBuilder()
            var line: String?
            while (reader.readLine().also { line = it } != null) {
                jsonBuilder.append(line)
            }
            reader.close()
            val vocabJson = JSONObject(jsonBuilder.toString())
            val vocab = mutableMapOf<String, Int>()

            vocabJson.keys().forEach { key -> vocab[key] = vocabJson.getInt(key) }

            tokenizer = WordPieceTokenizer(vocab) // Use WordPieceTokenizer
            Log.d(TAG, "Vocabulary loaded: ${vocab.size} tokens")
        } catch (e: IOException) {
            Log.e(TAG, "Error loading vocabulary from JSON", e)
        }
    }

    private fun processSynonyms(csvData: String) {
        val lines = csvData.trim().split("\n")

        for (line in lines.drop(1)) {
            val parts = line.split(",", limit = 2)
            if (parts.size < 2) continue

            val intent = parts[0].trim().lowercase()
            val synonym = parts[1].trim().lowercase()
            synonymToIntent[synonym] = intent

            if (intentsSynonyms.containsKey(intent)) {
                intentsSynonyms[intent]?.add(synonym)
            } else {
                intentsSynonyms[intent] = mutableListOf(synonym)
            }
        }

        val listValues: List<List<String>> = intentsSynonyms.values.toList()
        val flatSynonymList: List<String> = listValues.flatten()

        generateSynonymEmbeddings(flatSynonymList)
    }

    private fun generateSynonymEmbeddings(flatSynonymList: List<String>) {
        flatSynonymList.forEach { synonym ->
            // ConcurrentHashMap's putIfAbsent is atomic
            if (!EmbeddingCache.cache.containsKey(synonym)) {
                try {
                    val embedding = generateEmbedding(synonym)
                    EmbeddingCache.cache.putIfAbsent(synonym, embedding)
                    Log.d(TAG, "Generated embedding for: $synonym")
                } catch (e: Exception) {
                    Log.e(TAG, "Failed to generate embedding for: $synonym", e)
                }
            }
        }
    }

    private fun generateEmbedding(text: String): FloatArray {
        val encoded = tokenizer.encode(text.lowercase(), MAX_SEQUENCE_LENGTH)
        val inputIds = encoded.inputIds
        val attentionMaskArr = encoded.attentionMask

        // Token type IDs - all 0s for single sentence
        val tokenTypeIds = List(inputIds.size) { 0L }

        // Pad sequences to MAX_SEQUENCE_LENGTH
        val paddedInputIds =
                LongArray(MAX_SEQUENCE_LENGTH) { idx ->
                    if (idx < inputIds.size) inputIds[idx] else 0L
                }
        val paddedAttentionMask =
                LongArray(MAX_SEQUENCE_LENGTH) { idx ->
                    if (idx < attentionMaskArr.size) attentionMaskArr[idx] else 0L
                }
        val paddedTokenTypeIds =
                LongArray(MAX_SEQUENCE_LENGTH) { idx ->
                    if (idx < tokenTypeIds.size) tokenTypeIds[idx] else 0L
                }

        return try {
            // Create input tensors
            val inputTensor =
                    OnnxTensor.createTensor(
                            ortEnv,
                            LongBuffer.wrap(paddedInputIds),
                            longArrayOf(1L, MAX_SEQUENCE_LENGTH.toLong())
                    )
            val attentionMaskTensor =
                    OnnxTensor.createTensor(
                            ortEnv,
                            LongBuffer.wrap(paddedAttentionMask),
                            longArrayOf(1L, MAX_SEQUENCE_LENGTH.toLong())
                    )
            val tokenTypeIdsTensor =
                    OnnxTensor.createTensor(
                            ortEnv,
                            LongBuffer.wrap(paddedTokenTypeIds),
                            longArrayOf(1L, MAX_SEQUENCE_LENGTH.toLong())
                    )

            // Create input map
            val inputs =
                    mapOf(
                            "input_ids" to inputTensor,
                            "attention_mask" to attentionMaskTensor,
                            "token_type_ids" to tokenTypeIdsTensor
                    )

            // Run inference
            val result = ortSession.run(inputs)

            // Extract embedding
            val embedding = extractEmbedding(result, paddedAttentionMask)

            // Clean up
            inputTensor.close()
            attentionMaskTensor.close()
            tokenTypeIdsTensor.close()
            result.close()

            return embedding
        } catch (e: OrtException) {
            Log.e(TAG, "Error generating embedding: ${e.message}", e)
            throw e
        }
    }

    private fun extractEmbedding(
            result: OrtSession.Result,
            paddedAttentionMask: LongArray
    ): FloatArray {
        val outputTensor =
                result.get("last_hidden_state").orElse(null)?.value
                        ?: throw RuntimeException("Could not get last_hidden_state output")

        return when (outputTensor) {
            is Array<*> -> {
                @Suppress("UNCHECKED_CAST")
                val allTokenEmbeddings = (outputTensor as Array<Array<FloatArray>>)[0]

                // Mean pooling over valid tokens
                val embeddingSize = allTokenEmbeddings[0].size
                val sumEmbedding = FloatArray(embeddingSize)
                var validTokens = 0

                for (i in allTokenEmbeddings.indices) {
                    if (i < paddedAttentionMask.size && paddedAttentionMask[i] == 1L) {
                        for (j in 0 until embeddingSize) {
                            sumEmbedding[j] += allTokenEmbeddings[i][j]
                        }
                        validTokens++
                    }
                }

                // Avoid division by zero
                if (validTokens == 0) validTokens = 1

                // Calculate mean
                for (j in sumEmbedding.indices) {
                    sumEmbedding[j] /= validTokens.toFloat()
                }

                // L2 normalize
                normalizeL2(sumEmbedding)
            }
            else -> {
                throw RuntimeException("Unexpected output tensor type: ${outputTensor.javaClass}")
            }
        }
    }

    private fun normalizeL2(embedding: FloatArray): FloatArray {
        var norm = 0.0f
        for (value in embedding) {
            norm += value * value
        }
        norm = sqrt(norm)

        if (norm > 0) {
            for (i in embedding.indices) {
                embedding[i] /= norm
            }
        }
        return embedding
    }

    fun getIntent(decodedText: String): IntentResult {
        var cleanedText = cleanIncomingIntentText(decodedText)
        cleanedText = cleanedText.split("\\s+".toRegex()).take(6).joinToString(" ")
        println("cleaned text: $cleanedText")

        return try {
            val noteKeywords =
                    listOf(
                            "case note",
                            "capture note",
                            "take a note",
                            "take note",
                            "take a case note",
                            "voice note",
                            "enter note",
                            "create note",
                            "caution note",
                            "catch a note",
                            "action note",
                            "caept a note",
                            "caption note",
                            "voicenote",
                            "suction note",
                            "vocie note",
                            "vioce note",
                            "voicenoe",
                            "voicenot",
                            "caes note",
                            "case not",
                            "cas note",
                            "captue note",
                            "captur note",
                            "creat note",
                            "crete note",
                            "captured a note",
                            "capcher note",
                            "voiz note",
                            "captr note",
                            "please note"
                    )

            if (noteKeywords.any { keyword -> cleanedText.contains(keyword) }) {
                Log.d(TAG, "Detected voice note with keyword match")
                return IntentResult(1.0f, "voice note", "voice note")
            }

            val decodedEmbedding = generateEmbedding(cleanedText)

            if (EmbeddingCache.cache.isEmpty()) {
                Log.e(TAG, "EmbeddingCache is empty! Call generateSynonymEmbeddings() first.")
                return IntentResult(-1.0f, "unknown", "unknown")
            }

            // Create a snapshot of the cache to avoid concurrent modification
            val cacheSnapshot = EmbeddingCache.cache.toMap()

            // Compute similarities on the snapshot
            val similarities =
                    cacheSnapshot.mapValues { (_, embedding) ->
                        cosineSimilarity(decodedEmbedding, embedding)
                    }

            val bestMatch = similarities.maxByOrNull { it.value }
            val topMatches = similarities.entries.sortedByDescending { it.value }.take(3)

            Log.d(TAG, "Best match: ${bestMatch?.key} -> ${bestMatch?.value}")
            topMatches.forEachIndexed { index, (synonym, score) ->
                Log.d(TAG, "Rank ${index + 1}: '$synonym' -> $score")
            }

            // Threshold for all-MiniLM-L6-v2
            if (bestMatch == null || bestMatch.value < 0.5f) {
                IntentResult(-1.0f, "unknown", "unknown")
            } else {
                val mainIntent = synonymToIntent[bestMatch.key] ?: "unknown"
                IntentResult(bestMatch.value, bestMatch.key, mainIntent)
            }
        } catch (e: Exception) {
            Log.e(TAG, "Error in getIntent", e)
            IntentResult(-1.0f, "unknown", "unknown")
        }
    }

    private fun cosineSimilarity(vectorA: FloatArray, vectorB: FloatArray): Float {
        var dotProduct = 0.0f
        var normA = 0.0f
        var normB = 0.0f

        for (i in vectorA.indices) {
            dotProduct += vectorA[i] * vectorB[i]
            normA += vectorA[i].pow(2)
            normB += vectorB[i].pow(2)
        }

        val denominator = sqrt(normA) * sqrt(normB)
        return if (denominator > 0) dotProduct / denominator else 0f
    }

    private fun cleanIncomingIntentText(incomingText: String): String {
        var text = incomingText.replace(Regex("[^a-zA-Z0-9\\s]"), "").lowercase()

        val wakeWordPattern =
                "\\b(hang over|or wa|or va|hey orva|hiyorva|he or ma|hey aur wah|aur wah|ey or|hey orpa|orpa|hey va|hey hover|hey aura|he alway|hey cortana|hey erva|hey all|here or wh|hora|he or|he or w|k orva|py or|hey orva|heyo wa|heyorva|head over|hey over|hay over|a va|hey orva|a over|headover|heyover|heova|hayover|hiorwa|hey ava|or what|a over|cortana|heorva|he over|hey arvo|heyarba|hi orva|hi arba|hi arva|hearba|keyorwa|heyora|orva|arba|ora|orwa|hereva|hey arvo|hey arwah|he arvo|hey orvo|hey orma|heorwa|he ora|however|hey audra|hey urban|hey|heor|eva|hey over|hey ver|hand over|pay over|hay over|hey orval|hey more|hey ra|py ora|hey or rock|hey oroch|hereorva|heorva|or w|or a|ava|arwah|orv|theorva|heora|heyova|erva|dorma|yorva|eorva|ova|orba|hey|orvo|arvo|area|alwa|however|key orva|hay ver|overall|oral|eyorva|aorva|eorva|arva|hey ver|ava|hea|horva|orma|riva|var|he|here|eva|her)\\b"
        text = text.replace(Regex(wakeWordPattern, RegexOption.IGNORE_CASE), "")

        text = spellCorrectWordInSentence(text)
        return text
    }

    fun spellCorrectWordInSentence(sentence: String): String {
        val words = sentence.split(" ").toMutableList()
        val correctedWords = mutableListOf<String>()

        var i = 0
        while (i < words.size) {
            val word = words[i]
            val nextWord = if (i + 1 < words.size) words[i + 1] else ""

            // Check if word is already in candidate list
            if (word in candidateWords) {
                correctedWords.add(word)
                i += 1
                continue
            }

            // Individual word correction
            var minDistance = Int.MAX_VALUE
            var correction = word
            for (candidate in candidateWords) {
                if (candidate.length <= 4) continue

                val distance = editDistance(word, candidate)
                val threshold =
                        when {
                            candidate.length >= 10 -> 3
                            candidate.length >= 6 -> 2
                            else -> 1
                        }

                if (distance <= threshold && distance < minDistance) {
                    minDistance = distance
                    correction = candidate
                }
            }

            // Bigram correction
            val mergedWord = word + nextWord
            var minDistanceMerged = Int.MAX_VALUE
            var mergedCorrection = mergedWord
            for (candidate in candidateWords) {
                if (candidate.length <= 4) continue

                val distance = editDistance(mergedWord, candidate)
                val threshold =
                        when {
                            candidate.length >= 10 -> 3
                            candidate.length >= 6 -> 2
                            else -> 1
                        }

                if (distance <= threshold && distance < minDistanceMerged) {
                    minDistanceMerged = distance
                    mergedCorrection = candidate
                }
            }

            if (minDistanceMerged < minDistance) {
                correctedWords.add(mergedCorrection)
                i += 2
            } else {
                correctedWords.add(correction)
                i += 1
            }
        }
        return correctedWords.joinToString(" ")
    }

    fun findBestMatch(candidateItems: List<TimerItem>, inputString: String): Pair<String, Float> {
        if (candidateItems.isEmpty()) {
            return Pair("", 0.0f)
        }

        val cleanedInput = inputString
        val inputEmbedding = generateEmbedding(cleanedInput)
        val similarities =
                candidateItems.map { item ->
                    val cleanedCandidate = cleanIncomingIntentText(item.label)
                    val candidateEmbedding = generateEmbedding(cleanedCandidate)
                    val similarity = cosineSimilarity(inputEmbedding, candidateEmbedding)
                    Triple(item.id, item.label, similarity)
                }
        val bestMatch = similarities.maxByOrNull { it.third }
        return if (bestMatch != null) {
            Pair(bestMatch.first, bestMatch.third) // Return timerId and similarity score
        } else {
            Pair("", 0.0f)
        }
    }

    fun editDistance(s1: String, s2: String): Int {
        val dp = Array(s1.length + 1) { IntArray(s2.length + 1) }
        for (i in 0..s1.length) {
            for (j in 0..s2.length) {
                if (i == 0) {
                    dp[i][j] = j
                } else if (j == 0) {
                    dp[i][j] = i
                } else {
                    dp[i][j] =
                            min(
                                    min(dp[i - 1][j] + 1, dp[i][j - 1] + 1),
                                    dp[i - 1][j - 1] + if (s1[i - 1] != s2[j - 1]) 1 else 0
                            )
                }
            }
        }
        return dp[s1.length][s2.length]
    }
}
