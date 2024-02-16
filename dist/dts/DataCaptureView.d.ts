import { Anchor, Control, DataCaptureOverlay, DataCaptureViewListener, MarginsWithUnit, Point, PointWithUnit, Quadrilateral, Rect } from 'scandit-datacapture-frameworks-core';
import { DataCaptureContext } from 'scandit-datacapture-frameworks-core';
import { FocusGesture, LogoStyle, ZoomGesture } from 'scandit-datacapture-frameworks-core';
export declare class HTMLElementState {
    isShown: boolean;
    position: {
        top: number;
        left: number;
    } | null;
    size: {
        width: number;
        height: number;
    } | null;
    shouldBeUnderContent: boolean;
    get isValid(): boolean;
    didChangeComparedTo(other: HTMLElementState): boolean;
}
export declare class DataCaptureView {
    private baseDataCaptureView;
    get context(): DataCaptureContext | null;
    set context(context: DataCaptureContext | null);
    private get overlays();
    get scanAreaMargins(): MarginsWithUnit;
    set scanAreaMargins(newValue: MarginsWithUnit);
    get pointOfInterest(): PointWithUnit;
    set pointOfInterest(newValue: PointWithUnit);
    get logoStyle(): LogoStyle;
    set logoStyle(style: LogoStyle);
    get logoAnchor(): Anchor;
    set logoAnchor(newValue: Anchor);
    get logoOffset(): PointWithUnit;
    set logoOffset(newValue: PointWithUnit);
    get focusGesture(): FocusGesture | null;
    set focusGesture(newValue: FocusGesture | null);
    get zoomGesture(): ZoomGesture | null;
    set zoomGesture(newValue: ZoomGesture | null);
    private htmlElement;
    private _htmlElementState;
    private set htmlElementState(value);
    private get htmlElementState();
    private scrollListener;
    private domObserver;
    static forContext(context: DataCaptureContext | null): DataCaptureView;
    constructor();
    private orientationChangeListener;
    connectToElement(element: HTMLElement): void;
    detachFromElement(): void;
    setFrame(frame: Rect, isUnderContent?: boolean): Promise<void>;
    show(): Promise<void>;
    hide(): Promise<void>;
    addOverlay(overlay: DataCaptureOverlay): void;
    removeOverlay(overlay: DataCaptureOverlay): void;
    addListener(listener: DataCaptureViewListener): void;
    removeListener(listener: DataCaptureViewListener): void;
    viewPointForFramePoint(point: Point): Promise<Point>;
    viewQuadrilateralForFrameQuadrilateral(quadrilateral: Quadrilateral): Promise<Quadrilateral>;
    addControl(control: Control): void;
    addControlWithAnchorAndOffset(control: Control, anchor: Anchor, offset: PointWithUnit): void;
    removeControl(control: Control): void;
    private subscribeToChangesOnHTMLElement;
    private unsubscribeFromChangesOnHTMLElement;
    private elementDidChange;
    private updatePositionAndSize;
    private _show;
    private _hide;
    private toJSON;
}
