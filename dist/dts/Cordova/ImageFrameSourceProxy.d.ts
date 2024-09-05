import { CameraPosition, ImageFrameSourceProxy, FrameSourceState, BaseNativeProxy } from 'scandit-datacapture-frameworks-core';
export declare class NativeImageFrameSourceProxy extends BaseNativeProxy implements ImageFrameSourceProxy {
    private static get cordovaExec();
    getCurrentCameraState(_position: CameraPosition): Promise<FrameSourceState>;
    switchCameraToDesiredState(desiredStateJson: string): Promise<void>;
    registerListenerForEvents(): void;
    unregisterListenerForEvents(): Promise<void>;
    private notifyListeners;
}
