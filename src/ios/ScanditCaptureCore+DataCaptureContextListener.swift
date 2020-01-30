import ScanditCaptureCore

extension ScanditCaptureCore: DataCaptureContextListener {
    func context(_ context: DataCaptureContext, didChange frameSource: FrameSource?) {
        // ignored in Cordova
    }

    func context(_ context: DataCaptureContext, didAdd mode: DataCaptureMode) {
        // ignored in Cordova
    }

    func context(_ context: DataCaptureContext, didRemove mode: DataCaptureMode) {
        // ignored in Cordova
    }

    func context(_ context: DataCaptureContext, didChange contextStatus: ContextStatus) {
        guard let callback = callbacks.contextListener else {
            return
        }

        guard let contextStatusData = contextStatus.jsonString.data(using: .utf8),
            let contextStatusObject = try? JSONSerialization.jsonObject(with: contextStatusData),
            let contextStatusJSON = contextStatusObject as? CDVPluginResult.JSONMessage else {
                return
        }
        let event = ListenerEvent(name: .didChangeContextStatus,
                                  argument: contextStatusJSON)
        commandDelegate.send(.listenerCallback(event), callbackId: callback.id)
    }

    func didStartObserving(_ context: DataCaptureContext) {
        // ignored in Cordova
    }

    func didStopObserving(_ context: DataCaptureContext) {
        // ignored in Cordova
    }
}
