const { caching } = require('cache-manager');

module.exports = {
    start() {
        return caching('memory', {
            max: 500,
        })
    }
}