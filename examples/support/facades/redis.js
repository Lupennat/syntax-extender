'use strict';

const Facade = require('./facade');

class Redis extends Facade {
    static __define = {
        'static:_getFacadeAccessor': { return: 'string' }
    };

    static _getFacadeAccessor() {
        return 'redis';
    }
}

module.exports = Redis;
