/*
 * This file is part of the Scandit Data Capture SDK
 *
 * Copyright (C) 2019- Scandit AG. All rights reserved.
 */

package com.scandit.datacapture.cordova.core.actions

import com.scandit.datacapture.cordova.core.utils.CordovaResult
import com.scandit.datacapture.frameworks.core.CoreModule
import com.scandit.datacapture.frameworks.core.utils.MainThread
import org.apache.cordova.CallbackContext
import org.json.JSONArray

class ActionUpdateContextAndView(
    private val coreModule: CoreModule
) : Action {

    override fun run(args: JSONArray, callbackContext: CallbackContext) {
        val jsonString = args.getJSONObject(0).toString()
        MainThread.runOnMainThread {
            coreModule.updateContextFromJson(jsonString, CordovaResult(callbackContext))
        }
    }
}
