#if SWIFT_PACKAGE
import Cordova
#endif

public struct ViewPositionAndSizeJSON: CommandJSONArgument {
    public let top: Double
    public let left: Double
    public let width: Double
    public let height: Double
    public let shouldBeUnderWebView: Bool

    public var position: CGPoint {
        CGPoint(x: left, y: top)
    }

    public var size: CGSize {
        CGSize(width: width, height: height)
    }
}
