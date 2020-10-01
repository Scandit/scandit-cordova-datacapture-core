"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
/// <amd-module name="scandit-cordova-datacapture-core.Viewfinder"/>
// ^ needed because Cordova can't resolve "../xx" style dependencies
const Common_1 = require("scandit-cordova-datacapture-core.Common");
const Cordova_1 = require("scandit-cordova-datacapture-core.Cordova");
const Serializeable_1 = require("scandit-cordova-datacapture-core.Serializeable");
class Brush extends Serializeable_1.DefaultSerializeable {
    constructor(fillColor = Cordova_1.Cordova.defaults.Brush.fillColor, strokeColor = Cordova_1.Cordova.defaults.Brush.strokeColor, strokeWidth = Cordova_1.Cordova.defaults.Brush.strokeWidth) {
        super();
        this.fill = { color: fillColor };
        this.stroke = { color: strokeColor, width: strokeWidth };
    }
    static get transparent() {
        const transparentBlack = Common_1.Color.fromRGBA(255, 255, 255, 0);
        return new Brush(transparentBlack, transparentBlack, 0);
    }
    get fillColor() {
        return this.fill.color;
    }
    get strokeColor() {
        return this.stroke.color;
    }
    get strokeWidth() {
        return this.stroke.width;
    }
}
exports.Brush = Brush;
// tslint:disable-next-line:variable-name
exports.NoViewfinder = { type: 'none' };
class LaserlineViewfinder extends Serializeable_1.DefaultSerializeable {
    constructor() {
        super();
        this.type = 'laserline';
        this.width = Cordova_1.Cordova.defaults.LaserlineViewfinder.width;
        this.enabledColor = Cordova_1.Cordova.defaults.LaserlineViewfinder.enabledColor;
        this.disabledColor = Cordova_1.Cordova.defaults.LaserlineViewfinder.disabledColor;
    }
}
exports.LaserlineViewfinder = LaserlineViewfinder;
class RectangularViewfinder extends Serializeable_1.DefaultSerializeable {
    constructor() {
        super();
        this.type = 'rectangular';
        this._sizeWithUnitAndAspect = Cordova_1.Cordova.defaults.RectangularViewfinder.size;
        this.color = Cordova_1.Cordova.defaults.RectangularViewfinder.color;
    }
    get sizeWithUnitAndAspect() {
        return this._sizeWithUnitAndAspect;
    }
    setSize(size) {
        this._sizeWithUnitAndAspect = Common_1.SizeWithUnitAndAspect.sizeWithWidthAndHeight(size);
    }
    setWidthAndAspectRatio(width, heightToWidthAspectRatio) {
        this._sizeWithUnitAndAspect = Common_1.SizeWithUnitAndAspect.sizeWithWidthAndAspectRatio(width, heightToWidthAspectRatio);
    }
    setHeightAndAspectRatio(height, widthToHeightAspectRatio) {
        this._sizeWithUnitAndAspect = Common_1.SizeWithUnitAndAspect.sizeWithHeightAndAspectRatio(height, widthToHeightAspectRatio);
    }
}
__decorate([
    Serializeable_1.nameForSerialization('size')
], RectangularViewfinder.prototype, "_sizeWithUnitAndAspect", void 0);
exports.RectangularViewfinder = RectangularViewfinder;
class SpotlightViewfinder extends Serializeable_1.DefaultSerializeable {
    constructor() {
        super();
        this.type = 'spotlight';
        this._sizeWithUnitAndAspect = Cordova_1.Cordova.defaults.SpotlightViewfinder.size;
        this.enabledBorderColor = Cordova_1.Cordova.defaults.SpotlightViewfinder.enabledBorderColor;
        this.disabledBorderColor = Cordova_1.Cordova.defaults.SpotlightViewfinder.disabledBorderColor;
        this.backgroundColor = Cordova_1.Cordova.defaults.SpotlightViewfinder.backgroundColor;
    }
    get sizeWithUnitAndAspect() {
        return this._sizeWithUnitAndAspect;
    }
    setSize(size) {
        this._sizeWithUnitAndAspect = Common_1.SizeWithUnitAndAspect.sizeWithWidthAndHeight(size);
    }
    setWidthAndAspectRatio(width, heightToWidthAspectRatio) {
        this._sizeWithUnitAndAspect = Common_1.SizeWithUnitAndAspect.sizeWithWidthAndAspectRatio(width, heightToWidthAspectRatio);
    }
    setHeightAndAspectRatio(height, widthToHeightAspectRatio) {
        this._sizeWithUnitAndAspect = Common_1.SizeWithUnitAndAspect.sizeWithHeightAndAspectRatio(height, widthToHeightAspectRatio);
    }
}
__decorate([
    Serializeable_1.nameForSerialization('size')
], SpotlightViewfinder.prototype, "_sizeWithUnitAndAspect", void 0);
exports.SpotlightViewfinder = SpotlightViewfinder;
