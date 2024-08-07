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
