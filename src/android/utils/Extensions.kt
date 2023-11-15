/*
 * This file is part of the Scandit Data Capture SDK
 *
 * Copyright (C) 2019- Scandit AG. All rights reserved.
 */

package com.scandit.datacapture.cordova.core.utils

import android.graphics.Bitmap
import android.graphics.BitmapFactory
import android.util.Base64
import android.view.View
import android.view.ViewGroup
import com.scandit.datacapture.core.internal.sdk.AppAndroidEnvironment
import org.apache.cordova.CallbackContext
import org.apache.cordova.PluginResult
import org.json.JSONObject

fun Int.pxFromDp(): Float {
    val context = AppAndroidEnvironment.applicationContext
    val displayDensity = context.resources.displayMetrics.density
    return (this * displayDensity + 0.5f)
}

fun View.removeFromParent() {
    val parent = parent as? ViewGroup ?: return
    parent.removeView(this)
}

fun bitmapFromBase64String(string: String?): Bitmap? {
    string ?: return null

    val index = string.indexOf(",")
    return try {
        val trimmedString = string.removeRange(0, index)
        val bytes = Base64.decode(trimmedString, Base64.DEFAULT)
        BitmapFactory.decodeByteArray(bytes, 0, bytes.size)
    } catch (e: Exception) {
        println(e)
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
