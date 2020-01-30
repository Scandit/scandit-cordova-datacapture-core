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

class ActionCreateContextAndView(
        private val dataCaptureContextDeserializer: DataCaptureContextDeserializer,
        private val listener: ResultListener
) : Action {

    override fun run(args: JSONArray, callbackContext: CallbackContext): Boolean {
        try {
            val jsonString = args.getJSONObject(0).toString()
            val deserializationResult = dataCaptureContextDeserializer.contextFromJson(
                    jsonString
            )
            val view = deserializationResult.view
            val dataCaptureContext = deserializationResult.dataCaptureContext

            listener.onCreateContextAndViewActionExecuted(dataCaptureContext, view, callbackContext)
        } catch (e: JSONException) {
            e.printStackTrace()
            listener.onJsonParseError(e, callbackContext)
        } catch (e: RuntimeException) {// TODO SDC-1851 fine-catch deserializer exceptions
            e.printStackTrace()
            listener.onJsonParseError(e, callbackContext)
        } catch (e: Exception) {
            e.printStackTrace()
            listener.onCreateContextAndViewActionError(e, callbackContext)
        }
        return true
    }

    interface ResultListener {
        fun onCreateContextAndViewActionExecuted(
                dataCaptureContext: DataCaptureContext,
                dataCaptureView: DataCaptureView,
                callbackContext: CallbackContext
        )
        fun onCreateContextAndViewActionError(error: Throwable, callbackContext: CallbackContext)
        fun onJsonParseError(error: Throwable, callbackContext: CallbackContext)
    }
}
