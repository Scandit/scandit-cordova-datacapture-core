import WebKit

#if SWIFT_PACKAGE
import Cordova
#endif

extension WKWebView {
    public var adjustedContentInset: UIEdgeInsets {
        scrollView.contentInset
    }

    public func clearScrollViewBackgroundColor() {
        var scroller: UIScrollView?
        let scrollViewSelector = NSSelectorFromString("scrollView")
        if self.responds(to: scrollViewSelector) {
            scroller = self.perform(scrollViewSelector)?.takeUnretainedValue() as? UIScrollView
            scroller?.backgroundColor = .clear
        }
    }

    public func restoreDefaultBackgroundColor() {
        var scroller: UIScrollView?
        let scrollViewSelector = NSSelectorFromString("scrollView")
        if self.responds(to: scrollViewSelector) {
            scroller = self.perform(scrollViewSelector)?.takeUnretainedValue() as? UIScrollView
            scroller?.backgroundColor = .clear
        }
    }
}
