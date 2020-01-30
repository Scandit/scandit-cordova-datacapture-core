var exec = require('child_process').exec

module.exports = function (context) {
  let pluginName = context.opts.plugin.pluginInfo.name;
  console.log(`Building ${pluginName}...`);
  return new Promise((resolve, reject) => {
    exec(`npm run build`, { cwd: context.opts.plugin.dir }, (error, stdout, stderr) => {
      if (error) {
        if (stdout) { console.log(stdout) };
        if (stderr) { console.log(stderr) };
        reject(error);
      } else if (stderr) {
        if (stderr) { console.log(stderr) };
        reject(stderr);
      } else {
        if (stdout) { console.log(stdout) };
        console.log(`Built ${pluginName} successfully`);
        resolve();
      }
    });
  });
}
