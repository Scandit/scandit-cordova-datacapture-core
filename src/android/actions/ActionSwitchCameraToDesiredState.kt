/*
 * This file is part of the Scandit Data Capture SDK
 *
 * Copyright (C) 2023- Scandit AG. All rights reserved.
 */

package com.scandit.datacapture.cordova.core.actions

import com.scandit.datacapture.cordova.core.utils.CordovaResult
import com.scandit.datacapture.frameworks.core.CoreModule
import org.apache.cordova.CallbackContext
import org.json.JSONArray

class ActionSwitchCameraToDesiredState(
    private val coreModule: CoreModule
) : Action {
    override fun run(args: JSONArray, callbackContext: CallbackContext) {
        val desiredStateJson = args[0].toString()
        coreModule.switchCameraToDesiredState(desiredStateJson, CordovaResult(callbackContext))
    }
}
