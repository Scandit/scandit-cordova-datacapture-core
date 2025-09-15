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
import com.scandit.datacapture.cordova.core.utils.CordovaResult
import com.scandit.datacapture.cordova.core.utils.PermissionRequest
import com.scandit.datacapture.cordova.core.utils.PluginMethod
import com.scandit.datacapture.cordova.core.utils.defaultArgumentAsString
import com.scandit.datacapture.cordova.core.utils.successAndKeepCallback
import com.scandit.datacapture.core.common.feedback.Feedback
import com.scandit.datacapture.core.source.FrameSourceState
import com.scandit.datacapture.core.source.FrameSourceStateDeserializer
import com.scandit.datacapture.frameworks.core.CoreModule
import com.scandit.datacapture.frameworks.core.lifecycle.ActivityLifecycleDispatcher
import com.scandit.datacapture.frameworks.core.lifecycle.DefaultActivityLifecycle
import com.scandit.datacapture.frameworks.core.listeners.FrameworksDataCaptureContextListener
import com.scandit.datacapture.frameworks.core.listeners.FrameworksDataCaptureViewListener
import com.scandit.datacapture.frameworks.core.listeners.FrameworksFrameSourceListener
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

    private val eventEmitter = CordovaEventEmitter()

    private var volumeButtonObserver: VolumeButtonObserver? = null

    private val coreModule = CoreModule.create(eventEmitter)

    private lateinit var exposedFunctionsToJs: Map<String, Method>

    override fun pluginInitialize() {
        coreModule.onCreate(cordova.context)
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
        eventEmitter.removeAllCallbacks()
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
    fun contextFromJSON(args: JSONArray, callbackContext: CallbackContext) {
        val contextJson = args.getJSONObject(0).getString("contextJson")
        coreModule.createContextFromJson(contextJson, CordovaResult(callbackContext))
    }

    @PluginMethod
    fun updateContextFromJSON(args: JSONArray, callbackContext: CallbackContext) {
        val contextJson = args.getJSONObject(0).getString("contextJson")
        mainThread.runOnMainThread {
            coreModule.updateContextFromJson(contextJson, CordovaResult(callbackContext))
        }
    }

    @PluginMethod
    fun showView(
        @Suppress("UNUSED_PARAMETER") args: JSONArray,
        callbackContext: CallbackContext
    ) {
        captureViewHandler.setVisible()
        callbackContext.success()
    }

    @PluginMethod
    fun hideView(
        @Suppress("UNUSED_PARAMETER") args: JSONArray,
        callbackContext: CallbackContext
    ) {
        captureViewHandler.setInvisible()
        callbackContext.success()
    }

    @PluginMethod
    fun setViewPositionAndSize(args: JSONArray, callbackContext: CallbackContext) {
        try {
            val infoJsonObject = args.getJSONObject(0)

            captureViewHandler.setResizeAndMoveInfo(ResizeAndMoveInfo(infoJsonObject))
            callbackContext.success()
        } catch (e: JSONException) {
            onJsonParseError(e, callbackContext)
        }
    }

    @PluginMethod
    fun disposeContext(
        @Suppress("UNUSED_PARAMETER") args: JSONArray,
        callbackContext: CallbackContext
    ) {
        coreModule.disposeContext()
        callbackContext.success()
    }

    @PluginMethod
    fun subscribeContextListener(
        @Suppress("UNUSED_PARAMETER") args: JSONArray,
        callbackContext: CallbackContext
    ) {
        eventEmitter.registerCallback(
            FrameworksDataCaptureContextListener.DID_START_OBSERVING_EVENT_NAME,
            callbackContext
        )
        eventEmitter.registerCallback(
            FrameworksDataCaptureContextListener.DID_CHANGE_STATUS_EVENT_NAME,
            callbackContext
        )
        coreModule.registerDataCaptureContextListener()
        callbackContext.successAndKeepCallback()
    }

    @PluginMethod
    fun unsubscribeContextListener(
        @Suppress("UNUSED_PARAMETER") args: JSONArray,
        callbackContext: CallbackContext
    ) {
        eventEmitter.unregisterCallback(
            FrameworksDataCaptureContextListener.DID_START_OBSERVING_EVENT_NAME
        )
        eventEmitter.unregisterCallback(
            FrameworksDataCaptureContextListener.DID_CHANGE_STATUS_EVENT_NAME
        )
        coreModule.unregisterDataCaptureContextListener()
        callbackContext.success()
    }

    @PluginMethod
    fun subscribeViewListener(
        args: JSONArray,
        callbackContext: CallbackContext
    ) {
        eventEmitter.registerCallback(
            FrameworksDataCaptureViewListener.ON_SIZE_CHANGED_EVENT_NAME,
            callbackContext
        )
        val viewId = args.getInt(0)
        coreModule.registerDataCaptureViewListener(viewId)
        callbackContext.successAndKeepCallback()
    }

    @PluginMethod
    fun unsubscribeViewListener(
        args: JSONArray,
        callbackContext: CallbackContext
    ) {
        eventEmitter.unregisterCallback(
            FrameworksDataCaptureViewListener.ON_SIZE_CHANGED_EVENT_NAME
        )
        val viewId = args.getInt(0)
        coreModule.unregisterDataCaptureViewListener(viewId)
        callbackContext.success()
    }

    @PluginMethod
    fun viewPointForFramePoint(args: JSONArray, callbackContext: CallbackContext) {
        val argsJson = args.getJSONObject(0)

        coreModule.viewPointForFramePoint(
            argsJson.getInt("viewId"),
            argsJson.getString("point"),
            CordovaResult(callbackContext)
        )
    }

    @PluginMethod
    fun viewQuadrilateralForFrameQuadrilateral(args: JSONArray, callbackContext: CallbackContext) {
        val argsJson = args.getJSONObject(0)
        coreModule.viewQuadrilateralForFrameQuadrilateral(
            argsJson.getInt("viewId"),
            argsJson.getString("quadrilateral"),
            CordovaResult(callbackContext)
        )
    }

    @PluginMethod
    fun getCurrentCameraState(
        args: JSONArray,
        callbackContext: CallbackContext
    ) {
        val argsJson = args.getJSONObject(0)
        coreModule.getCameraState(
            argsJson.getString("position"),
            CordovaResult(callbackContext)
        )
    }

    @PluginMethod
    fun emitFeedback(args: JSONArray, callbackContext: CallbackContext) {
        val jsonObject = args.getJSONObject(0)
        coreModule.emitFeedback(jsonObject.toString(), CordovaResult(callbackContext))
    }

    @PluginMethod
    fun isTorchAvailable(args: JSONArray, callbackContext: CallbackContext) {
        val argsJson = args.getJSONObject(0)
        coreModule.isTorchAvailable(
            argsJson.getString("position"),
            CordovaResult(callbackContext)
        )
    }

    @PluginMethod
    fun registerListenerForCameraEvents(
        @Suppress("UNUSED_PARAMETER") args: JSONArray,
        callbackContext: CallbackContext
    ) {
        eventEmitter.registerCallback(
            FrameworksFrameSourceListener.TORCH_STATE_CHANGE_EVENT_NAME,
            callbackContext
        )
        eventEmitter.registerCallback(
            FrameworksFrameSourceListener.FRAME_STATE_CHANGE_EVENT_NAME,
            callbackContext
        )
        coreModule.registerFrameSourceListener()
        callbackContext.successAndKeepCallback()
    }

    @PluginMethod
    fun unregisterListenerForCameraEvents(
        @Suppress("UNUSED_PARAMETER") args: JSONArray,
        callbackContext: CallbackContext
    ) {
        eventEmitter.unregisterCallback(
            FrameworksFrameSourceListener.TORCH_STATE_CHANGE_EVENT_NAME
        )
        eventEmitter.unregisterCallback(
            FrameworksFrameSourceListener.FRAME_STATE_CHANGE_EVENT_NAME
        )
        coreModule.unregisterFrameSourceListener()
        callbackContext.success()
    }

    @PluginMethod
    fun getFrame(args: JSONArray, callbackContext: CallbackContext) {
        val argsJson = args.getJSONObject(0)
        coreModule.getLastFrameAsJson(
            argsJson.getString("frameId"),
            CordovaResult(callbackContext)
        )
    }

    @PluginMethod
    fun switchCameraToDesiredState(args: JSONArray, callbackContext: CallbackContext) {
        val argsJson = args.getJSONObject(0)
        if (!permissionRequest.checkCameraPermission(this)) {
            latestDesiredFrameSource =
                FrameSourceStateDeserializer.fromJson(argsJson.getString("desiredStateJson"))

            permissionRequest.checkOrRequestCameraPermission(this)
            callbackContext.success()
            return
        }

        coreModule.switchCameraToDesiredState(
            argsJson.getString("desiredStateJson"),
            CordovaResult(callbackContext)
        )
        latestDesiredFrameSource = coreModule.getCurrentCameraDesiredState() ?: FrameSourceState.OFF
    }

    @PluginMethod
    fun addModeToContext(args: JSONArray, callbackContext: CallbackContext) {
        val modeJson = args.getJSONObject(0).getString("modeJson")
        coreModule.addModeToContext(modeJson, CordovaResult(callbackContext))
    }

    @PluginMethod
    fun removeModeFromContext(args: JSONArray, callbackContext: CallbackContext) {
        val modeJson = args.getJSONObject(0).getString("modeJson")
        coreModule.removeModeFromContext(
            modeJson,
            CordovaResult(callbackContext)
        )
    }

    @PluginMethod
    fun removeAllModes(
        @Suppress("UNUSED_PARAMETER") args: JSONArray,
        callbackContext: CallbackContext
    ) {
        coreModule.removeAllModes(CordovaResult(callbackContext))
    }

    @PluginMethod
    fun createDataCaptureView(args: JSONArray, callbackContext: CallbackContext) {
        captureViewHandler.attachWebView(webView.view)
        val view = coreModule.createDataCaptureView(
            args.defaultArgumentAsString,
            CordovaResult(callbackContext)
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
    fun updateDataCaptureView(args: JSONArray, callbackContext: CallbackContext) {
        coreModule.updateDataCaptureView(
            args.defaultArgumentAsString,
            CordovaResult(callbackContext)
        )
    }

    @PluginMethod
    fun removeDataCaptureView(
        args: JSONArray,
        callbackContext: CallbackContext
    ) {
        val viewId = args.getInt(0)

        val dcViewToRemove = coreModule.getDataCaptureViewById(viewId)
        if (dcViewToRemove != null) {
            coreModule.dataCaptureViewDisposed(dcViewToRemove)
            captureViewHandler.removeDataCaptureView(dcViewToRemove)
        }
        callbackContext.success()
    }

    @PluginMethod
    fun getOpenSourceSoftwareLicenseInfo(
        @Suppress("UNUSED_PARAMETER") args: JSONArray,
        callbackContext: CallbackContext
    ) {
        coreModule.getOpenSourceSoftwareLicenseInfo(CordovaResult(callbackContext))
    }

    @PluginMethod
    fun subscribeVolumeButtonObserver(
        @Suppress("UNUSED_PARAMETER") args: JSONArray,
        callbackContext: CallbackContext
    ) {
        eventEmitter.registerCallback(VOLUME_CHANGE_EVENT, callbackContext)
        volumeButtonObserver = VolumeButtonObserver(
            cordova.context,
            object : VolumeButtonObserver.VolumeButtonCallback {
                override fun onVolumeButtonPressed() {
                    eventEmitter.emit(VOLUME_CHANGE_EVENT, mutableMapOf())
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
        eventEmitter.unregisterCallback(VOLUME_CHANGE_EVENT)
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
                notifyCameraPermissionDenied()
            }
        }
    }

    private fun notifyCameraPermissionDenied() {
        eventEmitter.emit(
            FrameworksDataCaptureContextListener.DID_CHANGE_STATUS_EVENT_NAME,
            mutableMapOf(
                "code" to 1032,
                "isValid" to true,
                "message" to "Camera Authorization Required"
            )
        )
    }

    private fun onJsonParseError(error: Throwable, callbackContext: CallbackContext) {
        JsonParseError(error.message).sendResult(callbackContext)
    }
}
