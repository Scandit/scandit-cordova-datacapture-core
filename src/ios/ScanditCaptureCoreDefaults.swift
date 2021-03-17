import ScanditCaptureCore

struct ScanditCaptureCoreDefaults: Encodable {
    struct CameraSettingsDefaults: Encodable {
        let preferredResolution: String
        let zoomFactor: Float
        let focusRange: String
        let zoomGestureZoomFactor: Float
        let focusGestureStrategy: String
    }

    struct CameraDefaults: Encodable {
        let Settings: CameraSettingsDefaults
        let defaultPosition: String?
        let availablePositions: [String]
    }

    struct DataCaptureViewDefaults: Encodable {
        let scanAreaMargins: String
        let pointOfInterest: String
        let logoAnchor: String
        let logoOffset: String
        let focusGesture: String?
        let zoomGesture: String?
    }

    struct LaserlineViewfinderDefaults: Encodable {
        let width: String
        let enabledColor: String
        let disabledColor: String
    }

    struct RectangularViewfinderDefaults: Encodable {
        let size: String
        let color: String
    }

    struct SpotlightViewfinderDefaults: Encodable {
        let size: String
        let enabledBorderColor: String
        let disabledBorderColor: String
        let backgroundColor: String
    }

    struct AimerViewfinderDefaults: Encodable {
        let frameColor: String
        let dotColor: String
    }

    struct BrushDefaults: Encodable {
        let fillColor: String
        let strokeColor: String
        let strokeWidth: Int
    }

    let Camera: CameraDefaults
    let DataCaptureView: DataCaptureViewDefaults
    let LaserlineViewfinder: LaserlineViewfinderDefaults
    let RectangularViewfinder: RectangularViewfinderDefaults
    let SpotlightViewfinder: SpotlightViewfinderDefaults
    let AimerViewfinder: AimerViewfinderDefaults
    let Brush: BrushDefaults

    let deviceID: String?

    init(cameraSettings: CameraSettings,
         dataCaptureView: DataCaptureView,
         laserlineViewfinder: LaserlineViewfinder,
         rectangularViewfinder: RectangularViewfinder,
         spotlightViewfinder: SpotlightViewfinder,
         aimerViewfinder: AimerViewfinder,
         brush: Brush) {
        self.Camera = CameraDefaults.from(cameraSettings)
        self.DataCaptureView = DataCaptureViewDefaults.from(dataCaptureView)
        self.LaserlineViewfinder = LaserlineViewfinderDefaults.from(laserlineViewfinder)
        self.RectangularViewfinder = RectangularViewfinderDefaults.from(rectangularViewfinder)
        self.SpotlightViewfinder = SpotlightViewfinderDefaults.from(spotlightViewfinder)
        self.AimerViewfinder = AimerViewfinderDefaults.from(aimerViewfinder)
        self.Brush = BrushDefaults.from(brush)
        self.deviceID = DataCaptureContext.deviceID
    }
}

extension ScanditCaptureCoreDefaults.CameraDefaults {
    typealias Defaults = ScanditCaptureCoreDefaults.CameraDefaults

    static func from(_ cameraSettings: CameraSettings) -> Defaults {
        let availableCameras = [
            CameraPosition.userFacing.jsonString: Camera(position: .userFacing),
            CameraPosition.worldFacing.jsonString: Camera(position: .worldFacing)
        ]
        let availablePositions = Array(availableCameras.keys)

        return Defaults(Settings: ScanditCaptureCoreDefaults.CameraSettingsDefaults.from(cameraSettings),
                        defaultPosition: Camera.default?.position.jsonString,
                        availablePositions: availablePositions)
    }
}

extension ScanditCaptureCoreDefaults.CameraSettingsDefaults {
    typealias Defaults = ScanditCaptureCoreDefaults.CameraSettingsDefaults

    static func from(_ cameraSettings: CameraSettings) -> Defaults {
        return Defaults(preferredResolution: cameraSettings.preferredResolution.jsonString,
                        zoomFactor: Float(cameraSettings.zoomFactor),
                        focusRange: cameraSettings.focusRange.jsonString,
                        zoomGestureZoomFactor: Float(cameraSettings.zoomGestureZoomFactor),
                        focusGestureStrategy: cameraSettings.focusGestureStrategy.jsonString)
    }
}

extension ScanditCaptureCoreDefaults.DataCaptureViewDefaults {
    typealias Defaults = ScanditCaptureCoreDefaults.DataCaptureViewDefaults

    static func from(_ dataCaptureView: DataCaptureView) -> Defaults {
        return Defaults(scanAreaMargins: dataCaptureView.scanAreaMargins.jsonString,
                        pointOfInterest: dataCaptureView.pointOfInterest.jsonString,
                        logoAnchor: dataCaptureView.logoAnchor.jsonString,
                        logoOffset: dataCaptureView.logoOffset.jsonString,
                        focusGesture: dataCaptureView.focusGesture?.jsonString,
                        zoomGesture: dataCaptureView.zoomGesture?.jsonString)
    }
}

extension ScanditCaptureCoreDefaults.LaserlineViewfinderDefaults {
    typealias Defaults = ScanditCaptureCoreDefaults.LaserlineViewfinderDefaults

    static func from(_ viewfinder: LaserlineViewfinder) -> Defaults {
        return Defaults(width: viewfinder.width.jsonString,
                        enabledColor: viewfinder.enabledColor.sdcHexString,
                        disabledColor: viewfinder.disabledColor.sdcHexString)
    }
}

extension ScanditCaptureCoreDefaults.AimerViewfinderDefaults {
    typealias Defaults = ScanditCaptureCoreDefaults.AimerViewfinderDefaults

    static func from(_ viewfinder: AimerViewfinder) -> Defaults {
        return Defaults(frameColor: viewfinder.frameColor.sdcHexString,
                        dotColor: viewfinder.dotColor.sdcHexString)
    }
}

extension ScanditCaptureCoreDefaults.RectangularViewfinderDefaults {
    typealias Defaults = ScanditCaptureCoreDefaults.RectangularViewfinderDefaults

    static func from(_ viewfinder: RectangularViewfinder) -> Defaults {
        return Defaults(size: viewfinder.sizeWithUnitAndAspect.jsonString,
                        color: viewfinder.color.sdcHexString)
    }
}

extension ScanditCaptureCoreDefaults.SpotlightViewfinderDefaults {
    typealias Defaults = ScanditCaptureCoreDefaults.SpotlightViewfinderDefaults

    static func from(_ viewfinder: SpotlightViewfinder) -> Defaults {
        return Defaults(size: viewfinder.sizeWithUnitAndAspect.jsonString,
                        enabledBorderColor: viewfinder.enabledBorderColor.sdcHexString,
                        disabledBorderColor: viewfinder.disabledBorderColor.sdcHexString,
                        backgroundColor: viewfinder.backgroundColor.sdcHexString)
    }
}

extension ScanditCaptureCoreDefaults.BrushDefaults {
    typealias Defaults = ScanditCaptureCoreDefaults.BrushDefaults

    static func from(_ brush: Brush) -> Defaults {
        return Defaults(fillColor: brush.fillColor.sdcHexString,
                        strokeColor: brush.strokeColor.sdcHexString,
                        strokeWidth: Int(brush.strokeWidth))
    }
}
