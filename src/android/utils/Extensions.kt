/*
 * This file is part of the Scandit Data Capture SDK
 *
 * Copyright (C) 2019- Scandit AG. All rights reserved.
 */

package com.scandit.datacapture.cordova.core.utils

import android.content.Context
import android.graphics.Color
import android.view.View
import android.view.ViewGroup

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
