/// <amd-module name="scandit-cordova-datacapture-core.Cordova"/>
// ^ needed because Cordova can't resolve "../xx" style dependencies
import { cordovaExec, initializePlugin } from './CommonCordova';
import { Defaults, defaultsFromJSON, DefaultsJSON } from './Defaults';

export enum CordovaFunction {
  GetDefaults = 'getDefaults',

  ContextFromJSON = 'contextFromJSON',
  DisposeContext = 'disposeContext',
  UpdateContextFromJSON = 'updateContextFromJSON',
  SubscribeContextListener = 'subscribeContextListener',
  SubscribeContextFrameListener = 'subscribeContextFrameListener',
  SetViewPositionAndSize = 'setViewPositionAndSize',
  ShowView = 'showView',
  HideView = 'hideView',
  ViewPointForFramePoint = 'viewPointForFramePoint',
  ViewQuadrilateralForFrameQuadrilateral = 'viewQuadrilateralForFrameQuadrilateral',
  SubscribeViewListener = 'subscribeViewListener',

  GetCurrentCameraState = 'getCurrentCameraState',
}

// tslint:disable-next-line:variable-name
export const Cordova = {
  pluginName: 'ScanditCaptureCore',
  defaults: {} as Defaults,
  exec: (
    success: Optional<Function>,
    error: Optional<Function>,
    functionName: string,
    args: Optional<[any]>,
  ) => cordovaExec(success, error, Cordova.pluginName, functionName, args),
};

const getDefaults: Promise<void> = new Promise((resolve, reject) => {
  Cordova.exec(
    (defaultsJSON: DefaultsJSON) => {
      Cordova.defaults = defaultsFromJSON(defaultsJSON);
      resolve();
    },
    reject,
    CordovaFunction.GetDefaults,
    null);
});

initializePlugin(Cordova.pluginName, getDefaults);
