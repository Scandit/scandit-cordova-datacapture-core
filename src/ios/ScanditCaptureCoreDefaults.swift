import ScanditCaptureCore

struct ScanditCaptureCoreDefaults: Encodable {
    struct CameraSettingsDefaults: Encodable {
        let preferredResolution: String
        let maxFrameRate: Float
        let zoomFactor: Float
        let focusRange: String
    }

    struct CameraDefaults: Encodable {
        let Settings: CameraSettingsDefaults
        let defaultPosition: String?
        let availablePositions: [String]
        let torchAvailability: [String: Bool]
    }

    struct DataCaptureViewDefaults: Encodable {
        let scanAreaMargins: String
        let pointOfInterest: String
        let logoAnchor: String
        let logoOffset: String
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
    let Brush: BrushDefaults

    init(cameraSettings: CameraSettings,
         dataCaptureView: DataCaptureView,
         laserlineViewfinder: LaserlineViewfinder,
         rectangularViewfinder: RectangularViewfinder,
         spotlightViewfinder: SpotlightViewfinder,
         brush: Brush) {
        self.Camera = CameraDefaults.from(cameraSettings)
        self.DataCaptureView = DataCaptureViewDefaults.from(dataCaptureView)
        self.LaserlineViewfinder = LaserlineViewfinderDefaults.from(laserlineViewfinder)
        self.RectangularViewfinder = RectangularViewfinderDefaults.from(rectangularViewfinder)
        self.SpotlightViewfinder = SpotlightViewfinderDefaults.from(spotlightViewfinder)
        self.Brush = BrushDefaults.from(brush)
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
        let torchAvailability = availableCameras.mapValues({ $0?.isTorchAvailable ?? false})

        return Defaults(Settings: ScanditCaptureCoreDefaults.CameraSettingsDefaults.from(cameraSettings),
                        defaultPosition: Camera.default?.position.jsonString,
                        availablePositions: availablePositions,
                        torchAvailability: torchAvailability)
    }
}

extension ScanditCaptureCoreDefaults.CameraSettingsDefaults {
    typealias Defaults = ScanditCaptureCoreDefaults.CameraSettingsDefaults

    static func from(_ cameraSettings: CameraSettings) -> Defaults {
        return Defaults(preferredResolution: cameraSettings.preferredResolution.jsonString,
                        maxFrameRate: Float(cameraSettings.maxFrameRate),
                        zoomFactor: Float(cameraSettings.zoomFactor),
                        focusRange: cameraSettings.focusRange.jsonString)
    }
}

extension ScanditCaptureCoreDefaults.DataCaptureViewDefaults {
    typealias Defaults = ScanditCaptureCoreDefaults.DataCaptureViewDefaults

    static func from(_ dataCaptureView: DataCaptureView) -> Defaults {
        return Defaults(scanAreaMargins: dataCaptureView.scanAreaMargins.jsonString,
                        pointOfInterest: dataCaptureView.pointOfInterest.jsonString,
                        logoAnchor: dataCaptureView.logoAnchor.jsonString,
                        logoOffset: dataCaptureView.logoOffset.jsonString)
    }
}

extension ScanditCaptureCoreDefaults.LaserlineViewfinderDefaults {
    typealias Defaults = ScanditCaptureCoreDefaults.LaserlineViewfinderDefaults

    static func from(_ viewfinder: LaserlineViewfinder) -> Defaults {
        return Defaults(width: viewfinder.width.jsonString,
                        enabledColor: viewfinder.enabledColor.hexString,
                        disabledColor: viewfinder.disabledColor.hexString)
    }
}

extension ScanditCaptureCoreDefaults.RectangularViewfinderDefaults {
    typealias Defaults = ScanditCaptureCoreDefaults.RectangularViewfinderDefaults

    static func from(_ viewfinder: RectangularViewfinder) -> Defaults {
        return Defaults(size: viewfinder.sizeWithUnitAndAspect.jsonString,
                        color: viewfinder.color.hexString)
    }
}

extension ScanditCaptureCoreDefaults.SpotlightViewfinderDefaults {
    typealias Defaults = ScanditCaptureCoreDefaults.SpotlightViewfinderDefaults

    static func from(_ viewfinder: SpotlightViewfinder) -> Defaults {
        return Defaults(size: viewfinder.sizeWithUnitAndAspect.jsonString,
                        enabledBorderColor: viewfinder.enabledBorderColor.hexString,
                        disabledBorderColor: viewfinder.disabledBorderColor.hexString,
                        backgroundColor: viewfinder.backgroundColor.hexString)
    }
}

extension ScanditCaptureCoreDefaults.BrushDefaults {
    typealias Defaults = ScanditCaptureCoreDefaults.BrushDefaults

    static func from(_ brush: Brush) -> Defaults {
        return Defaults(fillColor: brush.fillColor.hexString,
                        strokeColor: brush.strokeColor.hexString,
                        strokeWidth: Int(brush.strokeWidth))
    }
}
