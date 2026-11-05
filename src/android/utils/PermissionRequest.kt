package com.scandit.datacapture.cordova.core.utils

import android.Manifest
import org.apache.cordova.CordovaPlugin

class PermissionRequest {
    fun checkCameraPermission(plugin: CordovaPlugin): Boolean =
        plugin.cordova.hasPermission(Manifest.permission.CAMERA)

    /**
     * Returns true when a permission request was issued, so the caller knows a result is
     * coming. False means the permission was already granted and nothing will call back.
     */
    fun checkOrRequestCameraPermission(plugin: CordovaPlugin): Boolean {
        if (checkCameraPermission(plugin)) return false

        plugin.cordova.requestPermission(
            plugin,
            CODE_CAMERA_PERMISSIONS,
            Manifest.permission.CAMERA
        )
        return true
    }

    companion object {
        const val CODE_CAMERA_PERMISSIONS = 200

        private val instance: PermissionRequest = PermissionRequest()

        @JvmStatic
        fun getInstance(): PermissionRequest = instance
    }
}
