protocol BlockingListenerCallbackResult: Decodable {
    var finishCallbackID: ListenerEvent.Name { get }
}

class CallbackLock {
    let condition = NSCondition()
    var isCallbackFinished = true
    var result: BlockingListenerCallbackResult? = nil

    func wait(afterDoing block: () -> Void) {
        isCallbackFinished = false
        block()

        condition.lock()
        while !isCallbackFinished {
            condition.wait()
        }

        condition.unlock()
    }

    func release() {
        isCallbackFinished = true
        condition.signal()
    }
}

class CallbackLocks {
    var locks: [ListenerEvent.Name: CallbackLock] = [ListenerEvent.Name: CallbackLock]()

    func wait(for eventName: ListenerEvent.Name, afterDoing block: () -> Void) {
        getLock(for: eventName).wait(afterDoing: block)
    }

    func release(for eventName: ListenerEvent.Name) {
        getLock(for: eventName).release()
    }

    func setResult(_ result: BlockingListenerCallbackResult?, for eventName: ListenerEvent.Name) {
        getLock(for: eventName).result = result
    }

    func clearResult(for eventName: ListenerEvent.Name) {
        setResult(nil, for: eventName)
    }

    func getResult(for eventName: ListenerEvent.Name) -> BlockingListenerCallbackResult? {
        return getLock(for: eventName).result
    }

    func releaseAll() {
        locks.values.forEach({ $0.release() })
    }

    private func getLock(for eventName: ListenerEvent.Name) -> CallbackLock {
        if locks[eventName] == nil {
            locks[eventName] = CallbackLock()
        }
        return locks[eventName]!
    }
}
