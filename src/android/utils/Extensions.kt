/*
 * This file is part of the Scandit Data Capture SDK
 *
 * Copyright (C) 2019- Scandit AG. All rights reserved.
 */

package com.scandit.datacapture.cordova.core.utils

import android.app.Activity
import android.content.Context
import android.content.ContextWrapper
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

private tailrec fun Context?.findActivity(): Activity? = when (this) {
    null -> null
    is Activity -> this
    is ContextWrapper -> baseContext.findActivity()
    else -> null
}

/**
 * Walks up from this View to the direct child of the activity's content frame
 * (`android.R.id.content`) and calls `bringToFront()` on that ancestor.
 *
 * On cordova-android ≤14 the WebView is a direct child of the content frame, so
 * the loop exits immediately and this is equivalent to a plain `bringToFront()`.
 * On cordova-android 15+ the WebView is wrapped in an intermediate `rootLayout`,
 * so a plain `bringToFront()` only reorders within that wrapper and is
 * ineffective against siblings added via `addContentView` — the loop walks up
 * to the rootLayout and brings *that* to front.
 *
 * Falls back to a plain `bringToFront()` if the activity can't be resolved
 * (e.g. the View's context is something other than an Activity / ContextWrapper
 * chain ending in one), preserving pre-existing behaviour.
 */
fun View.bringContainerToFront() {
    val activity = context.findActivity() ?: run {
        bringToFront()
        return
    }
    val contentFrame = activity.findViewById<View>(android.R.id.content) ?: run {
        bringToFront()
        return
    }
    var node: View = this
    while (node.parent !== contentFrame && node.parent is View) {
        node = node.parent as View
    }
    node.bringToFront()
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
