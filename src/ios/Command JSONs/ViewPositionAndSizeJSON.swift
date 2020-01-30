struct ViewPositionAndSizeJSON: CommandJSONArgument {
    let top: Double
    let left: Double
    let width: Double
    let height: Double

    var position: CGPoint {
        return CGPoint(x: left, y: top)
    }

    var size: CGSize {
        return CGSize(width: width, height: height)
    }
}
