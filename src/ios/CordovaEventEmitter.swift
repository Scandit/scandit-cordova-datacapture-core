import ScanditFrameworksCore

public class CordovaEventEmitter: Emitter {
    private let commandDelegate: CDVCommandDelegate
    private var callbacks: [String: String] = [:]
    private var specificCallbacks: [Int: [String: String]] = [:]

    private let lock = DispatchSemaphore(value: 1)

    public init(commandDelegate: CDVCommandDelegate) {
        self.commandDelegate = commandDelegate
    }

    public func emit(name: String, payload: [String :Any?]) {
        self.lock.wait()
        defer { self.lock.signal() }

        guard let callbackId = getCallback(name: name, payload: payload) else {
            return
        }

        guard let data = try? JSONSerialization.data(withJSONObject: payload),
              let jsonString = String(data: data, encoding: .utf8) else { return }

        let args: [String: Any] = [
            "name": name,
            "data": jsonString
        ]
        commandDelegate.send(.listenerCallback(args), callbackId: callbackId)
    }

    private func getCallback(name: String, payload: [String: Any?]) -> String? {
        if let viewId = payload["viewId"] as? Int, let viewCallbacks = specificCallbacks[viewId] {
            return viewCallbacks[name]
        }
        if let modeId = payload["modeId"] as? Int, let modeCallbacks = specificCallbacks[modeId] {
            return modeCallbacks[name]
        }
        return callbacks[name]
    }

    public func hasListener(for event: String) -> Bool {
        self.lock.wait()
        defer { self.lock.signal() }

        return callbacks[event] != nil
    }

    public func hasViewSpecificListenersForEvent(_ viewId: Int, for event: String) -> Bool {
        self.lock.wait()
        defer { self.lock.signal() }

        if let callbacksForView = specificCallbacks[viewId], callbacksForView.keys.contains(event)  {
            return true
        }
        return false
    }

    public func registerCallback(with name: String, call: CDVInvokedUrlCommand) {
        self.lock.wait()
        defer { self.lock.signal() }

        if callbacks.keys.contains(name) {
            commandDelegate.send(.disposeCallback, callbackId: callbacks[name]!)
        }
        callbacks[name] = call.callbackId
    }

    public func registerViewSpecificCallback(_ viewId: Int, with name: String, call: CDVInvokedUrlCommand) {
        self.lock.wait()
        defer { self.lock.signal() }

        if specificCallbacks.keys.contains(viewId) == false {
            specificCallbacks[viewId] = [:]
        }

        if let callbacksForView = specificCallbacks[viewId],
           callbacksForView.keys.contains(name) {
            commandDelegate.send(.disposeCallback, callbackId: callbacksForView[name]!)
        }
        specificCallbacks[viewId]?[name] = call.callbackId
    }

    public func registerModeSpecificCallback(_ modeId: Int, with name: String, call: CDVInvokedUrlCommand) {
        self.lock.wait()
        defer { self.lock.signal() }

        if specificCallbacks.keys.contains(modeId) == false {
            specificCallbacks[modeId] = [:]
        }

        if let callbacksForView = specificCallbacks[modeId],
           callbacksForView.keys.contains(name) {
            commandDelegate.send(.disposeCallback, callbackId: callbacksForView[name]!)
        }
        specificCallbacks[modeId]?[name] = call.callbackId
    }

    public func unregisterCallback(with name: String) {
        self.lock.wait()
        defer { self.lock.signal() }

        callbacks.removeValue(forKey: name)
    }

    public func unregisterViewSpecificCallback(_ viewId: Int, with name: String) {
        self.lock.wait()
        defer { self.lock.signal() }

        if var callbacksForView = specificCallbacks[viewId] {
            callbacksForView.removeValue(forKey: name)
        }
    }

    public func unregisterModeSpecificCallback(_ modeId: Int, with name: String) {
        self.lock.wait()
        defer { self.lock.signal() }

        if var callbacksForView = specificCallbacks[modeId] {
            callbacksForView.removeValue(forKey: name)
        }
    }

    public func removeCallbacks() {
        self.lock.wait()
        defer { self.lock.signal() }

        callbacks.removeAll()
        specificCallbacks.removeAll()
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
