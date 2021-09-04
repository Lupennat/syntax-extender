'use strict';

// want to be real private see docs
const serviceRepo = {};

class App {
    add(name /* :string */, service /*:./contracts/service*/) {
        serviceRepo[name] = service;
    }

    get(name /* :string */) {
        return serviceRepo[name];
    }

    __get(name) {
        return this.get(name);
    }

    __set(name, value) {
        this.add(name, value);
    }
}

module.exports = App;
module.exports[Symbol.for('COMMENT')] = true;
module.exports[Symbol.for('PRIORITY')] = 'COMMENT';
module.exports[Symbol.for('CHECKDEFAULT')] = true;
