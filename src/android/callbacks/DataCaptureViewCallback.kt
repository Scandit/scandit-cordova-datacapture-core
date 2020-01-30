/*
 * This file is part of the Scandit Data Capture SDK
 *
 * Copyright (C) 2019- Scandit AG. All rights reserved.
 */

package com.scandit.datacapture.cordova.core.callbacks

import com.scandit.datacapture.cordova.core.data.SerializableViewState
import com.scandit.datacapture.cordova.core.factories.CaptureCoreActionFactory
import com.scandit.datacapture.cordova.core.handlers.ActionsHandler
import com.scandit.datacapture.cordova.core.testing.OpenForTesting
import org.apache.cordova.CallbackContext
import org.json.JSONArray

@OpenForTesting
class DataCaptureViewCallback(
        private val actionsHandler: ActionsHandler,
        callbackContext: CallbackContext
) : Callback(callbackContext) {

    fun onSizeChanged(width: Int, height: Int, screenOrientation: Int) {
        if (disposed.get()) return
        actionsHandler.addAction(
                CaptureCoreActionFactory.SEND_VIEW_SIZE_CHANGED_EVENT,
                JSONArray().apply {
                    put(
                            SerializableViewState(width, height, screenOrientation).toJson()
                    )
                },
                callbackContext
        )
    }
}
