/*
 * This file is part of the Scandit Data Capture SDK
 *
 * Copyright (C) 2019- Scandit AG. All rights reserved.
 */

package com.scandit.datacapture.cordova.core.handlers

import android.app.Activity
import android.view.View
import android.view.ViewGroup
import com.scandit.datacapture.cordova.core.data.ResizeAndMoveInfo
import com.scandit.datacapture.cordova.core.testing.OpenForTesting
import com.scandit.datacapture.cordova.core.utils.dpToPx
import com.scandit.datacapture.cordova.core.utils.removeFromParent
import com.scandit.datacapture.core.ui.DataCaptureView
import com.scandit.datacapture.core.ui.DataCaptureViewListener
import java.lang.ref.WeakReference

@OpenForTesting
class DataCaptureViewHandler(
        private val viewListener: DataCaptureViewListener
) {
    private var latestInfo: ResizeAndMoveInfo = ResizeAndMoveInfo(0, 0, 0, 0)
    private var isVisible: Boolean = false
    private var dataCaptureViewReference: WeakReference<DataCaptureView>? = null

    val dataCaptureView: DataCaptureView?
        get() = dataCaptureViewReference?.get()

    fun attachDataCaptureView(dataCaptureView: DataCaptureView, activity: Activity) {
        if (this.dataCaptureView != dataCaptureView) {
            disposeCurrent()
            addView(dataCaptureView, activity)
        }
    }

    fun setVisible() {
        isVisible = true
        render()
    }

    fun setInvisible() {
        isVisible = false
        render()
    }

    fun setResizeAndMoveInfo(info: ResizeAndMoveInfo) {
        latestInfo = info
        render()
    }

    // Remove the current dataCaptureView from hierarchy.
    fun disposeCurrent() {
        val dataCaptureView = dataCaptureView ?: return
        removeView(dataCaptureView)
    }

    private fun addView(dataCaptureView: DataCaptureView, activity: Activity) {
        dataCaptureViewReference = WeakReference(dataCaptureView)
        dataCaptureView.addListener(viewListener)
        activity.runOnUiThread {
            activity.addContentView(
                    dataCaptureView,
                    ViewGroup.LayoutParams(latestInfo.width, latestInfo.height)
            )
            render()
        }
    }

    private fun removeView(dataCaptureView: DataCaptureView) {
        dataCaptureView.post {
            dataCaptureView.removeListener(viewListener)
            dataCaptureView.removeFromParent()
        }
        dataCaptureViewReference = null
    }

    // Update the view visibility, position and size.
    private fun render() {
        val view = dataCaptureView ?: return
        renderNoAnimate(view)
    }

    private fun renderNoAnimate(dataCaptureView: DataCaptureView) {
        dataCaptureView.post {
            val context = dataCaptureView.context
            dataCaptureView.visibility = if (isVisible) View.VISIBLE else View.GONE
            dataCaptureView.x = latestInfo.left.dpToPx(context)
            dataCaptureView.y = latestInfo.top.dpToPx(context)
            dataCaptureView.layoutParams.apply {
                width = latestInfo.width.dpToPx(context).toInt()
                height = latestInfo.height.dpToPx(context).toInt()
            }
            dataCaptureView.requestLayout()
        }
    }
}
