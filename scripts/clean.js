const removeRecursive = require('./remove-recursive')

const clean = () => {
    removeRecursive('./www/js')
    removeRecursive('./coverage')
}

clean()
