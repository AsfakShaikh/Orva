package com.orva.rainagency

import android.bluetooth.BluetoothDevice
import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent
import android.content.IntentFilter
import android.hardware.usb.UsbManager
import android.media.AudioDeviceInfo
import android.media.AudioFormat
import android.media.AudioManager
import android.media.AudioRecord
import android.media.MediaRecorder
import android.util.Log
import com.facebook.react.bridge.Arguments
import com.facebook.react.bridge.WritableArray
import com.facebook.react.bridge.WritableMap

class AudioDeviceDetect private constructor(private val context: Context) {

    companion object {
        const val MODULE_NAME = "AudioDeviceDetect"
        const val AUDIO_DEVICE_STATE_CHANGE_EVENT = "AUDIO_DEVICE_STATE_CHANGE_EVENT"
        const val GET_CONNECTED_AUDIO_DEVICE_EVENT = "GET_CONNECTED_AUDIO_DEVICE_EVENT"

        @Volatile private var INSTANCE: AudioDeviceDetect? = null

        fun getInstance(context: Context): AudioDeviceDetect {
            return INSTANCE
                    ?: synchronized(this) {
                        INSTANCE
                                ?: AudioDeviceDetect(context).also {
                                    INSTANCE = it
                                    Log.d(
                                            MODULE_NAME,
                                            "Created new AudioDeviceDetect singleton instance"
                                    )
                                }
                    }
                            .also {
                                Log.d(
                                        MODULE_NAME,
                                        "Returning existing AudioDeviceDetect singleton instance"
                                )
                            }
        }

        fun destroyInstance() {
            Log.d(MODULE_NAME, "Destroying AudioDeviceDetect singleton instance")
            INSTANCE?.unRegisterAudioDeviceReceiver()
            INSTANCE = null
        }
    }

    private val audioManager: AudioManager =
            context.getSystemService(Context.AUDIO_SERVICE) as AudioManager
    private var audioDeviceReceiver: BroadcastReceiver? = null

    // Callback holders for different components
    private var eventCallback: ((String, WritableMap) -> Unit)? = null
    private var connectedDeviceCallback: (() -> Unit)? = null
    private var disconnectedDeviceCallback: (() -> Unit)? = null

    // Methods to set callbacks
    fun setEventCallback(callback: ((String, WritableMap) -> Unit)?) {
        this.eventCallback = callback
    }

    fun setDeviceCallbacks(
            connectedCallback: (() -> Unit)? = null,
            disconnectedCallback: (() -> Unit)? = null
    ) {
        this.connectedDeviceCallback = connectedCallback
        this.disconnectedDeviceCallback = disconnectedCallback
    }

