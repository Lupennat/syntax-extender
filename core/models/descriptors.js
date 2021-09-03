'use strict';

const util = require('util');

class Descriptors extends Object {
    constructor(...args) {
        super(...args);
        Object.defineProperties(this, {
            descriptors: {
                value: [],
                enumerable: false,
                writable: false
            }
        });
        Object.seal(this);
    }

    add(descriptor) {
        this.descriptors.push(descriptor);
    }

    all() {
        return this.descriptors;
    }

    get(index) {
        return this.descriptors[index];
    }

    size() {
        return this.descriptors.length;
    }

    inspect() {
        return util.inspect(this.toObject(), { showHidden: false, depth: null });
    }

    toObject() {
        return this.descriptors.reduce((carry, item) => {
            carry.push(item.toObject());
            return carry;
        }, []);
    }
}

Object.seal(Descriptors);

module.exports = Descriptors;
