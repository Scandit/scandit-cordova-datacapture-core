import { BaseNativeProxy, DataCaptureContextProxy } from 'scandit-datacapture-frameworks-core';
export declare class NativeDataCaptureContextProxy extends BaseNativeProxy implements DataCaptureContextProxy {
    private static get cordovaExec();
    get framework(): string;
    get frameworkVersion(): string;
    contextFromJSON(contextJson: string): Promise<string>;
    updateContextFromJSON(contextJson: string): Promise<void>;
    dispose(): void;
    registerListenerForDataCaptureContext(): void;
    addModeToContext(modeJson: string): Promise<void>;
    removeModeFromContext(modeJson: string): Promise<void>;
    removeAllModesFromContext(): Promise<void>;
    unregisterListenerForDataCaptureContext(): Promise<void>;
    getOpenSourceSoftwareLicenseInfo(): Promise<string>;
    private notifyListeners;
}
