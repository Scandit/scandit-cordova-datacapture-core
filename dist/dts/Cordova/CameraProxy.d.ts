import { BaseNativeProxy, CameraPosition, CameraProxy, NativeCallResult } from 'scandit-datacapture-frameworks-core';
export declare class NativeCameraProxy extends BaseNativeProxy implements CameraProxy {
    private static get cordovaExec();
    getFrame(frameId: String): Promise<NativeCallResult | null>;
    getCurrentCameraState(_position: CameraPosition): Promise<NativeCallResult>;
    isTorchAvailable(position: CameraPosition): Promise<NativeCallResult>;
    switchCameraToDesiredState(desiredStateJson: string): Promise<void>;
    registerListenerForCameraEvents(): void;
    unregisterListenerForCameraEvents(): Promise<void>;
    private notifyListeners;
}
