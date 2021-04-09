/*
 * This file is part of the Scandit Data Capture SDK
 *
 * Copyright (C) 2019- Scandit AG. All rights reserved.
 */

package com.scandit.datacapture.cordova.core.data.defaults

import com.scandit.datacapture.cordova.core.data.SerializableData
import com.scandit.datacapture.cordova.core.testing.OpenForTesting
import org.json.JSONObject

@OpenForTesting
data class SerializableDataCaptureViewDefaults(
    private val scanAreaMargins: String,
    private val pointOfInterest: String,
    private val logoAnchor: String,
    private val logoOffset: String,
    private val focusGesture: String?,
    private val zoomGesture: String?
) : SerializableData {

    override fun toJson(): JSONObject = JSONObject(
            mapOf(
                    FIELD_MARGINS to scanAreaMargins,
                    FIELD_POI to pointOfInterest,
                    FIELD_LOGO_ANCHOR to logoAnchor,
                    FIELD_LOGO_OFFSET to logoOffset,
                    FIELD_FOCUS_GESTURE to focusGesture,
                    FIELD_ZOOM_GESTURE to zoomGesture
            )
    )

    companion object {
        private const val FIELD_MARGINS = "scanAreaMargins"
        private const val FIELD_POI = "pointOfInterest"
        private const val FIELD_LOGO_ANCHOR = "logoAnchor"
        private const val FIELD_LOGO_OFFSET = "logoOffset"
        private const val FIELD_FOCUS_GESTURE = "focusGesture"
        private const val FIELD_ZOOM_GESTURE = "zoomGesture"
    }
}
