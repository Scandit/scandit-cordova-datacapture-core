/*
 * This file is part of the Scandit Data Capture SDK
 *
 * Copyright (C) 2019- Scandit AG. All rights reserved.
 */

package com.scandit.datacapture.cordova.core

import android.content.pm.PackageManager
import com.scandit.datacapture.cordova.core.data.ResizeAndMoveInfo
import com.scandit.datacapture.cordova.core.errors.JsonParseError
import com.scandit.datacapture.cordova.core.handlers.DataCaptureViewHandler
import com.scandit.datacapture.cordova.core.utils.CordovaEventEmitter
import com.scandit.datacapture.cordova.core.utils.CordovaMethodCall
import com.scandit.datacapture.cordova.core.utils.CordovaResult
import com.scandit.datacapture.cordova.core.utils.PermissionRequest
import com.scandit.datacapture.cordova.core.utils.PluginMethod
import com.scandit.datacapture.cordova.core.utils.successAndKeepCallback
import com.scandit.datacapture.core.common.feedback.Feedback
import com.scandit.datacapture.core.source.FrameSourceState
import com.scandit.datacapture.core.source.FrameSourceStateDeserializer
import com.scandit.datacapture.frameworks.core.CoreModule
import com.scandit.datacapture.frameworks.core.errors.ParameterNullError
import com.scandit.datacapture.frameworks.core.extensions.getOrNull
import com.scandit.datacapture.frameworks.core.lifecycle.ActivityLifecycleDispatcher
import com.scandit.datacapture.frameworks.core.lifecycle.DefaultActivityLifecycle
import com.scandit.datacapture.frameworks.core.locator.DefaultServiceLocator
import com.scandit.datacapture.frameworks.core.observers.VolumeButtonObserver
import com.scandit.datacapture.frameworks.core.utils.DefaultMainThread
import com.scandit.datacapture.frameworks.core.utils.MainThread
import org.apache.cordova.CallbackContext
import org.apache.cordova.CordovaPlugin
import org.json.JSONArray
import org.json.JSONException
import org.json.JSONObject
import java.lang.reflect.Method

