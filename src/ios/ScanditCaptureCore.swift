import WebKit

import ScanditCaptureCore
import ScanditFrameworksCore

@objc(ScanditCaptureCore)
// swiftlint:disable:next type_body_length
public class ScanditCaptureCore: CDVPlugin {
    var coreModule: CoreModule!
    var eventEmitter: CordovaEventEmitter!
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

    private lazy var captureViewConstraints = NativeViewConstraints(relativeTo: webView as! WKWebView)

    public override func pluginInitialize() {
        guard webView is WKWebView else {
            fatalError("""
                The Scandit Data Capture SDK requires the Cordova WebView to be a WKWebView.
                For more information, see the Scandit documentation about how to add the Data Capture SDK to your app.
                """)
        }

        eventEmitter = CordovaEventEmitter(commandDelegate: commandDelegate)
        let frameSourceListener = FrameworksFrameSourceListener(eventEmitter: eventEmitter)
        let frameSourceDeserializer = FrameworksFrameSourceDeserializer(
            frameSourceListener: frameSourceListener,
            torchListener: frameSourceListener
        )
        let contextListener = FrameworksDataCaptureContextListener(eventEmitter: eventEmitter)
        let viewListener = FrameworksDataCaptureViewListener(eventEmitter: eventEmitter)
        
        coreModule = CoreModule(frameSourceDeserializer: frameSourceDeserializer,
                                frameSourceListener: frameSourceListener,
                                dataCaptureContextListener: contextListener,
                                dataCaptureViewListener: viewListener
        )
        coreModule.didStart()
    }

    public override func dispose() {
        coreModule.didStop()
    }

    // MARK: - DataCaptureContextProxy

    // MARK: Context deserialization

    @objc(contextFromJSON:)
    public func contextFromJSON(command: CDVInvokedUrlCommand) {
        guard let jsonString = command.defaultArgumentAsString else {
            commandDelegate.send(.failure(with: .invalidJSON), callbackId: command.callbackId)
            return
        }
        coreModule.createContextFromJSON(jsonString, result: CordovaResult(commandDelegate, command.callbackId))
    }

    @objc(updateContextFromJSON:)
    func updateContextFromJSON(command: CDVInvokedUrlCommand) {
        guard let jsonString = command.defaultArgumentAsString else {
            commandDelegate.send(.failure(with: .invalidJSON), callbackId: command.callbackId)
            return
        }
        coreModule.updateContextFromJSON(jsonString, result: CordovaResult(commandDelegate, command.callbackId))
    }

    // MARK: Listeners

    @objc(subscribeContextListener:)
    func subscribeContextListener(command: CDVInvokedUrlCommand) {
        eventEmitter.registerCallback(with: .contextObservingStarted, call: command)
        eventEmitter.registerCallback(with: .contextStatusChanged, call: command)
        coreModule.registerDataCaptureContextListener()
        commandDelegate.send(.keepCallback, callbackId: command.callbackId)
    }

    @objc(unsubscribeContextListener:)
    func unsubscribeContextListener(command: CDVInvokedUrlCommand) {
        eventEmitter.unregisterCallback(with: .contextObservingStarted)
        eventEmitter.unregisterCallback(with: .contextStatusChanged)
        coreModule.unregisterDataCaptureContextListener()
        commandDelegate.send(.success, callbackId: command.callbackId)
    }

    @objc(subscribeViewListener:)
    func subscribeViewListener(command: CDVInvokedUrlCommand) {
        eventEmitter.registerCallback(with: .dataCaptureViewSizeChanged, call: command)
        coreModule.registerDataCaptureViewListener()
        commandDelegate.send(.keepCallback, callbackId: command.callbackId)
    }

    @objc(unsubscribeViewListener:)
    func unsubscribeViewListener(command: CDVInvokedUrlCommand) {
        eventEmitter.unregisterCallback(with: .dataCaptureViewSizeChanged)
        coreModule.unregisterDataCaptureViewListener()
        commandDelegate.send(.success, callbackId: command.callbackId)
    }

    @objc(subscribeFrameSourceListener:)
    func subscribeFrameSourceListener(command: CDVInvokedUrlCommand) {
        eventEmitter.registerCallback(with: .frameSourceStateChanged, call: command)
        eventEmitter.registerCallback(with: .torchStateChanged, call: command)
        coreModule.registerFrameSourceListener()
        commandDelegate.send(.keepCallback, callbackId: command.callbackId)
    }

