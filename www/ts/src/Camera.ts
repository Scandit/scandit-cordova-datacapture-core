/// <amd-module name="scandit-cordova-datacapture-core.Camera"/>
// ^ needed because Cordova can't resolve "../xx" style dependencies
import {
  CameraPosition,
  CameraSettings,
  FrameSource,
  FrameSourceListener,
  FrameSourceState,
  TorchState,
} from './Camera+Related';
import { CameraProxy } from './Cordova/CameraProxy';
import { Cordova } from './Cordova/Cordova';
import { DataCaptureContext, PrivateDataCaptureContext } from './DataCaptureContext';
import {
  DefaultSerializeable,
  ignoreFromSerialization,
  nameForSerialization,
  serializationDefault,
} from './Serializeable';

export interface PrivateCamera {
  context: Optional<DataCaptureContext>;

  position: CameraPosition;
  _desiredState: FrameSourceState;
  desiredTorchState: TorchState;
  settings: CameraSettings;

  listeners: FrameSourceListener[];

  _proxy: CameraProxy;
  proxy: CameraProxy;

  initialize: () => void;
  didChange: () => Promise<void>;
}

export class Camera extends DefaultSerializeable implements FrameSource {
  private type = 'camera';
  @serializationDefault({})
  private settings: Optional<CameraSettings> = null;

  private position: CameraPosition;

  @nameForSerialization('desiredTorchState')
  private _desiredTorchState: TorchState = TorchState.Off;

  @nameForSerialization('desiredState')
  private _desiredState: FrameSourceState = FrameSourceState.Off;

  @ignoreFromSerialization
  private listeners: FrameSourceListener[] = [];
  @ignoreFromSerialization
  private context: Optional<DataCaptureContext> = null;

  @ignoreFromSerialization
  private _proxy: CameraProxy;

  private get proxy(): CameraProxy {
    if (!this._proxy) {
      this.initialize();
    }
    return this._proxy as CameraProxy;
  }

  public static get default(): Optional<Camera> {
    if (Cordova.defaults.Camera.defaultPosition) {
      const camera = new Camera();
      camera.position = Cordova.defaults.Camera.defaultPosition;
      return camera;
    } else {
      return null;
    }
  }

  public static atPosition(cameraPosition: CameraPosition): Optional<Camera> {
    if (Cordova.defaults.Camera.availablePositions.includes(cameraPosition)) {
      const camera = new Camera();
      camera.position = cameraPosition;
      return camera;
    } else {
      return null;
    }
  }

  public get desiredState(): FrameSourceState {
    return this._desiredState;
  }

  public get isTorchAvailable(): boolean {
    return Cordova.defaults.Camera.torchAvailability[this.position];
  }

  public set desiredTorchState(desiredTorchState: TorchState) {
    this._desiredTorchState = desiredTorchState;
    this.didChange();
  }

  public get desiredTorchState(): TorchState {
    return this._desiredTorchState;
  }

  public switchToDesiredState(state: FrameSourceState): Promise<void> {
    this._desiredState = state;

    return this.didChange();
  }

  public getCurrentState(): Promise<FrameSourceState> {
    return this.proxy.getCurrentState();
  }

  public addListener(listener: Optional<FrameSourceListener>): void {
    if (listener == null) {
      return;
    }

    if (this.listeners.includes(listener)) {
      return;
    }
    this.listeners.push(listener);
  }

  public removeListener(listener: Optional<FrameSourceListener>): void {
    if (listener == null) {
      return;
    }

    if (!this.listeners.includes(listener)) {
      return;
    }
    this.listeners.splice(this.listeners.indexOf(listener), 1);
  }

  public applySettings(settings: CameraSettings): Promise<void> {
    this.settings = settings;
    return this.didChange();
  }

  private initialize() {
    if (this._proxy) {
      return;
    }
    this._proxy = CameraProxy.forCamera(this);
  }

  private didChange(): Promise<void> {
    if (this.context) {
      return (this.context as any as PrivateDataCaptureContext).update();
    } else {
      return Promise.resolve();
    }
  }
}
