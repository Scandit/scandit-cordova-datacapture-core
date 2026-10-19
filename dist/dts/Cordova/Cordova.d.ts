export { Cordova } from './pluginInstance';
export declare enum CordovaFunction {
    GetDefaults = "getDefaults",
    SubscribeVolumeButtonObserver = "subscribeVolumeButtonObserver",
    UnsubscribeVolumeButtonObserver = "unsubscribeVolumeButtonObserver"
}
export declare function initializeCordovaCore(): void;
