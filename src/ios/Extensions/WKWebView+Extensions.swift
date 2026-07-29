import WebKit

extension WKWebView {
    var adjustedContentInset: UIEdgeInsets {
        scrollView.contentInset
    }

    func clearScrollViewBackgroundColor() {
        var scroller: UIScrollView?
        let scrollViewSelector = NSSelectorFromString("scrollView")
        if self.responds(to: scrollViewSelector) {
            scroller = self.perform(scrollViewSelector)?.takeUnretainedValue() as? UIScrollView
            scroller?.backgroundColor = .clear
        }
    }

    func restoreDefaultBackgroundColor() {
        var scroller: UIScrollView?
        let scrollViewSelector = NSSelectorFromString("scrollView")
        if self.responds(to: scrollViewSelector) {
            scroller = self.perform(scrollViewSelector)?.takeUnretainedValue() as? UIScrollView
            scroller?.backgroundColor = .clear
        }
    }
}
