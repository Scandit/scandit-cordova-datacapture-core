var core = require('scandit-cordova-datacapture-core.Core');

/******************************************************************************
Copyright (c) Microsoft Corporation.

Permission to use, copy, modify, and/or distribute this software for any
purpose with or without fee is hereby granted.

THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH
REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY
AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT,
INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM
LOSS OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE OR
OTHER TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR
PERFORMANCE OF THIS SOFTWARE.
***************************************************************************** */
/* global Reflect, Promise, SuppressedError, Symbol */


function __decorate(decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
}

function __awaiter(thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
}

typeof SuppressedError === "function" ? SuppressedError : function (error, suppressed, message) {
    var e = new Error(message);
    return e.name = "SuppressedError", e.error = error, e.suppressed = suppressed, e;
};

/* eslint-disable @typescript-eslint/no-var-requires */
const exec = require('cordova/exec');
const channel = require('cordova/channel');
const cordovaPluginsData = require('cordova/plugin_list');
/* eslint-enable @typescript-eslint/no-var-requires */
const pluginMap = new Map();
let didCoreFire = false;
const corePluginName = 'ScanditCaptureCore';
class CordovaError {
    static fromJSON(json) {
        if (json && json.code && json.message) {
            return new CordovaError(json.code, json.message);
        }
        else {
            return null;
        }
    }
    constructor(code, message) {
        this.code = code;
        this.message = message;
    }
}
const pluginsMetadata = cordovaPluginsData.metadata;
const cordovaExec = (successCallback, errorCallback, className, functionName, args) => {
    if (window.Scandit && window.Scandit.DEBUG) {
        // tslint:disable-next-line:no-console
        console.log(`Called native function: ${functionName}`, args, { success: successCallback, error: errorCallback });
    }
    const extendedSuccessCallback = (message) => {
        const shouldCallback = message && message.shouldNotifyWhenFinished;
        const finishCallbackID = shouldCallback ? message.finishCallbackID : null;
        const started = Date.now();
        let callbackResult;
        if (successCallback) {
            callbackResult = successCallback(message);
        }
        if (shouldCallback) {
            const maxCallbackDuration = 50;
            const callbackDuration = Date.now() - started;
            if (callbackDuration > maxCallbackDuration) {
                // tslint:disable-next-line:no-console
                console.log(`[SCANDIT WARNING] Took ${callbackDuration}ms to execute callback that's blocking native execution. You should keep this duration short, for more information, take a look at the documentation.`);
            }
            exec(null, null, className, 'finishCallback', [{
                    finishCallbackID,
                    result: callbackResult,
                }]);
        }
    };
    const extendedErrorCallback = (error) => {
        if (errorCallback) {
            const cordovaError = CordovaError.fromJSON(error);
            if (cordovaError !== null) {
                error = cordovaError;
            }
            errorCallback(error);
        }
    };
    exec(extendedSuccessCallback, extendedErrorCallback, className, functionName, args);
};
function initializePlugin(pluginName, customInitialization) {
    return __awaiter(this, void 0, void 0, function* () {
        const readyEventName = `on${pluginName}Ready`;
        channel.createSticky(readyEventName);
        channel.waitForInitialization(readyEventName);
        const firePluginEvent = (eventName, init) => __awaiter(this, void 0, void 0, function* () {
            yield init();
            channel[eventName].fire();
        });
        if (pluginName === corePluginName) {
            yield customInitialization();
            channel[readyEventName].fire();
            didCoreFire = true;
            [...pluginMap.entries()].forEach(([eventName, init]) => {
                firePluginEvent(eventName, init);
                pluginMap.delete(eventName);
            });
        }
        else if (didCoreFire) {
            firePluginEvent(readyEventName, customInitialization);
        }
        else {
            pluginMap.set(readyEventName, customInitialization);
        }
    });
}

