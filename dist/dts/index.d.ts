import { NativeCaller, DataCaptureContext, MarginsWithUnit, PointWithUnit, LogoStyle, Anchor, FocusGesture, ZoomGesture, Rect, DataCaptureOverlay, DataCaptureViewListener, Point, Quadrilateral, Control } from './core';
import * as scanditDatacaptureFrameworksCore from './core';
export { scanditDatacaptureFrameworksCore as __ScanditCore };
export { AimerViewfinder, Anchor, Brush, Camera, CameraPosition, CameraSettings, CameraSwitchControl, ClusteringMode, Color, ColorFillOverlay, ContextStatus, Control, DataCaptureComponent, DataCaptureContext, DataCaptureContextCreationOptions, DataCaptureContextListener, DataCaptureContextSettings, DataCaptureMode, DataCaptureOverlay, DataCaptureViewListener, Direction, Feedback, FocusGesture, FocusGestureListener, FocusGestureStrategy, FocusRange, FontFamily, FrameData, FrameDataSettings, FrameDataSettingsBuilder, FrameSource, FrameSourceListener, FrameSourceState, ImageBuffer, ImageFrameSource, LaserlineViewfinder, LocationSelection, LogCategory, LogLevel, LogRecord, LogRecordError, LogoStyle, MacroMode, MacroModeListener, MarginsWithUnit, MeasureUnit, NoViewfinder, NoneLocationSelection, NumberWithUnit, OpenSourceSoftwareLicenseInfo, Orientation, PinchToZoom, Point, PointWithUnit, Quadrilateral, RadiusLocationSelection, Rect, RectWithUnit, RectangularLocationSelection, RectangularViewfinder, RectangularViewfinderAnimation, RectangularViewfinderLineStyle, RectangularViewfinderStyle, ScanIntention, ScanditIcon, ScanditIconBuilder, ScanditIconShape, ScanditIconType, ScanditLogger, SelectionMode, SequenceFrameSource, Size, SizeWithAspect, SizeWithUnit, SizeWithUnitAndAspect, SizingMode, Sound, SwipeToZoom, TapToFocus, TextAlignment, TorchListener, TorchState, TorchSwitchControl, Vibration, VideoResolution, Viewfinder, ZoomGesture, ZoomGestureListener, ZoomListener, ZoomSwitchControl, ZoomSwitchOrientation } from './core';

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
declare function initializePlugin(pluginName: string, customInitialization: () => Promise<unknown>): Promise<void>;
declare class CordovaNativeCaller implements NativeCaller {
    private cordovaExec;
    private pluginName;
    private readonly ownedHandlers;
    private readonly eventRegisteredCheckList;
    private static get eventHandlers();
    private static registrationKey;
    constructor(cordovaExec: any, pluginName: string);
    get framework(): string;
    get frameworkVersion(): string;
    callFn(fnName: string, args: object | undefined | null, meta?: {
        isEventRegistration?: boolean;
    }): Promise<any>;
    private clearRegistrationsUndoneBy;
    eventHook(args: any): any;
    registerEvent(evName: string, handler: (args: any) => Promise<void>): Promise<any>;
    unregisterEvent(evName: string, _subscription: any): Promise<void>;
    private setUpEventListener;
    private notifyListeners;
}
declare function createCordovaNativeCaller(cordovaExec: any, pluginName: string): CordovaNativeCaller;

/**
 * This class contains the DataCapture version getter.
 *
 * @since 6.2.0
 */
declare class DataCaptureVersion {
    /**
     * Returns the version of the Scandit Data Capture Plugin.
     *
     * @since 6.2.0
     */
    static get pluginVersion(): string;
    /**
     * Version of the native SDK the plugin is running against. Read from the Core defaults
     * singleton, whose `Version` key is part of the dynamic residual — so this is only populated
     * once `applyDynamicDefaults()` has completed, and empty before native is reachable.
     *
     * Returns the version of the Scandit Data Capture SDK.
     *
     * @since 8.7.0
     */
    static get sdkVersion(): string;
}

/**
 * The capture view is the main UI view to be used together with the data capture context for applications that wish to display a video preview together with additional augmentations such as barcode locations.
 *
 * The data capture view itself only displays the preview and shows UI elements to control the camera, such as buttons to switch torch on and off, or a button to switch between front and back facing cameras. Augmentations, such as the locations of identified barcodes are provided by individual overlays. This view will also display errors in case something goes wrong with its context, see the {@link ContextStatus} for a list of possible errors.
 *
 * Unless otherwise specified, methods and properties of this class should only be accessed from the main thread.
 *
 * **Related topics**: [Get Started](https://docs.scandit.com/sdks/cordova/barcode-capture/get-started), [MatrixScan Get Started](https://docs.scandit.com/sdks/cordova/matrixscan/get-started), Core Concepts <https://docs.scandit.com/core-concepts>.
 *
 * @since 6.1.0
 */
