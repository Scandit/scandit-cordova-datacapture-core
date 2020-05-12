/// <amd-module name="scandit-cordova-datacapture-core.FeedbackProxy"/>
// ^ needed because Cordova can't resolve "../xx" style dependencies
import { Cordova, CordovaFunction } from './Cordova';

declare type Feedback = any; // To avoid a circular dependency. Feedback is only used here as a type.

export class FeedbackProxy {
  private static cordovaExec = Cordova.exec;
  private feedback: Feedback;

  public static forFeedback(feedback: Feedback): FeedbackProxy {
    const proxy = new FeedbackProxy();
    proxy.feedback = feedback;
    return proxy;
  }

  public emit(): void {
    FeedbackProxy.cordovaExec(
      null,
      null,
      CordovaFunction.EmitFeedback,
      [this.feedback.toJSON()]);
  }
}
