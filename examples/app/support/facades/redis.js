'use strict';

const Facade = require('./facade');

class Redis extends Facade {
    static _getFacadeAccessor() {
        return 'redis';
    }
}

module.exports = Redis;
module.exports.__define = {
    'static:_getFacadeAccessor': { return: 'string' }
};