    private fun registerAudioDeviceReceiver() {
        Log.d(MODULE_NAME, "Registering audio device receiver")

        val filter =
                IntentFilter().apply {
                    addAction(AudioManager.ACTION_HEADSET_PLUG) // For wired headset
                    addAction(BluetoothDevice.ACTION_ACL_CONNECTED) // For bluetooth devices
                    addAction(BluetoothDevice.ACTION_ACL_DISCONNECTED) // For bluetooth devices
                    addAction(UsbManager.ACTION_USB_DEVICE_ATTACHED) // For usb devices
                    addAction(UsbManager.ACTION_USB_DEVICE_DETACHED) // For usb devices
                }

        audioDeviceReceiver =
                object : BroadcastReceiver() {
                    override fun onReceive(context: Context?, intent: Intent?) {
                        try {

                            val connectionStatus: WritableMap = Arguments.createMap()
                            connectionStatus.putBoolean("isAudioDeviceConnected", false)

                            val action = intent?.action ?: return

                            when (action) {
                                AudioManager.ACTION_HEADSET_PLUG -> {
                                    val state = intent.getIntExtra("state", -1)
                                    Log.d(MODULE_NAME, "Headset state: $state")
                                    if (state == 1) { // Headset plugged
                                        connectionStatus.putBoolean("isAudioDeviceConnected", true)
                                        connectedDeviceCallback?.invoke()
                                    } else if (state == 0) { // Headset unplugged
                                        connectionStatus.putBoolean("isAudioDeviceConnected", false)
                                        disconnectedDeviceCallback?.invoke()
                                    }
                                }
                                BluetoothDevice.ACTION_ACL_CONNECTED -> {
                                    Log.d(MODULE_NAME, "Bluetooth device connected")
                                    connectionStatus.putBoolean("isAudioDeviceConnected", true)
                                    connectedDeviceCallback?.invoke()
                                }
                                BluetoothDevice.ACTION_ACL_DISCONNECTED -> {
                                    Log.d(MODULE_NAME, "Bluetooth device disconnected")
                                    connectionStatus.putBoolean("isAudioDeviceConnected", false)
                                    disconnectedDeviceCallback?.invoke()
                                }
                                UsbManager.ACTION_USB_DEVICE_ATTACHED -> {
                                    Log.d(MODULE_NAME, "USB device attached")
                                    connectionStatus.putBoolean("isAudioDeviceConnected", true)
                                    connectedDeviceCallback?.invoke()
                                }
                                UsbManager.ACTION_USB_DEVICE_DETACHED -> {
                                    Log.d(MODULE_NAME, "USB device detached")
                                    connectionStatus.putBoolean("isAudioDeviceConnected", false)
                                    disconnectedDeviceCallback?.invoke()
                                }
                            }

                            // Send both device connection status and current device info
                            eventCallback?.invoke(AUDIO_DEVICE_STATE_CHANGE_EVENT, connectionStatus)
                        } catch (e: Exception) {
                            Log.e(
                                    MODULE_NAME,
                                    "Error registering audio device receiver: ${e.message}"
                            )
                            // Handle any exceptions if necessary
                        }
                    }
                }

        context.registerReceiver(audioDeviceReceiver, filter)
        Log.d(MODULE_NAME, "Audio device receiver registered")
    }

    fun unRegisterAudioDeviceReceiver() {
        if (audioDeviceReceiver == null) return

        context.unregisterReceiver(audioDeviceReceiver)
        audioDeviceReceiver = null
    }

    init {
        registerAudioDeviceReceiver()
    }

    fun fetchConnectedAudioDevice(): WritableMap? {
        val devices = audioManager.getDevices(AudioManager.GET_DEVICES_INPUTS)

        // Priority order: Bluetooth SCO > USB > Wired Headset > Built-in Mic
        val devicePriority =
                listOf(
                        AudioDeviceInfo.TYPE_BLUETOOTH_SCO,
                        AudioDeviceInfo.TYPE_BLUETOOTH_A2DP,
                        AudioDeviceInfo.TYPE_USB_DEVICE,
                        AudioDeviceInfo.TYPE_USB_HEADSET,
                        AudioDeviceInfo.TYPE_WIRED_HEADSET,
                        AudioDeviceInfo.TYPE_WIRED_HEADPHONES,
                )

        for (deviceType in devicePriority) {
            val device = devices.find { it.type == deviceType }
            if (device != null && device.isSource) {
                return extractDeviceInfo(device)
            }
        }

        return null
    }

    fun fetchConnectedAudioDevicesList(): WritableArray {
        val result: WritableArray = Arguments.createArray()
        val devices = audioManager.getDevices(AudioManager.GET_DEVICES_INPUTS)

        for (device in devices) {
            // Filter for devices with a microphone
            if (device.type == AudioDeviceInfo.TYPE_WIRED_HEADPHONES ||
                            device.type == AudioDeviceInfo.TYPE_WIRED_HEADSET ||
                            device.type == AudioDeviceInfo.TYPE_USB_HEADSET ||
                            device.type == AudioDeviceInfo.TYPE_USB_DEVICE ||
                            device.type == AudioDeviceInfo.TYPE_BLUETOOTH_A2DP ||
                            device.type == AudioDeviceInfo.TYPE_BLUETOOTH_SCO
            ) {

                // Check if the device has a microphone
                if (device.isSource) {
                    result.pushMap(extractDeviceInfo(device))
                }
            }
        }
        return result
    }

