/*
 * This file is part of the Scandit Data Capture SDK
 *
 * Copyright (C) 2019- Scandit AG. All rights reserved.
 */

package com.scandit.datacapture.cordova.core.actions

import com.scandit.datacapture.cordova.core.utils.CordovaResult
import com.scandit.datacapture.frameworks.core.CoreModule
import org.apache.cordova.CallbackContext
import org.json.JSONArray

class ActionConvertQuadrilateralCoordinates(
    private val coreModule: CoreModule
) : Action {

    override fun run(args: JSONArray, callbackContext: CallbackContext) {
        val quadrilateralJson = args.getString(0)
        coreModule.viewQuadrilateralForFrameQuadrilateral(
            quadrilateralJson, CordovaResult(callbackContext)
        )
    }
}
