"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/// <amd-module name="scandit-cordova-datacapture-core.DataCaptureContextProxy"/>
// ^ needed because Cordova can't resolve "../xx" style dependencies
const DataCaptureContext_Related_1 = require("scandit-cordova-datacapture-core.DataCaptureContext+Related");
const Cordova_1 = require("scandit-cordova-datacapture-core.Cordova");
var DataCaptureContextListenerEvent;
(function (DataCaptureContextListenerEvent) {
    DataCaptureContextListenerEvent["DidChangeContextStatus"] = "didChangeStatus";
    DataCaptureContextListenerEvent["DidStartObservingContext"] = "didStartObservingContext";
})(DataCaptureContextListenerEvent || (DataCaptureContextListenerEvent = {}));
// TODO: adjust when readding framedata to the api https://jira.scandit.com/browse/SDC-1159
// enum DataCaptureContextFrameListenerEvent {
//   WillProcessFrame = 'willProcessFrame',
//   DidProcessFrame = 'didProcessFrame',
// }
class DataCaptureContextProxy {
    static forDataCaptureContext(context) {
        const contextProxy = new DataCaptureContextProxy();
        contextProxy.context = context;
        contextProxy.initialize();
        return contextProxy;
    }
    updateContextFromJSON() {
        return new Promise((resolve, reject) => {
            DataCaptureContextProxy.cordovaExec(resolve.bind(this), reject.bind(this), Cordova_1.CordovaFunction.UpdateContextFromJSON, [this.context.toJSON()]);
        });
    }
    dispose() {
        DataCaptureContextProxy.cordovaExec(null, null, Cordova_1.CordovaFunction.DisposeContext, null);
    }
    initialize() {
        this.subscribeListener();
        // TODO: adjust when readding framedata to the api https://jira.scandit.com/browse/SDC-1159
        // this.subscribeFrameListener();
        this.initializeContextFromJSON();
    }
    initializeContextFromJSON() {
        return new Promise((resolve, reject) => {
            DataCaptureContextProxy.cordovaExec(resolve.bind(this), reject.bind(this), Cordova_1.CordovaFunction.ContextFromJSON, [this.context.toJSON()]);
        });
    }
    subscribeListener() {
        DataCaptureContextProxy.cordovaExec(this.notifyListeners.bind(this), null, Cordova_1.CordovaFunction.SubscribeContextListener, null);
    }
    // TODO: adjust when readding framedata to the api https://jira.scandit.com/browse/SDC-1159
    // private subscribeFrameListener() {
    //   DataCaptureContextProxy.cordovaExec(
    //     this.notifyFrameListeners.bind(this),
    //     null,
    //     CordovaFunction.SubscribeContextFrameListener,
    //     null,
    //   );
    // }
    notifyListeners(event) {
        if (!event) {
            // The event could be undefined/null in case the plugin result did not pass a "message",
            // which could happen e.g. in case of "ok" results, which could signal e.g. successful
            // listener subscriptions.
            return;
        }
        this.context.listeners.forEach((listener) => {
            switch (event.name) {
                case DataCaptureContextListenerEvent.DidChangeContextStatus:
                    if (listener.didChangeStatus) {
                        const contextStatus = DataCaptureContext_Related_1.ContextStatus.fromJSON(event.argument);
                        listener.didChangeStatus(this.context, contextStatus);
                    }
                    break;
                case DataCaptureContextListenerEvent.DidStartObservingContext:
                    if (listener.didStartObservingContext) {
                        listener.didStartObservingContext(this.context);
                    }
                    break;
            }
        });
    }
}
exports.DataCaptureContextProxy = DataCaptureContextProxy;
DataCaptureContextProxy.cordovaExec = Cordova_1.Cordova.exec;
