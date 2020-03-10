/// <amd-module name="scandit-cordova-datacapture-core.DataCaptureView"/>
// ^ needed because Cordova can't resolve "../xx" style dependencies
import { MarginsWithUnit, Orientation, Point, PointWithUnit, Quadrilateral, Size } from './Common';
import { Cordova } from './Cordova/Cordova';
import { DataCaptureViewProxy } from './Cordova/DataCaptureViewProxy';
import { DataCaptureContext, PrivateDataCaptureContext } from './DataCaptureContext';
import { DefaultSerializeable, ignoreFromSerialization, Serializeable } from './Serializeable';

// tslint:disable-next-line:no-empty-interface
export interface DataCaptureOverlay {}

// tslint:disable-next-line:no-empty-interface
export interface Control extends Serializeable {}

// TODO: add back torch switch control https://jira.scandit.com/browse/SDC-1771
class TorchSwitchControl extends DefaultSerializeable implements Control {
  private type = 'torch';
}

export interface DataCaptureViewListener {
  didChangeSize(view: DataCaptureView, size: Size, orientation: Orientation): void;
}

export enum Anchor {
  TopLeft = 'topLeft',
  TopCenter = 'topCenter',
  TopRight = 'topRight',
  CenterLeft = 'centerLeft',
  Center = 'center',
  CenterRight = 'centerRight',
  BottomLeft = 'bottomLeft',
  BottomCenter = 'bottomCenter',
  BottomRight = 'bottomRight',
}

export class HTMLElementState {
  public isShown = false;
  public position: Optional<{ top: number, left: number }> = null;
  public size: Optional<{ width: number, height: number }> = null;
}

export interface PrivateDataCaptureView {
  addControl(control: Control): void;
  removeControl(control: Control): void;
}

export class DataCaptureView extends DefaultSerializeable {
  @ignoreFromSerialization
  private _context: Optional<DataCaptureContext> = null;

  public get context(): Optional<DataCaptureContext> {
    return this._context;
  }

  public set context(context: Optional<DataCaptureContext>) {
    this._context = context;
    if (context) {
      (context as any).view = this;
    }
  }

  public scanAreaMargins: MarginsWithUnit = Cordova.defaults.DataCaptureView.scanAreaMargins;
  public pointOfInterest: PointWithUnit = Cordova.defaults.DataCaptureView.pointOfInterest;
  public logoAnchor: Anchor = Cordova.defaults.DataCaptureView.logoAnchor;
  public logoOffset: PointWithUnit = Cordova.defaults.DataCaptureView.logoOffset;

  private overlays: DataCaptureOverlay[] = [];
  private controls: Control[] = [];

  @ignoreFromSerialization
  private _viewProxy: DataCaptureViewProxy;

  private get viewProxy(): DataCaptureViewProxy {
    if (!this._viewProxy) {
      this.initialize();
    }
    return this._viewProxy as DataCaptureViewProxy;
  }

  @ignoreFromSerialization
  private listeners: DataCaptureViewListener[] = [];

  @ignoreFromSerialization
  private htmlElement: Optional<HTMLElement> = null;

  @ignoreFromSerialization
  private _htmlElementState = new HTMLElementState();

  private set htmlElementState(newState: HTMLElementState) {
    const didChangeShown = this._htmlElementState.isShown !== newState.isShown;
    const didChangePositionOrSize = this._htmlElementState.position !== newState.position
      || this._htmlElementState.size !== newState.size;

    this._htmlElementState = newState;

    if (this._htmlElementState.isShown && didChangePositionOrSize) {
      this.updatePositionAndSize();
    }

    if (didChangeShown) {
      if (this._htmlElementState.isShown) {
        this.show();
      } else {
        this.hide();
      }
    }
  }

  private get htmlElementState(): HTMLElementState {
    return this._htmlElementState;
  }

  /**
   * The current context as a PrivateDataCaptureContext
   */
  private get privateContext(): PrivateDataCaptureContext {
    return this.context as any as PrivateDataCaptureContext;
  }

  public static forContext(context: Optional<DataCaptureContext>): DataCaptureView {
    const view = new DataCaptureView();
    view.context = context;
    return view;
  }

