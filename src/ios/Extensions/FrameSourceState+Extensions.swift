import ScanditCaptureCore

extension FrameSourceState: CustomStringConvertible {
    public var description: String {
        switch self {
        case .on: return "on"
        case .off: return "off"
        case .starting: return "starting"
        case .stopping: return "stopping"
        }
    }
}
