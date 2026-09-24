import ScanditCaptureCore


public struct CameraSettingsDefaults: Encodable {
    let preferredResolution: String
    let zoomFactor: Float
    let focusRange: String
    let zoomGestureZoomFactor: Float
    let focusGestureStrategy: String
    let shouldPreferSmoothAutoFocus: Bool

    public static func from(_ cameraSettings: CameraSettings) -> CameraSettingsDefaults {
        return CameraSettingsDefaults(preferredResolution: cameraSettings.preferredResolution.jsonString,
                                      zoomFactor: Float(cameraSettings.zoomFactor),
                                      focusRange: cameraSettings.focusRange.jsonString,
                                      zoomGestureZoomFactor: Float(cameraSettings.zoomGestureZoomFactor),
                                      focusGestureStrategy: cameraSettings.focusGestureStrategy.jsonString,
                                      shouldPreferSmoothAutoFocus: cameraSettings.shouldPreferSmoothAutoFocus)
    }
}

public struct BrushDefaults: Encodable {
    let fillColor: String
    let strokeColor: String
    let strokeWidth: Int

    public static func from(_ brush: Brush) -> BrushDefaults {
        return BrushDefaults(fillColor: brush.fillColor.sdcHexString,
                             strokeColor: brush.strokeColor.sdcHexString,
                             strokeWidth: Int(brush.strokeWidth))
    }
}
