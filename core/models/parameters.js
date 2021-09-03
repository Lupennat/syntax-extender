'use strict';

const util = require('util');

class Parameters extends Object {
    constructor(...args) {
        super(...args);
        Object.defineProperties(this, {
            requiredPositions: {
                value: [],
                enumerable: false,
                writable: true
            },
            validatePositions: {
                value: [],
                enumerable: false,
                writable: true
            },
            isDestructured: {
                value: false,
                enumerable: false,
                writable: true
            },
            parentPosition: {
                value: null,
                enumerable: false,
                writable: true
            },
            destructuredPositions: {
                value: [],
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
            parameters: {
                value: [],
                enumerable: false,
                writable: false
            }
        });
        Object.seal(this);
    }

    add(parameter) {
        this.parameters.push(parameter);
    }

    all() {
        return this.parameters;
    }

    toOriginal() {
        return this.parameters
            .map(item => {
                return item.toOriginal();
            })
            .join(', ');
    }

    get(index) {
        return this.parameters[index];
    }

    size() {
        return this.parameters.length;
    }

    clone() {
        const cloned = new Parameters();
        for (const parameter of this.parameters) {
            cloned.add(parameter.clone());
        }
        return cloned;
    }

    inspect() {
        return util.inspect(this.toObject(), { showHidden: false, depth: null });
    }

    toObject() {
        return this.parameters.reduce((carry, item) => {
            carry.push(item.toObject());
            return carry;
        }, []);
    }
}

Object.seal(Parameters);

module.exports = Parameters;
