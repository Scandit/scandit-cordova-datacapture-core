/// <amd-module name="scandit-cordova-datacapture-core.VolumeButtonObserver"/>
// ^ needed because Cordova can't resolve "../xx" style dependencies
import { VolumeButtonObserverProxy } from './Cordova/VolumeButtonObserverProxy';

// Note: the class is made private by being excluded from the docs through `coverage_cordova_javascript_name_ignore`
export class VolumeButtonObserver {
  private didChangeVolume: Optional<() => void>;
  private proxy: Optional<VolumeButtonObserverProxy>;

  public constructor(didChangeVolume: () => void) {
    this.didChangeVolume = didChangeVolume;
    this.initialize();
  }

  public dispose() {
    if (this.proxy) {
      this.proxy.dispose();
      this.proxy = null;
      this.didChangeVolume = null;
    }
  }

  private initialize() {
    if (!this.proxy) {
      this.proxy = VolumeButtonObserverProxy.forVolumeButtonObserver(this);
    }
  }
}
