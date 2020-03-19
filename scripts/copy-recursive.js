const fs = require('fs')
const path = require('path')

function cpFolderSync(from, to) {
    if (!fs.existsSync(to)) {
        fs.mkdirSync(to, { recursive: true });
    }
    const files = fs.readdirSync(from)
    for (let element of files) {
        if (fs.lstatSync(path.join(from, element)).isFile()) {
            fs.copyFileSync(path.join(from, element), path.join(to, element));
        } else {
            cpFolderSync(path.join(from, element), path.join(to, element));
        }
    };
}

module.exports = cpFolderSync
