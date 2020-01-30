/*
 * This file is part of the Scandit Data Capture SDK
 *
 * Copyright (C) 2019- Scandit AG. All rights reserved.
 */

package com.scandit.datacapture.cordova.core.data.defaults

import com.scandit.datacapture.cordova.core.data.SerializableData
import org.json.JSONObject

data class SerializableCoreDefaults(
        private val cameraDefaults: SerializableCameraDefaults,
        private val dataCaptureViewDefaults: SerializableDataCaptureViewDefaults,
        private val laserlineViewfinderDefaults: SerializableLaserlineViewfinderDefaults,
        private val rectangularViewfinderDefaults: SerializableRectangularViewfinderDefaults,
        private val spotlightViewfinderDefaults: SerializableSpotlightViewfinderDefaults,
        private val brushDefaults: SerializableBrushDefaults
) : SerializableData {

    override fun toJson(): JSONObject = JSONObject(
            mapOf(
                    FIELD_CAMERA_DEFAULTS to cameraDefaults.toJson(),
                    FIELD_DATA_CAPTURE_VIEW_DEFAULTS to dataCaptureViewDefaults.toJson(),
                    FIELD_LASERLINE_VIEWFINDER_DEFAULTS to laserlineViewfinderDefaults.toJson(),
                    FIELD_RECTANGULAR_VIEWFINDER_DEFAULTS to rectangularViewfinderDefaults.toJson(),
                    FIELD_SPOTLIGHT_VIEWFINDER_DEFAULTS to spotlightViewfinderDefaults.toJson(),
                    FIELD_BRUSH_DEFAULTS to brushDefaults.toJson()
            )
    )

    companion object {
        private const val FIELD_CAMERA_DEFAULTS = "Camera"
        private const val FIELD_DATA_CAPTURE_VIEW_DEFAULTS = "DataCaptureView"
        private const val FIELD_LASERLINE_VIEWFINDER_DEFAULTS = "LaserlineViewfinder"
        private const val FIELD_RECTANGULAR_VIEWFINDER_DEFAULTS = "RectangularViewfinder"
        private const val FIELD_SPOTLIGHT_VIEWFINDER_DEFAULTS = "SpotlightViewfinder"
        private const val FIELD_BRUSH_DEFAULTS = "Brush"
    }
}
