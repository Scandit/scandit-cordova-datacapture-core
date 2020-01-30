/*
 * This file is part of the Scandit Data Capture SDK
 *
 * Copyright (C) 2019- Scandit AG. All rights reserved.
 */

package com.scandit.datacapture.cordova.core.actions

import com.scandit.datacapture.core.capture.DataCaptureContext
import com.scandit.datacapture.core.capture.serialization.DataCaptureContextDeserializer
import com.scandit.datacapture.core.json.JsonValue
import com.scandit.datacapture.core.ui.DataCaptureView
import org.apache.cordova.CallbackContext
import org.json.JSONArray
import org.json.JSONException
import java.lang.RuntimeException

class ActionUpdateContextAndView(
        private val dataCaptureContextDeserializer: DataCaptureContextDeserializer,
        private val dataCaptureContext: DataCaptureContext?,
        private val dataCaptureView: DataCaptureView?,
        private val actionNameCreateContextAndView: String,
        private val listener: ResultListener
) : Action {

    override fun run(args: JSONArray, callbackContext: CallbackContext): Boolean {
        try {
            if (dataCaptureContext == null) {
                listener.onAdditionalActionRequired(
                        actionNameCreateContextAndView, args, callbackContext
                )
            } else {
                val jsonString = args.getJSONObject(0).toString()
                val deserializationResult = dataCaptureContextDeserializer.updateContextFromJson(
                        dataCaptureContext, dataCaptureView, jsonString
                )
                val view = deserializationResult.view
                val dataCaptureContext = deserializationResult.dataCaptureContext

                listener.onUpdateContextAndViewActionExecuted(
                        dataCaptureContext, view, callbackContext
                )
            }
        } catch (e: JSONException) {
            e.printStackTrace()
            listener.onJsonParseError(e, callbackContext)
        } catch (e: RuntimeException) {// TODO SDC-1851 fine-catch deserializer exceptions
            e.printStackTrace()
            listener.onJsonParseError(e, callbackContext)
        } catch (e: Exception) {
            e.printStackTrace()
            listener.onUpdateContextAndViewActionError(e, callbackContext)
        }
        return true
    }

    interface ResultListener {
        fun onAdditionalActionRequired(
                actionName: String,
                args: JSONArray,
                callbackContext: CallbackContext
        )
        fun onUpdateContextAndViewActionExecuted(
                dataCaptureContext: DataCaptureContext,
                dataCaptureView: DataCaptureView,
                callbackContext: CallbackContext
        )
        fun onUpdateContextAndViewActionError(error: Throwable, callbackContext: CallbackContext)
        fun onJsonParseError(error: Throwable, callbackContext: CallbackContext)
    }
}