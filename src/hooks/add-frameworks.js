const https = require('https');
const fs = require('fs');
const adm = require('adm-zip');

const platformAndroid = 'android'
const platformIos = 'ios'
const supportedPlatforms = [platformAndroid, platformIos]

const isRedirect = response => {
  return response.statusCode > 300 && response.statusCode < 400 && response.headers.location;
}

// Download and unzip a file to a given destination
const downloadAndUnzip = (url, destination) => {
  return new Promise((resolve, reject) => {
    const zipName = `temp${Date.now()}.zip`;
    const zipFile = fs.createWriteStream(zipName);

    // Remove the temporary ZIP file when done
    const cleanup = () => fs.unlinkSync(zipName);

    const unzip = () => {
      var zip = new adm(zipName);
      zip.extractAllTo(destination, true);
      cleanup();
      resolve();
    }

    const getURL = url => {
      https.get(url, response => {

        if (isRedirect(response)) {
          getURL(response.headers.location)
        } else if (response.statusCode < 300 && response.statusCode >= 200) {
          response.pipe(zipFile);
          zipFile.on('finish', () => zipFile.close(unzip));
        } else {
          cleanup();
          reject(new Error(`Framework not found, maybe the version does not exist yet (${url})`));
        }
      }).on('error', error => {
        cleanup();
        reject(error);
      });
    }

    getURL(url);
  });
}

const downloadFile = (url, destFolder, filename) => {
  if (!fs.existsSync(destFolder)) {
      fs.mkdirSync(destFolder, { recursive: true })
  }
  const destFileStream = fs.createWriteStream(`${destFolder}/${filename}`);

  return new Promise((resolve, reject) => {
    const getURL = url => {
      https.get(url, response => {
        if (isRedirect(response)) {
          getURL(response.headers.location);
        } else if (response.statusCode < 300 && response.statusCode >= 200) {
          response.pipe(destFileStream);
          destFileStream.on('finish', resolve);
        } else {
          reject(new Error(`File to be downloaded not found, maybe the version does not exist yet (${url})`));
        }
      }).on('error', error => {
        reject(error);
      });
    }

    getURL(url)
  });
}

const downloadAndroidFramework = (framework, version, destinationDir, filename) => {
  const remoteURL = `https://bintray.com/scandit/DataCapture/download_file?file_path=com/scandit/datacapture/${framework}/${version}/${framework}-${version}.aar`;
  console.log(`Downloading Scandit SDK from ${remoteURL}`);
  return downloadFile(remoteURL, destinationDir, filename)
    .then(() => {
      console.log(`Finished downloading to ${destinationDir}/${filename}`);
      return Promise.resolve();
    })
    .catch(error => {
      console.log(`There was an error downloading the Scandit SDK: ${error}`)
      return Promise.reject(error)
    })

}

const downloadIosFramework = (framework, version, destination) => {
  const remoteURL = `https://ssl.scandit.com/sdk/download/scandit-datacapture-${platformIos}-${framework}-${version}.zip`;
  console.log(`Downloading Scandit SDK from ${remoteURL}`);
  return downloadAndUnzip(remoteURL, destination)
    .then(() => {
      console.log(`Finished downloading to ${destination}`);
      return Promise.resolve();
    })
    .catch(error => {
      console.log(`There was an error downloading the Scandit SDK: ${error}`);
      return Promise.reject(error);
    })
}

// Download a specific framework
const downloadFramework = (platform, framework, version, destination, fullFrameworkName) => {
  if (supportedPlatforms.indexOf(platform) == -1) {
    throw new Error(`Currently only downloading ${supportedPlatforms} frameworks is supported`);
  }

  if (platform == platformAndroid) {
    return downloadAndroidFramework(framework, version, destination, fullFrameworkName)
  } else if (platform == platformIos) {
    return downloadIosFramework(framework, version, destination)
  }
}

// Find all frameworks that need to be downloaded and pulled into the plugin
const findFrameworksInContext = (context) => {
  let isScanditFramework = e => (e.tag == 'framework' || e.tag == 'resource-file') && e.attrib
    && e.attrib.custom && e.attrib.custom == "true" && e.attrib.src.includes('Scandit') && e.attrib.version;
  let hasChildren = e => e._children && e._children.length && e._children.length > 0

  const getFramework = (element, parent, frameworks) => {
    if (isScanditFramework(element)) {
      frameworks.push(frameworkFromElementAndParent(element, parent));
    }
    if (hasChildren(element)) {
      frameworks = element._children.reduce((found, child) => getFramework(child, element, found), frameworks);
    }

    return frameworks.filter(e => e != undefined);
  }
  return getFramework(context.opts.plugin.pluginInfo._et._root, null, []);
}

// Get the SDC module based on the framework name, used to construct the download URL
const sdcModuleFromFrameworkName = (name) => {
  // Already assumes that we know it's a Scandit framework name
  if (name.includes('Core')) {
    return 'core';
  } else {
    // e.g. ScanditBarcodeCapture => barcode
    return /^Scandit(\w*)Capture/.exec(name)[1].toLowerCase();
  }
}

// Create an object describing the framework
const frameworkFromElementAndParent = (element, parent) => {
  if (parent.tag != 'platform') {
    console.log('Parent not platform:', JSON.stringify(parent, undefined, 4));
    throw new Error('The framework parent needs to be a platform, see above for details');
  }

  const frameworkName = element.attrib.src.split('/').slice(-1)[0];

  return {
    version: element.attrib.version,
    platform: parent.attrib.name,
    module: sdcModuleFromFrameworkName(frameworkName),
    pluginRelativePath: element.attrib.src.split('/').slice(0, -1).join('/'),
    name: frameworkName,
  }
}

const addFramework = (framework, pluginDirectory) => {
  const frameworkDestination = `${pluginDirectory}/${framework.pluginRelativePath}`;

  if (fs.existsSync(`${frameworkDestination}/${framework.name}`)) {
    console.log(`${framework.name} already exists in ${pluginDirectory} - SKIPPING DOWNLOAD`)
    return Promise.resolve();
  }

  return downloadFramework(framework.platform, framework.module, framework.version, frameworkDestination, framework.name);
}

module.exports = function (context) {
  // The framework "definitions" from plugin.xml
  const frameworks = findFrameworksInContext(context);

  // It's impossible that there are no frameworks defined, as the plugin depends on our frameworks
  if (!frameworks || frameworks.length < 1) {
    const error = new Error('Could not find any framework to add, this is probably not intended.');
    return Promise.reject(error);
  }

  // Add all frameworks
  let frameworkDownloads = frameworks.map(framework => {
    let pluginDirectory = context.opts.plugin.pluginInfo.dir;
    return addFramework(framework, pluginDirectory);
  });

  // Cordova will know that we're done once all promises resolve
  return Promise.all(frameworkDownloads);
} 