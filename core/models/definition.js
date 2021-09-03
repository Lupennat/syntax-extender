'use strict';

const util = require('util');
class Definition extends Object {
    constructor(...args) {
        super(...args);
        Object.defineProperties(this, {
            name: {
                value: null,
                enumerable: false,
                writable: true
            },
            checkPromise: {
                value: false,
                enumerable: false,
                writable: true
            },
            checkIterable: {
                value: false,
                enumerable: false,
                writable: true
            },
            isNullablePromise: {
                value: false,
                enumerable: false,
                writable: true
            },
            isNullableIterable: {
                value: false,
                enumerable: false,
                writable: true
            },
            iterableAsArray: {
                value: false,
                enumerable: false,
                writable: true
            },
            isNullable: {
                value: false,
                enumerable: false,
                writable: true
            },
            type: {
                value: null,
                enumerable: false,
                writable: true
            }
        });
        Object.seal(this);
    }

    clone() {
        const cloned = new Definition();
        cloned.type = this.type;
        cloned.isNullable = this.isNullable;
        cloned.isNullablePromise = this.isNullablePromise;
        cloned.isNullableIterable = this.isNullableIterable;
        cloned.checkPromise = this.checkPromise;
        cloned.checkIterable = this.checkIterable;
        cloned.iterableAsArray = this.iterableAsArray;
        cloned.name = this.name;

        return cloned;
    }

    inspect() {
        return util.inspect(this.toObject(), { showHidden: false, depth: null });
    }

    toObject() {
        return {
            type: this.type,
            checkPromise: this.checkPromise,
            checkIterable: this.checkIterable,
            isNullable: this.isNullable,
            isNullablePromise: this.isNullablePromise,
            isNullableIterable: this.isNullableIterable
        };
    }
}

Object.seal(Definition);

module.exports = Definition;
