/*
 * This file is part of the Scandit Data Capture SDK
 *
 * Copyright (C) 2019- Scandit AG. All rights reserved.
 */

package com.scandit.datacapture.cordova.core.data.defaults

import com.scandit.datacapture.cordova.core.data.SerializableData
import org.json.JSONObject

data class SerializableDataCaptureViewDefaults(
        private val scanAreaMargins: String,
        private val pointOfInterest: String,
        private val logoAnchor: String,
        private val logoOffset: String
) : SerializableData {

    override fun toJson(): JSONObject = JSONObject(
            mapOf(
                    FIELD_MARGINS to scanAreaMargins,
                    FIELD_POI to pointOfInterest,
                    FIELD_LOGO_ANCHOR to logoAnchor,
                    FIELD_LOGO_OFFSET to logoOffset
            )
    )

    companion object {
        private const val FIELD_MARGINS = "scanAreaMargins"
        private const val FIELD_POI = "pointOfInterest"
        private const val FIELD_LOGO_ANCHOR = "logoAnchor"
        private const val FIELD_LOGO_OFFSET = "logoOffset"
    }
}
