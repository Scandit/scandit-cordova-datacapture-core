/*
 * This file is part of the Scandit Data Capture SDK
 *
 * Copyright (C) 2025- Scandit AG. All rights reserved.
 */

package com.scandit.datacapture.cordova.core.utils

import com.scandit.datacapture.frameworks.core.context.data.toMap
import com.scandit.datacapture.frameworks.core.method.FrameworksMethodCall
import org.json.JSONArray
import org.json.JSONObject

/**
 * Cordova implementation of [FrameworksMethodCall].
 *
 * Wraps Cordova's JSONArray-based method call arguments, where the first element
 * is expected to be a JSONObject containing the actual method arguments.
 */
class CordovaMethodCall(
    private val args: JSONArray
) : FrameworksMethodCall {
    private val payload: JSONObject
        get() = if (args.length() > 0) {
            args.optJSONObject(0) ?: JSONObject()
        } else {
            JSONObject()
        }

    override val method: String
        get() = payload.getString("methodName")

    @Suppress("UNCHECKED_CAST")
    override fun <T> argument(key: String): T {
        val value = payload.opt(key)
        if (value == JSONObject.NULL) {
            return null as T
        }
        return value as T
    }

    override fun hasArgument(key: String): Boolean = payload.has(key)

    override fun arguments(): Map<String, Any?> = payload.toMap()
}