class NativeCameraProxy extends core.BaseNativeProxy {
    static get cordovaExec() {
        return Cordova.exec;
    }
    getLastFrame() {
        return new Promise((resolve, reject) => {
            NativeCameraProxy.cordovaExec((frameDataJSONString) => resolve(frameDataJSONString), reject, CordovaFunction.GetLastFrame, null);
        });
    }
    getLastFrameOrNull() {
        return new Promise((resolve, reject) => {
            NativeCameraProxy.cordovaExec((frameDataJSONString) => {
                resolve(frameDataJSONString);
            }, reject, CordovaFunction.GetLastFrameOrNull, null);
        });
    }
    getCurrentCameraState(_position) {
        return new Promise((resolve, reject) => {
            NativeCameraProxy.cordovaExec(resolve, reject, CordovaFunction.GetCurrentCameraState, null);
        });
    }
    isTorchAvailable(position) {
        return new Promise((resolve, reject) => {
            NativeCameraProxy.cordovaExec(resolve, reject, CordovaFunction.GetIsTorchAvailable, [position]);
        });
    }
    switchCameraToDesiredState(desiredStateJson) {
        return new Promise((resolve, reject) => {
            NativeCameraProxy.cordovaExec(resolve, reject, CordovaFunction.SwitchCameraToDesiredState, [desiredStateJson]);
        });
    }
    registerListenerForCameraEvents() {
        NativeCameraProxy.cordovaExec(this.notifyListeners.bind(this), null, CordovaFunction.SubscribeFrameSourceListener, null);
    }
    unregisterListenerForCameraEvents() {
        return new Promise((resolve, reject) => {
            NativeCameraProxy.cordovaExec(resolve, reject, CordovaFunction.UnsubscribeFrameSourceListener, null);
        });
    }
    notifyListeners(event) {
        if (!event) {
            // The event could be undefined/null in case the plugin result did not pass a "message",
            // which could happen e.g. in case of "ok" results, which could signal e.g. successful
            // listener subscriptions.
            return;
        }
        switch (event.name) {
            case core.FrameSourceListenerEvents.didChangeState:
                this.eventEmitter.emit(core.FrameSourceListenerEvents.didChangeState, event.state);
                break;
        }
    }
}

class NativeDataCaptureContextProxy extends core.BaseNativeProxy {
    static get cordovaExec() {
        return Cordova.exec;
    }
    get framework() {
        return 'cordova';
    }
    get frameworkVersion() {
        return (window.cordova && window.cordova.version) || undefined;
    }
    contextFromJSON(context) {
        return new Promise((resolve, reject) => {
            NativeDataCaptureContextProxy.cordovaExec(resolve.bind(this), reject.bind(this), CordovaFunction.ContextFromJSON, [context.toJSON()]);
        });
    }
    updateContextFromJSON(context) {
        return new Promise((resolve, reject) => {
            NativeDataCaptureContextProxy.cordovaExec(resolve.bind(this), reject.bind(this), CordovaFunction.UpdateContextFromJSON, [context.toJSON()]);
        });
    }
    dispose() {
        NativeDataCaptureContextProxy.cordovaExec(null, null, CordovaFunction.DisposeContext, null);
    }
    registerListenerForDataCaptureContext() {
        NativeDataCaptureContextProxy.cordovaExec(this.notifyListeners.bind(this), null, CordovaFunction.SubscribeContextListener, null);
    }
    addModeToContext(modeJson) {
        return new Promise((resolve, reject) => {
            NativeDataCaptureContextProxy.cordovaExec(resolve, reject, CordovaFunction.AddModeToContext, [modeJson]);
        });
    }
    removeModeFromContext(modeJson) {
        return new Promise((resolve, reject) => {
            NativeDataCaptureContextProxy.cordovaExec(resolve, reject, CordovaFunction.RemoveModeFromContext, [modeJson]);
        });
    }
    removeAllModesFromContext() {
        return new Promise((resolve, reject) => {
            NativeDataCaptureContextProxy.cordovaExec(resolve, reject, CordovaFunction.RemoveAllModesFromContext, null);
        });
    }
    unregisterListenerForDataCaptureContext() {
        return new Promise((resolve, reject) => {
            NativeDataCaptureContextProxy.cordovaExec(resolve, reject, CordovaFunction.UnsubscribeContextListener, null);
        });
    }
    notifyListeners(event) {
        if (!event) {
            // The event could be undefined/null in case the plugin result did not pass a "message",
            // which could happen e.g. in case of "ok" results, which could signal e.g. successful
            // listener subscriptions.
            return;
        }
        switch (event.name) {
            case core.DataCaptureContextEvents.didChangeStatus:
                const contextStatus = core.ContextStatus.fromJSON(event.argument);
                this.eventEmitter.emit(core.DataCaptureContextEvents.didChangeStatus, contextStatus);
                break;
            case core.DataCaptureContextEvents.didStartObservingContext:
                this.eventEmitter.emit(core.DataCaptureContextEvents.didStartObservingContext);
                break;
        }
    }
}

