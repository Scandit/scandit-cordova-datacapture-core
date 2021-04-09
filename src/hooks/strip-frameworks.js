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

  myProj.buildPhases = () => Object.values(myProj.hash.project.objects['PBXShellScriptBuildPhase']).filter(o => o && o.name);
  myProj.buildPhaseNames = () => myProj.buildPhases().map(o => o.name);
  myProj.hasBuildPhaseWithName = name => myProj.buildPhaseNames().indexOf(JSON.stringify(name)) > -1;

  var options = {
    shellPath: '/bin/sh',
    shellScript: 'bash "$BUILT_PRODUCTS_DIR/$FRAMEWORKS_FOLDER_PATH/ScanditCaptureCore.framework/strip-frameworks.sh"'
  };
  var buildPhaseName = 'Strip Frameworks';

  myProj.parseSync();

  if (!myProj.hasBuildPhaseWithName(buildPhaseName)) {
    myProj.addBuildPhase([], 'PBXShellScriptBuildPhase', buildPhaseName, myProj.getFirstTarget().uuid, options);
    fs.writeFileSync(projectPath, myProj.writeSync());
    console.log('Build phase to strip frameworks added.');
  }
}
