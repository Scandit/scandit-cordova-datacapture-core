/*
 * This file is part of the Scandit Data Capture SDK
 *
 * Copyright (C) 2019- Scandit AG. All rights reserved.
 */

package com.scandit.datacapture.cordova.core

import android.Manifest
import android.content.pm.PackageManager
import com.scandit.datacapture.cordova.core.actions.ActionConvertPointCoordinates
import com.scandit.datacapture.cordova.core.actions.ActionConvertQuadrilateralCoordinates
import com.scandit.datacapture.cordova.core.actions.ActionCreateContextAndView
import com.scandit.datacapture.cordova.core.actions.ActionDisposeContext
import com.scandit.datacapture.cordova.core.actions.ActionGetCameraState
import com.scandit.datacapture.cordova.core.actions.ActionInjectDefaults
import com.scandit.datacapture.cordova.core.actions.ActionSendContextStatusUpdate
import com.scandit.datacapture.cordova.core.actions.ActionSendViewSizeChanged
import com.scandit.datacapture.cordova.core.actions.ActionSubscribeContext
import com.scandit.datacapture.cordova.core.actions.ActionSubscribeView
import com.scandit.datacapture.cordova.core.actions.ActionUpdateContextAndView
import com.scandit.datacapture.cordova.core.actions.ActionViewHide
import com.scandit.datacapture.cordova.core.actions.ActionViewResizeMove
import com.scandit.datacapture.cordova.core.actions.ActionViewShow
import com.scandit.datacapture.cordova.core.callbacks.CoreCallbackContainer
import com.scandit.datacapture.cordova.core.callbacks.DataCaptureContextCallback
import com.scandit.datacapture.cordova.core.callbacks.DataCaptureViewCallback
import com.scandit.datacapture.cordova.core.communication.CameraPermissionGrantedListener
import com.scandit.datacapture.cordova.core.communication.ModeDeserializersProvider
import com.scandit.datacapture.cordova.core.data.ResizeAndMoveInfo
import com.scandit.datacapture.cordova.core.data.SerializablePoint
import com.scandit.datacapture.cordova.core.deserializers.Deserializers
import com.scandit.datacapture.cordova.core.errors.ContextDeserializationError
import com.scandit.datacapture.cordova.core.errors.InvalidActionNameError
import com.scandit.datacapture.cordova.core.errors.JsonParseError
import com.scandit.datacapture.cordova.core.errors.NoCameraAvailableError
import com.scandit.datacapture.cordova.core.errors.NoViewToConvertPointError
import com.scandit.datacapture.cordova.core.errors.NoViewToConvertQuadrilateralError
import com.scandit.datacapture.cordova.core.factories.ActionFactory
import com.scandit.datacapture.cordova.core.factories.CaptureCoreActionFactory
import com.scandit.datacapture.cordova.core.handlers.ActionsHandler
import com.scandit.datacapture.cordova.core.handlers.CameraPermissionsActionsHandlerHelper
import com.scandit.datacapture.cordova.core.handlers.DataCaptureContextHandler
import com.scandit.datacapture.cordova.core.handlers.DataCaptureViewHandler
import com.scandit.datacapture.core.capture.DataCaptureContext
import com.scandit.datacapture.core.capture.DataCaptureContextListener
import com.scandit.datacapture.core.capture.serialization.DataCaptureModeDeserializer
import com.scandit.datacapture.core.common.ContextStatus
import com.scandit.datacapture.core.common.geometry.Quadrilateral
import com.scandit.datacapture.core.common.geometry.toJson
import com.scandit.datacapture.core.json.JsonValue
import com.scandit.datacapture.core.source.Camera
import com.scandit.datacapture.core.source.FrameSource
import com.scandit.datacapture.core.source.FrameSourceDeserializer
import com.scandit.datacapture.core.source.FrameSourceDeserializerListener
import com.scandit.datacapture.core.source.FrameSourceState
import com.scandit.datacapture.core.source.FrameSourceStateDeserializer
import com.scandit.datacapture.core.source.TorchStateDeserializer
import com.scandit.datacapture.core.source.toJson
import com.scandit.datacapture.core.ui.DataCaptureView
import com.scandit.datacapture.core.ui.DataCaptureViewListener
import org.apache.cordova.CallbackContext
import org.apache.cordova.CordovaPlugin
import org.apache.cordova.PluginResult
import org.json.JSONArray
import org.json.JSONObject

