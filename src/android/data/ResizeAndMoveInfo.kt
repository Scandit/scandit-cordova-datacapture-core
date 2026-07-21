/*
 * This file is part of the Scandit Data Capture SDK
 *
 * Copyright (C) 2019- Scandit AG. All rights reserved.
 */

package com.scandit.datacapture.cordova.core.data

import org.json.JSONObject

data class ResizeAndMoveInfo(
    val top: Float,
    val left: Float,
    val width: Float,
    val height: Float,
    val shouldBeUnderWebView: Boolean
) {

    constructor(json: JSONObject) : this(
        top = json.getDouble(KEY_TOP).toFloat(),
        left = json.getDouble(KEY_LEFT).toFloat(),
        width = json.getDouble(KEY_WIDTH).toFloat(),
        height = json.getDouble(KEY_HEIGHT).toFloat(),
        shouldBeUnderWebView = json.getBoolean(KEY_ELEVATION)
    )

    companion object {
        private const val KEY_TOP = "top"
        private const val KEY_LEFT = "left"
        private const val KEY_WIDTH = "width"
        private const val KEY_HEIGHT = "height"
        private const val KEY_ELEVATION = "shouldBeUnderWebView"
    }
}
