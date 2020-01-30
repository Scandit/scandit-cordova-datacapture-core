/*
 * This file is part of the Scandit Data Capture SDK
 *
 * Copyright (C) 2019- Scandit AG. All rights reserved.
 */

package com.scandit.datacapture.cordova.core.data

import com.scandit.datacapture.core.common.geometry.Point
import org.json.JSONException
import org.json.JSONObject

data class SerializablePoint(private val x: Double, private val y: Double) : SerializableData {

    @Throws(JSONException::class)
    constructor(json: JSONObject) : this(json.getDouble(FIELD_X), json.getDouble(FIELD_Y))

    constructor(scanditPoint: Point) : this(scanditPoint.x.toDouble(), scanditPoint.y.toDouble())

    override fun toJson(): JSONObject = JSONObject(
            mapOf(
                    FIELD_X to x,
                    FIELD_Y to y
            )
    )

    fun toScanditPoint(): Point = Point(x.toFloat(), y.toFloat())

    companion object {
        private const val FIELD_X = "x"
        private const val FIELD_Y = "y"
    }
}
