/*
 * This file is part of the Scandit Data Capture SDK
 *
 * Copyright (C) 2019- Scandit AG. All rights reserved.
 */

package com.scandit.datacapture.cordova.core.data.defaults

import com.scandit.datacapture.cordova.core.data.SerializableData
import com.scandit.datacapture.core.source.CameraSettings
import com.scandit.datacapture.core.source.toJson
import org.json.JSONObject

data class SerializableCameraSettingsDefault(
        private val prefResolution: String,
        private val maxFrameRate: Float,
        private val zoomFactor: Float,
        private val focusRange: String
) : SerializableData {

    constructor(settings: CameraSettings) : this(
            prefResolution = settings.preferredResolution.toJson(),
            maxFrameRate = settings.maxFrameRate,
            zoomFactor = settings.zoomFactor,
            focusRange = "full"
    )

    override fun toJson(): JSONObject = JSONObject(
            mapOf(
                    FIELD_PREFERRED_RESOLUTION to prefResolution,
                    FIELD_MAX_FRAME_RATE to maxFrameRate,
                    FIELD_ZOOM_FACTOR to zoomFactor,
                    FIELD_FOCUS_RANGE to focusRange
            )
    )

    companion object {
        private const val FIELD_PREFERRED_RESOLUTION = "preferredResolution"
        private const val FIELD_MAX_FRAME_RATE = "maxFrameRate"
        private const val FIELD_ZOOM_FACTOR = "zoomFactor"
        private const val FIELD_FOCUS_RANGE = "focusRange"
    }
}
