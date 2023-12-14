/*
 * This file is part of the Scandit Data Capture SDK
 *
 * Copyright (C) 2019- Scandit AG. All rights reserved.
 */

package com.scandit.datacapture.cordova.core.actions

import com.scandit.datacapture.cordova.core.errors.NoLastFrameError
import com.scandit.datacapture.frameworks.core.utils.LastFrameData
import org.apache.cordova.CallbackContext
import org.json.JSONArray

class ActionGetLastFrame : Action {

    override fun run(args: JSONArray, callbackContext: CallbackContext) {
        LastFrameData.getLastFrameDataJson { frameAsJson ->
            if (frameAsJson == null) {
                NoLastFrameError().sendResult(callbackContext)
                return@getLastFrameDataJson
            }

            callbackContext.success(frameAsJson)
        }
    }
}
