private func unwrapPluginResult(_ potentialResult: Any) -> CDVPluginResult {
    if let result = potentialResult as? CDVPluginResult {
        return result
    }
    if let optionalResult = potentialResult as? CDVPluginResult? {
        if let unwrapped = optionalResult {
            return unwrapped
        }
        fatalError("CDVPluginResult initializer returned nil")
    }
    fatalError("Unexpected CDVPluginResult initializer return type")
}

private func createPluginResult(status: CDVCommandStatus) -> CDVPluginResult {
    let result = CDVPluginResult(status: status)
    return unwrapPluginResult(result as Any)
}

private func createPluginResult(status: CDVCommandStatus, messageAs message: Any) -> CDVPluginResult {
    if let dictionary = message as? [AnyHashable: Any] {
        let result = CDVPluginResult(status: status, messageAs: dictionary)
        return unwrapPluginResult(result as Any)
    }
    if let array = message as? [Any] {
        let result = CDVPluginResult(status: status, messageAs: array)
        return unwrapPluginResult(result as Any)
    }
    if let string = message as? String {
        let result = CDVPluginResult(status: status, messageAs: string)
        return unwrapPluginResult(result as Any)
    }
    if let boolValue = message as? Bool {
        let result = CDVPluginResult(status: status, messageAs: boolValue)
        return unwrapPluginResult(result as Any)
    }
    if let intValue = message as? Int {
        let result = CDVPluginResult(status: status, messageAs: intValue)
        return unwrapPluginResult(result as Any)
    }
    if let doubleValue = message as? Double {
        let result = CDVPluginResult(status: status, messageAs: doubleValue)
        return unwrapPluginResult(result as Any)
    }
    fatalError("Unsupported CDVPluginResult message type: \(type(of: message))")
}

struct ListenerEvent {
    enum Name: String, Decodable {
        // Context listener
        case didChangeContextStatus = "DataCaptureContextListener.onStatusChanged"
        case didStartObservingContext = "DataCaptureContextListener.onObservationStarted"

        // View listener
        case didChangeSize = "DataCaptureViewListener.onSizeChanged"

        // Frame Source listener
        case didChangeState = "FrameSourceListener.onStateChanged"

        // Barcode Capture listener
        case didScanInBarcodeCapture = "BarcodeCaptureListener.didScan"
        case didUpdateSessionInBarcodeCapture = "BarcodeCaptureListener.didUpdateSession"

        // Barcode Batch listener
        case didUpdateSessionInBarcodeBatch = "BarcodeBatchListener.didUpdateSession"

        // Barcode Batch Basic Overlay listener
        case brushForTrackedBarcode = "BarcodeBatchBasicOverlayListener.brushForTrackedBarcode"
        case didTapTrackedBarcode = "BarcodeBatchBasicOverlayListener.didTapTrackedBarcode"

        // Barcode Batch Advanced Overlay listener
        case viewForTrackedBarcode = "BarcodeBatchAdvancedOverlayListener.viewForTrackedBarcode"
        case anchorForTrackedBarcode = "BarcodeBatchAdvancedOverlayListener.anchorForTrackedBarcode"
        case offsetForTrackedBarcode = "BarcodeBatchAdvancedOverlayListener.offsetForTrackedBarcode"
        case didTapViewForTrackedBarcode = "BarcodeBatchAdvancedOverlayListener.didTapViewForTrackedBarcode"

        // Barcode Batch listener
        case didUpdateSelectionInBarcodeSelection = "BarcodeSelectionListener.didUpdateSelection"
        case didUpdateSessionInBarcodeSelection = "BarcodeSelectionListener.didUpdateSession"

        // Text Capture Listener
        case didCaptureInTextCapture = "didCaptureInTextCapture"

        // ID Capture Listener
        case didCaptureInIdCapture = "IdCaptureListener.didCaptureId"
        case didLocalizeInIdCapture = "IdCaptureListener.didLocalizeId"
        case didRejectInIdCapture = "IdCaptureListener.didRejectId"
        case didTimoutInIdCapture = "IdCaptureListener.didTimout"

        // VolumeButtonObserver
        case didChangeVolume = "didChangeVolume"
    }

    let name: Name
    let argument: CDVPluginResult.JSONMessage
    let shouldNotifyWhenFinished: Bool

    init(name: Name, argument: CDVPluginResult.JSONMessage = [:], shouldNotifyWhenFinished: Bool = false) {
        self.name = name
        self.argument = argument
        self.shouldNotifyWhenFinished = shouldNotifyWhenFinished
    }

