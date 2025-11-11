package com.orva.rainagency

import android.Manifest
import android.content.BroadcastReceiver
import android.content.Context
import android.content.pm.PackageManager
import android.media.AudioDeviceInfo
import android.media.AudioFormat
import android.media.AudioManager
import android.media.AudioRecord
import android.media.MediaRecorder
import android.os.Handler
import android.os.Looper
import android.util.Log
import androidx.core.app.ActivityCompat
import kotlinx.coroutines.*

/**
 * AudioRecorder handles audio recording functionality with support for various audio devices.
 *
 * Features:
 * - Supports multiple audio device types (Bluetooth, USB, Wired headsets)
 * - Automatic audio routing based on device type
 * - Permission handling
 * - Coroutine-based audio processing
 *
 * @param context Application context for accessing system services
 */
class AudioRecorder(
        private val context: Context,
        private val onDeviceSwitched:
                ((
                        deviceId: Int?,
                        deviceType: Int?,
                        deviceName: String?,
                        audioSource: Int) -> Unit)? =
                null
) {
    // MARK: - Constants
    companion object {
        private const val TAG = "AudioRecorder"
        private const val CHANNEL_CONFIG = AudioFormat.CHANNEL_IN_MONO
        private const val AUDIO_FORMAT = AudioFormat.ENCODING_PCM_16BIT
        private const val SAMPLE_RATE = 16000
        private const val BLUETOOTH_SCO_DELAY_MS = 1000L
    }

    // MARK: - Properties
    private var audioRecord: AudioRecord? = null
    private var audioDeviceDetect: AudioDeviceDetect? = null
    private var isRecording = false
    private var audioRecordingJob: Job? = null
    private val audioManager = context.getSystemService(Context.AUDIO_SERVICE) as AudioManager
    private var audioDeviceReceiver: BroadcastReceiver? = null
    private var initialSampleRate = 16000
    private var initialMaxBufferSize = 1600
    private var initialBufferSize: Int = 1600
    private var initialOnBufferAvailable:
            (suspend (buffer: ShortArray, readBytes: Int) -> Boolean)? =
            null
    // Audio source monitoring
    private var audioSourceCheckRunnable: Runnable? = null
    private val AUDIO_SOURCE_CHECK_INTERVAL_MS = 2000L // Check every 2 seconds
    private val handler = Handler(Looper.getMainLooper())

    init {
        audioDeviceDetect = AudioDeviceDetect.getInstance(context)
        audioDeviceDetect?.setDeviceCallbacks(
                connectedCallback = { handleDeviceConnection() },
                disconnectedCallback = { handleDeviceDisconnection() }
        )
    }

    // MARK: - Initialization

    /**
     * Initializes the AudioRecorder with specified parameters.
     *
     * @param sampleRate The sample rate for audio recording (e.g., 16000 for 16kHz)
     * @param bufferSize The buffer size in bytes for audio processing
     * @param deviceId Optional specific device ID to use for recording
     * @param deviceType Optional device type to determine audio source
     * @throws SecurityException if record audio permission is not granted
     * @throws IllegalArgumentException if audio parameters are invalid
     */
    fun init(
            sampleRate: Int,
            maxBufferSize: Int,
            deviceId: Int? = null,
            deviceType: Int? = null,
            deviceName: String? = null
    ) {

        if (!validatePermissions()) {
            throw SecurityException("Audio permissions are not granted")
        }

        if (maxBufferSize == AudioRecord.ERROR || maxBufferSize == AudioRecord.ERROR_BAD_VALUE) {
            throw IllegalArgumentException("Invalid audio parameters")
        }

        // Store original device type for fallback
        initialSampleRate = sampleRate
        initialMaxBufferSize = maxBufferSize

        // this is the device that is connected to the phone before the app is started
        val connectedDevice = audioDeviceDetect?.fetchConnectedAudioDevice()

        createAudioRecorder(
                sampleRate,
                maxBufferSize,
                deviceId ?: connectedDevice?.getInt("id"),
                deviceType ?: connectedDevice?.getInt("type"),
                deviceName ?: connectedDevice?.getString("deviceName")
        )
    }

    // MARK: - Recording Control

    /**
     * Starts audio recording with the specified buffer processing callback.
     *
     * @param bufferSize The size of the audio buffer to process
     * @param onBufferAvailable Callback function that processes audio buffers
     * @throws IllegalStateException if recorder is not initialized or already recording
     */
    fun start(
            bufferSize: Int,
            onBufferAvailable: suspend (buffer: ShortArray, readBytes: Int) -> Boolean
    ) {
        if (audioRecord == null) {
            throw IllegalStateException("AudioRecorder is not initialized")
        }

        if (isRecording) {
            throw IllegalStateException("AudioRecorder is already recording")
        }

        isRecording = true
        try {
            audioRecord?.startRecording()
            initialBufferSize = bufferSize
            initialOnBufferAvailable = onBufferAvailable
            audioRecordingJob =
                    CoroutineScope(Dispatchers.IO).launch {
                        processAudioBuffer(bufferSize, onBufferAvailable)
                    }
            // startAudioSourceMonitoring()
        } catch (e: Exception) {
            Log.e(TAG, "Failed to start recording & audio processing: ${e.message}")
        }
    }

    /**
     * Stops the current recording session.
     *
     * @throws IllegalStateException if not currently recording
     */
    fun stop() {
        if (!isRecording) {
            throw IllegalStateException("AudioRecorder is not recording")
        }
        // stopAudioSourceMonitoring()
        isRecording = false
        audioRecord?.stop()
    }

    /**
     * Clears the audio buffer by reading and discarding any pending audio data.
     *
     * @param bufferSize The size of the buffer to clear
     */
    fun clearBuffer(bufferSize: Int) {
        audioRecord?.stop()
        try {
            audioRecord?.let { recorder ->
                val clearBuffer = ByteArray(bufferSize)
                var bytesRead: Int

                // Read and discard buffer contents until no more data
                do {
                    bytesRead = recorder.read(clearBuffer, 0, clearBuffer.size)
                    Log.d(TAG, "clearBuffer audio record bytesRead: $bytesRead")
                    // Continue reading until no more data or error occurs
                } while (bytesRead > 0)

                Log.d(TAG, "clearBuffer audio record buffer cleared successfully")
            }
        } catch (e: Exception) {
            Log.e(TAG, "clearBuffer audio record Error clearing buffer: ${e.message}")
        } finally {
            audioRecord?.startRecording()
        }
    }

    /**
     * Releases all resources and cleans up the AudioRecorder. Should be called when the recorder is
     * no longer needed.
     */
    fun release() {
        audioRecord?.release()
        audioRecord = null

        cleanupAudioRouting()
        audioRecordingJob?.cancel()
    }

    // MARK: - Device Management

    /**
     * Retrieves information about a connected audio device by its ID.
     *
     * @param deviceId The ID of the device to find
     * @return AudioDeviceInfo if device is found and connected, null otherwise
     */
    fun getConnectedAudioDevice(deviceId: Int?): AudioDeviceInfo? {
        if (deviceId == null) return null

        return audioManager.getDevices(AudioManager.GET_DEVICES_INPUTS).find { device ->
            device.id == deviceId && device.isSource
        }
    }

    /**
     * Determines the appropriate audio source based on device type.
     *
     * @param deviceType The type of audio device
     * @return The MediaRecorder.AudioSource constant appropriate for the device
     */
    fun getAudioSourceForDevice(deviceType: Int? = null): Int {
        return when (deviceType) {
            AudioDeviceInfo.TYPE_BLUETOOTH_SCO, AudioDeviceInfo.TYPE_BLUETOOTH_A2DP ->
                    MediaRecorder.AudioSource.VOICE_COMMUNICATION
            AudioDeviceInfo.TYPE_WIRED_HEADSET, AudioDeviceInfo.TYPE_WIRED_HEADPHONES ->
                    MediaRecorder.AudioSource.MIC
            AudioDeviceInfo.TYPE_USB_HEADSET, AudioDeviceInfo.TYPE_USB_DEVICE ->
                    MediaRecorder.AudioSource.UNPROCESSED
            else -> MediaRecorder.AudioSource.DEFAULT
        }
    }

    // MARK: - Private Helper Methods

    /**
     * Validates that record audio permission is granted.
     *
     * @throws SecurityException if permission is not granted
     */
    private fun validatePermissions(): Boolean {
        val recordAudioPermission =
                ActivityCompat.checkSelfPermission(context, Manifest.permission.RECORD_AUDIO) ==
                        PackageManager.PERMISSION_GRANTED

        val modifyAudioSettingsPermission =
                ActivityCompat.checkSelfPermission(
                        context,
                        Manifest.permission.MODIFY_AUDIO_SETTINGS
                ) == PackageManager.PERMISSION_GRANTED

        return recordAudioPermission && modifyAudioSettingsPermission
    }

    /**
     * Creates and configures the AudioRecord instance.
     *
     * @param sampleRate The sample rate for recording
     * @param bufferSize The buffer size in bytes
     * @param audioSource The audio source to use
     * @param connectedDevice Optional connected device to set as preferred
     */
    private fun createAudioRecorder(
            sampleRate: Int,
            maxBufferSize: Int,
            deviceId: Int? = null,
            deviceType: Int? = null,
            deviceName: String? = null
    ) {
        val connectedDevice = getConnectedAudioDevice(deviceId)
        val connectedDeviceType = deviceType ?: connectedDevice?.type
        val connectedDeviceName =
                deviceName ?: connectedDevice?.productName?.toString() ?: "Unknown Device"

        val audioSource = getAudioSourceForDevice(connectedDeviceType)

        Log.d(
                TAG,
                "Initializing AudioRecorder - audioSource: $audioSource, deviceId: $deviceId, " +
                        "deviceType: $deviceType, connectedDevice: $connectedDeviceName"
        )

        val audioFormat =
                AudioFormat.Builder()
                        .setEncoding(AUDIO_FORMAT)
                        .setSampleRate(sampleRate)
                        .setChannelMask(CHANNEL_CONFIG)
                        .build()

        val audioBuilder =
                AudioRecord.Builder()
                        .setAudioSource(audioSource)
                        .setAudioFormat(audioFormat)
                        .setBufferSizeInBytes(maxBufferSize)

        audioRecord = audioBuilder.build()

        // Configure device-specific settings
        if (connectedDevice != null) {
            forceAudioRouting(connectedDevice.type)
            audioRecord?.setPreferredDevice(connectedDevice)
        }
        onDeviceSwitched?.invoke(deviceId, connectedDeviceType, connectedDeviceName, audioSource)
    }

    /**
     * Processes audio buffers in a continuous loop while recording.
     *
     * @param bufferSize The size of the audio buffer
     * @param onBufferAvailable Callback to process each buffer
     */
    private suspend fun processAudioBuffer(
            bufferSize: Int,
            onBufferAvailable: suspend (buffer: ShortArray, readBytes: Int) -> Boolean
    ) {
        val buffer = ShortArray(bufferSize)

        Log.d(TAG, "processAudioBuffer: $isRecording audioRecord: ${audioRecord?.state}")

        var consecutiveErrors = 0
        val maxConsecutiveErrors = 5
        var bufferCount = 0

        while (isRecording && audioRecord != null) {
            try {
                val bytesRead = audioRecord?.read(buffer, 0, buffer.size) ?: 0

                if (bytesRead > 0) {
                    consecutiveErrors = 0 // Reset error counter on successful read
                    bufferCount++

                    val shouldContinue = onBufferAvailable(buffer, bytesRead)
                    if (!shouldContinue) {
                        continue
                    }
                }
            } catch (e: Exception) {
                consecutiveErrors++
                if (consecutiveErrors >= maxConsecutiveErrors) {
                    Log.e(TAG, "ERROR: Max consecutive errors reached, switching to fallback mode")
                    switchMicrophone()
                    consecutiveErrors = 0
                }
                delay(100) // Brief delay before retry
            }
        }
    }

    /**
     * Forces audio routing based on device type.
     *
     * @param deviceType The type of audio device
     */
    private fun forceAudioRouting(deviceType: Int) {
        try {
            when (deviceType) {
                AudioDeviceInfo.TYPE_BLUETOOTH_SCO -> {
                    audioManager.mode = AudioManager.MODE_IN_COMMUNICATION
                    handler.postDelayed(
                            {
                                audioManager.startBluetoothSco()
                                audioManager.isBluetoothScoOn = true
                            },
                            BLUETOOTH_SCO_DELAY_MS
                    )
                    Log.d(TAG, "Forced audio mode to MODE_IN_COMMUNICATION for Bluetooth SCO")
                }
                AudioDeviceInfo.TYPE_USB_HEADSET, AudioDeviceInfo.TYPE_USB_DEVICE -> {
                    audioManager.mode = AudioManager.MODE_IN_COMMUNICATION
                    Log.d(TAG, "Forced audio mode to MODE_IN_COMMUNICATION for USB device")
                }
                AudioDeviceInfo.TYPE_BLUETOOTH_A2DP,
                AudioDeviceInfo.TYPE_WIRED_HEADSET,
                AudioDeviceInfo.TYPE_WIRED_HEADPHONES -> {
                    audioManager.mode = AudioManager.MODE_NORMAL
                    Log.d(TAG, "Forced audio mode to MODE_NORMAL for wired device")
                }
            }
        } catch (e: Exception) {
            Log.e(TAG, "Error forcing audio routing: ${e.message}")
        }
    }

    /** Cleans up audio routing settings and returns to normal mode. */
    private fun cleanupAudioRouting() {
        try {
            if (audioManager.isBluetoothScoOn) {
                audioManager.stopBluetoothSco()
                audioManager.isBluetoothScoOn = false
                Log.d(TAG, "Stopped Bluetooth SCO")
            }
            audioManager.mode = AudioManager.MODE_NORMAL
        } catch (e: Exception) {
            Log.e(TAG, "Failed to cleanupAudioRouting: ${e.message}")
        }
    }

    /**
     * Switches to a different microphone.
     *
     * @param deviceId The ID of the device to switch to
     * @param deviceType The type of device to switch to if deviceId and deviceType are not
     * provided, it will switch to the default microphone
     */
    fun switchMicrophone(
            deviceId: Int? = null,
            deviceType: Int? = null,
            deviceName: String? = null
    ) {
        try {
            Log.w(
                    TAG,
                    "Switching microphone isRecording: $isRecording, deviceId: $deviceId,deviceType: $deviceType, deviceName: $deviceName"
            )

            // Stop current recording if active
            stop()

            // Clean up current audio setup
            release()

            createAudioRecorder(
                    initialSampleRate,
                    initialMaxBufferSize,
                    deviceId,
                    deviceType,
                    deviceName
            )

            Log.d(TAG, "Successfully switched microphone isRecording: $isRecording")

            // Restart recording if it was active
            initialOnBufferAvailable?.let { start(initialBufferSize, it) }
        } catch (e: Exception) {
            Log.e(TAG, "Error switching microphone: ${e.message}")
            throw e
        }
    }

    private fun handleDeviceDisconnection() {
        Log.d(TAG, "Handling device removal - switching to default microphone")
        switchMicrophone()
    }

    private fun handleDeviceConnection() {
        Log.d(TAG, "Handling device connection")

        // Add 1 second delay before fetching connected device
        CoroutineScope(Dispatchers.Main).launch {
            delay(3000) // 3 second delay
            val connectedDevice = audioDeviceDetect?.fetchConnectedAudioDevice()

            Log.d(TAG, "Connected device: ${connectedDevice?.getInt("id")}")
            if (connectedDevice != null) {
                Log.d(TAG, "Device reconnected, attempting to switch back to original device")
                switchMicrophone(
                        connectedDevice.getInt("id"),
                        connectedDevice.getInt("type"),
                        connectedDevice.getString("deviceName")
                )
            }
        }
    }

    /**
     * Simple continuous check: if audio source is 0 and Bluetooth device is connected, restore it.
     */
    fun startAudioSourceMonitoring() {
        if (audioSourceCheckRunnable != null) {
            Log.d(TAG, "Audio source monitoring is already running")
            return
        }

        Log.d(TAG, "Starting simple audio source monitoring")

        audioSourceCheckRunnable =
                object : Runnable {
                    override fun run() {
                        // Simple check: if Bluetooth device is connected but audio source is 0,
                        // restore it
                        val hasBluetoothDevice =
                                audioDeviceDetect?.isBluetoothHeadsetStillConnected() ?: false

                        val recorderAudioSource = audioRecord?.getAudioSource()
                        val isBluetoothScoOn = audioManager.isBluetoothScoOn

                        Log.d(
                                TAG,
                                "startAudioSourceMonitoring  recorderAudioSource: $recorderAudioSource, hasBluetoothDevice:$hasBluetoothDevice, isBluetoothScoOn: $isBluetoothScoOn"
                        )

                        if (hasBluetoothDevice &&
                                        recorderAudioSource == MediaRecorder.AudioSource.DEFAULT
                        ) {
                            Log.w(
                                    TAG,
                                    "Audio source is 0 but Bluetooth device is connected -restoring"
                            )
                            handleDeviceConnection()
                        }

                        // Schedule next check
                        handler.postDelayed(this, AUDIO_SOURCE_CHECK_INTERVAL_MS)
                    }
                }

        handler.post(audioSourceCheckRunnable!!)
    }

    fun stopAudioSourceMonitoring() {
        audioSourceCheckRunnable?.let { handler.removeCallbacks(it) }
        audioSourceCheckRunnable = null
        Log.d(TAG, "Stopped audio source monitoring")
    }
}
