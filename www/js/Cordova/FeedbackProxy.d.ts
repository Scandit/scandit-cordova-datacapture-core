/// <amd-module name="scandit-cordova-datacapture-core.FeedbackProxy" />
declare type Feedback = any;
export declare class FeedbackProxy {
    private static cordovaExec;
    private feedback;
    static forFeedback(feedback: Feedback): FeedbackProxy;
    emit(): void;
}
export {};
