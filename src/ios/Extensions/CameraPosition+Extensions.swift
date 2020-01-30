import ScanditCaptureCore

extension CameraPosition: CustomStringConvertible {
    static func fromCommand(_ command: CDVInvokedUrlCommand) -> CameraPosition? {
        switch command.defaultArgument as? String {
        case "unspecified": return .unspecified
        case "userFacing": return .userFacing
        case "worldFacing": return .worldFacing
        default: return nil
        }
    }

    public var description: String {
        switch self {
        case .unspecified: return "unspecified"
        case .userFacing: return "userFacing"
        case .worldFacing: return "worldFacing"
        }
    }
}