class ScanditCaptureCore :
    CordovaPlugin() {

    companion object {

        private const val VOLUME_CHANGE_EVENT = "didChangeVolume"

        private val PLUGIN_NAMES: MutableSet<String> = mutableSetOf()

        fun addPlugin(name: String) {
            if (name.startsWith("Scandit")) {
                PLUGIN_NAMES.add(name)
            }
        }
    }

    private val lifecycleDispatcher: ActivityLifecycleDispatcher =
        DefaultActivityLifecycle.getInstance()

    private val mainThread: MainThread = DefaultMainThread.getInstance()

    private val permissionRequest = PermissionRequest.getInstance()

    private var frameSourceStateBeforeStopping: FrameSourceState = FrameSourceState.OFF

    private var latestDesiredFrameSource: FrameSourceState = FrameSourceState.OFF

    private var latestFeedback: Feedback? = null

    private val captureViewHandler = DataCaptureViewHandler()

    private val emitter = CordovaEventEmitter()

    private var volumeButtonObserver: VolumeButtonObserver? = null

    private val coreModule = CoreModule.create(emitter)

    private lateinit var exposedFunctionsToJs: Map<String, Method>

    private val serviceLocator = DefaultServiceLocator.getInstance()

    override fun pluginInitialize() {
        coreModule.onCreate(cordova.context)

        serviceLocator.register(coreModule)

        // Init functions exposed to JS
        exposedFunctionsToJs =
            this.javaClass.methods.filter { it.getAnnotation(PluginMethod::class.java) != null }
                .associateBy { it.name }

        // Dispatch initial lifecycle events since the activity may already be resumed
        // when the plugin initializes on first run
        lifecycleDispatcher.dispatchOnResume()
    }

    override fun onStop() {
        lifecycleDispatcher.dispatchOnStop()
        frameSourceStateBeforeStopping =
            coreModule.getCurrentCameraDesiredState() ?: FrameSourceState.OFF
        coreModule.switchToDesiredCameraState(FrameSourceState.OFF)
        latestFeedback?.release()
    }

    override fun onStart() {
        lifecycleDispatcher.dispatchOnStart()
        if (permissionRequest.checkCameraPermission(this)) {
            coreModule.switchToDesiredCameraState(frameSourceStateBeforeStopping)
        }
    }

    override fun onReset() {
        destroy()
        pluginInitialize()
    }

    override fun onDestroy() {
        lifecycleDispatcher.dispatchOnDestroy()
        destroy()
    }

    override fun onPause(multitasking: Boolean) {
        lifecycleDispatcher.dispatchOnPause()
        // Need to stop observer when app goes in background
        volumeButtonObserver?.unsubscribe()
    }

    override fun onResume(multitasking: Boolean) {
        lifecycleDispatcher.dispatchOnResume()
        // Resume observer when app comes from background
        volumeButtonObserver?.subscribe()
    }

    private fun destroy() {
        captureViewHandler.disposeCurrentWebView()
        coreModule.onDestroy()
        emitter.removeAllCallbacks()
    }

    override fun execute(
        action: String,
        args: JSONArray,
        callbackContext: CallbackContext
    ): Boolean {
        return if (exposedFunctionsToJs.contains(action)) {
            exposedFunctionsToJs[action]?.invoke(this, args, callbackContext)
            true
        } else {
            false
        }
    }

    @PluginMethod
    fun getDefaults(
        @Suppress("UNUSED_PARAMETER") args: JSONArray,
        callbackContext: CallbackContext
    ) {
        val defaults = coreModule.getDefaults()
        callbackContext.success(JSONObject(defaults))
    }

    @PluginMethod
    fun showDataCaptureView(
        @Suppress("UNUSED_PARAMETER") args: JSONArray,
        callbackContext: CallbackContext
    ) {
        captureViewHandler.setVisible()
        callbackContext.success()
    }

    @PluginMethod
    fun hideDataCaptureView(
        @Suppress("UNUSED_PARAMETER") args: JSONArray,
        callbackContext: CallbackContext
    ) {
        captureViewHandler.setInvisible()
        callbackContext.success()
    }

    @PluginMethod
    fun setDataCaptureViewPositionAndSize(args: JSONArray, callbackContext: CallbackContext) {
        try {
            val infoJsonObject = args.getJSONObject(0)
            captureViewHandler.setResizeAndMoveInfo(ResizeAndMoveInfo(infoJsonObject))
            callbackContext.success()
        } catch (e: JSONException) {
            onJsonParseError(e, callbackContext)
        }
    }

    @PluginMethod
    fun createDataCaptureView(args: JSONArray, callbackContext: CallbackContext) {
        captureViewHandler.attachWebView(webView.view)
        val argsJson = args.getJSONObject(0)
        val viewJson = argsJson.getString("viewJson")
        val view = coreModule.createDataCaptureView(
            viewJson,
            CordovaResult(callbackContext, emitter)
        )
        if (view != null) {
            val existingView = captureViewHandler.dataCaptureView
            if (existingView != null) {
                coreModule.dataCaptureViewDisposed(existingView)
                captureViewHandler.removeDataCaptureView(existingView)
            }
            mainThread.runOnMainThread {
                captureViewHandler.attachDataCaptureView(view, cordova.activity)
            }
        }
        callbackContext.success()
    }

    @PluginMethod
    fun removeDataCaptureView(
        args: JSONArray,
        callbackContext: CallbackContext
    ) {
        val argsJson = args.getJSONObject(0)
        val viewId = argsJson.getInt("viewId")

        val dcViewToRemove = coreModule.getDataCaptureViewById(viewId)
        if (dcViewToRemove != null) {
            coreModule.dataCaptureViewDisposed(dcViewToRemove)
            captureViewHandler.removeDataCaptureView(dcViewToRemove)
        }
        callbackContext.success()
    }

    @PluginMethod
    fun subscribeVolumeButtonObserver(
        @Suppress("UNUSED_PARAMETER") args: JSONArray,
        callbackContext: CallbackContext
    ) {
        emitter.registerCallback(VOLUME_CHANGE_EVENT, callbackContext)
        volumeButtonObserver = VolumeButtonObserver(
            cordova.context,
            object : VolumeButtonObserver.VolumeButtonCallback {
                override fun onVolumeButtonPressed() {
                    emitter.emit(VOLUME_CHANGE_EVENT, mutableMapOf())
                }
            }
        )
        volumeButtonObserver?.subscribe()
        callbackContext.successAndKeepCallback()
    }

    @PluginMethod
    fun unsubscribeVolumeButtonObserver(
        @Suppress("UNUSED_PARAMETER") args: JSONArray,
        callbackContext: CallbackContext
    ) {
        emitter.unregisterCallback(VOLUME_CHANGE_EVENT)
        volumeButtonObserver?.unsubscribe()
        volumeButtonObserver = null
        callbackContext.success()
    }

    @Deprecated("Deprecated in Java")
    override fun onRequestPermissionResult(
        requestCode: Int,
        permissions: Array<out String>?,
        grantResults: IntArray?
    ) {
        if (requestCode == PermissionRequest.CODE_CAMERA_PERMISSIONS) {
            if (grantResults?.firstOrNull() == PackageManager.PERMISSION_GRANTED) {
                // Switch camera state once the permission has been granted
                coreModule.switchToDesiredCameraState(latestDesiredFrameSource)
            } else {
                coreModule.notifyCameraPermissionDenied()
            }
        }
    }

    private fun onJsonParseError(error: Throwable, callbackContext: CallbackContext) {
        JsonParseError(error.message).sendResult(callbackContext)
    }

    /**
     * Single entry point for all Core operations.
     * Routes method calls to the appropriate command via the shared command factory.
     */
    @PluginMethod
    fun executeCore(args: JSONArray, callbackContext: CallbackContext) {
        val argsJson = args.getJSONObject(0)
        val methodName = argsJson.getOrNull("methodName") ?: return run {
            callbackContext.error(ParameterNullError("methodName").message)
        }

        if (methodName == "switchCameraToDesiredState" &&
            !permissionRequest.checkCameraPermission(this)
        ) {
            latestDesiredFrameSource =
                FrameSourceStateDeserializer.fromJson(argsJson.getString("stateJson"))

            permissionRequest.checkOrRequestCameraPermission(this)
            callbackContext.success()
            return
        }

        val result = CordovaResult(callbackContext, emitter)
        val handled = coreModule.execute(
            CordovaMethodCall(args),
            result,
            coreModule
        )
        if (!handled) {
            callbackContext.error("Unknown Core method")
        }
    }
}
