/*
 * This file is part of the Scandit Data Capture SDK
 *
 * Copyright (C) 2019- Scandit AG. All rights reserved.
 */

package com.scandit.datacapture.cordova.core.data.defaults

import com.scandit.datacapture.cordova.core.data.SerializableData
import org.json.JSONObject

data class SerializableLaserlineViewfinderDefaults(
        private val width: String,
        private val enabledColor: String,
        private val disabledColor: String
) : SerializableData {

    override fun toJson(): JSONObject = JSONObject(
            mapOf(
                    FIELD_WIDTH to width,
                    FIELD_ENABLED_COLOR to enabledColor,
                    FIELD_DISABLED_COLOR to disabledColor
            )
    )

    companion object {
        private const val FIELD_WIDTH = "width"
        private const val FIELD_ENABLED_COLOR = "enabledColor"
        private const val FIELD_DISABLED_COLOR = "disabledColor"
    }
}
