/// <amd-module name="scandit-cordova-datacapture-core.DataCaptureContextProxy" />
declare type DataCaptureContext = any;
export declare class DataCaptureContextProxy {
    private static cordovaExec;
    private context;
    static forDataCaptureContext(context: DataCaptureContext): DataCaptureContextProxy;
    updateContextFromJSON(): Promise<void>;
    dispose(): void;
    private initialize;
    private initializeContextFromJSON;
    private subscribeListener;
    private notifyListeners;
}
export {};
