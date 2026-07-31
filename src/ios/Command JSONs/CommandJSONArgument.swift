#if SWIFT_PACKAGE
import Cordova
#endif

extension CDVInvokedUrlCommand {
    public var defaultArgument: Any? {
        argument(at: 0)
    }

    public var defaultArgumentAsString: String? {
        if let defaultArgument = defaultArgument as? String {
            return defaultArgument
        }

        guard let defaultArgument = defaultArgument,
            let data = try? JSONSerialization.data(withJSONObject: defaultArgument)
        else {
            return nil
        }

        return String(data: data, encoding: .utf8)
    }

    public var defaultArgumentAsDictionary: [String: Any?]? {
        defaultArgument as? [String: Any?]
    }
}

public protocol CommandJSONArgument: Decodable {
    static func fromJSONObject(_ jsonObject: Any) throws -> Self
    static func fromCommand(_ command: CDVInvokedUrlCommand) throws -> Self
}

extension CommandJSONArgument {
    public static func fromJSONObject(_ jsonObject: Any) throws -> Self {
        let data = try JSONSerialization.data(withJSONObject: jsonObject)
        return try JSONDecoder().decode(Self.self, from: data)
    }

    public static func fromCommand(_ command: CDVInvokedUrlCommand) throws -> Self {
        guard let defaultArgument = command.defaultArgument else {
            throw NSError(
                domain: "CommandJSONArgument",
                code: -1,
                userInfo: [NSLocalizedDescriptionKey: "Missing required command argument"]
            )
        }
        return try fromJSONObject(defaultArgument)
    }
}
