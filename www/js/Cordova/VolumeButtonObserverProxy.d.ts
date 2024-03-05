/// <amd-module name="scandit-cordova-datacapture-core.VolumeButtonObserverProxy" />
declare type VolumeButtonObserver = any;
export declare class VolumeButtonObserverProxy {
    private static cordovaExec;
    private volumeButtonObserver;
    static forVolumeButtonObserver(volumeButtonObserver: VolumeButtonObserver): VolumeButtonObserverProxy;
    dispose(): void;
    private subscribe;
    private unsubscribe;
    private notifyListeners;
}
export {};
