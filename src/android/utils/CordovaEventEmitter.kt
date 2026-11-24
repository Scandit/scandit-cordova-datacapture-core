/*
 * This file is part of the Scandit Data Capture SDK
 *
 * Copyright (C) 2023- Scandit AG. All rights reserved.
 */

package com.scandit.datacapture.cordova.core.utils

import com.scandit.datacapture.frameworks.core.events.Emitter
import org.apache.cordova.CallbackContext
import org.apache.cordova.PluginResult
import org.json.JSONObject

class CordovaEventEmitter : Emitter {

    private val ownedCallbacks = mutableMapOf<String, CallbackContext>()
    private val ownedSpecificCallbacks = mutableMapOf<Pair<Int, String>, CallbackContext>()

    override fun emit(eventName: String, payload: MutableMap<String, Any?>) {
        val callback = synchronized(lock) { getCallback(eventName, payload) } ?: return
        val cordovaPayload = JSONObject()
        cordovaPayload.put("name", eventName)
        cordovaPayload.put("data", JSONObject(payload).toString())
        callback.successAndKeepCallback(cordovaPayload)
    }

    fun registerCallback(eventName: String, callbackContext: CallbackContext) {
        val displaced = synchronized(lock) {
            val previous = callbacks[eventName]
            callbacks[eventName] = callbackContext
            ownedCallbacks[eventName] = callbackContext
            previous?.takeIf { it !== callbackContext }
        }
        displaced?.let { finishCallback(it) }
    }

    fun registerViewSpecificCallback(
        viewId: Int,
        eventName: String,
        callbackContext: CallbackContext
    ) {
        val displaced = synchronized(lock) {
            val callbacksForView = specificCallbacks.getOrPut(viewId) { mutableMapOf() }
            val previous = callbacksForView[eventName]
            callbacksForView[eventName] = callbackContext
            ownedSpecificCallbacks[viewId to eventName] = callbackContext
            previous?.takeIf { it !== callbackContext }
        }
        displaced?.let { finishCallback(it) }
    }

    fun registerModeSpecificCallback(
        modeId: Int,
        eventName: String,
        callbackContext: CallbackContext
    ) {
        val displaced = synchronized(lock) {
            val callbacksForMode = specificCallbacks.getOrPut(modeId) { mutableMapOf() }
            val previous = callbacksForMode[eventName]
            callbacksForMode[eventName] = callbackContext
            ownedSpecificCallbacks[modeId to eventName] = callbackContext
            previous?.takeIf { it !== callbackContext }
        }
        displaced?.let { finishCallback(it) }
    }

    fun unregisterCallback(eventName: String) {
        val removed = synchronized(lock) {
            val owned = ownedCallbacks.remove(eventName)
            if (owned != null && callbacks[eventName] === owned) callbacks.remove(eventName) else null
        }
        removed?.let { finishCallback(it) }
    }

    fun unregisterViewSpecificCallback(viewId: Int, eventName: String) {
        val removed = synchronized(lock) {
            val owned = ownedSpecificCallbacks.remove(viewId to eventName)
            if (owned != null && specificCallbacks[viewId]?.get(eventName) === owned) {
                specificCallbacks[viewId]?.remove(eventName)
            } else {
                null
            }
        }
        removed?.let { finishCallback(it) }
    }

    fun unregisterModeSpecificCallback(modeId: Int, eventName: String) {
        val removed = synchronized(lock) {
            val owned = ownedSpecificCallbacks.remove(modeId to eventName)
            if (owned != null && specificCallbacks[modeId]?.get(eventName) === owned) {
                specificCallbacks[modeId]?.remove(eventName)
            } else {
                null
            }
        }
        removed?.let { finishCallback(it) }
    }

    fun removeAllCallbacks() {
        val removed = synchronized(lock) {
            val all = mutableListOf<CallbackContext>()
            for ((eventName, owned) in ownedCallbacks) {
                if (callbacks[eventName] === owned) {
                    callbacks.remove(eventName)
                    all.add(owned)
                }
            }
            for ((key, owned) in ownedSpecificCallbacks) {
                val (id, eventName) = key
                if (specificCallbacks[id]?.get(eventName) === owned) {
                    specificCallbacks[id]?.remove(eventName)
                    if (specificCallbacks[id]?.isEmpty() == true) {
                        specificCallbacks.remove(id)
                    }
                    all.add(owned)
                }
            }
            ownedCallbacks.clear()
            ownedSpecificCallbacks.clear()
            all
        }
        removed.forEach { finishCallback(it) }
    }

    private fun finishCallback(callbackContext: CallbackContext) {
        callbackContext.sendPluginResult(
            PluginResult(PluginResult.Status.NO_RESULT).apply { keepCallback = false }
        )
    }

    override fun hasListenersForEvent(eventName: String): Boolean = synchronized(lock) {
        callbacks.containsKey(eventName)
    }

    override fun hasViewSpecificListenersForEvent(viewId: Int, eventName: String): Boolean =
        synchronized(lock) {
            specificCallbacks[viewId]?.containsKey(eventName) == true
        }

    override fun hasModeSpecificListenersForEvent(modeId: Int, eventName: String): Boolean =
        synchronized(lock) {
            specificCallbacks[modeId]?.containsKey(eventName) == true
        }

    private fun getCallback(
        eventName: String,
        payload: MutableMap<String, Any?>
    ): CallbackContext? {
        val targeted = sequenceOf(payload["viewId"], payload["dataCaptureViewId"], payload["modeId"])
            .mapNotNull { idOf(it) }
            .firstNotNullOfOrNull { id -> specificCallbacks[id]?.get(eventName) }
        return targeted ?: callbacks[eventName]
    }

    private fun idOf(value: Any?): Int? = (value as? Number)?.toInt()

    companion object {
        private val lock = Any()
        private val callbacks = mutableMapOf<String, CallbackContext>()
        private val specificCallbacks = mutableMapOf<Int, MutableMap<String, CallbackContext>>()
    }
}
