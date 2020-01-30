/*
 * This file is part of the Scandit Data Capture SDK
 *
 * Copyright (C) 2019- Scandit AG. All rights reserved.
 */

package com.scandit.datacapture.cordova.core.actions

import com.scandit.datacapture.cordova.core.data.SerializableCallbackAction
import org.apache.cordova.CallbackContext
import org.json.JSONArray
import org.json.JSONException
import org.json.JSONObject

class ActionSendContextStatusUpdate(
        private val listener: ResultListener
) : Action {

    override fun run(args: JSONArray, callbackContext: CallbackContext): Boolean {
        try {
            val message = SerializableCallbackAction(ACTION_NAME, args.getJSONObject(0)).toJson()
            listener.onContextStatusUpdateActionExecuted(message, callbackContext)
        } catch (e: JSONException) {
            listener.onJsonParseError(e, callbackContext)
        }
        return true
    }

    companion object {
        private const val ACTION_NAME = "didChangeStatus"
    }

    interface ResultListener {
        fun onContextStatusUpdateActionExecuted(
                message: JSONObject, callbackContext: CallbackContext
        )
        fun onJsonParseError(error: Throwable, callbackContext: CallbackContext)
    }
}
