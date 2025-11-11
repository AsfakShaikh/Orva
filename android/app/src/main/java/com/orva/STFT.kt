package com.orva.rainagency

import org.jtransforms.fft.FloatFFT_1D
import kotlin.math.cos
import kotlin.math.PI
import kotlin.math.sqrt

class STFT(private val frameSize: Int, private val hopSize: Int, private val padEnd: Boolean = false) {

    fun computeSTFT(audioSignal: FloatArray): Array<FloatArray> {
        val fftLength = enclosingPowerOfTwo(frameSize)
        val numFrames = ((audioSignal.size - frameSize) / hopSize + 1).toLong()
        val adjustedNumFrames = if (padEnd && (audioSignal.size % hopSize) != 0) numFrames + 1 else numFrames

        val stftResult = Array(adjustedNumFrames.toInt()) { FloatArray(frameSize) }
        for (i in 0 until adjustedNumFrames) {
            val frame = FloatArray(frameSize)
            val startIdx = (i * hopSize).toInt()  // Ensure Int type for array index
            // Handle padding if the end of the signal is reached
            if (startIdx + frameSize <= audioSignal.size) {
                System.arraycopy(audioSignal, startIdx, frame, 0, frameSize)
            } else {
                System.arraycopy(audioSignal, startIdx, frame, 0, audioSignal.size - startIdx)
                for (j in audioSignal.size - startIdx until frameSize) {
                    frame[j] = 0f
                }
            }
            val windowedFrame = applyHanningWindow(frame)
            stftResult[i.toInt()] = applyFFT(windowedFrame, fftLength)
        }
        return stftResult
    }

    // Function to apply Hanning window
    private fun applyHanningWindow(frame: FloatArray): FloatArray {
        val n = frame.size
        for (i in frame.indices) {
            frame[i] *= (0.5f * (1 - cos(2 * PI * i / (n - 1)))).toFloat()
        }
        return frame
    }

    private fun enclosingPowerOfTwo(value: Int): Int {
        var power = 1
        while (power < value) {
            power *= 2
        }
        return power
    }

    private fun applyFFT(frame: FloatArray, fftLength: Int): FloatArray {
        val fft = FloatFFT_1D(fftLength.toLong())  // Explicit Long type for FFT initialization
        val fftData = FloatArray(fftLength * 2)
        System.arraycopy(frame, 0, fftData, 0, frame.size)
        fft.realForwardFull(fftData)

        val numBins = fftLength / 2 + 1
        val magnitudes = FloatArray(numBins)
        for (i in 0 until numBins) {
            val real = fftData[2 * i]
            val imag = fftData[2 * i + 1]
            magnitudes[i] = sqrt(real * real + imag * imag)
        }
        return magnitudes
    }
}