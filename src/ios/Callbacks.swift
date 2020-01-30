struct Callback {
    let id: String

    func dispose(by commandDelegate: CDVCommandDelegate) {
        commandDelegate.send(.disposeCallback, callbackId: id)
    }
}
