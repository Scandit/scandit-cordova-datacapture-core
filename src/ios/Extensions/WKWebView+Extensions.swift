import WebKit

extension WKWebView {
    var adjustedContentInset: UIEdgeInsets {
        scrollView.contentInset
    }
}
