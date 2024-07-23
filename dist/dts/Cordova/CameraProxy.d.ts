import { BaseNativeProxy, CameraPosition, CameraProxy } from 'scandit-datacapture-frameworks-core';
import { FrameSourceState } from 'scandit-datacapture-frameworks-core';
export declare class NativeCameraProxy extends BaseNativeProxy implements CameraProxy {
    private static get cordovaExec();
    getLastFrame(): Promise<string>;
    getLastFrameOrNull(): Promise<string | null>;
    getCurrentCameraState(_position: CameraPosition): Promise<FrameSourceState>;
    isTorchAvailable(position: CameraPosition): Promise<boolean>;
    switchCameraToDesiredState(desiredStateJson: string): Promise<void>;
    registerListenerForCameraEvents(): void;
    unregisterListenerForCameraEvents(): void;
    private notifyListeners;
}
