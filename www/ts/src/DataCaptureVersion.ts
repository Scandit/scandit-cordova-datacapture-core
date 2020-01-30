/// <amd-module name="scandit-cordova-datacapture-core.DataCaptureVersion"/>
// ^ needed because Cordova can't resolve "../xx" style dependencies

import { pluginsMetadata } from './Cordova/CommonCordova';

export class DataCaptureVersion {
    public static get pluginVersion(): string {
        return pluginsMetadata['scandit-cordova-datacapture-core'];
    }
}
