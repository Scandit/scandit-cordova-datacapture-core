const removeRecursive = require('./remove-recursive')

const cleanAll = () => {
    removeRecursive('./node_modules')
}

cleanAll()
