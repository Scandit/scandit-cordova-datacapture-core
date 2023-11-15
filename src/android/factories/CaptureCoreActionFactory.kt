/*
 * This file is part of the Scandit Data Capture SDK
 *
 * Copyright (C) 2019- Scandit AG. All rights reserved.
 */

package com.scandit.datacapture.cordova.core.factories

import com.scandit.datacapture.cordova.core.actions.*
import com.scandit.datacapture.cordova.core.errors.InvalidActionNameError
import com.scandit.datacapture.cordova.core.handlers.DataCaptureViewHandler
import com.scandit.datacapture.cordova.core.utils.CordovaEventEmitter
import com.scandit.datacapture.frameworks.core.CoreModule

class CaptureCoreActionFactory(
    private val coreModule: CoreModule,
    private val dataCaptureViewHandler: DataCaptureViewHandler,
    private val eventEmitter: CordovaEventEmitter
) : ActionFactory {

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
            ACTION_EMIT_FEEDBACK -> createActionEmitFeedback()
            GET_IS_TORCH_AVAILABLE -> createActionGetIsTorchAvailable()
            SUBSCRIBE_FRAME_SOURCE -> createSubscribeFrameSource()
            GET_LAST_FRAME -> createActionGetLastFrame()
            else -> throw InvalidActionNameError(actionName)
        }
    }

    override fun canBeRunWithoutCameraPermission(actionName: String): Boolean =
        actionName !in ACTIONS_REQUIRING_CAMERA

    private fun createActionInjectDefaults() = ActionInjectDefaults(coreModule)

    private fun createActionCreateContextAndView() =
        ActionCreateContextAndView(coreModule)

    private fun createActionUpdateContextAndView() = ActionUpdateContextAndView(
        coreModule
    )

    private fun createActionViewShow() = ActionViewShow(dataCaptureViewHandler)

    private fun createActionViewHide() = ActionViewHide(dataCaptureViewHandler)

    private fun createActionViewResizeMove() = ActionViewResizeMove(dataCaptureViewHandler)

    private fun createActionDisposeContext() = ActionDisposeContext(coreModule)

    private fun createActionSubscribeContext() = ActionSubscribeContext(coreModule, eventEmitter)

    private fun createActionSubscribeView() = ActionSubscribeView(coreModule, eventEmitter)

    private fun createActionConvertPointCoordinates() = ActionConvertPointCoordinates(
        coreModule
    )

    private fun createActionConvertQuadrilateralCoordinates() =
        ActionConvertQuadrilateralCoordinates(coreModule)

    private fun createActionGetCameraState() = ActionGetCameraState(
        coreModule
    )

    private fun createActionEmitFeedback() = ActionEmitFeedback(coreModule)

    private fun createActionGetIsTorchAvailable() = ActionGetIsTorchAvailable(
        coreModule
    )

    private fun createSubscribeFrameSource() = ActionSubscribeFrameSource(coreModule, eventEmitter)

    private fun createActionGetLastFrame() = ActionGetLastFrame()

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
        private const val GET_IS_TORCH_AVAILABLE = "getIsTorchAvailable"
        private const val SUBSCRIBE_FRAME_SOURCE = "subscribeFrameSourceListener"

        const val GET_LAST_FRAME = "getLastFrame"

        private val ACTIONS_REQUIRING_CAMERA =
            setOf(CREATE_CONTEXT, UPDATE_CONTEXT, VIEW_SHOW, VIEW_HIDE)
    }
}