    @objc(unsubscribeFrameSourceListener:)
    func unsubscribeFrameSourceListener(command: CDVInvokedUrlCommand) {
        eventEmitter.unregisterCallback(with: .frameSourceStateChanged)
        eventEmitter.unregisterCallback(with: .torchStateChanged)
        coreModule.unregisterFrameSourceListener()
        commandDelegate.send(.success, callbackId: command.callbackId)
    }

    @objc(subscribeVolumeButtonObserver:)
    func subscribeVolumeButtonObserver(command: CDVInvokedUrlCommand) {
        volumeButtonObserverCallback = Callback(id: command.callbackId)
        volumeButtonObserver = VolumeButtonObserver(handler: { [weak self] in
            guard let self = self else {
                return
            }
            self.commandDelegate.send(.listenerCallback(ListenerEvent(name: .didChangeVolume)),
                                      callbackId: self.volumeButtonObserverCallback!.id)
        })
        commandDelegate.send(.keepCallback, callbackId: command.callbackId)
    }

    @objc(unsubscribeVolumeButtonObserver:)
    func unsubscribeVolumeButtonObserver(command: CDVInvokedUrlCommand) {
        volumeButtonObserverCallback?.dispose(by: commandDelegate)
        volumeButtonObserver = nil
        commandDelegate.send(.success, callbackId: command.callbackId)
    }

    // MARK: Context related

    @objc(disposeContext:)
    func disposeContext(command: CDVInvokedUrlCommand) {
        coreModule.disposeContext()
        commandDelegate.send(.success, callbackId: command.callbackId)
    }

    // MARK: - DataCaptureViewProxy

    @objc(setViewPositionAndSize:)
    func setViewPositionAndSize(command: CDVInvokedUrlCommand) {
        guard let viewPositionAndSizeJSON = try? ViewPositionAndSizeJSON.fromCommand(command) else {
            commandDelegate.send(.failure(with: .invalidJSON), callbackId: command.callbackId)
            return
        }

        captureViewConstraints.updatePositionAndSize(fromJSON: viewPositionAndSizeJSON)

        if viewPositionAndSizeJSON.shouldBeUnderWebView {
            // Make the WebView transparent, so we can see views behind
            webView.isOpaque = false
            webView.backgroundColor = .clear
            webView.scrollView.backgroundColor = .clear
        }

        commandDelegate.send(.success, callbackId: command.callbackId)
    }

    @objc(showView:)
    func showView(command: CDVInvokedUrlCommand) {
        guard let captureView = captureView else {
            commandDelegate.send(.failure(with: .noViewToBeShown), callbackId: command.callbackId)
            return
        }

        captureView.isHidden = false

        commandDelegate.send(.success, callbackId: command.callbackId)
    }

    @objc(hideView:)
    func hideView(command: CDVInvokedUrlCommand) {
        guard let captureView = captureView else {
            commandDelegate.send(.failure(with: .noViewToBeHidden), callbackId: command.callbackId)
            return
        }

        captureView.isHidden = true

        commandDelegate.send(.success, callbackId: command.callbackId)
    }

    // MARK: View related

    @objc(viewPointForFramePoint:)
    func viewPointForFramePoint(command: CDVInvokedUrlCommand) {
        guard let pointJSON = command.defaultArgumentAsString else {
            commandDelegate.send(.failure(with: .invalidJSON), callbackId: command.callbackId)
            return
        }
        
        coreModule.viewPointForFramePoint(json: pointJSON, result: CordovaResult(commandDelegate, command.callbackId))
    }

    @objc(viewQuadrilateralForFrameQuadrilateral:)
    func viewQuadrilateralForFrameQuadrilateral(command: CDVInvokedUrlCommand) {
        var quad: Quadrilateral = Quadrilateral(topLeft: .zero, topRight: .zero, bottomRight: .zero, bottomLeft: .zero)
        guard let jsonString = command.defaultArgumentAsString, SDCQuadrilateralFromJSONString(jsonString, &quad) else {
            commandDelegate.send(.failure(with: .invalidJSON), callbackId: command.callbackId)
            return
        }
        
        coreModule.viewQuadrilateralForFrameQuadrilateral(json: jsonString, result: CordovaResult(commandDelegate, command.callbackId))
    }

    // MARK: - CameraProxy

    @objc(getCurrentCameraState:)
    func getCurrentCameraState(command: CDVInvokedUrlCommand) {
        coreModule.getCurrentCameraState(
            result: CordovaResult(commandDelegate, command.callbackId)
        )
    }

