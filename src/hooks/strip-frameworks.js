var xcode = require('xcode');
var fs = require('fs');
var path = require('path');

function findInDir(startPath, filter, rec) {
  if (!fs.existsSync(startPath)) {
    console.log("no dir ", startPath);
    return;
  }
  const files = fs.readdirSync(startPath);
  for (var i = 0; i < files.length; i++) {
    var filename = path.join(startPath, files[i]);
    var stat = fs.lstatSync(filename);
    if (stat.isDirectory() && rec) {
      findInDir(filename, filter); //recurse
    }

    if (filename.indexOf(filter) >= 0) {
        return filename;
    }
  }
}

module.exports = function (context) {
  const xcodeProjPath = findInDir('platforms/ios', '.xcodeproj');
  const projectPath = xcodeProjPath + '/project.pbxproj';
  const myProj = xcode.project(projectPath);

  var options = {
    shellPath: '/bin/sh',
    shellScript: 'bash "$BUILT_PRODUCTS_DIR/$FRAMEWORKS_FOLDER_PATH/ScanditCaptureCore.framework/strip-frameworks.sh"'
  };

  return new Promise((resolve, reject) => {
    myProj.parse(function (err) {
      if (err) {
        reject(err);
      }

      myProj.addBuildPhase([], 'PBXShellScriptBuildPhase', 'Strip Frameworks', myProj.getFirstTarget().uuid, options);
      fs.writeFileSync(projectPath, myProj.writeSync());
      resolve();
    })
  });
}
