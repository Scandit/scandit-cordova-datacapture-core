/*
 * This file is part of the Scandit Data Capture SDK
 *
 * Copyright (C) 2019- Scandit AG. All rights reserved.
 */

package com.scandit.datacapture.cordova.core.actions

import com.scandit.datacapture.cordova.core.data.ResizeAndMoveInfo
import com.scandit.datacapture.cordova.core.handlers.DataCaptureViewHandler
import org.apache.cordova.CallbackContext
import org.json.JSONArray
import org.json.JSONException

class ActionViewResizeMove(
    private val dataCaptureViewHandler: DataCaptureViewHandler
) : Action {
    override fun run(args: JSONArray, callbackContext: CallbackContext) {
        try {
            val infoJsonObject = args.getJSONObject(0)

            dataCaptureViewHandler.setResizeAndMoveInfo(ResizeAndMoveInfo(infoJsonObject))
            callbackContext.success()
        } catch (e: JSONException) {
            super.onJsonParseError(e, callbackContext)
        }
    }
}
