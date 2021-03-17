/// <amd-module name="scandit-cordova-datacapture-core.Defaults" />
import { CameraPosition, CameraSettings, FocusGestureStrategy, FocusRange, VideoResolution } from '../Camera+Related';
import { Color, MarginsWithUnit, NumberWithUnit, PointWithUnit, SizeWithUnitAndAspect } from '../Common';
import { Anchor } from '../DataCaptureView';
import { FocusGesture, ZoomGesture } from '../DataCaptureView+Related';
export interface CameraSettingsDefaults {
    preferredResolution: VideoResolution;
    zoomFactor: number;
    focusRange: FocusRange;
    zoomGestureZoomFactor: number;
    focusGestureStrategy: FocusGestureStrategy;
}
export interface Defaults {
    Camera: {
        Settings: CameraSettingsDefaults;
        defaultPosition: CameraPosition | null;
        availablePositions: CameraPosition[];
    };
    DataCaptureView: {
        scanAreaMargins: MarginsWithUnit;
        pointOfInterest: PointWithUnit;
        logoAnchor: Anchor;
        logoOffset: PointWithUnit;
        focusGesture: FocusGesture | null;
        zoomGesture: ZoomGesture | null;
    };
    LaserlineViewfinder: {
        width: NumberWithUnit;
        enabledColor: Color;
        disabledColor: Color;
    };
    RectangularViewfinder: {
        size: SizeWithUnitAndAspect;
        color: Color;
    };
    SpotlightViewfinder: {
        size: SizeWithUnitAndAspect;
        enabledBorderColor: Color;
        disabledBorderColor: Color;
        backgroundColor: Color;
    };
    AimerViewfinder: {
        frameColor: Color;
        dotColor: Color;
    };
    Brush: {
        fillColor: Color;
        strokeColor: Color;
        strokeWidth: number;
    };
    deviceID: string | null;
}
export interface CameraSettingsDefaultsJSON {
    preferredResolution: string;
    zoomFactor: number;
    focusRange: string;
    zoomGestureZoomFactor: number;
    focusGestureStrategy: string;
}
export interface PrivateCameraSettingsDefaults {
    fromJSON(json: CameraSettingsDefaultsJSON): CameraSettings;
}
export interface DefaultsJSON {
    Camera: {
        Settings: CameraSettingsDefaultsJSON;
        defaultPosition: string | null;
        availablePositions: string[];
    };
    DataCaptureView: {
        scanAreaMargins: string;
        pointOfInterest: string;
        logoAnchor: string;
        logoOffset: string;
        focusGesture: string;
        zoomGesture: string;
    };
    LaserlineViewfinder: {
        width: string;
        enabledColor: string;
        disabledColor: string;
    };
    RectangularViewfinder: {
        size: string;
        color: string;
    };
    SpotlightViewfinder: {
        size: string;
        enabledBorderColor: string;
        disabledBorderColor: string;
        backgroundColor: string;
    };
    AimerViewfinder: {
        frameColor: string;
        dotColor: string;
    };
    Brush: {
        fillColor: string;
        strokeColor: string;
        strokeWidth: number;
    };
    deviceID: string | null;
}
export declare const defaultsFromJSON: (json: DefaultsJSON) => Defaults;
