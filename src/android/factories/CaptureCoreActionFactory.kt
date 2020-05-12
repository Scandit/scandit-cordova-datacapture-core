/*
 * This file is part of the Scandit Data Capture SDK
 *
 * Copyright (C) 2019- Scandit AG. All rights reserved.
 */

package com.scandit.datacapture.cordova.core.factories

import android.content.Context
import com.scandit.datacapture.cordova.core.CoreActionsListeners
import com.scandit.datacapture.cordova.core.deserializers.DeserializersProvider
import com.scandit.datacapture.cordova.core.actions.*
import com.scandit.datacapture.cordova.core.errors.InvalidActionNameError
import com.scandit.datacapture.cordova.core.handlers.DataCaptureComponentsHandler
import com.scandit.datacapture.cordova.core.handlers.DataCaptureContextHandler
import com.scandit.datacapture.cordova.core.handlers.DataCaptureViewHandler
import com.scandit.datacapture.cordova.core.workers.Worker

class CaptureCoreActionFactory(
    private val context: Context,
    private val listener: CoreActionsListeners,
    private val deserializersProvider: DeserializersProvider,
    private val captureContextHandler: DataCaptureContextHandler,
    private val captureComponenentsHandler: DataCaptureComponentsHandler,
    private val captureViewHandler: DataCaptureViewHandler,
    private val uiWorker: Worker
) : ActionFactory {

    override val actionsNotDependentOnCameraPermission = ACTIONS_NOT_DEPENDING_ON_CAMERA

    @Throws(InvalidActionNameError::class)
    override fun provideAction(actionName: String): Action {
        return when (actionName) {
            INJECT_DEFAULTS -> createActionInjectDefaults()
            CREATE_CONTEXT -> createActionCreateContextAndView()
            UPDATE_CONTEXT -> createActionUpdateContextAndView()
            VIEW_SHOW -> createActionViewShow()
            VIEW_HIDE -> createActionViewHide()
            VIEW_RESIZE_MOVE -> createActionViewResizeMove()
            DISPOSE_CONTEXT -> createActionDisposeContext()
            SUBSCRIBE_CONTEXT -> createActionSubscribeContext()
            SUBSCRIBE_VIEW -> createActionSubscribeView()
            CONVERT_POINT_COORDINATES -> createActionConvertPointCoordinates()
            CONVERT_QUAD_COORDINATES -> createActionConvertQuadrilateralCoordinates()
            GET_CAMERA_STATE -> createActionGetCameraState()
            SEND_CONTEXT_STATUS_UPDATE_EVENT -> createActionContextStatusUpdate()
            SEND_CONTEXT_OBSERVATION_STARTED_EVENT -> createActionContextObservationStarted()
            SEND_VIEW_SIZE_CHANGED_EVENT -> createActionViewSizeChanged()
            ACTION_EMIT_FEEDBACK -> createActionEmitFeedback()
            else -> throw InvalidActionNameError(actionName)
        }
    }

    private fun createActionInjectDefaults() = ActionInjectDefaults(context, listener)

    private fun createActionCreateContextAndView() = ActionCreateContextAndView(
        deserializersProvider.deserializers.dataCaptureContextDeserializer, listener
    )

    private fun createActionUpdateContextAndView() = ActionUpdateContextAndView(
        deserializersProvider.deserializers.dataCaptureContextDeserializer,
        captureContextHandler.dataCaptureContext,
        captureViewHandler.dataCaptureView,
        captureComponenentsHandler.dataCaptureComponents,
        CREATE_CONTEXT,
        listener,
        uiWorker
    )

    private fun createActionViewShow() = ActionViewShow(listener)

    private fun createActionViewHide() = ActionViewHide(listener)

    private fun createActionViewResizeMove() = ActionViewResizeMove(listener)

    private fun createActionDisposeContext() = ActionDisposeContext(listener)

    private fun createActionSubscribeContext() = ActionSubscribeContext(listener)

    private fun createActionSubscribeView() = ActionSubscribeView(listener)

    private fun createActionConvertPointCoordinates() = ActionConvertPointCoordinates(
        captureViewHandler.dataCaptureView, listener
    )

    private fun createActionConvertQuadrilateralCoordinates() =
        ActionConvertQuadrilateralCoordinates(captureViewHandler.dataCaptureView, listener)

    private fun createActionGetCameraState() = ActionGetCameraState(
        captureContextHandler.camera, listener
    )

    private fun createActionContextStatusUpdate() = ActionSend(ACTION_STATUS_CHANGED, listener)

    private fun createActionContextObservationStarted() =
        ActionSend(ACTION_CONTEXT_OBSERVATION_STARTED, listener)

    private fun createActionViewSizeChanged() = ActionSend(ACTION_VIEW_SIZE_CHANGED, listener)

    private fun createActionEmitFeedback() = ActionEmitFeedback(listener)

    companion object {
        private const val INJECT_DEFAULTS = "getDefaults"
        private const val CREATE_CONTEXT = "contextFromJSON"
        private const val UPDATE_CONTEXT = "updateContextFromJSON"
        private const val VIEW_SHOW = "showView"
        private const val VIEW_HIDE = "hideView"
        private const val VIEW_RESIZE_MOVE = "setViewPositionAndSize"
        private const val DISPOSE_CONTEXT = "disposeContext"
        private const val SUBSCRIBE_CONTEXT = "subscribeContextListener"
        private const val SUBSCRIBE_VIEW = "subscribeViewListener"
        private const val CONVERT_POINT_COORDINATES = "viewPointForFramePoint"
        private const val CONVERT_QUAD_COORDINATES = "viewQuadrilateralForFrameQuadrilateral"
        private const val GET_CAMERA_STATE = "getCurrentCameraState"
        private const val ACTION_EMIT_FEEDBACK = "emitFeedback"

        const val SEND_CONTEXT_STATUS_UPDATE_EVENT = "sendContextStatusUpdateEvent"
        const val SEND_CONTEXT_OBSERVATION_STARTED_EVENT = "sendContextObservationStartedEvent"
        const val SEND_VIEW_SIZE_CHANGED_EVENT = "sendViewSizeChangedEvent"

        const val ACTION_STATUS_CHANGED = "didChangeStatus"
        const val ACTION_CONTEXT_OBSERVATION_STARTED = "didStartObservingContext"
        const val ACTION_VIEW_SIZE_CHANGED = "didChangeSizeOrientation"

        private val ACTIONS_NOT_DEPENDING_ON_CAMERA = setOf(
            INJECT_DEFAULTS, SEND_CONTEXT_STATUS_UPDATE_EVENT
        )
    }
}
