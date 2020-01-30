/*
 * This file is part of the Scandit Data Capture SDK
 *
 * Copyright (C) 2019- Scandit AG. All rights reserved.
 */

package com.scandit.datacapture.cordova.core.data.defaults

import com.scandit.datacapture.cordova.core.data.SerializableData
import org.json.JSONObject

data class SerializableRectangularViewfinderDefaults(
        private val size: String,
        private val color: String
) : SerializableData {

    override fun toJson(): JSONObject = JSONObject(
            mapOf(
                    FIELD_SIZE to size,
                    FIELD_COLOR to color
            )
    )

    companion object {
        private const val FIELD_SIZE = "size"
        private const val FIELD_COLOR = "color"
    }
}
