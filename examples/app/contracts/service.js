'use strict';

class Service {
    async get(times) {}
}

module.exports = Service;
module.exports.__interface = true;
module.exports[Symbol.for('COMMENT')] = true;
module.exports[Symbol.for('PRIORITY')] = 'COMMENT';
