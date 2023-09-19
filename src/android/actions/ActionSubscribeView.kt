/*
 * This file is part of the Scandit Data Capture SDK
 *
 * Copyright (C) 2019- Scandit AG. All rights reserved.
 */

package com.scandit.datacapture.cordova.core.actions

import com.scandit.datacapture.cordova.core.utils.CordovaEventEmitter
import com.scandit.datacapture.cordova.core.utils.successAndKeepCallback
import com.scandit.datacapture.frameworks.core.CoreModule
import com.scandit.datacapture.frameworks.core.listeners.FrameworksDataCaptureViewListener
import org.apache.cordova.CallbackContext
import org.json.JSONArray

class ActionSubscribeView(
    private val coreModule: CoreModule,
    private val eventEmitter: CordovaEventEmitter
) : Action {

    override fun run(args: JSONArray, callbackContext: CallbackContext) {
        eventEmitter.registerCallback(
            FrameworksDataCaptureViewListener.ON_SIZE_CHANGED_EVENT_NAME,
            callbackContext
        )
        coreModule.registerDataCaptureViewListener()
        callbackContext.successAndKeepCallback()
    }
}
