/*
 * This file is part of the Scandit Data Capture SDK
 *
 * Copyright (C) 2019- Scandit AG. All rights reserved.
 */

package com.scandit.datacapture.cordova.core.actions

import com.scandit.datacapture.cordova.core.errors.JsonParseError
import org.apache.cordova.CallbackContext
import org.json.JSONArray

interface Action {
    fun run(args: JSONArray, callbackContext: CallbackContext)

    fun onJsonParseError(error: Throwable, callbackContext: CallbackContext) {
        JsonParseError(error.message).sendResult(callbackContext)
    }
}

interface ActionJsonParseErrorResultListener {
    fun onJsonParseError(error: Throwable, callbackContext: CallbackContext)
}

interface AdditionalActionRequiredResultListener {
    fun onAdditionalActionRequired(
        actionName: String,
        args: JSONArray,
        callbackContext: CallbackContext
    )
}
