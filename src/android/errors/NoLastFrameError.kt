/*
 * This file is part of the Scandit Data Capture SDK
 *
 * Copyright (C) 2020- Scandit AG. All rights reserved.
 */

package com.scandit.datacapture.cordova.core.errors

class NoLastFrameError : ActionError(
    ERROR_CODE, "Last frame not available"
) {
    companion object {
        private const val ERROR_CODE = 10050
    }
}
