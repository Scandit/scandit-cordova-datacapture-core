import { BaseNativeProxy, DataCaptureContext, DataCaptureContextProxy } from 'scandit-datacapture-frameworks-core';
export declare class NativeDataCaptureContextProxy extends BaseNativeProxy implements DataCaptureContextProxy {
    private static get cordovaExec();
    get framework(): string;
    get frameworkVersion(): string;
    contextFromJSON(context: DataCaptureContext): Promise<void>;
    updateContextFromJSON(context: DataCaptureContext): Promise<void>;
    dispose(): void;
    registerListenerForEvents(): void;
    addModeToContext(modeJson: string): Promise<void>;
    removeModeFromContext(modeJson: string): Promise<void>;
    removeAllModesFromContext(): Promise<void>;
    unsubscribeListener(): void;
    private notifyListeners;
}
