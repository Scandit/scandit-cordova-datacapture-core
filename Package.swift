// swift-tools-version: 5.9
// Copyright (c) 2026 Scandit AG. All rights reserved.

import Foundation
import PackageDescription

// Find the shared/ios frameworks directory from the package directory path.
// Two supported layouts:
//   Dev:     .../frameworks/cordova/<plugin>
//            → .../frameworks/shared/ios
//   Archive: .../<archive-root>/<plugin>
//            → .../<archive-root>/shared/ios  (1 level up)
// In an installed Cordova project (platforms/ios/packages/<plugin>),
// there is no local shared path — the GitHub URL fallback is used.
func findSharedFrameworksPath() -> String? {
    let packageDir = Context.packageDirectory

    // Dev repo layout: path contains /frameworks/cordova/
    if let range = packageDir.range(of: "/frameworks/cordova/") {
        return String(packageDir[..<range.lowerBound]) + "/frameworks/shared/ios"
    }

    // Archive layout: <archive-root>/<plugin> — go up 1 level
    let base = (packageDir as NSString).deletingLastPathComponent
    let candidatePath = (base as NSString).appendingPathComponent("shared/ios")
    if FileManager.default.fileExists(atPath: candidatePath) {
        return candidatePath
    }

    return nil
}

// Read version from package.json
func getVersion() -> String {
    let packageJSONPath = Context.packageDirectory + "/package.json"
    guard let data = try? Data(contentsOf: URL(fileURLWithPath: packageJSONPath)),
        let json = try? JSONSerialization.jsonObject(with: data) as? [String: Any],
        let version = json["version"] as? String
    else {
        fatalError("Could not read version from package.json at \(packageJSONPath)")
    }
    return version
}

let version = getVersion()

var dependencies: [Package.Dependency] = [
    // cordova-ios 8 rewrites this dependency at plugin install time to point to the local CordovaLib.
    .package(url: "https://github.com/apache/cordova-ios.git", from: "8.0.0")
]

let coreFrameworksPath = findSharedFrameworksPath().map {
    "\($0)/scandit-datacapture-frameworks-core"
}

if let localPath = coreFrameworksPath {
    dependencies.append(.package(path: localPath))
} else {
    dependencies.append(
        .package(
            url: "https://github.com/Scandit/scandit-datacapture-frameworks-core.git",
            exact: Version(stringLiteral: version)
        )
    )
}

let package = Package(
    name: "scandit-cordova-datacapture-core",
    platforms: [.iOS(.v15)],
    products: [
        .library(
            name: "scandit-cordova-datacapture-core",
            targets: ["ScanditCordovaDatacaptureCore"]
        )
    ],
    dependencies: dependencies,
    targets: [
        // Objective-C target for VolumeButtonObserver (accesses private SDK class at runtime)
        .target(
            name: "ScanditCordovaDatacaptureCoreObjC",
            dependencies: [
                .product(name: "ScanditFrameworksCore", package: "scandit-datacapture-frameworks-core")
            ],
            path: "src/ios/ObjC",
            publicHeadersPath: "."
        ),
        // Swift target containing the Cordova plugin and shared utilities
        .target(
            name: "ScanditCordovaDatacaptureCore",
            dependencies: [
                .product(name: "Cordova", package: "cordova-ios"),
                .product(name: "ScanditFrameworksCore", package: "scandit-datacapture-frameworks-core"),
                "ScanditCordovaDatacaptureCoreObjC",
            ],
            path: "src/ios",
            exclude: ["ObjC"]
        ),
    ]
)
