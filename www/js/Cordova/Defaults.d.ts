/// <amd-module name="scandit-cordova-datacapture-core.Defaults" />
import { CameraPosition, CameraSettings, FocusGestureStrategy, FocusRange, VideoResolution } from '../Camera+Related';
import { Color, MarginsWithUnit, PointWithUnit, SizeWithUnitAndAspect } from '../Common';
import { Anchor } from '../DataCaptureView';
import { FocusGesture, LogoStyle, ZoomGesture } from '../DataCaptureView+Related';
export interface CameraSettingsDefaults {
    preferredResolution: VideoResolution;
    zoomFactor: number;
    focusRange: FocusRange;
    zoomGestureZoomFactor: number;
    focusGestureStrategy: FocusGestureStrategy;
    shouldPreferSmoothAutoFocus: boolean;
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
        logoStyle: LogoStyle;
    };
    LaserlineViewfinder: {
        defaultStyle: string;
        styles: {
            [key: string]: any;
        };
    };
    RectangularViewfinder: {
        defaultStyle: string;
        styles: {
            [key: string]: any;
        };
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
    shouldPreferSmoothAutoFocus: boolean;
}
export interface PrivateCameraSettingsDefaults {
    fromJSON(json: CameraSettingsDefaultsJSON): CameraSettings;
}
interface LaserlineViewfinderDefault {
    width: string;
    enabledColor: string;
    disabledColor: string;
    style: string;
}
interface RectangularViewfinderDefault {
    size: string;
    color: string;
    style: string;
    lineStyle: string;
    dimming: number;
    animation: string;
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
        logoStyle: string;
    };
    LaserlineViewfinder: {
        defaultStyle: string;
        styles: {
            [key: string]: LaserlineViewfinderDefault;
        };
    };
    RectangularViewfinder: {
        defaultStyle: string;
        styles: {
            [key: string]: RectangularViewfinderDefault;
        };
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
export {};
