const fs = require('fs');
const path = require('path');

const possibleTscPaths = [
    path.resolve('./node_modules/typescript/bin/tsc'),// Path for plugin node_modules.
    path.resolve('./../../node_modules/typescript/bin/tsc'),// Path for project node_modules.
];

const findAndRunTsc = () => {
    for (let tscPath of possibleTscPaths) {
        if (fs.existsSync(tscPath)) {
            console.log(`found tsc at ${tscPath}`);
            require(tscPath);
            return;
        }
    }

    throw Error("Cannot find a valid tsc path");
};

findAndRunTsc();
