/*
 * This file is part of the Scandit Data Capture SDK
 *
 * Copyright (C) 2019- Scandit AG. All rights reserved.
 */

package com.scandit.datacapture.cordova.core

import android.Manifest
import android.content.pm.PackageManager
import com.scandit.datacapture.cordova.core.actions.*
import com.scandit.datacapture.cordova.core.callbacks.CoreCallbackContainer
import com.scandit.datacapture.cordova.core.callbacks.DataCaptureContextCallback
import com.scandit.datacapture.cordova.core.callbacks.DataCaptureViewCallback
import com.scandit.datacapture.cordova.core.communication.CameraPermissionGrantedListener
import com.scandit.datacapture.cordova.core.communication.ComponentDeserializersProvider
import com.scandit.datacapture.cordova.core.communication.ModeDeserializersProvider
import com.scandit.datacapture.cordova.core.data.ResizeAndMoveInfo
import com.scandit.datacapture.cordova.core.data.defaults.SerializableCoreDefaults
import com.scandit.datacapture.cordova.core.deserializers.Deserializers
import com.scandit.datacapture.cordova.core.deserializers.DeserializersProvider
import com.scandit.datacapture.cordova.core.errors.*
import com.scandit.datacapture.cordova.core.factories.ActionFactory
import com.scandit.datacapture.cordova.core.factories.CaptureCoreActionFactory
import com.scandit.datacapture.cordova.core.handlers.*
import com.scandit.datacapture.cordova.core.utils.successAndKeepCallback
import com.scandit.datacapture.cordova.core.workers.UiWorker
import com.scandit.datacapture.core.capture.DataCaptureContext
import com.scandit.datacapture.core.capture.DataCaptureContextListener
import com.scandit.datacapture.core.capture.serialization.DataCaptureModeDeserializer
import com.scandit.datacapture.core.common.ContextStatus
import com.scandit.datacapture.core.common.feedback.Feedback
import com.scandit.datacapture.core.common.geometry.Point
import com.scandit.datacapture.core.common.geometry.Quadrilateral
import com.scandit.datacapture.core.common.geometry.toJson
import com.scandit.datacapture.core.component.DataCaptureComponent
import com.scandit.datacapture.core.component.serialization.DataCaptureComponentDeserializer
import com.scandit.datacapture.core.json.JsonValue
import com.scandit.datacapture.core.source.*
import com.scandit.datacapture.core.source.serialization.FrameSourceDeserializer
import com.scandit.datacapture.core.source.serialization.FrameSourceDeserializerListener
import com.scandit.datacapture.core.ui.DataCaptureView
import com.scandit.datacapture.core.ui.DataCaptureViewListener
import org.apache.cordova.CallbackContext
import org.apache.cordova.CordovaPlugin
import org.json.JSONArray
import org.json.JSONObject

