/*
 * This file is part of the Scandit Data Capture SDK
 *
 * Copyright (C) 2019- Scandit AG. All rights reserved.
 */

package com.scandit.datacapture.cordova.core.data

import com.scandit.datacapture.cordova.core.utils.camelCaseName
import com.scandit.datacapture.core.internal.sdk.extensions.toAngle
import org.json.JSONObject

class SerializableViewState(
        private val width: Int,
        private val height: Int,
        screenOrientation: Int
) {

    private val orientation = ScreenOrientation.fromOrientationInt(screenOrientation.toAngle())

    fun toJson(): JSONObject = JSONObject(
            mapOf(
                    FIELD_ORIENTATION to orientation.camelCaseName,
                    FIELD_SIZE to JSONObject(
                            mapOf(
                                    FIELD_SIZE_WIDTH to width,
                                    FIELD_SIZE_HEIGHT to height
                            )
                    )
            )
    )

    enum class ScreenOrientation {
        PORTRAIT, PORTRAIT_UPSIDE_DOWN, LANDSCAPE_LEFT, LANDSCAPE_RIGHT;

        companion object {
            fun fromOrientationInt(orientation: Int): ScreenOrientation = when (orientation) {
                90 -> LANDSCAPE_RIGHT
                180 -> PORTRAIT_UPSIDE_DOWN
                270 -> LANDSCAPE_LEFT
                else -> PORTRAIT
            }
        }
    }

    companion object {
        private const val FIELD_ORIENTATION = "orientation"
        private const val FIELD_SIZE = "size"
        private const val FIELD_SIZE_WIDTH = "width"
        private const val FIELD_SIZE_HEIGHT = "height"
    }
}
