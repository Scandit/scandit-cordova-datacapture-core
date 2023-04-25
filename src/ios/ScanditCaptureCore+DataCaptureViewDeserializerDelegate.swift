import ScanditCaptureCore

extension ScanditCaptureCore: DataCaptureViewDeserializerDelegate {
    public func viewDeserializer(_ deserializer: DataCaptureViewDeserializer,
                                 didStartDeserializingView view: DataCaptureView,
                                 from jsonValue: JSONValue) {
        // Empty on purpose
    }

    public func viewDeserializer(_ deserializer: DataCaptureViewDeserializer,
                                 didFinishDeserializingView view: DataCaptureView,
                                 from jsonValue: JSONValue) {
        captureView = view
    }
}
