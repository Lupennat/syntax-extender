'use strict';

const util = require('util');

const { TYPE_ANY } = require('../constants');
const Parameters = require('./parameters');

class Parameter extends Object {
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
            source: {
                value: null,
                enumerable: false,
                writable: true
            },
            name: {
                value: '',
                enumerable: false,
                writable: true
            },
            param: {
                value: '',
                enumerable: false,
                writable: true
            },
            variadic: {
                value: false,
                enumerable: false,
                writable: true
            },
            hasDefault: {
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
            destructured: {
                value: new Parameters(),
                enumerable: false,
                writable: true
            }
        });

        Object.seal(this);
    }

    clone() {
        const cloned = new Parameter();
        cloned.name = this.name;
        cloned.param = this.param;
        cloned.variadic = this.variadic;
        cloned.hasDefault = this.hasDefault;
        cloned.isNullable = this.isNullable;
        cloned.isNullablePromise = this.isNullablePromise;
        cloned.isNullableIterable = this.isNullableIterable;
        cloned.iterableAsArray = this.iterableAsArray;
        cloned.destructured = this.destructured.clone();
        cloned.type = this.type;
        cloned.isBuiltin = this.isBuiltin;
        cloned.checkPromise = this.checkPromise;
        cloned.checkIterable = this.checkIterable;
        cloned.source = this.source;

        return cloned;
    }

    toOriginal() {
        const str = this.toError();
        const [name, defaultValue] = this.param.split('=');
        return name + (str ? ':' + str : '') + (defaultValue ? ' = ' + defaultValue : '');
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
            name: this.name,
            param: this.param,
            variadic: this.variadic,
            hasDefault: this.hasDefault,
            isNullable: this.isNullable,
            isNullablePromise: this.isNullablePromise,
            isNullableIterable: this.isNullableIterable,
            checkPromise: this.checkPromise,
            checkIterable: this.checkIterable,
            destructured: this.destructured.toObject(),
            type: this.type,
            isBuiltin: this.isBuiltin,
            source: this.source
        };
    }
}

Object.seal(Parameter);

module.exports = Parameter;
