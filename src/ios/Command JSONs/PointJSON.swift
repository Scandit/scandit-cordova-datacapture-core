extension CGPoint {
    var json: CDVPluginResult.JSONMessage {
        [
            "x": x,
            "y": y,
        ]
    }

    var jsonString: String {
        guard let data = try? JSONSerialization.data(withJSONObject: json),
            let string = String(data: data, encoding: .utf8)
        else {
            return "{}"
        }
        return string
    }
}

struct PointJSON: CommandJSONArgument {
    let x: Double
    let y: Double

    var cgPoint: CGPoint {
        CGPoint(x: x, y: y)
    }
}