    var resultMessage: CDVPluginResult.JSONMessage {
        [
            "name": name.rawValue,
            "finishCallbackID": name.rawValue,
            "argument": argument,
            "shouldNotifyWhenFinished": shouldNotifyWhenFinished,
        ]
    }
}

struct CommandError {
    enum Code: Int, CaseIterable {
        case invalidJSON = 10001
        case noViewIdParam = 10002

        case couldNotDeserializeContext = 10011

        case noViewToBeShown = 10021
        case noViewToBeHidden = 10022

        case cantConvertPointWithoutView = 10031
        case cantConvertQuadrilateralWithoutView = 10032

        case noCamera = 10042
        case couldNotSwitchCamera = 10043
        case noCameraWithPosition = 10044

        case trackedBarcodeNotFound = 10051

        case parserNotFound = 10061
        case couldNotParseString = 10062
        case couldNotParseRawString = 10063

        case noOverlay = 10071
        case noBarcodeSelection = 10072
        case noBarcodeSelectionSession = 10073
        case noBarcodeSelectionOverlay = 10074
        case noBarcodeCaptureSession = 10075
        case noBarcodeBatchSession = 10076

        case noFrameData = 10077
        case noBarcodeSelectionIdentifier = 10078

        case noFeedbackJsonPassed = 10079
        case wrongOrNoArgumentPassed = 10080

    }

    public static let invalidJSON = CommandError(
        code: .invalidJSON,
        message: "Invalid or no JSON passed for command"
    )
    public static let noViewIdParam = CommandError(
        code: .noViewIdParam,
        message: "viewId param is missing in the call."
    )

    public static func couldNotDeserializeContext(reason additionalInformation: String) -> CommandError {
        CommandError(
            code: .couldNotDeserializeContext,
            message: "Could not deserialize context: \(additionalInformation)"
        )
    }

    public static let noViewToBeShown = CommandError(
        code: .noViewToBeShown,
        message: "There was no capture view to be shown"
    )
    public static let noViewToBeHidden = CommandError(
        code: .noViewToBeHidden,
        message: "There was no capture view to be hidden"
    )

    public static let cantConvertPointWithoutView = CommandError(
        code: .cantConvertPointWithoutView,
        message: """
            There is no view shown, so the point can not be converted into its coordinate space
            """
    )
    public static let cantConvertQuadrilateralWithoutView = CommandError(
        code: .cantConvertQuadrilateralWithoutView,
        message: """
            There is no view shown, so the quadrilateral can not be converted into its coordinate space
            """
    )

    public static let noCamera = CommandError(
        code: .noCamera,
        message: "No camera available or not yet initialized"
    )
    public static let couldNotSwitchCamera = CommandError(
        code: .couldNotSwitchCamera,
        message: "Could not switch camera to desired state"
    )
    public static func noCamera(withPosition position: String) -> CommandError {
        CommandError(
            code: .noCameraWithPosition,
            message: "No camera available with position \(position)"
        )
    }

    public static let trackedBarcodeNotFound = CommandError(
        code: .trackedBarcodeNotFound,
        message: """
            Passed tracked barcode not found in current session
            """
    )

    public static let parserNotFound = CommandError(
        code: .parserNotFound,
        message: """
            A parser with the passed component identifier was not found
            """
    )

    public static func couldNotParseString(reason additionalInformation: String) -> CommandError {
        CommandError(
            code: .couldNotParseString,
            message: "Could not parse string: \(additionalInformation)"
        )
    }

    public static func couldNotParseRawData(reason additionalInformation: String) -> CommandError {
        CommandError(
            code: .couldNotParseRawString,
            message: "Could not parse raw string: \(additionalInformation)"
        )
    }

    public static let noOverlay = CommandError(
        code: .noOverlay,
        message: "There was no overlay to execute the command on"
    )

    public static let noBarcodeSelection = CommandError(
        code: .noBarcodeSelection,
        message: """
            There was no BarcodeSelection mode to execute the command on
            """
    )

    public static let noBarcodeCaptureSession = CommandError(
        code: .noBarcodeCaptureSession,
        message: """
            There was no BarcodeCapture session to execute the command on
            """
    )

    public static let noBarcodeBatchSession = CommandError(
        code: .noBarcodeBatchSession,
        message: """
            There was no BarcodeBatch session to execute the command on
            """
    )

    public static let noBarcodeSelectionSession = CommandError(
        code: .noBarcodeSelectionSession,
        message: """
            There was no BarcodeSelection session to execute the command on
            """
    )

