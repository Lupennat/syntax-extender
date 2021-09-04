'use strict';

const Service = require('../contracts/service');

class ExternalRedisInstance {
    #store = {};

    static __define = {
        set: { 1: 'string' },
        get: { 1: 'string' }
    };

    set(name, value = null) {
        this.#store[name] = value;
    }

    async get(name) {
        console.log(this);
        return this.#store[name] || null;
    }
}

class RedisAdapted extends ExternalRedisInstance {}

module.exports = RedisAdapted;
module.exports.__implements = [Service];
