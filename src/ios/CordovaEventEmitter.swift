import ScanditFrameworksCore

#if SWIFT_PACKAGE
import Cordova
#endif

public class CordovaEventEmitter: Emitter {
    private let commandDelegate: CDVCommandDelegate
    private static var callbacks: [String: String] = [:]
    private static var specificCallbacks: [Int: [String: String]] = [:]
    private var ownedCallbacks: [String: String] = [:]
    private var ownedSpecificCallbacks: [Int: [String: String]] = [:]

    private let lock = CordovaEventEmitter.sharedLock
    private static let sharedLock = DispatchSemaphore(value: 1)

    public init(commandDelegate: CDVCommandDelegate) {
        self.commandDelegate = commandDelegate
    }

    public func emit(name: String, payload: [String: Any?]) {
        self.lock.wait()
        let callbackId = getCallback(name: name, payload: payload)
        self.lock.signal()

        guard let callbackId else {
            return
        }

        guard let data = try? JSONSerialization.data(withJSONObject: payload),
            let jsonString = String(data: data, encoding: .utf8)
        else { return }

        let args: [String: Any] = [
            "name": name,
            "data": jsonString,
        ]
        commandDelegate.send(.listenerCallback(args), callbackId: callbackId)
    }

    private func getCallback(name: String, payload: [String: Any?]) -> String? {
        if let viewId = payload["viewId"] as? Int, let callback = Self.specificCallbacks[viewId]?[name] {
            return callback
        }
        if let viewId = payload["dataCaptureViewId"] as? Int, let callback = Self.specificCallbacks[viewId]?[name] {
            return callback
        }
        if let modeId = payload["modeId"] as? Int, let callback = Self.specificCallbacks[modeId]?[name] {
            return callback
        }
        return Self.callbacks[name]
    }

    public func hasListener(for event: String) -> Bool {
        self.lock.wait()
        defer { self.lock.signal() }

        return Self.callbacks[event] != nil
    }

    public func hasViewSpecificListenersForEvent(_ viewId: Int, for event: String) -> Bool {
        self.lock.wait()
        defer { self.lock.signal() }

        if let callbacksForView = Self.specificCallbacks[viewId], callbacksForView.keys.contains(event) {
            return true
        }
        return false
    }

    public func hasModeSpecificListenersForEvent(_ modeId: Int, for event: String) -> Bool {
        self.lock.wait()
        defer { self.lock.signal() }

        if let callbacksForView = Self.specificCallbacks[modeId], callbacksForView.keys.contains(event) {
            return true
        }
        return false
    }

    public func registerCallback(with name: String, call: CDVInvokedUrlCommand) {
        self.lock.wait()
        let existingCallbackId = Self.callbacks[name]
        Self.callbacks[name] = call.callbackId
        ownedCallbacks[name] = call.callbackId
        self.lock.signal()

        if let existingCallbackId {
            commandDelegate.send(.disposeCallback, callbackId: existingCallbackId)
        }
    }

    public func registerViewSpecificCallback(_ viewId: Int, with name: String, call: CDVInvokedUrlCommand) {
        self.lock.wait()
        let existingCallbackId = Self.specificCallbacks[viewId]?[name]
        Self.specificCallbacks[viewId, default: [:]][name] = call.callbackId
        ownedSpecificCallbacks[viewId, default: [:]][name] = call.callbackId
        self.lock.signal()

        if let existingCallbackId {
            commandDelegate.send(.disposeCallback, callbackId: existingCallbackId)
        }
    }

    public func registerModeSpecificCallback(_ modeId: Int, with name: String, call: CDVInvokedUrlCommand) {
        self.lock.wait()
        let existingCallbackId = Self.specificCallbacks[modeId]?[name]
        Self.specificCallbacks[modeId, default: [:]][name] = call.callbackId
        ownedSpecificCallbacks[modeId, default: [:]][name] = call.callbackId
        self.lock.signal()

        if let existingCallbackId {
            commandDelegate.send(.disposeCallback, callbackId: existingCallbackId)
        }
    }

    public func unregisterCallback(with name: String) {
        self.lock.wait()
        let owned = ownedCallbacks.removeValue(forKey: name)
        var removed: String?
        if let owned, Self.callbacks[name] == owned {
            removed = Self.callbacks.removeValue(forKey: name)
        }
        self.lock.signal()

        if let removed {
            commandDelegate.send(.disposeCallback, callbackId: removed)
        }
    }

    public func unregisterViewSpecificCallback(_ viewId: Int, with name: String) {
        self.lock.wait()
        let owned = ownedSpecificCallbacks[viewId]?.removeValue(forKey: name)
        var removed: String?
        if let owned, Self.specificCallbacks[viewId]?[name] == owned {
            removed = Self.specificCallbacks[viewId]?.removeValue(forKey: name)
        }
        self.lock.signal()

        if let removed {
            commandDelegate.send(.disposeCallback, callbackId: removed)
        }
    }

    public func unregisterModeSpecificCallback(_ modeId: Int, with name: String) {
        self.lock.wait()
        let owned = ownedSpecificCallbacks[modeId]?.removeValue(forKey: name)
        var removed: String?
        if let owned, Self.specificCallbacks[modeId]?[name] == owned {
            removed = Self.specificCallbacks[modeId]?.removeValue(forKey: name)
        }
        self.lock.signal()

        if let removed {
            commandDelegate.send(.disposeCallback, callbackId: removed)
        }
    }

    public func removeCallbacks() {
        self.lock.wait()
        var removed: [String] = []
        for (name, owned) in ownedCallbacks where Self.callbacks[name] == owned {
            Self.callbacks.removeValue(forKey: name)
            removed.append(owned)
        }
        for (id, events) in ownedSpecificCallbacks {
            for (name, owned) in events where Self.specificCallbacks[id]?[name] == owned {
                Self.specificCallbacks[id]?.removeValue(forKey: name)
                removed.append(owned)
            }
            if Self.specificCallbacks[id]?.isEmpty == true {
                Self.specificCallbacks.removeValue(forKey: id)
            }
        }
        ownedCallbacks.removeAll()
        ownedSpecificCallbacks.removeAll()
        self.lock.signal()

        removed.forEach { commandDelegate.send(.disposeCallback, callbackId: $0) }
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
