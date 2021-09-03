'use strict';

const { v4: uuidv4 } = require('uuid');

const { isString } = require('./utils');

const SyntaxExtenderNotValidArgumentError = require('../errors/syntax-extender-not-valid-argument-error');

const abs = {
    create() {
        const abs = {};
        const methods = {
            map(name) {
                if (!isString(name)) {
                    throw new SyntaxExtenderNotValidArgumentError(`map(name) argument 1 must be string.`);
                }
                const uuid = uuidv4();

                abs[uuid] = name;

                return uuid;
            },

            all() {
                return abs;
            }
        };
        Object.seal(methods);
        Object.freeze(methods);
        return methods;
    }
};

Object.seal(abs);
Object.freeze(abs);

module.exports = abs;