class NativeFeedbackProxy extends core.BaseNativeProxy {
    static get cordovaExec() {
        return Cordova.exec;
    }
    emitFeedback(feedback) {
        return new Promise((resolve, reject) => {
            NativeFeedbackProxy.cordovaExec(resolve, reject, CordovaFunction.EmitFeedback, [feedback.toJSON()]);
        });
    }
}

class NativeDataCaptureViewProxy extends core.BaseNativeProxy {
    viewPointForFramePoint(pointJson) {
        return new Promise((resolve, reject) => {
            NativeDataCaptureViewProxy.cordovaExec((convertedPoint) => resolve(convertedPoint), reject, CordovaFunction.ViewPointForFramePoint, [pointJson]);
        });
    }
    viewQuadrilateralForFrameQuadrilateral(quadrilateralJson) {
        return new Promise((resolve, reject) => {
            NativeDataCaptureViewProxy.cordovaExec((convertedQuadrilateral) => resolve(convertedQuadrilateral), reject, CordovaFunction.ViewQuadrilateralForFrameQuadrilateral, [quadrilateralJson]);
        });
    }
    registerListenerForViewEvents() {
        NativeDataCaptureViewProxy.cordovaExec(this.notifyListeners.bind(this), null, CordovaFunction.SubscribeViewListener, null);
    }
    unregisterListenerForViewEvents() {
        NativeDataCaptureViewProxy.cordovaExec(null, null, CordovaFunction.UnsubscribeViewListener, null);
    }
    setPositionAndSize(top, left, width, height, shouldBeUnderWebView) {
        return new Promise((resolve, reject) => {
            NativeDataCaptureViewProxy.cordovaExec(resolve, reject, CordovaFunction.SetViewPositionAndSize, [{ top, left, width, height, shouldBeUnderWebView }]);
        });
    }
    show() {
        return new Promise((resolve, reject) => {
            NativeDataCaptureViewProxy.cordovaExec(resolve, reject, CordovaFunction.ShowView, null);
        });
    }
    hide() {
        return new Promise((resolve, reject) => {
            NativeDataCaptureViewProxy.cordovaExec(resolve, reject, CordovaFunction.HideView, null);
        });
    }
    createView(viewJson) {
        return new Promise((resolve, reject) => {
            NativeDataCaptureViewProxy.cordovaExec(resolve, reject, CordovaFunction.CreateDataCaptureView, [viewJson]);
        });
    }
    updateView(viewJson) {
        return new Promise((resolve, reject) => {
            NativeDataCaptureViewProxy.cordovaExec(resolve, reject, CordovaFunction.UpdateDataCaptureView, [viewJson]);
        });
    }
    removeView() {
        return new Promise((resolve, reject) => {
            NativeDataCaptureViewProxy.cordovaExec(resolve, reject, CordovaFunction.RemoveDataCaptureView, null);
        });
    }
    static get cordovaExec() {
        return Cordova.exec;
    }
    notifyListeners(event) {
        if (!event) {
            // The event could be undefined/null in case the plugin result did not pass a "message",
            // which could happen e.g. in case of "ok" results, which could signal e.g. successful
            // listener subscriptions.
            return;
        }
        switch (event.name) {
            case core.DataCaptureViewEvents.didChangeSize:
                this.eventEmitter.emit(core.DataCaptureViewEvents.didChangeSize, JSON.stringify(event.argument));
                break;
        }
    }
}

class NativeImageFrameSourceProxy extends core.BaseNativeProxy {
    static get cordovaExec() {
        return Cordova.exec;
    }
    getCurrentCameraState(_position) {
        return new Promise((resolve, reject) => {
            NativeImageFrameSourceProxy.cordovaExec(resolve, reject, CordovaFunction.GetCurrentCameraState, null);
        });
    }
    switchCameraToDesiredState(desiredStateJson) {
        return new Promise((resolve, reject) => {
            NativeImageFrameSourceProxy.cordovaExec(resolve, reject, CordovaFunction.SwitchCameraToDesiredState, [desiredStateJson]);
        });
    }
    registerListenerForEvents() {
        NativeImageFrameSourceProxy.cordovaExec(this.notifyListeners.bind(this), null, CordovaFunction.SubscribeFrameSourceListener, null);
    }
    unregisterListenerForEvents() {
        return new Promise((resolve, reject) => {
            NativeImageFrameSourceProxy.cordovaExec(resolve, reject, CordovaFunction.UnsubscribeFrameSourceListener, null);
        });
    }
    notifyListeners(event) {
        if (!event) {
            // The event could be undefined/null in case the plugin result did not pass a "message",
            // which could happen e.g. in case of "ok" results, which could signal e.g. successful
            // listener subscriptions.
            return;
        }
        switch (event.name) {
            case core.FrameSourceListenerEvents.didChangeState:
                this.eventEmitter.emit(core.FrameSourceListenerEvents.didChangeState, event.argument.state);
                break;
        }
    }
}

