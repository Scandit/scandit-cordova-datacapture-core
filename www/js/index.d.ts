declare module Scandit {

interface PrivateCamera {
    context: DataCaptureContext | null;
    position: CameraPosition;
    _desiredState: FrameSourceState;
    desiredTorchState: TorchState;
    settings: CameraSettings;
    listeners: FrameSourceListener[];
    _proxy: CameraProxy;
    proxy: CameraProxy;
    initialize: () => void;
    didChange: () => Promise<void>;
}
export class Camera implements FrameSource {
    private type;
    private cameraType;
    private settings;
    private position;
    private _desiredTorchState;
    private _desiredState;
    private listeners;
    private context;
    private _proxy;
    private readonly proxy;
    static readonly default: Camera | null;
    static readonly sparkCapture: Camera | null;
    static atPosition(cameraPosition: CameraPosition): Camera | null;
    readonly desiredState: FrameSourceState;
    readonly isTorchAvailable: boolean;
    desiredTorchState: TorchState;
    switchToDesiredState(state: FrameSourceState): Promise<void>;
    getCurrentState(): Promise<FrameSourceState>;
    getIsTorchAvailable(): Promise<boolean>;
    addListener(listener: FrameSourceListener | null): void;
    removeListener(listener: FrameSourceListener | null): void;
    applySettings(settings: CameraSettings): Promise<void>;
    private initialize;
    private didChange;
}


export enum FrameSourceState {
    On = "on",
    Off = "off",
    Starting = "starting",
    Stopping = "stopping",
    Standby = "standby",
    BootingUp = "bootingUp",
    WakingUp = "wakingUp",
    GoingToSleep = "goingToSleep",
    ShuttingDown = "shuttingDown"
}
export enum TorchState {
    On = "on",
    Off = "off",
    Auto = "auto"
}
export enum CameraPosition {
    WorldFacing = "worldFacing",
    UserFacing = "userFacing",
    Unspecified = "unspecified"
}
export enum VideoResolution {
    Auto = "auto",
    HD = "hd",
    FullHD = "fullHd",
    UHD4K = "uhd4k"
}
export enum FocusRange {
    Full = "full",
    Near = "near",
    Far = "far"
}
export enum FocusGestureStrategy {
    None = "none",
    Manual = "manual",
    ManualUntilCapture = "manualUntilCapture",
    AutoOnLocation = "autoOnLocation"
}
export interface FrameSourceListener {
    didChangeState?(frameSource: FrameSource, newState: FrameSourceState): void;
}
export interface FrameSource {
    readonly desiredState: FrameSourceState;
    switchToDesiredState(desiredState: FrameSourceState): Promise<void>;
    getCurrentState(): Promise<FrameSourceState>;
    addListener(listener: FrameSourceListener): void;
    removeListener(listener: FrameSourceListener): void;
}
export interface CameraSettingsJSON {
    preferredResolution: string;
    zoomFactor: number;
    focusRange: string;
    zoomGestureZoomFactor: number;
    focusGestureStrategy: string;
    shouldPreferSmoothAutoFocus: boolean;
    api: number;
}
interface PrivateCameraSettings {
    fromJSON(json: CameraSettingsJSON): CameraSettings;
}
export class CameraSettings {
    preferredResolution: VideoResolution;
    zoomFactor: number;
    zoomGestureZoomFactor: number;
    private api;
    private focus;
    focusRange: FocusRange;
    focusGestureStrategy: FocusGestureStrategy;
    shouldPreferSmoothAutoFocus: boolean;
    maxFrameRate: number;
    private static fromJSON;
    constructor();
    constructor(settings: CameraSettings);
    setProperty(name: string, value: any): void;
    getProperty(name: string): any;
}


export interface PointJSON {
    x: number;
    y: number;
}
interface PrivatePoint {
    fromJSON(json: PointJSON): Point;
}
export class Point {
    private _x;
    private _y;
    readonly x: number;
    readonly y: number;
    private static fromJSON;
    constructor(x: number, y: number);
}
export interface QuadrilateralJSON {
    topLeft: PointJSON;
    topRight: PointJSON;
    bottomRight: PointJSON;
    bottomLeft: PointJSON;
}
interface PrivateQuadrilateral {
    fromJSON(json: QuadrilateralJSON): Quadrilateral;
}
export class Quadrilateral {
    private _topLeft;
    private _topRight;
    private _bottomRight;
    private _bottomLeft;
    readonly topLeft: Point;
    readonly topRight: Point;
    readonly bottomRight: Point;
    readonly bottomLeft: Point;
    private static fromJSON;
    constructor(topLeft: Point, topRight: Point, bottomRight: Point, bottomLeft: Point);
}
export enum MeasureUnit {
    DIP = "dip",
    Pixel = "pixel",
    Fraction = "fraction"
}
export interface NumberWithUnitJSON {
    value: number;
    unit: string;
}
interface PrivateNumberWithUnit {
    fromJSON(json: NumberWithUnitJSON): NumberWithUnit;
}
export class NumberWithUnit {
    private _value;
    private _unit;
    readonly value: number;
    readonly unit: MeasureUnit;
    private static fromJSON;
    constructor(value: number, unit: MeasureUnit);
}
export interface PointWithUnitJSON {
    x: NumberWithUnitJSON;
    y: NumberWithUnitJSON;
}
interface PrivatePointWithUnit {
    readonly zero: PointWithUnit;
    fromJSON(json: PointWithUnitJSON): PointWithUnit;
}
export class PointWithUnit {
    private _x;
    private _y;
    readonly x: NumberWithUnit;
    readonly y: NumberWithUnit;
    private static fromJSON;
    private static readonly zero;
    constructor(x: NumberWithUnit, y: NumberWithUnit);
}
export class Rect {
    private _origin;
    private _size;
    readonly origin: Point;
    readonly size: Size;
    constructor(origin: Point, size: Size);
}
export class RectWithUnit {
    private _origin;
    private _size;
    readonly origin: PointWithUnit;
    readonly size: SizeWithUnit;
    constructor(origin: PointWithUnit, size: SizeWithUnit);
}
export class SizeWithUnit {
    private _width;
    private _height;
    readonly width: NumberWithUnit;
    readonly height: NumberWithUnit;
    constructor(width: NumberWithUnit, height: NumberWithUnit);
}
export interface SizeJSON {
    width: number;
    height: number;
}
export class Size {
    private _width;
    private _height;
    readonly width: number;
    readonly height: number;
    private static fromJSON;
    constructor(width: number, height: number);
}
export class SizeWithAspect {
    private _size;
    private _aspect;
    readonly size: NumberWithUnit;
    readonly aspect: number;
    constructor(size: NumberWithUnit, aspect: number);
}
export enum SizingMode {
    WidthAndHeight = "widthAndHeight",
    WidthAndAspectRatio = "widthAndAspectRatio",
    HeightAndAspectRatio = "heightAndAspectRatio",
    ShorterDimensionAndAspectRatio = "shorterDimensionAndAspectRatio"
}
export interface SizeWithUnitAndAspectJSON {
    width?: NumberWithUnitJSON;
    height?: NumberWithUnitJSON;
    shorterDimension?: NumberWithUnitJSON;
    aspect?: number;
}
interface PrivateSizeWithUnitAndAspect {
    fromJSON(json: SizeWithUnitAndAspectJSON): SizeWithUnitAndAspect;
}
export class SizeWithUnitAndAspect {
    private _widthAndHeight;
    private _widthAndAspectRatio;
    private _heightAndAspectRatio;
    private _shorterDimensionAndAspectRatio;
    readonly widthAndHeight: SizeWithUnit | null;
    readonly widthAndAspectRatio: SizeWithAspect | null;
    readonly heightAndAspectRatio: SizeWithAspect | null;
    readonly shorterDimensionAndAspectRatio: SizeWithAspect | null;
    readonly sizingMode: SizingMode;
    private static sizeWithWidthAndHeight;
    private static sizeWithWidthAndAspectRatio;
    private static sizeWithHeightAndAspectRatio;
    private static sizeWithShorterDimensionAndAspectRatio;
    private static fromJSON;
    toJSON(): object;
}
export interface MarginsWithUnitJSON {
    left: NumberWithUnitJSON;
    right: NumberWithUnitJSON;
    top: NumberWithUnitJSON;
    bottom: NumberWithUnitJSON;
}
interface PrivateMarginsWithUnit {
    readonly zero: MarginsWithUnit;
    fromJSON(json: MarginsWithUnitJSON): MarginsWithUnit;
}
export class MarginsWithUnit {
    private _left;
    private _right;
    private _top;
    private _bottom;
    readonly left: NumberWithUnit;
    readonly right: NumberWithUnit;
    readonly top: NumberWithUnit;
    readonly bottom: NumberWithUnit;
    private static fromJSON;
    private static readonly zero;
    constructor(left: NumberWithUnit, right: NumberWithUnit, top: NumberWithUnit, bottom: NumberWithUnit);
} type ColorJSON = string;
interface PrivateColor {
    fromJSON(json: ColorJSON): Color;
}
export class Color {
    private hexadecimalString;
    readonly redComponent: string;
    readonly greenComponent: string;
    readonly blueComponent: string;
    readonly alphaComponent: string;
    readonly red: number;
    readonly green: number;
    readonly blue: number;
    readonly alpha: number;
    static fromHex(hex: string): Color;
    static fromRGBA(red: number, green: number, blue: number, alpha?: number): Color;
    private static hexToNumber;
    private static fromJSON;
    private static numberToHex;
    private static normalizeHex;
    private static normalizeAlpha;
    private constructor();
    withAlpha(alpha: number): Color;
    toJSON(): string;
}
export enum Orientation {
    Unknown = "unknown",
    Portrait = "portrait",
    PortraitUpsideDown = "portraitUpsideDown",
    LandscapeRight = "landscapeRight",
    LandscapeLeft = "landscapeLeft"
}
export enum Direction {
    None = "none",
    Horizontal = "horizontal",
    LeftToRight = "leftToRight",
    RightToLeft = "rightToLeft",
    Vertical = "vertical",
    TopToBottom = "topToBottom",
    BottomToTop = "bottomToTop"
}


interface PrivateDataCaptureMode {
    _context: DataCaptureContext | null;
}
export interface DataCaptureMode {
    isEnabled: boolean;
    readonly context: DataCaptureContext | null;
}
interface PrivateDataCaptureComponent {
    _context: DataCaptureContext;
}
export interface DataCaptureComponent {
    readonly id: string;
}
interface PrivateDataCaptureContext {
    proxy: DataCaptureContextProxy;
    modes: [DataCaptureMode];
    components: [DataCaptureComponent];
    initialize: () => void;
    update: () => Promise<void>;
    addComponent: (component: DataCaptureComponent) => Promise<void>;
}
export interface DataCaptureContextCreationOptions {
    deviceName?: string | null;
}
export class DataCaptureContextSettings {
    constructor();
    setProperty(name: string, value: any): void;
    getProperty(name: string): any;
}
export class DataCaptureContext {
    private licenseKey;
    private deviceName;
    private framework;
    private frameworkVersion;
    private settings;
    private _frameSource;
    private view;
    private modes;
    private components;
    private proxy;
    private listeners;
    readonly frameSource: FrameSource | null;
    static readonly deviceID: string | null;
    readonly deviceID: string | null;
    static forLicenseKey(licenseKey: string): DataCaptureContext;
    static forLicenseKeyWithSettings(licenseKey: string, settings: DataCaptureContextSettings | null): DataCaptureContext;
    static forLicenseKeyWithOptions(licenseKey: string, options: DataCaptureContextCreationOptions | null): DataCaptureContext;
    private constructor();
    setFrameSource(frameSource: FrameSource | null): Promise<void>;
    addListener(listener: DataCaptureContextListener): void;
    removeListener(listener: DataCaptureContextListener): void;
    addMode(mode: DataCaptureMode): void;
    removeMode(mode: DataCaptureMode): void;
    removeAllModes(): void;
    dispose(): void;
    applySettings(settings: DataCaptureContextSettings): Promise<void>;
    private initialize;
    private update;
    private addComponent;
}


export interface DataCaptureContextListener {
    didChangeStatus?(context: DataCaptureContext, contextStatus: ContextStatus): void;
    didStartObservingContext?(context: DataCaptureContext): void;
}
interface ContextStatusJSON {
    code: number;
    isValid: boolean;
    message: string;
}
interface PrivateContextStatus {
    fromJSON(json: ContextStatusJSON): ContextStatus;
}
export class ContextStatus {
    private _message;
    private _code;
    private _isValid;
    private static fromJSON;
    readonly message: string;
    readonly code: number;
    readonly isValid: boolean;
}


export interface DataCaptureOverlay {
}
export interface Control {
}
export class TorchSwitchControl implements Control {
    private type;
    private icon;
    private view;
    torchOffImage: string | null;
    torchOffPressedImage: string | null;
    torchOnImage: string | null;
    torchOnPressedImage: string | null;
}
export interface DataCaptureViewListener {
    didChangeSize?(view: DataCaptureView, size: Size, orientation: Orientation): void;
}
export enum Anchor {
    TopLeft = "topLeft",
    TopCenter = "topCenter",
    TopRight = "topRight",
    CenterLeft = "centerLeft",
    Center = "center",
    CenterRight = "centerRight",
    BottomLeft = "bottomLeft",
    BottomCenter = "bottomCenter",
    BottomRight = "bottomRight"
}
export class HTMLElementState {
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
    readonly isValid: boolean;
    didChangeComparedTo(other: HTMLElementState): boolean;
}
interface PrivateDataCaptureView {
    htmlElement: HTMLElement | null;
    _htmlElementState: HTMLElementState;
    htmlElementState: HTMLElementState;
    readonly viewProxy: DataCaptureViewProxy;
    _viewProxy: DataCaptureViewProxy;
    overlays: DataCaptureOverlay[];
    controls: Control[];
    listeners: DataCaptureViewListener[];
    addControl(control: Control): void;
    removeControl(control: Control): void;
    initialize(): void;
    updatePositionAndSize(): void;
    _show(): void;
    _hide(): void;
    elementDidChange(): void;
    subscribeToChangesOnHTMLElement(): void;
    controlUpdated(): void;
}
export class DataCaptureView {
    private _context;
    context: DataCaptureContext | null;
    scanAreaMargins: MarginsWithUnit;
    pointOfInterest: PointWithUnit;
    logoAnchor: Anchor;
    logoOffset: PointWithUnit;
    focusGesture: FocusGesture | null;
    zoomGesture: ZoomGesture | null;
    logoStyle: LogoStyle;
    private overlays;
    private controls;
    private _viewProxy;
    private readonly viewProxy;
    private listeners;
    private htmlElement;
    private _htmlElementState;
    private htmlElementState;
    private scrollListener;
    private domObserver;
    private orientationChangeListener;
    /**
     * The current context as a PrivateDataCaptureContext
     */
    private readonly privateContext;
    static forContext(context: DataCaptureContext | null): DataCaptureView;
    constructor();
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
    removeControl(control: Control): void;
    private controlUpdated;
    private initialize;
    private subscribeToChangesOnHTMLElement;
    private unsubscribeFromChangesOnHTMLElement;
    private elementDidChange;
    private updatePositionAndSize;
    private _show;
    private _hide;
}


export interface FocusGesture {
}
export interface FocusGestureJSON {
    type: string;
}
class PrivateFocusGestureDeserializer {
    static fromJSON(json: FocusGestureJSON | null): FocusGesture | null;
}
export class TapToFocus implements FocusGesture {
    private type;
    constructor();
}
export interface ZoomGesture {
}
export interface ZoomGestureJSON {
    type: string;
}
class PrivateZoomGestureDeserializer {
    static fromJSON(json: ZoomGestureJSON | null): ZoomGesture | null;
}
export class SwipeToZoom implements ZoomGesture {
    private type;
    constructor();
}
export enum LogoStyle {
    Minimal = "minimal",
    Extended = "extended"
}


export interface LocationSelection {
}
class PrivateLocationSelection {
    static fromJSON(json: {
        type: string;
    }): LocationSelection;
}
export const NoneLocationSelection: {
    type: string;
};
interface RadiusLocationSelectionJSON {
    type: string;
    radius: NumberWithUnitJSON;
}
interface PrivateRadiusLocationSelection {
    fromJSON(json: RadiusLocationSelectionJSON): RadiusLocationSelection;
}
export class RadiusLocationSelection implements LocationSelection {
    private type;
    private _radius;
    readonly radius: NumberWithUnit;
    private static fromJSON;
    constructor(radius: NumberWithUnit);
}
interface RectangularLocationSelectionJSON {
    type: string;
    size: SizeWithUnitAndAspectJSON;
}
interface PrivateRectangularLocationSelection {
    fromJSON(json: RectangularLocationSelectionJSON): RectangularLocationSelection;
}
export class RectangularLocationSelection implements LocationSelection {
    private type;
    private _sizeWithUnitAndAspect;
    readonly sizeWithUnitAndAspect: SizeWithUnitAndAspect;
    private static fromJSON;
    static withSize(size: SizeWithUnit): RectangularLocationSelection;
    static withWidthAndAspectRatio(width: NumberWithUnit, heightToWidthAspectRatio: number): RectangularLocationSelection;
    static withHeightAndAspectRatio(height: NumberWithUnit, widthToHeightAspectRatio: number): RectangularLocationSelection;
}


interface PrivateBrush {
    toJSON(): BrushJSON;
}
export interface BrushJSON {
    fill: {
        color: Color;
    };
    stroke: {
        color: Color;
        width: number;
    };
}
export class Brush {
    private fill;
    private stroke;
    static readonly transparent: Brush;
    readonly fillColor: Color;
    readonly strokeColor: Color;
    readonly strokeWidth: number;
    constructor();
    constructor(fillColor: Color, strokeColor: Color, strokeWidth: number);
}
export interface Viewfinder {
}
export const NoViewfinder: {
    type: string;
};
export class LaserlineViewfinder implements Viewfinder {
    private type;
    private readonly _style;
    width: NumberWithUnit;
    enabledColor: Color;
    disabledColor: Color;
    constructor();
    constructor(style: LaserlineViewfinderStyle);
    readonly style: LaserlineViewfinderStyle;
}
export class RectangularViewfinder implements Viewfinder {
    private type;
    private readonly _style;
    private readonly _lineStyle;
    private _dimming;
    private _animation;
    private _sizeWithUnitAndAspect;
    color: Color;
    readonly sizeWithUnitAndAspect: SizeWithUnitAndAspect;
    constructor();
    constructor(style: RectangularViewfinderStyle);
    constructor(style: RectangularViewfinderStyle, lineStyle: RectangularViewfinderLineStyle);
    readonly style: RectangularViewfinderStyle;
    readonly lineStyle: RectangularViewfinderLineStyle;
    dimming: number;
    animation: RectangularViewfinderAnimation | null;
    setSize(size: SizeWithUnit): void;
    setWidthAndAspectRatio(width: NumberWithUnit, heightToWidthAspectRatio: number): void;
    setHeightAndAspectRatio(height: NumberWithUnit, widthToHeightAspectRatio: number): void;
    setShorterDimensionAndAspectRatio(fraction: number, aspectRatio: number): void;
}
export class SpotlightViewfinder implements Viewfinder {
    private type;
    private _sizeWithUnitAndAspect;
    enabledBorderColor: Color;
    disabledBorderColor: Color;
    backgroundColor: Color;
    readonly sizeWithUnitAndAspect: SizeWithUnitAndAspect;
    constructor();
    setSize(size: SizeWithUnit): void;
    setWidthAndAspectRatio(width: NumberWithUnit, heightToWidthAspectRatio: number): void;
    setHeightAndAspectRatio(height: NumberWithUnit, widthToHeightAspectRatio: number): void;
}
export class AimerViewfinder implements Viewfinder {
    private type;
    frameColor: Color;
    dotColor: Color;
    constructor();
}


export enum RectangularViewfinderStyle {
    Legacy = "legacy",
    Rounded = "rounded",
    Square = "square"
}
export enum RectangularViewfinderLineStyle {
    Light = "light",
    Bold = "bold"
}
export enum LaserlineViewfinderStyle {
    Legacy = "legacy",
    Animated = "animated"
}
interface RectangularViewfinderAnimationJSON {
    readonly looping: boolean;
}
interface PrivateRectangularViewfinderAnimation {
    fromJSON(json: RectangularViewfinderAnimationJSON): RectangularViewfinderAnimation;
}
export class RectangularViewfinderAnimation {
    private readonly _isLooping;
    private static fromJSON;
    readonly isLooping: boolean;
    constructor(isLooping: boolean);
}


export interface VibrationJSON {
    type: string;
}
interface PrivateVibration {
    fromJSON(json: VibrationJSON): Vibration;
}
export class Vibration {
    private type;
    static readonly defaultVibration: Vibration;
    static readonly selectionHapticFeedback: Vibration;
    static readonly successHapticFeedback: Vibration;
    static readonly impactHapticFeedback: Vibration;
    private static fromJSON;
    private constructor();
}
export interface SoundJSON {
    resource: string | null;
}
interface PrivateSound {
    fromJSON(json: SoundJSON): Sound;
}
export class Sound {
    resource: string | null;
    static readonly defaultSound: Sound;
    private static fromJSON;
    constructor(resource: Optional<string>);
}
export interface FeedbackJSON {
    vibration: VibrationJSON | null;
    sound: SoundJSON | null;
}
interface PrivateFeedback {
    fromJSON(json: FeedbackJSON): Feedback;
}
export class Feedback {
    static readonly defaultFeedback: Feedback;
    private _vibration;
    private _sound;
    private proxy;
    readonly vibration: Vibration | null;
    readonly sound: Sound | null;
    private static fromJSON;
    constructor(vibration: Optional<Vibration>, sound: Optional<Sound>);
    emit(): void;
    private initialize;
}


export class DataCaptureVersion {
    static readonly pluginVersion: string;
}


export class VolumeButtonObserver {
    private didChangeVolume;
    private proxy;
    constructor(didChangeVolume: () => void);
    dispose(): void;
    private initialize;
}

}
