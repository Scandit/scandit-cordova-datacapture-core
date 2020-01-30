/*
 * This file is part of the Scandit Data Capture SDK
 *
 * Copyright (C) 2019- Scandit AG. All rights reserved.
 */

package com.scandit.datacapture.cordova.core.handlers

import com.scandit.datacapture.cordova.core.factories.ActionFactory
import com.scandit.datacapture.cordova.core.testing.OpenForTesting
import java.util.concurrent.atomic.AtomicBoolean

@OpenForTesting
class CameraPermissionsActionsHandlerHelper(private val actionFactory: ActionFactory) {

    private val cameraPermissionsGranted: AtomicBoolean = AtomicBoolean(false)

    fun canBeRan(actionName: String): Boolean {
        return cameraPermissionsGranted.get() ||
                actionFactory.actionsNotDependentOnCameraPermission.contains(actionName)
    }

    fun onCameraPermissionsGranted() {
        cameraPermissionsGranted.set(true)
    }
}