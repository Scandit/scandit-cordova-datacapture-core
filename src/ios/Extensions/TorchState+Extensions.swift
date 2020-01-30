import ScanditCaptureCore

extension TorchState: CustomStringConvertible {
    public var description: String {
        switch self {
        case .on: return "on"
        case .off: return "off"
        }
    }
}
