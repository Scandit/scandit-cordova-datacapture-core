/*
 * This file is part of the Scandit Data Capture SDK
 *
 * Copyright (C) 2025- Scandit AG. All rights reserved.
 */

class JSONArgs {
    private let argsJson: [String: Any?]
    private let command: CDVInvokedUrlCommand
    private let delegate: CDVCommandDelegate

    init?(_ command: CDVInvokedUrlCommand, _ delegate: CDVCommandDelegate) {
        guard let argsJson = command.defaultArgumentAsDictionary else {
            delegate.send(.failure(with: CommandError.invalidJSON), callbackId: command.callbackId)
            return nil
        }
        self.argsJson = argsJson
        self.command = command
        self.delegate = delegate
    }

    subscript<T>(key: String) -> T? {
        guard let value = argsJson[key] as? T else {
            delegate.send(.failure(with: CommandError.wrongOrNoArgumentPassed), callbackId: command.callbackId)
            return nil
        }
        return value
    }
}
