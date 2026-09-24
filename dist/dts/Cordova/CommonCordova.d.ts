import { NativeCaller } from 'scandit-datacapture-frameworks-core';
export declare class CordovaError {
    code: number;
    message: string;
    static fromJSON(json: any): CordovaError | null;
    constructor(code: number, message: string);
}
export interface BlockingModeListenerResult {
    enabled: boolean;
}
export declare const pluginsMetadata: any;
export declare const cordovaExec: (successCallback: Function | null, errorCallback: Function | null, className: string, functionName: string, args: [
    any
] | null) => void;
export declare function initializePlugin(pluginName: string, customInitialization: () => Promise<void>): Promise<void>;
export declare class CordovaNativeCaller implements NativeCaller {
    private cordovaExec;
    private pluginName;
    private eventRegisterFnName;
    private eventHandlers;
    private eventRegisteredCheckList;
    private get areEventsRegistered();
    constructor(cordovaExec: any, pluginName: string, eventRegisterFnName: string[]);
    get framework(): string;
    get frameworkVersion(): string;
    callFn(fnName: string, args: object | undefined | null): Promise<any>;
    eventHook(args: any): any;
    registerEvent(evName: string, handler: (args: any) => Promise<void>): Promise<any>;
    unregisterEvent(evName: string, _subscription: any): Promise<void>;
    private setUpEventListener;
    private notifyListeners;
}
export declare function createCordovaNativeCaller(cordovaExec: any, pluginName: string, eventRegisterFnName: string[]): CordovaNativeCaller;
