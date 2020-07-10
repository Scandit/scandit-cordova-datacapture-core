const fs = require('fs')

const rmDirRecursive = (dirPath) => {
    if (!fs.existsSync(dirPath)) {
        console.log(`${dirPath} is already removed or didn't exist`);
        return;
    }
    const files = fs.readdirSync(dirPath)
    if (files.length > 0) {
        for (var i = 0; i < files.length; i++) {
            const filePath = dirPath + '/' + files[i]
            if (fs.statSync(filePath).isFile()) {
                fs.unlinkSync(filePath)
            } else {
                rmDirRecursive(filePath)
            }
        }
    }
    fs.rmdirSync(dirPath)
}

module.exports = rmDirRecursive
