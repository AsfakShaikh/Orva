package com.orva.rainagency

import android.util.Log
import com.facebook.react.bridge.*
import com.google.gson.Gson
import com.google.gson.JsonObject
import java.io.*
import java.util.concurrent.TimeUnit
import javax.net.ssl.*
import kotlin.math.sqrt
import kotlinx.coroutines.*
import okhttp3.*
import okhttp3.Callback
import okhttp3.MediaType.Companion.toMediaType

// Define AudioData outside of the Utils object
data class AudioData(val pcmData: ShortArray, val username: String?) {
    override fun equals(other: Any?): Boolean {
        if (this === other) return true
        if (javaClass != other?.javaClass) return false

        other as AudioData
        if (!pcmData.contentEquals(other.pcmData)) return false
        if (username != other.username) return false

        return true
    }

    override fun hashCode(): Int {
        var result = pcmData.contentHashCode()
        result = 31 * result + (username?.hashCode() ?: 0)
        return result
    }
}

object Utils {
    private const val SAMPLE_RATE = 16000
    private var asrBaseUrl = BuildConfig.ASR_BASE_URL as String
    const val TAG = "Utils"
    private val gson = Gson()

    // ─── Silence-detection tuning ───────────────────────────
    private const val BASE_SEC = 2.5 // seconds for "baseline" window
    private const val TEST_SEC = 1.5 // seconds for "test" window
    private const val MARGIN_DB = 4.0 // test must be ≥2 dB quieter to be considered silence

    // pre-compute number of samples so we don't recalculate
    private val BASE_SAMPLES = (SAMPLE_RATE * BASE_SEC).toInt()
    private val TEST_SAMPLES = (SAMPLE_RATE * TEST_SEC).toInt()

