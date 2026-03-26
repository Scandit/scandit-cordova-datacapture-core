import ScanditCaptureCore
import ScanditFrameworksCore
import WebKit

@objc(ScanditCaptureCore)
// swiftlint:disable:next type_body_length
public class ScanditCaptureCore: CDVPlugin {
    var coreModule: CoreModule!
    var eventEmitter: CordovaEventEmitter!
    var emitter: CordovaEventEmitter { eventEmitter }
    var volumeButtonObserverCallback: Callback?

    var captureView: DataCaptureView? {
        didSet {
            guard oldValue != captureView else { return }

            if let oldValue = oldValue {
                captureViewConstraints.captureView = nil
                if oldValue.superview != nil {
                    oldValue.removeFromSuperview()
                }
            }

            guard let captureView = captureView else {
                return
            }

            captureView.isHidden = true
            captureView.translatesAutoresizingMaskIntoConstraints = false

            viewController.view.addSubview(captureView)
            captureViewConstraints.captureView = captureView
        }
    }

    private var volumeButtonObserver: VolumeButtonObserver?

    private lazy var captureViewConstraints: NativeViewConstraints = {
        guard let wkWebView = webView as? WKWebView else {
            fatalError("WebView must be a WKWebView")
        }
        return NativeViewConstraints(relativeTo: wkWebView)
    }()

    public override func pluginInitialize() {
        guard webView is WKWebView else {
            fatalError(
                """
                The Scandit Data Capture SDK requires the Cordova WebView to be a WKWebView.
                For more information, see the Scandit documentation about how to add the Data Capture SDK to your app.
                """
            )
        }

        eventEmitter = CordovaEventEmitter(commandDelegate: commandDelegate)
        coreModule = CoreModule.create(emitter: eventEmitter)
        DefaultServiceLocator.shared.register(module: coreModule)
        coreModule.didStart()
    }

    public override func dispose() {
        coreModule.didStop()
    }

    // MARK: - DataCaptureContextProxy

    // MARK: Listeners

    @objc(subscribeVolumeButtonObserver:)
    func subscribeVolumeButtonObserver(command: CDVInvokedUrlCommand) {
        volumeButtonObserverCallback = Callback(id: command.callbackId)
        volumeButtonObserver = VolumeButtonObserver(handler: { [weak self] in
            guard let self = self,
                let callback = self.volumeButtonObserverCallback
            else {
                return
            }
            self.commandDelegate.send(
                .listenerCallback(ListenerEvent(name: .didChangeVolume)),
                callbackId: callback.id
            )
        })
        commandDelegate.send(.keepCallback, callbackId: command.callbackId)
    }

    @objc(unsubscribeVolumeButtonObserver:)
    func unsubscribeVolumeButtonObserver(command: CDVInvokedUrlCommand) {
        volumeButtonObserverCallback?.dispose(by: commandDelegate)
        volumeButtonObserver = nil
        commandDelegate.send(.success, callbackId: command.callbackId)
    }

    // MARK: - DataCaptureViewProxy

    @objc(setDataCaptureViewPositionAndSize:)
    func setDataCaptureViewPositionAndSize(command: CDVInvokedUrlCommand) {
        guard let args = command.defaultArgumentAsDictionary,
            let top = args["top"] as? Double,
            let left = args["left"] as? Double,
            let width = args["width"] as? Double,
            let height = args["height"] as? Double,
            let shouldBeUnderWebView = args["shouldBeUnderWebView"] as? Bool
        else {
            commandDelegate.send(.failure(with: .noViewIdParam), callbackId: command.callbackId)
            return
        }

        let viewPositionAndSizeJSON = ViewPositionAndSizeJSON.init(
            top: top,
            left: left,
            width: width,
            height: height,
            shouldBeUnderWebView: shouldBeUnderWebView
        )

        captureViewConstraints.updatePositionAndSize(fromJSON: viewPositionAndSizeJSON)

        if viewPositionAndSizeJSON.shouldBeUnderWebView {
            // Make the WebView transparent, so we can see views behind
            webView.isOpaque = false
            webView.backgroundColor = .clear
            if let wkWebView = webView as? WKWebView {
                wkWebView.clearScrollViewBackgroundColor()
            }
        }

        commandDelegate.send(.success, callbackId: command.callbackId)
    }

    @objc(showDataCaptureView:)
    func showDataCaptureView(command: CDVInvokedUrlCommand) {
        guard let captureView = captureView else {
            commandDelegate.send(.failure(with: .noViewToBeShown), callbackId: command.callbackId)
            return
        }

        captureView.isHidden = false

        commandDelegate.send(.success, callbackId: command.callbackId)
    }

    @objc(hideDataCaptureView:)
    func hideDataCaptureView(command: CDVInvokedUrlCommand) {
        guard let captureView = captureView else {
            commandDelegate.send(.failure(with: .noViewToBeHidden), callbackId: command.callbackId)
            return
        }

        captureView.isHidden = true

        commandDelegate.send(.success, callbackId: command.callbackId)
    }

    // MARK: - Defaults

    @objc(getDefaults:)
    func getDefaults(command: CDVInvokedUrlCommand) {
        let defaults = coreModule.getDefaults() as CDVPluginResult.JSONMessage
        commandDelegate.send(.success(message: defaults), callbackId: command.callbackId)
    }

    @objc(createDataCaptureView:)
    func createDataCaptureView(command: CDVInvokedUrlCommand) {
        guard let args = command.defaultArgumentAsDictionary,
            let viewJson = args["viewJson"] as? String
        else {
            commandDelegate.send(.failure(with: .invalidJSON), callbackId: command.callbackId)
            return
        }
        coreModule.createDataCaptureView(
            viewJson: viewJson,
            result: CordovaResult(self.commandDelegate, emitter: self.emitter, command: command)
        ) { [weak self] dcView in
            dispatchMain {
                self?.captureView = dcView
            }
        }
    }

    @objc(removeDataCaptureView:)
    func removeDataCaptureView(command: CDVInvokedUrlCommand) {
        dispatchMain {
            if let dcViewToRemove = self.captureView {
                self.coreModule.dataCaptureViewDisposed(dcViewToRemove)
            }

            self.commandDelegate.send(.success, callbackId: command.callbackId)
        }

    }

    /// Single entry point for all Core operations.
    /// Routes method calls to the appropriate command via the shared command factory.
    @objc func executeCore(_ command: CDVInvokedUrlCommand) {
        let result = CordovaResult(
            commandDelegate,
            emitter: emitter,
            command: command
        )

        let handled = coreModule.execute(
            CordovaMethodCall(command: command),
            result: result,
            module: coreModule
        )

        if !handled {
            let pluginResult = CDVPluginResult(
                status: .error,
                messageAs: "Unknown Core method"
            )
            commandDelegate.send(pluginResult, callbackId: command.callbackId)
        }
    }

    // === END GENERATED ===
}