    fun extractDeviceInfo(device: AudioDeviceInfo): WritableMap {
        val deviceMap: WritableMap = Arguments.createMap()
        deviceMap.putInt("id", device.id)
        deviceMap.putInt("type", device.type)
        deviceMap.putString("deviceName", device.productName?.toString() ?: "Unknown Device")
        deviceMap.putString("connectionType", getConnectionType(device.type))
        deviceMap.putBoolean("isMicAccessible", isMicrophoneAccessible(device))
        return deviceMap
    }

    fun isMicrophoneAccessible(device: AudioDeviceInfo): Boolean {
        val sampleRate = 16000 // 16 kHz
        val channelConfig = AudioFormat.CHANNEL_IN_MONO
        val audioFormat = AudioFormat.ENCODING_PCM_16BIT
        val bufferSize = AudioRecord.getMinBufferSize(sampleRate, channelConfig, audioFormat)

        val audioSource =
                when (device.type) {
                    AudioDeviceInfo.TYPE_BLUETOOTH_SCO ->
                            MediaRecorder.AudioSource.VOICE_COMMUNICATION
                    AudioDeviceInfo.TYPE_WIRED_HEADSET -> MediaRecorder.AudioSource.MIC
                    AudioDeviceInfo.TYPE_USB_DEVICE, AudioDeviceInfo.TYPE_USB_HEADSET ->
                            MediaRecorder.AudioSource.UNPROCESSED
                    else -> MediaRecorder.AudioSource.DEFAULT
                }

        var audioRecord: AudioRecord? = null

        return try {
            audioRecord =
                    AudioRecord(audioSource, sampleRate, channelConfig, audioFormat, bufferSize)
            // Check if AudioRecord is properly initialized
            audioRecord.state == AudioRecord.STATE_INITIALIZED
        } catch (e: Exception) {
            false
        } finally {
            audioRecord?.release()
        }
    }

    // Function to return device type
    fun getConnectionType(deviceType: Int): String {
        return when (deviceType) {
            AudioDeviceInfo.TYPE_WIRED_HEADPHONES -> "USB"
            AudioDeviceInfo.TYPE_WIRED_HEADSET -> "USB"
            AudioDeviceInfo.TYPE_BLUETOOTH_A2DP -> "BLUETOOTH"
            AudioDeviceInfo.TYPE_BLUETOOTH_SCO -> "BLUETOOTH"
            AudioDeviceInfo.TYPE_USB_DEVICE -> "USB"
            AudioDeviceInfo.TYPE_USB_HEADSET -> "USB"
            AudioDeviceInfo.TYPE_LINE_ANALOG -> "LINE_ANALOG"
            AudioDeviceInfo.TYPE_LINE_DIGITAL -> "LINE_DIGITAL"
            AudioDeviceInfo.TYPE_HDMI -> "HDMI"
            AudioDeviceInfo.TYPE_HDMI_ARC -> "HDMI_ARC"
            AudioDeviceInfo.TYPE_TV_TUNER -> "TV_TUNER"
            AudioDeviceInfo.TYPE_TELEPHONY -> "TELEPHONY"
            AudioDeviceInfo.TYPE_FM -> "FM"
            AudioDeviceInfo.TYPE_AUX_LINE -> "AUX_LINE"
            AudioDeviceInfo.TYPE_IP -> "IP"
            AudioDeviceInfo.TYPE_BUILTIN_MIC -> "BUILTIN_MIC"
            else -> "UNKNOWN_DEVICE"
        }
    }

    fun isBluetoothHeadsetStillConnected(): Boolean {
        val devices = audioManager.getDevices(AudioManager.GET_DEVICES_INPUTS)
        return devices.any { it.type == AudioDeviceInfo.TYPE_BLUETOOTH_SCO && it.isSource }
    }
}
