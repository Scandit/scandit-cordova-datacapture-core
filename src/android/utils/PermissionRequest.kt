package com.scandit.datacapture.cordova.core.utils

import android.Manifest
import org.apache.cordova.CordovaPlugin

class PermissionRequest {
    fun checkCameraPermission(plugin: CordovaPlugin): Boolean {
        return plugin.cordova.hasPermission(Manifest.permission.CAMERA)
    }

    fun checkOrRequestCameraPermission(plugin: CordovaPlugin) {
        if (checkCameraPermission(plugin).not()) {
            plugin.cordova.requestPermission(
                plugin,
                CODE_CAMERA_PERMISSIONS,
                Manifest.permission.CAMERA
            )
        }
    }

    companion object {
        const val CODE_CAMERA_PERMISSIONS = 200

        private val instance: PermissionRequest = PermissionRequest()

        @JvmStatic
        fun getInstance(): PermissionRequest = instance
    }
}