  public constructor() {
    super();
  }

  public connectToElement(element: HTMLElement): void {
    this.htmlElement = element;
    this.htmlElementState = new HTMLElementState();

    // Initial update
    this.elementDidChange();

    this.subscribeToChangesOnHTMLElement();
  }

  public addOverlay(overlay: DataCaptureOverlay): void {
    if (this.overlays.includes(overlay)) {
      return;
    }
    this.overlays.push(overlay);
    this.privateContext.update();
  }

  public removeOverlay(overlay: DataCaptureOverlay): void {
    if (!this.overlays.includes(overlay)) {
      return;
    }
    this.overlays.splice(this.overlays.indexOf(overlay), 1);
    this.privateContext.update();
  }

  public addListener(listener: DataCaptureViewListener): void {
    if (!this.listeners.includes(listener)) {
      this.listeners.push(listener);
    }
  }

  public removeListener(listener: DataCaptureViewListener): void {
    if (this.listeners.includes(listener)) {
      this.listeners.splice(this.listeners.indexOf(listener), 1);
    }
  }

  public viewPointForFramePoint(point: Point): Promise<Point> {
    return this.viewProxy.viewPointForFramePoint(point);
  }

  public viewQuadrilateralForFrameQuadrilateral(quadrilateral: Quadrilateral): Promise<Quadrilateral> {
    return this.viewProxy.viewQuadrilateralForFrameQuadrilateral(quadrilateral);
  }

  // TODO: add back torch switch control https://jira.scandit.com/browse/SDC-1771
  private addControl(control: Control): void {
    if (!this.controls.includes(control)) {
      this.controls.push(control);
      this.privateContext.update();
    }
  }

  // TODO: add back torch switch control https://jira.scandit.com/browse/SDC-1771
  private removeControl(control: Control): void {
    if (this.controls.includes(control)) {
      this.controls.splice(this.overlays.indexOf(control), 1);
      this.privateContext.update();
    }
  }

  private initialize(): void {
    if (this._viewProxy) {
      return;
    }
    this._viewProxy = DataCaptureViewProxy.forDataCaptureView(this);
  }

  private subscribeToChangesOnHTMLElement(): void {
    // Scroll events
    window.addEventListener('scroll', this.elementDidChange.bind(this));

    // DOM changes
    const observer = new MutationObserver(this.elementDidChange.bind(this));
    observer.observe(document, { attributes: true, childList: true, subtree: true });

    // Orientation changes
    window.addEventListener('orientationchange', () => {
      this.elementDidChange();
      // SDC-1784 -> workaround because at the moment of this callback the element doesn't have the updated size.
      setTimeout(this.elementDidChange.bind(this), 100);
      setTimeout(this.elementDidChange.bind(this), 300);
      setTimeout(this.elementDidChange.bind(this), 1000);
    });
  }

  private elementDidChange(): void {
    if (!this.htmlElement) {
      this.htmlElementState = new HTMLElementState();
      return;
    }

    const newState = new HTMLElementState();

    const boundingRect = this.htmlElement.getBoundingClientRect();
    newState.position = { top: boundingRect.top, left: boundingRect.left };
    newState.size = { width: boundingRect.width, height: boundingRect.height };

    const isDisplayed = getComputedStyle(this.htmlElement).display !== 'none';
    const isInDOM = document.body.contains(this.htmlElement);
    newState.isShown = isDisplayed && isInDOM && !this.htmlElement.hidden;

    this.htmlElementState = newState;
  }

  private updatePositionAndSize(): void {
    if (!this.htmlElementState || !this.htmlElementState.position || !this.htmlElementState.size) {
      return;
    }

    this.viewProxy.setPositionAndSize(
      this.htmlElementState.position.top,
      this.htmlElementState.position.left,
      this.htmlElementState.size.width,
      this.htmlElementState.size.height,
    );
  }

  private show(): void {
    if (!this.context) {
      throw new Error('There should be a context attached to a view that should be shown');
    }

    this.privateContext.initialize();

    this.updatePositionAndSize();
    this.viewProxy.show();
  }

  private hide(): void {
    this.viewProxy.hide();
  }
}