class ScanditCaptureCore : CordovaPlugin(),
        DataCaptureContextListener,
        DataCaptureViewListener,
        CoreActionsListeners,
        FrameSourceDeserializerListener {

    companion object {
        private const val CODE_CAMERA_PERMISSIONS = 200
        val PLUGIN_NAMES: Set<String> = setOf("ScanditBarcodeCapture")
    }

    private val plugins: MutableList<CordovaPlugin> = mutableListOf()

    private lateinit var deserializers: Deserializers
    private lateinit var actionFactory: ActionFactory
    private lateinit var actionsHandler: ActionsHandler

    private val coreCallbacks: CoreCallbackContainer = CoreCallbackContainer()
    private val captureContextHandler = DataCaptureContextHandler(this)
    private val captureViewHandler = DataCaptureViewHandler(this)

    private var lastFrameSourceState: FrameSourceState = FrameSourceState.OFF

    override fun pluginInitialize() {
        // Initialize plugins manually to make sure we have all mode deserializers before executing actions
        plugins.addAll(PLUGIN_NAMES.mapNotNull {
            webView.pluginManager.getPlugin(it)
        })

        deserializers = Deserializers(cordova.context, retrieveAllDeserializers(), this)
        actionFactory = CaptureCoreActionFactory(
                cordova.context, this, deserializers, captureContextHandler, captureViewHandler
        )
        actionsHandler = ActionsHandler(
                actionFactory, CameraPermissionsActionsHandlerHelper(actionFactory)
        )

        if (cordova.hasPermission(Manifest.permission.CAMERA)) {
            actionsHandler.onCameraPermissionGranted()
        } else {
            cordova.requestPermission(this, CODE_CAMERA_PERMISSIONS, Manifest.permission.CAMERA)
        }
    }

    override fun onStop() {
        lastFrameSourceState = captureContextHandler.camera?.desiredState ?: FrameSourceState.OFF
        captureContextHandler.camera?.switchToDesiredState(FrameSourceState.OFF)
    }

    override fun onStart() {
        captureContextHandler.camera?.switchToDesiredState(lastFrameSourceState)
    }

    override fun onReset() {
        captureContextHandler.disposeCurrent()
        captureViewHandler.disposeCurrent()
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
        plugins.filterIsInstance(CameraPermissionGrantedListener::class.java).forEach {
            it.onCameraPermissionGranted()
        }
    }

    private fun retrieveAllDeserializers(): List<DataCaptureModeDeserializer> {
        return plugins.filterIsInstance(ModeDeserializersProvider::class.java)
                .flatMap { it.provideModeDeserializers() }
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

    override fun onNoCameraError(callbackContext: CallbackContext) {
        NoCameraAvailableError().sendResult(callbackContext)
    }

    //region ActionInjectDefaults.ResultListener
    override fun onInjectDefaultsActionExecuted(
            default: JSONObject, callbackContext: CallbackContext
    ) {
        callbackContext.success(default)
    }
    //endregion

    //region ActionCreateContextAndView.ResultListener
    override fun onCreateContextAndViewActionExecuted(
            dataCaptureContext: DataCaptureContext,
            dataCaptureView: DataCaptureView,
            callbackContext: CallbackContext
    ) {
        captureContextHandler.attachDataCaptureContext(dataCaptureContext)
        captureViewHandler.attachDataCaptureView(dataCaptureView, cordova.activity)
        callbackContext.success()
    }

    override fun onCreateContextAndViewActionError(
            error: Throwable, callbackContext: CallbackContext
    ) {
        ContextDeserializationError(error.message).sendResult(callbackContext)
    }
    //endregion

    //region ActionUpdateContextAndView.ResultListener
    override fun onAdditionalActionRequired(
            actionName: String, args: JSONArray, callbackContext: CallbackContext
    ) {
        execute(actionName, args, callbackContext)
    }

    override fun onUpdateContextAndViewActionExecuted(
            dataCaptureContext: DataCaptureContext,
            dataCaptureView: DataCaptureView,
            callbackContext: CallbackContext
    ) {
        captureContextHandler.attachDataCaptureContext(dataCaptureContext)
        captureViewHandler.attachDataCaptureView(dataCaptureView, cordova.activity)
        callbackContext.success()
    }

    override fun onUpdateContextAndViewActionError(
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
    override fun onViewShowActionExecuted(callbackContext: CallbackContext) {
        captureViewHandler.setVisible()
        callbackContext.success()
    }
    //endregion

    //region ActionViewHide.ResultListener
    override fun onViewHideActionExecuted(callbackContext: CallbackContext) {
        captureViewHandler.setInvisible()
        callbackContext.success()
    }
    //endregion

    //region ActionViewResizeMove.ResultListener
    override fun onViewResizeAndMoveActionExecuted(
            info: ResizeAndMoveInfo, callbackContext: CallbackContext
    ) {
        captureViewHandler.setResizeAndMoveInfo(info)
        callbackContext.success()
    }
    //endregion

    //region ActionDisposeContext.ResultListener
    override fun onContextDisposeActionExecuted(callbackContext: CallbackContext) {
        captureContextHandler.disposeCurrent()
        callbackContext.success()
    }
    //endregion

    //region ActionSubscribeContext.ResultListener
    override fun onContextSubscribeActionExecuted(callbackContext: CallbackContext) {
        coreCallbacks.setContextCallback(
                DataCaptureContextCallback(actionsHandler, callbackContext)
        )
        callbackContext.sendPluginResult(// We notify the callback context to keep it alive.
                PluginResult(PluginResult.Status.OK).apply {
                    keepCallback = true
                }
        )
    }
    //endregion

    //region ActionSubscribeView.ResultListener
    override fun onViewSubscribeActionExecuted(callbackContext: CallbackContext) {
        coreCallbacks.setViewCallback(DataCaptureViewCallback(actionsHandler, callbackContext))
        callbackContext.sendPluginResult(// We notify the callback context to keep it alive
                PluginResult(PluginResult.Status.OK).apply {
                    keepCallback = true
                }
        )
    }
    //endregion

    //region ActionConvertPointCoordinates.ResultListener
    override fun onConvertPointCoordinatesActionExecuted(
            point: SerializablePoint, callbackContext: CallbackContext
    ) {
        callbackContext.success(point.toJson())
    }

    override fun onConvertPointCoordinatesNoViewError(callbackContext: CallbackContext) {
        NoViewToConvertPointError().sendResult(callbackContext)
    }
    //endregion

    //region ActionConvertQuadrilateralCoordinates.ResultListener
    override fun onConvertQuadrilateralCoordinatesActionExecuted(
            quadrilateral: Quadrilateral, callbackContext: CallbackContext
    ) {
        callbackContext.success(JSONObject(quadrilateral.toJson()))
    }

    override fun onConvertQuadrilateralCoordinatesNoViewError(callbackContext: CallbackContext) {
        NoViewToConvertQuadrilateralError().sendResult(callbackContext)
    }
    //endregion

    //region ActionGetCameraState.ResultListener
    override fun onGetCameraStateActionExecuted(
            cameraState: FrameSourceState, callbackContext: CallbackContext
    ) {
        callbackContext.success(cameraState.toJson())
    }
    //endregion

    //region ActionSendContextStatusUpdate.ResultListener
    override fun onContextStatusUpdateActionExecuted(
            message: JSONObject, callbackContext: CallbackContext
    ) {
        callbackContext.sendPluginResult(
                PluginResult(PluginResult.Status.OK, message).apply {
                    keepCallback = true
                }
        )
    }
    //endregion

    //region ActionSendViewSizeChanged.ResultListener
    override fun onViewSizeChangedActionExecuted(
            message: JSONObject, callbackContext: CallbackContext
    ) {
        callbackContext.sendPluginResult(
                PluginResult(PluginResult.Status.OK, message).apply {
                    keepCallback = true
                }
        )
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
        ActionSendContextStatusUpdate.ResultListener,
        ActionSendViewSizeChanged.ResultListener
