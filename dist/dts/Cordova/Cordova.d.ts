export declare enum CordovaFunction {
    GetDefaults = "getDefaults",
    SubscribeFrameSourceListener = "subscribeFrameSourceListener",
    UnsubscribeFrameSourceListener = "unsubscribeFrameSourceListener",
    SetViewPositionAndSize = "setViewPositionAndSize",
    ShowView = "showView",
    HideView = "hideView",
    ViewPointForFramePoint = "viewPointForFramePoint",
    ViewQuadrilateralForFrameQuadrilateral = "viewQuadrilateralForFrameQuadrilateral",
    SubscribeViewListener = "subscribeViewListener",
    UnsubscribeViewListener = "unsubscribeViewListener",
    GetCurrentCameraState = "getCurrentCameraState",
    GetIsTorchAvailable = "getIsTorchAvailable",
    SwitchCameraToDesiredState = "switchCameraToDesiredState",
    GetFrame = "getFrame",
    EmitFeedback = "emitFeedback",
    SubscribeVolumeButtonObserver = "subscribeVolumeButtonObserver",
    UnsubscribeVolumeButtonObserver = "unsubscribeVolumeButtonObserver",
    CreateDataCaptureView = "createDataCaptureView",
    UpdateDataCaptureView = "updateDataCaptureView",
    RemoveDataCaptureView = "removeDataCaptureView"
}
export declare const Cordova: {
    pluginName: string;
    defaults: {};
    exec: (success: Function | null, error: Function | null, functionName: string, args: [
        any
    ] | null) => void;
};
export declare function initializeCordovaCore(): void;
