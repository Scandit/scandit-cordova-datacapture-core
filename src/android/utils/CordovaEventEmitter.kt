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
    private val specificCallbacks = mutableMapOf<Int, MutableMap<String, CallbackContext>>()

    override fun emit(eventName: String, payload: MutableMap<String, Any?>) {
        val callback = getCallback(eventName, payload) ?: return
        val cordovaPayload = JSONObject()
        cordovaPayload.put("name", eventName)
        cordovaPayload.put("data", JSONObject(payload).toString())
        callback.successAndKeepCallback(cordovaPayload)
    }

    fun registerCallback(eventName: String, callbackContext: CallbackContext) {
        callbacks[eventName] = callbackContext
    }

    fun registerViewSpecificCallback(
        viewId: Int,
        eventName: String,
        callbackContext: CallbackContext
    ) {
        if (specificCallbacks[viewId] == null) {
            specificCallbacks[viewId] = mutableMapOf()
        }
        specificCallbacks[viewId]?.put(eventName, callbackContext)
    }

    fun registerModeSpecificCallback(
        mdeId: Int,
        eventName: String,
        callbackContext: CallbackContext
    ) {
        if (specificCallbacks[mdeId] == null) {
            specificCallbacks[mdeId] = mutableMapOf()
        }
        specificCallbacks[mdeId]?.put(eventName, callbackContext)
    }

    fun unregisterCallback(eventName: String) {
        callbacks.remove(eventName)
    }

    fun unregisterViewSpecificCallback(viewId: Int, eventName: String) {
        specificCallbacks[viewId]?.remove(eventName)
    }

    fun unregisterModeSpecificCallback(modeId: Int, eventName: String) {
        specificCallbacks[modeId]?.remove(eventName)
    }

    fun removeAllCallbacks() {
        callbacks.clear()
        specificCallbacks.clear()
    }

    override fun hasListenersForEvent(eventName: String): Boolean =
        callbacks.containsKey(eventName)

    override fun hasViewSpecificListenersForEvent(viewId: Int, eventName: String): Boolean =
        specificCallbacks[viewId]?.containsKey(eventName) == true

    override fun hasModeSpecificListenersForEvent(modeId: Int, eventName: String): Boolean =
        specificCallbacks[modeId]?.containsKey(eventName) == true

    private fun getCallback(
        eventName: String,
        payload: MutableMap<String, Any?>
    ): CallbackContext? {
        return if (payload.containsKey("viewId")) {
            specificCallbacks[payload["viewId"] as Int]?.get(eventName)
        } else if (payload.containsKey("modeId")) {
            specificCallbacks[payload["modeId"] as Int]?.get(eventName)
        } else {
            callbacks[eventName]
        }
    }
}
