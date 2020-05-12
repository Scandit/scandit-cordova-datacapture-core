/// <amd-module name="scandit-cordova-datacapture-core.Camera+Related"/>
// ^ needed because Cordova can't resolve "../xx" style dependencies
import { Cordova } from './Cordova/Cordova';
import { DefaultSerializeable, Serializeable } from './Serializeable';

export enum FrameSourceState {
  On = 'on',
  Off = 'off',
  Starting = 'starting',
  Stopping = 'stopping',
}

export enum TorchState {
  On = 'on',
  Off = 'off',
  Auto = 'auto',
}

export enum CameraPosition {
  WorldFacing = 'worldFacing',
  UserFacing = 'userFacing',
  Unspecified = 'unspecified',
}

export enum VideoResolution {
  Auto = 'auto',
  HD = 'hd',
  FullHD = 'fullHd',
  UHD4K = 'uhd4k',
}

export enum FocusRange {
  Full = 'full',
  Near = 'near',
  Far = 'far',
}

enum PrivateCameraProperty {
  CameraAPI = 'api',
}

export interface FrameSourceListener {
  didChangeState?(frameSource: FrameSource, newState: FrameSourceState): void;

  // TODO: adjust when readding framedata to the api https://jira.scandit.com/browse/SDC-1159
  // didOutputFrame: (frameSource: FrameSource, frameData: FrameData) => void;

}

export interface FrameSource extends Serializeable {
  readonly desiredState: FrameSourceState;

  switchToDesiredState(desiredState: FrameSourceState): Promise<void>;
  getCurrentState(): Promise<FrameSourceState>;
  addListener(listener: FrameSourceListener): void;
  removeListener(listener: FrameSourceListener): void;
}

export interface CameraSettingsJSON {
  preferredResolution: string;
  maxFrameRate: number;
  zoomFactor: number;
  focusRange: string;
  api: number;
}

export interface PrivateCameraSettings {
  fromJSON(json: CameraSettingsJSON): CameraSettings;
}

export class CameraSettings extends DefaultSerializeable {
  public preferredResolution: VideoResolution = Cordova.defaults.Camera.Settings.preferredResolution;
  public maxFrameRate: number = Cordova.defaults.Camera.Settings.maxFrameRate;
  public zoomFactor: number = Cordova.defaults.Camera.Settings.zoomFactor;

  private api: number = 1;

  private focus = {
    range: Cordova.defaults.Camera.Settings.focusRange,
  };

  public get focusRange(): FocusRange {
    return this.focus.range;
  }

  public set focusRange(newRange: FocusRange) {
    this.focus.range = newRange;
  }

  private static fromJSON(json: CameraSettingsJSON): CameraSettings {
    const settings = new CameraSettings();
    settings.preferredResolution = json.preferredResolution as VideoResolution;
    settings.maxFrameRate = json.maxFrameRate;
    settings.zoomFactor = json.zoomFactor;
    settings.focusRange = json.focusRange as FocusRange;
    if (json.api !== undefined && json.api !== null) {
      settings.api = json.api;
    }
    return settings;
  }

  public constructor()
  public constructor(settings: CameraSettings)
  constructor(settings?: CameraSettings) {
    super();
    if (settings !== undefined && settings !== null) {
      Object.getOwnPropertyNames(settings).forEach(propertyName => {
        (this as any)[propertyName] = (settings as any)[propertyName];
      });
    }
  }

  public setProperty(name: string, value: any): void {
    switch (name) {
      case PrivateCameraProperty.CameraAPI:
        this.api = value as number;
        break;
    }
  }

  public getProperty(name: string): any {
    switch (name) {
      case PrivateCameraProperty.CameraAPI:
        return this.api;
    }
  }
}
