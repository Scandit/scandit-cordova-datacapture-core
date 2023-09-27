"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PrivateFrameData = exports.ImageBuffer = exports.CameraSettings = exports.FocusGestureStrategy = exports.FocusRange = exports.VideoResolution = exports.CameraPosition = exports.TorchState = exports.FrameSourceState = void 0;
/// <amd-module name="scandit-cordova-datacapture-core.Camera+Related"/>
// ^ needed because Cordova can't resolve "../xx" style dependencies
const Cordova_1 = require("scandit-cordova-datacapture-core.Cordova");
const Serializeable_1 = require("scandit-cordova-datacapture-core.Serializeable");
var FrameSourceState;
(function (FrameSourceState) {
    FrameSourceState["On"] = "on";
    FrameSourceState["Off"] = "off";
    FrameSourceState["Starting"] = "starting";
    FrameSourceState["Stopping"] = "stopping";
    FrameSourceState["Standby"] = "standby";
    FrameSourceState["BootingUp"] = "bootingUp";
    FrameSourceState["WakingUp"] = "wakingUp";
    FrameSourceState["GoingToSleep"] = "goingToSleep";
    FrameSourceState["ShuttingDown"] = "shuttingDown";
})(FrameSourceState = exports.FrameSourceState || (exports.FrameSourceState = {}));
var TorchState;
(function (TorchState) {
    TorchState["On"] = "on";
    TorchState["Off"] = "off";
    TorchState["Auto"] = "auto";
})(TorchState = exports.TorchState || (exports.TorchState = {}));
var CameraPosition;
(function (CameraPosition) {
    CameraPosition["WorldFacing"] = "worldFacing";
    CameraPosition["UserFacing"] = "userFacing";
    CameraPosition["Unspecified"] = "unspecified";
})(CameraPosition = exports.CameraPosition || (exports.CameraPosition = {}));
var VideoResolution;
(function (VideoResolution) {
    VideoResolution["Auto"] = "auto";
    VideoResolution["HD"] = "hd";
    VideoResolution["FullHD"] = "fullHd";
    VideoResolution["UHD4K"] = "uhd4k";
})(VideoResolution = exports.VideoResolution || (exports.VideoResolution = {}));
var FocusRange;
(function (FocusRange) {
    FocusRange["Full"] = "full";
    FocusRange["Near"] = "near";
    FocusRange["Far"] = "far";
})(FocusRange = exports.FocusRange || (exports.FocusRange = {}));
var FocusGestureStrategy;
(function (FocusGestureStrategy) {
    FocusGestureStrategy["None"] = "none";
    FocusGestureStrategy["Manual"] = "manual";
    FocusGestureStrategy["ManualUntilCapture"] = "manualUntilCapture";
    FocusGestureStrategy["AutoOnLocation"] = "autoOnLocation";
})(FocusGestureStrategy = exports.FocusGestureStrategy || (exports.FocusGestureStrategy = {}));
class CameraSettings extends Serializeable_1.DefaultSerializeable {
    get focusRange() {
        return this.focus.range;
    }
    set focusRange(newRange) {
        this.focus.range = newRange;
    }
    get focusGestureStrategy() {
        return this.focus.focusGestureStrategy;
    }
    set focusGestureStrategy(newStrategy) {
        this.focus.focusGestureStrategy = newStrategy;
    }
    get shouldPreferSmoothAutoFocus() {
        return this.focus.shouldPreferSmoothAutoFocus;
    }
    set shouldPreferSmoothAutoFocus(newShouldPreferSmoothAutoFocus) {
        this.focus.shouldPreferSmoothAutoFocus = newShouldPreferSmoothAutoFocus;
    }
    get maxFrameRate() {
        // tslint:disable-next-line:no-console
        console.warn('maxFrameRate is deprecated');
        return 0;
    }
    set maxFrameRate(newValue) {
        // tslint:disable-next-line:no-console
        console.warn('maxFrameRate is deprecated');
    }
    static fromJSON(json) {
        const settings = new CameraSettings();
        settings.preferredResolution = json.preferredResolution;
        settings.zoomFactor = json.zoomFactor;
        settings.focusRange = json.focusRange;
        settings.zoomGestureZoomFactor = json.zoomGestureZoomFactor;
        settings.focusGestureStrategy = json.focusGestureStrategy;
        settings.shouldPreferSmoothAutoFocus = json.shouldPreferSmoothAutoFocus;
        if (json.properties != undefined) {
            for (const key of Object.keys(json.properties)) {
                settings.setProperty(key, json.properties[key]);
            }
        }
        return settings;
    }
    constructor(settings) {
        super();
        this.focusHiddenProperties = [
            'range',
            'manualLensPosition',
            'shouldPreferSmoothAutoFocus',
            'focusStrategy',
            'focusGestureStrategy'
        ];
        this.preferredResolution = Cordova_1.Cordova.defaults.Camera.Settings.preferredResolution;
        this.zoomFactor = Cordova_1.Cordova.defaults.Camera.Settings.zoomFactor;
        this.zoomGestureZoomFactor = Cordova_1.Cordova.defaults.Camera.Settings.zoomGestureZoomFactor;
        this.focus = {
            range: Cordova_1.Cordova.defaults.Camera.Settings.focusRange,
            focusGestureStrategy: Cordova_1.Cordova.defaults.Camera.Settings.focusGestureStrategy,
            shouldPreferSmoothAutoFocus: Cordova_1.Cordova.defaults.Camera.Settings.shouldPreferSmoothAutoFocus,
        };
        if (settings !== undefined && settings !== null) {
            Object.getOwnPropertyNames(settings).forEach(propertyName => {
                this[propertyName] = settings[propertyName];
            });
        }
    }
    setProperty(name, value) {
        if (this.focusHiddenProperties.includes(name)) {
            this.focus[name] = value;
            return;
        }
        this[name] = value;
    }
    getProperty(name) {
        if (this.focusHiddenProperties.includes(name)) {
            return this.focus[name];
        }
        return this[name];
    }
}
__decorate([
    Serializeable_1.ignoreFromSerialization
], CameraSettings.prototype, "focusHiddenProperties", void 0);
exports.CameraSettings = CameraSettings;
class ImageBuffer {
    get width() {
        return this._width;
    }
    get height() {
        return this._height;
    }
    get data() {
        return this._data;
    }
}
exports.ImageBuffer = ImageBuffer;
class PrivateFrameData {
    get imageBuffers() {
        return this._imageBuffers;
    }
    get orientation() {
        return this._orientation;
    }
    static fromJSON(json) {
        const frameData = new PrivateFrameData();
        frameData._imageBuffers = json.imageBuffers.map((imageBufferJSON) => {
            const imageBuffer = new ImageBuffer();
            imageBuffer._width = imageBufferJSON.width;
            imageBuffer._height = imageBufferJSON.height;
            imageBuffer._data = imageBufferJSON.data;
            return imageBuffer;
        });
        frameData._orientation = json.orientation;
        return frameData;
    }
}
exports.PrivateFrameData = PrivateFrameData;
