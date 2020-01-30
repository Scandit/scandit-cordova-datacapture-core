import ScanditCaptureCore

extension ScanditCaptureCore: DataCaptureViewDeserializerDelegate {
    func viewDeserializer(_ deserializer: DataCaptureViewDeserializer,
                          didStartDeserializingView view: DataCaptureView,
                          from JSONValue: JSONValue) { }

    func viewDeserializer(_ deserializer: DataCaptureViewDeserializer,
                          didFinishDeserializingView view: DataCaptureView,
                          from JSONValue: JSONValue) {
        captureView = view
    }
}
