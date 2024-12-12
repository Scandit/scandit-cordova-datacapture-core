import ScanditFrameworksCore

public struct CordovaResult: FrameworksResult {
    private let commandDelegate: CDVCommandDelegate
    private let callbackId: String

    public init(_ commandDelegate: CDVCommandDelegate, _ callbackId: String) {
        self.commandDelegate = commandDelegate
        self.callbackId = callbackId
    }

    public func success(result: Any?) {
        if let res = result as? CDVPluginResult.JSONMessage {
            commandDelegate.send(.success(message: res), callbackId: callbackId)
        } else if let res = result as? String {
            commandDelegate.send(.success(message: res), callbackId: callbackId)
        } else {
            commandDelegate.send(.success, callbackId: callbackId)
        }
    }
    
    public func reject(code: String, message: String?, details: Any?) {
        commandDelegate.send(.failure(with: code), callbackId: callbackId)
    }
    
    public func reject(error: Error) {
        commandDelegate.send(.failure(with: error), callbackId: callbackId)
    }
}
