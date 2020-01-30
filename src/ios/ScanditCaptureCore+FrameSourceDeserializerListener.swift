import ScanditCaptureCore

extension Quadrilateral {
    init?(JSONString: String) {
        var state = Quadrilateral()
        if SDCQuadrilateralFromJSONString(JSONString, &state) {
            self = state
        } else {
            return nil
        }
    }
}

extension TorchState {
    init?(JSONString: String) {
        var state = TorchState.on
        if SDCTorchStateFromJSONString(JSONString, &state) {
            self = state
        } else {
            return nil
        }
    }
}

extension FrameSourceState {
    init?(JSONString: String) {
        var state = FrameSourceState.on
        if SDCFrameSourceStateFromJSONString(JSONString, &state) {
            self = state
        } else {
            return nil
        }
    }
}

extension ScanditCaptureCore: FrameSourceDeserializerDelegate {

    func frameSourceDeserializer(_ deserializer: FrameSourceDeserializer,
                                 didStartDeserializingFrameSource frameSource: FrameSource,
                                 from JSONValue: JSONValue) { }

    func frameSourceDeserializer(_ deserializer: FrameSourceDeserializer,
                                 didFinishDeserializingFrameSource frameSource: FrameSource,
                                 from JSONValue: JSONValue) {
        guard let camera = frameSource as? Camera else {
            return
        }

        if let desiredTorchState = TorchState(JSONString: JSONValue.string(forKey: "desiredTorchState",
                                                                           default: TorchState.off.jsonString)) {
            camera.desiredTorchState = desiredTorchState
        }

        if let desiredState = FrameSourceState(JSONString: JSONValue.string(forKey: "desiredState",
                                                                            default: FrameSourceState.off.jsonString)) {
            camera.switch(toDesiredState: desiredState)
        }
    }

    func frameSourceDeserializer(_ deserializer: FrameSourceDeserializer,
                                 didStartDeserializingCameraSettings settings: CameraSettings,
                                 from JSONValue: JSONValue) { }

    func frameSourceDeserializer(_ deserializer: FrameSourceDeserializer,
                                 didFinishDeserializingCameraSettings settings: CameraSettings,
                                 from JSONValue: JSONValue) { }

}
