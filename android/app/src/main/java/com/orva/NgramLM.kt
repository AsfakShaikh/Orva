package com.orva.rainagency

import com.facebook.react.bridge.*
import kotlinx.coroutines.*
import okhttp3.*
import java.io.*
import javax.net.ssl.*

import android.content.Context
import opennlp.tools.tokenize.SimpleTokenizer
import kotlin.math.log

class NgramLM(
    context: Context,
    corpusFileName: String = "medical.corpora",
    private val maxDistance: Int = 3,
    private val beamWidth: Int = 60
) {
    private val corpusTokens: List<String>
    private val corpus: Set<String>
    private val bigram: Map<Pair<String, String>, Int>
    private val trigram: Map<Triple<String, String, String>, Int>

    init {
        val (tokens, corpusSet) = loadCorpus(context, corpusFileName)
        corpusTokens = tokens
        corpus = corpusSet
        bigram = buildBigram(tokens)
        trigram = buildTrigram(tokens)
    }

    private fun loadCorpus(
        context: Context,
        fileName: String
    ): Pair<List<String>, Set<String>> {
        val text =
            context.assets.open(fileName).bufferedReader().use { it.readText().lowercase() }
        val tokenizer = SimpleTokenizer.INSTANCE
        val tokens = tokenizer.tokenize(text).toList()
        return Pair(tokens, tokens.toSet())
    }

    private fun buildBigram(tokens: List<String>): Map<Pair<String, String>, Int> {
        return tokens.windowed(2).map { Pair(it[0], it[1]) }.groupingBy { it }.eachCount()
    }

    private fun buildTrigram(tokens: List<String>): Map<Triple<String, String, String>, Int> {
        return tokens.windowed(3).map { Triple(it[0], it[1], it[2]) }.groupingBy { it }.eachCount()
    }

    fun levenshteinDistance(str1: String, str2: String): Int {
        val len1 = str1.length
        val len2 = str2.length

        val dp = Array(len1 + 1) { IntArray(len2 + 1) }

        // Initialize the matrix
        for (i in 0..len1) dp[i][0] = i
        for (j in 0..len2) dp[0][j] = j

        // Fill the matrix
        for (i in 1..len1) {
            for (j in 1..len2) {
                val cost = if (str1[i - 1] == str2[j - 1]) 0 else 1
                dp[i][j] = minOf(
                    dp[i - 1][j] + 1,    // Deletion
                    dp[i][j - 1] + 1,    // Insertion
                    dp[i - 1][j - 1] + cost // Substitution
                )
            }
        }
        return dp[len1][len2]
    }

    fun correctWord(word: String): List<String> {
        if (word in corpus) return listOf(word)
        val suggestions = corpus.map {
            it to levenshteinDistance(word, it)
        }.filter { it.second <= maxDistance }
        if (suggestions.isEmpty()) return listOf(word)
        val minDistance = suggestions.minOf { it.second }
        val bestMatches =
            suggestions.filter { it.second == minDistance || it.second == minDistance + 1 }
                .map { it.first }
        return bestMatches
    }


    private fun scoreBigram(prevWord: String, word: String): Double {
        val freq = (bigram[Pair(prevWord, word)] ?: 0) + 1
        return log(freq.toDouble(), 10.0)
    }

    private fun scoreTrigram(prevPrevWord: String, prevWord: String, word: String): Double {
        val freq = (trigram[Triple(prevPrevWord, prevWord, word)] ?: 0) + 1
        return log(freq.toDouble(), 10.0)
    }

    private fun scoreSequence(seq: List<String>): Double {
        var totalScore = 0.0
        for (i in seq.indices) {
            if (seq[i] in corpus) totalScore += log(2.0, 10.0)
            if (i >= 1) totalScore += scoreBigram(seq[i - 1], seq[i])
            if (i >= 2) totalScore += scoreTrigram(seq[i - 2], seq[i - 1], seq[i])
        }
        return totalScore
    }

    fun adjustment(phrase: String): String {
        val tokens = SimpleTokenizer.INSTANCE.tokenize(phrase.lowercase()).toList()
        val topCandidates = spellAdjustment(tokens)
        return topCandidates.firstOrNull()?.joinToString(" ") ?: phrase
    }

    private fun spellAdjustment(tokens: List<String>): List<List<String>> {
        val hypotheses = mutableListOf(Triple(emptyList<String>(), 0.0, 0))
        while (hypotheses.any { it.third < tokens.size }) {
            val newHypotheses = mutableListOf<Triple<List<String>, Double, Int>>()
            for ((seq, score, i) in hypotheses) {
                if (i >= tokens.size) {
                    newHypotheses.add(Triple(seq, score, i))
                    continue
                }

                val currentWord = tokens[i]
                val singleCandidates = correctWord(currentWord)
                for (word in singleCandidates) {
                    val newSeq = seq + word
                    val newScore =
                        scoreSequence(newSeq) - levenshteinDistance(currentWord, word)
                    newHypotheses.add(Triple(newSeq, newScore, i + 1))
                }
            }
            hypotheses.clear()
            hypotheses.addAll(newHypotheses.sortedByDescending { it.second }.take(beamWidth))
        }
        return hypotheses.map { it.first }
    }
}

