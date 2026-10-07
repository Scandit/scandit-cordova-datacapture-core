/*
 * This file is part of the Scandit Data Capture SDK
 *
 * Copyright (C) 2023- Scandit AG. All rights reserved.
 */

package com.scandit.datacapture.cordova.core.utils

import com.scandit.datacapture.frameworks.core.result.FrameworksResult
import org.apache.cordova.CallbackContext
import org.json.JSONObject

class CordovaResult(private val callbackContext: CallbackContext) : FrameworksResult {
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

    companion object {
        private const val KEY_CODE = "Code"
        private const val KEY_MESSAGE = "Message"
    }
}

class CordovaResultKeepCallback(private val callbackContext: CallbackContext) : FrameworksResult {
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
        if (result is Map<*, *>) {
            callbackContext.successAndKeepCallback(JSONObject(result))
        } else if (result != null) {
            callbackContext.successAndKeepCallback(result.toString())
        } else {
            callbackContext.successAndKeepCallback()
        }
    }

    companion object {
        private const val KEY_CODE = "Code"
        private const val KEY_MESSAGE = "Message"
    }
}

class CordovaNoopResult : FrameworksResult {
    override fun error(errorCode: String, errorMessage: String?, errorDetails: Any?) {
        // noop
    }

    override fun success(result: Any?) {
        // noop
    }
}
