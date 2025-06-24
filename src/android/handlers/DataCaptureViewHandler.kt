/*
 * This file is part of the Scandit Data Capture SDK
 *
 * Copyright (C) 2019- Scandit AG. All rights reserved.
 */

package com.scandit.datacapture.cordova.core.handlers

import android.app.Activity
import android.content.Context
import android.graphics.Color
import android.view.View
import android.view.ViewGroup
import android.view.ViewGroup.LayoutParams.MATCH_PARENT
import com.scandit.datacapture.cordova.core.data.ResizeAndMoveInfo
import com.scandit.datacapture.cordova.core.utils.pxFromDp
import com.scandit.datacapture.cordova.core.utils.removeFromParent
import com.scandit.datacapture.core.ui.DataCaptureView
import java.lang.ref.WeakReference

class DataCaptureViewHandler {
    private var latestInfo: ResizeAndMoveInfo = ResizeAndMoveInfo(0, 0, 0, 0, false)
    private var isVisible: Boolean = false
    private var dataCaptureViewReference: WeakReference<DataCaptureView>? = null
    private var webViewReference: WeakReference<View>? = null
    private var backgroundViewReference: WeakReference<View>? = null

    val dataCaptureView: DataCaptureView?
        get() = dataCaptureViewReference?.get()

    private val webView: View?
        get() = webViewReference?.get()

    private val backgroundView: View?
        get() = backgroundViewReference?.get()

    fun attachDataCaptureView(dataCaptureView: DataCaptureView, activity: Activity) {
        addDataCaptureView(dataCaptureView, activity)
    }

    fun attachWebView(webView: View) {
        if (this.webView != webView) {
            webViewReference = WeakReference(webView)
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

    fun disposeCurrentWebView() {
        webViewReference = null
        val dcView = dataCaptureView ?: return
        removeDataCaptureView(dcView)
    }

    private fun disposeCurrentBackgroundView() {
        val backgroundView = backgroundView ?: return
        backgroundViewReference = null
        removeView(backgroundView)
    }

    private fun createBackgroundView(context: Context): View = View(context).apply {
        setBackgroundColor(Color.WHITE)
    }

    private fun addDataCaptureView(dataCaptureView: DataCaptureView, activity: Activity) {
        dataCaptureViewReference = WeakReference(dataCaptureView)
        activity.runOnUiThread {
            val backgroundView = createBackgroundView(activity)
            backgroundViewReference = WeakReference(backgroundView)
            activity.addContentView(
                backgroundView,
                ViewGroup.LayoutParams(MATCH_PARENT, MATCH_PARENT)
            )
            webView?.bringToFront()
            webView?.setBackgroundColor(Color.TRANSPARENT)

            dataCaptureView.parent?.let {
                (it as ViewGroup).removeView(dataCaptureView)
            }
            activity.addContentView(
                dataCaptureView,
                ViewGroup.LayoutParams(
                    latestInfo.width.pxFromDp().toInt(),
                    latestInfo.height.pxFromDp().toInt()
                )
            )
            render()
        }
    }

    fun removeDataCaptureView(dataCaptureView: DataCaptureView) {
        dataCaptureViewReference = null
        removeView(dataCaptureView)
        disposeCurrentBackgroundView()
    }

    private fun removeView(view: View) {
        view.post {
            view.removeFromParent()
        }
    }

    // Update the view visibility, position and size.
    private fun render() {
        val view = dataCaptureView ?: return
        renderNoAnimate(view)
    }

    private fun renderNoAnimate(dataCaptureView: DataCaptureView) {
        dataCaptureView.post {
            dataCaptureView.visibility = if (isVisible) View.VISIBLE else View.GONE
            dataCaptureView.x = latestInfo.left.pxFromDp()
            dataCaptureView.y = latestInfo.top.pxFromDp()
            dataCaptureView.layoutParams.apply {
                width = latestInfo.width.pxFromDp().toInt()
                height = latestInfo.height.pxFromDp().toInt()
            }
            if (latestInfo.shouldBeUnderWebView) {
                webView?.bringToFront()
            } else {
                dataCaptureView.bringToFront()
            }
            dataCaptureView.requestLayout()
        }
    }
}
