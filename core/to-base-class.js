'use strict';

const { DEFINE, IMPLEMENTS, ABSTRACT, ABSTRACTS } = require('./constants');
const { isConstructorFunction, isFunction, isClass, hasOwn } = require('./utils');

const { generateMetadata } = require('./metadata');

const generateProxy = require('./generate-proxy');
const abs = require('./abs');

const SyntaxExtenderNotValidArgumentError = require('../errors/syntax-extender-not-valid-argument-error');

const toBaseClass = (source, type, filepath, namespace, moduleId) => {
    let abstracts = {};
    let definitions = {};
    let implementedInterfaces = [];
    let keysToRemove = [];

    if (hasOwn(source, ABSTRACT)) {
        keysToRemove.push(ABSTRACT);
    }

    if (type === ABSTRACT) {
        if (!isClass(source)) {
            if (!isFunction(source) || isConstructorFunction(source)) {
                throw new SyntaxExtenderNotValidArgumentError(
                    `toBaseClass(source) argument 1 must be a class or a closure returning class.`
                );
            }

            const abstract = abs.create();

            source = source(abstract.map.bind(abstract));
            source[ABSTRACTS] = abstract.all();
        }

        if (hasOwn(source, ABSTRACTS)) {
            abstracts = source[ABSTRACTS] || {};
            keysToRemove.push(ABSTRACTS);
        }
    }

    if (!isClass(source)) {
        throw new SyntaxExtenderNotValidArgumentError(`toBaseClass(source) argument 1 must be a class.`);
    }

    if (hasOwn(source, IMPLEMENTS)) {
        implementedInterfaces = source[IMPLEMENTS] || [];
        implementedInterfaces = Array.isArray(implementedInterfaces) ? implementedInterfaces : [implementedInterfaces];
        keysToRemove.push(IMPLEMENTS);
    }

    if (hasOwn(source, DEFINE)) {
        definitions = source[DEFINE] || {};
        keysToRemove.push(DEFINE);
    }

    keysToRemove = keysToRemove.concat(
        generateMetadata(source, type, implementedInterfaces, abstracts, definitions, filepath, namespace, moduleId)
    );

    return generateProxy(source, type, abstracts, keysToRemove);
};

module.exports = toBaseClass;
