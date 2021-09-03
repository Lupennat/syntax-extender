'use strict';

const util = require('util');

class Definitions extends Object {
    constructor(...args) {
        super(...args);
        Object.defineProperties(this, {
            definitions: {
                value: {},
                enumerable: false,
                writable: false
            }
        });
        Object.seal(this);
    }

    add(name, definition) {
        this.definitions[name] = this.definitions[name] || {};
        this.definitions[name][definition.name] = definition;
    }

    all() {
        return Object.values(this.definitions);
    }

    size(name) {
        return this.keys(name).length;
    }

    get(name) {
        return this.definitions[name] || null;
    }

    remove(name) {
        delete this.definitions[name];
    }

    getDefinition(name, definitionName) {
        return (this.definitions[name] && this.definitions[name][definitionName]) || null;
    }

    removeDefinition(name, definitionName) {
        this.definitions[name] && delete this.definitions[name][definitionName];
    }

    clone() {
        const cloned = new Definitions();
        for (const name in this.definitions) {
            for (const definitionName in this.definitions[name]) {
                cloned.add(name, this.definitions[name][definitionName].clone());
            }
        }
        return cloned;
    }

    keys(name) {
        return name ? Object.keys(this.definitions[name] || {}) : Object.keys(this.definitions);
    }

    inspect() {
        return util.inspect(this.toObject(), { showHidden: false, depth: null });
    }

    toObject() {
        return Object.keys(this.definitions).reduce((carry, key) => {
            carry[key] = carry[key] || {};
            for (const definitionName in this.definitions[key]) {
                carry[key][definitionName] = this.definitions[key][definitionName].toObject();
            }
            return carry;
        }, {});
    }
}

Object.seal(Definitions);

module.exports = Definitions;
