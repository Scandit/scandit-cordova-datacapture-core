/*
 * This file is part of the Scandit Data Capture SDK
 *
 * Copyright (C) 2021- Scandit AG. All rights reserved.
 */

package com.scandit.datacapture.cordova.core.actions

import com.scandit.datacapture.cordova.core.utils.CordovaEventEmitter
import com.scandit.datacapture.cordova.core.utils.successAndKeepCallback
import com.scandit.datacapture.frameworks.core.CoreModule
import com.scandit.datacapture.frameworks.core.listeners.FrameworksFrameSourceListener
import org.apache.cordova.CallbackContext
import org.json.JSONArray

class ActionSubscribeFrameSource(
    private val coreModule: CoreModule,
    private val eventEmitter: CordovaEventEmitter
) : Action {
    override fun run(args: JSONArray, callbackContext: CallbackContext) {
        eventEmitter.registerCallback(
            FrameworksFrameSourceListener.TORCH_STATE_CHANGE_EVENT_NAME,
            callbackContext
        )
        eventEmitter.registerCallback(
            FrameworksFrameSourceListener.FRAME_STATE_CHANGE_EVENT_NAME,
            callbackContext
        )
        coreModule.registerFrameSourceListener()
        callbackContext.successAndKeepCallback()
    }
}
