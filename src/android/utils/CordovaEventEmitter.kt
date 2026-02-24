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
    private val viewSpecificCallbacks = mutableMapOf<Int, MutableMap<String, CallbackContext>>()

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
        if (viewSpecificCallbacks[viewId] == null) {
            viewSpecificCallbacks[viewId] = mutableMapOf()
        }
        viewSpecificCallbacks[viewId]?.put(eventName, callbackContext)
    }

    fun unregisterCallback(eventName: String) {
        callbacks.remove(eventName)
    }

    fun unregisterViewSpecificCallback(viewId: Int, eventName: String) {
        viewSpecificCallbacks[viewId]?.remove(eventName)
    }

    fun removeAllCallbacks() {
        callbacks.clear()
        viewSpecificCallbacks.clear()
    }

    override fun hasListenersForEvent(eventName: String): Boolean =
        callbacks.containsKey(eventName)

    override fun hasViewSpecificListenersForEvent(viewId: Int, eventName: String): Boolean =
        viewSpecificCallbacks[viewId]?.containsKey(eventName) == true

    private fun getCallback(
        eventName: String,
        payload: MutableMap<String, Any?>
    ): CallbackContext? {
        return if (payload.containsKey("viewId")) {
            viewSpecificCallbacks[payload["viewId"] as Int]?.get(eventName)
        } else {
            callbacks[eventName]
        }
    }
}