class ScanditCaptureCore : CordovaPlugin(),
    DataCaptureContextListener,
    DataCaptureViewListener,
    CoreActionsListeners,
    DeserializersProvider,
    FrameSourceDeserializerListener {

    companion object {
        private const val CODE_CAMERA_PERMISSIONS = 200
        private val PLUGIN_NAMES: MutableSet<String> = mutableSetOf()

        fun addPlugin(name: String) {
            if (name.startsWith("Scandit")) {
                PLUGIN_NAMES.add(name)
            }
        }
    }

    private val uiWorker = UiWorker()

    private val coreCallbacks: CoreCallbackContainer = CoreCallbackContainer()
    private val captureContextHandler = DataCaptureContextHandler(this)
    private val captureComponentsHandler = DataCaptureComponentsHandler()
    private val captureViewHandler = DataCaptureViewHandler(this, uiWorker)

    private var lastFrameSourceState: FrameSourceState = FrameSourceState.OFF

    private var latestFeedback: Feedback? = null

    private val plugins: MutableMap<String, CordovaPlugin> = mutableMapOf()

    override val deserializers: Deserializers by lazy {
        Deserializers(
            cordova.context,
            retrieveAllModeDeserializers(),
            retrieveAllComponentDeserializers(),
            this
        )
    }
    private val actionFactory: ActionFactory by lazy {
        CaptureCoreActionFactory(
            cordova.context,
            this,
            this,
            captureContextHandler,
            captureComponentsHandler,
            captureViewHandler,
            uiWorker
        )
    }
    private val actionsHandler: ActionsHandler by lazy {
        ActionsHandler(actionFactory, CameraPermissionsActionsHandlerHelper(actionFactory))
    }

    private fun retrieveAllModeDeserializers(): List<DataCaptureModeDeserializer> =
        getPlugins().filterIsInstance(ModeDeserializersProvider::class.java)
            .flatMap { it.provideModeDeserializers() }

    private fun retrieveAllComponentDeserializers(): List<DataCaptureComponentDeserializer> =
        getPlugins().filterIsInstance(ComponentDeserializersProvider::class.java)
            .flatMap { it.provideComponentDeserializers() }

    private fun getPlugins(): List<CordovaPlugin> = PLUGIN_NAMES.mapNotNull {
        plugins.getOrPut(it) { webView.pluginManager.getPlugin(it) }
    }

    override fun pluginInitialize() {
        captureViewHandler.attachWebView(webView.view, cordova.activity)

        if (cordova.hasPermission(Manifest.permission.CAMERA)) {
            actionsHandler.onCameraPermissionGranted()
        } else {
            cordova.requestPermission(this, CODE_CAMERA_PERMISSIONS, Manifest.permission.CAMERA)
        }
    }

    override fun onStop() {
        lastFrameSourceState = captureContextHandler.camera?.desiredState ?: FrameSourceState.OFF
        captureContextHandler.camera?.switchToDesiredState(FrameSourceState.OFF)
        latestFeedback?.release()
    }

    override fun onStart() {
        captureContextHandler.camera?.switchToDesiredState(lastFrameSourceState)
    }

    override fun onReset() {
        captureContextHandler.disposeCurrent()
        captureViewHandler.disposeCurrent()
        captureComponentsHandler.disposeCurrent()
        coreCallbacks.disposeAll()
    }

    override fun execute(
        action: String, args: JSONArray, callbackContext: CallbackContext
    ): Boolean {
        return try {
            actionsHandler.addAction(action, args, callbackContext)
        } catch (e: InvalidActionNameError) {
            false
        } catch (e: Exception) {
            e.printStackTrace()
            true
        }
    }

    override fun onRequestPermissionResult(
        requestCode: Int, permissions: Array<out String>?, grantResults: IntArray?
    ) {
        if (requestCode == CODE_CAMERA_PERMISSIONS) {
            if (grantResults?.getOrNull(0) == PackageManager.PERMISSION_GRANTED) {
                actionsHandler.onCameraPermissionGranted()
                notifyCameraPermissionGrantedToPlugins()
            }
        }
    }

    private fun notifyCameraPermissionGrantedToPlugins() {
        getPlugins().filterIsInstance(CameraPermissionGrantedListener::class.java).forEach {
            it.onCameraPermissionGranted()
        }
    }

    //region FrameSourceDeserializerListener
    override fun onFrameSourceDeserializationFinished(
        deserializer: FrameSourceDeserializer, frameSource: FrameSource, json: JsonValue
    ) {
        super.onFrameSourceDeserializationFinished(deserializer, frameSource, json)

        val camera = frameSource as? Camera ?: return

        val torchState = TorchStateDeserializer.fromJson(
            json.getByKeyAsString("desiredTorchState", "off")
        )
        val frameSourceState = FrameSourceStateDeserializer.fromJson(
            json.getByKeyAsString("desiredState", "off")
        )
        camera.desiredTorchState = torchState
        camera.switchToDesiredState(frameSourceState)
    }
    //endregion

    //region DataCaptureContextListener
    override fun onStatusChanged(
        dataCaptureContext: DataCaptureContext, contextStatus: ContextStatus
    ) {
        coreCallbacks.contextCallback?.onStatusChanged(contextStatus)
    }

    override fun onObservationStarted(dataCaptureContext: DataCaptureContext) {
        coreCallbacks.contextCallback?.onObservationStarted(dataCaptureContext)
    }
    //endregion

    //region DataCaptureViewListener
    override fun onSizeChanged(width: Int, height: Int, screenOrientation: Int) {
        coreCallbacks.viewCallback?.onSizeChanged(width, height, screenOrientation)
    }
    //endregion

    //region Action callbacks
    override fun onJsonParseError(error: Throwable, callbackContext: CallbackContext) {
        JsonParseError(error.message).sendResult(callbackContext)
    }

    override fun onAdditionalActionRequired(
        actionName: String, args: JSONArray, callbackContext: CallbackContext
    ) {
        execute(actionName, args, callbackContext)
    }

    //region ActionInjectDefaults.ResultListener
    override fun onCoreDefaults(
        defaults: SerializableCoreDefaults, callbackContext: CallbackContext
    ) {
        callbackContext.success(defaults.toJson())
    }
    //endregion

    //region ActionCreateContextAndView.ResultListener
    override fun onCreateContextAndView(
        dataCaptureContext: DataCaptureContext,
        dataCaptureView: DataCaptureView,
        dataCaptureComponents: List<DataCaptureComponent>,
        callbackContext: CallbackContext
    ) {
        captureContextHandler.attachDataCaptureContext(dataCaptureContext)
        captureViewHandler.attachDataCaptureView(dataCaptureView, cordova.activity)
        captureComponentsHandler.attachDataCaptureComponents(dataCaptureComponents)
        callbackContext.success()
    }

    override fun onCreateContextAndViewError(
        error: Throwable, callbackContext: CallbackContext
    ) {
        ContextDeserializationError(error.message).sendResult(callbackContext)
    }
    //endregion

    //region ActionUpdateContextAndView.ResultListener
    override fun onUpdateContextAndView(
        dataCaptureContext: DataCaptureContext,
        dataCaptureView: DataCaptureView,
        dataCaptureComponents: List<DataCaptureComponent>,
        callbackContext: CallbackContext
    ) {
        captureContextHandler.attachDataCaptureContext(dataCaptureContext)
        captureViewHandler.attachDataCaptureView(dataCaptureView, cordova.activity)
        captureComponentsHandler.attachDataCaptureComponents(dataCaptureComponents)
        callbackContext.success()
    }

    override fun onUpdateContextAndViewError(
        error: Throwable, callbackContext: CallbackContext
    ) {
        ContextDeserializationError(error.message).sendResult(callbackContext)
        coreCallbacks.contextCallback?.onStatusChanged(
            code = -1,
            isValid = true,
            message = "Could not deserialize context: ${error.message}"
        )
    }
    //endregion

    //region ActionViewShow.ResultListener
    override fun onShowDataCaptureView(callbackContext: CallbackContext) {
        captureViewHandler.setVisible()
        callbackContext.success()
    }
    //endregion


    //region ActionViewHide.ResultListener
    override fun onHideDataCaptureView(callbackContext: CallbackContext) {
        captureViewHandler.setInvisible()
        callbackContext.success()
    }
    //endregion

    //region ActionViewResizeMove.ResultListener
    override fun onResizeAndMoveDataCaptureView(
        info: ResizeAndMoveInfo, callbackContext: CallbackContext
    ) {
        captureViewHandler.setResizeAndMoveInfo(info)
        callbackContext.success()
    }
    //endregion

    //region ActionDisposeContext.ResultListener
    override fun onDisposeDataCaptureContext(callbackContext: CallbackContext) {
        captureContextHandler.disposeCurrent()
        captureComponentsHandler.disposeCurrent()
        callbackContext.success()
    }
    //endregion

    //region ActionSubscribeContext.ResultListener
    override fun onSubscribeToDataCaptureContext(callbackContext: CallbackContext) {
        coreCallbacks.setContextCallback(
            DataCaptureContextCallback(actionsHandler, callbackContext)
        )
        callbackContext.successAndKeepCallback()
    }
    //endregion

    //region ActionSubscribeView.ResultListener
    override fun onSubscribeToDataCaptureView(callbackContext: CallbackContext) {
        coreCallbacks.setViewCallback(
            DataCaptureViewCallback(actionsHandler, callbackContext, uiWorker)
        )
        callbackContext.successAndKeepCallback()
    }
    //endregion

    //region ActionConvertPointCoordinates.ResultListener
    override fun onConvertPointCoordinates(
        point: Point, callbackContext: CallbackContext
    ) {
        callbackContext.success(point.toJson())
    }

    override fun onConvertPointCoordinatesNoViewError(callbackContext: CallbackContext) {
        NoViewToConvertPointError().sendResult(callbackContext)
    }
    //endregion

    //region ActionConvertQuadrilateralCoordinates.ResultListener
    override fun onConvertQuadrilateralCoordinates(
        quadrilateral: Quadrilateral, callbackContext: CallbackContext
    ) {
        callbackContext.success(quadrilateral.toJson())
    }

    override fun onConvertQuadrilateralCoordinatesNoViewError(callbackContext: CallbackContext) {
        NoViewToConvertQuadrilateralError().sendResult(callbackContext)
    }
    //endregion

    //region ActionGetCameraState.ResultListener
    override fun onGetCameraState(cameraState: FrameSourceState, callbackContext: CallbackContext) {
        callbackContext.success(cameraState.toJson())
    }

    override fun onNoCameraError(callbackContext: CallbackContext) {
        NoCameraAvailableError().sendResult(callbackContext)
    }
    //endregion

    //region ActionSend.ResultListener
    override fun onSendAction(
        actionName: String, message: JSONObject, callbackContext: CallbackContext
    ) {
        callbackContext.successAndKeepCallback(message)
    }
    //endregion

    //region ActionEmitFeedback.ResultListener
    override fun onEmitFeedback(feedback: Feedback, callbackContext: CallbackContext) {
        latestFeedback?.release()
        feedback.emit()
        latestFeedback = feedback

        callbackContext.success()
    }
    //endregion
    //endregion
}

interface CoreActionsListeners : ActionInjectDefaults.ResultListener,
    ActionCreateContextAndView.ResultListener,
    ActionUpdateContextAndView.ResultListener,
    ActionViewShow.ResultListener,
    ActionViewHide.ResultListener,
    ActionViewResizeMove.ResultListener,
    ActionDisposeContext.ResultListener,
    ActionSubscribeContext.ResultListener,
    ActionSubscribeView.ResultListener,
    ActionConvertPointCoordinates.ResultListener,
    ActionConvertQuadrilateralCoordinates.ResultListener,
    ActionGetCameraState.ResultListener,
    ActionSend.ResultListener,
    ActionEmitFeedback.ResultListener
