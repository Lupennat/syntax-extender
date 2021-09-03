'use strict';

const util = require('util');

const { TYPE_ANY } = require('../constants');

class Return extends Object {
    constructor(...args) {
        super(...args);
        Object.defineProperties(this, {
            type: {
                value: null,
                enumerable: false,
                writable: true
            },
            isBuiltin: {
                value: false,
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
            isNullable: {
                value: false,
                enumerable: false,
                writable: true
            },
            isNullableIterable: {
                value: false,
                enumerable: false,
                writable: true
            },
            isNullablePromise: {
                value: false,
                enumerable: false,
                writable: true
            },
            iterableAsArray: {
                value: false,
                enumerable: false,
                writable: true
            },
            sourceName: {
                value: '',
                enumerable: false,
                writable: true
            },
            functionName: {
                value: '',
                enumerable: false,
                writable: true
            },
            source: {
                value: null,
                enumerable: false,
                writable: true
            }
        });
        Object.seal(this);
    }

    clone() {
        const cloned = new Return();
        cloned.type = this.type;
        cloned.isNullable = this.isNullable;
        cloned.isNullablePromise = this.isNullablePromise;
        cloned.isNullableIterable = this.isNullableIterable;
        cloned.checkPromise = this.checkPromise;
        cloned.checkIterable = this.checkIterable;
        cloned.iterableAsArray = this.iterableAsArray;
        cloned.isBuiltin = this.isBuiltin;
        cloned.sourceName = this.sourceName;
        cloned.functionName = this.functionName;
        cloned.source = this.source;

        return cloned;
    }

    toOriginal() {
        const str = this.toError();
        return str ? ': ' + str : '';
    }

    toError() {
        return (this.type || TYPE_ANY)
            .split('|')
            .map(type => {
                let str = `${this.isNullable ? '?' : ''}{promise}{iterable}{name}`;

                str = str.replace('{promise}', this.checkPromise ? `Promise<${this.isNullablePromise ? '?' : ''}` : '');
                str = str.replace('{iterable}', this.checkIterable ? `[${this.isNullableIterable ? '?' : ''}` : '');
                str = str.replace('{name}', `${type}${this.checkIterable ? ']' : ''}${this.checkPromise ? '>' : ''}`);

                return str;
            })
            .join('|');
    }

    inspect() {
        return util.inspect(this.toObject(), { showHidden: false, depth: null });
    }

    toObject() {
        return {
            type: this.type,
            isBuiltin: this.isBuiltin,
            checkPromise: this.checkPromise,
            checkIterable: this.checkIterable,
            isNullable: this.isNullable,
            isNullablePromise: this.isNullablePromise,
            isNullableIterable: this.isNullableIterable,
            source: this.source
        };
    }
}

Object.seal(Return);

module.exports = Return;