    private fun calculateChunkDecibels(audioSamples: ShortArray): Double {

        // Fallback for empty chunks
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

    fun calculateRmsDb(samples: ShortArray): Double {
        if (samples.isEmpty()) return -160.0 // Default for silence

        var sum = 0.0
        for (sample in samples) {
            sum += sample.toDouble() * sample.toDouble()
        }

        val rms = Math.sqrt(sum / samples.size)
        return 20.0 * Math.log10((rms + 1.0) / Short.MAX_VALUE) // Add 1.0 to avoid log(0)
    }

    fun isSilenceEnergy(
            buffer: ShortArray,
            sinceWakeSamplesCount: Int,
            biometric: Biometric
    ): Boolean {
        if (buffer.size < BASE_SAMPLES + TEST_SAMPLES) return false

        return try {
            println("-- Silence buffer size" + buffer.size.toString())

            // Check if buffer length corresponds to 30 seconds at 16kHz sample rate
            val thirtySecondsInSamples =
                    30 * 16000 // 30 seconds * 16000 samples/second = 480,000 samples

            val roundedCount = (sinceWakeSamplesCount / 16) * 16

            if (roundedCount < BASE_SAMPLES || roundedCount > buffer.size) {
                Log.w(
                        TAG,
                        "Cannot extract samples: invalid roundedCount ($roundedCount) or buffer too small (${buffer.size})."
                )
                return false
            }

            val start = buffer.size - roundedCount
            val baseIntentBuffer = buffer.copyOfRange(start, buffer.size)

            val baseWin = baseIntentBuffer.copyOfRange(0, BASE_SAMPLES)
            val testWin =
                    baseIntentBuffer.copyOfRange(
                            baseIntentBuffer.size - TEST_SAMPLES,
                            baseIntentBuffer.size
                    )
            val baseEmbedding: FloatArray = biometric.generateEmbedding(baseWin)
            val testEmbedding: FloatArray = biometric.generateEmbedding(testWin)
            val similarity = biometric.calculateSimilarity(baseEmbedding, testEmbedding)
            Log.d(TAG, "***************** Speaker changed: $similarity")
            if (similarity < 0.79) {
                return true
            }

            val baseDb = calculateChunkDecibels(baseWin)
            val testDb = calculateChunkDecibels(testWin)

            Log.d(
                    TAG,
                    "****************** Silence detection: baseDb=$baseDb dB | testDb=$testDb dB | diff=${baseDb - testDb} dB"
            )

            if (testDb < -40) {
                Log.d(TAG, "****************** Silence detected: testDb < -40 dB ($testDb dB)")
                return true
            }

            val isSilence = baseDb - testDb >= MARGIN_DB
            Log.d(TAG, "****************** Silence detected: $isSilence")
            isSilence
            // testDb < (baseDb - MARGIN_DB)
        } catch (e: Exception) {
            Log.e(TAG, "Error in silence detection: ${e.message}", e)
            false
        }
    }

    fun createWavHeader(pcmSize: Long): ByteArray {
        val sampleRate = SAMPLE_RATE.toLong()
        val byteRate = SAMPLE_RATE * 2 // 16-bit mono

        return ByteArray(44).apply {
            this[0] = 'R'.toByte()
            this[1] = 'I'.toByte()
            this[2] = 'F'.toByte()
            this[3] = 'F'.toByte()
            val chunkSize = 36 + pcmSize
            this[4] = (chunkSize and 0xff).toByte()
            this[5] = (chunkSize shr 8 and 0xff).toByte()
            this[6] = (chunkSize shr 16 and 0xff).toByte()
            this[7] = (chunkSize shr 24 and 0xff).toByte()
            this[8] = 'W'.toByte()
            this[9] = 'A'.toByte()
            this[10] = 'V'.toByte()
            this[11] = 'E'.toByte()
            this[12] = 'f'.toByte()
            this[13] = 'm'.toByte()
            this[14] = 't'.toByte()
            this[15] = ' '.toByte()
            this[16] = 16
            this[17] = 0
            this[18] = 0
            this[19] = 0
            this[20] = 1
            this[21] = 0
            this[22] = 1
            this[23] = 0
            this[24] = (sampleRate and 0xff).toByte()
            this[25] = (sampleRate shr 8 and 0xff).toByte()
            this[26] = (sampleRate shr 16 and 0xff).toByte()
            this[27] = (sampleRate shr 24 and 0xff).toByte()
            this[28] = (byteRate and 0xff).toByte()
            this[29] = (byteRate shr 8 and 0xff).toByte()
            this[30] = (byteRate shr 16 and 0xff).toByte()
            this[31] = (byteRate shr 24 and 0xff).toByte()
            this[32] = 2
            this[33] = 0
            this[34] = 16
            this[35] = 0
            this[36] = 'd'.toByte()
            this[37] = 'a'.toByte()
            this[38] = 't'.toByte()
            this[39] = 'a'.toByte()
            this[40] = (pcmSize and 0xff).toByte()
            this[41] = (pcmSize shr 8 and 0xff).toByte()
            this[42] = (pcmSize shr 16 and 0xff).toByte()
            this[43] = (pcmSize shr 24 and 0xff).toByte()
        }
    }

    fun sendAudioForTranscription(
            wavFile: ByteArray,
            sttServerUrl: String,
            onSuccess: (String, Double?) -> Unit,
            onError: (String) -> Unit,
            sendAsrLog: (API_STATUS, String?, String?) -> Unit
    ) {
        try {
            val client =
                    OkHttpClient.Builder()
                            .connectTimeout(10, TimeUnit.SECONDS) // Connection timeout
                            .readTimeout(
                                    60,
                                    TimeUnit.SECONDS
                            ) // Read timeout for receiving response
                            .writeTimeout(60, TimeUnit.SECONDS) // Write timeout for sending request
                            .build()

            val requestBody = RequestBody.create("application/octet-stream".toMediaType(), wavFile)
            val headers =
                    Headers.Builder()
                            .add("Accept", "*/*")
                            .add("Referer", "android")
                            .add("sec-ch-ua-platform", "\"Android\"")
                            .build()

            val request =
                    Request.Builder().url(sttServerUrl).headers(headers).post(requestBody).build()

            client.newCall(request)
                    .enqueue(
                            object : Callback {
                                override fun onFailure(call: Call, e: IOException) {
                                    e.printStackTrace()
                                    sendAsrLog(
                                            API_STATUS.ERROR,
                                            "API ERROR: $sttServerUrl",
                                            e.message
                                    )
                                    onError("Failed to send audio: ${e.message}")
                                }

                                override fun onResponse(call: Call, response: Response) {
                                    response.use {
                                        if (it.isSuccessful) {
                                            val responseBody = it.body?.string()
                                            sendAsrLog(
                                                    API_STATUS.SUCCESS,
                                                    "API SUCCESS: $sttServerUrl",
                                                    responseBody
                                            )
                                            if (responseBody != null) {
                                                try {
                                                    val jsonResponse =
                                                            gson.fromJson(
                                                                    responseBody,
                                                                    JsonObject::class.java
                                                            )
                                                    val transcription =
                                                            jsonResponse["text"].asString
                                                    val noiseLevel =
                                                            jsonResponse["noise_threshold"]
                                                                    ?.asDouble
                                                    onSuccess(transcription, noiseLevel)
                                                } catch (e: Exception) {
                                                    e.printStackTrace()
                                                    onError("Error parsing response: ${e.message}")
                                                }
                                            } else {
                                                sendAsrLog(
                                                        API_STATUS.ERROR,
                                                        "API ERROR: $sttServerUrl",
                                                        responseBody
                                                )
                                                onError("Empty response from server")
                                            }
                                        } else {
                                            sendAsrLog(
                                                    API_STATUS.ERROR,
                                                    "API ERROR: $sttServerUrl",
                                                    it.message
                                            )
                                            onError("Server returned error: ${it.message}")
                                        }
                                    }
                                }
                            }
                    )
        } catch (e: Exception) {
            onError("Failed to send audio: ${e.message}")
            Log.e(TAG, "API ERROR: ${sttServerUrl} - ${e.message}")
            throw e
        }
    }

    suspend fun sendAudio(wavFile: File, userName: String?, Intent: String?) =
            withContext(Dispatchers.IO) {
                val API_URL_SEND_AUDIO =
                        asrBaseUrl + "api/v1/save-audio?username=" + userName + "&intent=" + Intent
                println("api-url---- $API_URL_SEND_AUDIO")
                val wavData = wavFile.readBytes()
                val requestBody =
                        RequestBody.create("application/octet-stream".toMediaType(), wavData)
                try {
                    val request =
                            Request.Builder().url(API_URL_SEND_AUDIO).post(requestBody).build()
                    val client = OkHttpClient()
                    client.newCall(request).execute().use { response ->
                        if (!response.isSuccessful) {
                            Log.e(TAG, "Failed to send audio to Azure: ${response.message}")
                        } else {
                            val responseBody = response.body?.string()
                            println("Azure Upload Response: $responseBody")
                            Log.d(TAG, "Azure Upload Response: $responseBody")
                        }
                    }
                } catch (e: Exception) {
                    Log.e(TAG, "API ERROR: ${API_URL_SEND_AUDIO} - ${e.message}")
                    throw e
                }
            }
}
