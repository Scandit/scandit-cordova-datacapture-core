import ScanditCaptureCore

extension Quadrilateral {
    init?(jsonString: String) {
        var state = Quadrilateral()
        if SDCQuadrilateralFromJSONString(jsonString, &state) {
            self = state
        } else {
            return nil
        }
    }
}

extension TorchState {
    init?(jsonString: String) {
        var state = TorchState.on
        if SDCTorchStateFromJSONString(jsonString, &state) {
            self = state
        } else {
            return nil
        }
    }
}

extension CameraPosition {
    init?(jsonString: String) {
        var position = CameraPosition.worldFacing
        if SDCCameraPositionFromJSONString(jsonString, &position) {
            self = position
        } else {
            return nil
        }
    }
}

extension FrameSourceState {
    init?(jsonString: String) {
        var state = FrameSourceState.on
        if SDCFrameSourceStateFromJSONString(jsonString, &state) {
            self = state
        } else {
            return nil
        }
    }
}

extension Anchor {
    init?(jsonString: String) {
        var anchor = Anchor.center
        if SDCAnchorFromJSONString(jsonString, &anchor) {
            self = anchor
        } else {
            return nil
        }
    }
}

extension PointWithUnit {
    init?(jsonString: String) {
        var point = PointWithUnit.zero
        if SDCPointWithUnitFromJSONString(jsonString, &point) {
            self = point
        } else {
            return nil
        }
    }
}

extension ScanditCaptureCore: FrameSourceDeserializerDelegate {

    public func frameSourceDeserializer(_ deserializer: FrameSourceDeserializer,
                                        didStartDeserializingFrameSource frameSource: FrameSource,
                                        from jsonValue: JSONValue) {
        // Empty on purpose
    }

    public func frameSourceDeserializer(_ deserializer: FrameSourceDeserializer,
                                        didFinishDeserializingFrameSource frameSource: FrameSource,
                                        from jsonValue: JSONValue) {
        guard let camera = frameSource as? Camera else {
            return
        }

        camera.addListener(self)

        if jsonValue.containsKey("desiredTorchState"),
           let desiredTorchState = TorchState(jsonString: jsonValue.string(forKey: "desiredTorchState",
                                                                           default: TorchState.off.jsonString)) {
            camera.desiredTorchState = desiredTorchState
        }

        if jsonValue.containsKey("desiredState"),
           let desiredState = FrameSourceState(jsonString: jsonValue.string(forKey: "desiredState",
                                                                            default: FrameSourceState.off.jsonString)) {
            camera.switch(toDesiredState: desiredState)
        }
    }

    public func frameSourceDeserializer(_ deserializer: FrameSourceDeserializer,
                                        didStartDeserializingCameraSettings settings: CameraSettings,
                                        from jsonValue: JSONValue) {
        // Empty on purpose
    }

    public func frameSourceDeserializer(_ deserializer: FrameSourceDeserializer,
                                        didFinishDeserializingCameraSettings settings: CameraSettings,
                                        from jsonValue: JSONValue) {
        // Empty on purpose
    }

}