function initCoreProxy() {
    core.FactoryMaker.bindInstance('DataCaptureContextProxy', new NativeDataCaptureContextProxy());
    core.FactoryMaker.bindInstance('FeedbackProxy', new NativeFeedbackProxy());
    core.FactoryMaker.bindInstance('ImageFrameSourceProxy', new NativeImageFrameSourceProxy());
    core.FactoryMaker.bindInstance('DataCaptureViewProxy', new NativeDataCaptureViewProxy());
    core.FactoryMaker.bindInstance('CameraProxy', new NativeCameraProxy());
}

var CordovaFunction;
(function (CordovaFunction) {
    CordovaFunction["GetDefaults"] = "getDefaults";
    CordovaFunction["ContextFromJSON"] = "contextFromJSON";
    CordovaFunction["DisposeContext"] = "disposeContext";
    CordovaFunction["UpdateContextFromJSON"] = "updateContextFromJSON";
    CordovaFunction["SubscribeContextListener"] = "subscribeContextListener";
    CordovaFunction["UnsubscribeContextListener"] = "unsubscribeContextListener";
    CordovaFunction["SubscribeFrameSourceListener"] = "subscribeFrameSourceListener";
    CordovaFunction["UnsubscribeFrameSourceListener"] = "unsubscribeFrameSourceListener";
    CordovaFunction["SetViewPositionAndSize"] = "setViewPositionAndSize";
    CordovaFunction["ShowView"] = "showView";
    CordovaFunction["HideView"] = "hideView";
    CordovaFunction["ViewPointForFramePoint"] = "viewPointForFramePoint";
    CordovaFunction["ViewQuadrilateralForFrameQuadrilateral"] = "viewQuadrilateralForFrameQuadrilateral";
    CordovaFunction["SubscribeViewListener"] = "subscribeViewListener";
    CordovaFunction["UnsubscribeViewListener"] = "unsubscribeViewListener";
    CordovaFunction["GetCurrentCameraState"] = "getCurrentCameraState";
    CordovaFunction["GetIsTorchAvailable"] = "getIsTorchAvailable";
    CordovaFunction["SwitchCameraToDesiredState"] = "switchCameraToDesiredState";
    CordovaFunction["GetLastFrame"] = "getLastFrame";
    CordovaFunction["GetLastFrameOrNull"] = "getLastFrameOrNull";
    CordovaFunction["EmitFeedback"] = "emitFeedback";
    CordovaFunction["SubscribeVolumeButtonObserver"] = "subscribeVolumeButtonObserver";
    CordovaFunction["UnsubscribeVolumeButtonObserver"] = "unsubscribeVolumeButtonObserver";
    CordovaFunction["AddModeToContext"] = "addModeToContext";
    CordovaFunction["RemoveModeFromContext"] = "removeModeFromContext";
    CordovaFunction["RemoveAllModesFromContext"] = "removeAllModesFromContext";
    CordovaFunction["CreateDataCaptureView"] = "createDataCaptureView";
    CordovaFunction["UpdateDataCaptureView"] = "updateDataCaptureView";
    CordovaFunction["RemoveDataCaptureView"] = "removeDataCaptureView";
})(CordovaFunction || (CordovaFunction = {}));
// tslint:disable-next-line:variable-name
const Cordova = {
    pluginName: 'ScanditCaptureCore',
    defaults: {},
    exec: (success, error, functionName, args) => cordovaExec(success, error, Cordova.pluginName, functionName, args),
};
function getDefaults() {
    initCoreProxy();
    return new Promise((resolve, reject) => {
        Cordova.exec((defaultsJSON) => {
            core.loadCoreDefaults(defaultsJSON);
            resolve();
        }, reject, CordovaFunction.GetDefaults, null);
    });
}
function initializeCordovaCore() {
    initializePlugin(Cordova.pluginName, getDefaults);
}

