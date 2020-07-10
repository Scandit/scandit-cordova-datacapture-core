/// <amd-module name="scandit-cordova-datacapture-core.DataCaptureContext"/>
// ^ needed because Cordova can't resolve "../xx" style dependencies
import { FrameSource } from './Camera+Related';
import { DataCaptureContextProxy } from './Cordova/DataCaptureContextProxy';
import { DataCaptureContextListener } from './DataCaptureContext+Related';
import { DataCaptureView } from './DataCaptureView';
import { DefaultSerializeable, ignoreFromSerialization, nameForSerialization, Serializeable } from './Serializeable';

export interface PrivateDataCaptureMode {
  _context: Optional<DataCaptureContext>;
}

export interface DataCaptureMode extends Serializeable {
  isEnabled: boolean;
  readonly context: Optional<DataCaptureContext>;
}

export interface PrivateDataCaptureComponent {
  _context: DataCaptureContext;
}

export interface DataCaptureComponent {
  readonly id: string;
}

export interface PrivateDataCaptureContext {
  proxy: DataCaptureContextProxy;
  modes: [DataCaptureMode];
  components: [DataCaptureComponent];
  initialize: () => void;
  update: () => Promise<void>;
  addComponent: (component: DataCaptureComponent) => void;
}

export interface DataCaptureContextCreationOptions {
  deviceName?: Optional<string>;
}

export class DataCaptureContext extends DefaultSerializeable {
  private framework = 'cordova';

  @nameForSerialization('frameSource')
  private _frameSource: Optional<FrameSource> = null;

  private view: Optional<DataCaptureView> = null;

  private modes: DataCaptureMode[] = [];

  private components: DataCaptureComponent[] = [];

  @ignoreFromSerialization
  private proxy: DataCaptureContextProxy;
  @ignoreFromSerialization
  private listeners: DataCaptureContextListener[] = [];

  // TODO: adjust when readding framedata to the api https://jira.scandit.com/browse/SDC-1159
  // @ignoreFromSerialization
  // private frameListeners: DataCaptureContextFrameListener[] = [];

  public get frameSource(): Optional<FrameSource> {
    return this._frameSource;
  }

  @ignoreFromSerialization
  private _deviceID: Optional<string> = null;

  public get deviceID(): Optional<string> {
    return this._deviceID;
  }

  public static forLicenseKey(licenseKey: string): DataCaptureContext {
    return DataCaptureContext.forLicenseKeyWithOptions(licenseKey, null);
  }

  public static forLicenseKeyWithOptions(
    licenseKey: string, options: Optional<DataCaptureContextCreationOptions>): DataCaptureContext {
    if (options == null) {
      options = { deviceName: null };
    }
    return new DataCaptureContext(licenseKey, options.deviceName || '');
  }

  private constructor(
    private licenseKey: string,
    private deviceName: string,
  ) { super(); }

  public setFrameSource(frameSource: Optional<FrameSource>): Promise<void> {
    this._frameSource = frameSource;
    if (frameSource) {
      (frameSource as any).context = this;
    }
    return this.update();
  }

  public addListener(listener: DataCaptureContextListener): void {
    if (this.listeners.includes(listener)) {
      return;
    }
    this.listeners.push(listener);
  }

  public removeListener(listener: DataCaptureContextListener): void {
    if (!this.listeners.includes(listener)) {
      return;
    }
    this.listeners.splice(this.listeners.indexOf(listener), 1);
  }

  // TODO: adjust when readding framedata to the api https://jira.scandit.com/browse/SDC-1159
  // public addFrameListener(frameListener: DataCaptureContextFrameListener) {
  //   if (this.frameListeners.includes(frameListener)) {
  //     return;
  //   }
  //   this.frameListeners.push(frameListener);
  // }

  // TODO: adjust when readding framedata to the api https://jira.scandit.com/browse/SDC-1159
  // public removeFrameListener(frameListener: DataCaptureContextFrameListener) {
  //   if (!this.frameListeners.includes(frameListener)) {
  //     return;
  //   }
  //   this.frameListeners.splice(this.frameListeners.indexOf(frameListener), 1);
  // }

  public addMode(mode: DataCaptureMode): void {
    if (!this.modes.includes(mode)) {
      this.modes.push(mode);
      (mode as any as PrivateDataCaptureMode)._context = this;
      this.update();
    }
  }

  public removeMode(mode: DataCaptureMode): void {
    if (this.modes.includes(mode)) {
      this.modes.splice(this.modes.indexOf(mode), 1);
      (mode as any as PrivateDataCaptureMode)._context = null;
      this.update();
    }
  }

  public removeAllModes(): void {
    this.modes = [];
    this.update();
  }

  public dispose(): void {
    if (!this.proxy) {
      return;
    }
    this.proxy.dispose();
  }

  private initialize(): void {
    if (this.proxy) {
      return;
    }
    this.proxy = DataCaptureContextProxy.forDataCaptureContext(this);
  }

  private update(): Promise<void> {
    if (!this.proxy) {
      return Promise.resolve();
    }
    return this.proxy.updateContextFromJSON();
  }

  private addComponent(component: DataCaptureComponent) {
    if (!this.components.includes(component)) {
      this.components.push(component);
      (component as any as PrivateDataCaptureComponent)._context = this;
      this.update();
    }
  }
}