    public static let missingBarcodeSelectionIdentifier = CommandError(
        code: .noBarcodeSelectionIdentifier,
        message: """
            There was no BarcodeSelection identifier passed.
            """
    )

    public static let noBarcodeSelectionOverlay = CommandError(
        code: .noBarcodeSelectionOverlay,
        message: """
            There was no BarcodeSelection overlay to execute the command on
            """
    )

    public static let noFrameData = CommandError(
        code: .noFrameData,
        message: """
            There was no FrameData to execute the command on
            """
    )

    public static let noFeedbackJsonPassed = CommandError(
        code: .noFeedbackJsonPassed,
        message: "No feedbackJson was provided for the function."
    )

    public static let wrongOrNoArgumentPassed = CommandError(
        code: .wrongOrNoArgumentPassed,
        message: "Wrong or no argument was provided for the function."
    )

    public let code: Code
    public let message: String

    public func toJSON() -> CDVPluginResult.JSONMessage {
        [
            "code": code.rawValue,
            "message": message,
        ]
    }
}

extension CDVPluginResult {
    typealias JSONMessage = [AnyHashable: Any]

    // MARK: - Success results

    /// Simple success result.
    static let success: CDVPluginResult = {
        createPluginResult(status: CDVCommandStatus.ok)
    }()

    /// Success result with some additional information.
    static func success(message: JSONMessage) -> CDVPluginResult {
        createPluginResult(status: CDVCommandStatus.ok, messageAs: message)
    }

    /// Success result with an encodable object as JSON.
    static func success<T: Encodable>(message: T) -> CDVPluginResult {
        guard let data = try? JSONEncoder().encode(message),
            let object = try? JSONSerialization.jsonObject(with: data) as? JSONMessage
        else {
            return .failure(with: "Could not serialize message")
        }
        return createPluginResult(status: CDVCommandStatus.ok, messageAs: object)
    }

    /// Success result with some additional information.
    static func success(message: String) -> CDVPluginResult {
        createPluginResult(status: CDVCommandStatus.ok, messageAs: message)
    }

    /// Success result with some additional information.
    static func success(message: Bool) -> CDVPluginResult {
        createPluginResult(status: CDVCommandStatus.ok, messageAs: message)
    }

    /// Success result with some additional information.
    static func success(message: Int) -> CDVPluginResult {
        createPluginResult(status: CDVCommandStatus.ok, messageAs: message)
    }

    /// Listener callback result, with attached additional information sent as the message.
    ///
    /// Used with stored callback IDs from listeners when their callbacks are called.
    static func listenerCallback(_ event: ListenerEvent) -> CDVPluginResult {
        let result = createPluginResult(status: CDVCommandStatus.ok, messageAs: event.resultMessage)
        result.setKeepCallbackAs(true)
        return result
    }

    static func listenerCallback(_ message: [String: Any?]) -> CDVPluginResult {
        let result = createPluginResult(status: CDVCommandStatus.ok, messageAs: message as [AnyHashable: Any])
        result.setKeepCallbackAs(true)
        return result
    }

    /// A result that tells to keep the callback.
    ///
    /// Used for sending a result for listener subscriptions.
    ///
    /// - Note: Strictly speaking sending this is not required, as if there is no result, the callback is kept.
    static let keepCallback: CDVPluginResult = {
        let result = createPluginResult(status: CDVCommandStatus.ok)
        result.setKeepCallbackAs(true)
        return result
    }()

    /// A result to trigger disposing a callback.
    ///
    /// Used when listeners are not needed anymore and their associated callbacks can be safely removed, as they
    /// will not be used anymore.
    static let disposeCallback: CDVPluginResult = {
        let result = createPluginResult(status: CDVCommandStatus.noResult)
        result.setKeepCallbackAs(false)
        return result
    }()

    // MARK: - Failure results

    /// Failure result with some additional information.
    static func failure(with message: JSONMessage) -> CDVPluginResult {
        createPluginResult(status: CDVCommandStatus.error, messageAs: message)
    }

    /// Failure with a specific message.
    static func failure(with message: String) -> CDVPluginResult {
        createPluginResult(status: CDVCommandStatus.error, messageAs: message)
    }

    /// Failure with an arbitrary error.
    static func failure(with error: Error) -> CDVPluginResult {
        .failure(with: error.localizedDescription)
    }

    /// Failure with a "known" error.
    static func failure(with error: CommandError) -> CDVPluginResult {
        .failure(with: error.toJSON())
    }
}

extension NSError {
    var jsonMessage: CDVPluginResult.JSONMessage {
        [
            "code": code,
            "message": description,
        ]
    }
}
