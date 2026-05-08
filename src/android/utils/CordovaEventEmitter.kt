/*
 * This file is part of the Scandit Data Capture SDK
 *
 * Copyright (C) 2023- Scandit AG. All rights reserved.
 */

package com.scandit.datacapture.cordova.core.utils

import com.scandit.datacapture.frameworks.core.events.Emitter
import org.apache.cordova.CallbackContext
import org.json.JSONObject

class CordovaEventEmitter : Emitter {
    private val callbacks = mutableMapOf<String, CallbackContext>()

    override fun emit(eventName: String, payload: MutableMap<String, Any?>) {
        val callback = callbacks[eventName] ?: return
        val cordovaPayload = mapOf(
            "name" to eventName,
            "argument" to payload
        )
        callback.successAndKeepCallback(JSONObject(cordovaPayload))
    }

    fun registerCallback(eventName: String, callbackContext: CallbackContext) {
        callbacks[eventName] = callbackContext
    }

    @Suppress("unused")
    fun unregisterCallback(eventName: String) {
        callbacks.remove(eventName)
    }

    fun removeAllCallbacks() {
        callbacks.clear()
    }

    override fun hasListenersForEvent(eventName: String): Boolean =
        callbacks.containsKey(eventName)
}
