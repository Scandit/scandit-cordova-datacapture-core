/// <amd-module name="scandit-cordova-datacapture-core.DataCaptureViewProxy"/>
// ^ needed because Cordova can't resolve "../xx" style dependencies
import { Point, PrivatePoint, PrivateQuadrilateral, Quadrilateral, Size } from '../Common';
import { DataCaptureView, DataCaptureViewListener } from '../DataCaptureView';
import { Cordova, CordovaFunction } from './Cordova';

enum DataCaptureViewListenerEvent {
  DidChangeSizeOrientation = 'didChangeSizeOrientation',
}

export class DataCaptureViewProxy {
  private static cordovaExec = Cordova.exec;
  private view: DataCaptureView;

  public static forDataCaptureView(view: DataCaptureView): DataCaptureViewProxy {
    const viewProxy = new DataCaptureViewProxy();
    viewProxy.view = view;
    viewProxy.initialize();
    return viewProxy;
  }

  public setPositionAndSize(top: number, left: number, width: number, height: number) {
    DataCaptureViewProxy.cordovaExec(
      null,
      null,
      CordovaFunction.SetViewPositionAndSize,
      [{ top, left, width, height }],
    );
  }

  public show() {
    DataCaptureViewProxy.cordovaExec(
      null,
      null,
      CordovaFunction.ShowView,
      null,
    );
  }

  public hide() {
    DataCaptureViewProxy.cordovaExec(
      null,
      null,
      CordovaFunction.HideView,
      null,
    );
  }

  public viewPointForFramePoint(point: Point): Promise<Point> {
    return new Promise((resolve, reject) => {
      DataCaptureViewProxy.cordovaExec(
        (convertedPoint: any) => resolve((Point as any as PrivatePoint).fromJSON(convertedPoint)),
        reject,
        CordovaFunction.ViewPointForFramePoint,
        [point.toJSON()],
      );
    });
  }

  public viewQuadrilateralForFrameQuadrilateral(quadrilateral: Quadrilateral): Promise<Quadrilateral> {
    return new Promise((resolve, reject) => {
      DataCaptureViewProxy.cordovaExec(
        (convertedQuadrilateral: any) => resolve(
          (Quadrilateral as any as PrivateQuadrilateral).fromJSON(convertedQuadrilateral)),
        reject,
        CordovaFunction.ViewQuadrilateralForFrameQuadrilateral,
        [quadrilateral.toJSON()],
      );
    });
  }

  private subscribeListener() {
    DataCaptureViewProxy.cordovaExec(
      this.notifyListeners.bind(this),
      null,
      CordovaFunction.SubscribeViewListener,
      null,
    );
  }

  private notifyListeners(event: { name: DataCaptureViewListenerEvent, argument: any }) {
    if (!event) {
      // The event could be undefined/null in case the plugin result did not pass a "message",
      // which could happen e.g. in case of "ok" results, which could signal e.g. successful
      // listener subscriptions.
      return;
    }

    (this.view as any).listeners.forEach((listener: DataCaptureViewListener) => {
      switch (event.name) {
        case DataCaptureViewListenerEvent.DidChangeSizeOrientation:
          if (listener.didChangeSize) {
            const size = (Size as any).fromJSON(event.argument.size);
            const orientation = event.argument.orientation;
            listener.didChangeSize(this.view, size, orientation);
          }
          break;
      }
    });
  }

  private initialize() {
    this.subscribeListener();
  }
}
