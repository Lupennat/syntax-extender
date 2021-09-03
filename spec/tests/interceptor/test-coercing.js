'use strict';

class ZioCannolo {
    static test() {}
}

class TestCoercing extends ZioCannolo {
    propertynontrovata = 'eccola';

    // constructor() {
    //     throw new Error('fischia non sono per nulla safe');
    // }

    static test(string) {
        return ['array'];
    }
    mani(array) {
        return 'stringa';
    }
}

module.exports = TestCoercing;
module.exports[Symbol.for('COMPATIBILITY')] = false;
module.exports[Symbol.for('CONSTRUCTOR')] = false;
module.exports[Symbol.for('VALIDATION')] = false;
module.exports.__define = { mani: { 1: 'array', return: 'array' }, 'static:test': { 1: 'string', return: 'string' } };
