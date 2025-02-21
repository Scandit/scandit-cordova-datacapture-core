var core = cordova.require('scandit-cordova-datacapture-core.Core');

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


function __decorate$1(decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
}

function __awaiter$1(thisArg, _arguments, P, generator) {
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
const exec = cordova.require('cordova/exec');
const channel = cordova.require('cordova/channel');
const cordovaPluginsData = cordova.require('cordova/plugin_list');
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
    return __awaiter$1(this, void 0, void 0, function* () {
        const readyEventName = `on${pluginName}Ready`;
        channel.createSticky(readyEventName);
        channel.waitForInitialization(readyEventName);
        const firePluginEvent = (eventName, init) => __awaiter$1(this, void 0, void 0, function* () {
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
class CordovaNativeCaller {
    constructor(pluginName, eventRegisterFnName) {
        this.pluginName = pluginName;
        this.eventRegisterFnName = eventRegisterFnName;
        this.eventHandlers = new Map();
        this.areEventsRegistered = false;
    }
    callFn(fnName, args) {
        if (fnName === this.eventRegisterFnName) {
            this.setUpEventListener();
            return Promise.resolve();
        }
        return new Promise((resolve, reject) => {
            exec(resolve, reject, this.pluginName, fnName, args);
        });
    }
    registerEvent(evName, handler) {
        this.eventHandlers.set(evName, handler);
        return Promise.resolve();
    }
    unregisterEvent(evName, _subscription) {
        this.eventHandlers.delete(evName);
        return Promise.resolve(undefined);
    }
    setUpEventListener() {
        if (!this.areEventsRegistered) {
            Cordova.exec(this.notifyListeners.bind(this), null, this.eventRegisterFnName, null);
            this.areEventsRegistered = true;
        }
    }
    notifyListeners(ev) {
        if (ev == null) {
            return;
        }
        const event = Object.assign(Object.assign(Object.assign({}, ev), ev.argument), { argument: undefined });
        const handler = this.eventHandlers.get(event.name);
        if (handler == null) {
            console.warn(`Handler for event ${event.name} not found`);
            return;
        }
        handler(event);
    }
}
function createCordovaNativeCaller(pluginName, eventRegisterFnName) {
    return new CordovaNativeCaller(pluginName, eventRegisterFnName);
}

class NativeCameraProxy extends core.BaseNativeProxy {
    static get cordovaExec() {
        return Cordova.exec;
    }
    getFrame(frameId) {
        return new Promise((resolve, reject) => {
            NativeCameraProxy.cordovaExec(resolve, reject, CordovaFunction.GetFrame, [frameId]);
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
                this.eventEmitter.emit(core.FrameSourceListenerEvents.didChangeState, event.data);
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
    contextFromJSON(contextJson) {
        return __awaiter$1(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => {
                NativeDataCaptureContextProxy.cordovaExec(resolve, reject, CordovaFunction.ContextFromJSON, [JSON.parse(contextJson)]);
            });
        });
    }
    updateContextFromJSON(contextJson) {
        return new Promise((resolve, reject) => {
            NativeDataCaptureContextProxy.cordovaExec(resolve, reject, CordovaFunction.UpdateContextFromJSON, [JSON.parse(contextJson)]);
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
    getOpenSourceSoftwareLicenseInfo() {
        return new Promise((resolve, reject) => {
            NativeDataCaptureContextProxy.cordovaExec(resolve, reject, CordovaFunction.GetOpenSourceSoftwareLicenseInfo, null);
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
                this.eventEmitter.emit(core.DataCaptureContextEvents.didChangeStatus, event.data);
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
            NativeDataCaptureViewProxy.cordovaExec(resolve, reject, CordovaFunction.ViewPointForFramePoint, [pointJson]);
        });
    }
    viewQuadrilateralForFrameQuadrilateral(quadrilateralJson) {
        return new Promise((resolve, reject) => {
            NativeDataCaptureViewProxy.cordovaExec(resolve, reject, CordovaFunction.ViewQuadrilateralForFrameQuadrilateral, [quadrilateralJson]);
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
                this.eventEmitter.emit(core.DataCaptureViewEvents.didChangeSize, event.data);
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
                this.eventEmitter.emit(core.FrameSourceListenerEvents.didChangeState, event.data);
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
    CordovaFunction["GetFrame"] = "getFrame";
    CordovaFunction["EmitFeedback"] = "emitFeedback";
    CordovaFunction["SubscribeVolumeButtonObserver"] = "subscribeVolumeButtonObserver";
    CordovaFunction["UnsubscribeVolumeButtonObserver"] = "unsubscribeVolumeButtonObserver";
    CordovaFunction["AddModeToContext"] = "addModeToContext";
    CordovaFunction["RemoveModeFromContext"] = "removeModeFromContext";
    CordovaFunction["RemoveAllModesFromContext"] = "removeAllModesFromContext";
    CordovaFunction["CreateDataCaptureView"] = "createDataCaptureView";
    CordovaFunction["UpdateDataCaptureView"] = "updateDataCaptureView";
    CordovaFunction["RemoveDataCaptureView"] = "removeDataCaptureView";
    CordovaFunction["GetOpenSourceSoftwareLicenseInfo"] = "getOpenSourceSoftwareLicenseInfo";
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

var Symbology;
(function (Symbology) {
    Symbology["EAN13UPCA"] = "ean13Upca";
    Symbology["UPCE"] = "upce";
    Symbology["EAN8"] = "ean8";
    Symbology["Code39"] = "code39";
    Symbology["Code93"] = "code93";
    Symbology["Code128"] = "code128";
    Symbology["Code11"] = "code11";
    Symbology["Code25"] = "code25";
    Symbology["Codabar"] = "codabar";
    Symbology["InterleavedTwoOfFive"] = "interleavedTwoOfFive";
    Symbology["MSIPlessey"] = "msiPlessey";
    Symbology["QR"] = "qr";
    Symbology["DataMatrix"] = "dataMatrix";
    Symbology["Aztec"] = "aztec";
    Symbology["MaxiCode"] = "maxicode";
    Symbology["DotCode"] = "dotcode";
    Symbology["KIX"] = "kix";
    Symbology["RM4SCC"] = "rm4scc";
    Symbology["GS1Databar"] = "databar";
    Symbology["GS1DatabarExpanded"] = "databarExpanded";
    Symbology["GS1DatabarLimited"] = "databarLimited";
    Symbology["PDF417"] = "pdf417";
    Symbology["MicroPDF417"] = "microPdf417";
    Symbology["MicroQR"] = "microQr";
    Symbology["Code32"] = "code32";
    Symbology["Lapa4SC"] = "lapa4sc";
    Symbology["IATATwoOfFive"] = "iata2of5";
    Symbology["MatrixTwoOfFive"] = "matrix2of5";
    Symbology["USPSIntelligentMail"] = "uspsIntelligentMail";
    Symbology["ArUco"] = "aruco";
    Symbology["Upu4State"] = "upu-4state";
    Symbology["AustralianPost"] = "australian-post-4state";
    Symbology["FrenchPost"] = "french-post";
})(Symbology || (Symbology = {}));

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
/* global Reflect, Promise, SuppressedError, Symbol, Iterator */


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

class Range extends core.DefaultSerializeable {
    get minimum() {
        return this._minimum;
    }
    get maximum() {
        return this._maximum;
    }
    get step() {
        return this._step;
    }
    get isFixed() {
        return this.minimum === this.maximum || this.step <= 0;
    }
    static fromJSON(json) {
        const range = new Range();
        range._minimum = json.minimum;
        range._maximum = json.maximum;
        range._step = json.step;
        return range;
    }
}
__decorate([
    core.nameForSerialization('minimum')
], Range.prototype, "_minimum", void 0);
__decorate([
    core.nameForSerialization('maximum')
], Range.prototype, "_maximum", void 0);
__decorate([
    core.nameForSerialization('step')
], Range.prototype, "_step", void 0);

var CompositeType;
(function (CompositeType) {
    CompositeType["A"] = "A";
    CompositeType["B"] = "B";
    CompositeType["C"] = "C";
})(CompositeType || (CompositeType = {}));

var Checksum;
(function (Checksum) {
    Checksum["Mod10"] = "mod10";
    Checksum["Mod11"] = "mod11";
    Checksum["Mod16"] = "mod16";
    Checksum["Mod43"] = "mod43";
    Checksum["Mod47"] = "mod47";
    Checksum["Mod103"] = "mod103";
    Checksum["Mod10AndMod11"] = "mod1110";
    Checksum["Mod10AndMod10"] = "mod1010";
})(Checksum || (Checksum = {}));

class SymbologySettings extends core.DefaultSerializeable {
    get symbology() {
        return this._symbology;
    }
    get enabledExtensions() {
        return this.extensions;
    }
    static fromJSON(identifier, json) {
        const symbologySettings = new SymbologySettings();
        symbologySettings.extensions = json.extensions;
        symbologySettings.isEnabled = json.enabled;
        symbologySettings.isColorInvertedEnabled = json.colorInvertedEnabled;
        symbologySettings.checksums = json.checksums;
        symbologySettings.activeSymbolCounts = json.activeSymbolCounts;
        symbologySettings._symbology = identifier;
        return symbologySettings;
    }
    setExtensionEnabled(extension, enabled) {
        const included = this.extensions.includes(extension);
        if (enabled && !included) {
            this.extensions.push(extension);
        }
        else if (!enabled && included) {
            this.extensions.splice(this.extensions.indexOf(extension), 1);
        }
    }
}
__decorate([
    core.ignoreFromSerialization
], SymbologySettings.prototype, "_symbology", void 0);
__decorate([
    core.nameForSerialization('enabled')
], SymbologySettings.prototype, "isEnabled", void 0);
__decorate([
    core.nameForSerialization('colorInvertedEnabled')
], SymbologySettings.prototype, "isColorInvertedEnabled", void 0);

class ArucoDictionary {
    constructor() {
        this._preset = null;
        this._markers = null;
        this._markerSize = null;
    }
    static fromPreset(preset) {
        const arucoDictionary = new ArucoDictionary();
        arucoDictionary._preset = preset;
        return arucoDictionary;
    }
    static createWithMarkers(markerSize, markers) {
        const arucoDictionary = new ArucoDictionary();
        arucoDictionary._markerSize = markerSize;
        arucoDictionary._markers = markers;
        return arucoDictionary;
    }
}
__decorate([
    core.nameForSerialization('preset')
], ArucoDictionary.prototype, "_preset", void 0);
__decorate([
    core.nameForSerialization('markers')
], ArucoDictionary.prototype, "_markers", void 0);
__decorate([
    core.nameForSerialization('markerSize')
], ArucoDictionary.prototype, "_markerSize", void 0);

var ArucoDictionaryPreset;
(function (ArucoDictionaryPreset) {
    ArucoDictionaryPreset["ArucoDictionaryPreset_5X5_50"] = "5X5_50";
    ArucoDictionaryPreset["ArucoDictionaryPreset_5X5_100"] = "5X5_100";
    ArucoDictionaryPreset["ArucoDictionaryPreset_5X5_250"] = "5X5_250";
    ArucoDictionaryPreset["ArucoDictionaryPreset_5X5_1000"] = "5X5_1000";
    ArucoDictionaryPreset["ArucoDictionaryPreset_5X5_1023"] = "5X5_1023";
    ArucoDictionaryPreset["ArucoDictionaryPreset_4X4_250"] = "4X4_250";
    ArucoDictionaryPreset["ArucoDictionaryPreset_6X6_250"] = "6X6_250";
})(ArucoDictionaryPreset || (ArucoDictionaryPreset = {}));

class ArucoMarker extends core.DefaultSerializeable {
    get size() {
        return this._markerSize;
    }
    get data() {
        return this._markerData;
    }
    static create(markerSize, markerData) {
        const arucoMarker = new ArucoMarker();
        arucoMarker._markerSize = markerSize || 0;
        arucoMarker._markerData = markerData || '';
        return arucoMarker;
    }
}
__decorate([
    core.nameForSerialization('markerData')
], ArucoMarker.prototype, "_markerData", void 0);
__decorate([
    core.nameForSerialization('markerSize')
], ArucoMarker.prototype, "_markerSize", void 0);

function getBarcodeDefaults() {
    return core.FactoryMaker.getInstance('BarcodeDefaults');
}

function getBarcodeCaptureDefaults() {
    return core.FactoryMaker.getInstance('BarcodeCaptureDefaults');
}

function getBarcodeCheckDefaults() {
    return core.FactoryMaker.getInstance('BarcodeCheckDefaults');
}

function getBarcodeSelectionDefaults() {
    return core.FactoryMaker.getInstance('BarcodeSelectionDefaults');
}

class BarcodeCountFeedback extends core.DefaultSerializeable {
    static get default() {
        return new BarcodeCountFeedback(BarcodeCountFeedback.barcodeCountDefaults.Feedback.success, BarcodeCountFeedback.barcodeCountDefaults.Feedback.failure);
    }
    static get emptyFeedback() {
        return new BarcodeCountFeedback(new core.Feedback(null, null), new core.Feedback(null, null));
    }
    get success() {
        return this._success;
    }
    set success(success) {
        this._success = success;
        this.updateFeedback();
    }
    get failure() {
        return this._failure;
    }
    set failure(failure) {
        this._failure = failure;
        this.updateFeedback();
    }
    updateFeedback() {
        var _a;
        (_a = this.listenerController) === null || _a === void 0 ? void 0 : _a.updateFeedback(JSON.stringify(this.toJSON()));
    }
    static fromJSON(json) {
        const success = core.Feedback.fromJSON(json.success);
        const failure = core.Feedback.fromJSON(json.failure);
        return new BarcodeCountFeedback(success, failure);
    }
    static get barcodeCountDefaults() {
        return getBarcodeCountDefaults();
    }
    constructor(success, error) {
        super();
        this.listenerController = null;
        this._success = BarcodeCountFeedback.barcodeCountDefaults.Feedback.success;
        this._failure = BarcodeCountFeedback.barcodeCountDefaults.Feedback.failure;
        this.success = success;
        this.failure = error;
    }
}
__decorate([
    core.ignoreFromSerialization
], BarcodeCountFeedback.prototype, "listenerController", void 0);
__decorate([
    core.nameForSerialization('success')
], BarcodeCountFeedback.prototype, "_success", void 0);
__decorate([
    core.nameForSerialization('failure')
], BarcodeCountFeedback.prototype, "_failure", void 0);
__decorate([
    core.ignoreFromSerialization
], BarcodeCountFeedback, "barcodeCountDefaults", null);

class BarcodeCountCaptureListSession extends core.DefaultSerializeable {
    get correctBarcodes() {
        return this._correctBarcodes;
    }
    get wrongBarcodes() {
        return this._wrongBarcodes;
    }
    get missingBarcodes() {
        return this._missingBarcodes;
    }
    get additionalBarcodes() {
        return this._additionalBarcodes;
    }
    get acceptedBarcodes() {
        return this._acceptedBarcodes;
    }
    get rejectedBarcodes() {
        return this._rejectedBarcodes;
    }
    static fromJSON(json) {
        var _a, _b, _c, _d, _e, _f;
        const correctBarcodes = (_a = json.correctBarcodes) !== null && _a !== void 0 ? _a : [];
        const wrongBarcodes = (_b = json.wrongBarcodes) !== null && _b !== void 0 ? _b : [];
        const missingBarcodes = (_c = json.missingBarcodes) !== null && _c !== void 0 ? _c : [];
        const additionalBarcodes = (_d = json.additionalBarcodes) !== null && _d !== void 0 ? _d : [];
        const acceptedBarcodes = (_e = json.acceptedBarcodes) !== null && _e !== void 0 ? _e : [];
        const rejectedBarcodes = (_f = json.rejectedBarcodes) !== null && _f !== void 0 ? _f : [];
        return new BarcodeCountCaptureListSession({
            correctBarcodes,
            wrongBarcodes,
            missingBarcodes,
            additionalBarcodes,
            acceptedBarcodes,
            rejectedBarcodes
        });
    }
    constructor({ correctBarcodes, wrongBarcodes, missingBarcodes, additionalBarcodes, acceptedBarcodes, rejectedBarcodes }) {
        super();
        this._correctBarcodes = correctBarcodes;
        this._wrongBarcodes = wrongBarcodes;
        this._missingBarcodes = missingBarcodes;
        this._additionalBarcodes = additionalBarcodes;
        this._acceptedBarcodes = acceptedBarcodes;
        this._rejectedBarcodes = rejectedBarcodes;
    }
}
__decorate([
    core.nameForSerialization('correctBarcodes')
], BarcodeCountCaptureListSession.prototype, "_correctBarcodes", void 0);
__decorate([
    core.nameForSerialization('wrongBarcodes')
], BarcodeCountCaptureListSession.prototype, "_wrongBarcodes", void 0);
__decorate([
    core.nameForSerialization('missingBarcodes')
], BarcodeCountCaptureListSession.prototype, "_missingBarcodes", void 0);
__decorate([
    core.nameForSerialization('additionalBarcodes')
], BarcodeCountCaptureListSession.prototype, "_additionalBarcodes", void 0);
__decorate([
    core.nameForSerialization('acceptedBarcodes')
], BarcodeCountCaptureListSession.prototype, "_acceptedBarcodes", void 0);
__decorate([
    core.nameForSerialization('rejectedBarcodes')
], BarcodeCountCaptureListSession.prototype, "_rejectedBarcodes", void 0);

class EncodingRange {
    get ianaName() { return this._ianaName; }
    get startIndex() { return this._startIndex; }
    get endIndex() { return this._endIndex; }
    static fromJSON(json) {
        const encodingRange = new EncodingRange();
        encodingRange._ianaName = json.ianaName;
        encodingRange._startIndex = json.startIndex;
        encodingRange._endIndex = json.endIndex;
        return encodingRange;
    }
}

class StructuredAppendData {
    get isComplete() { return this._isComplete; }
    get barcodeSetId() { return this._barcodeSetId; }
    get scannedSegmentCount() { return this._scannedSegmentCount; }
    get totalSegmentCount() { return this._totalSegmentCount; }
    get encodingRanges() { return this._encodingRanges; }
    get completeData() { return this._completeData; }
    get rawCompleteData() { return this._rawCompleteData; }
    static fromJSON(json) {
        const structuredAppendData = new StructuredAppendData();
        if (!json)
            return null;
        structuredAppendData._isComplete = json.complete;
        structuredAppendData._barcodeSetId = json.barcodeSetId;
        structuredAppendData._scannedSegmentCount = json.scannedSegmentCount;
        structuredAppendData._totalSegmentCount = json.totalSegmentCount;
        structuredAppendData._encodingRanges =
            json.completeDataEncodings.map(EncodingRange.fromJSON);
        structuredAppendData._completeData = json.completeDataUtf8String;
        structuredAppendData._rawCompleteData = json.completeDataRaw;
        return structuredAppendData;
    }
}

class Barcode extends core.DefaultSerializeable {
    get symbology() { return this._symbology; }
    get data() { return this._data; }
    get rawData() { return this._rawData; }
    get compositeData() { return this._compositeData; }
    get compositeRawData() { return this._compositeRawData; }
    get addOnData() { return this._addOnData; }
    get encodingRanges() { return this._encodingRanges; }
    get location() { return this._location; }
    get isGS1DataCarrier() { return this._isGS1DataCarrier; }
    get compositeFlag() { return this._compositeFlag; }
    get isColorInverted() { return this._isColorInverted; }
    get symbolCount() { return this._symbolCount; }
    get frameID() { return this._frameID; }
    get isStructuredAppend() { return this._structuredAppendData !== null; }
    get structuredAppendData() { return this._structuredAppendData; }
    get selectionIdentifier() { return this.data + this.symbology; }
    static fromJSON(json) {
        const barcode = new Barcode();
        barcode._symbology = json.symbology;
        barcode._data = json.data;
        barcode._rawData = json.rawData;
        barcode._compositeData = json.compositeData;
        barcode._compositeRawData = json.compositeRawData;
        barcode._addOnData = json.addOnData === undefined ? null : json.addOnData;
        barcode._isGS1DataCarrier = json.isGS1DataCarrier;
        barcode._compositeFlag = json.compositeFlag;
        barcode._isColorInverted = json.isColorInverted;
        barcode._symbolCount = json.symbolCount;
        barcode._frameID = json.frameId;
        barcode._encodingRanges = json.encodingRanges.map(EncodingRange.fromJSON);
        barcode._location = core.Quadrilateral.fromJSON(json.location);
        barcode._structuredAppendData =
            StructuredAppendData.fromJSON(json.structuredAppendData);
        return barcode;
    }
}
__decorate([
    core.nameForSerialization('symbology')
], Barcode.prototype, "_symbology", void 0);
__decorate([
    core.nameForSerialization('data')
], Barcode.prototype, "_data", void 0);
__decorate([
    core.nameForSerialization('rawData')
], Barcode.prototype, "_rawData", void 0);
__decorate([
    core.nameForSerialization('compositeData')
], Barcode.prototype, "_compositeData", void 0);
__decorate([
    core.nameForSerialization('compositeRawData')
], Barcode.prototype, "_compositeRawData", void 0);
__decorate([
    core.nameForSerialization('addOnData')
], Barcode.prototype, "_addOnData", void 0);
__decorate([
    core.nameForSerialization('encodingRanges')
], Barcode.prototype, "_encodingRanges", void 0);
__decorate([
    core.nameForSerialization('location')
], Barcode.prototype, "_location", void 0);
__decorate([
    core.nameForSerialization('isGS1DataCarrier')
], Barcode.prototype, "_isGS1DataCarrier", void 0);
__decorate([
    core.nameForSerialization('compositeFlag')
], Barcode.prototype, "_compositeFlag", void 0);
__decorate([
    core.nameForSerialization('isColorInverted')
], Barcode.prototype, "_isColorInverted", void 0);
__decorate([
    core.nameForSerialization('symbolCount')
], Barcode.prototype, "_symbolCount", void 0);
__decorate([
    core.nameForSerialization('frameID')
], Barcode.prototype, "_frameID", void 0);
__decorate([
    core.nameForSerialization('structuredAppendData')
], Barcode.prototype, "_structuredAppendData", void 0);

var BatterySavingMode;
(function (BatterySavingMode) {
    BatterySavingMode["On"] = "on";
    BatterySavingMode["Off"] = "off";
    BatterySavingMode["Auto"] = "auto";
})(BatterySavingMode || (BatterySavingMode = {}));

var CompositeFlag;
(function (CompositeFlag) {
    CompositeFlag["None"] = "none";
    CompositeFlag["Unknown"] = "unknown";
    CompositeFlag["Linked"] = "linked";
    CompositeFlag["GS1TypeA"] = "gs1TypeA";
    CompositeFlag["GS1TypeB"] = "gs1TypeB";
    CompositeFlag["GS1TypeC"] = "gs1TypeC";
})(CompositeFlag || (CompositeFlag = {}));

class LocalizedOnlyBarcode {
    get location() {
        return this._location;
    }
    get frameID() {
        return this._frameID;
    }
    static fromJSON(json) {
        const localizedBarcode = new LocalizedOnlyBarcode();
        localizedBarcode._location = core.Quadrilateral.fromJSON(json.location);
        localizedBarcode._frameID = json.frameId;
        return localizedBarcode;
    }
}

class TargetBarcode extends core.DefaultSerializeable {
    get data() {
        return this._data;
    }
    get quantity() {
        return this._quantity;
    }
    static create(data, quantity) {
        return new TargetBarcode(data, quantity);
    }
    static fromJSON(json) {
        const data = json.data;
        const quantity = json.quantity;
        return TargetBarcode.create(data, quantity);
    }
    constructor(data, quantity) {
        super();
        this._data = data;
        this._quantity = quantity;
    }
}
__decorate([
    core.nameForSerialization('data')
], TargetBarcode.prototype, "_data", void 0);
__decorate([
    core.nameForSerialization('quantity')
], TargetBarcode.prototype, "_quantity", void 0);

class TrackedBarcode {
    get barcode() { return this._barcode; }
    get location() { return this._location; }
    get identifier() { return this._identifier; }
    get sessionFrameSequenceID() {
        return this._sessionFrameSequenceID;
    }
    static fromJSON(json, sessionFrameSequenceID) {
        const trackedBarcode = new TrackedBarcode();
        // The serialization returns the identifier as a string, not a number, which it originally is.
        // This is because the identifier needs to be used as a key in a dictionary, which in JSON can only be a string.
        // We can assume that it is a number in the string that we can safely parse.
        trackedBarcode._identifier = parseInt(json.identifier, 10);
        trackedBarcode._barcode = Barcode.fromJSON(json.barcode);
        trackedBarcode._location = core.Quadrilateral.fromJSON(json.location);
        trackedBarcode._sessionFrameSequenceID = sessionFrameSequenceID ? sessionFrameSequenceID : null;
        return trackedBarcode;
    }
}

class BarcodeSpatialGrid extends core.DefaultSerializeable {
    static fromJSON(json) {
        const spatialGrid = new BarcodeSpatialGrid();
        spatialGrid._rows = json.rows;
        spatialGrid._columns = json.columns;
        spatialGrid._grid = json.grid;
        return spatialGrid;
    }
    get rows() {
        return this._rows;
    }
    get columns() {
        return this._columns;
    }
    barcodeAt(row, column) {
        const barcodeJSON = this._grid[row][column]["mainBarcode"];
        if (barcodeJSON) {
            return Barcode.fromJSON(barcodeJSON);
        }
        return null;
    }
    row(index) {
        const elementsJSON = this._grid[index];
        if (elementsJSON) {
            return ((elementsJSON.map((it) => it.mainBarcode)).map(Barcode.fromJSON));
        }
        return [];
    }
    column(index) {
        const elementsJSON = this._grid.map(elements => elements[index]);
        if (elementsJSON) {
            return ((elementsJSON.map((it) => it.mainBarcode)).map(Barcode.fromJSON));
        }
        return [];
    }
}
__decorate([
    core.nameForSerialization('rows')
], BarcodeSpatialGrid.prototype, "_rows", void 0);
__decorate([
    core.nameForSerialization('columns')
], BarcodeSpatialGrid.prototype, "_columns", void 0);
__decorate([
    core.nameForSerialization('grid')
], BarcodeSpatialGrid.prototype, "_grid", void 0);

class BarcodeCountSessionController {
    get _proxy() {
        return core.FactoryMaker.getInstance('BarcodeCountSessionProxy');
    }
    resetSession() {
        return this._proxy.resetSession();
    }
    getSpatialMap() {
        return __awaiter(this, void 0, void 0, function* () {
            const result = yield this._proxy.getSpatialMap();
            if (result) {
                const payload = JSON.parse(result.data);
                return BarcodeSpatialGrid.fromJSON(payload);
            }
        });
    }
    getSpatialMapWithHints(expectedNumberOfRows, expectedNumberOfColumns) {
        return __awaiter(this, void 0, void 0, function* () {
            const result = yield this._proxy.getSpatialMapWithHints(expectedNumberOfRows, expectedNumberOfColumns);
            if (result) {
                const payload = JSON.parse(result.data);
                return BarcodeSpatialGrid.fromJSON(payload);
            }
        });
    }
}

class BarcodeCountSession extends core.DefaultSerializeable {
    static fromJSON(json) {
        var _a;
        const sessionJson = JSON.parse(json.session);
        const session = new BarcodeCountSession();
        session._frameSequenceID = sessionJson.frameSequenceId;
        session._additionalBarcodes = sessionJson.additionalBarcodes;
        session._recognizedBarcodes = sessionJson.recognizedBarcodes.map(Barcode.fromJSON);
        session.frameId = (_a = json.frameId) !== null && _a !== void 0 ? _a : '';
        return session;
    }
    constructor() {
        super();
        this.sessionController = new BarcodeCountSessionController();
    }
    get recognizedBarcodes() {
        return this._recognizedBarcodes;
    }
    get additionalBarcodes() {
        return this._additionalBarcodes;
    }
    get frameSequenceID() {
        return this._frameSequenceID;
    }
    reset() {
        return this.sessionController.resetSession();
    }
    getSpatialMap() {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            return (_a = yield this.sessionController.getSpatialMap()) !== null && _a !== void 0 ? _a : null;
        });
    }
    getSpatialMapWithHints(expectedNumberOfRows, expectedNumberOfColumns) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            return (_a = yield this.sessionController.getSpatialMapWithHints(expectedNumberOfRows, expectedNumberOfColumns)) !== null && _a !== void 0 ? _a : null;
        });
    }
}
__decorate([
    core.nameForSerialization('recognizedBarcodes')
], BarcodeCountSession.prototype, "_recognizedBarcodes", void 0);
__decorate([
    core.nameForSerialization('additionalBarcodes')
], BarcodeCountSession.prototype, "_additionalBarcodes", void 0);
__decorate([
    core.nameForSerialization('frameSequenceID')
], BarcodeCountSession.prototype, "_frameSequenceID", void 0);
__decorate([
    core.ignoreFromSerialization
], BarcodeCountSession.prototype, "sessionController", void 0);
__decorate([
    core.ignoreFromSerialization
], BarcodeCountSession.prototype, "frameId", void 0);

var BarcodeCountListenerEvents;
(function (BarcodeCountListenerEvents) {
    BarcodeCountListenerEvents["inCallback"] = "BarcodeCountCaptureListListener.inCallback";
    BarcodeCountListenerEvents["didListSessionUpdate"] = "BarcodeCountCaptureListListener.didUpdateSession";
    BarcodeCountListenerEvents["didScan"] = "BarcodeCountListener.onScan";
})(BarcodeCountListenerEvents || (BarcodeCountListenerEvents = {}));
class BarcodeCountListenerController {
    get _proxy() {
        return core.FactoryMaker.getInstance('BarcodeCountListenerProxy');
    }
    constructor() {
        this.eventEmitter = core.FactoryMaker.getInstance('EventEmitter');
    }
    static forBarcodeCount(barcodeCount) {
        const controller = new BarcodeCountListenerController();
        controller.barcodeCount = barcodeCount;
        controller._proxy.isModeEnabled = () => barcodeCount.isEnabled;
        return controller;
    }
    update() {
        const barcodeCount = this.barcodeCount.toJSON();
        const json = JSON.stringify(barcodeCount);
        return this._proxy.updateMode(json);
    }
    reset() {
        return this._proxy.resetBarcodeCount();
    }
    setModeEnabledState(enabled) {
        this._proxy.setModeEnabledState(enabled);
    }
    subscribeListener() {
        this._proxy.registerBarcodeCountListener();
        this._proxy.subscribeDidScan();
        this._proxy.subscribeDidListSessionUpdate();
        this.eventEmitter.on(BarcodeCountListenerEvents.didScan, (data) => __awaiter(this, void 0, void 0, function* () {
            const payload = core.EventDataParser.parse(data);
            if (payload === null) {
                console.error('BarcodeCountListenerController didScan payload is null');
                return;
            }
            const session = BarcodeCountSession.fromJSON(payload);
            yield this.notifyListenersOfDidScanSession(session);
            this._proxy.finishOnScan();
        }));
        this.eventEmitter.on(BarcodeCountListenerEvents.didListSessionUpdate, (data) => {
            const payload = core.EventDataParser.parse(data);
            if (payload === null) {
                console.error('BarcodeCountListenerController.subscribeListener: didListSessionUpdate payload is null');
                return;
            }
            const session = BarcodeCountCaptureListSession
                .fromJSON(JSON.parse(payload.session));
            this.notifyListenersOfDidListSessionUpdate(session);
        });
    }
    unsubscribeListener() {
        this._proxy.unregisterBarcodeCountListener();
        this.eventEmitter.removeAllListeners(BarcodeCountListenerEvents.didScan);
        this.eventEmitter.removeAllListeners(BarcodeCountListenerEvents.didListSessionUpdate);
    }
    startScanningPhase() {
        this._proxy.startScanningPhase();
    }
    endScanningPhase() {
        this._proxy.endScanningPhase();
    }
    updateFeedback(feedbackJson) {
        this._proxy.updateFeedback(feedbackJson);
    }
    setBarcodeCountCaptureList(barcodeCountCaptureList) {
        this._barcodeCountCaptureList = barcodeCountCaptureList;
        this._proxy.setBarcodeCountCaptureList(JSON.stringify(barcodeCountCaptureList.targetBarcodes));
    }
    notifyListenersOfDidScanSession(session) {
        return __awaiter(this, void 0, void 0, function* () {
            const mode = this.barcodeCount;
            mode.isInListenerCallback = true;
            for (const listener of mode.listeners) {
                if (listener.didScan) {
                    yield listener.didScan(this.barcodeCount, session, () => core.CameraController.getFrame(session.frameId));
                }
            }
            mode.isInListenerCallback = false;
        });
    }
    notifyListenersOfDidListSessionUpdate(session) {
        var _a;
        const mode = this.barcodeCount;
        const barcodeCountCaptureListListener = (_a = this._barcodeCountCaptureList) === null || _a === void 0 ? void 0 : _a.listener;
        mode.isInListenerCallback = true;
        if (barcodeCountCaptureListListener && (barcodeCountCaptureListListener === null || barcodeCountCaptureListListener === void 0 ? void 0 : barcodeCountCaptureListListener.didUpdateSession)) {
            barcodeCountCaptureListListener === null || barcodeCountCaptureListListener === void 0 ? void 0 : barcodeCountCaptureListListener.didUpdateSession(this._barcodeCountCaptureList, session);
        }
        mode.isInListenerCallback = false;
    }
}

class BarcodeCount extends core.DefaultSerializeable {
    get isEnabled() {
        return this._isEnabled;
    }
    set isEnabled(isEnabled) {
        this._isEnabled = isEnabled;
        this.listenerController.setModeEnabledState(isEnabled);
    }
    get context() {
        return this._context;
    }
    get feedback() {
        return this._feedback;
    }
    set feedback(feedback) {
        this._feedback = feedback;
        this._feedback.listenerController = this.listenerController;
        this.listenerController.updateFeedback(JSON.stringify(feedback.toJSON()));
    }
    get _context() {
        return this.privateContext;
    }
    set _context(newContext) {
        this.privateContext = newContext;
    }
    static forContext(context, settings) {
        const barcodeCount = new BarcodeCount();
        barcodeCount.settings = settings;
        return barcodeCount;
    }
    static get barcodeCountDefaults() {
        return getBarcodeCountDefaults();
    }
    constructor() {
        super();
        this.type = 'barcodeCount';
        this._feedback = BarcodeCountFeedback.default;
        this._isEnabled = true;
        this.listeners = [];
        this._additionalBarcodes = [];
        this.isInListenerCallback = false;
        this.privateContext = null;
        this.listenerController = BarcodeCountListenerController.forBarcodeCount(this);
        this._feedback.listenerController = this.listenerController;
    }
    applySettings(settings) {
        this.settings = settings;
        return this.didChange();
    }
    addListener(listener) {
        this.checkAndSubscribeListeners();
        if (this.listeners.includes(listener)) {
            return;
        }
        this.listeners.push(listener);
    }
    checkAndSubscribeListeners() {
        if (this.listeners.length === 0) {
            this.listenerController.subscribeListener();
        }
    }
    removeListener(listener) {
        if (!this.listeners.includes(listener)) {
            return;
        }
        this.listeners.splice(this.listeners.indexOf(listener));
        this.checkAndUnsubscribeListeners();
    }
    checkAndUnsubscribeListeners() {
        if (this.listeners.length === 0) {
            this.listenerController.unsubscribeListener();
        }
    }
    reset() {
        return this.listenerController.reset();
    }
    startScanningPhase() {
        this.listenerController.startScanningPhase();
    }
    endScanningPhase() {
        this.listenerController.endScanningPhase();
    }
    setBarcodeCountCaptureList(barcodeCountCaptureList) {
        this.listenerController.setBarcodeCountCaptureList(barcodeCountCaptureList);
    }
    setAdditionalBarcodes(barcodes) {
        this._additionalBarcodes = barcodes;
        return this.didChange();
    }
    clearAdditionalBarcodes() {
        this._additionalBarcodes = [];
        return this.didChange();
    }
    static get recommendedCameraSettings() {
        return BarcodeCount.barcodeCountDefaults.RecommendedCameraSettings;
    }
    didChange() {
        return this.listenerController.update();
    }
    unsubscribeNativeListeners() {
        this.listenerController.unsubscribeListener();
    }
}
__decorate([
    core.nameForSerialization('feedback')
], BarcodeCount.prototype, "_feedback", void 0);
__decorate([
    core.ignoreFromSerialization
], BarcodeCount.prototype, "_isEnabled", void 0);
__decorate([
    core.ignoreFromSerialization
], BarcodeCount.prototype, "listeners", void 0);
__decorate([
    core.nameForSerialization('additionalBarcodes')
], BarcodeCount.prototype, "_additionalBarcodes", void 0);
__decorate([
    core.ignoreFromSerialization
], BarcodeCount.prototype, "isInListenerCallback", void 0);
__decorate([
    core.ignoreFromSerialization
], BarcodeCount.prototype, "privateContext", void 0);
__decorate([
    core.ignoreFromSerialization
], BarcodeCount.prototype, "listenerController", void 0);
__decorate([
    core.ignoreFromSerialization
], BarcodeCount, "barcodeCountDefaults", null);

var BarcodeCountViewStyle;
(function (BarcodeCountViewStyle) {
    BarcodeCountViewStyle["Icon"] = "icon";
    BarcodeCountViewStyle["Dot"] = "dot";
})(BarcodeCountViewStyle || (BarcodeCountViewStyle = {}));

var BarcodeFilterHighlightType;
(function (BarcodeFilterHighlightType) {
    BarcodeFilterHighlightType["Brush"] = "brush";
})(BarcodeFilterHighlightType || (BarcodeFilterHighlightType = {}));

class BarcodeCountSettings extends core.DefaultSerializeable {
    static get barcodeCountDefaults() {
        return getBarcodeCountDefaults();
    }
    static get barcodeDefaults() {
        return getBarcodeDefaults();
    }
    constructor() {
        super();
        this.symbologies = {};
        this.properties = {};
        this._filterSettings = BarcodeCountSettings.barcodeCountDefaults.BarcodeCountSettings.barcodeFilterSettings;
        this._expectsOnlyUniqueBarcodes = BarcodeCountSettings.barcodeCountDefaults.BarcodeCountSettings.expectOnlyUniqueBarcodes;
        this._mappingEnabled = BarcodeCountSettings.barcodeCountDefaults.BarcodeCountSettings.mappingEnabled;
    }
    get expectsOnlyUniqueBarcodes() {
        return this._expectsOnlyUniqueBarcodes;
    }
    set expectsOnlyUniqueBarcodes(expectsOnlyUniqueBarcodes) {
        this._expectsOnlyUniqueBarcodes = expectsOnlyUniqueBarcodes;
    }
    get mappingEnabled() {
        return this._mappingEnabled;
    }
    set mappingEnabled(mappingEnabled) {
        this._mappingEnabled = mappingEnabled;
    }
    get filterSettings() {
        return this._filterSettings;
    }
    get enabledSymbologies() {
        return Object.keys(this.symbologies)
            .filter(symbology => this.symbologies[symbology].isEnabled);
    }
    settingsForSymbology(symbology) {
        if (!this.symbologies[symbology]) {
            const symbologySettings = BarcodeCountSettings.barcodeDefaults.SymbologySettings[symbology];
            symbologySettings._symbology = symbology;
            this.symbologies[symbology] = symbologySettings;
        }
        return this.symbologies[symbology];
    }
    enableSymbologies(symbologies) {
        symbologies.forEach(symbology => this.enableSymbology(symbology, true));
    }
    enableSymbology(symbology, enabled) {
        this.settingsForSymbology(symbology).isEnabled = enabled;
    }
    setProperty(name, value) {
        this.properties[name] = value;
    }
    getProperty(name) {
        return this.properties[name];
    }
}
__decorate([
    core.nameForSerialization('barcodeFilterSettings')
], BarcodeCountSettings.prototype, "_filterSettings", void 0);
__decorate([
    core.nameForSerialization('expectOnlyUniqueBarcodes')
], BarcodeCountSettings.prototype, "_expectsOnlyUniqueBarcodes", void 0);
__decorate([
    core.nameForSerialization('mappingEnabled')
], BarcodeCountSettings.prototype, "_mappingEnabled", void 0);
__decorate([
    core.ignoreFromSerialization
], BarcodeCountSettings, "barcodeCountDefaults", null);
__decorate([
    core.ignoreFromSerialization
], BarcodeCountSettings, "barcodeDefaults", null);

class BarcodeCountToolbarSettings extends core.DefaultSerializeable {
    constructor() {
        super(...arguments);
        this.audioOnButtonText = BarcodeCountToolbarSettings.barcodeCountDefaults.BarcodeCountView.toolbarSettings.audioOnButtonText;
        this.audioOffButtonText = BarcodeCountToolbarSettings.barcodeCountDefaults.BarcodeCountView.toolbarSettings.audioOffButtonText;
        this.audioButtonContentDescription = BarcodeCountToolbarSettings.barcodeCountDefaults.BarcodeCountView.toolbarSettings.audioButtonContentDescription;
        this.audioButtonAccessibilityHint = BarcodeCountToolbarSettings.barcodeCountDefaults.BarcodeCountView.toolbarSettings.audioButtonAccessibilityHint;
        this.audioButtonAccessibilityLabel = BarcodeCountToolbarSettings.barcodeCountDefaults.BarcodeCountView.toolbarSettings.audioButtonAccessibilityLabel;
        this.vibrationOnButtonText = BarcodeCountToolbarSettings.barcodeCountDefaults.BarcodeCountView.toolbarSettings.vibrationOnButtonText;
        this.vibrationOffButtonText = BarcodeCountToolbarSettings.barcodeCountDefaults.BarcodeCountView.toolbarSettings.vibrationOffButtonText;
        this.vibrationButtonContentDescription = BarcodeCountToolbarSettings.barcodeCountDefaults.BarcodeCountView.toolbarSettings.vibrationButtonContentDescription;
        this.vibrationButtonAccessibilityHint = BarcodeCountToolbarSettings.barcodeCountDefaults.BarcodeCountView.toolbarSettings.vibrationButtonAccessibilityHint;
        this.vibrationButtonAccessibilityLabel = BarcodeCountToolbarSettings.barcodeCountDefaults.BarcodeCountView.toolbarSettings.vibrationButtonAccessibilityLabel;
        this.strapModeOnButtonText = BarcodeCountToolbarSettings.barcodeCountDefaults.BarcodeCountView.toolbarSettings.strapModeOnButtonText;
        this.strapModeOffButtonText = BarcodeCountToolbarSettings.barcodeCountDefaults.BarcodeCountView.toolbarSettings.strapModeOffButtonText;
        this.strapModeButtonContentDescription = BarcodeCountToolbarSettings.barcodeCountDefaults.BarcodeCountView.toolbarSettings.strapModeButtonContentDescription;
        this.strapModeButtonAccessibilityHint = BarcodeCountToolbarSettings.barcodeCountDefaults.BarcodeCountView.toolbarSettings.strapModeButtonAccessibilityHint;
        this.strapModeButtonAccessibilityLabel = BarcodeCountToolbarSettings.barcodeCountDefaults.BarcodeCountView.toolbarSettings.strapModeButtonAccessibilityLabel;
        this.colorSchemeOnButtonText = BarcodeCountToolbarSettings.barcodeCountDefaults.BarcodeCountView.toolbarSettings.colorSchemeOnButtonText;
        this.colorSchemeOffButtonText = BarcodeCountToolbarSettings.barcodeCountDefaults.BarcodeCountView.toolbarSettings.colorSchemeOffButtonText;
        this.colorSchemeButtonContentDescription = BarcodeCountToolbarSettings.barcodeCountDefaults.BarcodeCountView.toolbarSettings.colorSchemeButtonContentDescription;
        this.colorSchemeButtonAccessibilityHint = BarcodeCountToolbarSettings.barcodeCountDefaults.BarcodeCountView.toolbarSettings.colorSchemeButtonAccessibilityHint;
        this.colorSchemeButtonAccessibilityLabel = BarcodeCountToolbarSettings.barcodeCountDefaults.BarcodeCountView.toolbarSettings.colorSchemeButtonAccessibilityLabel;
    }
    static get barcodeCountDefaults() {
        return getBarcodeCountDefaults();
    }
}
__decorate([
    core.ignoreFromSerialization
], BarcodeCountToolbarSettings, "barcodeCountDefaults", null);

var BarcodeCountViewEvents;
(function (BarcodeCountViewEvents) {
    BarcodeCountViewEvents["singleScanButtonTapped"] = "BarcodeCountViewUiListener.onSingleScanButtonTapped";
    BarcodeCountViewEvents["listButtonTapped"] = "BarcodeCountViewUiListener.onListButtonTapped";
    BarcodeCountViewEvents["exitButtonTapped"] = "BarcodeCountViewUiListener.onExitButtonTapped";
    BarcodeCountViewEvents["brushForRecognizedBarcode"] = "BarcodeCountViewListener.brushForRecognizedBarcode";
    BarcodeCountViewEvents["brushForRecognizedBarcodeNotInList"] = "BarcodeCountViewListener.brushForRecognizedBarcodeNotInList";
    BarcodeCountViewEvents["brushForAcceptedBarcode"] = "BarcodeCountViewListener.brushForAcceptedBarcode";
    BarcodeCountViewEvents["brushForRejectedBarcode"] = "BarcodeCountViewListener.brushForRejectedBarcode";
    BarcodeCountViewEvents["filteredBarcodeTapped"] = "BarcodeCountViewListener.didTapFilteredBarcode";
    BarcodeCountViewEvents["recognizedBarcodeNotInListTapped"] = "BarcodeCountViewListener.didTapRecognizedBarcodeNotInList";
    BarcodeCountViewEvents["recognizedBarcodeTapped"] = "BarcodeCountViewListener.didTapRecognizedBarcode";
    BarcodeCountViewEvents["acceptedBarcodeTapped"] = "BarcodeCountViewListener.didTapAcceptedBarcode";
    BarcodeCountViewEvents["rejectedBarcodeTapped"] = "BarcodeCountViewListener.didTapRejectedBarcode";
    BarcodeCountViewEvents["captureListCompleted"] = "BarcodeCountViewListener.didCompleteCaptureList";
})(BarcodeCountViewEvents || (BarcodeCountViewEvents = {}));

class BarcodeCountViewController extends core.BaseController {
    static forBarcodeCountAndBarcodeCountView(view, barcodeCount) {
        const controller = new BarcodeCountViewController({ view, barcodeCount });
        // We call update because it returns a promise, this guarantees, that by the time
        // we need the deserialized context, it will be set in the native layer.
        return controller;
    }
    constructor({ view, barcodeCount }) {
        super('BarcodeCountViewProxy');
        this.view = view;
        this.barcodeCount = barcodeCount;
    }
    initialize(autoCreateNativeView) {
        return __awaiter(this, void 0, void 0, function* () {
            const context = this.view.context;
            yield context.initializeAsync();
            yield context.update();
            if (autoCreateNativeView) {
                yield this.createView();
            }
            yield this.subscribeListeners();
        });
    }
    update() {
        const barcodeCountView = this.view.toJSON();
        const json = barcodeCountView.View;
        return this._proxy.updateView(JSON.stringify(json));
    }
    createNativeView() {
        return this.createView();
    }
    removeNativeView() {
        var _a, _b, _c;
        return (_c = (_b = (_a = this._proxy).removeView) === null || _b === void 0 ? void 0 : _b.call(_a)) !== null && _c !== void 0 ? _c : Promise.resolve();
    }
    createView() {
        const barcodeCountViewSerialized = this.view.toJSON();
        const barcodeCountSerialized = this.view._barcodeCount.toJSON();
        const viewJson = JSON.stringify({
            BarcodeCount: barcodeCountSerialized,
            View: barcodeCountViewSerialized
        });
        return this._proxy.createView(this.view.nativeView, viewJson);
    }
    setUiListener(listener) {
        return __awaiter(this, void 0, void 0, function* () {
            if (listener != null) {
                yield this._proxy.registerBarcodeCountViewUiListener();
            }
            else {
                yield this._proxy.unregisterBarcodeCountViewUiListener();
            }
        });
    }
    setViewListener(listener) {
        return __awaiter(this, void 0, void 0, function* () {
            if (listener != null) {
                yield this._proxy.registerBarcodeCountViewListener();
            }
            else {
                yield this._proxy.unregisterBarcodeCountViewListener();
            }
        });
    }
    clearHighlights() {
        return __awaiter(this, void 0, void 0, function* () {
            yield this._proxy.clearHighlights();
        });
    }
    dispose() {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.unsubscribeListeners();
        });
    }
    setPositionAndSize(top, left, width, height, shouldBeUnderWebView) {
        return this._proxy.setPositionAndSize(top, left, width, height, shouldBeUnderWebView);
    }
    show() {
        if (!this.view.context) {
            throw new Error('There should be a context attached to a view that should be shown');
        }
        return this._proxy.show();
    }
    hide() {
        if (!this.view.context) {
            throw new Error('There should be a context attached to a view that should be shown');
        }
        return this._proxy.hide();
    }
    setBrushForRecognizedBarcode(trackedBarcode, brush) {
        const payload = this.buildTrackedBarcodeBrushPayload(trackedBarcode, brush);
        return this._proxy.finishBrushForRecognizedBarcodeCallback(this.view.nativeView, payload.brush, payload.trackedBarcodeID);
    }
    setBrushForRecognizedBarcodeNotInList(trackedBarcode, brush) {
        const payload = this.buildTrackedBarcodeBrushPayload(trackedBarcode, brush);
        return this._proxy.finishBrushForRecognizedBarcodeNotInListCallback(this.view.nativeView, payload.brush, payload.trackedBarcodeID);
    }
    setBrushForAcceptedBarcode(trackedBarcode, brush) {
        const payload = this.buildTrackedBarcodeBrushPayload(trackedBarcode, brush);
        return this._proxy.finishBrushForAcceptedBarcodeCallback(this.view.nativeView, payload.brush, payload.trackedBarcodeID);
    }
    setBrushForRejectedBarcode(trackedBarcode, brush) {
        const payload = this.buildTrackedBarcodeBrushPayload(trackedBarcode, brush);
        return this._proxy.finishBrushForRejectedBarcodeCallback(this.view.nativeView, payload.brush, payload.trackedBarcodeID);
    }
    enableHardwareTrigger(hardwareTriggerKeyCode) {
        return this._proxy.enableHardwareTrigger(hardwareTriggerKeyCode);
    }
    buildTrackedBarcodeBrushPayload(trackedBarcode, brush) {
        return {
            trackedBarcodeID: trackedBarcode.identifier,
            brush: brush ? JSON.stringify(brush.toJSON()) : null,
        };
    }
    subscribeListeners() {
        return __awaiter(this, void 0, void 0, function* () {
            yield this._proxy.subscribeListeners();
            this.eventEmitter.on(BarcodeCountViewEvents.singleScanButtonTapped, () => {
                var _a, _b;
                (_b = (_a = this.view.uiListener) === null || _a === void 0 ? void 0 : _a.didTapSingleScanButton) === null || _b === void 0 ? void 0 : _b.call(_a, this.view.nativeView);
            });
            this.eventEmitter.on(BarcodeCountViewEvents.listButtonTapped, () => {
                var _a, _b;
                (_b = (_a = this.view.uiListener) === null || _a === void 0 ? void 0 : _a.didTapListButton) === null || _b === void 0 ? void 0 : _b.call(_a, this.view.nativeView);
            });
            this.eventEmitter.on(BarcodeCountViewEvents.exitButtonTapped, () => {
                var _a, _b;
                (_b = (_a = this.view.uiListener) === null || _a === void 0 ? void 0 : _a.didTapExitButton) === null || _b === void 0 ? void 0 : _b.call(_a, this.view.nativeView);
            });
            this.eventEmitter.on(BarcodeCountViewEvents.brushForRecognizedBarcode, (data) => __awaiter(this, void 0, void 0, function* () {
                const payload = core.EventDataParser.parse(data);
                if (payload === null) {
                    console.error('BarcodeCountViewController brushForRecognizedBarcode payload is null');
                    return;
                }
                const trackedBarcode = TrackedBarcode
                    .fromJSON(JSON.parse(payload.trackedBarcode));
                let brush = this.view.recognizedBrush;
                if (this.view.listener && this.view.listener.brushForRecognizedBarcode) {
                    brush = this.view.listener.brushForRecognizedBarcode(this.view.nativeView, trackedBarcode);
                }
                const finishPayload = this.buildTrackedBarcodeBrushPayload(trackedBarcode, brush);
                yield this._proxy.finishBrushForRecognizedBarcodeCallback(this.view.nativeView, finishPayload.brush, finishPayload.trackedBarcodeID);
            }));
            this.eventEmitter.on(BarcodeCountViewEvents.brushForRecognizedBarcodeNotInList, (data) => __awaiter(this, void 0, void 0, function* () {
                const payload = core.EventDataParser.parse(data);
                if (payload === null) {
                    console.error('BarcodeCountViewController brushForRecognizedBarcodeNotInList payload is null');
                    return;
                }
                const trackedBarcode = TrackedBarcode
                    .fromJSON(JSON.parse(payload.trackedBarcode));
                let brush = this.view.notInListBrush;
                if (this.view.listener && this.view.listener.brushForRecognizedBarcodeNotInList) {
                    brush = this.view.listener.brushForRecognizedBarcodeNotInList(this.view.nativeView, trackedBarcode);
                }
                const finishPayload = this.buildTrackedBarcodeBrushPayload(trackedBarcode, brush);
                yield this._proxy.finishBrushForRecognizedBarcodeNotInListCallback(this.view.nativeView, finishPayload.brush, finishPayload.trackedBarcodeID);
            }));
            this.eventEmitter.on(BarcodeCountViewEvents.brushForAcceptedBarcode, (data) => __awaiter(this, void 0, void 0, function* () {
                const payload = core.EventDataParser.parse(data);
                if (payload === null) {
                    console.error('BarcodeCountViewController brushForAcceptedBarcode payload is null');
                    return;
                }
                const trackedBarcode = TrackedBarcode
                    .fromJSON(JSON.parse(payload.trackedBarcode));
                let brush = this.view.acceptedBrush;
                if (this.view.listener && this.view.listener.brushForAcceptedBarcode) {
                    brush = this.view.listener.brushForAcceptedBarcode(this.view.nativeView, trackedBarcode);
                }
                const finishPayload = this.buildTrackedBarcodeBrushPayload(trackedBarcode, brush);
                yield this._proxy.finishBrushForAcceptedBarcodeCallback(this.view.nativeView, finishPayload.brush, finishPayload.trackedBarcodeID);
            }));
            this.eventEmitter.on(BarcodeCountViewEvents.brushForRejectedBarcode, (data) => __awaiter(this, void 0, void 0, function* () {
                const payload = core.EventDataParser.parse(data);
                if (payload === null) {
                    console.error('BarcodeCountViewController brushForRejectedBarcode payload is null');
                    return;
                }
                const trackedBarcode = TrackedBarcode
                    .fromJSON(JSON.parse(payload.trackedBarcode));
                let brush = this.view.rejectedBrush;
                if (this.view.listener && this.view.listener.brushForRejectedBarcode) {
                    brush = this.view.listener.brushForRejectedBarcode(this.view.nativeView, trackedBarcode);
                }
                const finishPayload = this.buildTrackedBarcodeBrushPayload(trackedBarcode, brush);
                yield this._proxy.finishBrushForRejectedBarcodeCallback(this.view.nativeView, finishPayload.brush, finishPayload.trackedBarcodeID);
            }));
            this.eventEmitter.on(BarcodeCountViewEvents.filteredBarcodeTapped, (data) => {
                const payload = core.EventDataParser.parse(data);
                if (payload === null) {
                    console.error('BarcodeCountViewController filteredBarcodeTapped payload is null');
                    return;
                }
                const trackedBarcode = TrackedBarcode
                    .fromJSON(JSON.parse(payload.trackedBarcode));
                if (this.view.listener && this.view.listener.didTapFilteredBarcode) {
                    this.view.listener.didTapFilteredBarcode(this.view.nativeView, trackedBarcode);
                }
            });
            this.eventEmitter.on(BarcodeCountViewEvents.recognizedBarcodeNotInListTapped, (data) => {
                const payload = core.EventDataParser.parse(data);
                if (payload === null) {
                    console.error('BarcodeCountViewController recognizedBarcodeNotInListTapped payload is null');
                    return;
                }
                const trackedBarcode = TrackedBarcode
                    .fromJSON(JSON.parse(payload.trackedBarcode));
                if (this.view.listener && this.view.listener.didTapRecognizedBarcodeNotInList) {
                    this.view.listener.didTapRecognizedBarcodeNotInList(this.view.nativeView, trackedBarcode);
                }
            });
            this.eventEmitter.on(BarcodeCountViewEvents.recognizedBarcodeTapped, (data) => {
                const payload = core.EventDataParser.parse(data);
                if (payload === null) {
                    console.error('BarcodeCountViewController recognizedBarcodeTapped payload is null');
                    return;
                }
                const trackedBarcode = TrackedBarcode
                    .fromJSON(JSON.parse(payload.trackedBarcode));
                if (this.view.listener && this.view.listener.didTapRecognizedBarcode) {
                    this.view.listener.didTapRecognizedBarcode(this.view.nativeView, trackedBarcode);
                }
            });
            this.eventEmitter.on(BarcodeCountViewEvents.acceptedBarcodeTapped, (data) => {
                const payload = core.EventDataParser.parse(data);
                if (payload === null) {
                    console.error('BarcodeCountViewController acceptedBarcodeTapped payload is null');
                    return;
                }
                const trackedBarcode = TrackedBarcode
                    .fromJSON(JSON.parse(payload.trackedBarcode));
                if (this.view.listener && this.view.listener.didTapAcceptedBarcode) {
                    this.view.listener.didTapAcceptedBarcode(this.view.nativeView, trackedBarcode);
                }
            });
            this.eventEmitter.on(BarcodeCountViewEvents.rejectedBarcodeTapped, (data) => {
                const payload = core.EventDataParser.parse(data);
                if (payload === null) {
                    console.error('BarcodeCountViewController rejectedBarcodeTapped payload is null');
                    return;
                }
                const trackedBarcode = TrackedBarcode
                    .fromJSON(JSON.parse(payload.trackedBarcode));
                if (this.view.listener && this.view.listener.didTapRejectedBarcode) {
                    this.view.listener.didTapRejectedBarcode(this.view.nativeView, trackedBarcode);
                }
            });
            this.eventEmitter.on(BarcodeCountViewEvents.captureListCompleted, () => {
                if (this.view.listener && this.view.listener.didCompleteCaptureList) {
                    this.view.listener.didCompleteCaptureList(this.view.nativeView);
                }
            });
        });
    }
    unsubscribeListeners() {
        return __awaiter(this, void 0, void 0, function* () {
            yield this._proxy.unsubscribeListeners();
            yield this._proxy.unregisterBarcodeCountViewListener();
            yield this._proxy.unregisterBarcodeCountViewUiListener();
            this.eventEmitter.off(BarcodeCountViewEvents.singleScanButtonTapped);
            this.eventEmitter.off(BarcodeCountViewEvents.listButtonTapped);
            this.eventEmitter.off(BarcodeCountViewEvents.exitButtonTapped);
            this.eventEmitter.off(BarcodeCountViewEvents.brushForRecognizedBarcode);
            this.eventEmitter.off(BarcodeCountViewEvents.brushForRecognizedBarcodeNotInList);
            this.eventEmitter.off(BarcodeCountViewEvents.filteredBarcodeTapped);
            this.eventEmitter.off(BarcodeCountViewEvents.recognizedBarcodeNotInListTapped);
            this.eventEmitter.off(BarcodeCountViewEvents.recognizedBarcodeTapped);
            this.eventEmitter.off(BarcodeCountViewEvents.captureListCompleted);
        });
    }
}

class BarcodeCountNotInListActionSettings extends core.DefaultSerializeable {
    constructor() {
        super(...arguments);
        this._enabled = false;
        this._acceptButtonText = "";
        this._acceptButtonAccessibilityLabel = "";
        this._acceptButtonAccessibilityHint = "";
        this._acceptButtonContentDescription = "";
        this._rejectButtonText = "";
        this._rejectButtonAccessibilityLabel = "";
        this._rejectButtonAccessibilityHint = "";
        this._rejectButtonContentDescription = "";
        this._cancelButtonText = "";
        this._cancelButtonAccessibilityLabel = "";
        this._cancelButtonAccessibilityHint = "";
        this._cancelButtonContentDescription = "";
        this._barcodeAcceptedHint = "";
        this._barcodeRejectedHint = "";
    }
    static barcodeCountDefaults() {
        return getBarcodeCountDefaults();
    }
    get enabled() {
        return this._enabled;
    }
    set enabled(newValue) {
        this._enabled = newValue;
    }
    get acceptButtonText() {
        return this._acceptButtonText;
    }
    set acceptButtonText(newValue) {
        this._acceptButtonText = newValue;
    }
    get acceptButtonAccessibilityLabel() {
        return this._acceptButtonAccessibilityLabel;
    }
    set acceptButtonAccessibilityLabel(newValue) {
        this._acceptButtonAccessibilityLabel = newValue;
    }
    get acceptButtonAccessibilityHint() {
        return this._acceptButtonAccessibilityHint;
    }
    set acceptButtonAccessibilityHint(value) {
        this._acceptButtonAccessibilityHint = value;
    }
    get acceptButtonContentDescription() {
        return this._acceptButtonContentDescription;
    }
    set acceptButtonContentDescription(value) {
        this._acceptButtonContentDescription = value;
    }
    get rejectButtonText() {
        return this._rejectButtonText;
    }
    set rejectButtonText(value) {
        this._rejectButtonText = value;
    }
    get rejectButtonAccessibilityLabel() {
        return this._rejectButtonAccessibilityLabel;
    }
    set rejectButtonAccessibilityLabel(value) {
        this._rejectButtonAccessibilityLabel = value;
    }
    get rejectButtonAccessibilityHint() {
        return this._rejectButtonAccessibilityHint;
    }
    set rejectButtonAccessibilityHint(value) {
        this._rejectButtonAccessibilityHint = value;
    }
    get rejectButtonContentDescription() {
        return this._rejectButtonContentDescription;
    }
    set rejectButtonContentDescription(value) {
        this._rejectButtonContentDescription = value;
    }
    get cancelButtonText() {
        return this._cancelButtonText;
    }
    set cancelButtonText(value) {
        this._cancelButtonText = value;
    }
    get cancelButtonAccessibilityLabel() {
        return this._cancelButtonAccessibilityLabel;
    }
    set cancelButtonAccessibilityLabel(value) {
        this._cancelButtonAccessibilityLabel = value;
    }
    get cancelButtonAccessibilityHint() {
        return this._cancelButtonAccessibilityHint;
    }
    set cancelButtonAccessibilityHint(value) {
        this._cancelButtonAccessibilityHint = value;
    }
    get cancelButtonContentDescription() {
        return this._cancelButtonContentDescription;
    }
    set cancelButtonContentDescription(value) {
        this._cancelButtonContentDescription = value;
    }
    get barcodeAcceptedHint() {
        return this._barcodeAcceptedHint;
    }
    set barcodeAcceptedHint(value) {
        this._barcodeAcceptedHint = value;
    }
    get barcodeRejectedHint() {
        return this._barcodeRejectedHint;
    }
    set barcodeRejectedHint(value) {
        this._barcodeRejectedHint = value;
    }
}
__decorate([
    core.nameForSerialization('enabled')
], BarcodeCountNotInListActionSettings.prototype, "_enabled", void 0);
__decorate([
    core.nameForSerialization('acceptButtonText')
], BarcodeCountNotInListActionSettings.prototype, "_acceptButtonText", void 0);
__decorate([
    core.nameForSerialization('acceptButtonAccessibilityLabel')
], BarcodeCountNotInListActionSettings.prototype, "_acceptButtonAccessibilityLabel", void 0);
__decorate([
    core.nameForSerialization('acceptButtonAccessibilityHint')
], BarcodeCountNotInListActionSettings.prototype, "_acceptButtonAccessibilityHint", void 0);
__decorate([
    core.nameForSerialization('acceptButtonContentDescription')
], BarcodeCountNotInListActionSettings.prototype, "_acceptButtonContentDescription", void 0);
__decorate([
    core.nameForSerialization('rejectButtonText')
], BarcodeCountNotInListActionSettings.prototype, "_rejectButtonText", void 0);
__decorate([
    core.nameForSerialization('rejectButtonAccessibilityLabel')
], BarcodeCountNotInListActionSettings.prototype, "_rejectButtonAccessibilityLabel", void 0);
__decorate([
    core.nameForSerialization('rejectButtonAccessibilityHint')
], BarcodeCountNotInListActionSettings.prototype, "_rejectButtonAccessibilityHint", void 0);
__decorate([
    core.nameForSerialization('rejectButtonContentDescription')
], BarcodeCountNotInListActionSettings.prototype, "_rejectButtonContentDescription", void 0);
__decorate([
    core.nameForSerialization('cancelButtonText')
], BarcodeCountNotInListActionSettings.prototype, "_cancelButtonText", void 0);
__decorate([
    core.nameForSerialization('cancelButtonAccessibilityLabel')
], BarcodeCountNotInListActionSettings.prototype, "_cancelButtonAccessibilityLabel", void 0);
__decorate([
    core.nameForSerialization('cancelButtonAccessibilityHint')
], BarcodeCountNotInListActionSettings.prototype, "_cancelButtonAccessibilityHint", void 0);
__decorate([
    core.nameForSerialization('cancelButtonContentDescription')
], BarcodeCountNotInListActionSettings.prototype, "_cancelButtonContentDescription", void 0);
__decorate([
    core.nameForSerialization('barcodeAcceptedHint')
], BarcodeCountNotInListActionSettings.prototype, "_barcodeAcceptedHint", void 0);
__decorate([
    core.nameForSerialization('barcodeRejectedHint')
], BarcodeCountNotInListActionSettings.prototype, "_barcodeRejectedHint", void 0);

class BaseBarcodeCountView {
    static get defaultRecognizedBrush() {
        return BaseBarcodeCountView.barcodeCountDefaults.BarcodeCountView.defaultRecognizedBrush;
    }
    static get defaultNotInListBrush() {
        return BaseBarcodeCountView.barcodeCountDefaults.BarcodeCountView.defaultNotInListBrush;
    }
    static get defaultAcceptedBrush() {
        return BaseBarcodeCountView.barcodeCountDefaults.BarcodeCountView.defaultAcceptedBrush;
    }
    static get defaultRejectedBrush() {
        return BaseBarcodeCountView.barcodeCountDefaults.BarcodeCountView.defaultRejectedBrush;
    }
    static get hardwareTriggerSupported() {
        return BaseBarcodeCountView.barcodeCountDefaults.BarcodeCountView.hardwareTriggerSupported;
    }
    get uiListener() {
        return this._uiListener;
    }
    set uiListener(listener) {
        this._uiListener = listener;
        this._controller.setUiListener(listener);
    }
    get listener() {
        return this._listener;
    }
    set listener(listener) {
        this._listener = listener;
        this._controller.setViewListener(listener);
    }
    get shouldDisableModeOnExitButtonTapped() {
        return this._shouldDisableModeOnExitButtonTapped;
    }
    set shouldDisableModeOnExitButtonTapped(newValue) {
        this._shouldDisableModeOnExitButtonTapped = newValue;
        this.updateNative();
    }
    get shouldShowUserGuidanceView() {
        return this._shouldShowUserGuidanceView;
    }
    set shouldShowUserGuidanceView(newValue) {
        this._shouldShowUserGuidanceView = newValue;
        this.updateNative();
    }
    get shouldShowListButton() {
        return this._shouldShowListButton;
    }
    set shouldShowListButton(newValue) {
        this._shouldShowListButton = newValue;
        this.updateNative();
    }
    get shouldShowExitButton() {
        return this._shouldShowExitButton;
    }
    set shouldShowExitButton(newValue) {
        this._shouldShowExitButton = newValue;
        this.updateNative();
    }
    get shouldShowShutterButton() {
        return this._shouldShowShutterButton;
    }
    set shouldShowShutterButton(newValue) {
        this._shouldShowShutterButton = newValue;
        this.updateNative();
    }
    get shouldShowHints() {
        return this._shouldShowHints;
    }
    set shouldShowHints(newValue) {
        this._shouldShowHints = newValue;
        this.updateNative();
    }
    get shouldShowClearHighlightsButton() {
        return this._shouldShowClearHighlightsButton;
    }
    set shouldShowClearHighlightsButton(newValue) {
        this._shouldShowClearHighlightsButton = newValue;
        this.updateNative();
    }
    get shouldShowSingleScanButton() {
        return this._shouldShowSingleScanButton;
    }
    set shouldShowSingleScanButton(newValue) {
        this._shouldShowSingleScanButton = newValue;
        this.updateNative();
    }
    get shouldShowFloatingShutterButton() {
        return this._shouldShowFloatingShutterButton;
    }
    set shouldShowFloatingShutterButton(newValue) {
        this._shouldShowFloatingShutterButton = newValue;
        this.updateNative();
    }
    get shouldShowToolbar() {
        return this._shouldShowToolbar;
    }
    set shouldShowToolbar(newValue) {
        this._shouldShowToolbar = newValue;
        this.updateNative();
    }
    get shouldShowScanAreaGuides() {
        return this._shouldShowScanAreaGuides;
    }
    set shouldShowScanAreaGuides(newValue) {
        this._shouldShowScanAreaGuides = newValue;
        this.updateNative();
    }
    get recognizedBrush() {
        return this._recognizedBrush;
    }
    set recognizedBrush(newValue) {
        this._recognizedBrush = newValue;
        this.updateNative();
    }
    get notInListBrush() {
        return this._notInListBrush;
    }
    set notInListBrush(newValue) {
        this._notInListBrush = newValue;
        this.updateNative();
    }
    get acceptedBrush() {
        return this._acceptedBrush;
    }
    set acceptedBrush(value) {
        this._acceptedBrush = value;
        this.updateNative();
    }
    get rejectedBrush() {
        return this._rejectedBrush;
    }
    set rejectedBrush(value) {
        this._rejectedBrush = value;
        this.updateNative();
    }
    get filterSettings() {
        return this._filterSettings;
    }
    set filterSettings(newValue) {
        this._filterSettings = newValue;
        this.updateNative();
    }
    get style() {
        return this._style;
    }
    get listButtonAccessibilityHint() {
        return this._listButtonAccessibilityHint;
    }
    set listButtonAccessibilityHint(newValue) {
        this._listButtonAccessibilityHint = newValue;
        this.updateNative();
    }
    get listButtonAccessibilityLabel() {
        return this._listButtonAccessibilityLabel;
    }
    set listButtonAccessibilityLabel(newValue) {
        this._listButtonAccessibilityLabel = newValue;
        this.updateNative();
    }
    get listButtonContentDescription() {
        return this._listButtonContentDescription;
    }
    set listButtonContentDescription(newValue) {
        this._listButtonContentDescription = newValue;
        this.updateNative();
    }
    get exitButtonAccessibilityHint() {
        return this._exitButtonAccessibilityHint;
    }
    set exitButtonAccessibilityHint(newValue) {
        this._exitButtonAccessibilityHint = newValue;
        this.updateNative();
    }
    get exitButtonAccessibilityLabel() {
        return this._exitButtonAccessibilityLabel;
    }
    set exitButtonAccessibilityLabel(newValue) {
        this._exitButtonAccessibilityLabel = newValue;
        this.updateNative();
    }
    get exitButtonContentDescription() {
        return this._exitButtonContentDescription;
    }
    set exitButtonContentDescription(newValue) {
        this._exitButtonContentDescription = newValue;
        this.updateNative();
    }
    get shutterButtonAccessibilityHint() {
        return this._shutterButtonAccessibilityHint;
    }
    set shutterButtonAccessibilityHint(newValue) {
        this._shutterButtonAccessibilityHint = newValue;
        this.updateNative();
    }
    get shutterButtonAccessibilityLabel() {
        return this._shutterButtonAccessibilityLabel;
    }
    set shutterButtonAccessibilityLabel(newValue) {
        this._shutterButtonAccessibilityLabel = newValue;
        this.updateNative();
    }
    get shutterButtonContentDescription() {
        return this._shutterButtonContentDescription;
    }
    set shutterButtonContentDescription(newValue) {
        this._shutterButtonContentDescription = newValue;
        this.updateNative();
    }
    get floatingShutterButtonAccessibilityHint() {
        return this._floatingShutterButtonAccessibilityHint;
    }
    set floatingShutterButtonAccessibilityHint(newValue) {
        this._floatingShutterButtonAccessibilityHint = newValue;
        this.updateNative();
    }
    get floatingShutterButtonAccessibilityLabel() {
        return this._floatingShutterButtonAccessibilityLabel;
    }
    set floatingShutterButtonAccessibilityLabel(newValue) {
        this._floatingShutterButtonAccessibilityLabel = newValue;
        this.updateNative();
    }
    get floatingShutterButtonContentDescription() {
        return this._floatingShutterButtonContentDescription;
    }
    set floatingShutterButtonContentDescription(newValue) {
        this._floatingShutterButtonContentDescription = newValue;
        this.updateNative();
    }
    get clearHighlightsButtonAccessibilityHint() {
        return this._clearHighlightsButtonAccessibilityHint;
    }
    set clearHighlightsButtonAccessibilityHint(newValue) {
        this._clearHighlightsButtonAccessibilityHint = newValue;
        this.updateNative();
    }
    get clearHighlightsButtonAccessibilityLabel() {
        return this._clearHighlightsButtonAccessibilityLabel;
    }
    set clearHighlightsButtonAccessibilityLabel(newValue) {
        this._clearHighlightsButtonAccessibilityLabel = newValue;
        this.updateNative();
    }
    get clearHighlightsButtonContentDescription() {
        return this._clearHighlightsButtonContentDescription;
    }
    set clearHighlightsButtonContentDescription(newValue) {
        this._clearHighlightsButtonContentDescription = newValue;
        this.updateNative();
    }
    get singleScanButtonAccessibilityHint() {
        return this._singleScanButtonAccessibilityHint;
    }
    set singleScanButtonAccessibilityHint(newValue) {
        this._singleScanButtonAccessibilityHint = newValue;
        this.updateNative();
    }
    get singleScanButtonAccessibilityLabel() {
        return this._singleScanButtonAccessibilityLabel;
    }
    set singleScanButtonAccessibilityLabel(newValue) {
        this._singleScanButtonAccessibilityLabel = newValue;
        this.updateNative();
    }
    get singleScanButtonContentDescription() {
        return this._singleScanButtonContentDescription;
    }
    set singleScanButtonContentDescription(newValue) {
        this._singleScanButtonContentDescription = newValue;
        this.updateNative();
    }
    get clearHighlightsButtonText() {
        return this._clearHighlightsButtonText;
    }
    set clearHighlightsButtonText(newValue) {
        this._clearHighlightsButtonText = newValue;
        this.updateNative();
    }
    get exitButtonText() {
        return this._exitButtonText;
    }
    set exitButtonText(newValue) {
        this._exitButtonText = newValue;
        this.updateNative();
    }
    get textForTapShutterToScanHint() {
        return this._textForTapShutterToScanHint;
    }
    set textForTapShutterToScanHint(newValue) {
        this._textForTapShutterToScanHint = newValue;
        this.updateNative();
    }
    get textForScanningHint() {
        return this._textForScanningHint;
    }
    set textForScanningHint(newValue) {
        this._textForScanningHint = newValue;
        this.updateNative();
    }
    get textForMoveCloserAndRescanHint() {
        return this._textForMoveCloserAndRescanHint;
    }
    set textForMoveCloserAndRescanHint(newValue) {
        this._textForMoveCloserAndRescanHint = newValue;
        this.updateNative();
    }
    get textForMoveFurtherAndRescanHint() {
        return this._textForMoveFurtherAndRescanHint;
    }
    set textForMoveFurtherAndRescanHint(newValue) {
        this._textForMoveFurtherAndRescanHint = newValue;
        this.updateNative();
    }
    get shouldShowListProgressBar() {
        return this._shouldShowListProgressBar;
    }
    set shouldShowListProgressBar(newValue) {
        this._shouldShowListProgressBar = newValue;
        this.updateNative();
    }
    get shouldShowTorchControl() {
        return this._shouldShowTorchControl;
    }
    set shouldShowTorchControl(newValue) {
        this._shouldShowTorchControl = newValue;
        this.updateNative();
    }
    get torchControlPosition() {
        return this._torchControlPosition;
    }
    set torchControlPosition(newValue) {
        this._torchControlPosition = newValue;
        this.updateNative();
    }
    get tapToUncountEnabled() {
        return this._tapToUncountEnabled;
    }
    set tapToUncountEnabled(newValue) {
        this._tapToUncountEnabled = newValue;
        this.updateNative();
    }
    get textForTapToUncountHint() {
        return this._textForTapToUncountHint;
    }
    set textForTapToUncountHint(newValue) {
        this._textForTapToUncountHint = newValue;
        this.updateNative();
    }
    get barcodeNotInListActionSettings() {
        return this._barcodeNotInListActionSettings;
    }
    set barcodeNotInListActionSettings(value) {
        this._barcodeNotInListActionSettings = value;
        this.updateNative();
    }
    get hardwareTriggerEnabled() {
        return this._hardwareTriggerEnabled;
    }
    set hardwareTriggerEnabled(newValue) {
        this._hardwareTriggerEnabled = newValue;
        this.updateNative();
    }
    static get barcodeCountDefaults() {
        return getBarcodeCountDefaults();
    }
    get context() {
        return this._context;
    }
    constructor({ context, barcodeCount, style, nativeView, autoCreateNativeView = true }) {
        this._uiListener = null;
        this._listener = null;
        this._shouldDisableModeOnExitButtonTapped = BaseBarcodeCountView.barcodeCountDefaults.BarcodeCountView.shouldDisableModeOnExitButtonTapped;
        this._shouldShowUserGuidanceView = BaseBarcodeCountView.barcodeCountDefaults.BarcodeCountView.shouldShowUserGuidanceView;
        this._shouldShowListButton = BaseBarcodeCountView.barcodeCountDefaults.BarcodeCountView.shouldShowListButton;
        this._shouldShowExitButton = BaseBarcodeCountView.barcodeCountDefaults.BarcodeCountView.shouldShowExitButton;
        this._shouldShowShutterButton = BaseBarcodeCountView.barcodeCountDefaults.BarcodeCountView.shouldShowShutterButton;
        this._shouldShowHints = BaseBarcodeCountView.barcodeCountDefaults.BarcodeCountView.shouldShowHints;
        this._shouldShowClearHighlightsButton = BaseBarcodeCountView.barcodeCountDefaults.BarcodeCountView.shouldShowClearHighlightsButton;
        this._shouldShowSingleScanButton = BaseBarcodeCountView.barcodeCountDefaults.BarcodeCountView.shouldShowSingleScanButton;
        this._shouldShowFloatingShutterButton = BaseBarcodeCountView.barcodeCountDefaults.BarcodeCountView.shouldShowFloatingShutterButton;
        this._shouldShowToolbar = BaseBarcodeCountView.barcodeCountDefaults.BarcodeCountView.shouldShowToolbar;
        this._shouldShowScanAreaGuides = BaseBarcodeCountView.barcodeCountDefaults.BarcodeCountView.shouldShowScanAreaGuides;
        this._recognizedBrush = BaseBarcodeCountView.barcodeCountDefaults.BarcodeCountView.defaultRecognizedBrush;
        this._notInListBrush = BaseBarcodeCountView.barcodeCountDefaults.BarcodeCountView.defaultNotInListBrush;
        this._acceptedBrush = BaseBarcodeCountView.barcodeCountDefaults.BarcodeCountView.defaultAcceptedBrush;
        this._rejectedBrush = BaseBarcodeCountView.barcodeCountDefaults.BarcodeCountView.defaultRejectedBrush;
        this._filterSettings = null;
        this._listButtonAccessibilityHint = BaseBarcodeCountView.barcodeCountDefaults.BarcodeCountView.listButtonAccessibilityHint;
        this._listButtonAccessibilityLabel = BaseBarcodeCountView.barcodeCountDefaults.BarcodeCountView.listButtonAccessibilityLabel;
        this._listButtonContentDescription = BaseBarcodeCountView.barcodeCountDefaults.BarcodeCountView.listButtonContentDescription;
        this._exitButtonAccessibilityHint = BaseBarcodeCountView.barcodeCountDefaults.BarcodeCountView.exitButtonAccessibilityHint;
        this._exitButtonAccessibilityLabel = BaseBarcodeCountView.barcodeCountDefaults.BarcodeCountView.exitButtonAccessibilityLabel;
        this._exitButtonContentDescription = BaseBarcodeCountView.barcodeCountDefaults.BarcodeCountView.exitButtonContentDescription;
        this._shutterButtonAccessibilityHint = BaseBarcodeCountView.barcodeCountDefaults.BarcodeCountView.shutterButtonAccessibilityHint;
        this._shutterButtonAccessibilityLabel = BaseBarcodeCountView.barcodeCountDefaults.BarcodeCountView.shutterButtonAccessibilityLabel;
        this._shutterButtonContentDescription = BaseBarcodeCountView.barcodeCountDefaults.BarcodeCountView.shutterButtonContentDescription;
        this._floatingShutterButtonAccessibilityHint = BaseBarcodeCountView.barcodeCountDefaults.BarcodeCountView.floatingShutterButtonAccessibilityHint;
        this._floatingShutterButtonAccessibilityLabel = BaseBarcodeCountView.barcodeCountDefaults.BarcodeCountView.floatingShutterButtonAccessibilityLabel;
        this._floatingShutterButtonContentDescription = BaseBarcodeCountView.barcodeCountDefaults.BarcodeCountView.floatingShutterButtonContentDescription;
        this._clearHighlightsButtonAccessibilityHint = BaseBarcodeCountView.barcodeCountDefaults.BarcodeCountView.clearHighlightsButtonAccessibilityHint;
        this._clearHighlightsButtonAccessibilityLabel = BaseBarcodeCountView.barcodeCountDefaults.BarcodeCountView.clearHighlightsButtonAccessibilityLabel;
        this._clearHighlightsButtonContentDescription = BaseBarcodeCountView.barcodeCountDefaults.BarcodeCountView.clearHighlightsButtonContentDescription;
        this._singleScanButtonAccessibilityHint = BaseBarcodeCountView.barcodeCountDefaults.BarcodeCountView.singleScanButtonAccessibilityHint;
        this._singleScanButtonAccessibilityLabel = BaseBarcodeCountView.barcodeCountDefaults.BarcodeCountView.singleScanButtonAccessibilityLabel;
        this._singleScanButtonContentDescription = BaseBarcodeCountView.barcodeCountDefaults.BarcodeCountView.singleScanButtonContentDescription;
        this._clearHighlightsButtonText = BaseBarcodeCountView.barcodeCountDefaults.BarcodeCountView.clearHighlightsButtonText;
        this._exitButtonText = BaseBarcodeCountView.barcodeCountDefaults.BarcodeCountView.exitButtonText;
        this._textForTapShutterToScanHint = BaseBarcodeCountView.barcodeCountDefaults.BarcodeCountView.textForTapShutterToScanHint;
        this._textForScanningHint = BaseBarcodeCountView.barcodeCountDefaults.BarcodeCountView.textForScanningHint;
        this._textForMoveCloserAndRescanHint = BaseBarcodeCountView.barcodeCountDefaults.BarcodeCountView.textForMoveCloserAndRescanHint;
        this._textForMoveFurtherAndRescanHint = BaseBarcodeCountView.barcodeCountDefaults.BarcodeCountView.textForMoveFurtherAndRescanHint;
        this._shouldShowListProgressBar = BaseBarcodeCountView.barcodeCountDefaults.BarcodeCountView.shouldShowListProgressBar;
        this._toolbarSettings = null;
        this._shouldShowTorchControl = BaseBarcodeCountView.barcodeCountDefaults.BarcodeCountView.shouldShowTorchControl;
        this._torchControlPosition = BaseBarcodeCountView.barcodeCountDefaults.BarcodeCountView.torchControlPosition;
        this._tapToUncountEnabled = BaseBarcodeCountView.barcodeCountDefaults.BarcodeCountView.tapToUncountEnabled;
        this._textForTapToUncountHint = BaseBarcodeCountView.barcodeCountDefaults.BarcodeCountView.textForTapToUncountHint;
        this._style = BaseBarcodeCountView.barcodeCountDefaults.BarcodeCountView.style;
        this._barcodeNotInListActionSettings = new BarcodeCountNotInListActionSettings();
        this._hardwareTriggerEnabled = false;
        this.isViewCreated = false;
        this.autoCreateNativeView = true;
        this._style = style;
        this._context = context;
        this._barcodeCount = barcodeCount;
        this.nativeView = nativeView;
        this.autoCreateNativeView = autoCreateNativeView;
        this.isViewCreated = autoCreateNativeView;
        barcodeCount._context = context;
        this._controller = BarcodeCountViewController.forBarcodeCountAndBarcodeCountView(this, this._barcodeCount);
        this._controller.initialize(autoCreateNativeView);
    }
    dispose() {
        return __awaiter(this, void 0, void 0, function* () {
            yield this._controller.dispose();
            this.isViewCreated = false;
        });
    }
    clearHighlights() {
        return this._controller.clearHighlights();
    }
    setToolbarSettings(settings) {
        this._toolbarSettings = settings;
        this.updateNative();
    }
    setPositionAndSize(top, left, width, height, shouldBeUnderWebView) {
        return this._controller.setPositionAndSize(top, left, width, height, shouldBeUnderWebView);
    }
    show() {
        return this._controller.show();
    }
    hide() {
        return this._controller.hide();
    }
    setBrushForRecognizedBarcode(trackedBarcode, brush) {
        return this._controller.setBrushForRecognizedBarcode(trackedBarcode, brush);
    }
    setBrushForRecognizedBarcodeNotInList(trackedBarcode, brush) {
        return this._controller.setBrushForRecognizedBarcodeNotInList(trackedBarcode, brush);
    }
    setBrushForAcceptedBarcode(trackedBarcode, brush) {
        return this._controller.setBrushForAcceptedBarcode(trackedBarcode, brush);
    }
    setBrushForRejectedBarcode(trackedBarcode, brush) {
        return this._controller.setBrushForRejectedBarcode(trackedBarcode, brush);
    }
    enableHardwareTrigger(hardwareTriggerKeyCode) {
        return this._controller.enableHardwareTrigger(hardwareTriggerKeyCode);
    }
    createNativeView() {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.isViewCreated) {
                return Promise.resolve();
            }
            yield this._controller.createNativeView();
            this.isViewCreated = true;
        });
    }
    removeNativeView() {
        return __awaiter(this, void 0, void 0, function* () {
            yield this._controller.removeNativeView();
            this.isViewCreated = false;
        });
    }
    updateNative() {
        return this._controller.update();
    }
    toJSON() {
        var _a, _b, _c, _d, _e, _f, _g, _h;
        const json = {
            View: {
                style: this.style,
                shouldDisableModeOnExitButtonTapped: this.shouldDisableModeOnExitButtonTapped,
                shouldShowUserGuidanceView: this.shouldShowUserGuidanceView,
                shouldShowListButton: this.shouldShowListButton,
                shouldShowExitButton: this.shouldShowExitButton,
                shouldShowShutterButton: this.shouldShowShutterButton,
                shouldShowHints: this.shouldShowHints,
                shouldShowClearHighlightsButton: this.shouldShowClearHighlightsButton,
                shouldShowSingleScanButton: this.shouldShowSingleScanButton,
                shouldShowFloatingShutterButton: this.shouldShowFloatingShutterButton,
                shouldShowToolbar: this.shouldShowToolbar,
                shouldShowScanAreaGuides: this.shouldShowScanAreaGuides,
                toolbarSettings: (_a = this._toolbarSettings) === null || _a === void 0 ? void 0 : _a.toJSON(),
                shouldShowTorchControl: this.shouldShowTorchControl,
                torchControlPosition: this.torchControlPosition,
                tapToUncountEnabled: this.tapToUncountEnabled,
                textForTapToUncountHint: this.textForTapToUncountHint,
                barcodeNotInListActionSettings: this.barcodeNotInListActionSettings.toJSON(),
                recognizedBrush: (_b = this.recognizedBrush) === null || _b === void 0 ? void 0 : _b.toJSON(),
                notInListBrush: (_c = this.notInListBrush) === null || _c === void 0 ? void 0 : _c.toJSON(),
                acceptedBrush: (_d = this.acceptedBrush) === null || _d === void 0 ? void 0 : _d.toJSON(),
                rejectedBrush: (_e = this.rejectedBrush) === null || _e === void 0 ? void 0 : _e.toJSON(),
                hardwareTriggerEnabled: this._hardwareTriggerEnabled
            },
            BarcodeCount: this._barcodeCount.toJSON()
        };
        if (this.listButtonAccessibilityHint !== BaseBarcodeCountView.barcodeCountDefaults.BarcodeCountView.listButtonAccessibilityHint) {
            json.View.listButtonAccessibilityHint = this.listButtonAccessibilityHint; // iOS Only
        }
        if (this.listButtonAccessibilityLabel !== BaseBarcodeCountView.barcodeCountDefaults.BarcodeCountView.listButtonAccessibilityLabel) {
            json.View.listButtonAccessibilityHint = this.listButtonAccessibilityLabel; // iOS Only
        }
        if (this.listButtonContentDescription !== BaseBarcodeCountView.barcodeCountDefaults.BarcodeCountView.listButtonContentDescription) {
            json.View.listButtonContentDescription = this.listButtonContentDescription; // Android Only
        }
        if (this.exitButtonAccessibilityHint !== BaseBarcodeCountView.barcodeCountDefaults.BarcodeCountView.exitButtonAccessibilityHint) {
            json.View.exitButtonAccessibilityHint = this.exitButtonAccessibilityHint; // iOS Only
        }
        if (this.exitButtonAccessibilityLabel !== BaseBarcodeCountView.barcodeCountDefaults.BarcodeCountView.exitButtonAccessibilityLabel) {
            json.View.exitButtonAccessibilityLabel = this.exitButtonAccessibilityLabel; // iOS Only
        }
        if (this.exitButtonContentDescription !== BaseBarcodeCountView.barcodeCountDefaults.BarcodeCountView.exitButtonContentDescription) {
            json.View.exitButtonContentDescription = this.exitButtonContentDescription; // Android Only
        }
        if (this.shutterButtonAccessibilityHint !== BaseBarcodeCountView.barcodeCountDefaults.BarcodeCountView.shutterButtonAccessibilityHint) {
            json.View.shutterButtonAccessibilityHint = this.shutterButtonAccessibilityHint; // iOS Only
        }
        if (this.shutterButtonAccessibilityLabel !== BaseBarcodeCountView.barcodeCountDefaults.BarcodeCountView.shutterButtonAccessibilityLabel) {
            json.View.shutterButtonAccessibilityLabel = this.shutterButtonAccessibilityLabel; // iOS Only
        }
        if (this.shutterButtonContentDescription !== BaseBarcodeCountView.barcodeCountDefaults.BarcodeCountView.shutterButtonContentDescription) {
            json.View.shutterButtonContentDescription = this.shutterButtonContentDescription; // Android Only
        }
        if (this.floatingShutterButtonAccessibilityHint !== BaseBarcodeCountView.barcodeCountDefaults.BarcodeCountView.floatingShutterButtonAccessibilityHint) {
            json.View.floatingShutterButtonAccessibilityHint = this.floatingShutterButtonAccessibilityHint; // iOS Only
        }
        if (this.floatingShutterButtonAccessibilityLabel !== BaseBarcodeCountView.barcodeCountDefaults.BarcodeCountView.floatingShutterButtonAccessibilityLabel) {
            json.View.floatingShutterButtonAccessibilityLabel = this.floatingShutterButtonAccessibilityLabel; // iOS Only
        }
        if (this.floatingShutterButtonContentDescription !== BaseBarcodeCountView.barcodeCountDefaults.BarcodeCountView.floatingShutterButtonContentDescription) {
            json.View.floatingShutterButtonContentDescription = this.floatingShutterButtonContentDescription; // Android Only
        }
        if (this.clearHighlightsButtonAccessibilityHint !== BaseBarcodeCountView.barcodeCountDefaults.BarcodeCountView.clearHighlightsButtonAccessibilityHint) {
            json.View.clearHighlightsButtonAccessibilityHint = this.clearHighlightsButtonAccessibilityHint; // iOS Only
        }
        if (this.clearHighlightsButtonAccessibilityLabel !== BaseBarcodeCountView.barcodeCountDefaults.BarcodeCountView.clearHighlightsButtonAccessibilityLabel) {
            json.View.clearHighlightsButtonAccessibilityLabel = this.clearHighlightsButtonAccessibilityLabel; // iOS Only
        }
        if (this.clearHighlightsButtonContentDescription !== BaseBarcodeCountView.barcodeCountDefaults.BarcodeCountView.clearHighlightsButtonContentDescription) {
            json.View.clearHighlightsButtonContentDescription = this.clearHighlightsButtonContentDescription; // Android Only
        }
        if (this.singleScanButtonAccessibilityHint !== BaseBarcodeCountView.barcodeCountDefaults.BarcodeCountView.singleScanButtonAccessibilityHint) {
            json.View.singleScanButtonAccessibilityHint = this.singleScanButtonAccessibilityHint; // iOS Only
        }
        if (this.singleScanButtonAccessibilityLabel !== BaseBarcodeCountView.barcodeCountDefaults.BarcodeCountView.singleScanButtonAccessibilityLabel) {
            json.View.singleScanButtonAccessibilityLabel = this.singleScanButtonAccessibilityLabel; // iOS Only
        }
        if (this.singleScanButtonContentDescription !== BaseBarcodeCountView.barcodeCountDefaults.BarcodeCountView.singleScanButtonContentDescription) {
            json.View.singleScanButtonContentDescription = this.singleScanButtonContentDescription; // Android Only
        }
        if (this.clearHighlightsButtonText !== BaseBarcodeCountView.barcodeCountDefaults.BarcodeCountView.clearHighlightsButtonText) {
            json.View.clearHighlightsButtonText = this.clearHighlightsButtonText;
        }
        if (this.exitButtonText !== BaseBarcodeCountView.barcodeCountDefaults.BarcodeCountView.exitButtonText) {
            json.View.exitButtonText = this.exitButtonText;
        }
        if (this.textForTapShutterToScanHint !== BaseBarcodeCountView.barcodeCountDefaults.BarcodeCountView.textForTapShutterToScanHint) {
            json.View.textForTapShutterToScanHint = this.textForTapShutterToScanHint;
        }
        if (this.textForScanningHint !== BaseBarcodeCountView.barcodeCountDefaults.BarcodeCountView.textForScanningHint) {
            json.View.textForScanningHint = this.textForScanningHint;
        }
        if (this.textForMoveCloserAndRescanHint !== BaseBarcodeCountView.barcodeCountDefaults.BarcodeCountView.textForMoveCloserAndRescanHint) {
            json.View.textForMoveCloserAndRescanHint = this.textForMoveCloserAndRescanHint;
        }
        if (this.textForMoveFurtherAndRescanHint !== BaseBarcodeCountView.barcodeCountDefaults.BarcodeCountView.textForMoveFurtherAndRescanHint) {
            json.View.textForMoveFurtherAndRescanHint = this.textForMoveFurtherAndRescanHint;
        }
        if (this.shouldShowListProgressBar !== BaseBarcodeCountView.barcodeCountDefaults.BarcodeCountView.shouldShowListProgressBar) {
            json.View.shouldShowListProgressBar = this.shouldShowListProgressBar;
        }
        if (this.recognizedBrush) {
            json.View.recognizedBrush = (_f = this.recognizedBrush) === null || _f === void 0 ? void 0 : _f.toJSON();
        }
        if (this.notInListBrush) {
            json.View.notInListBrush = (_g = this.notInListBrush) === null || _g === void 0 ? void 0 : _g.toJSON();
        }
        if (this.filterSettings) {
            json.View.filterSettings = (_h = this.filterSettings) === null || _h === void 0 ? void 0 : _h.toJSON();
        }
        return json;
    }
}
__decorate([
    core.ignoreFromSerialization
], BaseBarcodeCountView.prototype, "isViewCreated", void 0);
__decorate([
    core.ignoreFromSerialization
], BaseBarcodeCountView.prototype, "autoCreateNativeView", void 0);
__decorate([
    core.ignoreFromSerialization
], BaseBarcodeCountView, "barcodeCountDefaults", null);

class BarcodeFilterHighlightSettingsBrush extends core.DefaultSerializeable {
    static create(brush) {
        return new BarcodeFilterHighlightSettingsBrush(brush);
    }
    constructor(brush) {
        super();
        this._brush = null;
        this._highlightType = BarcodeFilterHighlightType.Brush;
        this._brush = brush;
    }
    get highlightType() {
        return this._highlightType;
    }
    get brush() {
        return this._brush;
    }
}
__decorate([
    core.nameForSerialization('highlightType')
], BarcodeFilterHighlightSettingsBrush.prototype, "_highlightType", void 0);
__decorate([
    core.nameForSerialization('brush')
], BarcodeFilterHighlightSettingsBrush.prototype, "_brush", void 0);

class BarcodeFilterSettings extends core.DefaultSerializeable {
    get excludeEan13() {
        return this._excludeEan13;
    }
    set excludeEan13(value) {
        this._excludeEan13 = value;
    }
    get excludeUpca() {
        return this._excludeUpca;
    }
    set excludeUpca(value) {
        this._excludeUpca = value;
    }
    get excludedCodesRegex() {
        return this._excludedCodesRegex;
    }
    set excludedCodesRegex(value) {
        this._excludedCodesRegex = value;
    }
    get excludedSymbologies() {
        return this._excludedSymbologies;
    }
    set excludedSymbologies(values) {
        this._excludedSymbologies = values;
    }
    static fromJSON(json) {
        const excludeEan13 = json.excludeEan13;
        const excludeUpca = json.excludeUpca;
        const excludedCodesRegex = json.excludedCodesRegex;
        const excludedSymbologies = json.excludedSymbologies;
        const excludedSymbolCounts = json.excludedSymbolCounts;
        return new BarcodeFilterSettings(excludeEan13, excludeUpca, excludedCodesRegex, excludedSymbolCounts, excludedSymbologies);
    }
    constructor(excludeEan13, excludeUpca, excludedCodesRegex, excludedSymbolCounts, excludedSymbologies) {
        super();
        this._excludeEan13 = false;
        this._excludeUpca = false;
        this._excludedCodesRegex = '';
        this._excludedSymbolCounts = {};
        this._excludedSymbologies = [];
        this.excludeEan13 = excludeEan13;
        this.excludeUpca = excludeUpca;
        this.excludedCodesRegex = excludedCodesRegex;
        this._excludedSymbolCounts = excludedSymbolCounts;
        this.excludedSymbologies = excludedSymbologies;
    }
    getExcludedSymbolCountsForSymbology(symbology) {
        return this._excludedSymbolCounts[symbology] || [];
    }
    setExcludedSymbolCounts(excludedSymbolCounts, symbology) {
        this._excludedSymbolCounts[symbology] = excludedSymbolCounts;
    }
}
__decorate([
    core.nameForSerialization('excludeEan13')
], BarcodeFilterSettings.prototype, "_excludeEan13", void 0);
__decorate([
    core.nameForSerialization('excludeUpca')
], BarcodeFilterSettings.prototype, "_excludeUpca", void 0);
__decorate([
    core.nameForSerialization('excludedCodesRegex')
], BarcodeFilterSettings.prototype, "_excludedCodesRegex", void 0);
__decorate([
    core.nameForSerialization('excludedSymbolCounts')
], BarcodeFilterSettings.prototype, "_excludedSymbolCounts", void 0);
__decorate([
    core.nameForSerialization('excludedSymbologies')
], BarcodeFilterSettings.prototype, "_excludedSymbologies", void 0);

function getBarcodeCountDefaults() {
    return core.FactoryMaker.getInstance('BarcodeCountDefaults');
}

function getBarcodeBatchDefaults() {
    return core.FactoryMaker.getInstance('BarcodeBatchDefaults');
}

function getSparkScanDefaults() {
    return core.FactoryMaker.getInstance('SparkScanDefaults');
}

function getBarcodePickDefaults() {
    return core.FactoryMaker.getInstance('BarcodePickDefaults');
}

function getBarcodeFindDefaults() {
    return core.FactoryMaker.getInstance('BarcodeFindDefaults');
}

class BarcodeCaptureSession {
    get newlyRecognizedBarcode() {
        return this._newlyRecognizedBarcode;
    }
    get newlyLocalizedBarcodes() {
        return this._newlyLocalizedBarcodes;
    }
    get frameSequenceID() {
        return this._frameSequenceID;
    }
    static fromJSON(json) {
        var _a;
        const sessionJson = JSON.parse(json.session);
        const session = new BarcodeCaptureSession();
        session._newlyRecognizedBarcode = sessionJson.newlyRecognizedBarcode != null ?
            Barcode.fromJSON(sessionJson.newlyRecognizedBarcode) :
            null;
        session._newlyLocalizedBarcodes = sessionJson.newlyLocalizedBarcodes
            .map(LocalizedOnlyBarcode.fromJSON);
        session._frameSequenceID = sessionJson.frameSequenceId;
        session.frameId = (_a = json.frameId) !== null && _a !== void 0 ? _a : '';
        return session;
    }
    reset() {
        return this.controller.reset();
    }
}

var BarcodeCaptureListenerEvents;
(function (BarcodeCaptureListenerEvents) {
    BarcodeCaptureListenerEvents["inCallback"] = "BarcodeCaptureListener.inCallback";
    BarcodeCaptureListenerEvents["didUpdateSession"] = "BarcodeCaptureListener.didUpdateSession";
    BarcodeCaptureListenerEvents["didScan"] = "BarcodeCaptureListener.didScan";
})(BarcodeCaptureListenerEvents || (BarcodeCaptureListenerEvents = {}));
class BarcodeCaptureListenerController {
    get _proxy() {
        return core.FactoryMaker.getInstance('BarcodeCaptureListenerProxy');
    }
    static forBarcodeCapture(barcodeCapture) {
        const controller = new BarcodeCaptureListenerController();
        controller.barcodeCapture = barcodeCapture;
        controller._proxy.isModeEnabled = () => barcodeCapture.isEnabled;
        return controller;
    }
    constructor() {
        this.eventEmitter = core.FactoryMaker.getInstance('EventEmitter');
    }
    reset() {
        return this._proxy.resetSession();
    }
    setModeEnabledState(enabled) {
        this._proxy.setModeEnabledState(enabled);
    }
    updateBarcodeCaptureMode() {
        return this._proxy.updateBarcodeCaptureMode(JSON.stringify(this.barcodeCapture.toJSON()));
    }
    applyBarcodeCaptureModeSettings(newSettings) {
        return this._proxy.applyBarcodeCaptureModeSettings(JSON.stringify(newSettings.toJSON()));
    }
    updateBarcodeCaptureOverlay(overlay) {
        return this._proxy.updateBarcodeCaptureOverlay(JSON.stringify(overlay.toJSON()));
    }
    subscribeListener() {
        var _a, _b, _c, _d;
        this._proxy.registerListenerForEvents();
        (_b = (_a = this._proxy).subscribeDidUpdateSessionListener) === null || _b === void 0 ? void 0 : _b.call(_a);
        (_d = (_c = this._proxy).subscribeDidScanListener) === null || _d === void 0 ? void 0 : _d.call(_c);
        this.eventEmitter.on(BarcodeCaptureListenerEvents.inCallback, (value) => {
            this.barcodeCapture.isInListenerCallback = value;
        });
        this.eventEmitter.on(BarcodeCaptureListenerEvents.didUpdateSession, (data) => __awaiter(this, void 0, void 0, function* () {
            const payload = core.EventDataParser.parse(data);
            if (payload === null) {
                console.error('BarcodeCaptureListenerController.subscribeListener: didUpdateSession payload is null');
                return;
            }
            const session = BarcodeCaptureSession.fromJSON(payload);
            yield this.notifyListenersOfDidUpdateSession(session);
            this._proxy.finishDidUpdateSessionCallback(this.barcodeCapture.isEnabled);
        }));
        this.eventEmitter.on(BarcodeCaptureListenerEvents.didScan, (data) => __awaiter(this, void 0, void 0, function* () {
            const payload = core.EventDataParser.parse(data);
            if (payload === null) {
                console.error('BarcodeCaptureListenerController.subscribeListener: didScan payload is null');
                return;
            }
            const session = BarcodeCaptureSession.fromJSON(payload);
            yield this.notifyListenersOfDidScan(session);
            this._proxy.finishDidScanCallback(this.barcodeCapture.isEnabled);
        }));
    }
    unsubscribeListener() {
        this._proxy.unregisterListenerForEvents();
        this.eventEmitter.removeAllListeners(BarcodeCaptureListenerEvents.inCallback);
        this.eventEmitter.removeAllListeners(BarcodeCaptureListenerEvents.didUpdateSession);
        this.eventEmitter.removeAllListeners(BarcodeCaptureListenerEvents.didScan);
    }
    notifyListenersOfDidUpdateSession(session) {
        return __awaiter(this, void 0, void 0, function* () {
            const mode = this.barcodeCapture;
            mode.isInListenerCallback = true;
            for (const listener of mode.listeners) {
                if (listener.didUpdateSession) {
                    listener.didUpdateSession(this.barcodeCapture, session, () => core.CameraController.getFrame(session.frameId));
                }
            }
            mode.isInListenerCallback = false;
        });
    }
    notifyListenersOfDidScan(session) {
        return __awaiter(this, void 0, void 0, function* () {
            const mode = this.barcodeCapture;
            mode.isInListenerCallback = true;
            for (const listener of mode.listeners) {
                if (listener.didScan) {
                    listener.didScan(this.barcodeCapture, session, () => core.CameraController.getFrame(session.frameId));
                }
            }
            mode.isInListenerCallback = false;
        });
    }
}

class BarcodeCapture extends core.DefaultSerializeable {
    get isEnabled() {
        return this._isEnabled;
    }
    set isEnabled(isEnabled) {
        this._isEnabled = isEnabled;
        this.controller.setModeEnabledState(isEnabled);
    }
    get context() {
        return this._context;
    }
    get feedback() {
        return this._feedback;
    }
    set feedback(feedback) {
        this._feedback = feedback;
        this.controller.updateBarcodeCaptureMode();
    }
    static get recommendedCameraSettings() {
        return BarcodeCapture.barcodeCaptureDefaults.RecommendedCameraSettings;
    }
    get _context() {
        return this.privateContext;
    }
    set _context(newContext) {
        if (newContext == null) {
            this.controller.unsubscribeListener();
        }
        else if (this.privateContext == null) {
            this.controller.subscribeListener();
        }
        this.privateContext = newContext;
    }
    static get barcodeCaptureDefaults() {
        return getBarcodeCaptureDefaults();
    }
    static forContext(context, settings) {
        const barcodeCapture = new BarcodeCapture();
        barcodeCapture.settings = settings;
        if (context) {
            context.addMode(barcodeCapture);
        }
        return barcodeCapture;
    }
    constructor() {
        super();
        this.type = 'barcodeCapture';
        this._isEnabled = true;
        this.privateContext = null;
        this.listeners = [];
        this.isInListenerCallback = false;
        this.controller = BarcodeCaptureListenerController.forBarcodeCapture(this);
    }
    applySettings(settings) {
        this.settings = settings;
        return this.controller.applyBarcodeCaptureModeSettings(settings);
    }
    addListener(listener) {
        if (this.listeners.includes(listener)) {
            return;
        }
        this.listeners.push(listener);
    }
    removeListener(listener) {
        if (!this.listeners.includes(listener)) {
            return;
        }
        this.listeners.splice(this.listeners.indexOf(listener), 1);
    }
}
__decorate([
    core.ignoreFromSerialization
], BarcodeCapture.prototype, "_isEnabled", void 0);
__decorate([
    core.nameForSerialization('feedback')
], BarcodeCapture.prototype, "_feedback", void 0);
__decorate([
    core.ignoreFromSerialization
], BarcodeCapture.prototype, "privateContext", void 0);
__decorate([
    core.ignoreFromSerialization
], BarcodeCapture.prototype, "listeners", void 0);
__decorate([
    core.ignoreFromSerialization
], BarcodeCapture.prototype, "controller", void 0);
__decorate([
    core.ignoreFromSerialization
], BarcodeCapture.prototype, "isInListenerCallback", void 0);
__decorate([
    core.ignoreFromSerialization
], BarcodeCapture, "barcodeCaptureDefaults", null);

class BarcodeCaptureOverlay extends core.DefaultSerializeable {
    static get barcodeCaptureDefaults() {
        return getBarcodeCaptureDefaults();
    }
    get brush() {
        return this._brush;
    }
    set brush(newBrush) {
        this._brush = newBrush;
        this.barcodeCapture.controller.updateBarcodeCaptureOverlay(this);
    }
    get viewfinder() {
        return this._viewfinder;
    }
    set viewfinder(newViewfinder) {
        this._viewfinder = newViewfinder;
        if (newViewfinder) {
            this.eventEmitter.on('viewfinder.update', this.handleViewFinderUpdate);
        }
        else {
            this.eventEmitter.off('viewfinder.update');
        }
        this.barcodeCapture.controller.updateBarcodeCaptureOverlay(this);
    }
    get shouldShowScanAreaGuides() {
        return this._shouldShowScanAreaGuides;
    }
    set shouldShowScanAreaGuides(shouldShow) {
        this._shouldShowScanAreaGuides = shouldShow;
        this.barcodeCapture.controller.updateBarcodeCaptureOverlay(this);
    }
    get style() {
        return this._style;
    }
    static withBarcodeCapture(barcodeCapture) {
        return BarcodeCaptureOverlay.withBarcodeCaptureForView(barcodeCapture, null);
    }
    static withBarcodeCaptureForView(barcodeCapture, view) {
        return this.withBarcodeCaptureForViewWithStyle(barcodeCapture, view, BarcodeCaptureOverlay.barcodeCaptureDefaults.BarcodeCaptureOverlay.defaultStyle);
    }
    static withBarcodeCaptureForViewWithStyle(barcodeCapture, view, style) {
        const overlay = new BarcodeCaptureOverlay();
        overlay.barcodeCapture = barcodeCapture;
        overlay._style = style;
        const barcodeCaptureOverlayDefaults = BarcodeCaptureOverlay.barcodeCaptureDefaults.BarcodeCaptureOverlay;
        const styles = barcodeCaptureOverlayDefaults.styles ? barcodeCaptureOverlayDefaults.styles : barcodeCaptureOverlayDefaults.Brushes;
        overlay._brush = new core.Brush(styles[style].DefaultBrush.fillColor, styles[style].DefaultBrush.strokeColor, styles[style].DefaultBrush.strokeWidth);
        if (view) {
            view.addOverlay(overlay);
        }
        return overlay;
    }
    constructor() {
        super();
        this.type = 'barcodeCapture';
        this._shouldShowScanAreaGuides = false;
        this._viewfinder = null;
        this._brush = BarcodeCaptureOverlay.barcodeCaptureDefaults.BarcodeCaptureOverlay.DefaultBrush;
        this.eventEmitter = core.FactoryMaker.getInstance('EventEmitter');
        this.handleViewFinderUpdate = this.handleViewFinderUpdate.bind(this);
    }
    handleViewFinderUpdate() {
        this.barcodeCapture.controller.updateBarcodeCaptureOverlay(this);
    }
}
__decorate([
    core.ignoreFromSerialization
], BarcodeCaptureOverlay.prototype, "barcodeCapture", void 0);
__decorate([
    core.ignoreFromSerialization
], BarcodeCaptureOverlay.prototype, "view", void 0);
__decorate([
    core.nameForSerialization('shouldShowScanAreaGuides')
], BarcodeCaptureOverlay.prototype, "_shouldShowScanAreaGuides", void 0);
__decorate([
    core.serializationDefault(core.NoViewfinder),
    core.nameForSerialization('viewfinder')
], BarcodeCaptureOverlay.prototype, "_viewfinder", void 0);
__decorate([
    core.nameForSerialization('style')
], BarcodeCaptureOverlay.prototype, "_style", void 0);
__decorate([
    core.ignoreFromSerialization
], BarcodeCaptureOverlay.prototype, "eventEmitter", void 0);
__decorate([
    core.nameForSerialization('brush')
], BarcodeCaptureOverlay.prototype, "_brush", void 0);
__decorate([
    core.ignoreFromSerialization
], BarcodeCaptureOverlay, "barcodeCaptureDefaults", null);

var BarcodeCaptureOverlayStyle;
(function (BarcodeCaptureOverlayStyle) {
    BarcodeCaptureOverlayStyle["Frame"] = "frame";
})(BarcodeCaptureOverlayStyle || (BarcodeCaptureOverlayStyle = {}));

class BarcodeCaptureSettings extends core.DefaultSerializeable {
    get enabledSymbologies() {
        return Object.keys(this.symbologies)
            .filter(symbology => this.symbologies[symbology].isEnabled);
    }
    get compositeTypeDescriptions() {
        return BarcodeCaptureSettings.barcodeDefaults.CompositeTypeDescriptions.reduce((descriptions, description) => {
            descriptions[description.types[0]] = description;
            return descriptions;
        }, {});
    }
    static get barcodeDefaults() {
        return getBarcodeDefaults();
    }
    static get barcodeCaptureDefaults() {
        return getBarcodeCaptureDefaults();
    }
    constructor() {
        super();
        this.locationSelection = null;
        this.enabledCompositeTypes = [];
        this.properties = {};
        this.symbologies = {};
        this._codeDuplicateFilter = BarcodeCaptureSettings.barcodeCaptureDefaults.BarcodeCaptureSettings.codeDuplicateFilter;
        this._arucoDictionary = null;
        /**
         * @deprecated replaced with batterySaving
         */
        this.batterySavingMode = BarcodeCaptureSettings.barcodeCaptureDefaults.BarcodeCaptureSettings.batterySaving;
        this.batterySaving = BarcodeCaptureSettings.barcodeCaptureDefaults.BarcodeCaptureSettings.batterySaving;
        this.scanIntention = BarcodeCaptureSettings.barcodeCaptureDefaults.BarcodeCaptureSettings.scanIntention;
    }
    settingsForSymbology(symbology) {
        if (!this.symbologies[symbology]) {
            const symbologySettings = BarcodeCaptureSettings.barcodeDefaults.SymbologySettings[symbology];
            symbologySettings._symbology = symbology;
            this.symbologies[symbology] = symbologySettings;
        }
        return this.symbologies[symbology];
    }
    setProperty(name, value) {
        this.properties[name] = value;
    }
    getProperty(name) {
        return this.properties[name];
    }
    enableSymbologies(symbologies) {
        symbologies.forEach(symbology => this.enableSymbology(symbology, true));
    }
    enableSymbology(symbology, enabled) {
        this.settingsForSymbology(symbology).isEnabled = enabled;
    }
    enableSymbologiesForCompositeTypes(compositeTypes) {
        compositeTypes.forEach(compositeType => {
            this.enableSymbologies(this.compositeTypeDescriptions[compositeType].symbologies);
        });
    }
    setArucoDictionary(dictionary) {
        this._arucoDictionary = dictionary;
    }
    get codeDuplicateFilter() {
        return this._codeDuplicateFilter;
    }
    set codeDuplicateFilter(value) {
        this._codeDuplicateFilter = value;
    }
}
__decorate([
    core.serializationDefault(core.NoneLocationSelection)
], BarcodeCaptureSettings.prototype, "locationSelection", void 0);
__decorate([
    core.nameForSerialization('codeDuplicateFilter')
], BarcodeCaptureSettings.prototype, "_codeDuplicateFilter", void 0);
__decorate([
    core.nameForSerialization('arucoDictionary')
], BarcodeCaptureSettings.prototype, "_arucoDictionary", void 0);
__decorate([
    core.ignoreFromSerialization
], BarcodeCaptureSettings, "barcodeDefaults", null);
__decorate([
    core.ignoreFromSerialization
], BarcodeCaptureSettings, "barcodeCaptureDefaults", null);

class BarcodeCheckFeedback extends core.DefaultSerializeable {
    static get defaultFeedback() {
        const feedback = new BarcodeCheckFeedback();
        feedback.scanned = BarcodeCheckFeedback.barcodeCheckDefaults.Feedback.scanned;
        feedback.tapped = BarcodeCheckFeedback.barcodeCheckDefaults.Feedback.tapped;
        return feedback;
    }
    static get barcodeCheckDefaults() {
        return getBarcodeCheckDefaults();
    }
    static fromJSON(json) {
        const scanned = core.Feedback.fromJSON(json.scanned);
        const tapped = core.Feedback.fromJSON(json.tapped);
        const feedback = new BarcodeCheckFeedback();
        feedback.scanned = scanned;
        feedback.tapped = tapped;
        return feedback;
    }
    get scanned() {
        return this._scanned;
    }
    set scanned(scanned) {
        this._scanned = scanned;
        this.updateFeedback();
    }
    get tapped() {
        return this._tapped;
    }
    set tapped(tapped) {
        this._tapped = tapped;
        this.updateFeedback();
    }
    updateFeedback() {
        var _a;
        (_a = this.listenerController) === null || _a === void 0 ? void 0 : _a.updateFeedback(JSON.stringify(this.toJSON()));
    }
    constructor() {
        super();
        this.listenerController = null;
        this._scanned = BarcodeCheckFeedback.barcodeCheckDefaults.Feedback.scanned;
        this._tapped = BarcodeCheckFeedback.barcodeCheckDefaults.Feedback.tapped;
        this.scanned = new core.Feedback(null, null);
        this.tapped = new core.Feedback(null, null);
    }
}
__decorate([
    core.ignoreFromSerialization
], BarcodeCheckFeedback.prototype, "listenerController", void 0);
__decorate([
    core.nameForSerialization('scanned')
], BarcodeCheckFeedback.prototype, "_scanned", void 0);
__decorate([
    core.nameForSerialization('tapped')
], BarcodeCheckFeedback.prototype, "_tapped", void 0);
__decorate([
    core.ignoreFromSerialization
], BarcodeCheckFeedback, "barcodeCheckDefaults", null);

class BarcodeCheckSessionController {
    get _proxy() {
        return core.FactoryMaker.getInstance('BarcodeCheckSessionProxy');
    }
    resetSession() {
        return this._proxy.resetSession();
    }
}

class BarcodeCheckSession extends core.DefaultSerializeable {
    static fromJSON(json) {
        const sessionJson = JSON.parse(json);
        const session = new BarcodeCheckSession();
        session._addedTrackedBarcodes = sessionJson.addedTrackedBarcodes
            .map((trackedBarcodeJSON) => {
            return TrackedBarcode
                .fromJSON(trackedBarcodeJSON, sessionJson.frameSequenceId);
        });
        session._removedTrackedBarcodes = sessionJson.removedTrackedBarcodes;
        session._trackedBarcodes = Object.keys(sessionJson.allTrackedBarcodes)
            .reduce((trackedBarcodes, identifier) => {
            trackedBarcodes[identifier] = TrackedBarcode
                .fromJSON(sessionJson.allTrackedBarcodes[identifier], sessionJson.frameSequenceId);
            return trackedBarcodes;
        }, {});
        return session;
    }
    constructor() {
        super();
        this.sessionController = new BarcodeCheckSessionController();
    }
    get addedTrackedBarcodes() {
        return this._addedTrackedBarcodes;
    }
    get removedTrackedBarcodes() {
        return this._removedTrackedBarcodes;
    }
    get trackedBarcodes() {
        return this._trackedBarcodes;
    }
    reset() {
        return this.sessionController.resetSession();
    }
}
__decorate([
    core.nameForSerialization('addedTrackedBarcodes')
], BarcodeCheckSession.prototype, "_addedTrackedBarcodes", void 0);
__decorate([
    core.nameForSerialization('removedTrackedBarcodes')
], BarcodeCheckSession.prototype, "_removedTrackedBarcodes", void 0);
__decorate([
    core.nameForSerialization('trackedBarcodes')
], BarcodeCheckSession.prototype, "_trackedBarcodes", void 0);
__decorate([
    core.ignoreFromSerialization
], BarcodeCheckSession.prototype, "sessionController", void 0);

var BarcodeCheckListenerEvents;
(function (BarcodeCheckListenerEvents) {
    BarcodeCheckListenerEvents["didUpdateSession"] = "BarcodeCheckListener.didUpdateSession";
})(BarcodeCheckListenerEvents || (BarcodeCheckListenerEvents = {}));
class BarcodeCheckListenerController {
    constructor() {
        this.eventEmitter = core.FactoryMaker.getInstance('EventEmitter');
    }
    static forBarcodeCheck(barcodeCheck) {
        const controller = new BarcodeCheckListenerController();
        controller.barcodeCheck = barcodeCheck;
        return controller;
    }
    update() {
        const barcodeCheck = this.barcodeCheck.toJSON();
        const json = JSON.stringify(barcodeCheck);
        return this._proxy.updateMode(json);
    }
    reset() {
        return this._proxy.resetBarcodeCheck();
    }
    setModeEnabledState(enabled) {
        this._proxy.setModeEnabledState(enabled);
    }
    subscribeListener() {
        var _a, _b;
        this._proxy.registerBarcodeCheckListener();
        (_b = (_a = this._proxy).subscribeDidUpdateSession) === null || _b === void 0 ? void 0 : _b.call(_a);
        this.eventEmitter.on(BarcodeCheckListenerEvents.didUpdateSession, (data) => __awaiter(this, void 0, void 0, function* () {
            const payload = core.EventDataParser.parse(data);
            if (payload === null) {
                console.error('BarcodeCheckListenerController didUpdateSession payload is null');
                return;
            }
            const session = BarcodeCheckSession.fromJSON(payload.session);
            yield this.notifyListenersOfDidUpdateSession(session, payload.frameId);
            this._proxy.finishOnDidUpdateSession();
        }));
    }
    unsubscribeListener() {
        this._proxy.unregisterBarcodeCheckListener();
        this.eventEmitter.removeAllListeners(BarcodeCheckListenerEvents.didUpdateSession);
    }
    updateFeedback(feedbackJson) {
        this._proxy.updateFeedback(feedbackJson);
    }
    get _proxy() {
        return core.FactoryMaker.getInstance('BarcodeCheckListenerProxy');
    }
    notifyListenersOfDidUpdateSession(session, frameId) {
        return __awaiter(this, void 0, void 0, function* () {
            const mode = this.barcodeCheck;
            mode.isInListenerCallback = true;
            for (const listener of mode.listeners) {
                if (listener.didUpdateSession) {
                    yield listener.didUpdateSession(this.barcodeCheck, session, () => core.CameraController.getFrame(frameId));
                }
            }
            mode.isInListenerCallback = false;
        });
    }
}

class BarcodeCheck extends core.DefaultSerializeable {
    static get barcodeCheckDefaults() {
        return getBarcodeCheckDefaults();
    }
    static get recommendedCameraSettings() {
        return BarcodeCheck.barcodeCheckDefaults.RecommendedCameraSettings;
    }
    static forContext(context, settings) {
        return new BarcodeCheck(context, settings);
    }
    constructor(context, settings) {
        super();
        this.type = 'barcodeCheck';
        this.privateContext = null;
        this.isInListenerCallback = false;
        this._feedback = BarcodeCheckFeedback.defaultFeedback;
        this.listeners = [];
        this._context = context;
        this._settings = settings;
        this.listenerController = BarcodeCheckListenerController.forBarcodeCheck(this);
        this._feedback.listenerController = this.listenerController;
    }
    applySettings(settings) {
        this._settings = settings;
        return this.didChange();
    }
    addListener(listener) {
        this.checkAndSubscribeListeners();
        if (this.listeners.includes(listener)) {
            return;
        }
        this.listeners.push(listener);
    }
    checkAndSubscribeListeners() {
        if (this.listeners.length === 0) {
            this.listenerController.subscribeListener();
        }
    }
    removeListener(listener) {
        if (!this.listeners.includes(listener)) {
            return;
        }
        this.listeners.splice(this.listeners.indexOf(listener));
        this.checkAndUnsubscribeListeners();
    }
    checkAndUnsubscribeListeners() {
        if (this.listeners.length === 0) {
            this.listenerController.unsubscribeListener();
        }
    }
    subscribeNativeListeners() {
        this.listenerController.subscribeListener();
    }
    unsubscribeNativeListeners() {
        this.listenerController.unsubscribeListener();
    }
    didChange() {
        return this.listenerController.update();
    }
    get _context() {
        return this.privateContext;
    }
    set _context(newContext) {
        this.privateContext = newContext;
    }
    get feedback() {
        return this._feedback;
    }
    set feedback(feedback) {
        this._feedback = feedback;
        this._feedback.listenerController = this.listenerController;
        this.listenerController.updateFeedback(JSON.stringify(feedback.toJSON()));
    }
}
__decorate([
    core.ignoreFromSerialization
], BarcodeCheck.prototype, "privateContext", void 0);
__decorate([
    core.ignoreFromSerialization
], BarcodeCheck.prototype, "listenerController", void 0);
__decorate([
    core.ignoreFromSerialization
], BarcodeCheck.prototype, "isInListenerCallback", void 0);
__decorate([
    core.nameForSerialization('feedback')
], BarcodeCheck.prototype, "_feedback", void 0);
__decorate([
    core.nameForSerialization('settings')
], BarcodeCheck.prototype, "_settings", void 0);
__decorate([
    core.ignoreFromSerialization
], BarcodeCheck.prototype, "listeners", void 0);
__decorate([
    core.ignoreFromSerialization
], BarcodeCheck, "barcodeCheckDefaults", null);

class BarcodeCheckCircleHighlight extends core.Observable {
    static get barcodeCheckDefaults() {
        return getBarcodeCheckDefaults();
    }
    constructor(barcode, preset) {
        super();
        this._type = 'barcodeCheckCircleHighlight';
        this._barcode = barcode;
        this._preset = preset;
        this._brush = BarcodeCheckCircleHighlight.barcodeCheckDefaults.BarcodeCheckView.circleHighlightPresets[preset].brush;
        this._size = BarcodeCheckCircleHighlight.barcodeCheckDefaults.BarcodeCheckView.circleHighlightPresets[preset].size;
        this._icon = BarcodeCheckCircleHighlight.barcodeCheckDefaults.BarcodeCheckView.defaultHighlightIcon;
    }
    get barcode() {
        return this._barcode;
    }
    get brush() {
        return this._brush;
    }
    set brush(brush) {
        this._brush = brush;
        this.notifyListeners('brush', brush);
    }
    get icon() {
        return this._icon;
    }
    set icon(value) {
        this._icon = value;
        this.notifyListeners('icon', value);
    }
    get size() {
        return this._size;
    }
    set size(value) {
        this._size = value;
        this.notifyListeners('size', value);
    }
}
__decorate([
    core.nameForSerialization('type')
], BarcodeCheckCircleHighlight.prototype, "_type", void 0);
__decorate([
    core.ignoreFromSerialization
], BarcodeCheckCircleHighlight.prototype, "_barcode", void 0);
__decorate([
    core.nameForSerialization('brush')
], BarcodeCheckCircleHighlight.prototype, "_brush", void 0);
__decorate([
    core.nameForSerialization('icon')
], BarcodeCheckCircleHighlight.prototype, "_icon", void 0);
__decorate([
    core.nameForSerialization('preset')
], BarcodeCheckCircleHighlight.prototype, "_preset", void 0);
__decorate([
    core.nameForSerialization('size')
], BarcodeCheckCircleHighlight.prototype, "_size", void 0);
__decorate([
    core.ignoreFromSerialization
], BarcodeCheckCircleHighlight, "barcodeCheckDefaults", null);

class BarcodeCheckInfoAnnotation extends core.Observable {
    static get barcodeCheckDefaults() {
        return getBarcodeCheckDefaults();
    }
    constructor(barcode) {
        super();
        this._type = 'barcodeCheckInfoAnnotation';
        this._annotationTrigger = BarcodeCheckInfoAnnotation.barcodeCheckDefaults
            .BarcodeCheckView.defaultInfoAnnotationTrigger;
        this._anchor = BarcodeCheckInfoAnnotation.barcodeCheckDefaults
            .BarcodeCheckView.defaultInfoAnnotationAnchor;
        this._backgroundColor = BarcodeCheckInfoAnnotation.barcodeCheckDefaults
            .BarcodeCheckView.defaultInfoAnnotationBackgroundColor;
        this._body = [];
        this._footer = null;
        this._hasTip = BarcodeCheckInfoAnnotation.barcodeCheckDefaults
            .BarcodeCheckView.defaultInfoAnnotationHasTip;
        this._header = null;
        this._isEntireAnnotationTappable = BarcodeCheckInfoAnnotation.barcodeCheckDefaults
            .BarcodeCheckView.defaultInfoAnnotationEntireAnnotationTappable;
        this._listener = null;
        this._hasListener = false;
        this._width = BarcodeCheckInfoAnnotation.barcodeCheckDefaults.BarcodeCheckView.defaultInfoAnnotationWidth;
        this.footerChangedListener = () => {
            this.notifyListeners('footer', this._footer);
        };
        this.headerChangedListener = () => {
            this.notifyListeners('header', this._header);
        };
        this._barcode = barcode;
    }
    get anchor() {
        return this._anchor;
    }
    set anchor(newValue) {
        this._anchor = newValue;
        this.notifyListeners('anchor', newValue);
    }
    get annotationTrigger() {
        return this._annotationTrigger;
    }
    set annotationTrigger(newValue) {
        this._annotationTrigger = newValue;
        this.notifyListeners('annotationTrigger', newValue);
    }
    get backgroundColor() {
        return this._backgroundColor;
    }
    set backgroundColor(newValue) {
        this._backgroundColor = newValue;
        this.notifyListeners('backgroundColor', newValue);
    }
    get barcode() {
        return this._barcode;
    }
    get body() {
        return this._body;
    }
    set body(newValue) {
        this._body = newValue;
        for (const body of newValue) {
            body.addListener(() => {
                this.notifyListeners('body', newValue);
            });
        }
        this.notifyListeners('body', newValue);
    }
    get footer() {
        return this._footer;
    }
    set footer(newValue) {
        var _a, _b;
        (_a = this._footer) === null || _a === void 0 ? void 0 : _a.removeListener(this.footerChangedListener);
        this._footer = newValue;
        (_b = this._footer) === null || _b === void 0 ? void 0 : _b.addListener(this.footerChangedListener);
        this.notifyListeners('footer', newValue);
    }
    get hasTip() {
        return this._hasTip;
    }
    set hasTip(newValue) {
        this._hasTip = newValue;
        this.notifyListeners('hasTip', newValue);
    }
    get header() {
        return this._header;
    }
    set header(newValue) {
        var _a, _b;
        (_a = this._header) === null || _a === void 0 ? void 0 : _a.removeListener(this.headerChangedListener);
        this._header = newValue;
        (_b = this._header) === null || _b === void 0 ? void 0 : _b.addListener(this.headerChangedListener);
        this.notifyListeners('header', newValue);
    }
    get isEntireAnnotationTappable() {
        return this._isEntireAnnotationTappable;
    }
    set isEntireAnnotationTappable(newValue) {
        this._isEntireAnnotationTappable = newValue;
        this.notifyListeners('isEntireAnnotationTappable', newValue);
    }
    get listener() {
        return this._listener;
    }
    set listener(newValue) {
        this._listener = newValue;
        this._hasListener = newValue != null;
        this.notifyListeners('listener', newValue);
    }
    get width() {
        return this._width;
    }
    set width(newValue) {
        this._width = newValue;
        this.notifyListeners('width', newValue);
    }
}
__decorate([
    core.ignoreFromSerialization
], BarcodeCheckInfoAnnotation.prototype, "_barcode", void 0);
__decorate([
    core.nameForSerialization('type')
], BarcodeCheckInfoAnnotation.prototype, "_type", void 0);
__decorate([
    core.nameForSerialization('annotationTrigger')
], BarcodeCheckInfoAnnotation.prototype, "_annotationTrigger", void 0);
__decorate([
    core.nameForSerialization('anchor')
], BarcodeCheckInfoAnnotation.prototype, "_anchor", void 0);
__decorate([
    core.nameForSerialization('backgroundColor')
], BarcodeCheckInfoAnnotation.prototype, "_backgroundColor", void 0);
__decorate([
    core.nameForSerialization('body')
], BarcodeCheckInfoAnnotation.prototype, "_body", void 0);
__decorate([
    core.nameForSerialization('footer')
], BarcodeCheckInfoAnnotation.prototype, "_footer", void 0);
__decorate([
    core.nameForSerialization('hasTip')
], BarcodeCheckInfoAnnotation.prototype, "_hasTip", void 0);
__decorate([
    core.nameForSerialization('header')
], BarcodeCheckInfoAnnotation.prototype, "_header", void 0);
__decorate([
    core.nameForSerialization('isEntireAnnotationTappable')
], BarcodeCheckInfoAnnotation.prototype, "_isEntireAnnotationTappable", void 0);
__decorate([
    core.ignoreFromSerialization
], BarcodeCheckInfoAnnotation.prototype, "_listener", void 0);
__decorate([
    core.nameForSerialization('hasListener')
], BarcodeCheckInfoAnnotation.prototype, "_hasListener", void 0);
__decorate([
    core.nameForSerialization('width')
], BarcodeCheckInfoAnnotation.prototype, "_width", void 0);
__decorate([
    core.ignoreFromSerialization
], BarcodeCheckInfoAnnotation, "barcodeCheckDefaults", null);

class BarcodeCheckInfoAnnotationBodyComponent extends core.Observable {
    constructor() {
        super(...arguments);
        this._isRightIconTappable = BarcodeCheckInfoAnnotationBodyComponent
            .barcodeCheckDefaults.BarcodeCheckView.defaultInfoAnnotationBodyElementRightIconTappable;
        this._isLeftIconTappable = BarcodeCheckInfoAnnotationBodyComponent
            .barcodeCheckDefaults.BarcodeCheckView.defaultInfoAnnotationBodyElementLeftIconTappable;
        this._rightIcon = BarcodeCheckInfoAnnotationBodyComponent
            .barcodeCheckDefaults.BarcodeCheckView.defaultInfoAnnotationBodyElementRightIcon;
        this._leftIcon = BarcodeCheckInfoAnnotationBodyComponent
            .barcodeCheckDefaults.BarcodeCheckView.defaultInfoAnnotationBodyElementLeftIcon;
        this._text = BarcodeCheckInfoAnnotationBodyComponent
            .barcodeCheckDefaults.BarcodeCheckView.defaultInfoAnnotationBodyElementText;
        this._textAlign = core.TextAlignment.Center;
        this._textColor = BarcodeCheckInfoAnnotationBodyComponent
            .barcodeCheckDefaults.BarcodeCheckView.defaultInfoAnnotationBodyElementTextColor;
        this._textSize = BarcodeCheckInfoAnnotationBodyComponent
            .barcodeCheckDefaults.BarcodeCheckView.defaultInfoAnnotationBodyElementTextSize;
        this._fontFamily = core.FontFamily.SystemDefault;
    }
    static get barcodeCheckDefaults() {
        return getBarcodeCheckDefaults();
    }
    get isRightIconTappable() {
        return this._isRightIconTappable;
    }
    set isRightIconTappable(value) {
        this._isRightIconTappable = value;
        this.notifyListeners('isRightIconTappable', value);
    }
    get isLeftIconTappable() {
        return this._isLeftIconTappable;
    }
    set isLeftIconTappable(value) {
        this._isLeftIconTappable = value;
        this.notifyListeners('isLeftIconTappable', value);
    }
    get rightIcon() {
        return this._rightIcon;
    }
    set rightIcon(value) {
        this._rightIcon = value;
        this.notifyListeners('rightIcon', value);
    }
    get leftIcon() {
        return this._leftIcon;
    }
    set leftIcon(value) {
        this._leftIcon = value;
        this.notifyListeners('leftIcon', value);
    }
    get text() {
        return this._text;
    }
    set text(value) {
        this._text = value;
        this.notifyListeners('text', value);
    }
    get textAlign() {
        return this._textAlign;
    }
    set textAlign(value) {
        this._textAlign = value;
        this.notifyListeners('textAlign', value);
    }
    get textColor() {
        return this._textColor;
    }
    set textColor(value) {
        this._textColor = value;
        this.notifyListeners('textColor', value);
    }
    get textSize() {
        return this._textSize;
    }
    set textSize(value) {
        this._textSize = value;
        this.notifyListeners('textSize', value);
    }
    get fontFamily() {
        return this._fontFamily;
    }
    set fontFamily(value) {
        this._fontFamily = value;
        this.notifyListeners('fontFamily', value);
    }
}
__decorate([
    core.nameForSerialization('isRightIconTappable')
], BarcodeCheckInfoAnnotationBodyComponent.prototype, "_isRightIconTappable", void 0);
__decorate([
    core.nameForSerialization('isLeftIconTappable')
], BarcodeCheckInfoAnnotationBodyComponent.prototype, "_isLeftIconTappable", void 0);
__decorate([
    core.nameForSerialization('rightIcon')
], BarcodeCheckInfoAnnotationBodyComponent.prototype, "_rightIcon", void 0);
__decorate([
    core.nameForSerialization('leftIcon')
], BarcodeCheckInfoAnnotationBodyComponent.prototype, "_leftIcon", void 0);
__decorate([
    core.nameForSerialization('text')
], BarcodeCheckInfoAnnotationBodyComponent.prototype, "_text", void 0);
__decorate([
    core.nameForSerialization('textAlign')
], BarcodeCheckInfoAnnotationBodyComponent.prototype, "_textAlign", void 0);
__decorate([
    core.nameForSerialization('textColor')
], BarcodeCheckInfoAnnotationBodyComponent.prototype, "_textColor", void 0);
__decorate([
    core.nameForSerialization('textSize')
], BarcodeCheckInfoAnnotationBodyComponent.prototype, "_textSize", void 0);
__decorate([
    core.nameForSerialization('fontFamily')
], BarcodeCheckInfoAnnotationBodyComponent.prototype, "_fontFamily", void 0);
__decorate([
    core.ignoreFromSerialization
], BarcodeCheckInfoAnnotationBodyComponent, "barcodeCheckDefaults", null);

class BarcodeCheckInfoAnnotationFooter extends core.Observable {
    static get barcodeCheckDefaults() {
        return getBarcodeCheckDefaults();
    }
    constructor() {
        super();
        this._text = BarcodeCheckInfoAnnotationFooter.barcodeCheckDefaults
            .BarcodeCheckView.defaultInfoAnnotationFooterText;
        this._icon = BarcodeCheckInfoAnnotationFooter.barcodeCheckDefaults
            .BarcodeCheckView.defaultInfoAnnotationFooterIcon;
        this._textSize = BarcodeCheckInfoAnnotationFooter.barcodeCheckDefaults
            .BarcodeCheckView.defaultInfoAnnotationFooterTextSize;
        this._textColor = BarcodeCheckInfoAnnotationFooter.barcodeCheckDefaults
            .BarcodeCheckView.defaultInfoAnnotationFooterTextColor;
        this._backgroundColor = BarcodeCheckInfoAnnotationFooter.barcodeCheckDefaults
            .BarcodeCheckView.defaultInfoAnnotationFooterBackgroundColor;
        this._fontFamily = core.FontFamily.SystemDefault;
    }
    get text() {
        return this._text;
    }
    set text(value) {
        this._text = value;
        this.notifyListeners('text', value);
    }
    get icon() {
        return this._icon;
    }
    set icon(value) {
        this._icon = value;
        this.notifyListeners('icon', value);
    }
    get textSize() {
        return this._textSize;
    }
    set textSize(value) {
        this._textSize = value;
        this.notifyListeners('textSize', value);
    }
    get textColor() {
        return this._textColor;
    }
    set textColor(value) {
        this._textColor = value;
        this.notifyListeners('textColor', value);
    }
    get backgroundColor() {
        return this._backgroundColor;
    }
    set backgroundColor(value) {
        this._backgroundColor = value;
        this.notifyListeners('backgroundColor', value);
    }
    get fontFamily() {
        return this._fontFamily;
    }
    set fontFamily(value) {
        this._fontFamily = value;
        this.notifyListeners('fontFamily', value);
    }
}
__decorate([
    core.nameForSerialization('text')
], BarcodeCheckInfoAnnotationFooter.prototype, "_text", void 0);
__decorate([
    core.nameForSerialization('icon')
], BarcodeCheckInfoAnnotationFooter.prototype, "_icon", void 0);
__decorate([
    core.nameForSerialization('textSize')
], BarcodeCheckInfoAnnotationFooter.prototype, "_textSize", void 0);
__decorate([
    core.nameForSerialization('textColor')
], BarcodeCheckInfoAnnotationFooter.prototype, "_textColor", void 0);
__decorate([
    core.nameForSerialization('backgroundColor')
], BarcodeCheckInfoAnnotationFooter.prototype, "_backgroundColor", void 0);
__decorate([
    core.nameForSerialization('fontFamily')
], BarcodeCheckInfoAnnotationFooter.prototype, "_fontFamily", void 0);
__decorate([
    core.ignoreFromSerialization
], BarcodeCheckInfoAnnotationFooter, "barcodeCheckDefaults", null);

class BarcodeCheckInfoAnnotationHeader extends core.Observable {
    static get barcodeCheckDefaults() {
        return getBarcodeCheckDefaults();
    }
    constructor() {
        super();
        this._text = BarcodeCheckInfoAnnotationHeader.barcodeCheckDefaults
            .BarcodeCheckView.defaultInfoAnnotationHeaderText;
        this._icon = BarcodeCheckInfoAnnotationHeader.barcodeCheckDefaults
            .BarcodeCheckView.defaultInfoAnnotationHeaderIcon;
        this._textSize = BarcodeCheckInfoAnnotationHeader.barcodeCheckDefaults
            .BarcodeCheckView.defaultInfoAnnotationHeaderTextSize;
        this._textColor = BarcodeCheckInfoAnnotationHeader.barcodeCheckDefaults
            .BarcodeCheckView.defaultInfoAnnotationHeaderTextColor;
        this._backgroundColor = BarcodeCheckInfoAnnotationHeader.barcodeCheckDefaults
            .BarcodeCheckView.defaultInfoAnnotationHeaderBackgroundColor;
        this._fontFamily = core.FontFamily.SystemDefault;
    }
    get text() {
        return this._text;
    }
    set text(value) {
        this._text = value;
        this.notifyListeners('text', value);
    }
    get icon() {
        return this._icon;
    }
    set icon(value) {
        this._icon = value;
        this.notifyListeners('icon', value);
    }
    get textSize() {
        return this._textSize;
    }
    set textSize(value) {
        this._textSize = value;
        this.notifyListeners('textSize', value);
    }
    get textColor() {
        return this._textColor;
    }
    set textColor(value) {
        this._textColor = value;
        this.notifyListeners('textColor', value);
    }
    get backgroundColor() {
        return this._backgroundColor;
    }
    set backgroundColor(value) {
        this._backgroundColor = value;
        this.notifyListeners('backgroundColor', value);
    }
    get fontFamily() {
        return this._fontFamily;
    }
    set fontFamily(value) {
        this._fontFamily = value;
        this.notifyListeners('fontFamily', value);
    }
}
__decorate([
    core.nameForSerialization('text')
], BarcodeCheckInfoAnnotationHeader.prototype, "_text", void 0);
__decorate([
    core.nameForSerialization('icon')
], BarcodeCheckInfoAnnotationHeader.prototype, "_icon", void 0);
__decorate([
    core.nameForSerialization('textSize')
], BarcodeCheckInfoAnnotationHeader.prototype, "_textSize", void 0);
__decorate([
    core.nameForSerialization('textColor')
], BarcodeCheckInfoAnnotationHeader.prototype, "_textColor", void 0);
__decorate([
    core.nameForSerialization('backgroundColor')
], BarcodeCheckInfoAnnotationHeader.prototype, "_backgroundColor", void 0);
__decorate([
    core.nameForSerialization('fontFamily')
], BarcodeCheckInfoAnnotationHeader.prototype, "_fontFamily", void 0);
__decorate([
    core.ignoreFromSerialization
], BarcodeCheckInfoAnnotationHeader, "barcodeCheckDefaults", null);

class BarcodeCheckPopoverAnnotation extends core.Observable {
    static get barcodeCheckDefaults() {
        return getBarcodeCheckDefaults();
    }
    constructor(barcode, buttons) {
        super();
        this._type = 'barcodeCheckPopoverAnnotation';
        this._isEntirePopoverTappable = BarcodeCheckPopoverAnnotation.barcodeCheckDefaults
            .BarcodeCheckView.defaultIsEntirePopoverTappable;
        this._listener = null;
        this._hasListener = false;
        this._annotationTrigger = BarcodeCheckPopoverAnnotation.barcodeCheckDefaults
            .BarcodeCheckView.defaultInfoAnnotationTrigger;
        this.buttonChangedListener = (property, index) => {
            this.notifyListeners(property, index);
        };
        this._barcode = barcode;
        this._buttons = buttons;
        for (const button of buttons) {
            button.addListener(() => {
                this.buttonChangedListener('BarcodeCheckPopoverAnnotation.button', buttons.indexOf(button));
            });
        }
    }
    get barcode() {
        return this._barcode;
    }
    get isEntirePopoverTappable() {
        return this._isEntirePopoverTappable;
    }
    set isEntirePopoverTappable(value) {
        this._isEntirePopoverTappable = value;
        this.notifyListeners('isEntirePopoverTappable', value);
    }
    get listener() {
        return this._listener;
    }
    set listener(value) {
        this._listener = value;
        this._hasListener = value != null;
        this.notifyListeners('listener', value);
    }
    get annotationTrigger() {
        return this._annotationTrigger;
    }
    set annotationTrigger(value) {
        this._annotationTrigger = value;
        this.notifyListeners('annotationTrigger', value);
    }
    get buttons() {
        return this._buttons;
    }
}
__decorate([
    core.nameForSerialization('type')
], BarcodeCheckPopoverAnnotation.prototype, "_type", void 0);
__decorate([
    core.nameForSerialization('isEntirePopoverTappable')
], BarcodeCheckPopoverAnnotation.prototype, "_isEntirePopoverTappable", void 0);
__decorate([
    core.ignoreFromSerialization
], BarcodeCheckPopoverAnnotation.prototype, "_listener", void 0);
__decorate([
    core.nameForSerialization('hasListener')
], BarcodeCheckPopoverAnnotation.prototype, "_hasListener", void 0);
__decorate([
    core.nameForSerialization('annotationTrigger')
], BarcodeCheckPopoverAnnotation.prototype, "_annotationTrigger", void 0);
__decorate([
    core.ignoreFromSerialization
], BarcodeCheckPopoverAnnotation.prototype, "_barcode", void 0);
__decorate([
    core.nameForSerialization('buttons')
], BarcodeCheckPopoverAnnotation.prototype, "_buttons", void 0);
__decorate([
    core.ignoreFromSerialization
], BarcodeCheckPopoverAnnotation, "barcodeCheckDefaults", null);

class BarcodeCheckPopoverAnnotationButton extends core.Observable {
    static get barcodeCheckDefaults() {
        return getBarcodeCheckDefaults();
    }
    constructor(icon, text) {
        super();
        this._textColor = BarcodeCheckPopoverAnnotationButton
            .barcodeCheckDefaults.BarcodeCheckView.defaultBarcodeCheckPopoverAnnotationButtonTextColor;
        this._textSize = BarcodeCheckPopoverAnnotationButton
            .barcodeCheckDefaults.BarcodeCheckView.defaultBarcodeCheckPopoverAnnotationButtonTextSize;
        this._fontFamily = core.FontFamily.SystemDefault;
        this._icon = icon;
        this._text = text;
    }
    get textColor() {
        return this._textColor;
    }
    set textColor(value) {
        this._textColor = value;
        this.notifyListeners('textColor', value);
    }
    get textSize() {
        return this._textSize;
    }
    set textSize(value) {
        this._textSize = value;
        this.notifyListeners('textSize', value);
    }
    get fontFamily() {
        return this._fontFamily;
    }
    set fontFamily(value) {
        this._fontFamily = value;
        this.notifyListeners('fontFamily', value);
    }
    get icon() {
        return this._icon;
    }
    get text() {
        return this._text;
    }
}
__decorate([
    core.nameForSerialization('textColor')
], BarcodeCheckPopoverAnnotationButton.prototype, "_textColor", void 0);
__decorate([
    core.nameForSerialization('textSize')
], BarcodeCheckPopoverAnnotationButton.prototype, "_textSize", void 0);
__decorate([
    core.nameForSerialization('fontFamily')
], BarcodeCheckPopoverAnnotationButton.prototype, "_fontFamily", void 0);
__decorate([
    core.nameForSerialization('icon')
], BarcodeCheckPopoverAnnotationButton.prototype, "_icon", void 0);
__decorate([
    core.nameForSerialization('text')
], BarcodeCheckPopoverAnnotationButton.prototype, "_text", void 0);
__decorate([
    core.ignoreFromSerialization
], BarcodeCheckPopoverAnnotationButton, "barcodeCheckDefaults", null);

class BarcodeCheckRectangleHighlight extends core.Observable {
    static get barcodeCheckDefaults() {
        return getBarcodeCheckDefaults();
    }
    constructor(barcode) {
        super();
        this._type = 'barcodeCheckRectangleHighlight';
        this._brush = BarcodeCheckRectangleHighlight
            .barcodeCheckDefaults.BarcodeCheckView.defaultRectangleHighlightBrush;
        this._icon = BarcodeCheckRectangleHighlight
            .barcodeCheckDefaults.BarcodeCheckView.defaultHighlightIcon;
        this._barcode = barcode;
    }
    get barcode() {
        return this._barcode;
    }
    get brush() {
        return this._brush;
    }
    set brush(brush) {
        this._brush = brush;
        this.notifyListeners('brush', brush);
    }
    get icon() {
        return this._icon;
    }
    set icon(icon) {
        this._icon = icon;
        this.notifyListeners('icon', icon);
    }
}
__decorate([
    core.ignoreFromSerialization
], BarcodeCheckRectangleHighlight.prototype, "_barcode", void 0);
__decorate([
    core.nameForSerialization('type')
], BarcodeCheckRectangleHighlight.prototype, "_type", void 0);
__decorate([
    core.nameForSerialization('brush')
], BarcodeCheckRectangleHighlight.prototype, "_brush", void 0);
__decorate([
    core.nameForSerialization('icon')
], BarcodeCheckRectangleHighlight.prototype, "_icon", void 0);
__decorate([
    core.ignoreFromSerialization
], BarcodeCheckRectangleHighlight, "barcodeCheckDefaults", null);

class BarcodeCheckSettings extends core.DefaultSerializeable {
    constructor() {
        super(...arguments);
        this.symbologies = {};
        this.properties = {};
    }
    static get barcodeDefaults() {
        return getBarcodeDefaults();
    }
    get enabledSymbologies() {
        return Object.keys(this.symbologies)
            .filter(symbology => this.symbologies[symbology].isEnabled);
    }
    settingsForSymbology(symbology) {
        if (!this.symbologies[symbology]) {
            const symbologySettings = BarcodeCheckSettings.barcodeDefaults.SymbologySettings[symbology];
            symbologySettings._symbology = symbology;
            this.symbologies[symbology] = symbologySettings;
        }
        return this.symbologies[symbology];
    }
    enableSymbologies(symbologies) {
        symbologies.forEach(symbology => this.enableSymbology(symbology, true));
    }
    enableSymbology(symbology, enabled) {
        this.settingsForSymbology(symbology).isEnabled = enabled;
    }
    setProperty(name, value) {
        this.properties[name] = value;
    }
    getProperty(name) {
        return this.properties[name];
    }
}
__decorate([
    core.ignoreFromSerialization
], BarcodeCheckSettings, "barcodeDefaults", null);

class BarcodeCheckStatusIconAnnotation extends core.Observable {
    static get barcodeCheckDefaults() {
        return getBarcodeCheckDefaults();
    }
    constructor(barcode) {
        super();
        this._type = 'barcodeCheckStatusIconAnnotation';
        this._hasTip = BarcodeCheckStatusIconAnnotation
            .barcodeCheckDefaults.BarcodeCheckView.defaultStatusIconAnnotationHasTip;
        this._icon = BarcodeCheckStatusIconAnnotation
            .barcodeCheckDefaults.BarcodeCheckView.defaultStatusIconAnnotationIcon;
        this._text = BarcodeCheckStatusIconAnnotation
            .barcodeCheckDefaults.BarcodeCheckView.defaultStatusIconAnnotationText;
        this._textColor = BarcodeCheckStatusIconAnnotation
            .barcodeCheckDefaults.BarcodeCheckView.defaultStatusIconAnnotationTextColor;
        this._backgroundColor = BarcodeCheckStatusIconAnnotation
            .barcodeCheckDefaults.BarcodeCheckView.defaultStatusIconAnnotationBackgroundColor;
        this._annotationTrigger = BarcodeCheckStatusIconAnnotation
            .barcodeCheckDefaults.BarcodeCheckView.defaultStatusIconAnnotationTrigger;
        this._barcode = barcode;
    }
    get barcode() {
        return this._barcode;
    }
    get hasTip() {
        return this._hasTip;
    }
    set hasTip(value) {
        this._hasTip = value;
        this.notifyListeners('hasTip', value);
    }
    get icon() {
        return this._icon;
    }
    set icon(value) {
        this._icon = value;
        this.notifyListeners('icon', value);
    }
    get text() {
        return this._text;
    }
    set text(value) {
        this._text = value;
        this.notifyListeners('text', value);
    }
    get textColor() {
        return this._textColor;
    }
    set textColor(value) {
        this._textColor = value;
        this.notifyListeners('textColor', value);
    }
    get backgroundColor() {
        return this._backgroundColor;
    }
    set backgroundColor(value) {
        this._backgroundColor = value;
        this.notifyListeners('backgroundColor', value);
    }
    get annotationTrigger() {
        return this._annotationTrigger;
    }
    set annotationTrigger(value) {
        this._annotationTrigger = value;
        this.notifyListeners('annotationTrigger', value);
    }
}
__decorate([
    core.nameForSerialization('type')
], BarcodeCheckStatusIconAnnotation.prototype, "_type", void 0);
__decorate([
    core.nameForSerialization('barcode')
], BarcodeCheckStatusIconAnnotation.prototype, "_barcode", void 0);
__decorate([
    core.nameForSerialization('hasTip')
], BarcodeCheckStatusIconAnnotation.prototype, "_hasTip", void 0);
__decorate([
    core.nameForSerialization('icon')
], BarcodeCheckStatusIconAnnotation.prototype, "_icon", void 0);
__decorate([
    core.nameForSerialization('text')
], BarcodeCheckStatusIconAnnotation.prototype, "_text", void 0);
__decorate([
    core.nameForSerialization('textColor')
], BarcodeCheckStatusIconAnnotation.prototype, "_textColor", void 0);
__decorate([
    core.nameForSerialization('backgroundColor')
], BarcodeCheckStatusIconAnnotation.prototype, "_backgroundColor", void 0);
__decorate([
    core.nameForSerialization('annotationTrigger')
], BarcodeCheckStatusIconAnnotation.prototype, "_annotationTrigger", void 0);
__decorate([
    core.ignoreFromSerialization
], BarcodeCheckStatusIconAnnotation, "barcodeCheckDefaults", null);

var BarcodeCheckViewEvents;
(function (BarcodeCheckViewEvents) {
    BarcodeCheckViewEvents["didTapHighlightForBarcode"] = "BarcodeCheckViewUiListener.didTapHighlightForBarcode";
    BarcodeCheckViewEvents["highlightForBarcode"] = "BarcodeCheckHighlightProvider.highlightForBarcode";
    BarcodeCheckViewEvents["annotationForBarcode"] = "BarcodeCheckAnnotationProvider.annotationForBarcode";
    BarcodeCheckViewEvents["didTapPopoverEvent"] = "BarcodeCheckPopoverAnnotationListener.didTapPopover";
    BarcodeCheckViewEvents["didTapPopoverButtonEvent"] = "BarcodeCheckPopoverAnnotationListener.didTapPopoverButton";
    BarcodeCheckViewEvents["didTapInfoAnnotationRightIconEvent"] = "BarcodeCheckInfoAnnotationListener.didTapInfoAnnotationRightIcon";
    BarcodeCheckViewEvents["didTapInfoAnnotationLeftIconEvent"] = "BarcodeCheckInfoAnnotationListener.didTapInfoAnnotationLeftIcon";
    BarcodeCheckViewEvents["didTapInfoAnnotationEvent"] = "BarcodeCheckInfoAnnotationListener.didTapInfoAnnotation";
    BarcodeCheckViewEvents["didTapInfoAnnotationHeaderEvent"] = "BarcodeCheckInfoAnnotationListener.didTapInfoAnnotationHeader";
    BarcodeCheckViewEvents["didTapInfoAnnotationFooterEvent"] = "BarcodeCheckInfoAnnotationListener.didTapInfoAnnotationFooter";
})(BarcodeCheckViewEvents || (BarcodeCheckViewEvents = {}));
class BarcodeCheckViewController extends core.BaseController {
    constructor() {
        super('BarcodeCheckViewProxy');
        this.autoCreateNativeView = true;
        this.isListenerEnabled = false;
        this.highlightCache = {};
        this.annotationsCache = {};
    }
    dispose() {
        this.highlightCache = {};
        this.annotationsCache = {};
        this.setHighlightProvider(null);
        this.setAnnotationProvider(null);
        this.setUiListener(null);
    }
    static forBarcodeCheckView(barcodeCheck, baseView, autoCreateNativeView = true) {
        const viewController = new BarcodeCheckViewController();
        viewController.baseView = baseView;
        viewController.autoCreateNativeView = autoCreateNativeView;
        viewController.barcodeCheck = barcodeCheck;
        viewController.initialize();
        if (baseView.barcodeCheckViewUiListener) {
            viewController.subscribeForUiListenerEvents();
        }
        if (baseView.annotationProvider) {
            viewController.subscribeForAnnotationProviderEvents();
        }
        if (baseView.highlightProvider) {
            viewController.subscribeForHighlightProviderEvents();
        }
        return viewController;
    }
    initialize() {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.baseView.context.update();
            if (this.autoCreateNativeView) {
                yield this.createView();
            }
        });
    }
    createView() {
        return __awaiter(this, void 0, void 0, function* () {
            const barcodeCheckView = this.baseView.toJSON();
            const json = JSON.stringify(barcodeCheckView);
            return this._proxy.createView(this.baseView.nativeView, json);
        });
    }
    subscribeForUiListenerEvents() {
        this.unsubscribeForUiListenerEvents();
        this.eventEmitter.on(BarcodeCheckViewEvents.didTapHighlightForBarcode, (data) => {
            var _a, _b;
            if (!this.baseView.barcodeCheckViewUiListener) {
                return;
            }
            const payload = core.EventDataParser.parse(data);
            if (payload === null) {
                console.error('BarcodeCheckViewController didTapHighlightForBarcode payload is null');
                return;
            }
            const barcodeJson = JSON.parse(payload.barcode);
            const barcode = Barcode.fromJSON(barcodeJson);
            const highlight = this.highlightCache[payload.barcodeId];
            if (!highlight) {
                return;
            }
            (_b = (_a = this.baseView) === null || _a === void 0 ? void 0 : _a.barcodeCheckViewUiListener) === null || _b === void 0 ? void 0 : _b.didTapHighlightForBarcode(this.barcodeCheck, barcode, highlight);
        });
        this._proxy.subscribeViewListeners();
    }
    unsubscribeForUiListenerEvents() {
        this._proxy.unsubscribeViewListeners();
        this.eventEmitter.off(BarcodeCheckViewEvents.didTapHighlightForBarcode);
    }
    subscribeForAnnotationProviderEvents() {
        this.unsubscribeForAnnotationProviderEvents();
        this.eventEmitter.on(BarcodeCheckViewEvents.annotationForBarcode, (data) => __awaiter(this, void 0, void 0, function* () {
            var _a, _b;
            const payload = core.EventDataParser.parse(data);
            if (payload === null) {
                console.error('BarcodeCheckViewController annotationForBarcode payload is null');
                return;
            }
            const barcodeJson = JSON.parse(payload.barcode);
            const barcode = Barcode.fromJSON(barcodeJson);
            barcode.barcodeId = payload.barcodeId;
            const annotation = yield ((_b = (_a = this.baseView) === null || _a === void 0 ? void 0 : _a.annotationProvider) === null || _b === void 0 ? void 0 : _b.annotationForBarcode(barcode));
            if (annotation) {
                this.annotationsCache[payload.barcodeId] = annotation;
                annotation.addListener((property, value) => {
                    if (property === 'BarcodeCheckPopoverAnnotation.button') {
                        const popover = annotation;
                        const button = popover.buttons[value];
                        const buttonJson = button.toJSON();
                        buttonJson.index = value;
                        const popoverButtonPayload = {
                            'button': buttonJson,
                            'barcodeId': payload.barcodeId,
                        };
                        this._proxy.updatePopoverButton(JSON.stringify(popoverButtonPayload));
                        return;
                    }
                    const annotationJson = annotation.toJSON();
                    annotationJson.barcodeId = payload.barcodeId;
                    this._proxy.updateAnnotation(JSON.stringify(annotationJson));
                });
            }
            const result = {
                barcodeId: payload.barcodeId,
                annotation: annotation === null || annotation === void 0 ? void 0 : annotation.toJSON()
            };
            this._proxy.finishAnnotationForBarcode(JSON.stringify(result));
        }));
        this.eventEmitter.on(BarcodeCheckViewEvents.didTapPopoverEvent, (data) => __awaiter(this, void 0, void 0, function* () {
            var _a, _b;
            const payload = core.EventDataParser.parse(data);
            if (payload === null) {
                console.error('BarcodeCheckViewController didTapPopoverEvent payload is null');
                return;
            }
            const popover = this.annotationsCache[payload.barcodeId];
            if (!popover) {
                return;
            }
            (_b = (_a = popover.listener) === null || _a === void 0 ? void 0 : _a.didTap) === null || _b === void 0 ? void 0 : _b.call(_a, popover);
        }));
        this.eventEmitter.on(BarcodeCheckViewEvents.didTapPopoverButtonEvent, (data) => __awaiter(this, void 0, void 0, function* () {
            var _a, _b;
            const payload = core.EventDataParser.parse(data);
            if (payload === null) {
                console.error('BarcodeCheckViewController didTapPopoverButtonEvent payload is null');
                return;
            }
            const popover = this.annotationsCache[payload.barcodeId];
            if (!popover || !payload.index) {
                return;
            }
            const button = popover.buttons[payload.index];
            (_b = (_a = popover.listener) === null || _a === void 0 ? void 0 : _a.didTapButton) === null || _b === void 0 ? void 0 : _b.call(_a, popover, button, payload.index);
        }));
        this.eventEmitter.on(BarcodeCheckViewEvents.didTapInfoAnnotationRightIconEvent, (data) => __awaiter(this, void 0, void 0, function* () {
            var _a, _b;
            const payload = core.EventDataParser.parse(data);
            if (payload === null) {
                console.error('BarcodeCheckViewController didTapInfoAnnotationRightIconEvent payload is null');
                return;
            }
            const infoAnnotation = this.annotationsCache[payload.barcodeId];
            if (infoAnnotation == null || payload.componentIndex == null) {
                return;
            }
            const component = infoAnnotation.body[payload.componentIndex];
            (_b = (_a = infoAnnotation.listener) === null || _a === void 0 ? void 0 : _a.didTapRightIcon) === null || _b === void 0 ? void 0 : _b.call(_a, infoAnnotation, component, payload.componentIndex);
        }));
        this.eventEmitter.on(BarcodeCheckViewEvents.didTapInfoAnnotationLeftIconEvent, (data) => __awaiter(this, void 0, void 0, function* () {
            var _a, _b;
            const payload = core.EventDataParser.parse(data);
            if (payload === null) {
                console.error('BarcodeCheckViewController didTapInfoAnnotationLeftIconEvent payload is null');
                return;
            }
            const infoAnnotation = this.annotationsCache[payload.barcodeId];
            if (infoAnnotation == null || payload.componentIndex == null) {
                return;
            }
            const component = infoAnnotation.body[payload.componentIndex];
            (_b = (_a = infoAnnotation.listener) === null || _a === void 0 ? void 0 : _a.didTapLeftIcon) === null || _b === void 0 ? void 0 : _b.call(_a, infoAnnotation, component, payload.componentIndex);
        }));
        this.eventEmitter.on(BarcodeCheckViewEvents.didTapInfoAnnotationEvent, (data) => __awaiter(this, void 0, void 0, function* () {
            var _a, _b;
            const payload = core.EventDataParser.parse(data);
            if (payload === null) {
                console.error('BarcodeCheckViewController didTapInfoAnnotationEvent payload is null');
                return;
            }
            const infoAnnotation = this.annotationsCache[payload.barcodeId];
            if (infoAnnotation == null) {
                return;
            }
            (_b = (_a = infoAnnotation.listener) === null || _a === void 0 ? void 0 : _a.didTap) === null || _b === void 0 ? void 0 : _b.call(_a, infoAnnotation);
        }));
        this.eventEmitter.on(BarcodeCheckViewEvents.didTapInfoAnnotationHeaderEvent, (data) => __awaiter(this, void 0, void 0, function* () {
            var _a, _b;
            const payload = core.EventDataParser.parse(data);
            if (payload === null) {
                console.error('BarcodeCheckViewController didTapInfoAnnotationHeaderEvent payload is null');
                return;
            }
            const infoAnnotation = this.annotationsCache[payload.barcodeId];
            if (infoAnnotation == null) {
                return;
            }
            (_b = (_a = infoAnnotation.listener) === null || _a === void 0 ? void 0 : _a.didTapHeader) === null || _b === void 0 ? void 0 : _b.call(_a, infoAnnotation);
        }));
        this.eventEmitter.on(BarcodeCheckViewEvents.didTapInfoAnnotationFooterEvent, (data) => __awaiter(this, void 0, void 0, function* () {
            var _a, _b;
            const payload = core.EventDataParser.parse(data);
            if (payload === null) {
                console.error('BarcodeCheckViewController didTapInfoAnnotationFooterEvent payload is null');
                return;
            }
            const infoAnnotation = this.annotationsCache[payload.barcodeId];
            if (infoAnnotation == null) {
                return;
            }
            (_b = (_a = infoAnnotation.listener) === null || _a === void 0 ? void 0 : _a.didTapFooter) === null || _b === void 0 ? void 0 : _b.call(_a, infoAnnotation);
        }));
        this._proxy.subscribeToAnnotationProviderEvents();
    }
    unsubscribeForAnnotationProviderEvents() {
        this._proxy.unsubscribeFromAnnotationProviderEvents();
        this.eventEmitter.off(BarcodeCheckViewEvents.annotationForBarcode);
    }
    subscribeForHighlightProviderEvents() {
        this.unsubscribeForHighlightProviderEvents();
        this.eventEmitter.on(BarcodeCheckViewEvents.highlightForBarcode, (data) => __awaiter(this, void 0, void 0, function* () {
            var _a, _b;
            const payload = core.EventDataParser.parse(data);
            if (payload === null) {
                console.error('BarcodeCheckViewController highlightForBarcode payload is null');
                return;
            }
            const barcodeJson = JSON.parse(payload.barcode);
            const barcode = Barcode.fromJSON(barcodeJson);
            barcode.barcodeId = payload.barcodeId;
            const highlight = yield ((_b = (_a = this.baseView) === null || _a === void 0 ? void 0 : _a.highlightProvider) === null || _b === void 0 ? void 0 : _b.highlightForBarcode(barcode));
            if (highlight) {
                this.highlightCache[payload.barcodeId] = highlight;
                highlight.addListener(() => {
                    const highlightJson = highlight.toJSON();
                    highlightJson.barcodeId = payload.barcodeId;
                    this._proxy.updateHighlight(JSON.stringify(highlightJson));
                });
            }
            const result = {
                barcodeId: payload.barcodeId,
                highlight: highlight === null || highlight === void 0 ? void 0 : highlight.toJSON()
            };
            this._proxy.finishHighlightForBarcode(JSON.stringify(result));
        }));
        this._proxy.subscribeToHighlightProviderEvents();
    }
    unsubscribeForHighlightProviderEvents() {
        this._proxy.unsubscribeFromHighlightProviderEvents();
        this.eventEmitter.off(BarcodeCheckViewEvents.highlightForBarcode);
    }
    setUiListener(listener) {
        return __awaiter(this, void 0, void 0, function* () {
            if (listener && !this.isListenerEnabled) {
                this.isListenerEnabled = true;
                this.subscribeForUiListenerEvents();
            }
            if (listener == null) {
                this.isListenerEnabled = false;
                this.unsubscribeForUiListenerEvents();
            }
        });
    }
    setAnnotationProvider(provider) {
        return __awaiter(this, void 0, void 0, function* () {
            if (provider != null) {
                yield this._proxy.registerBarcodeCheckAnnotationProvider();
                this.subscribeForAnnotationProviderEvents();
            }
            else {
                yield this._proxy.unregisterBarcodeCheckAnnotationProvider();
                this.unsubscribeForAnnotationProviderEvents();
            }
        });
    }
    setHighlightProvider(provider) {
        return __awaiter(this, void 0, void 0, function* () {
            if (provider != null) {
                yield this._proxy.registerBarcodeCheckHighlightProvider();
                this.subscribeForHighlightProviderEvents();
            }
            else {
                yield this._proxy.unregisterBarcodeCheckHighlightProvider();
                this.unsubscribeForHighlightProviderEvents();
            }
        });
    }
    start() {
        this.highlightCache = {};
        this.annotationsCache = {};
        return this._proxy.start();
    }
    stop() {
        this.highlightCache = {};
        this.annotationsCache = {};
        return this._proxy.stop();
    }
    pause() {
        this.highlightCache = {};
        this.annotationsCache = {};
        return this._proxy.pause();
    }
    update() {
        const barcodeCheckView = this.baseView.toJSON().View;
        const json = JSON.stringify(barcodeCheckView);
        return this._proxy.update(json);
    }
}
__decorate([
    core.ignoreFromSerialization
], BarcodeCheckViewController.prototype, "autoCreateNativeView", void 0);
__decorate([
    core.ignoreFromSerialization
], BarcodeCheckViewController.prototype, "highlightCache", void 0);
__decorate([
    core.ignoreFromSerialization
], BarcodeCheckViewController.prototype, "annotationsCache", void 0);

class BaseBarcodeCheckView extends core.DefaultSerializeable {
    static get barcodeCheckDefaults() {
        return getBarcodeCheckDefaults();
    }
    constructor(context, barcodeCheck, nativeView = null, barcodeCheckViewSettings, cameraSettings, annotationProvider, highlightProvider, uiListener, autoCreateNativeView = true) {
        super();
        this._autoCreateNativeView = true;
        this._annotationProvider = null;
        this._barcodeCheckViewUiListener = null;
        this._highlightProvider = null;
        this.nativeView = null;
        this._isStarted = false;
        this._shouldShowMacroControl = false;
        this._macroModeControlPosition = BaseBarcodeCheckView
            .barcodeCheckDefaults.BarcodeCheckView.defaultCameraSwitchControlPosition;
        this._shouldShowTorchControl = false;
        this._torchControlPosition = BaseBarcodeCheckView
            .barcodeCheckDefaults.BarcodeCheckView.defaultTorchControlPosition;
        this._shouldShowZoomControl = BaseBarcodeCheckView
            .barcodeCheckDefaults.BarcodeCheckView.defaultShouldShowZoomControl;
        this._zoomControlPosition = BaseBarcodeCheckView
            .barcodeCheckDefaults.BarcodeCheckView.defaultZoomControlPosition;
        this._dataCaptureContext = context;
        this._barcodeCheck = barcodeCheck;
        this._barcodeCheckViewSettings = barcodeCheckViewSettings;
        this._cameraSettings = cameraSettings;
        this._autoCreateNativeView = autoCreateNativeView;
        this._annotationProvider = annotationProvider !== null && annotationProvider !== void 0 ? annotationProvider : null;
        this._highlightProvider = highlightProvider !== null && highlightProvider !== void 0 ? highlightProvider : null;
        this._barcodeCheckViewUiListener = uiListener !== null && uiListener !== void 0 ? uiListener : null;
        this.nativeView = nativeView;
        this.controller = BarcodeCheckViewController.forBarcodeCheckView(this._barcodeCheck, this, this._autoCreateNativeView);
    }
    dispose() {
        this.controller.dispose();
        this._barcodeCheck.unsubscribeNativeListeners();
    }
    updateNative() {
        return this.controller.update();
    }
    get barcodeCheckViewUiListener() {
        return this._barcodeCheckViewUiListener;
    }
    set barcodeCheckViewUiListener(value) {
        this._barcodeCheckViewUiListener = value;
        this.controller.setUiListener(value);
    }
    get annotationProvider() {
        return this._annotationProvider;
    }
    set annotationProvider(value) {
        this._annotationProvider = value;
        this.controller.setAnnotationProvider(value);
    }
    get highlightProvider() {
        return this._highlightProvider;
    }
    set highlightProvider(value) {
        this._highlightProvider = value;
        this.controller.setHighlightProvider(value);
    }
    get context() {
        return this._dataCaptureContext;
    }
    start() {
        this._isStarted = true;
        return this.controller.start();
    }
    stop() {
        this._isStarted = false;
        return this.controller.stop();
    }
    pause() {
        // TODO: check if we need to change isStarted
        return this.controller.pause();
    }
    get shouldShowTorchControl() {
        return this._shouldShowTorchControl;
    }
    set shouldShowTorchControl(value) {
        this._shouldShowTorchControl = value;
        this.updateNative();
    }
    get torchControlPosition() {
        return this._torchControlPosition;
    }
    set torchControlPosition(value) {
        this._torchControlPosition = value;
        this.updateNative();
    }
    get shouldShowZoomControl() {
        return this._shouldShowZoomControl;
    }
    set shouldShowZoomControl(value) {
        this._shouldShowZoomControl = value;
        this.updateNative();
    }
    get zoomControlPosition() {
        return this._zoomControlPosition;
    }
    set zoomControlPosition(value) {
        this._zoomControlPosition = value;
        this.updateNative();
    }
    get shouldShowCameraSwitchControl() {
        return this._shouldShowMacroControl;
    }
    set shouldShowCameraSwitchControl(value) {
        this._shouldShowMacroControl = value;
        this.updateNative();
    }
    get cameraSwitchControlPosition() {
        return this._macroModeControlPosition;
    }
    set cameraSwitchControlPosition(value) {
        this._macroModeControlPosition = value;
        this.updateNative();
    }
    get shouldShowMacroModeControl() {
        return this._shouldShowMacroControl;
    }
    set shouldShowMacroModeControl(value) {
        this._shouldShowMacroControl = value;
        this.updateNative();
    }
    get macroModeControlPosition() {
        return this._macroModeControlPosition;
    }
    set macroModeControlPosition(value) {
        this._macroModeControlPosition = value;
        this.updateNative();
    }
    toJSON() {
        const json = {
            View: {
                barcodeCheckViewSettings: this._barcodeCheckViewSettings,
                cameraSettings: this._cameraSettings,
                shouldShowMacroControl: this._shouldShowMacroControl,
                macroModeControlPosition: this._macroModeControlPosition,
                shouldShowTorchControl: this._shouldShowTorchControl,
                torchControlPosition: this._torchControlPosition,
                shouldShowZoomControl: this._shouldShowZoomControl,
                zoomControlPosition: this._zoomControlPosition,
                annotationProvider: this._annotationProvider,
                barcodeCheckViewUiListener: this._barcodeCheckViewUiListener,
                highlightProvider: this._highlightProvider,
                isStarted: this._isStarted,
                hasUiListener: this._barcodeCheckViewUiListener != null,
                hasHighlightProvider: this._highlightProvider != null,
                hasAnnotationProvider: this._annotationProvider != null,
            },
            BarcodeCheck: this._barcodeCheck.toJSON(),
        };
        return json;
    }
}
__decorate([
    core.ignoreFromSerialization
], BaseBarcodeCheckView.prototype, "_autoCreateNativeView", void 0);
__decorate([
    core.ignoreFromSerialization
], BaseBarcodeCheckView.prototype, "_annotationProvider", void 0);
__decorate([
    core.ignoreFromSerialization
], BaseBarcodeCheckView.prototype, "_barcodeCheckViewUiListener", void 0);
__decorate([
    core.ignoreFromSerialization
], BaseBarcodeCheckView.prototype, "_highlightProvider", void 0);
__decorate([
    core.ignoreFromSerialization
], BaseBarcodeCheckView.prototype, "nativeView", void 0);
__decorate([
    core.nameForSerialization('barcodeCheck')
], BaseBarcodeCheckView.prototype, "_barcodeCheck", void 0);
__decorate([
    core.nameForSerialization('isStarted')
], BaseBarcodeCheckView.prototype, "_isStarted", void 0);
__decorate([
    core.nameForSerialization('viewSettings')
], BaseBarcodeCheckView.prototype, "_barcodeCheckViewSettings", void 0);
__decorate([
    core.nameForSerialization('cameraSettings')
], BaseBarcodeCheckView.prototype, "_cameraSettings", void 0);
__decorate([
    core.nameForSerialization('dataCaptureContext')
], BaseBarcodeCheckView.prototype, "_dataCaptureContext", void 0);
__decorate([
    core.nameForSerialization('shouldShowMacroControl')
], BaseBarcodeCheckView.prototype, "_shouldShowMacroControl", void 0);
__decorate([
    core.nameForSerialization('macroModeControlPosition')
], BaseBarcodeCheckView.prototype, "_macroModeControlPosition", void 0);
__decorate([
    core.nameForSerialization('shouldShowTorchControl')
], BaseBarcodeCheckView.prototype, "_shouldShowTorchControl", void 0);
__decorate([
    core.nameForSerialization('torchControlPosition')
], BaseBarcodeCheckView.prototype, "_torchControlPosition", void 0);
__decorate([
    core.nameForSerialization('shouldShowZoomControl')
], BaseBarcodeCheckView.prototype, "_shouldShowZoomControl", void 0);
__decorate([
    core.nameForSerialization('zoomControlPosition')
], BaseBarcodeCheckView.prototype, "_zoomControlPosition", void 0);
__decorate([
    core.ignoreFromSerialization
], BaseBarcodeCheckView, "barcodeCheckDefaults", null);

class BarcodeCheckViewSettings extends core.DefaultSerializeable {
    static get barcodeCheckDefaults() {
        return getBarcodeCheckDefaults();
    }
    constructor() {
        super();
        this._soundEnabled = BarcodeCheckViewSettings
            .barcodeCheckDefaults.BarcodeCheckView.defaultSoundEnabled;
        this._hapticEnabled = BarcodeCheckViewSettings
            .barcodeCheckDefaults.BarcodeCheckView.defaultHapticsEnabled;
        this._defaultCameraPosition = BarcodeCheckViewSettings
            .barcodeCheckDefaults.BarcodeCheckView.defaultCameraPosition;
    }
    get soundEnabled() {
        return this._soundEnabled;
    }
    set soundEnabled(value) {
        this._soundEnabled = value;
    }
    get hapticEnabled() {
        return this._hapticEnabled;
    }
    set hapticEnabled(value) {
        this._hapticEnabled = value;
    }
    get defaultCameraPosition() {
        return this._defaultCameraPosition;
    }
    set defaultCameraPosition(value) {
        this._defaultCameraPosition = value;
    }
}
__decorate([
    core.nameForSerialization("soundEnabled")
], BarcodeCheckViewSettings.prototype, "_soundEnabled", void 0);
__decorate([
    core.nameForSerialization("hapticEnabled")
], BarcodeCheckViewSettings.prototype, "_hapticEnabled", void 0);
__decorate([
    core.nameForSerialization("defaultCameraPosition")
], BarcodeCheckViewSettings.prototype, "_defaultCameraPosition", void 0);
__decorate([
    core.ignoreFromSerialization
], BarcodeCheckViewSettings, "barcodeCheckDefaults", null);

var BarcodeCheckAnnotationTrigger;
(function (BarcodeCheckAnnotationTrigger) {
    BarcodeCheckAnnotationTrigger["HighlightTap"] = "highlightTap";
    BarcodeCheckAnnotationTrigger["HighlightTapAndBarcodeScan"] = "highlightTapAndBarcodeScan";
})(BarcodeCheckAnnotationTrigger || (BarcodeCheckAnnotationTrigger = {}));

var BarcodeCheckCircleHighlightPreset;
(function (BarcodeCheckCircleHighlightPreset) {
    BarcodeCheckCircleHighlightPreset["Dot"] = "dot";
    BarcodeCheckCircleHighlightPreset["Icon"] = "icon";
})(BarcodeCheckCircleHighlightPreset || (BarcodeCheckCircleHighlightPreset = {}));

var BarcodeCheckInfoAnnotationAnchor;
(function (BarcodeCheckInfoAnnotationAnchor) {
    BarcodeCheckInfoAnnotationAnchor["Top"] = "top";
    BarcodeCheckInfoAnnotationAnchor["Bottom"] = "bottom";
    BarcodeCheckInfoAnnotationAnchor["Left"] = "left";
    BarcodeCheckInfoAnnotationAnchor["Right"] = "right";
})(BarcodeCheckInfoAnnotationAnchor || (BarcodeCheckInfoAnnotationAnchor = {}));

var BarcodeCheckInfoAnnotationWidthPreset;
(function (BarcodeCheckInfoAnnotationWidthPreset) {
    BarcodeCheckInfoAnnotationWidthPreset["Small"] = "small";
    BarcodeCheckInfoAnnotationWidthPreset["Medium"] = "medium";
    BarcodeCheckInfoAnnotationWidthPreset["Large"] = "large";
})(BarcodeCheckInfoAnnotationWidthPreset || (BarcodeCheckInfoAnnotationWidthPreset = {}));

class BarcodeSelectionFeedback extends core.DefaultSerializeable {
    constructor() {
        super(...arguments);
        this.controller = null;
        this._selection = BarcodeSelectionFeedback.barcodeSelectionDefaults.Feedback.selection;
    }
    get selection() {
        return this._selection;
    }
    set selection(selection) {
        this._selection = selection;
        this.updateFeedback();
    }
    static get barcodeSelectionDefaults() {
        return getBarcodeSelectionDefaults();
    }
    static get default() {
        return new BarcodeSelectionFeedback();
    }
    updateFeedback() {
        var _a;
        (_a = this.controller) === null || _a === void 0 ? void 0 : _a.updateFeedback(JSON.stringify(this.toJSON()));
    }
}
__decorate([
    core.ignoreFromSerialization
], BarcodeSelectionFeedback.prototype, "controller", void 0);
__decorate([
    core.nameForSerialization('selection')
], BarcodeSelectionFeedback.prototype, "_selection", void 0);
__decorate([
    core.ignoreFromSerialization
], BarcodeSelectionFeedback, "barcodeSelectionDefaults", null);

class BarcodeSelectionSession {
    get selectedBarcodes() {
        return this._selectedBarcodes;
    }
    get newlySelectedBarcodes() {
        return this._newlySelectedBarcodes;
    }
    get newlyUnselectedBarcodes() {
        return this._newlyUnselectedBarcodes;
    }
    get frameSequenceID() {
        return this._frameSequenceID;
    }
    static fromJSON(json) {
        var _a;
        const sessionJson = JSON.parse(json.session);
        const session = new BarcodeSelectionSession();
        session._selectedBarcodes = sessionJson.selectedBarcodes
            .map(Barcode.fromJSON);
        session._newlySelectedBarcodes = sessionJson.newlySelectedBarcodes
            .map(Barcode.fromJSON);
        session._newlyUnselectedBarcodes = sessionJson.newlyUnselectedBarcodes
            .map(Barcode.fromJSON);
        session._frameSequenceID = sessionJson.frameSequenceId;
        session.frameId = (_a = json.frameId) !== null && _a !== void 0 ? _a : '';
        return session;
    }
    getCount(barcode) {
        return this.listenerController.getCount(barcode);
    }
    reset() {
        return this.listenerController.reset();
    }
}

var BarcodeSelectionListenerEvents;
(function (BarcodeSelectionListenerEvents) {
    BarcodeSelectionListenerEvents["inCallback"] = "BarcodeSelectionListener.inCallback";
    BarcodeSelectionListenerEvents["didUpdateSelection"] = "BarcodeSelectionListener.didUpdateSelection";
    BarcodeSelectionListenerEvents["didUpdateSession"] = "BarcodeSelectionListener.didUpdateSession";
})(BarcodeSelectionListenerEvents || (BarcodeSelectionListenerEvents = {}));
class BarcodeSelectionListenerController {
    get _proxy() {
        return core.FactoryMaker.getInstance('BarcodeSelectionListenerProxy');
    }
    static forBarcodeSelection(barcodeSelection) {
        const controller = new BarcodeSelectionListenerController();
        controller.barcodeSelection = barcodeSelection;
        controller._proxy.isModeEnabled = () => barcodeSelection.isEnabled;
        return controller;
    }
    constructor() {
        this.eventEmitter = core.FactoryMaker.getInstance('EventEmitter');
    }
    getCount(barcode) {
        return __awaiter(this, void 0, void 0, function* () {
            const result = yield this._proxy.getCount(barcode.selectionIdentifier);
            if (result == null) {
                return 0;
            }
            return Number(result.data);
        });
    }
    reset() {
        return this._proxy.resetSession();
    }
    subscribeListener() {
        var _a, _b, _c, _d;
        this._proxy.registerListenerForEvents();
        (_b = (_a = this._proxy).subscribeDidUpdateSelectionListener) === null || _b === void 0 ? void 0 : _b.call(_a);
        (_d = (_c = this._proxy).subscribeDidUpdateSession) === null || _d === void 0 ? void 0 : _d.call(_c);
        this.eventEmitter.on(BarcodeSelectionListenerEvents.didUpdateSelection, (data) => __awaiter(this, void 0, void 0, function* () {
            const payload = core.EventDataParser.parse(data);
            if (payload === null) {
                console.error('BarcodeSelectionListenerController didUpdateSelection payload is null');
                return;
            }
            const session = BarcodeSelectionSession.fromJSON(payload);
            session.listenerController = this;
            yield this.notifyListenersOfDidUpdateSelection(session);
            this._proxy.finishDidUpdateSelectionCallback(this.barcodeSelection.isEnabled);
        }));
        this.eventEmitter.on(BarcodeSelectionListenerEvents.didUpdateSession, (data) => __awaiter(this, void 0, void 0, function* () {
            const payload = core.EventDataParser.parse(data);
            if (payload === null) {
                console.error('BarcodeSelectionListenerController didUpdateSession payload is null');
                return;
            }
            const session = BarcodeSelectionSession.fromJSON(payload);
            session.listenerController = this;
            yield this.notifyListenersOfDidUpdateSession(session);
            this._proxy.finishDidUpdateSessionCallback(this.barcodeSelection.isEnabled);
        }));
    }
    unsubscribeListener() {
        this._proxy.unregisterListenerForEvents();
        this.eventEmitter.removeAllListeners(BarcodeSelectionListenerEvents.didUpdateSelection);
        this.eventEmitter.removeAllListeners(BarcodeSelectionListenerEvents.didUpdateSession);
    }
    notifyListenersOfDidUpdateSelection(session) {
        return __awaiter(this, void 0, void 0, function* () {
            const mode = this.barcodeSelection;
            mode.isInListenerCallback = true;
            for (const listener of mode.listeners) {
                if (listener.didUpdateSelection) {
                    yield listener.didUpdateSelection(this.barcodeSelection, session, () => core.CameraController.getFrameOrNull(session.frameId));
                }
            }
            mode.isInListenerCallback = false;
        });
    }
    notifyListenersOfDidUpdateSession(session) {
        return __awaiter(this, void 0, void 0, function* () {
            const mode = this.barcodeSelection;
            mode.isInListenerCallback = true;
            for (const listener of mode.listeners) {
                if (listener.didUpdateSession) {
                    yield listener.didUpdateSession(this.barcodeSelection, session, () => core.CameraController.getFrameOrNull(session.frameId));
                }
            }
            mode.isInListenerCallback = false;
        });
    }
}

class BarcodeSelectionController {
    get _proxy() {
        return core.FactoryMaker.getInstance('BarcodeSelectionProxy');
    }
    unfreezeCamera() {
        return this._proxy.unfreezeCamera();
    }
    reset() {
        return this._proxy.resetMode();
    }
    selectAimedBarcode() {
        return this._proxy.selectAimedBarcode();
    }
    unselectBarcodes(barcodes) {
        const barcodesJson = this.convertBarcodesToJson(barcodes);
        return this._proxy.unselectBarcodes(JSON.stringify({ barcodes: barcodesJson }));
    }
    setSelectBarcodeEnabled(barcode, enabled) {
        const barcodesJson = this.convertBarcodesToJson([barcode]);
        return this._proxy.setSelectBarcodeEnabled(JSON.stringify(barcodesJson[0]), enabled);
    }
    increaseCountForBarcodes(barcodes) {
        const barcodesJson = this.convertBarcodesToJson(barcodes);
        return this._proxy.increaseCountForBarcodes(JSON.stringify({ barcodes: barcodesJson }));
    }
    setModeEnabledState(enabled) {
        this._proxy.setModeEnabledState(enabled);
    }
    updateBarcodeSelectionMode(barcodeSelection) {
        return this._proxy.updateBarcodeSelectionMode(JSON.stringify(barcodeSelection.toJSON()));
    }
    applyBarcodeSelectionModeSettings(newSettings) {
        return this._proxy.applyBarcodeSelectionModeSettings(JSON.stringify(newSettings.toJSON()));
    }
    updateFeedback(feedbackJson) {
        this._proxy.updateFeedback(feedbackJson);
    }
    convertBarcodesToJson(barcodes) {
        return barcodes.flat().map((barcode) => ({
            data: barcode.data,
            rawData: barcode.rawData,
            symbology: barcode.symbology,
            symbolCount: barcode.symbolCount
        }));
    }
}

class BarcodeSelection extends core.DefaultSerializeable {
    get isEnabled() {
        return this._isEnabled;
    }
    set isEnabled(isEnabled) {
        this._isEnabled = isEnabled;
        this.modeController.setModeEnabledState(isEnabled);
    }
    get context() {
        return this._context;
    }
    get feedback() {
        return this._feedback;
    }
    set feedback(feedback) {
        this._feedback = feedback;
        this.feedback.controller = this.modeController;
        this.modeController.updateFeedback(JSON.stringify(this.feedback.toJSON()));
    }
    get pointOfInterest() {
        return this._pointOfInterest;
    }
    set pointOfInterest(pointOfInterest) {
        this._pointOfInterest = pointOfInterest;
        this.modeController.updateBarcodeSelectionMode(this);
    }
    static get recommendedCameraSettings() {
        return BarcodeSelection.barcodeSelectionDefaults.RecommendedCameraSettings;
    }
    get _context() {
        return this.privateContext;
    }
    set _context(newContext) {
        if (newContext == null) {
            this.listenerController.unsubscribeListener();
        }
        else if (this.privateContext == null) {
            this.listenerController.subscribeListener();
        }
        this.privateContext = newContext;
    }
    static get barcodeSelectionDefaults() {
        return getBarcodeSelectionDefaults();
    }
    static forContext(context, settings) {
        const barcodeSelection = new BarcodeSelection();
        barcodeSelection.settings = settings;
        if (context) {
            context.addMode(barcodeSelection);
        }
        return barcodeSelection;
    }
    constructor() {
        super();
        this.type = 'barcodeSelection';
        this._isEnabled = true;
        this._feedback = new BarcodeSelectionFeedback();
        this._pointOfInterest = null;
        this.privateContext = null;
        this.listeners = [];
        this.isInListenerCallback = false;
        this.listenerController = BarcodeSelectionListenerController.forBarcodeSelection(this);
        this.modeController = new BarcodeSelectionController();
        this._feedback.controller = this.modeController;
    }
    applySettings(settings) {
        this.settings = settings;
        return this.modeController.applyBarcodeSelectionModeSettings(settings);
    }
    addListener(listener) {
        if (listener == undefined) {
            return;
        }
        if (this.listeners.includes(listener)) {
            return;
        }
        this.listeners.push(listener);
    }
    removeListener(listener) {
        if (!this.listeners.includes(listener)) {
            return;
        }
        this.listeners.splice(this.listeners.indexOf(listener), 1);
    }
    reset() {
        return this.modeController.reset();
    }
    unfreezeCamera() {
        return this.modeController.unfreezeCamera();
    }
    selectAimedBarcode() {
        return this.modeController.selectAimedBarcode();
    }
    unselectBarcodes(barcodes) {
        return this.modeController.unselectBarcodes(barcodes);
    }
    setSelectBarcodeEnabled(barcode, enabled) {
        return this.modeController.setSelectBarcodeEnabled(barcode, enabled);
    }
    increaseCountForBarcodes(barcodes) {
        return this.modeController.increaseCountForBarcodes(barcodes);
    }
}
__decorate([
    core.ignoreFromSerialization
], BarcodeSelection.prototype, "_isEnabled", void 0);
__decorate([
    core.nameForSerialization('feedback')
], BarcodeSelection.prototype, "_feedback", void 0);
__decorate([
    core.nameForSerialization('pointOfInterest')
], BarcodeSelection.prototype, "_pointOfInterest", void 0);
__decorate([
    core.ignoreFromSerialization
], BarcodeSelection.prototype, "privateContext", void 0);
__decorate([
    core.ignoreFromSerialization
], BarcodeSelection.prototype, "listeners", void 0);
__decorate([
    core.ignoreFromSerialization
], BarcodeSelection.prototype, "listenerController", void 0);
__decorate([
    core.ignoreFromSerialization
], BarcodeSelection.prototype, "modeController", void 0);
__decorate([
    core.ignoreFromSerialization
], BarcodeSelection.prototype, "isInListenerCallback", void 0);
__decorate([
    core.ignoreFromSerialization
], BarcodeSelection, "barcodeSelectionDefaults", null);

var BarcodeSelectionBasicOverlayStyle;
(function (BarcodeSelectionBasicOverlayStyle) {
    BarcodeSelectionBasicOverlayStyle["Frame"] = "frame";
    BarcodeSelectionBasicOverlayStyle["Dot"] = "dot";
})(BarcodeSelectionBasicOverlayStyle || (BarcodeSelectionBasicOverlayStyle = {}));

var BarcodeSelectionFreezeBehavior;
(function (BarcodeSelectionFreezeBehavior) {
    BarcodeSelectionFreezeBehavior["Manual"] = "manual";
    BarcodeSelectionFreezeBehavior["ManualAndAutomatic"] = "manualAndAutomatic";
})(BarcodeSelectionFreezeBehavior || (BarcodeSelectionFreezeBehavior = {}));

var BarcodeSelectionStrategyType;
(function (BarcodeSelectionStrategyType) {
    BarcodeSelectionStrategyType["Auto"] = "autoSelectionStrategy";
    BarcodeSelectionStrategyType["Manual"] = "manualSelectionStrategy";
})(BarcodeSelectionStrategyType || (BarcodeSelectionStrategyType = {}));

var BarcodeSelectionTapBehavior;
(function (BarcodeSelectionTapBehavior) {
    BarcodeSelectionTapBehavior["ToggleSelection"] = "toggleSelection";
    BarcodeSelectionTapBehavior["RepeatSelection"] = "repeatSelection";
})(BarcodeSelectionTapBehavior || (BarcodeSelectionTapBehavior = {}));

var BarcodeSelectionTypeName;
(function (BarcodeSelectionTypeName) {
    BarcodeSelectionTypeName["Aimer"] = "aimerSelection";
    BarcodeSelectionTypeName["Tap"] = "tapSelection";
})(BarcodeSelectionTypeName || (BarcodeSelectionTypeName = {}));

var BarcodeSelectionBrushProviderEvents;
(function (BarcodeSelectionBrushProviderEvents) {
    BarcodeSelectionBrushProviderEvents["inCallback"] = "BarcodeSelectionAimedBrushProvider.inCallback";
    BarcodeSelectionBrushProviderEvents["brushForAimedBarcode"] = "BarcodeSelectionAimedBrushProvider.brushForBarcode";
    BarcodeSelectionBrushProviderEvents["brushForTrackedBarcode"] = "BarcodeSelectionTrackedBrushProvider.brushForBarcode";
})(BarcodeSelectionBrushProviderEvents || (BarcodeSelectionBrushProviderEvents = {}));
class BarcodeSelectionOverlayController {
    get _proxy() {
        return core.FactoryMaker.getInstance('BarcodeSelectionOverlayProxy');
    }
    constructor() {
        this.eventEmitter = core.FactoryMaker.getInstance('EventEmitter');
    }
    setTextForAimToSelectAutoHint(text) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this._proxy.setTextForAimToSelectAutoHint(text);
        });
    }
    setAimedBarcodeBrushProvider(brushProvider) {
        if (!brushProvider) {
            this.eventEmitter.removeAllListeners(BarcodeSelectionBrushProviderEvents.brushForAimedBarcode);
            return this._proxy.removeAimedBarcodeBrushProvider();
        }
        const subscriptionResult = this._proxy.setAimedBarcodeBrushProvider();
        this._proxy.subscribeBrushForAimedBarcode();
        this.eventEmitter.on(BarcodeSelectionBrushProviderEvents.brushForAimedBarcode, (data) => {
            const payload = core.EventDataParser.parse(data);
            if (payload === null) {
                console.error('BarcodeSelectionOverlayController brushForAimedBarcode payload is null');
                return;
            }
            const barcode = Barcode
                .fromJSON(JSON.parse(payload.barcode));
            let brush = null;
            if (brushProvider.brushForBarcode) {
                brush = brushProvider.brushForBarcode(barcode);
            }
            this._proxy.finishBrushForAimedBarcodeCallback(brush ? JSON.stringify(brush.toJSON()) : null, barcode.selectionIdentifier);
        });
        return subscriptionResult;
    }
    setTrackedBarcodeBrushProvider(brushProvider) {
        if (!brushProvider) {
            this.eventEmitter.removeAllListeners(BarcodeSelectionBrushProviderEvents.brushForTrackedBarcode);
            return this._proxy.removeTrackedBarcodeBrushProvider();
        }
        const subscriptionResult = this._proxy.setTrackedBarcodeBrushProvider();
        this._proxy.subscribeBrushForTrackedBarcode();
        this.eventEmitter.on(BarcodeSelectionBrushProviderEvents.brushForTrackedBarcode, (data) => {
            const payload = core.EventDataParser.parse(data);
            if (payload === null) {
                console.error('BarcodeSelectionBrushProvider brushForTrackedBarcode payload is null');
                return;
            }
            const barcode = Barcode
                .fromJSON(JSON.parse(payload.barcode));
            let brush = null;
            if (brushProvider.brushForBarcode) {
                brush = brushProvider.brushForBarcode(barcode);
            }
            this._proxy.finishBrushForTrackedBarcodeCallback(brush ? JSON.stringify(brush.toJSON()) : null, barcode.selectionIdentifier);
        });
        return subscriptionResult;
    }
    updateBarcodeSelectionBasicOverlay(overlay) {
        return this._proxy.updateBarcodeSelectionBasicOverlay(JSON.stringify(overlay.toJSON()));
    }
    // TODO: We need to unsubscribe from the providers when the overlay is removed. Need spec.
    // https://scandit.atlassian.net/browse/SDC-16608
    unsubscribeProviders() {
        this.eventEmitter.removeAllListeners(BarcodeSelectionBrushProviderEvents.brushForAimedBarcode);
        this.eventEmitter.removeAllListeners(BarcodeSelectionBrushProviderEvents.brushForTrackedBarcode);
        this._proxy.removeAimedBarcodeBrushProvider();
        this._proxy.removeTrackedBarcodeBrushProvider();
    }
}

class BarcodeSelectionBasicOverlay extends core.DefaultSerializeable {
    get trackedBrush() {
        return this._trackedBrush;
    }
    set trackedBrush(newBrush) {
        this._trackedBrush = newBrush;
        this.overlayController.updateBarcodeSelectionBasicOverlay(this);
    }
    get aimedBrush() {
        return this._aimedBrush;
    }
    set aimedBrush(newBrush) {
        this._aimedBrush = newBrush;
        this.overlayController.updateBarcodeSelectionBasicOverlay(this);
    }
    get selectedBrush() {
        return this._selectedBrush;
    }
    set selectedBrush(newBrush) {
        this._selectedBrush = newBrush;
        this.overlayController.updateBarcodeSelectionBasicOverlay(this);
    }
    get selectingBrush() {
        return this._selectingBrush;
    }
    set selectingBrush(newBrush) {
        this._selectingBrush = newBrush;
        this.overlayController.updateBarcodeSelectionBasicOverlay(this);
    }
    get shouldShowScanAreaGuides() {
        return this._shouldShowScanAreaGuides;
    }
    set shouldShowScanAreaGuides(shouldShow) {
        this._shouldShowScanAreaGuides = shouldShow;
        this.overlayController.updateBarcodeSelectionBasicOverlay(this);
    }
    get shouldShowHints() {
        return this._shouldShowHints;
    }
    set shouldShowHints(shouldShow) {
        this._shouldShowHints = shouldShow;
        this.overlayController.updateBarcodeSelectionBasicOverlay(this);
    }
    get viewfinder() {
        return this._viewfinder;
    }
    get style() {
        return this._style;
    }
    static withBarcodeSelection(barcodeSelection) {
        return BarcodeSelectionBasicOverlay.withBarcodeSelectionForView(barcodeSelection, null);
    }
    static withBarcodeSelectionForView(barcodeSelection, view) {
        return this.withBarcodeSelectionForViewWithStyle(barcodeSelection, view, BarcodeSelectionBasicOverlay.barcodeSelectionDefaults.BarcodeSelectionBasicOverlay.defaultStyle);
    }
    static withBarcodeSelectionForViewWithStyle(barcodeSelection, view, style) {
        const overlay = new BarcodeSelectionBasicOverlay();
        overlay.barcodeSelection = barcodeSelection;
        overlay._style = style;
        overlay._trackedBrush = new core.Brush(BarcodeSelectionBasicOverlay.barcodeSelectionDefaults.BarcodeSelectionBasicOverlay.styles[style].DefaultTrackedBrush.fillColor, BarcodeSelectionBasicOverlay.barcodeSelectionDefaults.BarcodeSelectionBasicOverlay.styles[style].DefaultTrackedBrush.strokeColor, BarcodeSelectionBasicOverlay.barcodeSelectionDefaults.BarcodeSelectionBasicOverlay.styles[style].DefaultTrackedBrush.strokeWidth);
        overlay._aimedBrush = new core.Brush(BarcodeSelectionBasicOverlay.barcodeSelectionDefaults.BarcodeSelectionBasicOverlay.styles[style].DefaultAimedBrush.fillColor, BarcodeSelectionBasicOverlay.barcodeSelectionDefaults.BarcodeSelectionBasicOverlay.styles[style].DefaultAimedBrush.strokeColor, BarcodeSelectionBasicOverlay.barcodeSelectionDefaults.BarcodeSelectionBasicOverlay.styles[style].DefaultAimedBrush.strokeWidth);
        overlay._selectedBrush = new core.Brush(BarcodeSelectionBasicOverlay.barcodeSelectionDefaults.BarcodeSelectionBasicOverlay.styles[style].DefaultSelectedBrush.fillColor, BarcodeSelectionBasicOverlay.barcodeSelectionDefaults.BarcodeSelectionBasicOverlay.styles[style].DefaultSelectedBrush.strokeColor, BarcodeSelectionBasicOverlay.barcodeSelectionDefaults.BarcodeSelectionBasicOverlay.styles[style].DefaultSelectedBrush.strokeWidth);
        overlay._selectingBrush = new core.Brush(BarcodeSelectionBasicOverlay.barcodeSelectionDefaults.BarcodeSelectionBasicOverlay.styles[style].DefaultSelectingBrush.fillColor, BarcodeSelectionBasicOverlay.barcodeSelectionDefaults.BarcodeSelectionBasicOverlay.styles[style].DefaultSelectingBrush.strokeColor, BarcodeSelectionBasicOverlay.barcodeSelectionDefaults.BarcodeSelectionBasicOverlay.styles[style].DefaultSelectingBrush.strokeWidth);
        if (view) {
            view.addOverlay(overlay);
        }
        return overlay;
    }
    static get barcodeSelectionDefaults() {
        return getBarcodeSelectionDefaults();
    }
    constructor() {
        super();
        this.type = 'barcodeSelectionBasic';
        this.overlayController = new BarcodeSelectionOverlayController();
        this._shouldShowScanAreaGuides = false;
        this._shouldShowHints = true;
        this._viewfinder = new core.AimerViewfinder();
        this._trackedBrush = new core.Brush(BarcodeSelectionBasicOverlay.barcodeSelectionDefaults.BarcodeSelectionBasicOverlay.styles[BarcodeSelectionBasicOverlay.barcodeSelectionDefaults.BarcodeSelectionBasicOverlay.defaultStyle].DefaultTrackedBrush.fillColor, BarcodeSelectionBasicOverlay.barcodeSelectionDefaults.BarcodeSelectionBasicOverlay.styles[BarcodeSelectionBasicOverlay.barcodeSelectionDefaults.BarcodeSelectionBasicOverlay.defaultStyle].DefaultTrackedBrush.strokeColor, BarcodeSelectionBasicOverlay.barcodeSelectionDefaults.BarcodeSelectionBasicOverlay.styles[BarcodeSelectionBasicOverlay.barcodeSelectionDefaults.BarcodeSelectionBasicOverlay.defaultStyle].DefaultTrackedBrush.strokeWidth);
        this._aimedBrush = new core.Brush(BarcodeSelectionBasicOverlay.barcodeSelectionDefaults.BarcodeSelectionBasicOverlay.styles[BarcodeSelectionBasicOverlay.barcodeSelectionDefaults.BarcodeSelectionBasicOverlay.defaultStyle].DefaultAimedBrush.fillColor, BarcodeSelectionBasicOverlay.barcodeSelectionDefaults.BarcodeSelectionBasicOverlay.styles[BarcodeSelectionBasicOverlay.barcodeSelectionDefaults.BarcodeSelectionBasicOverlay.defaultStyle].DefaultAimedBrush.strokeColor, BarcodeSelectionBasicOverlay.barcodeSelectionDefaults.BarcodeSelectionBasicOverlay.styles[BarcodeSelectionBasicOverlay.barcodeSelectionDefaults.BarcodeSelectionBasicOverlay.defaultStyle].DefaultAimedBrush.strokeWidth);
        this._selectedBrush = new core.Brush(BarcodeSelectionBasicOverlay.barcodeSelectionDefaults.BarcodeSelectionBasicOverlay.styles[BarcodeSelectionBasicOverlay.barcodeSelectionDefaults.BarcodeSelectionBasicOverlay.defaultStyle].DefaultSelectedBrush.fillColor, BarcodeSelectionBasicOverlay.barcodeSelectionDefaults.BarcodeSelectionBasicOverlay.styles[BarcodeSelectionBasicOverlay.barcodeSelectionDefaults.BarcodeSelectionBasicOverlay.defaultStyle].DefaultSelectedBrush.strokeColor, BarcodeSelectionBasicOverlay.barcodeSelectionDefaults.BarcodeSelectionBasicOverlay.styles[BarcodeSelectionBasicOverlay.barcodeSelectionDefaults.BarcodeSelectionBasicOverlay.defaultStyle].DefaultSelectedBrush.strokeWidth);
        this._selectingBrush = new core.Brush(BarcodeSelectionBasicOverlay.barcodeSelectionDefaults.BarcodeSelectionBasicOverlay.styles[BarcodeSelectionBasicOverlay.barcodeSelectionDefaults.BarcodeSelectionBasicOverlay.defaultStyle].DefaultSelectingBrush.fillColor, BarcodeSelectionBasicOverlay.barcodeSelectionDefaults.BarcodeSelectionBasicOverlay.styles[BarcodeSelectionBasicOverlay.barcodeSelectionDefaults.BarcodeSelectionBasicOverlay.defaultStyle].DefaultSelectingBrush.strokeColor, BarcodeSelectionBasicOverlay.barcodeSelectionDefaults.BarcodeSelectionBasicOverlay.styles[BarcodeSelectionBasicOverlay.barcodeSelectionDefaults.BarcodeSelectionBasicOverlay.defaultStyle].DefaultSelectingBrush.strokeWidth);
    }
    setTextForAimToSelectAutoHint(text) {
        return this.overlayController.setTextForAimToSelectAutoHint(text);
    }
    setAimedBarcodeBrushProvider(brushProvider) {
        return this.overlayController.setAimedBarcodeBrushProvider(brushProvider);
    }
    setTrackedBarcodeBrushProvider(brushProvider) {
        return this.overlayController.setTrackedBarcodeBrushProvider(brushProvider);
    }
}
__decorate([
    core.ignoreFromSerialization
], BarcodeSelectionBasicOverlay.prototype, "barcodeSelection", void 0);
__decorate([
    core.ignoreFromSerialization
], BarcodeSelectionBasicOverlay.prototype, "overlayController", void 0);
__decorate([
    core.ignoreFromSerialization
], BarcodeSelectionBasicOverlay.prototype, "view", void 0);
__decorate([
    core.nameForSerialization('shouldShowScanAreaGuides')
], BarcodeSelectionBasicOverlay.prototype, "_shouldShowScanAreaGuides", void 0);
__decorate([
    core.nameForSerialization('shouldShowHints')
], BarcodeSelectionBasicOverlay.prototype, "_shouldShowHints", void 0);
__decorate([
    core.nameForSerialization('viewfinder')
], BarcodeSelectionBasicOverlay.prototype, "_viewfinder", void 0);
__decorate([
    core.nameForSerialization('style')
], BarcodeSelectionBasicOverlay.prototype, "_style", void 0);
__decorate([
    core.nameForSerialization('trackedBrush')
], BarcodeSelectionBasicOverlay.prototype, "_trackedBrush", void 0);
__decorate([
    core.nameForSerialization('aimedBrush')
], BarcodeSelectionBasicOverlay.prototype, "_aimedBrush", void 0);
__decorate([
    core.nameForSerialization('selectedBrush')
], BarcodeSelectionBasicOverlay.prototype, "_selectedBrush", void 0);
__decorate([
    core.nameForSerialization('selectingBrush')
], BarcodeSelectionBasicOverlay.prototype, "_selectingBrush", void 0);
__decorate([
    core.ignoreFromSerialization
], BarcodeSelectionBasicOverlay, "barcodeSelectionDefaults", null);

class BarcodeSelectionAutoSelectionStrategy extends core.DefaultSerializeable {
    constructor() {
        super(...arguments);
        this.type = BarcodeSelectionStrategyType.Auto;
    }
    static get autoSelectionStrategy() {
        return new BarcodeSelectionAutoSelectionStrategy();
    }
}
class BarcodeSelectionManualSelectionStrategy extends core.DefaultSerializeable {
    constructor() {
        super(...arguments);
        this.type = BarcodeSelectionStrategyType.Manual;
    }
    static get manualSelectionStrategy() {
        return new BarcodeSelectionManualSelectionStrategy();
    }
}
class PrivateBarcodeSelectionStrategy {
    static fromJSON(json) {
        switch (json.type) {
            case BarcodeSelectionStrategyType.Auto:
                return BarcodeSelectionAutoSelectionStrategy.autoSelectionStrategy;
            case BarcodeSelectionStrategyType.Manual:
                return BarcodeSelectionManualSelectionStrategy.manualSelectionStrategy;
            default:
                throw new Error('Unknown selection strategy type: ' + json.type);
        }
    }
}

class BarcodeSelectionTapSelection extends core.DefaultSerializeable {
    constructor() {
        super(...arguments);
        this.type = BarcodeSelectionTypeName.Tap;
        this.freezeBehavior = BarcodeSelectionTapSelection.barcodeSelectionDefaults.BarcodeSelectionTapSelection.defaultFreezeBehavior;
        this.tapBehavior = BarcodeSelectionTapSelection.barcodeSelectionDefaults.BarcodeSelectionTapSelection.defaultTapBehavior;
    }
    static get tapSelection() {
        return new BarcodeSelectionTapSelection();
    }
    static get barcodeSelectionDefaults() {
        return getBarcodeSelectionDefaults();
    }
    static withFreezeBehaviorAndTapBehavior(freezeBehavior, tapBehavior) {
        const selection = this.tapSelection;
        selection.freezeBehavior = freezeBehavior;
        selection.tapBehavior = tapBehavior;
        return selection;
    }
}
__decorate([
    core.ignoreFromSerialization
], BarcodeSelectionTapSelection, "barcodeSelectionDefaults", null);
class BarcodeSelectionAimerSelection extends core.DefaultSerializeable {
    static get aimerSelection() {
        return new BarcodeSelectionAimerSelection();
    }
    static get barcodeSelectionDefaults() {
        return getBarcodeSelectionDefaults();
    }
    constructor() {
        super();
        this.type = BarcodeSelectionTypeName.Aimer;
        this.selectionStrategy = BarcodeSelectionAimerSelection.barcodeSelectionDefaults.BarcodeSelectionAimerSelection
            .defaultSelectionStrategy(PrivateBarcodeSelectionStrategy.fromJSON);
    }
}
__decorate([
    core.ignoreFromSerialization
], BarcodeSelectionAimerSelection, "barcodeSelectionDefaults", null);
class PrivateBarcodeSelectionType {
    static fromJSON(json) {
        switch (json.type) {
            case BarcodeSelectionTypeName.Aimer:
                return PrivateBarcodeSelectionAimerSelection.fromJSON(json);
            case BarcodeSelectionTypeName.Tap:
                return PrivateBarcodeSelectionTapSelection.fromJSON(json);
            default:
                throw new Error('Unknown selection strategy type: ' + json.type);
        }
    }
}
class PrivateBarcodeSelectionAimerSelection {
    static fromJSON(json) {
        const selection = BarcodeSelectionAimerSelection.aimerSelection;
        selection.selectionStrategy = PrivateBarcodeSelectionStrategy.fromJSON(json.selectionStrategy);
        return selection;
    }
}
class PrivateBarcodeSelectionTapSelection {
    static fromJSON(json) {
        const selection = BarcodeSelectionTapSelection.tapSelection;
        selection.freezeBehavior = json.freezeBehavior;
        selection.tapBehavior = json.tapBehavior;
        return selection;
    }
}

class BarcodeSelectionSettings extends core.DefaultSerializeable {
    static get barcodeSelectionDefaults() {
        return getBarcodeSelectionDefaults();
    }
    static get barcodeDefaults() {
        return getBarcodeDefaults();
    }
    get enabledSymbologies() {
        return Object.keys(this.symbologies)
            .filter(symbology => this.symbologies[symbology].isEnabled);
    }
    constructor() {
        super();
        this.codeDuplicateFilter = BarcodeSelectionSettings.barcodeSelectionDefaults.BarcodeSelectionSettings.codeDuplicateFilter;
        this.singleBarcodeAutoDetection = BarcodeSelectionSettings.barcodeSelectionDefaults.BarcodeSelectionSettings.singleBarcodeAutoDetection;
        this.selectionType = BarcodeSelectionSettings.barcodeSelectionDefaults.BarcodeSelectionSettings.selectionType(PrivateBarcodeSelectionType.fromJSON);
        this.properties = {};
        this.symbologies = {};
    }
    settingsForSymbology(symbology) {
        if (!this.symbologies[symbology]) {
            const symbologySettings = BarcodeSelectionSettings.barcodeDefaults.SymbologySettings[symbology];
            symbologySettings._symbology = symbology;
            this.symbologies[symbology] = symbologySettings;
        }
        return this.symbologies[symbology];
    }
    setProperty(name, value) {
        this.properties[name] = value;
    }
    getProperty(name) {
        return this.properties[name];
    }
    enableSymbologies(symbologies) {
        symbologies.forEach(symbology => this.enableSymbology(symbology, true));
    }
    enableSymbology(symbology, enabled) {
        this.settingsForSymbology(symbology).isEnabled = enabled;
    }
}
__decorate([
    core.nameForSerialization('singleBarcodeAutoDetectionEnabled')
], BarcodeSelectionSettings.prototype, "singleBarcodeAutoDetection", void 0);
__decorate([
    core.ignoreFromSerialization
], BarcodeSelectionSettings, "barcodeSelectionDefaults", null);
__decorate([
    core.ignoreFromSerialization
], BarcodeSelectionSettings, "barcodeDefaults", null);

var BarcodeBatchBasicOverlayStyle;
(function (BarcodeBatchBasicOverlayStyle) {
    BarcodeBatchBasicOverlayStyle["Frame"] = "frame";
    BarcodeBatchBasicOverlayStyle["Dot"] = "dot";
})(BarcodeBatchBasicOverlayStyle || (BarcodeBatchBasicOverlayStyle = {}));

/**
 * @deprecated Setting a scenario is no longer recommended, use the BarcodeBatchSettings empty constructor instead.
 */
var BarcodeBatchScenario;
(function (BarcodeBatchScenario) {
    BarcodeBatchScenario["A"] = "A";
    BarcodeBatchScenario["B"] = "B";
})(BarcodeBatchScenario || (BarcodeBatchScenario = {}));

class BarcodeBatchSession {
    get addedTrackedBarcodes() {
        return this._addedTrackedBarcodes;
    }
    get removedTrackedBarcodes() {
        return this._removedTrackedBarcodes;
    }
    get updatedTrackedBarcodes() {
        return this._updatedTrackedBarcodes;
    }
    get trackedBarcodes() {
        return this._trackedBarcodes;
    }
    get frameSequenceID() {
        return this._frameSequenceID;
    }
    static fromJSON(json) {
        var _a;
        const sessionJson = JSON.parse(json.session);
        const session = new BarcodeBatchSession();
        session._frameSequenceID = sessionJson.frameSequenceId;
        session._addedTrackedBarcodes = sessionJson.addedTrackedBarcodes
            .map((trackedBarcodeJSON) => {
            return TrackedBarcode
                .fromJSON(trackedBarcodeJSON, sessionJson.frameSequenceId);
        });
        session._removedTrackedBarcodes = sessionJson.removedTrackedBarcodes;
        session._updatedTrackedBarcodes = sessionJson.updatedTrackedBarcodes
            .map((trackedBarcodeJSON) => {
            return TrackedBarcode
                .fromJSON(trackedBarcodeJSON, sessionJson.frameSequenceId);
        });
        session._trackedBarcodes = Object.keys(sessionJson.trackedBarcodes)
            .reduce((trackedBarcodes, identifier) => {
            trackedBarcodes[identifier] = TrackedBarcode
                .fromJSON(sessionJson.trackedBarcodes[identifier], sessionJson.frameSequenceId);
            return trackedBarcodes;
        }, {});
        session.frameId = (_a = json.frameId) !== null && _a !== void 0 ? _a : '';
        return session;
    }
    reset() {
        return this.listenerController.resetSession();
    }
}

var BarcodeBatchListenerEvents;
(function (BarcodeBatchListenerEvents) {
    BarcodeBatchListenerEvents["inCallback"] = "BarcodeBatchListener.inCallback";
    BarcodeBatchListenerEvents["didUpdateSession"] = "BarcodeBatchListener.didUpdateSession";
})(BarcodeBatchListenerEvents || (BarcodeBatchListenerEvents = {}));
class BarcodeBatchListenerController {
    get _proxy() {
        return core.FactoryMaker.getInstance("BarcodeBatchListenerProxy");
    }
    static forBarcodeBatch(barcodeBatch) {
        const controller = new BarcodeBatchListenerController();
        controller.barcodeBatch = barcodeBatch;
        controller._proxy.isModeEnabled = () => barcodeBatch.isEnabled;
        return controller;
    }
    constructor() {
        this.eventEmitter = core.FactoryMaker.getInstance('EventEmitter');
    }
    resetSession() {
        return this._proxy.resetSession();
    }
    subscribeListener() {
        var _a, _b;
        this._proxy.registerListenerForEvents();
        (_b = (_a = this._proxy).subscribeDidUpdateSession) === null || _b === void 0 ? void 0 : _b.call(_a);
        this.eventEmitter.on(BarcodeBatchListenerEvents.inCallback, (value) => {
            this.barcodeBatch.isInListenerCallback = value;
        });
        this.eventEmitter.on(BarcodeBatchListenerEvents.didUpdateSession, (data) => __awaiter(this, void 0, void 0, function* () {
            var _a;
            const payload = core.EventDataParser.parse(data);
            if (payload === null) {
                console.error('BarcodeBatchListenerController didUpdateSession payload is null');
                return;
            }
            const session = BarcodeBatchSession.fromJSON(payload);
            // Read the feature flag from the payload and set it in the DataCaptureContextFeatures.
            core.DataCaptureContextFeatures.setIsFeatureSupported("barcode-ar-full", (_a = payload.isBarcodeArFull) !== null && _a !== void 0 ? _a : false);
            yield this.notifyListenersOfDidUpdateSession(session);
            this._proxy.finishDidUpdateSessionCallback(this.barcodeBatch.isEnabled);
        }));
    }
    unsubscribeListener() {
        this._proxy.unregisterListenerForEvents();
        this.eventEmitter.removeAllListeners(BarcodeBatchListenerEvents.inCallback);
        this.eventEmitter.removeAllListeners(BarcodeBatchListenerEvents.didUpdateSession);
    }
    setModeEnabledState(enabled) {
        this._proxy.setModeEnabledState(enabled);
    }
    updateBarcodeBatchMode() {
        return this._proxy.updateBarcodeBatchMode(JSON.stringify(this.barcodeBatch.toJSON()));
    }
    applyBarcodeBatchModeSettings(newSettings) {
        return this._proxy.applyBarcodeBatchModeSettings(JSON.stringify(newSettings.toJSON()));
    }
    notifyListenersOfDidUpdateSession(session) {
        return __awaiter(this, void 0, void 0, function* () {
            const mode = this.barcodeBatch;
            mode.isInListenerCallback = true;
            for (const listener of mode.listeners) {
                if (listener.didUpdateSession) {
                    yield listener.didUpdateSession(this.barcodeBatch, session, () => core.CameraController.getFrame(session.frameId));
                }
            }
            mode.isInListenerCallback = false;
        });
    }
}

class BarcodeBatch extends core.DefaultSerializeable {
    get isEnabled() {
        return this._isEnabled;
    }
    set isEnabled(isEnabled) {
        this._isEnabled = isEnabled;
        this.listenerController.setModeEnabledState(isEnabled);
    }
    get context() {
        return this._context;
    }
    static get recommendedCameraSettings() {
        return BarcodeBatch.barcodeBatchDefaults.RecommendedCameraSettings;
    }
    get _context() {
        return this.privateContext;
    }
    set _context(newContext) {
        if (newContext == null) {
            this.listenerController.unsubscribeListener();
        }
        else if (this.privateContext == null) {
            this.listenerController.subscribeListener();
        }
        this.privateContext = newContext;
    }
    static get barcodeBatchDefaults() {
        return getBarcodeBatchDefaults();
    }
    static forContext(context, settings) {
        const barcodeBatch = new BarcodeBatch();
        barcodeBatch.settings = settings;
        if (context) {
            context.addMode(barcodeBatch);
        }
        return barcodeBatch;
    }
    constructor() {
        super();
        this.type = 'barcodeTracking';
        this._isEnabled = true;
        this.privateContext = null;
        this.listeners = [];
        this.isInListenerCallback = false;
        this.listenerController = BarcodeBatchListenerController.forBarcodeBatch(this);
    }
    applySettings(settings) {
        this.settings = settings;
        return this.listenerController.applyBarcodeBatchModeSettings(settings);
    }
    addListener(listener) {
        if (this.listeners.includes(listener)) {
            return;
        }
        this.listeners.push(listener);
    }
    removeListener(listener) {
        if (!this.listeners.includes(listener)) {
            return;
        }
        this.listeners.splice(this.listeners.indexOf(listener), 1);
    }
    reset() {
        var _a, _b;
        return (_b = (_a = this.listenerController) === null || _a === void 0 ? void 0 : _a.resetSession()) !== null && _b !== void 0 ? _b : Promise.resolve();
    }
}
__decorate([
    core.ignoreFromSerialization
], BarcodeBatch.prototype, "_isEnabled", void 0);
__decorate([
    core.ignoreFromSerialization
], BarcodeBatch.prototype, "privateContext", void 0);
__decorate([
    core.ignoreFromSerialization
], BarcodeBatch.prototype, "listeners", void 0);
__decorate([
    core.ignoreFromSerialization
], BarcodeBatch.prototype, "listenerController", void 0);
__decorate([
    core.ignoreFromSerialization
], BarcodeBatch.prototype, "isInListenerCallback", void 0);
__decorate([
    core.ignoreFromSerialization
], BarcodeBatch, "barcodeBatchDefaults", null);

var BarcodeBatchAdvancedOverlayListenerEvents;
(function (BarcodeBatchAdvancedOverlayListenerEvents) {
    BarcodeBatchAdvancedOverlayListenerEvents["didTapViewForTrackedBarcode"] = "BarcodeBatchAdvancedOverlayListener.didTapViewForTrackedBarcode";
    BarcodeBatchAdvancedOverlayListenerEvents["viewForTrackedBarcode"] = "BarcodeBatchAdvancedOverlayListener.viewForTrackedBarcode";
    BarcodeBatchAdvancedOverlayListenerEvents["anchorForTrackedBarcode"] = "BarcodeBatchAdvancedOverlayListener.anchorForTrackedBarcode";
    BarcodeBatchAdvancedOverlayListenerEvents["offsetForTrackedBarcode"] = "BarcodeBatchAdvancedOverlayListener.offsetForTrackedBarcode";
})(BarcodeBatchAdvancedOverlayListenerEvents || (BarcodeBatchAdvancedOverlayListenerEvents = {}));
class BarcodeBatchAdvancedOverlayController {
    get _proxy() {
        return core.FactoryMaker.getInstance("BarcodeBatchAdvancedOverlayProxy");
    }
    static forOverlay(overlay) {
        const controller = new BarcodeBatchAdvancedOverlayController();
        controller.overlay = overlay;
        return controller;
    }
    constructor() {
        this.eventEmitter = core.FactoryMaker.getInstance('EventEmitter');
    }
    setBrushForTrackedBarcode(brush, trackedBarcode) {
        return this._proxy.setBrushForTrackedBarcode(JSON.stringify(brush.toJSON()), trackedBarcode.sessionFrameSequenceID, trackedBarcode.identifier);
    }
    setViewForTrackedBarcode(view, trackedBarcode) {
        return __awaiter(this, void 0, void 0, function* () {
            const awitedView = yield view;
            const viewJson = this._proxy.getJSONStringForView(awitedView);
            return this._proxy.setViewForTrackedBarcode(viewJson, trackedBarcode.identifier, trackedBarcode.sessionFrameSequenceID);
        });
    }
    setAnchorForTrackedBarcode(anchor, trackedBarcode) {
        return this._proxy.setAnchorForTrackedBarcode(anchor, trackedBarcode.identifier, trackedBarcode.sessionFrameSequenceID);
    }
    setOffsetForTrackedBarcode(offset, trackedBarcode) {
        return this._proxy.setOffsetForTrackedBarcode(JSON.stringify(offset.toJSON()), trackedBarcode.identifier, trackedBarcode.sessionFrameSequenceID);
    }
    clearTrackedBarcodeViews() {
        return this._proxy.clearTrackedBarcodeViews();
    }
    updateBarcodeBatchAdvancedOverlay() {
        return this._proxy.updateBarcodeBatchAdvancedOverlay(JSON.stringify(this.overlay.toJSON()));
    }
    subscribeListener() {
        var _a, _b, _c, _d, _e, _f, _g, _h;
        this._proxy.registerListenerForAdvancedOverlayEvents();
        (_b = (_a = this._proxy).subscribeViewForTrackedBarcode) === null || _b === void 0 ? void 0 : _b.call(_a);
        (_d = (_c = this._proxy).subscribeAnchorForTrackedBarcode) === null || _d === void 0 ? void 0 : _d.call(_c);
        (_f = (_e = this._proxy).subscribeOffsetForTrackedBarcode) === null || _f === void 0 ? void 0 : _f.call(_e);
        (_h = (_g = this._proxy).subscribeDidTapViewForTrackedBarcode) === null || _h === void 0 ? void 0 : _h.call(_g);
        this.eventEmitter.on(BarcodeBatchAdvancedOverlayListenerEvents.viewForTrackedBarcode, (data) => __awaiter(this, void 0, void 0, function* () {
            const payload = core.EventDataParser.parse(data);
            if (payload === null) {
                console.error('BarcodeBatchAdvancedOverlayController viewForTrackedBarcode payload is null');
                return;
            }
            const trackedBarcode = TrackedBarcode
                .fromJSON(JSON.parse(payload.trackedBarcode));
            if (this.overlay.listener && this.overlay.listener.viewForTrackedBarcode) {
                const view = yield this.overlay.listener.viewForTrackedBarcode(this.overlay, trackedBarcode);
                this._proxy.setViewForTrackedBarcode(this._proxy.getJSONStringForView(view), trackedBarcode.identifier, trackedBarcode.sessionFrameSequenceID);
            }
        }));
        this.eventEmitter.on(BarcodeBatchAdvancedOverlayListenerEvents.anchorForTrackedBarcode, (data) => {
            const payload = core.EventDataParser.parse(data);
            if (payload === null) {
                console.error('BarcodeBatchAdvancedOverlayController anchorForTrackedBarcode payload is null');
                return;
            }
            const trackedBarcode = TrackedBarcode
                .fromJSON(JSON.parse(payload.trackedBarcode));
            let anchor = core.Anchor.Center;
            if (this.overlay.listener && this.overlay.listener.anchorForTrackedBarcode) {
                anchor = this.overlay.listener.anchorForTrackedBarcode(this.overlay, trackedBarcode);
            }
            this.setAnchorForTrackedBarcode(anchor, trackedBarcode);
        });
        this.eventEmitter.on(BarcodeBatchAdvancedOverlayListenerEvents.offsetForTrackedBarcode, (data) => {
            const payload = core.EventDataParser.parse(data);
            if (payload === null) {
                console.error('BarcodeBatchAdvancedOverlayController offsetForTrackedBarcode payload is null');
                return;
            }
            const trackedBarcode = TrackedBarcode
                .fromJSON(JSON.parse(payload.trackedBarcode));
            let offset = core.PointWithUnit.zero;
            if (this.overlay.listener && this.overlay.listener.offsetForTrackedBarcode) {
                offset = this.overlay.listener.offsetForTrackedBarcode(this.overlay, trackedBarcode);
            }
            this.setOffsetForTrackedBarcode(offset, trackedBarcode);
        });
        this.eventEmitter.on(BarcodeBatchAdvancedOverlayListenerEvents.didTapViewForTrackedBarcode, (data) => {
            var _a, _b;
            const payload = core.EventDataParser.parse(data);
            if (payload === null) {
                console.error('BarcodeBatchAdvancedOverlayController didTapViewForTrackedBarcode payload is null');
                return;
            }
            const trackedBarcode = TrackedBarcode
                .fromJSON(JSON.parse(payload.trackedBarcode));
            (_b = (_a = this.overlay.listener) === null || _a === void 0 ? void 0 : _a.didTapViewForTrackedBarcode) === null || _b === void 0 ? void 0 : _b.call(_a, this.overlay, trackedBarcode);
        });
    }
    unsubscribeListener() {
        this._proxy.unregisterListenerForAdvancedOverlayEvents();
        this.eventEmitter.removeAllListeners(BarcodeBatchAdvancedOverlayListenerEvents.anchorForTrackedBarcode);
        this.eventEmitter.removeAllListeners(BarcodeBatchAdvancedOverlayListenerEvents.offsetForTrackedBarcode);
        this.eventEmitter.removeAllListeners(BarcodeBatchAdvancedOverlayListenerEvents.viewForTrackedBarcode);
    }
}

var BarcodeBatchBasicOverlayListenerEvents;
(function (BarcodeBatchBasicOverlayListenerEvents) {
    BarcodeBatchBasicOverlayListenerEvents["brushForTrackedBarcode"] = "BarcodeBatchBasicOverlayListener.brushForTrackedBarcode";
    BarcodeBatchBasicOverlayListenerEvents["didTapTrackedBarcode"] = "BarcodeBatchBasicOverlayListener.didTapTrackedBarcode";
})(BarcodeBatchBasicOverlayListenerEvents || (BarcodeBatchBasicOverlayListenerEvents = {}));
class BarcodeBatchBasicOverlayController {
    get _proxy() {
        return core.FactoryMaker.getInstance("BarcodeBatchBasicOverlayProxy");
    }
    static forOverlay(overlay) {
        const controller = new BarcodeBatchBasicOverlayController();
        controller.overlay = overlay;
        return controller;
    }
    constructor() {
        this.eventEmitter = core.FactoryMaker.getInstance('EventEmitter');
    }
    setBrushForTrackedBarcode(brush, trackedBarcode) {
        return this._proxy.setBrushForTrackedBarcode(brush ? JSON.stringify(brush.toJSON()) : null, trackedBarcode.identifier, trackedBarcode.sessionFrameSequenceID);
    }
    clearTrackedBarcodeBrushes() {
        return this._proxy.clearTrackedBarcodeBrushes();
    }
    updateBarcodeBatchBasicOverlay() {
        return this._proxy.updateBarcodeBatchBasicOverlay(JSON.stringify(this.overlay.toJSON()));
    }
    subscribeListener() {
        var _a, _b, _c, _d;
        this._proxy.registerListenerForBasicOverlayEvents();
        (_b = (_a = this._proxy).subscribeBrushForTrackedBarcode) === null || _b === void 0 ? void 0 : _b.call(_a);
        (_d = (_c = this._proxy).subscribeDidTapTrackedBarcode) === null || _d === void 0 ? void 0 : _d.call(_c);
        this.eventEmitter.on(BarcodeBatchBasicOverlayListenerEvents.brushForTrackedBarcode, (data) => {
            const payload = core.EventDataParser.parse(data);
            if (payload === null) {
                console.error('BarcodeBatchBasicOverlayController brushForTrackedBarcode payload is null');
                return;
            }
            const trackedBarcode = TrackedBarcode.fromJSON(JSON.parse(payload.trackedBarcode));
            let brush = this.overlay.brush;
            if (this.overlay.listener && this.overlay.listener.brushForTrackedBarcode) {
                brush = this.overlay.listener.brushForTrackedBarcode(this.overlay, trackedBarcode);
                this.setBrushForTrackedBarcode(brush, trackedBarcode);
            }
        });
        this.eventEmitter.on(BarcodeBatchBasicOverlayListenerEvents.didTapTrackedBarcode, (data) => {
            const payload = core.EventDataParser.parse(data);
            if (payload === null) {
                console.error('BarcodeBatchBasicOverlayController didTapTrackedBarcode payload is null');
                return;
            }
            const trackedBarcode = TrackedBarcode.fromJSON(JSON.parse(payload.trackedBarcode));
            if (this.overlay.listener && this.overlay.listener.didTapTrackedBarcode) {
                this.overlay.listener.didTapTrackedBarcode(this.overlay, trackedBarcode);
            }
        });
    }
    unsubscribeListener() {
        this._proxy.unregisterListenerForBasicOverlayEvents();
        this.eventEmitter.removeAllListeners(BarcodeBatchBasicOverlayListenerEvents.brushForTrackedBarcode);
        this.eventEmitter.removeAllListeners(BarcodeBatchBasicOverlayListenerEvents.didTapTrackedBarcode);
    }
}

class BarcodeBatchBasicOverlay extends core.DefaultSerializeable {
    set view(newView) {
        if (newView == null) {
            this.controller.unsubscribeListener();
        }
        else if (this._view == null) {
            this.controller.subscribeListener();
        }
        this._view = newView;
    }
    get view() {
        return this._view;
    }
    get defaultBrush() {
        return this.brush;
    }
    set defaultBrush(newBrush) {
        this.brush = newBrush;
    }
    get brush() {
        return this._brush;
    }
    set brush(newBrush) {
        this._brush = newBrush;
        this.controller.updateBarcodeBatchBasicOverlay();
    }
    get shouldShowScanAreaGuides() {
        return this._shouldShowScanAreaGuides;
    }
    set shouldShowScanAreaGuides(shouldShow) {
        this._shouldShowScanAreaGuides = shouldShow;
        this.controller.updateBarcodeBatchBasicOverlay();
    }
    get style() {
        return this._style;
    }
    static withBarcodeBatch(barcodeBatch) {
        return BarcodeBatchBasicOverlay.withBarcodeBatchForView(barcodeBatch, null);
    }
    static withBarcodeBatchForView(barcodeBatch, view) {
        return this.withBarcodeBatchForViewWithStyle(barcodeBatch, view, BarcodeBatchBasicOverlay.barcodeBatchDefaults.BarcodeBatchBasicOverlay.defaultStyle);
    }
    static withBarcodeBatchForViewWithStyle(barcodeBatch, view, style) {
        const overlay = new BarcodeBatchBasicOverlay();
        overlay.barcodeBatch = barcodeBatch;
        overlay._style = style;
        overlay._brush = new core.Brush(BarcodeBatchBasicOverlay.barcodeBatchDefaults.BarcodeBatchBasicOverlay.styles[style].DefaultBrush.fillColor, BarcodeBatchBasicOverlay.barcodeBatchDefaults.BarcodeBatchBasicOverlay.styles[style].DefaultBrush.strokeColor, BarcodeBatchBasicOverlay.barcodeBatchDefaults.BarcodeBatchBasicOverlay.styles[style].DefaultBrush.strokeWidth);
        if (view) {
            view.addOverlay(overlay);
        }
        return overlay;
    }
    static get barcodeBatchDefaults() {
        return getBarcodeBatchDefaults();
    }
    constructor() {
        super();
        this.type = 'barcodeTrackingBasic';
        this._brush = BarcodeBatchBasicOverlay.barcodeBatchDefaults.BarcodeBatchBasicOverlay.DefaultBrush;
        this._shouldShowScanAreaGuides = false;
        this.listener = null;
        this.controller = BarcodeBatchBasicOverlayController.forOverlay(this);
    }
    setBrushForTrackedBarcode(brush, trackedBarcode) {
        return this.controller.setBrushForTrackedBarcode(brush, trackedBarcode);
    }
    clearTrackedBarcodeBrushes() {
        return this.controller.clearTrackedBarcodeBrushes();
    }
}
__decorate([
    core.ignoreFromSerialization
], BarcodeBatchBasicOverlay.prototype, "barcodeBatch", void 0);
__decorate([
    core.ignoreFromSerialization
], BarcodeBatchBasicOverlay.prototype, "_view", void 0);
__decorate([
    core.nameForSerialization('style')
], BarcodeBatchBasicOverlay.prototype, "_style", void 0);
__decorate([
    core.ignoreFromSerialization
], BarcodeBatchBasicOverlay.prototype, "defaultBrush", null);
__decorate([
    core.nameForSerialization('defaultBrush')
], BarcodeBatchBasicOverlay.prototype, "_brush", void 0);
__decorate([
    core.nameForSerialization('shouldShowScanAreaGuides')
], BarcodeBatchBasicOverlay.prototype, "_shouldShowScanAreaGuides", void 0);
__decorate([
    core.ignoreFromSerialization
], BarcodeBatchBasicOverlay.prototype, "listener", void 0);
__decorate([
    core.ignoreFromSerialization
], BarcodeBatchBasicOverlay.prototype, "controller", void 0);
__decorate([
    core.ignoreFromSerialization
], BarcodeBatchBasicOverlay, "barcodeBatchDefaults", null);

class BarcodeBatchSettings extends core.DefaultSerializeable {
    get enabledSymbologies() {
        return Object.keys(this.symbologies)
            .filter(symbology => this.symbologies[symbology].isEnabled);
    }
    /**
    * @deprecated Setting a scenario is no longer recommended, use the BarcodeBatchSettings empty constructor instead.
    */
    static forScenario(scenario) {
        console.warn('Setting a scenario is no longer recommended, use the BarcodeBatchSettings empty constructor instead.');
        const settings = new BarcodeBatchSettings();
        settings.scenario = scenario;
        return settings;
    }
    static get barcodeDefaults() {
        return getBarcodeDefaults();
    }
    constructor() {
        super();
        this.scenario = null;
        this.properties = {};
        this.symbologies = {};
        this._arucoDictionary = null;
    }
    settingsForSymbology(symbology) {
        if (!this.symbologies[symbology]) {
            const symbologySettings = BarcodeBatchSettings.barcodeDefaults.SymbologySettings[symbology];
            symbologySettings._symbology = symbology;
            this.symbologies[symbology] = symbologySettings;
        }
        return this.symbologies[symbology];
    }
    setProperty(name, value) {
        this.properties[name] = value;
    }
    getProperty(name) {
        return this.properties[name];
    }
    enableSymbologies(symbologies) {
        symbologies.forEach(symbology => this.enableSymbology(symbology, true));
    }
    enableSymbology(symbology, enabled) {
        this.settingsForSymbology(symbology).isEnabled = enabled;
    }
    setArucoDictionary(dictionary) {
        this._arucoDictionary = dictionary;
    }
}
__decorate([
    core.nameForSerialization('arucoDictionary')
], BarcodeBatchSettings.prototype, "_arucoDictionary", void 0);
__decorate([
    core.ignoreFromSerialization
], BarcodeBatchSettings, "barcodeDefaults", null);

class BaseBarcodeBatchAdvancedOverlay extends core.DefaultSerializeable {
    get shouldShowScanAreaGuides() {
        return this._shouldShowScanAreaGuides;
    }
    set shouldShowScanAreaGuides(shouldShow) {
        this._shouldShowScanAreaGuides = shouldShow;
        this.controller.updateBarcodeBatchAdvancedOverlay();
    }
    set view(newView) {
        if (newView == null) {
            this.controller.unsubscribeListener();
        }
        else if (this._view == null) {
            this.controller.subscribeListener();
        }
        this._view = newView;
    }
    get view() {
        return this._view;
    }
    initialize(barcodeBatch, view) {
        this.barcodeBatch = barcodeBatch;
        if (view) {
            view.addOverlay(this);
        }
    }
    constructor() {
        super();
        this.type = 'barcodeTrackingAdvanced';
        this._shouldShowScanAreaGuides = false;
        this.listener = null;
        this.controller = BarcodeBatchAdvancedOverlayController.forOverlay(this);
    }
    setViewForTrackedBarcode(view, trackedBarcode) {
        return this.controller.setViewForTrackedBarcode(view, trackedBarcode);
    }
    setAnchorForTrackedBarcode(anchor, trackedBarcode) {
        return this.controller.setAnchorForTrackedBarcode(anchor, trackedBarcode);
    }
    setOffsetForTrackedBarcode(offset, trackedBarcode) {
        return this.controller.setOffsetForTrackedBarcode(offset, trackedBarcode);
    }
    clearTrackedBarcodeViews() {
        return this.controller.clearTrackedBarcodeViews();
    }
}
__decorate([
    core.nameForSerialization('shouldShowScanAreaGuides')
], BaseBarcodeBatchAdvancedOverlay.prototype, "_shouldShowScanAreaGuides", void 0);
__decorate([
    core.ignoreFromSerialization
], BaseBarcodeBatchAdvancedOverlay.prototype, "barcodeBatch", void 0);
__decorate([
    core.ignoreFromSerialization
], BaseBarcodeBatchAdvancedOverlay.prototype, "listener", void 0);
__decorate([
    core.ignoreFromSerialization
], BaseBarcodeBatchAdvancedOverlay.prototype, "controller", void 0);
__decorate([
    core.ignoreFromSerialization
], BaseBarcodeBatchAdvancedOverlay.prototype, "_view", void 0);

class SparkScanSession {
    static fromJSON(json) {
        var _a;
        const sessionJson = JSON.parse(json.session);
        const session = new SparkScanSession();
        session._newlyRecognizedBarcode = sessionJson.newlyRecognizedBarcode != null ?
            Barcode.fromJSON(sessionJson.newlyRecognizedBarcode) :
            null;
        session._frameSequenceID = sessionJson.frameSequenceId;
        session.frameId = (_a = json.frameId) !== null && _a !== void 0 ? _a : '';
        return session;
    }
    get newlyRecognizedBarcode() {
        return this._newlyRecognizedBarcode;
    }
    get frameSequenceID() {
        return this._frameSequenceID;
    }
    reset() {
        return this.listenerController.reset();
    }
}

var SparkScanListenerEvents;
(function (SparkScanListenerEvents) {
    SparkScanListenerEvents["didUpdateSession"] = "SparkScanListener.didUpdateSession";
    SparkScanListenerEvents["didScan"] = "SparkScanListener.didScan";
})(SparkScanListenerEvents || (SparkScanListenerEvents = {}));
class SparkScanListenerController extends core.BaseController {
    static forSparkScan(sparkScan) {
        const controller = new SparkScanListenerController();
        controller.sparkScan = sparkScan;
        return controller;
    }
    constructor() {
        super('SparkScanListenerProxy');
    }
    reset() {
        return this._proxy.resetSession();
    }
    update() {
        const sparkScanJson = this.sparkScan.toJSON();
        const json = JSON.stringify(sparkScanJson);
        return this._proxy.updateMode(json);
    }
    subscribeListener() {
        this._proxy.registerListenerForEvents();
        this._proxy.subscribeDidScanListener();
        this._proxy.subscribeDidUpdateSessionListener();
        this.eventEmitter.on(SparkScanListenerEvents.didUpdateSession, (data) => __awaiter(this, void 0, void 0, function* () {
            const payload = core.EventDataParser.parse(data);
            if (payload === null) {
                console.error('SparkScanListenerController didUpdateSession payload is null');
                return;
            }
            const session = SparkScanSession.fromJSON(payload);
            yield this.notifyListenersOfDidUpdateSession(session);
            this._proxy.finishDidUpdateSessionCallback(this.sparkScan.isEnabled);
        }));
        this.eventEmitter.on(SparkScanListenerEvents.didScan, (data) => __awaiter(this, void 0, void 0, function* () {
            const payload = core.EventDataParser.parse(data);
            if (payload === null) {
                console.error('SparkScanListenerController.subscribeListener: didScan payload is null');
                return;
            }
            const session = SparkScanSession.fromJSON(payload);
            yield this.notifyListenersOfDidScan(session);
            this._proxy.finishDidScanCallback(this.sparkScan.isEnabled);
        }));
    }
    unsubscribeListener() {
        this._proxy.unregisterListenerForEvents();
        this.eventEmitter.removeAllListeners(SparkScanListenerEvents.didUpdateSession);
        this.eventEmitter.removeAllListeners(SparkScanListenerEvents.didScan);
    }
    setModeEnabledState(enabled) {
        this._proxy.setModeEnabledState(enabled);
    }
    notifyListenersOfDidUpdateSession(session) {
        return __awaiter(this, void 0, void 0, function* () {
            const mode = this.sparkScan;
            mode.isInListenerCallback = true;
            for (const listener of mode.listeners) {
                if (listener.didUpdateSession) {
                    yield listener.didUpdateSession(this.sparkScan, session, () => core.CameraController.getFrameOrNull(session.frameId));
                }
            }
            mode.isInListenerCallback = false;
        });
    }
    notifyListenersOfDidScan(session) {
        return __awaiter(this, void 0, void 0, function* () {
            const mode = this.sparkScan;
            mode.isInListenerCallback = true;
            for (const listener of mode.listeners) {
                if (listener.didScan) {
                    yield listener.didScan(this.sparkScan, session, () => core.CameraController.getFrameOrNull(session.frameId));
                }
            }
            mode.isInListenerCallback = false;
        });
    }
}

class SparkScan extends core.DefaultSerializeable {
    get isEnabled() {
        return this._isEnabled;
    }
    set isEnabled(isEnabled) {
        this._isEnabled = isEnabled;
        this.listenerController.setModeEnabledState(isEnabled);
    }
    get context() {
        return this._context;
    }
    get _context() {
        return this.privateContext;
    }
    set _context(newContext) {
        this.privateContext = newContext;
    }
    static forSettings(settings) {
        const sparkScan = new SparkScan();
        sparkScan.settings = settings;
        return sparkScan;
    }
    constructor() {
        super();
        this.type = 'sparkScan';
        this._isEnabled = true;
        this.privateContext = null;
        this.listeners = [];
        this.isInListenerCallback = false;
        this.listenerController = SparkScanListenerController.forSparkScan(this);
    }
    applySettings(settings) {
        this.settings = settings;
        return this.didChange();
    }
    addListener(listener) {
        this.checkAndSubscribeListeners();
        if (this.listeners.includes(listener)) {
            return;
        }
        this.listeners.push(listener);
    }
    checkAndSubscribeListeners() {
        if (this.listeners.length === 0) {
            this.listenerController.subscribeListener();
        }
    }
    checkAndUnsubscribeListeners() {
        if (this.listeners.length === 0) {
            this.listenerController.unsubscribeListener();
        }
    }
    removeListener(listener) {
        if (!this.listeners.includes(listener)) {
            return;
        }
        this.listeners.splice(this.listeners.indexOf(listener));
        this.checkAndUnsubscribeListeners();
    }
    didChange() {
        if (this.listenerController) {
            return this.listenerController.update();
        }
        else {
            return Promise.resolve();
        }
    }
    unsubscribeNativeListeners() {
        this.listenerController.unsubscribeListener();
    }
}
__decorate([
    core.ignoreFromSerialization
], SparkScan.prototype, "_isEnabled", void 0);
__decorate([
    core.ignoreFromSerialization
], SparkScan.prototype, "privateContext", void 0);
__decorate([
    core.ignoreFromSerialization
], SparkScan.prototype, "listeners", void 0);
__decorate([
    core.ignoreFromSerialization
], SparkScan.prototype, "listenerController", void 0);
__decorate([
    core.ignoreFromSerialization
], SparkScan.prototype, "isInListenerCallback", void 0);

var SparkScanMiniPreviewSize;
(function (SparkScanMiniPreviewSize) {
    SparkScanMiniPreviewSize["Regular"] = "expanded";
    SparkScanMiniPreviewSize["Expanded"] = "expanded";
})(SparkScanMiniPreviewSize || (SparkScanMiniPreviewSize = {}));

var SparkScanPreviewBehavior;
(function (SparkScanPreviewBehavior) {
    SparkScanPreviewBehavior["Persistent"] = "accurate";
    SparkScanPreviewBehavior["Default"] = "default";
})(SparkScanPreviewBehavior || (SparkScanPreviewBehavior = {}));

class SparkScanToastSettings extends core.DefaultSerializeable {
    constructor() {
        super(...arguments);
        this._toastEnabled = SparkScanToastSettings.toastSettings.toastEnabled;
        this._toastBackgroundColor = SparkScanToastSettings.toastSettings.toastBackgroundColor;
        this._toastTextColor = SparkScanToastSettings.toastSettings.toastTextColor;
        this._targetModeEnabledMessage = SparkScanToastSettings.toastSettings.targetModeEnabledMessage;
        this._targetModeDisabledMessage = SparkScanToastSettings.toastSettings.targetModeDisabledMessage;
        this._continuousModeEnabledMessage = SparkScanToastSettings.toastSettings.continuousModeEnabledMessage;
        this._continuousModeDisabledMessage = SparkScanToastSettings.toastSettings.continuousModeDisabledMessage;
        this._scanPausedMessage = SparkScanToastSettings.toastSettings.scanPausedMessage;
        this._zoomedInMessage = SparkScanToastSettings.toastSettings.zoomedInMessage;
        this._zoomedOutMessage = SparkScanToastSettings.toastSettings.zoomedOutMessage;
        this._torchEnabledMessage = SparkScanToastSettings.toastSettings.torchEnabledMessage;
        this._torchDisabledMessage = SparkScanToastSettings.toastSettings.torchDisabledMessage;
        this._userFacingCameraEnabledMessage = SparkScanToastSettings.toastSettings.userFacingCameraEnabledMessage;
        this._worldFacingCameraEnabledMessage = SparkScanToastSettings.toastSettings.worldFacingCameraEnabledMessage;
    }
    set toastEnabled(isEnabled) {
        this._toastEnabled = isEnabled;
    }
    get toastEnabled() {
        return this._toastEnabled;
    }
    set toastBackgroundColor(backgroundColor) {
        this._toastBackgroundColor = backgroundColor;
    }
    get toastBackgroundColor() {
        return this._toastBackgroundColor;
    }
    set toastTextColor(textColor) {
        this._toastTextColor = textColor;
    }
    get toastTextColor() {
        return this._toastTextColor;
    }
    set targetModeEnabledMessage(message) {
        this._targetModeEnabledMessage = message;
    }
    get targetModeEnabledMessage() {
        return this._targetModeEnabledMessage;
    }
    set targetModeDisabledMessage(message) {
        this._targetModeDisabledMessage = message;
    }
    get targetModeDisabledMessage() {
        return this._targetModeDisabledMessage;
    }
    set continuousModeEnabledMessage(message) {
        this._continuousModeEnabledMessage = message;
    }
    get continuousModeEnabledMessage() {
        return this._continuousModeEnabledMessage;
    }
    set continuousModeDisabledMessage(message) {
        this._continuousModeDisabledMessage = message;
    }
    get continuousModeDisabledMessage() {
        return this._continuousModeDisabledMessage;
    }
    set scanPausedMessage(message) {
        this._scanPausedMessage = message;
    }
    get scanPausedMessage() {
        return this._scanPausedMessage;
    }
    set zoomedInMessage(message) {
        this._zoomedInMessage = message;
    }
    get zoomedInMessage() {
        return this._zoomedInMessage;
    }
    set zoomedOutMessage(message) {
        this._zoomedOutMessage = message;
    }
    get zoomedOutMessage() {
        return this._zoomedOutMessage;
    }
    set torchEnabledMessage(message) {
        this._torchEnabledMessage = message;
    }
    get torchEnabledMessage() {
        return this._torchEnabledMessage;
    }
    set torchDisabledMessage(message) {
        this._torchDisabledMessage = message;
    }
    get torchDisabledMessage() {
        return this._torchDisabledMessage;
    }
    set worldFacingCameraEnabledMessage(message) {
        this._worldFacingCameraEnabledMessage = message;
    }
    get worldFacingCameraEnabledMessage() {
        return this._worldFacingCameraEnabledMessage;
    }
    set userFacingCameraEnabledMessage(message) {
        this._userFacingCameraEnabledMessage = message;
    }
    get userFacingCameraEnabledMessage() {
        return this._userFacingCameraEnabledMessage;
    }
    static get sparkScanDefaults() {
        return getSparkScanDefaults();
    }
    static get toastSettings() {
        return SparkScanToastSettings.sparkScanDefaults.SparkScanView.SparkScanViewSettings.toastSettings;
    }
}
__decorate([
    core.nameForSerialization('toastEnabled')
], SparkScanToastSettings.prototype, "_toastEnabled", void 0);
__decorate([
    core.nameForSerialization('toastBackgroundColor')
], SparkScanToastSettings.prototype, "_toastBackgroundColor", void 0);
__decorate([
    core.nameForSerialization('toastTextColor')
], SparkScanToastSettings.prototype, "_toastTextColor", void 0);
__decorate([
    core.nameForSerialization('targetModeEnabledMessage')
], SparkScanToastSettings.prototype, "_targetModeEnabledMessage", void 0);
__decorate([
    core.nameForSerialization('targetModeDisabledMessage')
], SparkScanToastSettings.prototype, "_targetModeDisabledMessage", void 0);
__decorate([
    core.nameForSerialization('continuousModeEnabledMessage')
], SparkScanToastSettings.prototype, "_continuousModeEnabledMessage", void 0);
__decorate([
    core.nameForSerialization('continuousModeDisabledMessage')
], SparkScanToastSettings.prototype, "_continuousModeDisabledMessage", void 0);
__decorate([
    core.nameForSerialization('scanPausedMessage')
], SparkScanToastSettings.prototype, "_scanPausedMessage", void 0);
__decorate([
    core.nameForSerialization('zoomedInMessage')
], SparkScanToastSettings.prototype, "_zoomedInMessage", void 0);
__decorate([
    core.nameForSerialization('zoomedOutMessage')
], SparkScanToastSettings.prototype, "_zoomedOutMessage", void 0);
__decorate([
    core.nameForSerialization('torchEnabledMessage')
], SparkScanToastSettings.prototype, "_torchEnabledMessage", void 0);
__decorate([
    core.nameForSerialization('torchDisabledMessage')
], SparkScanToastSettings.prototype, "_torchDisabledMessage", void 0);
__decorate([
    core.nameForSerialization('userFacingCameraEnabledMessage')
], SparkScanToastSettings.prototype, "_userFacingCameraEnabledMessage", void 0);
__decorate([
    core.nameForSerialization('worldFacingCameraEnabledMessage')
], SparkScanToastSettings.prototype, "_worldFacingCameraEnabledMessage", void 0);
__decorate([
    core.ignoreFromSerialization
], SparkScanToastSettings, "sparkScanDefaults", null);

var SparkScanScanningBehavior;
(function (SparkScanScanningBehavior) {
    SparkScanScanningBehavior["Single"] = "single";
    SparkScanScanningBehavior["Continuous"] = "continuous";
})(SparkScanScanningBehavior || (SparkScanScanningBehavior = {}));

class PrivateSparkScanScanningModeSettings extends core.DefaultSerializeable {
    get scanningBehavior() {
        return this._scanningBehavior;
    }
    get previewBehavior() {
        return this._previewBehavior;
    }
    constructor(scanScanningBehavior, scanPreviewBehavior) {
        super();
        this._scanningBehavior = scanScanningBehavior;
        this._previewBehavior = scanPreviewBehavior;
    }
}
__decorate([
    core.nameForSerialization('scanningBehavior')
], PrivateSparkScanScanningModeSettings.prototype, "_scanningBehavior", void 0);
__decorate([
    core.nameForSerialization('previewBehavior')
], PrivateSparkScanScanningModeSettings.prototype, "_previewBehavior", void 0);

class SparkScanScanningModeDefault extends core.DefaultSerializeable {
    get scanningBehavior() {
        return this._settings.scanningBehavior;
    }
    get previewBehavior() {
        return this._settings.previewBehavior;
    }
    constructor(scanningBehavior, previewBehavior) {
        super();
        this.type = 'default';
        if (previewBehavior) {
            this._settings = new PrivateSparkScanScanningModeSettings(scanningBehavior, previewBehavior);
        }
        else {
            const previewBehavior = SparkScanPreviewBehavior.Default;
            this._settings = new PrivateSparkScanScanningModeSettings(scanningBehavior, previewBehavior);
            console.warn('SparkScanScanningModeDefault(scanningBehavior: SparkScanScanningBehavior) is deprecated.');
        }
    }
}
__decorate([
    core.nameForSerialization('settings')
], SparkScanScanningModeDefault.prototype, "_settings", void 0);

class SparkScanScanningModeTarget extends core.DefaultSerializeable {
    get scanningBehavior() {
        return this._settings.scanningBehavior;
    }
    get previewBehavior() {
        return this._settings.previewBehavior;
    }
    constructor(scanningBehavior, previewBehavior) {
        super();
        this.type = 'target';
        if (previewBehavior) {
            this._settings = new PrivateSparkScanScanningModeSettings(scanningBehavior, previewBehavior);
        }
        else {
            const previewBehavior = SparkScanPreviewBehavior.Default;
            this._settings = new PrivateSparkScanScanningModeSettings(scanningBehavior, previewBehavior);
            console.warn('SparkScanScanningModeTarget(scanningBehavior: SparkScanScanningBehavior) is deprecated.');
        }
    }
}
__decorate([
    core.nameForSerialization('settings')
], SparkScanScanningModeTarget.prototype, "_settings", void 0);

class SparkScanSettings extends core.DefaultSerializeable {
    get batterySaving() {
        return this._batterySaving;
    }
    set batterySaving(newValue) {
        this._batterySaving = newValue;
    }
    get locationSelection() {
        return this._locationSelection;
    }
    set locationSelection(newValue) {
        this._locationSelection = newValue;
    }
    get enabledSymbologies() {
        return Object.keys(this.symbologies)
            .filter(symbology => this.symbologies[symbology].isEnabled);
    }
    static get sparkScanDefaults() {
        return getSparkScanDefaults();
    }
    static get barcodeDefaults() {
        return getBarcodeDefaults();
    }
    constructor() {
        super();
        this.codeDuplicateFilter = SparkScanSettings.sparkScanDefaults.SparkScanSettings.codeDuplicateFilter;
        this._batterySaving = SparkScanSettings.sparkScanDefaults.SparkScanSettings.batterySaving;
        this._locationSelection = SparkScanSettings.sparkScanDefaults.SparkScanSettings.locationSelection;
        this.properties = {};
        this.symbologies = {};
        this.scanIntention = SparkScanSettings.sparkScanDefaults.SparkScanSettings.scanIntention;
    }
    settingsForSymbology(symbology) {
        if (!this.symbologies[symbology]) {
            const symbologySettings = SparkScanSettings.barcodeDefaults.SymbologySettings[symbology];
            symbologySettings._symbology = symbology;
            this.symbologies[symbology] = symbologySettings;
        }
        return this.symbologies[symbology];
    }
    setProperty(name, value) {
        this.properties[name] = value;
    }
    getProperty(name) {
        return this.properties[name];
    }
    enableSymbologies(symbologies) {
        symbologies.forEach(symbology => this.enableSymbology(symbology, true));
    }
    enableSymbology(symbology, enabled) {
        this.settingsForSymbology(symbology).isEnabled = enabled;
    }
}
__decorate([
    core.nameForSerialization('batterySaving')
], SparkScanSettings.prototype, "_batterySaving", void 0);
__decorate([
    core.nameForSerialization('locationSelection')
], SparkScanSettings.prototype, "_locationSelection", void 0);
__decorate([
    core.ignoreFromSerialization
], SparkScanSettings, "sparkScanDefaults", null);
__decorate([
    core.ignoreFromSerialization
], SparkScanSettings, "barcodeDefaults", null);

class SparkScanViewSettings extends core.DefaultSerializeable {
    constructor() {
        super(...arguments);
        this.triggerButtonCollapseTimeout = SparkScanViewSettings.viewSettingsDefaults.triggerButtonCollapseTimeout;
        this.defaultTorchState = SparkScanViewSettings.viewSettingsDefaults.defaultTorchState;
        this.defaultScanningMode = SparkScanViewSettings.viewSettingsDefaults.defaultScanningMode;
        this.holdToScanEnabled = SparkScanViewSettings.viewSettingsDefaults.holdToScanEnabled;
        this.soundEnabled = SparkScanViewSettings.viewSettingsDefaults.soundEnabled;
        this.hapticEnabled = SparkScanViewSettings.viewSettingsDefaults.hapticEnabled;
        this.hardwareTriggerEnabled = SparkScanViewSettings.viewSettingsDefaults.hardwareTriggerEnabled;
        this.hardwareTriggerKeyCode = SparkScanViewSettings.viewSettingsDefaults.hardwareTriggerKeyCode;
        this.visualFeedbackEnabled = SparkScanViewSettings.viewSettingsDefaults.visualFeedbackEnabled;
        this.ignoreDragLimits = true;
        this.toastSettings = new SparkScanToastSettings();
        this.targetZoomFactorOut = SparkScanViewSettings.viewSettingsDefaults.targetZoomFactorOut;
        this.targetZoomFactorIn = SparkScanViewSettings.viewSettingsDefaults.targetZoomFactorIn;
        this.zoomFactorOut = SparkScanViewSettings.viewSettingsDefaults.zoomFactorOut;
        this.zoomFactorIn = SparkScanViewSettings.viewSettingsDefaults.zoomFactorIn;
        this.inactiveStateTimeout = SparkScanViewSettings.viewSettingsDefaults.inactiveStateTimeout;
        this.defaultCameraPosition = SparkScanViewSettings.viewSettingsDefaults.defaultCameraPosition;
        this.defaultMiniPreviewSize = SparkScanViewSettings.viewSettingsDefaults.defaultMiniPreviewSize;
    }
    scanModeFromJSON(json) {
        const scanningBehavior = json.settings.scanningBehavior;
        const previewBehavior = json.settings.previewBehavior;
        if (json.type === 'default') {
            return new SparkScanScanningModeDefault(scanningBehavior, previewBehavior);
        }
        else {
            return new SparkScanScanningModeTarget(scanningBehavior, previewBehavior);
        }
    }
    static get sparkScanDefaults() {
        return getSparkScanDefaults();
    }
    static get viewSettingsDefaults() {
        return SparkScanViewSettings.sparkScanDefaults.SparkScanView.SparkScanViewSettings;
    }
}
__decorate([
    core.ignoreFromSerialization
], SparkScanViewSettings, "sparkScanDefaults", null);

var SparkScanViewState;
(function (SparkScanViewState) {
    SparkScanViewState["Initial"] = "initial";
    SparkScanViewState["Idle"] = "idle";
    SparkScanViewState["Inactive"] = "inactive";
    SparkScanViewState["Active"] = "active";
    SparkScanViewState["Error"] = "error";
})(SparkScanViewState || (SparkScanViewState = {}));

var SparkScanViewEvents;
(function (SparkScanViewEvents) {
    SparkScanViewEvents["barcodeFindButtonTapped"] = "SparkScanViewUiListener.barcodeFindButtonTapped";
    SparkScanViewEvents["barcodeCountButtonTapped"] = "SparkScanViewUiListener.barcodeCountButtonTapped";
    SparkScanViewEvents["didChangeViewState"] = "SparkScanViewUiListener.didChangeViewState";
})(SparkScanViewEvents || (SparkScanViewEvents = {}));
var SparkScanFeedbackDelegateEvents;
(function (SparkScanFeedbackDelegateEvents) {
    SparkScanFeedbackDelegateEvents["feedbackForBarcode"] = "SparkScanFeedbackDelegate.feedbackForBarcode";
})(SparkScanFeedbackDelegateEvents || (SparkScanFeedbackDelegateEvents = {}));

class SparkScanBarcodeFeedback extends core.DefaultSerializeable {
    constructor() {
        super();
    }
}

class SparkScanBarcodeErrorFeedback extends SparkScanBarcodeFeedback {
    get message() {
        return this._barcodeFeedback.message;
    }
    get resumeCapturingDelay() {
        return this._barcodeFeedback.resumeCapturingDelay;
    }
    get visualFeedbackColor() {
        return this._barcodeFeedback.visualFeedbackColor;
    }
    get brush() {
        return this._barcodeFeedback.brush;
    }
    get feedback() {
        return this._barcodeFeedback.feedback;
    }
    constructor(message, resumeCapturingDelay, visualFeedbackColor, brush, feedback) {
        super();
        this.type = 'error';
        this._barcodeFeedback = {
            message: message,
            resumeCapturingDelay: resumeCapturingDelay,
            visualFeedbackColor: visualFeedbackColor,
            brush: brush,
            feedback: feedback
        };
    }
    static fromMessage(message, resumeCapturingDelay) {
        return new SparkScanBarcodeErrorFeedback(message, resumeCapturingDelay, SparkScanBarcodeErrorFeedback.sparkScanDefaults.Feedback.error.visualFeedbackColor, SparkScanBarcodeErrorFeedback.sparkScanDefaults.Feedback.error.brush, SparkScanBarcodeErrorFeedback.sparkScanDefaults.Feedback.error.feedbackDefault);
    }
    static get sparkScanDefaults() {
        return getSparkScanDefaults();
    }
}
__decorate([
    core.nameForSerialization('barcodeFeedback')
], SparkScanBarcodeErrorFeedback.prototype, "_barcodeFeedback", void 0);
__decorate([
    core.ignoreFromSerialization
], SparkScanBarcodeErrorFeedback, "sparkScanDefaults", null);

class SparkScanBarcodeSuccessFeedback extends SparkScanBarcodeFeedback {
    get visualFeedbackColor() {
        return this._barcodeFeedback.visualFeedbackColor;
    }
    get brush() {
        return this._barcodeFeedback.brush;
    }
    get feedback() {
        return this._barcodeFeedback.feedback;
    }
    constructor() {
        super();
        this.type = 'success';
        this._barcodeFeedback = {
            visualFeedbackColor: SparkScanBarcodeSuccessFeedback.sparkScanDefaults.Feedback.success.visualFeedbackColor,
            brush: SparkScanBarcodeSuccessFeedback.sparkScanDefaults.Feedback.success.brush,
            feedback: SparkScanBarcodeSuccessFeedback.sparkScanDefaults.Feedback.success.feedbackDefault
        };
    }
    static fromVisualFeedbackColor(visualFeedbackColor, brush, feedback) {
        const successFeedback = new SparkScanBarcodeSuccessFeedback();
        successFeedback._barcodeFeedback = {
            visualFeedbackColor: visualFeedbackColor,
            brush: brush,
            feedback: feedback
        };
        return successFeedback;
    }
    static get sparkScanDefaults() {
        return getSparkScanDefaults();
    }
}
__decorate([
    core.nameForSerialization('barcodeFeedback')
], SparkScanBarcodeSuccessFeedback.prototype, "_barcodeFeedback", void 0);
__decorate([
    core.ignoreFromSerialization
], SparkScanBarcodeSuccessFeedback, "sparkScanDefaults", null);

class BarcodePickScanningSession {
    get pickedItems() {
        return this._pickedItems;
    }
    get scannedItems() {
        return this._scannedItems;
    }
    static fromJSON(json) {
        const session = new BarcodePickScanningSession();
        session._pickedItems = json.pickedObjects;
        session._scannedItems = json.scannedObjects;
        return session;
    }
}

var BarcodePickListenerEvents;
(function (BarcodePickListenerEvents) {
    BarcodePickListenerEvents["DidCompleteScanningSession"] = "BarcodePickScanningListener.didCompleteScanningSession";
    BarcodePickListenerEvents["DidUpdateScanningSession"] = "BarcodePickScanningListener.didUpdateScanningSession";
})(BarcodePickListenerEvents || (BarcodePickListenerEvents = {}));
class BarcodePickListenerController extends core.BaseController {
    constructor(barcodePick) {
        super('BarcodePickListenerProxy');
        this._barcodePick = barcodePick;
        this.eventEmitter = core.FactoryMaker.getInstance('EventEmitter');
    }
    static forBarcodePick(barcodePick) {
        return new BarcodePickListenerController(barcodePick);
    }
    subscribeListeners() {
        this._proxy.subscribeBarcodePickListeners();
        this.eventEmitter.on(BarcodePickListenerEvents.DidCompleteScanningSession, (data) => {
            const payload = core.EventDataParser.parse(data);
            if (payload === null) {
                console.error('BarcodePickListenerController DidCompleteScanningSession payload is null');
                return;
            }
            const session = BarcodePickScanningSession
                .fromJSON(JSON.parse(payload.session));
            this.notifyListenersOfDidCompleteScanningSession(session);
        });
        this.eventEmitter.on(BarcodePickListenerEvents.DidUpdateScanningSession, (data) => {
            const payload = core.EventDataParser.parse(data);
            if (payload === null) {
                console.error('BarcodePickListenerController DidUpdateScanningSession payload is null');
                return;
            }
            const session = BarcodePickScanningSession
                .fromJSON(JSON.parse(payload.session));
            this.notifyListenersOfDidUpdateScanningSession(session);
        });
    }
    notifyListenersOfDidCompleteScanningSession(session) {
        const mode = this._barcodePick;
        mode.isInListenerCallback = true;
        mode.listeners.forEach(listener => {
            if (listener.didCompleteScanningSession) {
                listener.didCompleteScanningSession(this._barcodePick, session);
            }
        });
        mode.isInListenerCallback = false;
    }
    notifyListenersOfDidUpdateScanningSession(session) {
        const mode = this._barcodePick;
        mode.isInListenerCallback = true;
        mode.listeners.forEach(listener => {
            if (listener.didUpdateScanningSession) {
                listener.didUpdateScanningSession(this._barcodePick, session);
            }
        });
        mode.isInListenerCallback = false;
    }
    unsubscribeListeners() {
        this.eventEmitter.removeAllListeners(BarcodePickListenerEvents.DidCompleteScanningSession);
        this.eventEmitter.removeAllListeners(BarcodePickListenerEvents.DidUpdateScanningSession);
        this._proxy.unsubscribeBarcodePickListeners();
    }
}

class BarcodePick extends core.DefaultSerializeable {
    static createRecommendedCameraSettings() {
        return BarcodePick.barcodePickDefaults.RecommendedCameraSettings;
    }
    static get barcodePickDefaults() {
        return getBarcodePickDefaults();
    }
    static get recommendedCameraSettings() {
        return BarcodePick.barcodePickDefaults.RecommendedCameraSettings;
    }
    constructor(dataCaptureContext, settings, productProvider) {
        super();
        this.type = 'barcodePick';
        this.listeners = [];
        this.privateContext = dataCaptureContext;
        this._settings = settings;
        this._productProvider = productProvider;
        this._listenerController = BarcodePickListenerController.forBarcodePick(this);
    }
    addScanningListener(listener) {
        this.checkAndSubscribeListeners();
        if (this.listeners.includes(listener)) {
            return;
        }
        this.listeners.push(listener);
    }
    checkAndSubscribeListeners() {
        if (this.listeners.length === 0) {
            this._listenerController.subscribeListeners();
        }
    }
    removeScanningListener(listener) {
        if (!this.listeners.includes(listener)) {
            return;
        }
        this.listeners.splice(this.listeners.indexOf(listener));
        this.checkAndUnsubscribeListeners();
    }
    checkAndUnsubscribeListeners() {
        if (this.listeners.length === 0) {
            this._listenerController.unsubscribeListeners();
        }
    }
    unsubscribeNativeListeners() {
        this._productProvider._productController.dispose();
    }
}
__decorate([
    core.ignoreFromSerialization
], BarcodePick.prototype, "privateContext", void 0);
__decorate([
    core.ignoreFromSerialization
], BarcodePick.prototype, "_listenerController", void 0);
__decorate([
    core.ignoreFromSerialization
], BarcodePick.prototype, "listeners", void 0);
__decorate([
    core.nameForSerialization('settings')
], BarcodePick.prototype, "_settings", void 0);
__decorate([
    core.nameForSerialization('ProductProvider')
], BarcodePick.prototype, "_productProvider", void 0);
__decorate([
    core.ignoreFromSerialization
], BarcodePick, "barcodePickDefaults", null);

class BarcodePickActionCallback {
    onFinish(result) {
        this._viewController.finishPickAction(this._itemData, result);
    }
}

var BarcodePickViewListenerEvents;
(function (BarcodePickViewListenerEvents) {
    BarcodePickViewListenerEvents["DidStartScanning"] = "BarcodePickViewListener.didStartScanning";
    BarcodePickViewListenerEvents["DidFreezeScanning"] = "BarcodePickViewListener.didFreezeScanning";
    BarcodePickViewListenerEvents["DidPauseScanning"] = "BarcodePickViewListener.didPauseScanning";
    BarcodePickViewListenerEvents["DidStopScanning"] = "BarcodePickViewListener.didStopScanning";
})(BarcodePickViewListenerEvents || (BarcodePickViewListenerEvents = {}));
var BarcodePickViewUiListenerEvents;
(function (BarcodePickViewUiListenerEvents) {
    BarcodePickViewUiListenerEvents["DidTapFinishButton"] = "BarcodePickViewUiListener.didTapFinishButton";
})(BarcodePickViewUiListenerEvents || (BarcodePickViewUiListenerEvents = {}));
var BarcodePickEvents;
(function (BarcodePickEvents) {
    BarcodePickEvents["DidPick"] = "BarcodePickActionListener.didPick";
    BarcodePickEvents["DidUnpick"] = "BarcodePickActionListener.didUnpick";
    BarcodePickEvents["OnProductIdentifierForItems"] = "BarcodePickAsyncMapperProductProviderCallback.onProductIdentifierForItems";
})(BarcodePickEvents || (BarcodePickEvents = {}));
class BarcodePickViewController extends core.BaseController {
    static forBarcodePick(view, nativeView, autoCreateNativeView = true) {
        const viewController = new BarcodePickViewController();
        viewController.view = view;
        viewController.nativeView = nativeView;
        viewController.initialize(autoCreateNativeView);
        return viewController;
    }
    constructor() {
        super('BarcodePickViewProxy');
    }
    initialize(autoCreateNativeView) {
        return __awaiter(this, void 0, void 0, function* () {
            // We call update because it returns a promise, this guarantees, that by the time
            // we need the deserialized context, it will be set in the native layer.
            yield this.view.context.update();
            if (autoCreateNativeView) {
                yield this.create();
            }
        });
    }
    start() {
        return this._proxy.viewStart();
    }
    stop() {
        return this._proxy.viewStop();
    }
    freeze() {
        return this._proxy.viewFreeze();
    }
    pause() {
        return this._proxy.viewPause();
    }
    resume() {
        return this._proxy.viewResume();
    }
    finishPickAction(itemData, result) {
        return this._proxy.finishPickAction(itemData, result);
    }
    createNativeView() {
        return this.create();
    }
    removeNativeView() {
        var _a, _b, _c;
        return (_c = (_b = (_a = this._proxy).removeView) === null || _b === void 0 ? void 0 : _b.call(_a)) !== null && _c !== void 0 ? _c : Promise.resolve();
    }
    create() {
        const barcodePickView = this.view.toJSON();
        const json = JSON.stringify(barcodePickView);
        const id = this._proxy.findNodeHandle(this.nativeView);
        return this._proxy.createView(id, json);
    }
    dispose() {
        this.unsubscribeListeners();
    }
    setUiListener(listener) {
        return __awaiter(this, void 0, void 0, function* () {
            if (listener) {
                yield this._proxy.subscribeBarcodePickViewUiListener();
            }
            if (listener == null) {
                yield this._proxy.unsubscribeBarcodePickViewUiListener();
            }
        });
    }
    subscribeListeners() {
        this._proxy.registerFrameworkEvents();
        this.eventEmitter.on(BarcodePickEvents.DidPick, (data) => {
            const payload = core.EventDataParser.parse(data);
            if (payload === null) {
                console.error('BarcodePickViewController DidPick payload is null');
                return;
            }
            const barcodePickActionCallback = new BarcodePickActionCallback();
            barcodePickActionCallback._viewController = this;
            barcodePickActionCallback._itemData = payload.itemData;
            this.view.actionListeners
                .forEach(listener => listener.didPickItem(payload.itemData, barcodePickActionCallback));
        });
        this.eventEmitter.on(BarcodePickEvents.DidUnpick, (data) => {
            const payload = core.EventDataParser.parse(data);
            if (payload === null) {
                console.error('BarcodePickViewController DidUnpick payload is null');
                return;
            }
            const barcodePickActionCallback = new BarcodePickActionCallback();
            barcodePickActionCallback._viewController = this;
            barcodePickActionCallback._itemData = payload.itemData;
            this.view.actionListeners
                .forEach(listener => listener.didUnpickItem(payload.itemData, barcodePickActionCallback));
        });
        this.eventEmitter.on(BarcodePickViewUiListenerEvents.DidTapFinishButton, () => {
            var _a, _b;
            if (!this.view.uiListener) {
                return;
            }
            (_b = (_a = this.view) === null || _a === void 0 ? void 0 : _a.uiListener) === null || _b === void 0 ? void 0 : _b.didTapFinishButton(this);
        });
        this.eventEmitter.on(BarcodePickViewListenerEvents.DidStartScanning, () => {
            this.view.listeners
                .forEach(listener => listener.didStartScanning(this.view));
        });
        this.eventEmitter.on(BarcodePickViewListenerEvents.DidFreezeScanning, () => {
            this.view.listeners
                .forEach(listener => listener.didFreezeScanning(this.view));
        });
        this.eventEmitter.on(BarcodePickViewListenerEvents.DidPauseScanning, () => {
            this.view.listeners
                .forEach(listener => listener.didPauseScanning(this.view));
        });
        this.eventEmitter.on(BarcodePickViewListenerEvents.DidStopScanning, () => {
            this.view.listeners
                .forEach(listener => listener.didStopScanning(this.view));
        });
    }
    unsubscribeListeners() {
        this._proxy.unregisterFrameworkEvents();
        this.eventEmitter.removeAllListeners(BarcodePickEvents.DidPick);
        this.eventEmitter.removeAllListeners(BarcodePickEvents.DidUnpick);
        this.eventEmitter.removeAllListeners(BarcodePickViewListenerEvents.DidFreezeScanning);
        this.eventEmitter.removeAllListeners(BarcodePickViewListenerEvents.DidPauseScanning);
        this.eventEmitter.removeAllListeners(BarcodePickViewListenerEvents.DidStartScanning);
        this.eventEmitter.removeAllListeners(BarcodePickViewListenerEvents.DidStopScanning);
        this.eventEmitter.removeAllListeners(BarcodePickViewUiListenerEvents.DidTapFinishButton);
    }
}

class BarcodePickProductController extends core.BaseController {
    static create(callback) {
        const controller = new BarcodePickProductController();
        controller.barcodePickMapperCallback = callback;
        controller.subscribeListeners();
        return controller;
    }
    constructor() {
        super('BarcodePickProductProxy');
    }
    finishOnProductIdentifierForItems(data) {
        return this._proxy.finishOnProductIdentifierForItems(JSON.stringify(data));
    }
    dispose() {
        this.unsubscribeListeners();
    }
    subscribeListeners() {
        this._proxy.subscribeProductIdentifierForItemsListener();
        this.eventEmitter.on(BarcodePickEvents.OnProductIdentifierForItems, (data) => {
            const payload = core.EventDataParser.parse(data);
            if (payload === null) {
                console.error('BarcodePickProductController OnProductIdentifierForItems payload is null');
                return;
            }
            this.barcodePickMapperCallback.productIdentifierForItems(payload.itemsData, {
                onData: (callbackItems) => {
                    this.finishOnProductIdentifierForItems(callbackItems);
                }
            });
        });
    }
    unsubscribeListeners() {
        this.eventEmitter.removeAllListeners(BarcodePickEvents.OnProductIdentifierForItems);
        this._proxy.unsubscribeListeners();
    }
}

class BarcodePickAsyncMapperProductProvider extends core.DefaultSerializeable {
    constructor(productsToPick, callback) {
        super();
        this._productsToPickForSerialization = {};
        this._productController = BarcodePickProductController.create(callback);
        this._productsToPick = productsToPick;
        productsToPick.forEach((product) => {
            this._productsToPickForSerialization[product.identifier] = product.quantityToPick;
        });
        this._callback = callback;
    }
}
__decorate([
    core.ignoreFromSerialization
], BarcodePickAsyncMapperProductProvider.prototype, "_callback", void 0);
__decorate([
    core.ignoreFromSerialization
], BarcodePickAsyncMapperProductProvider.prototype, "_productController", void 0);
__decorate([
    core.ignoreFromSerialization
], BarcodePickAsyncMapperProductProvider.prototype, "_productsToPick", void 0);
__decorate([
    core.nameForSerialization('products')
], BarcodePickAsyncMapperProductProvider.prototype, "_productsToPickForSerialization", void 0);

var BarcodePickIconStyle;
(function (BarcodePickIconStyle) {
    BarcodePickIconStyle["Preset_1"] = "preset1";
    BarcodePickIconStyle["Preset_2"] = "preset2";
})(BarcodePickIconStyle || (BarcodePickIconStyle = {}));

class BarcodePickProduct extends core.DefaultSerializeable {
    constructor(identifier, quantityToPick) {
        super();
        this._identifier = identifier;
        this._quantityToPick = quantityToPick;
    }
    get identifier() {
        return this._identifier;
    }
    get quantityToPick() {
        return this._quantityToPick;
    }
}
__decorate([
    core.nameForSerialization('identifier')
], BarcodePickProduct.prototype, "_identifier", void 0);
__decorate([
    core.nameForSerialization('quantityToPick')
], BarcodePickProduct.prototype, "_quantityToPick", void 0);

class BarcodePickProductProviderCallbackItem extends core.DefaultSerializeable {
    constructor(itemData, productIdentifier) {
        super();
        this._productIdentifier = null;
        this._itemData = itemData;
        this._productIdentifier = productIdentifier;
    }
    get itemData() {
        return this._itemData;
    }
    get productIdentifier() {
        return this._productIdentifier;
    }
}
__decorate([
    core.nameForSerialization('itemData')
], BarcodePickProductProviderCallbackItem.prototype, "_itemData", void 0);
__decorate([
    core.nameForSerialization('productIdentifier')
], BarcodePickProductProviderCallbackItem.prototype, "_productIdentifier", void 0);

class BarcodePickSettings extends core.DefaultSerializeable {
    static get barcodePickDefaults() {
        return core.FactoryMaker.getInstance('BarcodePickDefaults');
    }
    constructor() {
        super();
        this.symbologies = {};
        this.properties = {};
        this._soundEnabled = BarcodePickSettings.barcodePickDefaults.BarcodePickSettings.soundEnabled;
        this._hapticsEnabled = BarcodePickSettings.barcodePickDefaults.BarcodePickSettings.hapticsEnabled;
        this._cachingEnabled = BarcodePickSettings.barcodePickDefaults.BarcodePickSettings.cachingEnabled;
        this._arucoDictionary = BarcodePickSettings.barcodePickDefaults.BarcodePickSettings.arucoDictionary;
    }
    settingsForSymbology(symbology) {
        if (!this.symbologies[symbology]) {
            const symbologySettings = BarcodePickSettings.barcodePickDefaults.SymbologySettings[symbology];
            symbologySettings._symbology = symbology;
            this.symbologies[symbology] = symbologySettings;
        }
        return this.symbologies[symbology];
    }
    get enabledSymbologies() {
        return Object.keys(this.symbologies)
            .filter(symbology => this.symbologies[symbology].isEnabled);
    }
    enableSymbologies(symbologies) {
        symbologies.forEach(symbology => this.enableSymbology(symbology, true));
    }
    enableSymbology(symbology, enabled) {
        this.settingsForSymbology(symbology).isEnabled = enabled;
    }
    setProperty(name, value) {
        this.properties[name] = value;
    }
    getProperty(name) {
        return this.properties[name];
    }
    get soundEnabled() {
        return this._soundEnabled;
    }
    set soundEnabled(enabled) {
        this._soundEnabled = enabled;
    }
    get hapticsEnabled() {
        return this._hapticsEnabled;
    }
    set hapticsEnabled(enabled) {
        this._hapticsEnabled = enabled;
    }
    setArucoDictionary(dictionary) {
        this._arucoDictionary = dictionary;
    }
    get cachingEnabled() {
        return this._cachingEnabled;
    }
    set cachingEnabled(enabled) {
        this._cachingEnabled = enabled;
    }
}
__decorate([
    core.nameForSerialization('soundEnabled')
], BarcodePickSettings.prototype, "_soundEnabled", void 0);
__decorate([
    core.nameForSerialization('hapticEnabled')
], BarcodePickSettings.prototype, "_hapticsEnabled", void 0);
__decorate([
    core.nameForSerialization('cachingEnabled')
], BarcodePickSettings.prototype, "_cachingEnabled", void 0);
__decorate([
    core.nameForSerialization('arucoDictionary')
], BarcodePickSettings.prototype, "_arucoDictionary", void 0);
__decorate([
    core.ignoreFromSerialization
], BarcodePickSettings, "barcodePickDefaults", null);

var BarcodePickState;
(function (BarcodePickState) {
    BarcodePickState["Ignore"] = "ignore";
    BarcodePickState["Picked"] = "picked";
    BarcodePickState["ToPick"] = "toPick";
    BarcodePickState["Unknown"] = "unknown";
})(BarcodePickState || (BarcodePickState = {}));

class BaseBarcodePickView extends core.DefaultSerializeable {
    get context() {
        return this._context;
    }
    set context(context) {
        this._context = context;
    }
    get uiListener() {
        return this._barcodePickViewUiListener;
    }
    set uiListener(value) {
        this._barcodePickViewUiListener = value;
        this.viewController.setUiListener(value);
    }
    constructor({ context, barcodePick, settings, cameraSettings, autoCreateNativeView = true }) {
        super();
        this.actionListeners = [];
        this.listeners = [];
        this.isStarted = false;
        this._context = null;
        this.isViewCreated = false;
        this.autoCreateNativeView = true;
        this._barcodePickViewUiListener = null;
        this.context = context;
        this.barcodePick = barcodePick;
        this.settings = settings;
        this.cameraSettings = cameraSettings;
        this.autoCreateNativeView = autoCreateNativeView;
        this.isViewCreated = autoCreateNativeView;
        this.barcodePick.privateContext = context;
    }
    initialize(nativeView) {
        this.viewController = BarcodePickViewController.forBarcodePick(this, nativeView, this.autoCreateNativeView);
    }
    createNativeView() {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.isViewCreated) {
                return Promise.resolve();
            }
            yield this.viewController.createNativeView();
            this.isViewCreated = true;
        });
    }
    removeNativeView() {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.viewController.removeNativeView();
            this.isViewCreated = false;
        });
    }
    dispose() {
        this.viewController.dispose();
        this.barcodePick.unsubscribeNativeListeners();
        this.isViewCreated = false;
    }
    start() {
        this.isStarted = true;
        this.viewController.start();
    }
    stop() {
        this.viewController.stop();
    }
    freeze() {
        this.viewController.freeze();
    }
    pause() {
        this.viewController.pause();
    }
    resume() {
        this.viewController.resume();
    }
    addActionListener(listener) {
        if (this.actionListeners.findIndex(l => l === listener) === -1) {
            this.actionListeners.push(listener);
        }
    }
    removeActionListener(listener) {
        if (this.actionListeners.findIndex(l => l === listener) === -1) {
            return;
        }
        this.actionListeners.splice(this.actionListeners.indexOf(listener), 1);
    }
    addListener(listener) {
        this.checkAndSubscribeListeners();
        if (this.listeners.findIndex(l => l === listener) === -1) {
            this.listeners.push(listener);
        }
    }
    checkAndSubscribeListeners() {
        if (this.listeners.length === 0) {
            this.viewController.subscribeListeners();
        }
    }
    removeListener(listener) {
        if (this.listeners.findIndex(l => l === listener) === -1) {
            return;
        }
        this.listeners.splice(this.listeners.indexOf(listener), 1);
        this.checkAndUnsubscribeListeners();
    }
    checkAndUnsubscribeListeners() {
        if (this.listeners.length === 0) {
            this.viewController.unsubscribeListeners();
        }
    }
    toJSON() {
        return {
            View: {
                hasActionListeners: this.actionListeners.length > 0,
                hasViewListeners: this.listeners.length > 0,
                hasViewUiListener: this.uiListener ? true : false,
                isStarted: this.isStarted,
                viewSettings: this.settings.toJSON(),
                cameraSettings: this.cameraSettings.toJSON(),
            },
            BarcodePick: this.barcodePick.toJSON()
        };
    }
}
__decorate([
    core.ignoreFromSerialization
], BaseBarcodePickView.prototype, "viewController", void 0);
__decorate([
    core.ignoreFromSerialization
], BaseBarcodePickView.prototype, "actionListeners", void 0);
__decorate([
    core.ignoreFromSerialization
], BaseBarcodePickView.prototype, "listeners", void 0);
__decorate([
    core.nameForSerialization('isStarted')
], BaseBarcodePickView.prototype, "isStarted", void 0);
__decorate([
    core.ignoreFromSerialization
], BaseBarcodePickView.prototype, "_context", void 0);
__decorate([
    core.ignoreFromSerialization
], BaseBarcodePickView.prototype, "isViewCreated", void 0);
__decorate([
    core.ignoreFromSerialization
], BaseBarcodePickView.prototype, "autoCreateNativeView", void 0);
__decorate([
    core.ignoreFromSerialization
], BaseBarcodePickView.prototype, "_barcodePickViewUiListener", void 0);

class BarcodePickViewSettings extends core.DefaultSerializeable {
    static get barcodePickDefaults() {
        return getBarcodePickDefaults();
    }
    constructor() {
        super();
        this._highlightStyle = BarcodePickViewSettings.barcodePickDefaults.ViewSettings.highlightStyle;
        this._showLoadingDialog = BarcodePickViewSettings.barcodePickDefaults.ViewSettings.showLoadingDialog;
        this._showFinishButton = BarcodePickViewSettings.barcodePickDefaults.ViewSettings.showFinishButton;
        this._showPauseButton = BarcodePickViewSettings.barcodePickDefaults.ViewSettings.showPauseButton;
        this._showZoomButton = BarcodePickViewSettings.barcodePickDefaults.ViewSettings.showZoomButton;
        this._loadingDialogText = BarcodePickViewSettings.barcodePickDefaults.ViewSettings.loadingDialogText;
        this._showGuidelines = BarcodePickViewSettings.barcodePickDefaults.ViewSettings.showGuidelines;
        this._initialGuidelineText = BarcodePickViewSettings.barcodePickDefaults.ViewSettings.initialGuidelineText;
        this._moveCloserGuidelineText = BarcodePickViewSettings.barcodePickDefaults.ViewSettings.moveCloserGuidelineText;
        this._showHints = BarcodePickViewSettings.barcodePickDefaults.ViewSettings.showHints;
        this._onFirstItemToPickFoundHintText = BarcodePickViewSettings.barcodePickDefaults.ViewSettings.onFirstItemToPickFoundHintText;
        this._onFirstItemPickCompletedHintText = BarcodePickViewSettings.barcodePickDefaults.ViewSettings.onFirstItemUnpickCompletedHintText;
        this._onFirstUnmarkedItemPickCompletedHintText = BarcodePickViewSettings.barcodePickDefaults.ViewSettings.onFirstUnmarkedItemPickCompletedHintText;
        this._onFirstItemUnpickCompletedHintText = BarcodePickViewSettings.barcodePickDefaults.ViewSettings.onFirstItemUnpickCompletedHintText;
    }
    get highlightStyle() {
        return this._highlightStyle;
    }
    set highlightStyle(style) {
        this._highlightStyle = style;
    }
    get showLoadingDialog() {
        return this._showLoadingDialog;
    }
    set showLoadingDialog(style) {
        this._showLoadingDialog = style;
    }
    get showFinishButton() {
        return this._showFinishButton;
    }
    set showFinishButton(show) {
        this._showFinishButton = show;
    }
    get showPauseButton() {
        return this._showPauseButton;
    }
    set showPauseButton(show) {
        this._showPauseButton = show;
    }
    get showZoomButton() {
        return this._showZoomButton;
    }
    set showZoomButton(show) {
        this._showZoomButton = show;
    }
    get loadingDialogText() {
        return this._loadingDialogText;
    }
    set loadingDialogText(text) {
        this._loadingDialogText = text;
    }
    get showGuidelines() {
        return this._showGuidelines;
    }
    set showGuidelines(show) {
        this._showGuidelines = show;
    }
    get initialGuidelineText() {
        return this._initialGuidelineText;
    }
    set initialGuidelineText(text) {
        this._initialGuidelineText = text;
    }
    get moveCloserGuidelineText() {
        return this._moveCloserGuidelineText;
    }
    set moveCloserGuidelineText(text) {
        this._moveCloserGuidelineText = text;
    }
    get showHints() {
        return this._showHints;
    }
    set showHints(show) {
        this._showHints = show;
    }
    get onFirstItemToPickFoundHintText() {
        return this._onFirstItemToPickFoundHintText;
    }
    set onFirstItemToPickFoundHintText(text) {
        this._onFirstItemToPickFoundHintText = text;
    }
    get onFirstItemPickCompletedHintText() {
        return this._onFirstItemPickCompletedHintText;
    }
    set onFirstItemPickCompletedHintText(text) {
        this._onFirstItemPickCompletedHintText = text;
    }
    get onFirstUnmarkedItemPickCompletedHintText() {
        return this._onFirstUnmarkedItemPickCompletedHintText;
    }
    set onFirstUnmarkedItemPickCompletedHintText(text) {
        this._onFirstUnmarkedItemPickCompletedHintText = text;
    }
    get onFirstItemUnpickCompletedHintText() {
        return this._onFirstItemUnpickCompletedHintText;
    }
    set onFirstItemUnpickCompletedHintText(text) {
        this._onFirstItemUnpickCompletedHintText = text;
    }
}
__decorate([
    core.nameForSerialization('highlightStyle')
], BarcodePickViewSettings.prototype, "_highlightStyle", void 0);
__decorate([
    core.nameForSerialization('shouldShowLoadingDialog')
], BarcodePickViewSettings.prototype, "_showLoadingDialog", void 0);
__decorate([
    core.nameForSerialization('showFinishButton')
], BarcodePickViewSettings.prototype, "_showFinishButton", void 0);
__decorate([
    core.nameForSerialization('showPauseButton')
], BarcodePickViewSettings.prototype, "_showPauseButton", void 0);
__decorate([
    core.nameForSerialization('showZoomButton')
], BarcodePickViewSettings.prototype, "_showZoomButton", void 0);
__decorate([
    core.nameForSerialization('showLoadingDialogText')
], BarcodePickViewSettings.prototype, "_loadingDialogText", void 0);
__decorate([
    core.nameForSerialization('shouldShowGuidelines')
], BarcodePickViewSettings.prototype, "_showGuidelines", void 0);
__decorate([
    core.nameForSerialization('initialGuidelineText')
], BarcodePickViewSettings.prototype, "_initialGuidelineText", void 0);
__decorate([
    core.nameForSerialization('moveCloserGuidelineText')
], BarcodePickViewSettings.prototype, "_moveCloserGuidelineText", void 0);
__decorate([
    core.nameForSerialization('shouldShowHints')
], BarcodePickViewSettings.prototype, "_showHints", void 0);
__decorate([
    core.nameForSerialization('onFirstItemToPickFoundHintText')
], BarcodePickViewSettings.prototype, "_onFirstItemToPickFoundHintText", void 0);
__decorate([
    core.nameForSerialization('onFirstItemPickCompletedHintText')
], BarcodePickViewSettings.prototype, "_onFirstItemPickCompletedHintText", void 0);
__decorate([
    core.nameForSerialization('onFirstUnmarkedItemPickCompletedHintText')
], BarcodePickViewSettings.prototype, "_onFirstUnmarkedItemPickCompletedHintText", void 0);
__decorate([
    core.nameForSerialization('onFirstItemUnpickCompletedHintText')
], BarcodePickViewSettings.prototype, "_onFirstItemUnpickCompletedHintText", void 0);
__decorate([
    core.ignoreFromSerialization
], BarcodePickViewSettings, "barcodePickDefaults", null);

class BrushForStateObject extends core.DefaultSerializeable {
}
__decorate([
    core.nameForSerialization('barcodePickState')
], BrushForStateObject.prototype, "barcodePickState", void 0);
__decorate([
    core.nameForSerialization('brush')
], BrushForStateObject.prototype, "brush", void 0);

class BarcodePickStatusIconSettings extends core.DefaultSerializeable {
    constructor() {
        super(...arguments);
        this._ratioToHighlightSize = BarcodePickStatusIconSettings.barcodePickDefaults.BarcodePickStatusIconSettings.ratioToHighlightSize;
        this._minSize = BarcodePickStatusIconSettings.barcodePickDefaults.BarcodePickStatusIconSettings.minSize;
        this._maxSize = BarcodePickStatusIconSettings.barcodePickDefaults.BarcodePickStatusIconSettings.maxSize;
    }
    get ratioToHighlightSize() {
        return this._ratioToHighlightSize;
    }
    set ratioToHighlightSize(value) {
        this._ratioToHighlightSize = value;
    }
    get minSize() {
        return this._minSize;
    }
    set minSize(value) {
        this._minSize = value;
    }
    get maxSize() {
        return this._maxSize;
    }
    set maxSize(value) {
        this._maxSize = value;
    }
    static get barcodePickDefaults() {
        return getBarcodePickDefaults();
    }
    static fromJSON(json) {
        if (json == undefined) {
            return null;
        }
        const barcodePickStatusIconSettings = new BarcodePickStatusIconSettings();
        barcodePickStatusIconSettings._ratioToHighlightSize = json === null || json === void 0 ? void 0 : json.ratioToHighlightSize;
        barcodePickStatusIconSettings._minSize = json === null || json === void 0 ? void 0 : json.minSize;
        barcodePickStatusIconSettings._maxSize = json === null || json === void 0 ? void 0 : json.maxSize;
        return barcodePickStatusIconSettings;
    }
}
__decorate([
    core.nameForSerialization('ratioToHighlightSize')
], BarcodePickStatusIconSettings.prototype, "_ratioToHighlightSize", void 0);
__decorate([
    core.nameForSerialization('minSize')
], BarcodePickStatusIconSettings.prototype, "_minSize", void 0);
__decorate([
    core.nameForSerialization('maxSize')
], BarcodePickStatusIconSettings.prototype, "_maxSize", void 0);
__decorate([
    core.ignoreFromSerialization
], BarcodePickStatusIconSettings, "barcodePickDefaults", null);

class Dot extends core.DefaultSerializeable {
    static get barcodePickDefaults() {
        return getBarcodePickDefaults();
    }
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    constructor() {
        super();
        this._type = 'dot';
        this._brushesForState = Dot.barcodePickDefaults.BarcodePickViewHighlightStyle.Dot.brushesForState;
    }
    getBrushForState(state) {
        return (this._brushesForState.filter(item => item.barcodePickState === state)[0] || {}).brush;
    }
    setBrushForState(brush, state) {
        const indexToUpdate = this._brushesForState.findIndex(item => item.barcodePickState === state);
        this._brushesForState[indexToUpdate].brush = brush;
    }
}
__decorate([
    core.nameForSerialization('type')
], Dot.prototype, "_type", void 0);
__decorate([
    core.nameForSerialization('brushesForState')
], Dot.prototype, "_brushesForState", void 0);
__decorate([
    core.ignoreFromSerialization
], Dot, "barcodePickDefaults", null);

class IconForStateObject extends core.DefaultSerializeable {
    constructor(barcodePickState, icon) {
        super();
        this._barcodePickState = barcodePickState;
        this._icon = icon;
    }
    get barcodePickState() {
        return this._barcodePickState;
    }
    get icon() {
        return this._icon;
    }
}
__decorate([
    core.nameForSerialization('barcodePickState')
], IconForStateObject.prototype, "_barcodePickState", void 0);
__decorate([
    core.nameForSerialization('icon')
], IconForStateObject.prototype, "_icon", void 0);

class DotWithIcons extends core.DefaultSerializeable {
    static get barcodePickDefaults() {
        return getBarcodePickDefaults();
    }
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    constructor() {
        super();
        this._type = 'dotWithIcons';
        this._brushesForState = DotWithIcons.barcodePickDefaults.BarcodePickViewHighlightStyle.DotWithIcons.brushesForState;
        this._iconsForState = [];
        this._iconStyle = DotWithIcons.barcodePickDefaults.BarcodePickViewHighlightStyle.DotWithIcons.iconStyle;
    }
    getBrushForState(state) {
        return (this._brushesForState.filter(item => item.barcodePickState === state)[0] || {}).brush;
    }
    setBrushForState(brush, state) {
        const indexToUpdate = this._brushesForState.findIndex(item => item.barcodePickState === state);
        this._brushesForState[indexToUpdate].brush = brush;
    }
    setIconForState(image, state) {
        const indexToUpdate = this._iconsForState.findIndex(item => item.barcodePickState === state);
        if (indexToUpdate > -1) {
            this._iconsForState.splice(indexToUpdate, 1);
        }
        this._iconsForState.push(new IconForStateObject(state, image));
    }
    get iconStyle() {
        return this._iconStyle;
    }
    set iconStyle(style) {
        this._iconStyle = style;
    }
}
__decorate([
    core.nameForSerialization('type')
], DotWithIcons.prototype, "_type", void 0);
__decorate([
    core.nameForSerialization('brushesForState')
], DotWithIcons.prototype, "_brushesForState", void 0);
__decorate([
    core.nameForSerialization('iconsForState')
], DotWithIcons.prototype, "_iconsForState", void 0);
__decorate([
    core.nameForSerialization('iconStyle')
], DotWithIcons.prototype, "_iconStyle", void 0);
__decorate([
    core.ignoreFromSerialization
], DotWithIcons, "barcodePickDefaults", null);

class Rectangular extends core.DefaultSerializeable {
    static get barcodePickDefaults() {
        return getBarcodePickDefaults();
    }
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    constructor() {
        super();
        this._type = 'rectangular';
        this._brushesForState = Rectangular.barcodePickDefaults.BarcodePickViewHighlightStyle.Rectangular.brushesForState;
        this._minimumHighlightWidth = Rectangular.barcodePickDefaults.BarcodePickViewHighlightStyle.RectangularWithIcons.minimumHighlightWidth;
        this._minimumHighlightHeight = Rectangular.barcodePickDefaults.BarcodePickViewHighlightStyle.RectangularWithIcons.minimumHighlightHeight;
    }
    getBrushForState(state) {
        return (this._brushesForState.filter(item => item.barcodePickState === state)[0] || {}).brush;
    }
    setBrushForState(brush, state) {
        const indexToUpdate = this._brushesForState.findIndex(item => item.barcodePickState === state);
        this._brushesForState[indexToUpdate].brush = brush;
    }
    get minimumHighlightHeight() {
        return this._minimumHighlightHeight;
    }
    set minimumHighlightHeight(value) {
        this._minimumHighlightHeight = value;
    }
    get minimumHighlightWidth() {
        return this._minimumHighlightWidth;
    }
    set minimumHighlightWidth(value) {
        this._minimumHighlightWidth = value;
    }
}
__decorate([
    core.nameForSerialization('type')
], Rectangular.prototype, "_type", void 0);
__decorate([
    core.nameForSerialization('brushesForState')
], Rectangular.prototype, "_brushesForState", void 0);
__decorate([
    core.nameForSerialization('minimumHighlightWidth')
], Rectangular.prototype, "_minimumHighlightWidth", void 0);
__decorate([
    core.nameForSerialization('minimumHighlightHeight')
], Rectangular.prototype, "_minimumHighlightHeight", void 0);
__decorate([
    core.ignoreFromSerialization
], Rectangular, "barcodePickDefaults", null);

class RectangularWithIcons extends core.DefaultSerializeable {
    static get barcodePickDefaults() {
        return getBarcodePickDefaults();
    }
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    constructor() {
        super();
        this._type = 'rectangularWithIcons';
        this._brushesForState = RectangularWithIcons.barcodePickDefaults.BarcodePickViewHighlightStyle.RectangularWithIcons.brushesForState;
        this._iconsForState = [];
        this._iconStyle = RectangularWithIcons.barcodePickDefaults.BarcodePickViewHighlightStyle.RectangularWithIcons.iconStyle;
        this._minimumHighlightWidth = RectangularWithIcons.barcodePickDefaults.BarcodePickViewHighlightStyle.RectangularWithIcons.minimumHighlightWidth;
        this._minimumHighlightHeight = RectangularWithIcons.barcodePickDefaults.BarcodePickViewHighlightStyle.RectangularWithIcons.minimumHighlightHeight;
    }
    getBrushForState(state) {
        return (this._brushesForState.filter(item => item.barcodePickState === state)[0] || {}).brush;
    }
    setBrushForState(brush, state) {
        const indexToUpdate = this._brushesForState.findIndex(item => item.barcodePickState === state);
        this._brushesForState[indexToUpdate].brush = brush;
    }
    setIconForState(image, state) {
        const indexToUpdate = this._iconsForState.findIndex(item => item.barcodePickState === state);
        if (indexToUpdate > -1) {
            this._iconsForState.splice(indexToUpdate, 1);
        }
        this._iconsForState.push(new IconForStateObject(state, image));
    }
    get iconStyle() {
        return this._iconStyle;
    }
    set iconStyle(style) {
        this._iconStyle = style;
    }
    get statusIconSettings() {
        return this._statusIconSettings;
    }
    set statusIconSettings(value) {
        this._statusIconSettings = value;
    }
    get minimumHighlightHeight() {
        return this._minimumHighlightHeight;
    }
    set minimumHighlightHeight(value) {
        this._minimumHighlightHeight = value;
    }
    get minimumHighlightWidth() {
        return this._minimumHighlightWidth;
    }
    set minimumHighlightWidth(value) {
        this._minimumHighlightWidth = value;
    }
}
__decorate([
    core.nameForSerialization('type')
], RectangularWithIcons.prototype, "_type", void 0);
__decorate([
    core.nameForSerialization('brushesForState')
], RectangularWithIcons.prototype, "_brushesForState", void 0);
__decorate([
    core.nameForSerialization('iconsForState')
], RectangularWithIcons.prototype, "_iconsForState", void 0);
__decorate([
    core.nameForSerialization('iconStyle')
], RectangularWithIcons.prototype, "_iconStyle", void 0);
__decorate([
    core.nameForSerialization('statusIconSettings')
], RectangularWithIcons.prototype, "_statusIconSettings", void 0);
__decorate([
    core.nameForSerialization('minimumHighlightWidth')
], RectangularWithIcons.prototype, "_minimumHighlightWidth", void 0);
__decorate([
    core.nameForSerialization('minimumHighlightHeight')
], RectangularWithIcons.prototype, "_minimumHighlightHeight", void 0);
__decorate([
    core.ignoreFromSerialization
], RectangularWithIcons, "barcodePickDefaults", null);

class BarcodeFindFeedback extends core.DefaultSerializeable {
    constructor() {
        super(...arguments);
        this.controller = null;
        this._found = BarcodeFindFeedback.barcodeFindDefaults.Feedback.found;
        this._itemListUpdated = BarcodeFindFeedback.barcodeFindDefaults.Feedback.itemListUpdated;
    }
    get found() {
        return this._found;
    }
    set found(success) {
        this._found = success;
        this.updateFeedback();
    }
    get itemListUpdated() {
        return this._itemListUpdated;
    }
    set itemListUpdated(failure) {
        this._itemListUpdated = failure;
        this.updateFeedback();
    }
    updateFeedback() {
        var _a;
        (_a = this.controller) === null || _a === void 0 ? void 0 : _a.updateFeedback(JSON.stringify(this.toJSON()));
    }
    static get barcodeFindDefaults() {
        return getBarcodeFindDefaults();
    }
    static get defaultFeedback() {
        return new BarcodeFindFeedback();
    }
}
__decorate([
    core.ignoreFromSerialization
], BarcodeFindFeedback.prototype, "controller", void 0);
__decorate([
    core.nameForSerialization('found')
], BarcodeFindFeedback.prototype, "_found", void 0);
__decorate([
    core.nameForSerialization('itemListUpdated')
], BarcodeFindFeedback.prototype, "_itemListUpdated", void 0);

var BarcodeFindListenerEvents;
(function (BarcodeFindListenerEvents) {
    BarcodeFindListenerEvents["inCallback"] = "BarcodeFindListener.inCallback";
    BarcodeFindListenerEvents["onSearchStartedEvent"] = "BarcodeFindListener.onSearchStarted";
    BarcodeFindListenerEvents["onSearchPausedEvent"] = "BarcodeFindListener.onSearchPaused";
    BarcodeFindListenerEvents["onSearchStoppedEvent"] = "BarcodeFindListener.onSearchStopped";
    BarcodeFindListenerEvents["onTransformBarcodeData"] = "BarcodeFindTransformer.transformBarcodeData";
})(BarcodeFindListenerEvents || (BarcodeFindListenerEvents = {}));
class BarcodeFindController extends core.BaseController {
    constructor(barcodeFind) {
        super('BarcodeFindProxy');
        this._barcodeFind = barcodeFind;
        this._proxy.isModeEnabled = () => this._barcodeFind.isEnabled;
    }
    static forBarcodeFind(barcodeFind) {
        return new BarcodeFindController(barcodeFind);
    }
    updateMode() {
        return this._proxy.updateFindMode(JSON.stringify(this._barcodeFind.toJSON()));
    }
    setItemList(items) {
        const jsonString = items.map(item => item.toJSON());
        return this._proxy.setItemList(JSON.stringify(jsonString));
    }
    start() {
        return this._proxy.barcodeFindModeStart();
    }
    pause() {
        return this._proxy.barcodeFindModePause();
    }
    stop() {
        return this._proxy.barcodeFindModeStop();
    }
    setModeEnabledState(isEnabled) {
        this._proxy.setModeEnabledState(isEnabled);
    }
    setBarcodeTransformer() {
        return __awaiter(this, void 0, void 0, function* () {
            yield this._proxy.setBarcodeTransformer();
            this.subscribeBarcodeFindTransformerEvent();
        });
    }
    filterFoundItemsFromEvent(eventBody) {
        const foundItemsData = JSON.parse(eventBody).foundItems;
        const itemsToFind = JSON.parse(this._barcodeFind.itemsToFind);
        const foundItems = itemsToFind.filter((item) => foundItemsData.includes(item.searchOptions.barcodeData));
        return foundItems;
    }
    subscribeBarcodeFindTransformerEvent() {
        this.eventEmitter.on(BarcodeFindListenerEvents.onTransformBarcodeData, (data) => {
            var _a;
            const payload = core.EventDataParser.parse(data);
            if (payload === null) {
                console.error('BarcodeFindController onTransformBarcodeData payload is null');
                return;
            }
            const transformed = (_a = this._barcodeFind.barcodeTransformer) === null || _a === void 0 ? void 0 : _a.transformBarcodeData(payload.data);
            this._proxy.submitBarcodeFindTransformerResult(transformed);
        });
    }
    subscribeListeners() {
        this._proxy.subscribeBarcodeFindListener();
        this.eventEmitter.on(BarcodeFindListenerEvents.onSearchStartedEvent, () => {
            var _a;
            const listeners = this._barcodeFind.listeners;
            for (const listener of listeners) {
                (_a = listener === null || listener === void 0 ? void 0 : listener.didStartSearch) === null || _a === void 0 ? void 0 : _a.call(listener);
            }
        });
        this.eventEmitter.on(BarcodeFindListenerEvents.onSearchPausedEvent, (data) => {
            var _a;
            const foundItems = this.filterFoundItemsFromEvent(data);
            for (const listener of this._barcodeFind.listeners) {
                (_a = listener === null || listener === void 0 ? void 0 : listener.didPauseSearch) === null || _a === void 0 ? void 0 : _a.call(listener, foundItems);
            }
        });
        this.eventEmitter.on(BarcodeFindListenerEvents.onSearchStoppedEvent, (data) => {
            var _a;
            const foundItems = this.filterFoundItemsFromEvent(data);
            for (const listener of this._barcodeFind.listeners) {
                (_a = listener === null || listener === void 0 ? void 0 : listener.didStopSearch) === null || _a === void 0 ? void 0 : _a.call(listener, foundItems);
            }
        });
    }
    unsubscribeListeners() {
        this._proxy.unsubscribeBarcodeFindListener();
        this.eventEmitter.off(BarcodeFindListenerEvents.onSearchPausedEvent);
        this.eventEmitter.off(BarcodeFindListenerEvents.onSearchStartedEvent);
        this.eventEmitter.off(BarcodeFindListenerEvents.onSearchStoppedEvent);
        this.eventEmitter.off(BarcodeFindListenerEvents.onTransformBarcodeData);
    }
    dispose() {
        this.unsubscribeListeners();
    }
    updateFeedback(feedbackJson) {
        return this._proxy.updateFeedback(feedbackJson);
    }
}

class BarcodeFind extends core.DefaultSerializeable {
    constructor(dataCaptureContext, settings) {
        super();
        this.type = 'barcodeFind';
        this._feedback = BarcodeFindFeedback.defaultFeedback;
        this._enabled = true;
        this._isInCallback = false;
        this.itemsToFind = null;
        this._hasBarcodeTransformer = false;
        this.listeners = [];
        this.barcodeTransformer = null;
        this._settings = settings;
        this._controller = BarcodeFindController.forBarcodeFind(this);
        this._dataCaptureContext = dataCaptureContext;
        this._feedback.controller = this._controller;
        // No need to add the mode to the context
    }
    static forContext(dataCaptureContext, settings) {
        return new BarcodeFind(dataCaptureContext, settings);
    }
    static get barcodeFindDefaults() {
        return getBarcodeFindDefaults();
    }
    static get recommendedCameraSettings() {
        return BarcodeFind.barcodeFindDefaults.RecommendedCameraSettings;
    }
    get context() {
        return this._dataCaptureContext;
    }
    get isEnabled() {
        return this._enabled;
    }
    set isEnabled(value) {
        this._enabled = value;
        this._controller.setModeEnabledState(value);
    }
    get feedback() {
        return this._feedback;
    }
    set feedback(value) {
        this._feedback = value;
        this._feedback.controller = this._controller;
        this._controller.updateFeedback(JSON.stringify(value.toJSON()));
    }
    applySettings(settings) {
        this._settings = settings;
        return this.update();
    }
    addListener(listener) {
        this.checkAndSubscribeListeners();
        if (this.listeners.includes(listener)) {
            return;
        }
        this.listeners.push(listener);
    }
    checkAndSubscribeListeners() {
        if (this.listeners.length === 0) {
            this._controller.subscribeListeners();
        }
    }
    removeListener(listener) {
        if (!this.listeners.includes(listener)) {
            return;
        }
        this.listeners.splice(this.listeners.indexOf(listener));
        this.checkAndUnsubscribeListeners();
    }
    setBarcodeTransformer(barcodeTransformer) {
        this.barcodeTransformer = barcodeTransformer;
        this._hasBarcodeTransformer = this.barcodeTransformer != undefined;
        this._controller.setBarcodeTransformer();
    }
    checkAndUnsubscribeListeners() {
        if (this.listeners.length > 0) {
            return;
        }
        this._controller.unsubscribeListeners();
    }
    setItemList(items) {
        this.itemsToFind = JSON.stringify(items.map(item => item.toJSON()));
        return this._controller.setItemList(items);
    }
    start() {
        return this._controller.start();
    }
    pause() {
        return this._controller.pause();
    }
    stop() {
        return this._controller.stop();
    }
    update() {
        return this._controller.updateMode();
    }
    unsubscribeNativeListeners() {
        this._controller.dispose();
    }
}
__decorate([
    core.nameForSerialization('feedback')
], BarcodeFind.prototype, "_feedback", void 0);
__decorate([
    core.nameForSerialization('enabled')
], BarcodeFind.prototype, "_enabled", void 0);
__decorate([
    core.ignoreFromSerialization
], BarcodeFind.prototype, "_isInCallback", void 0);
__decorate([
    core.nameForSerialization('settings')
], BarcodeFind.prototype, "_settings", void 0);
__decorate([
    core.nameForSerialization('hasBarcodeTransformer')
], BarcodeFind.prototype, "_hasBarcodeTransformer", void 0);
__decorate([
    core.ignoreFromSerialization
], BarcodeFind.prototype, "listeners", void 0);
__decorate([
    core.ignoreFromSerialization
], BarcodeFind.prototype, "_controller", void 0);
__decorate([
    core.ignoreFromSerialization
], BarcodeFind.prototype, "_dataCaptureContext", void 0);
__decorate([
    core.ignoreFromSerialization
], BarcodeFind, "barcodeFindDefaults", null);

class BarcodeFindItem extends core.DefaultSerializeable {
    constructor(searchOptions, content) {
        super();
        this._searchOptions = searchOptions;
        this._content = content;
    }
    get searchOptions() {
        return this._searchOptions;
    }
    get content() {
        return this._content;
    }
}
__decorate([
    core.nameForSerialization('searchOptions')
], BarcodeFindItem.prototype, "_searchOptions", void 0);
__decorate([
    core.nameForSerialization('content')
], BarcodeFindItem.prototype, "_content", void 0);

class BarcodeFindItemContent extends core.DefaultSerializeable {
    constructor(info, additionalInfo, image) {
        super();
        this._info = info;
        this._additionalInfo = additionalInfo;
        this._image = image;
    }
    get info() {
        var _a;
        return (_a = this._info) !== null && _a !== void 0 ? _a : null;
    }
    get additionalInfo() {
        var _a;
        return (_a = this._additionalInfo) !== null && _a !== void 0 ? _a : null;
    }
    get image() {
        var _a;
        return (_a = this._image) !== null && _a !== void 0 ? _a : null;
    }
}
__decorate([
    core.nameForSerialization('info')
], BarcodeFindItemContent.prototype, "_info", void 0);
__decorate([
    core.nameForSerialization('additionalInfo')
], BarcodeFindItemContent.prototype, "_additionalInfo", void 0);
__decorate([
    core.nameForSerialization('image')
], BarcodeFindItemContent.prototype, "_image", void 0);

class BarcodeFindItemSearchOptions extends core.DefaultSerializeable {
    constructor(barcodeData) {
        super();
        this._barcodeData = barcodeData;
    }
    get barcodeData() {
        return this._barcodeData;
    }
}
__decorate([
    core.nameForSerialization("barcodeData")
], BarcodeFindItemSearchOptions.prototype, "_barcodeData", void 0);

class BarcodeFindSettings extends core.DefaultSerializeable {
    constructor() {
        super();
        this._symbologies = {};
        this._properties = {};
    }
    static get barcodeDefaults() {
        return getBarcodeDefaults();
    }
    settingsForSymbology(symbology) {
        const identifier = symbology.toString();
        if (!this._symbologies[identifier]) {
            const symbologySettings = BarcodeFindSettings.barcodeDefaults.SymbologySettings[identifier];
            this._symbologies[identifier] = symbologySettings;
        }
        return this._symbologies[identifier];
    }
    enableSymbologies(symbologies) {
        symbologies.forEach(symbology => this.enableSymbology(symbology, true));
    }
    enableSymbology(symbology, enabled) {
        this.settingsForSymbology(symbology).isEnabled = enabled;
    }
    get enabledSymbologies() {
        return Object.keys(this._symbologies)
            .filter(symbology => this._symbologies[symbology].isEnabled);
    }
    setProperty(name, value) {
        this._properties[name] = value;
    }
    getProperty(name) {
        return this._properties[name];
    }
}
__decorate([
    core.nameForSerialization('symbologies')
], BarcodeFindSettings.prototype, "_symbologies", void 0);
__decorate([
    core.nameForSerialization('properties')
], BarcodeFindSettings.prototype, "_properties", void 0);
__decorate([
    core.ignoreFromSerialization
], BarcodeFindSettings, "barcodeDefaults", null);

class BarcodeFindViewSettings extends core.DefaultSerializeable {
    constructor(inListItemColor, notInListItemColor, soundEnabled, hapticEnabled, hardwareTriggerEnabled, hardwareTriggerKeyCode) {
        super();
        this._inListItemColor = inListItemColor;
        this._notInListItemColor = notInListItemColor;
        this._soundEnabled = soundEnabled;
        this._hapticEnabled = hapticEnabled;
        this._hardwareTriggerEnabled = hardwareTriggerEnabled || false;
        this._hardwareTriggerKeyCode = hardwareTriggerKeyCode || null;
    }
    withHardwareTriggers(inListItemColor, notInListItemColor, soundEnabled, hapticEnabled, hardwareTriggerEnabled, hardwareTriggerKeyCode) {
        return new BarcodeFindViewSettings(inListItemColor, notInListItemColor, soundEnabled, hapticEnabled, hardwareTriggerEnabled, hardwareTriggerKeyCode);
    }
    get inListItemColor() {
        return this._inListItemColor;
    }
    get notInListItemColor() {
        return this._notInListItemColor;
    }
    get soundEnabled() {
        return this._soundEnabled;
    }
    get hapticEnabled() {
        return this._hapticEnabled;
    }
    get hardwareTriggerEnabled() {
        return this._hardwareTriggerEnabled;
    }
    get hardwareTriggerKeyCode() {
        return this._hardwareTriggerKeyCode;
    }
}
__decorate([
    core.nameForSerialization('inListItemColor')
], BarcodeFindViewSettings.prototype, "_inListItemColor", void 0);
__decorate([
    core.nameForSerialization('notInListItemColor')
], BarcodeFindViewSettings.prototype, "_notInListItemColor", void 0);
__decorate([
    core.nameForSerialization('soundEnabled')
], BarcodeFindViewSettings.prototype, "_soundEnabled", void 0);
__decorate([
    core.nameForSerialization('hapticEnabled')
], BarcodeFindViewSettings.prototype, "_hapticEnabled", void 0);
__decorate([
    core.nameForSerialization('hardwareTriggerEnabled')
], BarcodeFindViewSettings.prototype, "_hardwareTriggerEnabled", void 0);
__decorate([
    core.nameForSerialization('hardwareTriggerKeyCode')
], BarcodeFindViewSettings.prototype, "_hardwareTriggerKeyCode", void 0);

var BarcodeFindViewEvents;
(function (BarcodeFindViewEvents) {
    BarcodeFindViewEvents["onFinishButtonTappedEventName"] = "BarcodeFindViewUiListener.onFinishButtonTapped";
})(BarcodeFindViewEvents || (BarcodeFindViewEvents = {}));
class BarcodeFindViewController extends core.BaseController {
    constructor() {
        super('BarcodeFindViewProxy');
        this.autoCreateNativeView = true;
        this.isListenerEnabled = false;
    }
    static forBarcodeFindView(baseView, nativeView, autoCreateNativeView = true) {
        const viewController = new BarcodeFindViewController();
        viewController.baseView = baseView;
        viewController.nativeView = nativeView;
        viewController.autoCreateNativeView = autoCreateNativeView;
        viewController.initialize();
        return viewController;
    }
    setUiListener(listener) {
        return __awaiter(this, void 0, void 0, function* () {
            if (listener && !this.isListenerEnabled) {
                this.isListenerEnabled = true;
                this.subscribeToEvents();
            }
            if (listener == null) {
                this.isListenerEnabled = false;
                this.unsubscribeToEvents();
            }
        });
    }
    viewPaused() {
        return this._proxy.onPause();
    }
    viewResumed() {
        return this._proxy.onResume();
    }
    startSearching() {
        return this._proxy.startSearching();
    }
    stopSearching() {
        return this._proxy.stopSearching();
    }
    pauseSearching() {
        return this._proxy.pauseSearching();
    }
    updateView() {
        const barcodeFindViewJson = this.baseView.toJSON();
        return this._proxy.updateView(JSON.stringify(barcodeFindViewJson));
    }
    showView() {
        return this._proxy.showView();
    }
    hideView() {
        return this._proxy.hideView();
    }
    createNativeView() {
        return this.create();
    }
    removeNativeView() {
        var _a, _b, _c;
        return (_c = (_b = (_a = this._proxy).removeView) === null || _b === void 0 ? void 0 : _b.call(_a)) !== null && _c !== void 0 ? _c : Promise.resolve();
    }
    create() {
        const barcodeFindView = this.baseView.toJSON();
        const json = JSON.stringify(barcodeFindView);
        const id = this._proxy.findNodeHandle(this.nativeView);
        return this._proxy.createView(id, json);
    }
    initialize() {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.baseView.context.update();
            if (this.autoCreateNativeView) {
                yield this.create();
            }
        });
    }
    subscribeToEvents() {
        this._proxy.subscribeBarcodeFindViewListener();
        this.eventEmitter.on(BarcodeFindViewEvents.onFinishButtonTappedEventName, (data) => {
            var _a, _b;
            if (!this.baseView.barcodeFindViewUiListener) {
                return;
            }
            const { foundItems: barcodeFindItems = [] } = JSON.parse(data);
            (_b = (_a = this.baseView) === null || _a === void 0 ? void 0 : _a.barcodeFindViewUiListener) === null || _b === void 0 ? void 0 : _b.didTapFinishButton(barcodeFindItems);
        });
    }
    unsubscribeToEvents() {
        this._proxy.unsubscribeBarcodeFindViewListener();
        this.eventEmitter.off(BarcodeFindViewEvents.onFinishButtonTappedEventName);
    }
    dispose() {
        this.unsubscribeToEvents();
    }
}
__decorate([
    core.ignoreFromSerialization
], BarcodeFindViewController.prototype, "autoCreateNativeView", void 0);

class BaseBarcodeFindView {
    get barcodeFindViewUiListener() {
        return this._barcodeFindViewUiListener;
    }
    set barcodeFindViewUiListener(value) {
        this._barcodeFindViewUiListener = value;
        this.controller.setUiListener(value);
    }
    get context() {
        return this._dataCaptureContext;
    }
    constructor(context, barcodeFind, barcodeFindViewSettings, cameraSettings, autoCreateNativeView = true) {
        this.isViewCreated = false;
        this.autoCreateNativeView = true;
        this._startSearching = false;
        this._isInitialized = false;
        this._barcodeFindViewUiListener = null;
        this._dataCaptureContext = context;
        this._barcodeFind = barcodeFind;
        this._barcodeFindViewSettings = barcodeFindViewSettings;
        this._cameraSettings = cameraSettings;
        this.isViewCreated = autoCreateNativeView;
        this.autoCreateNativeView = autoCreateNativeView;
    }
    initialize(nativeView) {
        this.controller = BarcodeFindViewController.forBarcodeFindView(this, nativeView, this.autoCreateNativeView);
        this._isInitialized = true;
    }
    static forMode(dataCaptureContext, barcodeFind) {
        return new BaseBarcodeFindView(dataCaptureContext, barcodeFind);
    }
    static forModeWithViewSettings(dataCaptureContext, barcodeFind, viewSettings) {
        return new BaseBarcodeFindView(dataCaptureContext, barcodeFind, viewSettings);
    }
    static forModeWithViewSettingsAndCameraSettings(dataCaptureContext, barcodeFind, viewSettings, cameraSettings) {
        return new BaseBarcodeFindView(dataCaptureContext, barcodeFind, viewSettings, cameraSettings);
    }
    static get barcodeFindViewDefaults() {
        return getBarcodeFindDefaults().BarcodeFindView;
    }
    viewPaused() {
        return this.controller.viewPaused();
    }
    viewResumed() {
        return this.controller.viewResumed();
    }
    stopSearching() {
        this._startSearching = false;
        return this.controller.stopSearching();
    }
    startSearching() {
        this._startSearching = true;
        return this.controller.startSearching();
    }
    pauseSearching() {
        this._startSearching = false;
        return this.controller.pauseSearching();
    }
    show() {
        return this.controller.showView();
    }
    hide() {
        return this.controller.hideView();
    }
    static get hardwareTriggerSupported() {
        return BaseBarcodeFindView.barcodeFindViewDefaults.hardwareTriggerSupported;
    }
    createNativeView() {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.isViewCreated) {
                return Promise.resolve();
            }
            yield this.controller.createNativeView();
            this.isViewCreated = true;
        });
    }
    removeNativeView() {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.controller.removeNativeView();
            this.isViewCreated = false;
        });
    }
    get shouldShowUserGuidanceView() {
        return BaseBarcodeFindView.barcodeFindViewDefaults.shouldShowUserGuidanceView;
    }
    set shouldShowUserGuidanceView(value) {
        BaseBarcodeFindView.barcodeFindViewDefaults.shouldShowUserGuidanceView = value;
        this.update();
    }
    get shouldShowHints() {
        return BaseBarcodeFindView.barcodeFindViewDefaults.shouldShowHints;
    }
    set shouldShowHints(value) {
        BaseBarcodeFindView.barcodeFindViewDefaults.shouldShowHints = value;
        this.update();
    }
    get shouldShowCarousel() {
        return BaseBarcodeFindView.barcodeFindViewDefaults.shouldShowCarousel;
    }
    set shouldShowCarousel(value) {
        BaseBarcodeFindView.barcodeFindViewDefaults.shouldShowCarousel = value;
        this.update();
    }
    get shouldShowPauseButton() {
        return BaseBarcodeFindView.barcodeFindViewDefaults.shouldShowPauseButton;
    }
    set shouldShowPauseButton(value) {
        BaseBarcodeFindView.barcodeFindViewDefaults.shouldShowPauseButton = value;
        this.update();
    }
    get shouldShowFinishButton() {
        return BaseBarcodeFindView.barcodeFindViewDefaults.shouldShowFinishButton;
    }
    set shouldShowFinishButton(value) {
        BaseBarcodeFindView.barcodeFindViewDefaults.shouldShowFinishButton = value;
        this.update();
    }
    get shouldShowProgressBar() {
        return BaseBarcodeFindView.barcodeFindViewDefaults.shouldShowProgressBar;
    }
    set shouldShowProgressBar(value) {
        BaseBarcodeFindView.barcodeFindViewDefaults.shouldShowProgressBar = value;
        this.update();
    }
    get shouldShowTorchControl() {
        return BaseBarcodeFindView.barcodeFindViewDefaults.shouldShowTorchControl;
    }
    set shouldShowTorchControl(value) {
        BaseBarcodeFindView.barcodeFindViewDefaults.shouldShowTorchControl = value;
        this.update();
    }
    get shouldShowZoomControl() {
        return BaseBarcodeFindView.barcodeFindViewDefaults.shouldShowZoomControl;
    }
    set shouldShowZoomControl(value) {
        BaseBarcodeFindView.barcodeFindViewDefaults.shouldShowZoomControl = value;
        this.update();
    }
    get torchControlPosition() {
        return BaseBarcodeFindView.barcodeFindViewDefaults.torchControlPosition;
    }
    set torchControlPosition(value) {
        BaseBarcodeFindView.barcodeFindViewDefaults.torchControlPosition = value;
        this.update();
    }
    get textForCollapseCardsButton() {
        return BaseBarcodeFindView.barcodeFindViewDefaults.textForCollapseCardsButton;
    }
    set textForCollapseCardsButton(value) {
        BaseBarcodeFindView.barcodeFindViewDefaults.textForCollapseCardsButton = value;
        this.update();
    }
    get textForAllItemsFoundSuccessfullyHint() {
        return BaseBarcodeFindView.barcodeFindViewDefaults.textForAllItemsFoundSuccessfullyHint;
    }
    set textForAllItemsFoundSuccessfullyHint(value) {
        BaseBarcodeFindView.barcodeFindViewDefaults.textForAllItemsFoundSuccessfullyHint = value;
        this.update();
    }
    get textForItemListUpdatedHint() {
        return BaseBarcodeFindView.barcodeFindViewDefaults.textForItemListUpdatedHint;
    }
    set textForItemListUpdatedHint(value) {
        BaseBarcodeFindView.barcodeFindViewDefaults.textForItemListUpdatedHint = value;
        this.update();
    }
    get textForItemListUpdatedWhenPausedHint() {
        return BaseBarcodeFindView.barcodeFindViewDefaults.textForItemListUpdatedWhenPausedHint;
    }
    set textForItemListUpdatedWhenPausedHint(value) {
        BaseBarcodeFindView.barcodeFindViewDefaults.textForItemListUpdatedWhenPausedHint = value;
        this.update();
    }
    get textForPointAtBarcodesToSearchHint() {
        return BaseBarcodeFindView.barcodeFindViewDefaults.textForPointAtBarcodesToSearchHint;
    }
    set textForPointAtBarcodesToSearchHint(value) {
        BaseBarcodeFindView.barcodeFindViewDefaults.textForPointAtBarcodesToSearchHint = value;
        this.update();
    }
    get textForMoveCloserToBarcodesHint() {
        return BaseBarcodeFindView.barcodeFindViewDefaults.textForMoveCloserToBarcodesHint;
    }
    set textForMoveCloserToBarcodesHint(value) {
        BaseBarcodeFindView.barcodeFindViewDefaults.textForMoveCloserToBarcodesHint = value;
        this.update();
    }
    get textForTapShutterToPauseScreenHint() {
        return BaseBarcodeFindView.barcodeFindViewDefaults.textForTapShutterToPauseScreenHint;
    }
    set textForTapShutterToPauseScreenHint(value) {
        BaseBarcodeFindView.barcodeFindViewDefaults.textForTapShutterToPauseScreenHint = value;
        this.update();
    }
    get textForTapShutterToResumeSearchHint() {
        return BaseBarcodeFindView.barcodeFindViewDefaults.textForTapShutterToResumeSearchHint;
    }
    set textForTapShutterToResumeSearchHint(value) {
        BaseBarcodeFindView.barcodeFindViewDefaults.textForTapShutterToResumeSearchHint = value;
        this.update();
    }
    update() {
        if (!this._isInitialized) {
            return Promise.resolve();
        }
        return this.controller.updateView();
    }
    dispose() {
        this.controller.dispose();
        this._barcodeFind.unsubscribeNativeListeners();
        this.isViewCreated = false;
    }
    toJSON() {
        var _a, _b, _c;
        const json = {
            View: {
                shouldShowUserGuidanceView: this.shouldShowUserGuidanceView,
                shouldShowHints: this.shouldShowHints,
                shouldShowCarousel: this.shouldShowCarousel,
                shouldShowPauseButton: this.shouldShowPauseButton,
                shouldShowFinishButton: this.shouldShowFinishButton,
                shouldShowProgressBar: this.shouldShowProgressBar,
                shouldShowTorchControl: this.shouldShowTorchControl,
                torchControlPosition: (_a = this.torchControlPosition) === null || _a === void 0 ? void 0 : _a.toString(),
                textForCollapseCardsButton: this.textForCollapseCardsButton,
                textForAllItemsFoundSuccessfullyHint: this.textForAllItemsFoundSuccessfullyHint,
                textForItemListUpdatedHint: this.textForItemListUpdatedHint,
                textForItemListUpdatedWhenPausedHint: this.textForItemListUpdatedWhenPausedHint,
                textForPointAtBarcodesToSearchHint: this.textForPointAtBarcodesToSearchHint,
                textForMoveCloserToBarcodesHint: this.textForMoveCloserToBarcodesHint,
                textForTapShutterToPauseScreenHint: this.textForTapShutterToPauseScreenHint,
                textForTapShutterToResumeSearchHint: this.textForTapShutterToResumeSearchHint,
                startSearching: this._startSearching,
                viewSettings: undefined,
                CameraSettings: undefined
            },
            BarcodeFind: this._barcodeFind.toJSON()
        };
        if (this._barcodeFindViewSettings != null) {
            json.View.viewSettings = (_b = this._barcodeFindViewSettings) === null || _b === void 0 ? void 0 : _b.toJSON();
        }
        if (this._cameraSettings != null) {
            json.View.cameraSettings = (_c = this._cameraSettings) === null || _c === void 0 ? void 0 : _c.toJSON();
        }
        return json;
    }
}
__decorate([
    core.ignoreFromSerialization
], BaseBarcodeFindView.prototype, "isViewCreated", void 0);
__decorate([
    core.ignoreFromSerialization
], BaseBarcodeFindView.prototype, "autoCreateNativeView", void 0);

class BarcodeGeneratorCreationOptions {
    constructor(backgroundColor = null, foregroundColor = null, errorCorrectionLevel = null, versionNumber = null, minimumErrorCorrectionPercent = null, layers = null) {
        this.backgroundColor = backgroundColor;
        this.foregroundColor = foregroundColor;
        this.errorCorrectionLevel = errorCorrectionLevel;
        this.versionNumber = versionNumber;
        this.minimumErrorCorrectionPercent = minimumErrorCorrectionPercent;
        this.layers = layers;
    }
}

class BarcodeGeneratorBuilder {
    constructor(type, dataCaptureContext) {
        this.options = new BarcodeGeneratorCreationOptions();
        this.type = type;
        this.dataCaptureContext = dataCaptureContext;
    }
    withBackgroundColor(color) {
        this.options.backgroundColor = color;
        return this;
    }
    withForegroundColor(color) {
        this.options.foregroundColor = color;
        return this;
    }
    build() {
        return BarcodeGenerator.create(this.type, this.options, this.dataCaptureContext);
    }
}

class Code39BarcodeGeneratorBuilder extends BarcodeGeneratorBuilder {
    constructor(dataCaptureContext) {
        super('code39Generator', dataCaptureContext);
    }
}

class Code128BarcodeGeneratorBuilder extends BarcodeGeneratorBuilder {
    constructor(dataCaptureContext) {
        super('code128Generator', dataCaptureContext);
    }
}

class Ean13BarcodeGeneratorBuilder extends BarcodeGeneratorBuilder {
    constructor(dataCaptureContext) {
        super('ean13Generator', dataCaptureContext);
    }
}

class UpcaBarcodeGeneratorBuilder extends BarcodeGeneratorBuilder {
    constructor(dataCaptureContext) {
        super('upcaGenerator', dataCaptureContext);
    }
}

class InterleavedTwoOfFiveBarcodeGeneratorBuilder extends BarcodeGeneratorBuilder {
    constructor(dataCaptureContext) {
        super('interleavedTwoOfFiveGenerator', dataCaptureContext);
    }
}

class QrCodeBarcodeGeneratorBuilder extends BarcodeGeneratorBuilder {
    constructor(dataCaptureContext) {
        super('qrCodeGenerator', dataCaptureContext);
    }
    withErrorCorrectionLevel(errorCorrectionLevel) {
        this.options.errorCorrectionLevel = errorCorrectionLevel;
        return this;
    }
    withVersionNumber(versionNumber) {
        this.options.versionNumber = versionNumber;
        return this;
    }
}

class DataMatrixBarcodeGeneratorBuilder extends BarcodeGeneratorBuilder {
    constructor(dataCaptureContext) {
        super('dataMatrixGenerator', dataCaptureContext);
    }
}

class BarcodeGeneratorController {
    get _proxy() {
        return core.FactoryMaker.getInstance('BarcodeGeneratorProxy');
    }
    static forBarcodeGenerator(generator) {
        const controller = new BarcodeGeneratorController();
        controller.generator = generator;
        return controller;
    }
    initialize() {
        return __awaiter(this, void 0, void 0, function* () {
            // We call update because it returns a promise, this guarantees, that by the time
            // we need the deserialized context, it will be set in the native layer.
            yield this.generator.dataCaptureContext.update();
            yield this.create();
        });
    }
    create() {
        return this._proxy.create(JSON.stringify(this.generator.toJSON()));
    }
    generateFromBase64EncodedData(data, imageWidth) {
        return __awaiter(this, void 0, void 0, function* () {
            const result = yield this._proxy.generateFromBase64EncodedData(this.generator.id, data, imageWidth);
            if (result == null) {
                return '';
            }
            return result.data;
        });
    }
    generate(text, imageWidth) {
        return __awaiter(this, void 0, void 0, function* () {
            const result = yield this._proxy.generate(this.generator.id, text, imageWidth);
            if (result == null) {
                return '';
            }
            return result.data;
        });
    }
    dispose() {
        return this._proxy.dispose(this.generator.id);
    }
}

class AztecBarcodeGeneratorBuilder extends BarcodeGeneratorBuilder {
    constructor(dataCaptureContext) {
        super('aztecGenerator', dataCaptureContext);
    }
    withMinimumErrorCorrectionPercent(minimumErrorCorrectionPercent) {
        this.options.minimumErrorCorrectionPercent = minimumErrorCorrectionPercent;
        return this;
    }
    withLayers(layers) {
        this.options.layers = layers;
        return this;
    }
}

class BarcodeGenerator extends core.DefaultSerializeable {
    get id() {
        return this._id;
    }
    constructor(dataCaptureContext, type, backgroundColor, foregroundColor, errorCorrectionLevel, versionNumber) {
        super();
        this._id = `${Date.now()}`;
        this.errorCorrectionLevel = null;
        this.initializationPromise = undefined;
        this.dataCaptureContext = dataCaptureContext;
        this.type = type;
        this.backgroundColor = backgroundColor;
        this.foregroundColor = foregroundColor;
        this.errorCorrectionLevel = errorCorrectionLevel;
        this.versionNumber = versionNumber;
    }
    initialize() {
        return __awaiter(this, void 0, void 0, function* () {
            this.controller = BarcodeGeneratorController.forBarcodeGenerator(this);
            this.initializationPromise = this.controller.initialize();
            return this.initializationPromise;
        });
    }
    static create(type, options, dataCaptureContext) {
        const generator = new BarcodeGenerator(dataCaptureContext, type, options.backgroundColor, options.backgroundColor, options.errorCorrectionLevel, options.versionNumber);
        generator.initialize();
        return generator;
    }
    generate(text, imageWidth) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.initializationPromise;
            return this.controller.generate(text, imageWidth);
        });
    }
    generateFromBase64EncodedData(data, imageWidth) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.initializationPromise;
            return this.controller.generateFromBase64EncodedData(data, imageWidth);
        });
    }
    dispose() {
        this.controller.dispose();
    }
    static code39BarcodeGeneratorBuilder(dataCaptureContext) {
        return new Code39BarcodeGeneratorBuilder(dataCaptureContext);
    }
    static code128BarcodeGeneratorBuilder(dataCaptureContext) {
        return new Code128BarcodeGeneratorBuilder(dataCaptureContext);
    }
    static ean13BarcodeGeneratorBuilder(dataCaptureContext) {
        return new Ean13BarcodeGeneratorBuilder(dataCaptureContext);
    }
    static upcaBarcodeGeneratorBuilder(dataCaptureContext) {
        return new UpcaBarcodeGeneratorBuilder(dataCaptureContext);
    }
    static interleavedTwoOfFiveBarcodeGeneratorBuilder(dataCaptureContext) {
        return new InterleavedTwoOfFiveBarcodeGeneratorBuilder(dataCaptureContext);
    }
    static qrCodeBarcodeGeneratorBuilder(dataCaptureContext) {
        return new QrCodeBarcodeGeneratorBuilder(dataCaptureContext);
    }
    static dataMatrixBarcodeGeneratorBuilder(dataCaptureContext) {
        return new DataMatrixBarcodeGeneratorBuilder(dataCaptureContext);
    }
    static aztecBarcodeGeneratorBuilder(dataCaptureContext) {
        return new AztecBarcodeGeneratorBuilder(dataCaptureContext);
    }
}
__decorate([
    core.nameForSerialization('id')
], BarcodeGenerator.prototype, "_id", void 0);
__decorate([
    core.ignoreFromSerialization
], BarcodeGenerator.prototype, "dataCaptureContext", void 0);
__decorate([
    core.ignoreFromSerialization
], BarcodeGenerator.prototype, "controller", void 0);

exports.QrCodeErrorCorrectionLevel = void 0;
(function (QrCodeErrorCorrectionLevel) {
    QrCodeErrorCorrectionLevel["Low"] = "low";
    QrCodeErrorCorrectionLevel["Medium"] = "medium";
    QrCodeErrorCorrectionLevel["Quartile"] = "quartile";
    QrCodeErrorCorrectionLevel["High"] = "high";
})(exports.QrCodeErrorCorrectionLevel || (exports.QrCodeErrorCorrectionLevel = {}));

class DataCaptureVersion {
    static get pluginVersion() {
        return pluginsMetadata['scandit-cordova-datacapture-core'];
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
        this._htmlElementState = new core.HTMLElementState();
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
            this.htmlElementState = new core.HTMLElementState();
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
        return __awaiter$1(this, arguments, void 0, function* (frame, isUnderContent = false) {
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
            this.htmlElementState = new core.HTMLElementState();
            return;
        }
        const newState = new core.HTMLElementState();
        const boundingRect = this.htmlElement.getBoundingClientRect();
        newState.position = new core.HtmlElementPosition(boundingRect.top, boundingRect.left);
        newState.size = new core.HtmlElementSize(boundingRect.width, boundingRect.height);
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
__decorate$1([
    core.ignoreFromSerialization
], DataCaptureView.prototype, "baseDataCaptureView", void 0);
__decorate$1([
    core.ignoreFromSerialization
], DataCaptureView.prototype, "htmlElement", void 0);
__decorate$1([
    core.ignoreFromSerialization
], DataCaptureView.prototype, "_htmlElementState", void 0);
__decorate$1([
    core.ignoreFromSerialization
], DataCaptureView.prototype, "scrollListener", void 0);
__decorate$1([
    core.ignoreFromSerialization
], DataCaptureView.prototype, "domObserver", void 0);
__decorate$1([
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
exports.OpenSourceSoftwareLicenseInfo = core.OpenSourceSoftwareLicenseInfo;
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
exports.AztecBarcodeGeneratorBuilder = AztecBarcodeGeneratorBuilder;
exports.BarcodeGenerator = BarcodeGenerator;
exports.BarcodeGeneratorBuilder = BarcodeGeneratorBuilder;
exports.Code128BarcodeGeneratorBuilder = Code128BarcodeGeneratorBuilder;
exports.Code39BarcodeGeneratorBuilder = Code39BarcodeGeneratorBuilder;
exports.CordovaError = CordovaError;
exports.CordovaNativeCaller = CordovaNativeCaller;
exports.DataCaptureVersion = DataCaptureVersion;
exports.DataCaptureView = DataCaptureView;
exports.DataMatrixBarcodeGeneratorBuilder = DataMatrixBarcodeGeneratorBuilder;
exports.Ean13BarcodeGeneratorBuilder = Ean13BarcodeGeneratorBuilder;
exports.InterleavedTwoOfFiveBarcodeGeneratorBuilder = InterleavedTwoOfFiveBarcodeGeneratorBuilder;
exports.QrCodeBarcodeGeneratorBuilder = QrCodeBarcodeGeneratorBuilder;
exports.UpcaBarcodeGeneratorBuilder = UpcaBarcodeGeneratorBuilder;
exports.cordovaExec = cordovaExec;
exports.createCordovaNativeCaller = createCordovaNativeCaller;
exports.initializePlugin = initializePlugin;
exports.pluginsMetadata = pluginsMetadata;
