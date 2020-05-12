import ScanditCaptureCore

extension ScanditCaptureCore: DataCaptureContextListener {
    public func context(_ context: DataCaptureContext, didChange frameSource: FrameSource?) {
        // ignored in Cordova
    }

    public func context(_ context: DataCaptureContext, didAdd mode: DataCaptureMode) {
        // ignored in Cordova
    }

    public func context(_ context: DataCaptureContext, didRemove mode: DataCaptureMode) {
        // ignored in Cordova
    }

    public func context(_ context: DataCaptureContext, didChange contextStatus: ContextStatus) {
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

    public func didStartObserving(_ context: DataCaptureContext) {
        guard let callback = callbacks.contextListener else {
            return
        }
        
        guard let deviceID = context.deviceID else {
            /// The native SDK guarantees that at this point `deviceID` will be set. See iOS docs.
            return
        }
        
        let event = ListenerEvent(name: .didStartObservingContext,
                                  argument: [ "deviceID": deviceID ])
        commandDelegate.send(.listenerCallback(event), callbackId: callback.id)
    }

    public func didStopObserving(_ context: DataCaptureContext) {
        // ignored in Cordova
    }
}
