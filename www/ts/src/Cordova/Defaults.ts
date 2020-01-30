/// <amd-module name="scandit-cordova-datacapture-core.Defaults"/>
// ^ needed because Cordova can't resolve "../xx" style dependencies
import { CameraPosition, FocusRange, VideoResolution } from '../Camera+Related';
import {
  Color,
  MarginsWithUnit,
  NumberWithUnit,
  PointWithUnit,
  PrivateColor,
  PrivateMarginsWithUnit,
  PrivateNumberWithUnit,
  PrivatePointWithUnit,
  PrivateSizeWithUnitAndAspect,
  SizeWithUnitAndAspect,
} from '../Common';
import { Anchor } from '../DataCaptureView';

export interface CameraSettingsDefaults {
  preferredResolution: VideoResolution;
  maxFrameRate: number;
  zoomFactor: number;
  focusRange: FocusRange;
}

export interface Defaults {
  Camera: {
    Settings: CameraSettingsDefaults;

    defaultPosition: Optional<CameraPosition>;
    availablePositions: CameraPosition[];
    torchAvailability: { [key in CameraPosition]: boolean };
  };

  DataCaptureView: {
    scanAreaMargins: MarginsWithUnit,
    pointOfInterest: PointWithUnit,
    logoAnchor: Anchor,
    logoOffset: PointWithUnit,
  };

  LaserlineViewfinder: {
    width: NumberWithUnit,
    enabledColor: Color,
    disabledColor: Color,
  };

  RectangularViewfinder: {
    size: SizeWithUnitAndAspect,
    color: Color,
  };

  SpotlightViewfinder: {
    size: SizeWithUnitAndAspect,
    enabledBorderColor: Color,
    disabledBorderColor: Color,
    backgroundColor: Color,
  };

  Brush: {
    fillColor: Color,
    strokeColor: Color,
    strokeWidth: number,
  };
}

export interface CameraSettingsDefaultsJSON {
  preferredResolution: string;
  maxFrameRate: number;
  zoomFactor: number;
  focusRange: string;
}

export interface DefaultsJSON {
  Camera: {
    Settings: CameraSettingsDefaultsJSON;

    defaultPosition: Optional<string>;
    availablePositions: string[];
    torchAvailability: { [key: string]: boolean };
  };

  DataCaptureView: {
    scanAreaMargins: string,
    pointOfInterest: string,
    logoAnchor: string,
    logoOffset: string,
  };

  LaserlineViewfinder: {
    width: string,
    enabledColor: string,
    disabledColor: string,
  };

  RectangularViewfinder: {
    size: string,
    color: string,
  };

  SpotlightViewfinder: {
    size: string,
    enabledBorderColor: string,
    disabledBorderColor: string,
    backgroundColor: string,
  };

  Brush: {
    fillColor: string,
    strokeColor: string,
    strokeWidth: number,
  };
}

export const defaultsFromJSON: (json: DefaultsJSON) => Defaults = (json: DefaultsJSON) => {
  return {
    Camera: {
      Settings: {
        preferredResolution: json.Camera.Settings.preferredResolution as VideoResolution,
        maxFrameRate: json.Camera.Settings.maxFrameRate,
        zoomFactor: json.Camera.Settings.zoomFactor,
        focusRange: json.Camera.Settings.focusRange as FocusRange,
      },
      defaultPosition: (json.Camera.defaultPosition || null) as Optional<CameraPosition>,
      availablePositions: json.Camera.availablePositions as CameraPosition[],
      torchAvailability: json.Camera.torchAvailability as { [key in CameraPosition]: boolean },
    },

    DataCaptureView: {
      scanAreaMargins: (MarginsWithUnit as any as PrivateMarginsWithUnit)
        .fromJSON(JSON.parse(json.DataCaptureView.scanAreaMargins)),
      pointOfInterest: (PointWithUnit as any as PrivatePointWithUnit)
        .fromJSON(JSON.parse(json.DataCaptureView.pointOfInterest)),
      logoAnchor: json.DataCaptureView.logoAnchor as Anchor,
      logoOffset: (PointWithUnit as any as PrivatePointWithUnit)
        .fromJSON(JSON.parse(json.DataCaptureView.logoOffset)),
    },

    LaserlineViewfinder: {
      width: (NumberWithUnit as any as PrivateNumberWithUnit)
        .fromJSON(JSON.parse(json.LaserlineViewfinder.width)),
      enabledColor: (Color as any as PrivateColor)
        .fromJSON(json.LaserlineViewfinder.enabledColor),
      disabledColor: (Color as any as PrivateColor)
        .fromJSON(json.LaserlineViewfinder.disabledColor),
    },

    RectangularViewfinder: {
      size: (SizeWithUnitAndAspect as any as PrivateSizeWithUnitAndAspect)
        .fromJSON(JSON.parse(json.RectangularViewfinder.size)),
      color: (Color as any as PrivateColor)
        .fromJSON(json.RectangularViewfinder.color),
    },

    SpotlightViewfinder: {
      size: (SizeWithUnitAndAspect as any as PrivateSizeWithUnitAndAspect)
        .fromJSON(JSON.parse(json.SpotlightViewfinder.size)),
      enabledBorderColor: (Color as any as PrivateColor)
        .fromJSON(json.SpotlightViewfinder.enabledBorderColor),
      disabledBorderColor: (Color as any as PrivateColor)
        .fromJSON(json.SpotlightViewfinder.disabledBorderColor),
      backgroundColor: (Color as any as PrivateColor)
        .fromJSON(json.SpotlightViewfinder.backgroundColor),
    },

    Brush: {
      fillColor: (Color as any as PrivateColor)
        .fromJSON(json.Brush.fillColor),
      strokeColor: (Color as any as PrivateColor)
        .fromJSON(json.Brush.strokeColor),
      strokeWidth: json.Brush.strokeWidth,
    },
  };
};
