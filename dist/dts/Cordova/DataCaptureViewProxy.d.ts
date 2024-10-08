import { BaseNativeProxy, DataCaptureViewProxy } from 'scandit-datacapture-frameworks-core';
export declare class NativeDataCaptureViewProxy extends BaseNativeProxy implements DataCaptureViewProxy {
    viewPointForFramePoint(pointJson: string): Promise<string>;
    viewQuadrilateralForFrameQuadrilateral(quadrilateralJson: string): Promise<string>;
    registerListenerForViewEvents(): void;
    unregisterListenerForViewEvents(): void;
    setPositionAndSize(top: number, left: number, width: number, height: number, shouldBeUnderWebView: boolean): Promise<void>;
    show(): Promise<void>;
    hide(): Promise<void>;
    createView(viewJson: string): Promise<void>;
    updateView(viewJson: string): Promise<void>;
    removeView(): Promise<void>;
    private static get cordovaExec();
    private notifyListeners;
}
