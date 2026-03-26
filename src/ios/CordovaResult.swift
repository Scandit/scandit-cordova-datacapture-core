import ScanditFrameworksCore

public struct CordovaResult: FrameworksResult {
    private let commandDelegate: CDVCommandDelegate
    private let emitter: CordovaEventEmitter
    private let command: CDVInvokedUrlCommand

    public init(
        _ commandDelegate: CDVCommandDelegate,
        emitter: CordovaEventEmitter,
        command: CDVInvokedUrlCommand
    ) {
        self.commandDelegate = commandDelegate
        self.emitter = emitter
        self.command = command
    }

    public func success(result: Any?) {
        if let resultDict = result as? [String: Any] {
            do {
                let jsonData = try JSONSerialization.data(withJSONObject: resultDict, options: [])
                if let jsonString = String(data: jsonData, encoding: .utf8) {
                    commandDelegate.send(.success(message: ["data": jsonString]), callbackId: command.callbackId)
                }
            } catch {
                reject(code: "JSON_ERROR", message: "Failed to convert to JSON", details: error)
            }
        } else if let unwrappedResult = result {
            commandDelegate.send(
                .success(message: ["data": String(describing: unwrappedResult)]),
                callbackId: command.callbackId
            )
        } else {
            commandDelegate.send(.success, callbackId: command.callbackId)
        }
    }

    public func successAndKeepCallback(result: Any?) {
        commandDelegate.send(.keepCallback, callbackId: command.callbackId)
    }

    public func registerCallbackForEvents(_ eventNames: [String]) {
        for eventName in eventNames {
            emitter.registerCallback(with: eventName, call: command)
        }
    }

    public func unregisterCallbackForEvents(_ eventNames: [String]) {
        for eventName in eventNames {
            emitter.unregisterCallback(with: eventName)
        }
    }

    public func registerModeSpecificCallback(_ modeId: Int, eventNames: [String]) {
        for eventName in eventNames {
            emitter.registerModeSpecificCallback(modeId, with: eventName, call: command)
        }
    }

    public func unregisterModeSpecificCallback(_ modeId: Int, eventNames: [String]) {
        for eventName in eventNames {
            emitter.unregisterModeSpecificCallback(modeId, with: eventName)
        }
    }

    public func registerViewSpecificCallback(_ viewId: Int, eventNames: [String]) {
        for eventName in eventNames {
            emitter.registerViewSpecificCallback(viewId, with: eventName, call: command)
        }
    }

    public func unregisterViewSpecificCallback(_ viewId: Int, eventNames: [String]) {
        for eventName in eventNames {
            emitter.unregisterViewSpecificCallback(viewId, with: eventName)
        }
    }

    public func reject(code: String, message: String?, details: Any?) {
        commandDelegate.send(.failure(with: code), callbackId: command.callbackId)
    }

    public func reject(error: Error) {
        commandDelegate.send(.failure(with: error), callbackId: command.callbackId)
    }
}
