import ScanditCaptureCore

extension ScanditCaptureCore: DataCaptureContextFrameListener {
    func context(_ context: DataCaptureContext, willProcessFrame frame: FrameData) {
        guard let callback = callbacks.contextFrameListener else {
            return
        }
        // TODO: adjust when readding framedata to the api https://jira.scandit.com/browse/SDC-1159
        commandDelegate.send(.listenerCallback(ListenerEvent(name: .willProcessFrame,
                                                             argument: ["TODO": true])),
                             callbackId: callback.id)
    }

    func context(_ context: DataCaptureContext, didProcessFrame frame: FrameData) {
        guard let callback = callbacks.contextFrameListener else {
            return
        }
        // TODO: adjust when readding framedata to the api https://jira.scandit.com/browse/SDC-1159
        commandDelegate.send(.listenerCallback(ListenerEvent(name: .didProcessFrame,
                                                             argument: ["TODO": true])),
                             callbackId: callback.id)
    }
}