declare class DataCaptureView {
    private baseDataCaptureView;
    private htmlElement;
    private _htmlElementState;
    private scrollListener;
    private domObserver;
    /**
     * Initializes a new data capture view. When a data capture context is provided, the view is associated with the context.
     *
     * The data capture context can be changed at a later point by setting the context property.
     *
     * @since 6.1.0
     */
    static forContext(context: DataCaptureContext | null): DataCaptureView;
    /**
     * Initializes a new data capture view. The context must be provided by setting the context property.
     *
     * @since 6.1.0
     */
    constructor();
    /**
     * The data capture context of this capture view. This property must be set to an instance of the data capture context for this view to display anything.
     *
     * When the capture context is attached to a data capture view, it is removed from any other data capture view it was attached to.
     *
     * @since 6.1.0
     */
    get context(): DataCaptureContext | null;
    set context(context: DataCaptureContext | null);
    private get overlays();
    /**
     * The margins to use for the scan area. The margins are measured from the border of the data capture view and allow to specify a region around the border that is excluded from scanning.
     *
     * By default, the margins are zero and the scanning happens in the visible part of the preview.
     *
     * On iOS, the scan area also excludes the left and right safe area insets of the view: on each side, the larger of the margin and the inset applies. This property keeps returning the margins that were set.
     *
     * @since 6.1.0
     */
    get scanAreaMargins(): MarginsWithUnit;
    set scanAreaMargins(newValue: MarginsWithUnit);
    /**
     * The point of interest of this data capture view. By default, the point of interest is centered in the data capture view. The point of interest is used to control the *center of attention* for the following subsystems:
     *
     * - Auto focus and exposure metering of the camera.
     * - {@link LocationSelection|Location selections} for capture modes that support them. When no location selection is set, the point of interest defines the location at which the recognition optimizes for reading codes/text/etc.
     * - Rendered {@link Viewfinder|viewfinders}.
     *
     * The point of interest can be overwritten by individual capture modes such as {@link BarcodeCapture}. The overwriting point of interest only affects the center of the location selection and viewfinder of said mode, it does not affect the auto focus or exposure metering of the camera.
     *
     * @since 6.1.0
     */
    get pointOfInterest(): PointWithUnit;
    set pointOfInterest(newValue: PointWithUnit);
    /**
     * The style of the logo which can be either the default extended “Scanning By Scandit” or a minimal “Scandit”.
     *
     * This property has no effect when the logo is drawn by one of the viewfinders.
     *
     * @since 6.8.0
     */
    get logoStyle(): LogoStyle;
    set logoStyle(style: LogoStyle);
    /**
     * The anchor point to use for positioning the “Scanning By Scandit” logo. By default the logo is placed in the lower-right corner of the scan area ({@link Anchor.BottomRight}).
     *
     * To shift the logo relative to the anchor position, use the {@link DataCaptureView.logoOffset} property.
     *
     * This property has no effect when the logo is drawn by one of the viewfinders.
     *
     * @since 6.1.0
     */
    get logoAnchor(): Anchor;
    set logoAnchor(newValue: Anchor);
    /**
     * The offset applied to the “Scanning By Scandit” logo relative to the {@link DataCaptureView.logoAnchor|logo anchor}. When specified in pixels ({@link MeasureUnit.Pixel}) or device-independent pixels ({@link MeasureUnit.DIP}), the offset is used as-is. When specified as a fraction ({@link MeasureUnit.Fraction}), the offset is computed relative to the view size minus the scan area margins. For example, a value of 0.1 for the x-coordinate will set the offset to be 10% of the view width minus the left and right margins.
     *
     * This property has no effect when the logo is drawn by one of the viewfinders.
     *
     * @since 6.1.0
     */
    get logoOffset(): PointWithUnit;
    set logoOffset(newValue: PointWithUnit);
    /**
     * The gesture used to focus. Defaults to {@link TapToFocus}. Set to *null* if no focus gesture is desired.
     *
     * @since 6.7.0
     */
    get focusGesture(): FocusGesture | null;
    set focusGesture(newValue: FocusGesture | null);
    /**
     * The gestures used to zoom. Defaults to [{@link SwipeToZoom}, {@link PinchToZoom}]. Set to empty array if no zoom gesture is desired.
     *
     * @since 8.4.0
     */
    get zoomGestures(): ZoomGesture[];
    set zoomGestures(newValue: ZoomGesture[]);
    /**
     * The gesture used to zoom. Defaults to {@link SwipeToZoom}. Set to *null* if no zoom gesture is desired.
     *
     * @since 6.7.0
     * @deprecated Use zoomGestures instead. Will be removed in a future version.
     */
    get zoomGesture(): ZoomGesture | null;
    /** @deprecated Use zoomGestures instead. Will be removed in a future version. */
    set zoomGesture(newValue: ZoomGesture | null);
    /**
     * When enabled, the data capture view may display notifications to inform users about update in zoom level. Defaults to *true*.
     *
     * @since 8.3.0
     */
    get shouldShowZoomNotification(): boolean;
    set shouldShowZoomNotification(newValue: boolean);
    /**
     * Sets a custom property on this data capture view. This function is for internal use. Any features and functionality offered through this method can and will vanish without public notice from one version to the next.
     *
     * @since 8.3.0
     */
    setProperty<T>(name: string, value: T): void;
    private set htmlElementState(value);
    private get htmlElementState();
    private orientationChangeListener;
    /**
     * Connect the data capture view to a given HTML element, so it’s size and position can be mirrored.
     *
     * To position the capture view below the WebView and show content over the camera preview, change the z-index of the element to be less than 0. If you do this, make sure that the background of your HTML page is transparent, so the capture view positioned under the WebView can be seen.
     *
     * Should not be used together with {@link DataCaptureView.setFrame}. One strategy to size the capture view should be chosen.
     *
     * @since 6.1.0
     */
    connectToElement(element: HTMLElement): Promise<void>;
    /**
     * Detach the capture view from the currently connected HTML element. This releases the HTML element and removes any listeners or resources related to it.
     *
     * @since 6.9.0
     */
    detachFromElement(): void;
    /**
     * Manually set a specific size and position for the capture view.
     *
     * To position the capture view below the WebView and show content over the camera preview, set the isUnderContent argument to *true*. If you do this, make sure that the background of your HTML page is transparent, so the capture view positioned under the WebView can be seen.
     *
     * Should not be used together with {@link DataCaptureView.connectToElement}. One strategy to size the capture view should be chosen.
     *
     * @since 6.3.1
     */
    setFrame(frame: Rect, isUnderContent?: boolean): Promise<void>;
    /**
     * Sets the view to be visible.
     *
     * Should only be used with {@link DataCaptureView.setFrame}.
     *
     * @since 6.3.1
     */
    show(): Promise<void>;
    /**
     * Sets the view not to be visible.
     *
     * Should only be used with {@link DataCaptureView.setFrame}.
     *
     * @since 6.3.1
     */
    hide(): Promise<void>;
    /**
     * Adds the overlay to this data capture view. If the overlay is already part of this view, the call has no effect.
     *
     * @since 6.1.0
     */
    addOverlay(overlay: DataCaptureOverlay): Promise<void>;
    /**
     * Removes overlay from this data capture view. If the overlay is not part of this view, the call has no effect.
     *
     * @since 6.1.0
     */
    removeOverlay(overlay: DataCaptureOverlay): Promise<void>;
    /**
     * Adds the listener to this data capture view.
     *
     * In case the same listener is already observing this instance, calling this method will not add the listener again.
     *
     * @since 6.1.0
     */
    addListener(listener: DataCaptureViewListener): void;
    /**
     * Removes a previously added listener from this data capture view.
     *
     * In case the listener is not currently observing this instance, calling this method has no effect.
     *
     * @since 6.1.0
     */
    removeListener(listener: DataCaptureViewListener): void;
    /**
     * Converts a point in the coordinate system of the last visible frame and maps it to a coordinate in the view.
     *
     * This method is thread-safe and can be called from any thread.
     *
     * @since 6.1.0
     */
    viewPointForFramePoint(point: Point): Promise<Point>;
    /**
     * Converts a quadrilateral in the coordinate system of the last visible frame and maps it to a coordinate in the view.
     *
     * @since 6.1.0
     */
    viewQuadrilateralForFrameQuadrilateral(quadrilateral: Quadrilateral): Promise<Quadrilateral>;
    /**
     * Adds the control to the data capture view. In case multiple controls get added, the order in which {@link DataCaptureView.addControl} gets called determines how the controls are going to be laid out. If the control is already part of this view, the call has no effect.
     *
     * @since 6.8.0
     */
    addControl(control: Control): Promise<void>;
    /**
     * Adds the control to the data capture view at the specified anchor and with the given offset. Only one control per type can be added at any point in time, trying to add a second instance of the same control type will result in the first one being removed. Adding a control at an anchor already taken will replace the previous control there. The offset x will move the control away from the border of the data capture view horizontally, which means that controls anchored on the left will move to the right and vice-versa. Controls anchored in the center horizontally will also move to the right. The offset y will move the control away from the border of the data capture view vertically, which means that controls anchored on the top will move downward and controls anchored to the bottom will move upward. Controls anchored in the center vertically will also move upward.
     *
     * @since 6.22.0
     */
    addControlWithAnchorAndOffset(control: Control, anchor: Anchor, offset: PointWithUnit): void;
    /**
     * Removes the previously added control from data capture view. If the control is not part of this view, the call has no effect.
     *
     * @since 6.8.0
     */
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
