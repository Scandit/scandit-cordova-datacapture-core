import { BaseNativeProxy, Feedback, FeedbackProxy } from 'scandit-datacapture-frameworks-core';
export declare class NativeFeedbackProxy extends BaseNativeProxy implements FeedbackProxy {
    private static get cordovaExec();
    emitFeedback(feedback: Feedback): Promise<void>;
}
