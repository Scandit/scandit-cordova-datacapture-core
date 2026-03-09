/*
 * This file is part of the Scandit Data Capture SDK
 *
 * Copyright (C) 2019- Scandit AG. All rights reserved.
 */

package com.scandit.datacapture.cordova.core.utils

import android.view.View
import android.view.ViewGroup
import com.scandit.datacapture.core.internal.sdk.AppAndroidEnvironment
import org.apache.cordova.CallbackContext
import org.apache.cordova.PluginResult
import org.json.JSONArray
import org.json.JSONObject

fun Float.pxFromDp(): Float {
    val context = AppAndroidEnvironment.applicationContext
    val displayDensity = context.resources.displayMetrics.density
    return (this * displayDensity + 0.5f)
}

fun View.removeFromParent() {
    val parent = parent as? ViewGroup ?: return
    parent.removeView(this)
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

fun CallbackContext.successAndKeepCallback(message: String) {
    sendPluginResult(
        PluginResult(PluginResult.Status.OK, message).apply {
            keepCallback = true
        }
    )
}

val JSONArray.defaultArgumentAsString: String
    get() = this[0].toString()

fun JSONArray.optBoolean(key: String, defaultValue: Boolean): Boolean =
    this.getJSONObject(0).optBoolean(key, defaultValue)

fun JSONArray.optString(key: String, defaultValue: String): String =
    this.getJSONObject(0).optString(key, defaultValue)
