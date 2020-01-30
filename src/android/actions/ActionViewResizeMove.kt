/*
 * This file is part of the Scandit Data Capture SDK
 *
 * Copyright (C) 2019- Scandit AG. All rights reserved.
 */

package com.scandit.datacapture.cordova.core.actions

import com.scandit.datacapture.cordova.core.data.ResizeAndMoveInfo
import org.apache.cordova.CallbackContext
import org.json.JSONArray
import org.json.JSONException
import java.lang.Exception

class ActionViewResizeMove(
        private val listener: ResultListener
) : Action {

    override fun run(args: JSONArray, callbackContext: CallbackContext): Boolean {
        try {
            val infoJsonObject = args.getJSONObject(0)
            listener.onViewResizeAndMoveActionExecuted(
                    ResizeAndMoveInfo(infoJsonObject), callbackContext
            )
        } catch (e: JSONException) {
            e.printStackTrace()
            listener.onJsonParseError(e, callbackContext)
        }
        return true
    }

    interface ResultListener {
        fun onViewResizeAndMoveActionExecuted(
                info: ResizeAndMoveInfo, callbackContext: CallbackContext
        )
        fun onJsonParseError(error: Throwable, callbackContext: CallbackContext)
    }
}

