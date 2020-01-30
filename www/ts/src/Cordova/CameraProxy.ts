/// <amd-module name="scandit-cordova-datacapture-core.CameraProxy"/>
// ^ needed because Cordova can't resolve "../xx" style dependencies
import { FrameSourceState } from '../Camera+Related';
import { Cordova, CordovaFunction } from './Cordova';

declare type Camera = any; // To avoid a circular dependency. Camera is only used here as a type

export class CameraProxy {
  private static cordovaExec = Cordova.exec;
  private camera: Camera;

  public static forCamera(camera: Camera): CameraProxy {
    const proxy = new CameraProxy();
    proxy.camera = camera;
    return proxy;
  }

  public getCurrentState(): Promise<FrameSourceState> {
    return new Promise((resolve, reject) => {
      CameraProxy.cordovaExec(
        resolve,
        reject,
        CordovaFunction.GetCurrentCameraState,
        null,
      );
    });
  }
}
