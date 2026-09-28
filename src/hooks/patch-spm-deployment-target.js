// Copyright 2026 Scandit AG. All rights reserved.

// TODO: Remove this hook after upgrading to cordova-ios >= 8.0.1, which
// propagates the deployment-target from config.xml into Package.swift during
// `cordova prepare` (see https://github.com/apache/cordova-ios/pull/1616).

const fs = require('fs')
const path = require('path')

const DEPLOYMENT_TARGET_IOS = '.iOS(.v15)'
const DEPLOYMENT_TARGET_CATALYST = '.macCatalyst(.v15)'

const patchSpmDeploymentTarget = (context) => {
    const projectRoot = context.opts.projectRoot
    const packageSwiftPath = path.join(
        projectRoot, 'platforms', 'ios', 'packages', 'cordova-ios-plugins', 'Package.swift'
    )

    if (!fs.existsSync(packageSwiftPath)) {
        return
    }

    const original = fs.readFileSync(packageSwiftPath, 'utf8')
    const patched = original
        .replace('.iOS(.v13)', DEPLOYMENT_TARGET_IOS)
        .replace('.macCatalyst(.v13)', DEPLOYMENT_TARGET_CATALYST)

    if (patched !== original) {
        fs.writeFileSync(packageSwiftPath, patched, 'utf8')
        console.log('Scandit: Patched CordovaPlugins/Package.swift deployment target to iOS 15')
    }
}

module.exports = patchSpmDeploymentTarget
