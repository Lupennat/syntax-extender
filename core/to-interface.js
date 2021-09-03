'use strict';

const { EXTENDS, INTERFACE, DEFINE } = require('./constants');
const { hasNativeExtends, hasOwn } = require('./utils');
const { generateMetadata } = require('./metadata');

const generateProxy = require('./generate-proxy');

const SyntaxExtenderNativeExtendsError = require('../errors/syntax-extender-native-extends-error');

const toInterface = (source, filepath = '', namespace = '', moduleId = '') => {
    let extendedInterfaces = [];
    let definitions = {};
    let keysToRemove = [];

    if (hasNativeExtends(source)) {
        throw new SyntaxExtenderNativeExtendsError(source.name, EXTENDS);
    }

    if (hasOwn(source, INTERFACE)) {
        keysToRemove.push(INTERFACE);
    }

    if (hasOwn(source, EXTENDS)) {
        extendedInterfaces = source[EXTENDS] || [];
        extendedInterfaces = Array.isArray(extendedInterfaces) ? extendedInterfaces : [extendedInterfaces];
        keysToRemove.push(EXTENDS);
    }

    if (hasOwn(source, DEFINE)) {
        definitions = source[DEFINE] || {};
        keysToRemove.push(DEFINE);
    }

    keysToRemove = keysToRemove.concat(
        generateMetadata(source, INTERFACE, extendedInterfaces, {}, definitions, filepath, namespace, moduleId)
    );

    return generateProxy(source, INTERFACE, {}, keysToRemove);
};

module.exports = toInterface;
