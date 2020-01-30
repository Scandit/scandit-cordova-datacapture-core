/// <amd-module name="scandit-cordova-datacapture-core.DataCaptureContextProxy"/>
// ^ needed because Cordova can't resolve "../xx" style dependencies
import { ContextStatus, DataCaptureContextListener, PrivateContextStatus } from '../DataCaptureContext+Related';
import { Cordova, CordovaFunction } from './Cordova';

declare type DataCaptureContext = any; // To avoid a circular dependency. DataCaptureContext is only used here as a type

enum DataCaptureContextListenerEvent {
  DidChangeContextStatus = 'didChangeStatus',
}

// TODO: adjust when readding framedata to the api https://jira.scandit.com/browse/SDC-1159
// enum DataCaptureContextFrameListenerEvent {
//   WillProcessFrame = 'willProcessFrame',
//   DidProcessFrame = 'didProcessFrame',
// }

export class DataCaptureContextProxy {
  private static cordovaExec = Cordova.exec;
  private context: DataCaptureContext;

  public static forDataCaptureContext(context: DataCaptureContext): DataCaptureContextProxy {
    const contextProxy = new DataCaptureContextProxy();
    contextProxy.context = context;
    contextProxy.initialize();
    return contextProxy;
  }

  public updateContextFromJSON(): Promise<void> {
    return new Promise((resolve, reject) => {
      DataCaptureContextProxy.cordovaExec(
        resolve.bind(this),
        reject.bind(this),
        CordovaFunction.UpdateContextFromJSON,
        [this.context.toJSON()]);
    });
  }

  public dispose() {
    DataCaptureContextProxy.cordovaExec(
      null,
      null,
      CordovaFunction.DisposeContext,
      null);
  }

  private initialize() {
    this.subscribeListener();
    // TODO: adjust when readding framedata to the api https://jira.scandit.com/browse/SDC-1159
    // this.subscribeFrameListener();
    this.initializeContextFromJSON();
  }

  private initializeContextFromJSON(): Promise<void> {
    return new Promise((resolve, reject) => {
      DataCaptureContextProxy.cordovaExec(
        resolve.bind(this),
        reject.bind(this),
        CordovaFunction.ContextFromJSON,
        [this.context.toJSON()]);
    });
  }

  private subscribeListener() {
    DataCaptureContextProxy.cordovaExec(
      this.notifyListeners.bind(this),
      null,
      CordovaFunction.SubscribeContextListener,
      null,
    );
  }

  // TODO: adjust when readding framedata to the api https://jira.scandit.com/browse/SDC-1159
  // private subscribeFrameListener() {
  //   DataCaptureContextProxy.cordovaExec(
  //     this.notifyFrameListeners.bind(this),
  //     null,
  //     CordovaFunction.SubscribeContextFrameListener,
  //     null,
  //   );
  // }

  private notifyListeners(event: { name: DataCaptureContextListenerEvent, argument: any }) {
    if (!event) {
      // The event could be undefined/null in case the plugin result did not pass a "message",
      // which could happen e.g. in case of "ok" results, which could signal e.g. successful
      // listener subscriptions.
      return;
    }

    (this.context as any).listeners.forEach((listener: DataCaptureContextListener) => {
      switch (event.name) {
        case DataCaptureContextListenerEvent.DidChangeContextStatus:
          if (listener.didChangeStatus) {
            const contextStatus = (ContextStatus as any as PrivateContextStatus).fromJSON(event.argument);
            listener.didChangeStatus(this.context, contextStatus);
          }
          break;
      }
    });
  }

  // TODO: adjust when readding framedata to the api https://jira.scandit.com/browse/SDC-1159
  // private notifyFrameListeners(event: { name: DataCaptureContextFrameListenerEvent, argument: any }) {
  //   if (!event) {
  //     // The event could be undefined/null in case the plugin result did not pass a "message",
  //     // which could happen e.g. in case of "ok" results, which could signal e.g. successful
  //     // listener subscriptions.
  //     return;
  //   }

  //   (this.context as any).frameListeners.forEach((frameListener: DataCaptureContextFrameListener) => {
  //     switch (event.name) {
  //       case DataCaptureContextFrameListenerEvent.WillProcessFrame:
  //         if (frameListener.willProcessFrame) {
  //           // TODO: adjust when readding framedata to the api https://jira.scandit.com/browse/SDC-1159
  //           frameListener.willProcessFrame(this.context, (FrameData as any).fromJSON(event.argument));
  //         }
  //         break;

  //       case DataCaptureContextFrameListenerEvent.DidProcessFrame:
  //         if (frameListener.didProcessFrame) {
  //           // TODO: adjust when readding framedata to the api https://jira.scandit.com/browse/SDC-1159
  //           frameListener.didProcessFrame(this.context, (FrameData as any).fromJSON(event.argument));
  //         }
  //         break;
  //     }
  //   });
  // }
}