class DataCaptureVersion {
    static get pluginVersion() {
        return pluginsMetadata['scandit-cordova-datacapture-core'];
    }
}

class HTMLElementState {
    constructor() {
        this.isShown = false;
        this.position = null;
        this.size = null;
        this.shouldBeUnderContent = false;
    }
    get isValid() {
        return this.isShown !== undefined && this.isShown !== null
            && this.position !== undefined && this.position !== null
            && this.size !== undefined && this.size !== null
            && this.shouldBeUnderContent !== undefined && this.shouldBeUnderContent !== null;
    }
    didChangeComparedTo(other) {
        return this.position !== other.position
            || this.size !== other.size
            || this.shouldBeUnderContent !== other.shouldBeUnderContent;
    }
}
class DataCaptureView {
    get context() {
        return this.baseDataCaptureView.context;
    }
    set context(context) {
        this.baseDataCaptureView.context = context;
    }
    get overlays() {
        return this.baseDataCaptureView.overlays;
    }
    get scanAreaMargins() {
        return this.baseDataCaptureView.scanAreaMargins;
    }
    ;
    set scanAreaMargins(newValue) {
        this.baseDataCaptureView.scanAreaMargins = newValue;
    }
    ;
    get pointOfInterest() {
        return this.baseDataCaptureView.pointOfInterest;
    }
    ;
    set pointOfInterest(newValue) {
        this.baseDataCaptureView.pointOfInterest = newValue;
    }
    ;
    get logoStyle() {
        return this.baseDataCaptureView.logoStyle;
    }
    set logoStyle(style) {
        this.baseDataCaptureView.logoStyle = style;
    }
    get logoAnchor() {
        return this.baseDataCaptureView.logoAnchor;
    }
    ;
    set logoAnchor(newValue) {
        this.baseDataCaptureView.logoAnchor = newValue;
    }
    ;
    get logoOffset() {
        return this.baseDataCaptureView.logoOffset;
    }
    ;
    set logoOffset(newValue) {
        this.baseDataCaptureView.logoOffset = newValue;
    }
    ;
    get focusGesture() {
        return this.baseDataCaptureView.focusGesture;
    }
    ;
    set focusGesture(newValue) {
        this.baseDataCaptureView.focusGesture = newValue;
    }
    ;
    get zoomGesture() {
        return this.baseDataCaptureView.zoomGesture;
    }
    ;
    set zoomGesture(newValue) {
        this.baseDataCaptureView.zoomGesture = newValue;
    }
    ;
    set htmlElementState(newState) {
        const didChangeShown = this._htmlElementState.isShown !== newState.isShown;
        const didChangePositionOrSize = this._htmlElementState.didChangeComparedTo(newState);
        this._htmlElementState = newState;
        if (didChangePositionOrSize) {
            this.updatePositionAndSize();
        }
        if (didChangeShown) {
            if (this._htmlElementState.isShown) {
                this._show();
            }
            else {
                this._hide();
            }
        }
    }
    get htmlElementState() {
        return this._htmlElementState;
    }
    static forContext(context) {
        const view = new DataCaptureView();
        view.context = context;
        return view;
    }
    constructor() {
        this.htmlElement = null;
        this._htmlElementState = new HTMLElementState();
        this.scrollListener = this.elementDidChange.bind(this);
        this.domObserver = new MutationObserver(this.elementDidChange.bind(this));
        this.orientationChangeListener = (() => {
            this.elementDidChange();
            // SDC-1784 -> workaround because at the moment of this callback the element doesn't have the updated size.
            setTimeout(this.elementDidChange.bind(this), 100);
            setTimeout(this.elementDidChange.bind(this), 300);
            setTimeout(this.elementDidChange.bind(this), 1000);
        });
        this.baseDataCaptureView = new core.BaseDataCaptureView(false);
    }
    connectToElement(element) {
        // add view to native hierarchy
        this.baseDataCaptureView.createNativeView().then(() => {
            this.htmlElement = element;
            this.htmlElementState = new HTMLElementState();
            // Initial update
            this.elementDidChange();
            this.subscribeToChangesOnHTMLElement();
        });
    }
    detachFromElement() {
        this.unsubscribeFromChangesOnHTMLElement();
        this.htmlElement = null;
        this.elementDidChange();
        // Remove view from native hierarchy
        this.baseDataCaptureView.removeNativeView();
    }
    setFrame(frame_1) {
        return __awaiter(this, arguments, void 0, function* (frame, isUnderContent = false) {
            yield this.baseDataCaptureView.createNativeView();
            return this.baseDataCaptureView.setFrame(frame, isUnderContent);
        });
    }
    show() {
        if (this.htmlElement) {
            throw new Error("Views should only be manually shown if they're manually sized using setFrame");
        }
        return this._show();
    }
    hide() {
        if (this.htmlElement) {
            throw new Error("Views should only be manually hidden if they're manually sized using setFrame");
        }
        return this._hide();
    }
    addOverlay(overlay) {
        this.baseDataCaptureView.addOverlay(overlay);
    }
    removeOverlay(overlay) {
        this.baseDataCaptureView.removeOverlay(overlay);
    }
    addListener(listener) {
        this.baseDataCaptureView.addListener(listener);
    }
    removeListener(listener) {
        this.baseDataCaptureView.removeListener(listener);
    }
    viewPointForFramePoint(point) {
        return this.baseDataCaptureView.viewPointForFramePoint(point);
    }
    viewQuadrilateralForFrameQuadrilateral(quadrilateral) {
        return this.baseDataCaptureView.viewQuadrilateralForFrameQuadrilateral(quadrilateral);
    }
    addControl(control) {
        this.baseDataCaptureView.addControl(control);
    }
    addControlWithAnchorAndOffset(control, anchor, offset) {
        return this.baseDataCaptureView.addControlWithAnchorAndOffset(control, anchor, offset);
    }
    removeControl(control) {
        this.baseDataCaptureView.removeControl(control);
    }
    subscribeToChangesOnHTMLElement() {
        this.domObserver.observe(document, { attributes: true, childList: true, subtree: true });
        window.addEventListener('scroll', this.scrollListener);
        window.addEventListener('orientationchange', this.orientationChangeListener);
    }
    unsubscribeFromChangesOnHTMLElement() {
        this.domObserver.disconnect();
        window.removeEventListener('scroll', this.scrollListener);
        window.removeEventListener('orientationchange', this.orientationChangeListener);
    }
    elementDidChange() {
        if (!this.htmlElement) {
            this.htmlElementState = new HTMLElementState();
            return;
        }
        const newState = new HTMLElementState();
        const boundingRect = this.htmlElement.getBoundingClientRect();
        newState.position = { top: boundingRect.top, left: boundingRect.left };
        newState.size = { width: boundingRect.width, height: boundingRect.height };
        newState.shouldBeUnderContent = parseInt(this.htmlElement.style.zIndex || '1', 10) < 0
            || parseInt(getComputedStyle(this.htmlElement).zIndex || '1', 10) < 0;
        const isDisplayed = getComputedStyle(this.htmlElement).display !== 'none'
            && this.htmlElement.style.display !== 'none';
        const isInDOM = document.body.contains(this.htmlElement);
        newState.isShown = isDisplayed && isInDOM && !this.htmlElement.hidden;
        this.htmlElementState = newState;
    }
    updatePositionAndSize() {
        if (!this.htmlElementState || !this.htmlElementState.isValid) {
            return;
        }
        this.baseDataCaptureView.setPositionAndSize(this.htmlElementState.position.top, this.htmlElementState.position.left, this.htmlElementState.size.width, this.htmlElementState.size.height, this.htmlElementState.shouldBeUnderContent);
    }
    _show() {
        return this.baseDataCaptureView.show();
    }
    _hide() {
        return this.baseDataCaptureView.hide();
    }
    toJSON() {
        return this.baseDataCaptureView.toJSON();
    }
}
__decorate([
    core.ignoreFromSerialization
], DataCaptureView.prototype, "baseDataCaptureView", void 0);
__decorate([
    core.ignoreFromSerialization
], DataCaptureView.prototype, "htmlElement", void 0);
__decorate([
    core.ignoreFromSerialization
], DataCaptureView.prototype, "_htmlElementState", void 0);
__decorate([
    core.ignoreFromSerialization
], DataCaptureView.prototype, "scrollListener", void 0);
__decorate([
    core.ignoreFromSerialization
], DataCaptureView.prototype, "domObserver", void 0);
__decorate([
    core.ignoreFromSerialization
], DataCaptureView.prototype, "orientationChangeListener", void 0);

