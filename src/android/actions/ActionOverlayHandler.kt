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

class ActionOverlayHandler(
    private val actionName: String,
    private val coreModule: CoreModule
) : Action {
    override fun run(args: JSONArray, callbackContext: CallbackContext) {
        when (actionName) {
            ACTION_REMOVE_ALL_OVERLAYS ->
                coreModule.removeAllOverlays(CordovaResult(callbackContext))

            ACTION_ADD_OVERLAY ->
                coreModule.addOverlayToView(args.getString(0), CordovaResult(callbackContext))

            ACTION_REMOVE_OVERLAY -> coreModule.removeOverlayFromView(
                args.getString(0),
                CordovaResult(callbackContext)
            )
        }
        if (actionName == ACTION_REMOVE_ALL_OVERLAYS) {
            coreModule.removeAllOverlays(CordovaResult(callbackContext))
            return
        }
    }

    companion object {
        const val ACTION_ADD_OVERLAY = "addOverlay"
        const val ACTION_REMOVE_OVERLAY = "removeOverlay"
        const val ACTION_REMOVE_ALL_OVERLAYS = "removeAllOverlays"
    }
}
