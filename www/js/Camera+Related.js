"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
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
var PrivateCameraProperty;
(function (PrivateCameraProperty) {
    PrivateCameraProperty["CameraAPI"] = "api";
})(PrivateCameraProperty || (PrivateCameraProperty = {}));
class CameraSettings extends Serializeable_1.DefaultSerializeable {
    constructor(settings) {
        super();
        this.preferredResolution = Cordova_1.Cordova.defaults.Camera.Settings.preferredResolution;
        this.maxFrameRate = Cordova_1.Cordova.defaults.Camera.Settings.maxFrameRate;
        this.zoomFactor = Cordova_1.Cordova.defaults.Camera.Settings.zoomFactor;
        this.api = 1;
        this.focus = {
            range: Cordova_1.Cordova.defaults.Camera.Settings.focusRange,
        };
        if (settings !== undefined && settings !== null) {
            Object.getOwnPropertyNames(settings).forEach(propertyName => {
                this[propertyName] = settings[propertyName];
            });
        }
    }
    get focusRange() {
        return this.focus.range;
    }
    set focusRange(newRange) {
        this.focus.range = newRange;
    }
    static fromJSON(json) {
        const settings = new CameraSettings();
        settings.preferredResolution = json.preferredResolution;
        settings.maxFrameRate = json.maxFrameRate;
        settings.zoomFactor = json.zoomFactor;
        settings.focusRange = json.focusRange;
        if (json.api !== undefined && json.api !== null) {
            settings.api = json.api;
        }
        return settings;
    }
    setProperty(name, value) {
        this[name] = value;
    }
    getProperty(name) {
        return this[name];
    }
}
exports.CameraSettings = CameraSettings;
