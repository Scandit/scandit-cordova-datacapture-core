/*
 * This file is part of the Scandit Data Capture SDK
 *
 * Copyright (C) 2023- Scandit AG. All rights reserved.
 */

package com.scandit.datacapture.cordova.core.utils

import com.scandit.datacapture.frameworks.core.result.FrameworksResult
import org.apache.cordova.CallbackContext
import org.json.JSONObject

class CordovaResult(
    private val callbackContext: CallbackContext,
    private val emitter: CordovaEventEmitter
) : FrameworksResult {
    override fun error(errorCode: String, errorMessage: String?, errorDetails: Any?) {
        callbackContext.error(
            JSONObject(
                mapOf(
                    KEY_CODE to errorCode,
                    KEY_MESSAGE to errorMessage
                )
            )
        )
    }

    override fun success(result: Any?) {
        if (result == null) {
            callbackContext.success()
            return
        }

        val resultData = if (result is Map<*, *>) {
            JSONObject(result).toString()
        } else {
            result.toString()
        }

        val cordovaPayload = JSONObject()
        cordovaPayload.put("data", resultData)

        callbackContext.success(cordovaPayload)
    }

    override fun successAndKeepCallback(result: Any?) {
        if (result is Map<*, *>) {
            callbackContext.successAndKeepCallback(JSONObject(result))
        } else if (result != null) {
            callbackContext.successAndKeepCallback(result.toString())
        } else {
            callbackContext.successAndKeepCallback()
        }
    }

    override fun registerCallbackForEvents(eventNames: List<String>) {
        eventNames.forEach { eventName ->
            emitter.registerCallback(eventName, callbackContext)
        }
    }

    override fun unregisterCallbackForEvents(eventNames: List<String>) {
        eventNames.forEach { eventName ->
            emitter.unregisterCallback(eventName)
        }
    }

    override fun registerModeSpecificCallback(modeId: Int, eventNames: List<String>) {
        eventNames.forEach { eventName ->
            emitter.registerModeSpecificCallback(modeId, eventName, callbackContext)
        }
    }

    override fun unregisterModeSpecificCallback(modeId: Int, eventNames: List<String>) {
        eventNames.forEach { eventName ->
            emitter.unregisterModeSpecificCallback(modeId, eventName)
        }
    }

    override fun registerViewSpecificCallback(
        viewId: Int,
        eventNames: List<String>
    ) {
        eventNames.forEach { eventName ->
            emitter.registerViewSpecificCallback(viewId, eventName, callbackContext)
        }
    }

    override fun unregisterViewSpecificCallback(
        viewId: Int,
        eventNames: List<String>
    ) {
        eventNames.forEach { eventName ->
            emitter.unregisterViewSpecificCallback(viewId, eventName)
        }
    }

    companion object {
        private const val KEY_CODE = "Code"
        private const val KEY_MESSAGE = "Message"
    }
}