initializeCordovaCore();

exports.AimerViewfinder = core.AimerViewfinder;
Object.defineProperty(exports, "Anchor", {
    enumerable: true,
    get: function () { return core.Anchor; }
});
exports.Brush = core.Brush;
exports.Camera = core.Camera;
Object.defineProperty(exports, "CameraPosition", {
    enumerable: true,
    get: function () { return core.CameraPosition; }
});
exports.CameraSettings = core.CameraSettings;
exports.Color = core.Color;
exports.ContextStatus = core.ContextStatus;
exports.DataCaptureContext = core.DataCaptureContext;
exports.DataCaptureContextSettings = core.DataCaptureContextSettings;
Object.defineProperty(exports, "Direction", {
    enumerable: true,
    get: function () { return core.Direction; }
});
exports.Feedback = core.Feedback;
Object.defineProperty(exports, "FocusGestureStrategy", {
    enumerable: true,
    get: function () { return core.FocusGestureStrategy; }
});
Object.defineProperty(exports, "FocusRange", {
    enumerable: true,
    get: function () { return core.FocusRange; }
});
Object.defineProperty(exports, "FrameSourceState", {
    enumerable: true,
    get: function () { return core.FrameSourceState; }
});
exports.ImageBuffer = core.ImageBuffer;
exports.ImageFrameSource = core.ImageFrameSource;
exports.LaserlineViewfinder = core.LaserlineViewfinder;
Object.defineProperty(exports, "LaserlineViewfinderStyle", {
    enumerable: true,
    get: function () { return core.LaserlineViewfinderStyle; }
});
Object.defineProperty(exports, "LogoStyle", {
    enumerable: true,
    get: function () { return core.LogoStyle; }
});
exports.MarginsWithUnit = core.MarginsWithUnit;
Object.defineProperty(exports, "MeasureUnit", {
    enumerable: true,
    get: function () { return core.MeasureUnit; }
});
exports.NoViewfinder = core.NoViewfinder;
exports.NoneLocationSelection = core.NoneLocationSelection;
exports.NumberWithUnit = core.NumberWithUnit;
Object.defineProperty(exports, "Orientation", {
    enumerable: true,
    get: function () { return core.Orientation; }
});
exports.Point = core.Point;
exports.PointWithUnit = core.PointWithUnit;
exports.Quadrilateral = core.Quadrilateral;
exports.RadiusLocationSelection = core.RadiusLocationSelection;
exports.Rect = core.Rect;
exports.RectWithUnit = core.RectWithUnit;
exports.RectangularLocationSelection = core.RectangularLocationSelection;
exports.RectangularViewfinder = core.RectangularViewfinder;
exports.RectangularViewfinderAnimation = core.RectangularViewfinderAnimation;
Object.defineProperty(exports, "RectangularViewfinderLineStyle", {
    enumerable: true,
    get: function () { return core.RectangularViewfinderLineStyle; }
});
Object.defineProperty(exports, "RectangularViewfinderStyle", {
    enumerable: true,
    get: function () { return core.RectangularViewfinderStyle; }
});
Object.defineProperty(exports, "ScanIntention", {
    enumerable: true,
    get: function () { return core.ScanIntention; }
});
exports.Size = core.Size;
exports.SizeWithAspect = core.SizeWithAspect;
exports.SizeWithUnit = core.SizeWithUnit;
exports.SizeWithUnitAndAspect = core.SizeWithUnitAndAspect;
Object.defineProperty(exports, "SizingMode", {
    enumerable: true,
    get: function () { return core.SizingMode; }
});
exports.Sound = core.Sound;
exports.SpotlightViewfinder = core.SpotlightViewfinder;
exports.SwipeToZoom = core.SwipeToZoom;
exports.TapToFocus = core.TapToFocus;
Object.defineProperty(exports, "TorchState", {
    enumerable: true,
    get: function () { return core.TorchState; }
});
exports.TorchSwitchControl = core.TorchSwitchControl;
exports.Vibration = core.Vibration;
Object.defineProperty(exports, "VideoResolution", {
    enumerable: true,
    get: function () { return core.VideoResolution; }
});
exports.ZoomSwitchControl = core.ZoomSwitchControl;
exports.CordovaError = CordovaError;
exports.DataCaptureVersion = DataCaptureVersion;
exports.DataCaptureView = DataCaptureView;
exports.HTMLElementState = HTMLElementState;
exports.cordovaExec = cordovaExec;
exports.initializePlugin = initializePlugin;
exports.pluginsMetadata = pluginsMetadata;
