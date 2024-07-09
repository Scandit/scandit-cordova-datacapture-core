/*
 * This file is part of the Scandit Data Capture SDK
 *
 * Copyright (C) 2019- Scandit AG. All rights reserved.
 */

package com.scandit.datacapture.cordova.core.actions

import com.scandit.datacapture.cordova.core.utils.CordovaEventEmitter
import com.scandit.datacapture.cordova.core.utils.successAndKeepCallback
import com.scandit.datacapture.frameworks.core.CoreModule
import com.scandit.datacapture.frameworks.core.listeners.FrameworksDataCaptureContextListener
import org.apache.cordova.CallbackContext
import org.json.JSONArray

class ActionSubscribeContext(
    private val coreModule: CoreModule,
    private val eventEmitter: CordovaEventEmitter
) : Action {
    override fun run(args: JSONArray, callbackContext: CallbackContext) {
        eventEmitter.registerCallback(
            FrameworksDataCaptureContextListener.DID_START_OBSERVING_EVENT_NAME,
            callbackContext
        )
        eventEmitter.registerCallback(
            FrameworksDataCaptureContextListener.DID_CHANGE_STATUS_EVENT_NAME,
            callbackContext
        )
        coreModule.registerDataCaptureContextListener()
        callbackContext.successAndKeepCallback()
    }
}
