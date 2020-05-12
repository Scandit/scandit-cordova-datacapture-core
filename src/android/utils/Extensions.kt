/*
 * This file is part of the Scandit Data Capture SDK
 *
 * Copyright (C) 2019- Scandit AG. All rights reserved.
 */

package com.scandit.datacapture.cordova.core.utils

import android.content.Context
import android.graphics.Bitmap
import android.graphics.BitmapFactory
import android.graphics.Color
import android.util.Base64
import android.view.View
import android.view.ViewGroup
import org.apache.cordova.CallbackContext
import org.apache.cordova.PluginResult
import org.json.JSONObject

fun Int.dpToPx(context: Context) = this * context.resources.displayMetrics.density

fun View.removeFromParent() {
    val parent = parent as? ViewGroup ?: return
    parent.removeView(this)
}

val Enum<*>.camelCaseName: String
    get() = name.toLowerCase()
            .split("_")
            .joinToString(separator = "") { it.capitalize() }
            .decapitalize()

val Int.hexString: String
    get() {
        val hex = String.format("%08X", this)
        return "#" +// ts is expecting the color in format #RRGGBBAA, we need to move the alpha.
                hex.substring(2) +// RRGGBB
                hex.substring(0, 2)// AA
    }

val String.colorInt: Int
    get() {
        return Color.parseColor(
                "#" +// ts is giving the color in format RRGGBBAA, we need to move the alpha and add the #.
                        substring(6, 8) +
                        substring(0, 6)
        )
    }

fun bitmapFromBase64String(string: String?): Bitmap? {
    string ?: return null

    val index = string.indexOf(",")
    return try {
        val trimmedString = string.removeRange(0, index)
        val bytes = Base64.decode(trimmedString, Base64.DEFAULT)
        BitmapFactory.decodeByteArray(bytes, 0, bytes.size)
    } catch (e: Exception) {
        e.printStackTrace()
        null
    }
}

fun CallbackContext.successAndKeepCallback() {
    sendPluginResult(
            PluginResult(PluginResult.Status.OK).apply {
                keepCallback = true
            }
    )
}

fun CallbackContext.successAndKeepCallback(message: JSONObject) {
    sendPluginResult(
            PluginResult(PluginResult.Status.OK, message).apply {
                keepCallback = true
            }
    )
}
