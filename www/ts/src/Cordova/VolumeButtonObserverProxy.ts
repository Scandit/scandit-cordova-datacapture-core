/// <amd-module name="scandit-cordova-datacapture-core.VolumeButtonObserverProxy"/>
// ^ needed because Cordova can't resolve "../xx" style dependencies
import { Cordova, CordovaFunction } from './Cordova';

// To avoid a circular dependency. VolumeButtonObserver is only used here as a type.
declare type VolumeButtonObserver = any;

enum VolumeButtonObserverEvent {
  DidChangeVolume = 'didChangeVolume',
}

export class VolumeButtonObserverProxy {
  private static cordovaExec = Cordova.exec;
  private volumeButtonObserver: VolumeButtonObserver;

  public static forVolumeButtonObserver(volumeButtonObserver: VolumeButtonObserver): VolumeButtonObserverProxy {
    const proxy = new VolumeButtonObserverProxy();
    proxy.volumeButtonObserver = volumeButtonObserver;
    proxy.subscribe();
    return proxy;
  }

  public dispose(): void {
    this.unsubscribe();
  }

  private subscribe(): void {
    VolumeButtonObserverProxy.cordovaExec(
      this.notifyListeners.bind(this),
      null,
      CordovaFunction.SubscribeVolumeButtonObserver,
      null);
  }

  private unsubscribe(): void {
    VolumeButtonObserverProxy.cordovaExec(
      null,
      null,
      CordovaFunction.UnsubscribeVolumeButtonObserver,
      null);
  }

  private notifyListeners(event: { name: VolumeButtonObserverEvent, argument: any }) {
    if (!event) {
      // The event could be undefined/null in case the plugin result did not pass a "message",
      // which could happen e.g. in case of "ok" results, which could signal e.g. successful
      // listener subscriptions.
      return;
    }

    if (this.volumeButtonObserver.didChangeVolume && event.name === VolumeButtonObserverEvent.DidChangeVolume) {
      this.volumeButtonObserver.didChangeVolume();
    }
  }
}
