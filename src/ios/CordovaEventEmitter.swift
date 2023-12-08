import ScanditFrameworksCore

public class CordovaEventEmitter: Emitter {
    private let commandDelegate: CDVCommandDelegate
    private var callbacks: [String: String] = [:]

    public init(commandDelegate: CDVCommandDelegate) {
        self.commandDelegate = commandDelegate
    }

    public func emit(name: String, payload: [String :Any?]) {
        guard let callbackId = callbacks[name] else { return }
        let args: [String: Any] = [
            "name": name,
            "argument": payload
        ]
        commandDelegate.send(.listenerCallback(args), callbackId: callbackId)
    }

    public func hasListener(for event: String) -> Bool {
        callbacks[event] != nil
    }

    public func registerCallback(with name: String, call: CDVInvokedUrlCommand) {
        if callbacks.keys.contains(name) {
            commandDelegate.send(.disposeCallback, callbackId: callbacks[name]!)
        }
        callbacks[name] = call.callbackId
    }

    public func unregisterCallback(with name: String) {
        callbacks.removeValue(forKey: name)
    }

    public func removeCallbacks() {
        callbacks.removeAll()
    }
}

extension CordovaEventEmitter {
    func registerCallback(with event: ScanditFrameworksCoreEvent, call: CDVInvokedUrlCommand) {
        registerCallback(with: event.rawValue, call: call)
    }

    func unregisterCallback(with event: ScanditFrameworksCoreEvent) {
        unregisterCallback(with: event.rawValue)
    }
}
