export declare enum CordovaFunction {
    GetDefaults = "getDefaults",
    SubscribeVolumeButtonObserver = "subscribeVolumeButtonObserver",
    UnsubscribeVolumeButtonObserver = "unsubscribeVolumeButtonObserver"
}
export declare const Cordova: {
    pluginName: string;
    defaults: {};
    exec: (success: Function | null, error: Function | null, functionName: string, args: [
        any
    ] | null) => void;
};
export declare function initializeCordovaCore(): void;
