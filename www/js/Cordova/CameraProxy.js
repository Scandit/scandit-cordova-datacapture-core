"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Cordova_1 = require("scandit-cordova-datacapture-core.Cordova");
class CameraProxy {
    static forCamera(camera) {
        const proxy = new CameraProxy();
        proxy.camera = camera;
        return proxy;
    }
    getCurrentState() {
        return new Promise((resolve, reject) => {
            CameraProxy.cordovaExec(resolve, reject, Cordova_1.CordovaFunction.GetCurrentCameraState, null);
        });
    }
    getIsTorchAvailable() {
        return new Promise((resolve, reject) => {
            CameraProxy.cordovaExec(resolve, reject, Cordova_1.CordovaFunction.GetIsTorchAvailable, [this.camera.position]);
        });
    }
}
exports.CameraProxy = CameraProxy;
CameraProxy.cordovaExec = Cordova_1.Cordova.exec;
