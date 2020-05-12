/*
 * This file is part of the Scandit Data Capture SDK
 *
 * Copyright (C) 2019- Scandit AG. All rights reserved.
 */

package com.scandit.datacapture.cordova.core.callbacks

import com.scandit.datacapture.cordova.core.factories.CaptureCoreActionFactory
import com.scandit.datacapture.cordova.core.handlers.ActionsHandler
import com.scandit.datacapture.cordova.core.testing.OpenForTesting
import com.scandit.datacapture.core.capture.DataCaptureContext
import com.scandit.datacapture.core.common.ContextStatus
import org.apache.cordova.CallbackContext
import org.json.JSONArray
import org.json.JSONObject

@OpenForTesting
class DataCaptureContextCallback(
    private val actionsHandler: ActionsHandler,
    callbackContext: CallbackContext
) : Callback(callbackContext) {

    fun onStatusChanged(contextStatus: ContextStatus) {
        onStatusChanged(contextStatus.code, contextStatus.message, contextStatus.isValid)
    }

    fun onStatusChanged(code: Int, message: String, isValid: Boolean) {
        if (disposed.get()) return
        actionsHandler.addAction(
            CaptureCoreActionFactory.SEND_CONTEXT_STATUS_UPDATE_EVENT,
            JSONArray().apply {
                put(serializeContextStatus(code, message, isValid))
            },
            callbackContext
        )
    }

    private fun serializeContextStatus(code: Int, message: String, isValid: Boolean): JSONObject =
        JSONObject(
            mapOf(
                FIELD_CODE to code,
                FIELD_MESSAGE to message,
                FIELD_IS_VALID to isValid
            )
        )

    fun onObservationStarted(dataCaptureContext: DataCaptureContext) {
        if (disposed.get()) return
        actionsHandler.addAction(
            CaptureCoreActionFactory.SEND_CONTEXT_OBSERVATION_STARTED_EVENT,
            JSONArray().apply {
                put(JSONObject(mapOf(FIELD_DEVICE_ID to dataCaptureContext.deviceId)))
            },
            callbackContext
        )
    }

    private companion object {
        const val FIELD_CODE = "code"
        const val FIELD_MESSAGE = "message"
        const val FIELD_IS_VALID = "isValid"
        const val FIELD_DEVICE_ID = "deviceID"
    }
}
