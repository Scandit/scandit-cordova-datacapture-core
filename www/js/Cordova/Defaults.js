"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Common_1 = require("scandit-cordova-datacapture-core.Common");
exports.defaultsFromJSON = (json) => {
    return {
        Camera: {
            Settings: {
                preferredResolution: json.Camera.Settings.preferredResolution,
                maxFrameRate: json.Camera.Settings.maxFrameRate,
                zoomFactor: json.Camera.Settings.zoomFactor,
                focusRange: json.Camera.Settings.focusRange,
            },
            defaultPosition: (json.Camera.defaultPosition || null),
            availablePositions: json.Camera.availablePositions,
            torchAvailability: json.Camera.torchAvailability,
        },
        DataCaptureView: {
            scanAreaMargins: Common_1.MarginsWithUnit
                .fromJSON(JSON.parse(json.DataCaptureView.scanAreaMargins)),
            pointOfInterest: Common_1.PointWithUnit
                .fromJSON(JSON.parse(json.DataCaptureView.pointOfInterest)),
            logoAnchor: json.DataCaptureView.logoAnchor,
            logoOffset: Common_1.PointWithUnit
                .fromJSON(JSON.parse(json.DataCaptureView.logoOffset)),
        },
        LaserlineViewfinder: {
            width: Common_1.NumberWithUnit
                .fromJSON(JSON.parse(json.LaserlineViewfinder.width)),
            enabledColor: Common_1.Color
                .fromJSON(json.LaserlineViewfinder.enabledColor),
            disabledColor: Common_1.Color
                .fromJSON(json.LaserlineViewfinder.disabledColor),
        },
        RectangularViewfinder: {
            size: Common_1.SizeWithUnitAndAspect
                .fromJSON(JSON.parse(json.RectangularViewfinder.size)),
            color: Common_1.Color
                .fromJSON(json.RectangularViewfinder.color),
        },
        SpotlightViewfinder: {
            size: Common_1.SizeWithUnitAndAspect
                .fromJSON(JSON.parse(json.SpotlightViewfinder.size)),
            enabledBorderColor: Common_1.Color
                .fromJSON(json.SpotlightViewfinder.enabledBorderColor),
            disabledBorderColor: Common_1.Color
                .fromJSON(json.SpotlightViewfinder.disabledBorderColor),
            backgroundColor: Common_1.Color
                .fromJSON(json.SpotlightViewfinder.backgroundColor),
        },
        Brush: {
            fillColor: Common_1.Color
                .fromJSON(json.Brush.fillColor),
            strokeColor: Common_1.Color
                .fromJSON(json.Brush.strokeColor),
            strokeWidth: json.Brush.strokeWidth,
        },
        deviceID: json.deviceID,
    };
};
