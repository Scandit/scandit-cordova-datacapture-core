/*
 * This file is part of the Scandit Data Capture SDK
 *
 * Copyright (C) 2019- Scandit AG. All rights reserved.
 */

package com.scandit.datacapture.cordova.core.actions

import org.apache.cordova.CallbackContext
import org.json.JSONArray

class ActionSubscribeView(private val listener: ResultListener) : Action {

    override fun run(args: JSONArray, callbackContext: CallbackContext): Boolean {
        listener.onViewSubscribeActionExecuted(callbackContext)
        return true
    }

    interface ResultListener {
        fun onViewSubscribeActionExecuted(callbackContext: CallbackContext)
    }
}