    @objc(getIsTorchAvailable:)
    func getIsTorchAvailable(command: CDVInvokedUrlCommand) {
        guard let positionJson = command.defaultArgumentAsString else {
            commandDelegate.send(.failure(with: .invalidJSON), callbackId: command.callbackId)
            return
        }
        
        coreModule.isTorchAvailable(
            cameraPosition: positionJson,
            result: CordovaResult(commandDelegate, command.callbackId)
        )
    }
    
    @objc(switchCameraToDesiredState:)
    func switchCameraToDesiredState(command: CDVInvokedUrlCommand) {
        guard let desiredStateJson = command.defaultArgumentAsString else {
            commandDelegate.send(.failure(with: .invalidJSON), callbackId: command.callbackId)
            return
        }
        coreModule.switchCameraToDesiredState(stateJson: desiredStateJson, result: CordovaResult(commandDelegate, command.callbackId))
    }

    // MARK: - Defaults

    @objc(getDefaults:)
    func getDefaults(command: CDVInvokedUrlCommand) {
        let defaults = coreModule.defaults.toEncodable() as CDVPluginResult.JSONMessage
        commandDelegate.send(.success(message: defaults), callbackId: command.callbackId)
    }

    // MARK: - FeedbackProxy

    @objc(emitFeedback:)
    func emitFeedback(command: CDVInvokedUrlCommand) {
        guard let jsonString = command.defaultArgumentAsString,
              let feedback = try? Feedback(fromJSONString: jsonString) else {
            commandDelegate.send(.failure(with: .invalidJSON), callbackId: command.callbackId)
            return
        }

        feedback.emit()
        commandDelegate.send(.success, callbackId: command.callbackId)
    }

    @objc(getFrame:)
    func getFrame(command: CDVInvokedUrlCommand) {
         guard let frameId = command.defaultArgumentAsString else {
            commandDelegate.send(.failure(with: .invalidJSON), callbackId: command.callbackId)
            return
        }

        coreModule.getLastFrameAsJson(frameId: frameId, result: CordovaResult(commandDelegate, command.callbackId))
    }
    
    @objc(addModeToContext:)
    func addModeToContext(command: CDVInvokedUrlCommand) {
        guard let modeJson = command.defaultArgumentAsString else {
            commandDelegate.send(.failure(with: .invalidJSON), callbackId: command.callbackId)
            return
        }
        coreModule.addModeToContext(modeJson: modeJson, result: CordovaResult(commandDelegate, command.callbackId))
    }
    
    @objc(removeModeFromContext:)
    func removeModeFromContext(command: CDVInvokedUrlCommand) {
        guard let modeJson = command.defaultArgumentAsString else {
            commandDelegate.send(.failure(with: .invalidJSON), callbackId: command.callbackId)
            return
        }
        coreModule.removeModeFromContext(modeJson: modeJson, result: CordovaResult(commandDelegate, command.callbackId))
    }
    
    @objc(removeAllModes:)
    func removeAllModes(command: CDVInvokedUrlCommand) {
        coreModule.removeAllModes(result: CordovaResult(commandDelegate, command.callbackId))
    }
    
    @objc(createDataCaptureView:)
    func createDataCaptureView(command: CDVInvokedUrlCommand) {
        guard let viewJson = command.defaultArgumentAsString else {
            commandDelegate.send(.failure(with: .invalidJSON), callbackId: command.callbackId)
            return
        }
        dispatchMain {
            self.captureView = self.coreModule.createDataCaptureView(
                viewJson: viewJson,
                result: CordovaResult(self.commandDelegate, command.callbackId)
            )
        }
    }
    
    @objc(updateDataCaptureView:)
    func updateDataCaptureView(command: CDVInvokedUrlCommand) {
        guard let viewJson = command.defaultArgumentAsString else {
            commandDelegate.send(.failure(with: .invalidJSON), callbackId: command.callbackId)
            return
        }
        dispatchMain {
            self.coreModule.updateDataCaptureView(
                viewJson: viewJson,
                result:  CordovaResult(self.commandDelegate, command.callbackId)
            )
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
    
    @objc(getOpenSourceSoftwareLicenseInfo:)
    func getOpenSourceSoftwareLicenseInfo(command: CDVInvokedUrlCommand) {
        coreModule.getOpenSourceSoftwareLicenseInfo(result: CordovaResult(commandDelegate, command.callbackId))
    }
}
