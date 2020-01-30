extension CGPoint {
    var json: CDVPluginResult.JSONMessage {
        return [
            "x": x,
            "y": y
        ]
    }
}

struct PointJSON: CommandJSONArgument {
    let x: Double
    let y: Double

    var cgPoint: CGPoint {
        return CGPoint(x: x, y: y)
    }
}
