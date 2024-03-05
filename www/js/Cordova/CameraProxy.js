"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CameraProxy = void 0;
const Camera_Related_1 = require("scandit-cordova-datacapture-core.Camera+Related");
const Cordova_1 = require("scandit-cordova-datacapture-core.Cordova");
var FrameSourceListenerEvent;
(function (FrameSourceListenerEvent) {
    FrameSourceListenerEvent["didChangeState"] = "FrameSourceListener.onStateChanged";
})(FrameSourceListenerEvent || (FrameSourceListenerEvent = {}));
class CameraProxy {
    static forCamera(camera) {
        const proxy = new CameraProxy();
        proxy.camera = camera;
        proxy.initialize();
        return proxy;
    }
    static getLastFrame() {
        return new Promise((resolve, reject) => {
            CameraProxy.cordovaExec((frameDataJSONString) => resolve(Camera_Related_1.PrivateFrameData.fromJSON(JSON.parse(frameDataJSONString))), reject, Cordova_1.CordovaFunction.GetLastFrame, null);
        });
    }
    static getLastFrameOrNull() {
        return new Promise((resolve, reject) => {
            CameraProxy.cordovaExec((frameDataJSONString) => {
                if (!frameDataJSONString) {
                    return resolve(null);
                }
                resolve(Camera_Related_1.PrivateFrameData.fromJSON(JSON.parse(frameDataJSONString)));
            }, reject, Cordova_1.CordovaFunction.GetLastFrameOrNull, null);
        });
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
    initialize() {
        this.subscribeListener();
    }
    subscribeListener() {
        CameraProxy.cordovaExec(this.notifyListeners.bind(this), null, Cordova_1.CordovaFunction.SubscribeFrameSourceListener, null);
    }
    notifyListeners(event) {
        if (!event) {
            // The event could be undefined/null in case the plugin result did not pass a "message",
            // which could happen e.g. in case of "ok" results, which could signal e.g. successful
            // listener subscriptions.
            return;
        }
        this.camera.listeners.forEach((listener) => {
            switch (event.name) {
                case FrameSourceListenerEvent.didChangeState:
                    if (listener.didChangeState) {
                        listener.didChangeState(this.camera, event.argument.newState);
                    }
                    break;
            }
        });
    }
}
exports.CameraProxy = CameraProxy;
CameraProxy.cordovaExec = Cordova_1.Cordova.exec;
