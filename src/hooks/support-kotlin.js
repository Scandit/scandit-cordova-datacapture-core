const fs = require('fs')

const gradlePath = './platforms/android/app/build.gradle'

const tagPlatform = 'platform'
const platformAndroid = 'android'
const tagApplyPlugin = 'apply-plugin'

const kotlinVariablePositionRegex = /buildscript(\s*)\{\s*/g
const kotlinClasspathPositionRegex = /classpath\s+(['"])[\w.:]+(['"])/g
const kotlinPluginPositionRegex = /com.android.application['"]/g

const classpaths = [
    '\t\tclasspath "org.jetbrains.kotlin:kotlin-gradle-plugin:$kotlin_version"',
    '\t\tclasspath "org.jetbrains.kotlin:kotlin-allopen:$kotlin_version"'
]

const addKotlinSupport = (context) => {
    let gradleFileContent = fs.readFileSync(gradlePath).toString()

    const pluginRootTag = context.opts.plugin.pluginInfo._et._root

    const isPlatformTag = (tag) => tag === tagPlatform
    const isAndroid = (platform) => platform === platformAndroid
    const isApplyPlugin = (tag) => tag === tagApplyPlugin

    const pluginNameToString = (pluginName) => `apply plugin: "${pluginName}"`

    let applyPlugins = []
    let kotlinVersion

    const traverseTag = (entry) => {
        if (entry._children.length > 0) {
            for (let childEntry of entry._children ) {
                traverseTag(childEntry)
            }
        }

        // Check if it's android platform tag and contains kotlin version.
        if (isPlatformTag(entry.tag) && isAndroid(entry.attrib.name) && entry.attrib.kotlin) {
            kotlinVersion = entry.attrib.kotlin
        } else if (isApplyPlugin(entry.tag) && entry.text) {// Check if it's apply plugin tag.
            applyPlugins.push(entry.text)
        }
    }

    traverseTag(pluginRootTag)

    if (kotlinVersion) {
        // Add kotlin version variable to ext.
        gradleFileContent = append(`\text.kotlin_version = "${kotlinVersion}"\n\t`, kotlinVariablePositionRegex, gradleFileContent)
        // Add kotlin classpath.
        for (let classpath of classpaths) {
            gradleFileContent = append(classpath, kotlinClasspathPositionRegex, gradleFileContent)
        }
    }

    // Add all plugins avoiding duplicates.
    for (let plugin of applyPlugins) {
        const pluginString = pluginNameToString(plugin)
        gradleFileContent = append(pluginString, kotlinPluginPositionRegex, gradleFileContent)
    }
    fs.writeFileSync(gradlePath, gradleFileContent)
}

const append = (edit, reg, fullText) => {
    if (fullText.includes(edit)) return fullText

    const pos = fullText.search(reg)
    const len = fullText.match(reg)[0].length
    const header = fullText.substring(0, pos + len)
    const footer = fullText.substring(pos + len)
    return header + '\n' + edit + footer
}

module.exports = addKotlinSupport
