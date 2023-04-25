/// <amd-module name="scandit-cordova-datacapture-core.CameraProxy" />
import { FrameData, FrameSourceState } from '../Camera+Related';
declare type Camera = any;
export declare class CameraProxy {
    private static cordovaExec;
    private camera;
    static forCamera(camera: Camera): CameraProxy;
    static getLastFrame(): Promise<FrameData>;
    static getLastFrameOrNull(): Promise<FrameData | null>;
    getCurrentState(): Promise<FrameSourceState>;
    getIsTorchAvailable(): Promise<boolean>;
    private initialize;
    private subscribeListener;
    private notifyListeners;
}
export {};
