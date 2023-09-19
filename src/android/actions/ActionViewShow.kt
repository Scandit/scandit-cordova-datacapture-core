/*
 * This file is part of the Scandit Data Capture SDK
 *
 * Copyright (C) 2019- Scandit AG. All rights reserved.
 */

package com.scandit.datacapture.cordova.core.actions

import com.scandit.datacapture.cordova.core.handlers.DataCaptureViewHandler
import org.apache.cordova.CallbackContext
import org.json.JSONArray

class ActionViewShow(private val dataCaptureViewHandler: DataCaptureViewHandler) : Action {

    override fun run(args: JSONArray, callbackContext: CallbackContext) {
        dataCaptureViewHandler.setVisible()
        callbackContext.success()
    }
}
