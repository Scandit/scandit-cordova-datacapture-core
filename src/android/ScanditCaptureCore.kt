/*
 * This file is part of the Scandit Data Capture SDK
 *
 * Copyright (C) 2019- Scandit AG. All rights reserved.
 */

package com.scandit.datacapture.cordova.core

import android.Manifest
import android.content.pm.PackageManager
import com.scandit.datacapture.cordova.core.actions.ActionSend
import com.scandit.datacapture.cordova.core.communication.CameraPermissionGrantedListener
import com.scandit.datacapture.cordova.core.errors.InvalidActionNameError
import com.scandit.datacapture.cordova.core.errors.JsonParseError
import com.scandit.datacapture.cordova.core.factories.ActionFactory
import com.scandit.datacapture.cordova.core.factories.CaptureCoreActionFactory
import com.scandit.datacapture.cordova.core.handlers.ActionsHandler
import com.scandit.datacapture.cordova.core.handlers.CameraPermissionsActionsHandlerHelper
import com.scandit.datacapture.cordova.core.handlers.DataCaptureViewHandler
import com.scandit.datacapture.cordova.core.utils.CordovaEventEmitter
import com.scandit.datacapture.cordova.core.utils.successAndKeepCallback
import com.scandit.datacapture.core.common.feedback.Feedback
import com.scandit.datacapture.core.source.FrameSourceState
import com.scandit.datacapture.core.ui.DataCaptureView
import com.scandit.datacapture.frameworks.core.CoreModule
import com.scandit.datacapture.frameworks.core.deserialization.DeserializationLifecycleObserver
import com.scandit.datacapture.frameworks.core.listeners.FrameworksDataCaptureContextListener
import com.scandit.datacapture.frameworks.core.listeners.FrameworksDataCaptureViewListener
import com.scandit.datacapture.frameworks.core.listeners.FrameworksFrameSourceDeserializer
import com.scandit.datacapture.frameworks.core.listeners.FrameworksFrameSourceListener
import org.apache.cordova.CallbackContext
import org.apache.cordova.CordovaPlugin
import org.json.JSONArray
import org.json.JSONObject

class ScanditCaptureCore :
    CordovaPlugin(),
    CoreActionsListeners,
    DeserializationLifecycleObserver.Observer {

    companion object {
        private const val CODE_CAMERA_PERMISSIONS = 200
        private val PLUGIN_NAMES: MutableSet<String> = mutableSetOf()

        fun addPlugin(name: String) {
            if (name.startsWith("Scandit")) {
                PLUGIN_NAMES.add(name)
            }
        }
    }

    private var lastFrameSourceState: FrameSourceState = FrameSourceState.OFF

    private var latestFeedback: Feedback? = null

    private val plugins: MutableMap<String, CordovaPlugin?> = mutableMapOf()

    private val captureViewHandler = DataCaptureViewHandler()

    private val eventEmitter = CordovaEventEmitter()

    private val frameSourceListener = FrameworksFrameSourceListener(eventEmitter)
    private val coreModule = CoreModule(
        frameSourceListener,
        FrameworksDataCaptureContextListener(eventEmitter),
        FrameworksDataCaptureViewListener(eventEmitter),
        FrameworksFrameSourceDeserializer(frameSourceListener)
    )

    private val actionFactory: ActionFactory by lazy {
        CaptureCoreActionFactory(
            coreModule,
            captureViewHandler,
            eventEmitter
        )
    }
    private val actionsHandler: ActionsHandler by lazy {
        ActionsHandler(
            actionFactory,
            CameraPermissionsActionsHandlerHelper(actionFactory, ::checkOrRequestCameraPermission)
        )
    }

    private fun getPlugins(): List<CordovaPlugin> = PLUGIN_NAMES.mapNotNull {
        plugins.getOrPut(it) { webView.pluginManager.getPlugin(it) }
    }

    override fun pluginInitialize() {
        captureViewHandler.attachWebView(webView.view, cordova.activity)
        coreModule.onCreate(cordova.context)
        checkCameraPermission()
        DeserializationLifecycleObserver.attach(this)
    }

    override fun onStop() {
        lastFrameSourceState = coreModule.getCurrentCameraDesiredState() ?: FrameSourceState.OFF
        coreModule.switchToDesiredCameraState(FrameSourceState.OFF)
        latestFeedback?.release()
    }

    override fun onStart() {
        if (checkCameraPermission()) {
            coreModule.switchToDesiredCameraState(lastFrameSourceState)
        }
    }

    override fun onReset() {
        captureViewHandler.disposeCurrent()
        coreModule.onDestroy()
        eventEmitter.removeAllCallbacks()
        DeserializationLifecycleObserver.detach(this)
        pluginInitialize()
    }

    override fun execute(
        action: String,
        args: JSONArray,
        callbackContext: CallbackContext
    ): Boolean {
        return try {
            actionsHandler.addAction(action, args, callbackContext)
        } catch (e: InvalidActionNameError) {
            println(e)
            false
        } catch (e: Exception) {
            println(e)
            true
        }
    }

    private fun checkCameraPermission(): Boolean {
        val hasPermission = cordova.hasPermission(Manifest.permission.CAMERA)
        if (hasPermission) actionsHandler.onCameraPermissionGranted()
        return hasPermission
    }

    private fun checkOrRequestCameraPermission() {
        if (checkCameraPermission().not()) {
            cordova.requestPermission(this, CODE_CAMERA_PERMISSIONS, Manifest.permission.CAMERA)
        }
    }

    override fun onRequestPermissionResult(
        requestCode: Int,
        permissions: Array<out String>?,
        grantResults: IntArray?
    ) {
        if (requestCode == CODE_CAMERA_PERMISSIONS) {
            if (grantResults?.firstOrNull() == PackageManager.PERMISSION_GRANTED) {
                actionsHandler.onCameraPermissionGranted()
                notifyCameraPermissionGrantedToPlugins()
            } else {
                actionsHandler.onCameraPermissionDenied()
                notifyCameraPermissionDenied()
            }
        }
    }

    private fun notifyCameraPermissionGrantedToPlugins() {
        getPlugins().filterIsInstance(CameraPermissionGrantedListener::class.java).forEach {
            it.onCameraPermissionGranted()
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

    override fun onJsonParseError(error: Throwable, callbackContext: CallbackContext) {
        JsonParseError(error.message).sendResult(callbackContext)
    }

    override fun onSendAction(
        actionName: String,
        message: JSONObject,
        callbackContext: CallbackContext
    ) {
        callbackContext.successAndKeepCallback(message)
    }

    override fun onDataCaptureViewDeserialized(dataCaptureView: DataCaptureView) {
        captureViewHandler.attachDataCaptureView(dataCaptureView, cordova.activity)
    }
}

interface CoreActionsListeners :
    ActionSend.ResultListener
