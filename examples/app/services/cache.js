'use strict';

const Service = require('../contracts/service');

class Cache {
    get(times) /*:->[]integer */ {
        return new Promise(resolve => {
            resolve(function* () {
                for (let x = 0; x < times; x++) {
                    yield x;
                }
            });
        });
    }
}

module.exports = Cache;
module.exports.__implements = [Service];
module.exports[Symbol.for('COMMENT')] = true;
module.exports[Symbol.for('PRIORITY')] = 'COMMENT';
