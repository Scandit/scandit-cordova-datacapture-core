const fs = require('fs')

const rmDirRecursive = (dirPath) => {
    if (!fs.existsSync(dirPath)) {
        console.log(`${dirPath} does not exist, no need to remove it`);
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
