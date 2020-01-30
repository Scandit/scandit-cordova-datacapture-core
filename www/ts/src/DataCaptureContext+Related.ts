/// <amd-module name="scandit-cordova-datacapture-core.DataCaptureContext+Related"/>
// ^ needed because Cordova can't resolve "../xx" style dependencies
import { DataCaptureContext } from './DataCaptureContext';

export interface DataCaptureContextListener {
  didChangeStatus(context: DataCaptureContext, contextStatus: ContextStatus): void;
}

// TODO: adjust when readding framedata to the api https://jira.scandit.com/browse/SDC-1159
// export class FrameData {
//   // TODO: deserialize FrameData https://jira.scandit.com/browse/SDC-960
//   // should this look like the "native" FrameData? or does it make sense to change this in JS?
//   private static fromJSON(json: any): FrameData {
//     return new FrameData();
//   }
// }

// TODO: adjust when readding framedata to the api https://jira.scandit.com/browse/SDC-1159
// export interface DataCaptureContextFrameListener {
//   willProcessFrame: (context: DataCaptureContext, frameData: FrameData) => void;
//   didProcessFrame: (context: DataCaptureContext, frameData: FrameData) => void;
// }

interface ContextStatusJSON {
  code: number;
  isValid: boolean;
  message: string;
}

export interface PrivateContextStatus {
  fromJSON(json: ContextStatusJSON): ContextStatus;
}

export class ContextStatus {
  private _message: string;
  private _code: number;
  private _isValid: boolean;

  private static fromJSON(json: ContextStatusJSON): ContextStatus {
    const status = new ContextStatus();
    status._code = json.code;
    status._message = json.message;
    status._isValid = json.isValid;
    return status;
  }

  public get message(): string {
    return this._message;
  }

  public get code(): number {
    return this._code;
  }

  public get isValid(): boolean {
    return this._isValid;
  }
}
