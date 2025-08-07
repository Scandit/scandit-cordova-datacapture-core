import ScanditFrameworksCore

public struct CordovaResult: FrameworksResult {
    private let commandDelegate: CDVCommandDelegate
    private let callbackId: String

    public init(_ commandDelegate: CDVCommandDelegate, _ callbackId: String) {
        self.commandDelegate = commandDelegate
        self.callbackId = callbackId
    }

    public func success(result: Any?) {
        if let resultDict = result as? [String: Any] {
            do {
                let jsonData = try JSONSerialization.data(withJSONObject: resultDict, options: [])
                if let jsonString = String(data: jsonData, encoding: .utf8) {
                    commandDelegate.send(.success(message: ["data": jsonString]), callbackId: callbackId)
                }
            } catch {
                reject(code: "JSON_ERROR", message: "Failed to convert to JSON", details: error)
            }
        } else if let unwrappedResult = result {
            commandDelegate.send(.success(message: ["data": String(describing: unwrappedResult)]), callbackId: callbackId)
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
