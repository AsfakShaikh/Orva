package com.orva.rainagency

import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod
import com.facebook.react.modules.core.DeviceEventManagerModule

class AudioDeviceDetectModule(reactContext: ReactApplicationContext) :
        ReactContextBaseJavaModule(reactContext) {

    companion object {
        const val MODULE_NAME = "AudioDeviceDetectModule"
    }

    private var numListeners = 0
    private var audioDeviceDetect: AudioDeviceDetect? = null

    // Helper function to send events to JavaScript
    private fun sendEvent(eventName: String, eventData: Any) {
        reactApplicationContext
                .getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter::class.java)
                .emit(eventName, eventData)
    }

    init {
        audioDeviceDetect = AudioDeviceDetect.getInstance(reactContext)
        audioDeviceDetect?.setEventCallback { eventName, eventData ->
            sendEvent(eventName, eventData)
        }
    }

    override fun getName(): String {
        return MODULE_NAME
    }

    // Clear the event callback when the module is destroyed
    override fun onCatalystInstanceDestroy() {
        audioDeviceDetect?.setEventCallback(null)
        super.onCatalystInstanceDestroy()
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
    fun getConnectedAudioDevice(promise: Promise) {
        try {
            promise.resolve(audioDeviceDetect?.fetchConnectedAudioDevice())
        } catch (e: Exception) {
            promise.reject("AudioDeviceError", "Failed to get audio devices: ${e.message}")
        }
    }

    @ReactMethod
    fun getConnectedAudioDevicesList(promise: Promise) {
        try {
            promise.resolve(audioDeviceDetect?.fetchConnectedAudioDevicesList())
        } catch (e: Exception) {
            promise.reject("AudioDeviceError", "Failed to get audio devices: ${e.message}")
        }
    }

    @ReactMethod
    fun unregisterAudioDeviceDetect() {
        AudioDeviceDetect.destroyInstance()
    }
}
