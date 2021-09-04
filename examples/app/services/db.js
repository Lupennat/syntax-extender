'use strict';

const Service = require('../contracts/service');

class Db {
    get(times) {
        return new Promise(resolve => {
            resolve(function* () {
                for (let x = 0; x < times; x++) {
                    yield x;
                }
            });
        });
    }
}

module.exports = Db;
module.exports.__implements = [Service];
module.exports[Symbol.for('COMMENT')] = true;
module.exports[Symbol.for('PRIORITY')] = 'COMMENT';
