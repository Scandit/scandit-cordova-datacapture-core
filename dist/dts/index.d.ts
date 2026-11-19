import { NativeCaller, DataCaptureContext, MarginsWithUnit, PointWithUnit, LogoStyle, Anchor, FocusGesture, ZoomGesture, Rect, DataCaptureOverlay, DataCaptureViewListener, Point, Quadrilateral, Control } from './core';
import * as scanditDatacaptureFrameworksCore from './core';
export { scanditDatacaptureFrameworksCore as __ScanditCore };
export { AimerViewfinder, Anchor, Brush, Camera, CameraPosition, CameraSettings, CameraSwitchControl, ClusteringMode, Color, ContextStatus, Control, DataCaptureComponent, DataCaptureContext, DataCaptureContextCreationOptions, DataCaptureContextListener, DataCaptureContextSettings, DataCaptureMode, DataCaptureOverlay, DataCaptureViewListener, Direction, Feedback, FocusGesture, FocusGestureListener, FocusGestureStrategy, FocusRange, FontFamily, FrameData, FrameDataSettings, FrameDataSettingsBuilder, FrameSource, FrameSourceListener, FrameSourceState, ImageBuffer, ImageFrameSource, LaserlineViewfinder, LocationSelection, LogoStyle, MacroMode, MacroModeListener, MarginsWithUnit, MeasureUnit, NoViewfinder, NoneLocationSelection, NumberWithUnit, OpenSourceSoftwareLicenseInfo, Orientation, PinchToZoom, Point, PointWithUnit, Quadrilateral, RadiusLocationSelection, Rect, RectWithUnit, RectangularLocationSelection, RectangularViewfinder, RectangularViewfinderAnimation, RectangularViewfinderLineStyle, RectangularViewfinderStyle, ScanIntention, ScanditIcon, ScanditIconBuilder, ScanditIconShape, ScanditIconType, SelectionMode, SequenceFrameSource, Size, SizeWithAspect, SizeWithUnit, SizeWithUnitAndAspect, SizingMode, Sound, SwipeToZoom, TapToFocus, TextAlignment, TorchListener, TorchState, TorchSwitchControl, Vibration, VideoResolution, Viewfinder, ZoomGesture, ZoomGestureListener, ZoomListener, ZoomSwitchControl, ZoomSwitchOrientation } from './core';

declare class CordovaError {
    code: number;
    message: string;
    static fromJSON(json: any): CordovaError | null;
    constructor(code: number, message: string);
}
interface BlockingModeListenerResult {
    enabled: boolean;
}
declare const pluginsMetadata: any;
declare const cordovaExec: (successCallback: Function | null, errorCallback: Function | null, className: string, functionName: string, args: [any] | null) => void;
declare function initializePlugin(pluginName: string, customInitialization: () => Promise<void>): Promise<void>;
declare class CordovaNativeCaller implements NativeCaller {
    private cordovaExec;
    private pluginName;
    private eventHandlers;
    private eventRegisteredCheckList;
    constructor(cordovaExec: any, pluginName: string);
    get framework(): string;
    get frameworkVersion(): string;
    callFn(fnName: string, args: object | undefined | null, meta?: {
        isEventRegistration?: boolean;
    }): Promise<any>;
    eventHook(args: any): any;
    registerEvent(evName: string, handler: (args: any) => Promise<void>): Promise<any>;
    unregisterEvent(evName: string, _subscription: any): Promise<void>;
    private setUpEventListener;
    private notifyListeners;
}
declare function createCordovaNativeCaller(cordovaExec: any, pluginName: string): CordovaNativeCaller;

declare class DataCaptureVersion {
    static get pluginVersion(): string;
}

declare class DataCaptureView {
    private baseDataCaptureView;
    private htmlElement;
    private _htmlElementState;
    private scrollListener;
    private domObserver;
    static forContext(context: DataCaptureContext | null): DataCaptureView;
    constructor();
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
    get zoomGestures(): ZoomGesture[];
    set zoomGestures(newValue: ZoomGesture[]);
    /** @deprecated Use zoomGestures instead. Will be removed in a future version. */
    get zoomGesture(): ZoomGesture | null;
    /** @deprecated Use zoomGestures instead. Will be removed in a future version. */
    set zoomGesture(newValue: ZoomGesture | null);
    get shouldShowZoomNotification(): boolean;
    set shouldShowZoomNotification(newValue: boolean);
    setProperty<T>(name: string, value: T): void;
    private set htmlElementState(value);
    private get htmlElementState();
    private orientationChangeListener;
    connectToElement(element: HTMLElement): Promise<void>;
    detachFromElement(): void;
    setFrame(frame: Rect, isUnderContent?: boolean): Promise<void>;
    show(): Promise<void>;
    hide(): Promise<void>;
    addOverlay(overlay: DataCaptureOverlay): Promise<void>;
    removeOverlay(overlay: DataCaptureOverlay): Promise<void>;
    addListener(listener: DataCaptureViewListener): void;
    removeListener(listener: DataCaptureViewListener): void;
    viewPointForFramePoint(point: Point): Promise<Point>;
    viewQuadrilateralForFrameQuadrilateral(quadrilateral: Quadrilateral): Promise<Quadrilateral>;
    addControl(control: Control): Promise<void>;
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

declare class VolumeButtonObserver {
    private didChangeVolume;
    private proxy;
    constructor(didChangeVolume: () => void);
    dispose(): void;
    private initialize;
}

export { CordovaError, CordovaNativeCaller, DataCaptureVersion, DataCaptureView, VolumeButtonObserver, cordovaExec, createCordovaNativeCaller, initializePlugin, pluginsMetadata };
export type { BlockingModeListenerResult };
