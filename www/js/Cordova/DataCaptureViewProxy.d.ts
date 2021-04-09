/// <amd-module name="scandit-cordova-datacapture-core.DataCaptureViewProxy" />
import { Point, Quadrilateral } from '../Common';
import { DataCaptureView } from '../DataCaptureView';
export declare class DataCaptureViewProxy {
    private static cordovaExec;
    private view;
    static forDataCaptureView(view: DataCaptureView): DataCaptureViewProxy;
    setPositionAndSize(top: number, left: number, width: number, height: number, shouldBeUnderWebView: boolean): Promise<void>;
    show(): Promise<void>;
    hide(): Promise<void>;
    viewPointForFramePoint(point: Point): Promise<Point>;
    viewQuadrilateralForFrameQuadrilateral(quadrilateral: Quadrilateral): Promise<Quadrilateral>;
    private subscribeListener;
    private notifyListeners;
    private initialize;
}
