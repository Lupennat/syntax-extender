'use strict';

const util = require('util');
const path = require('path');

const { ANONYMOUS, SEDEF_COMMENT, TYPE_ANY } = require('./constants');

const {
    isConstructorFunction,
    isArray,
    isBoolean,
    isGeneratorFunction,
    isFunction,
    isString,
    isDictionary,
    isSymbol,
    isAsyncFunction,
    isIterable,
    isTypedArray,
    extractReturnString,
    getSedefEnv
} = require('./utils');

const Return = require('./models/return');
const Parameter = require('./models/parameter');
const Definitions = require('./models/definitions');
const Definition = require('./models/definition');

const SyntaxExtenderTypeCastingInvalidError = require('../errors/type-casting/syntax-extender-type-casting-invalid-error');
const SyntaxExtenderTypeCastingWrongSourceTypeError = require('../errors/type-casting/syntax-extender-type-casting-wrong-source-type-error');
const SyntaxExtenderNotValidArgumentError = require('../errors/syntax-extender-not-valid-argument-error');
const SyntaxExtenderTypeCastingMultipleInvalidError = require('../errors/type-casting/syntax-extender-type-casting-multiple-invalid-error');

const iterableTypeCastingDefinition = ['array', 'generator', 'map', 'set'];

const standardTypeCastingDefinition = [
    ...iterableTypeCastingDefinition,
    TYPE_ANY,
    'async',
    'bigint',
    'boolean',
    'callable',
    'date',
    'dictionary',
    'float',
    'integer',
    'number',
    'object',
    'parent',
    'promise',
    'self',
    'string', // this is iterable but we don't want to give possibility to define value of iteration
    'symbol',
    'typedArray', // this is iterable but we don't want to give possibility to define value of iteration
    'void',
    'weakmap',
    'weakset'
];

const isStandardTypeCasting = source => {
    return standardTypeCastingDefinition.indexOf(source) > -1;
};

const isIterableTypeCasting = source => {
    if (!source) {
        return false;
    }
    const types = source.split('|');

    for (let x = 0; x < types.length; x++) {
        if (iterableTypeCastingDefinition.indexOf(types[x]) === -1) {
            return false;
        }
    }
    return true;
};

const iterablesKeys = ['[?]', '[]'];
const promiseKeys = ['?>', '->'];

const adaptDefinitionsFromReturnCommentString = (fn, definitions, key) => {
    let str = extractReturnString(fn);

    if (!str) {
        return;
    }

    let value = str;

    for (let x = 0; x < iterablesKeys.length; x++) {
        value = value.replace(iterablesKeys[x], '');
    }

    for (let x = 0; x < promiseKeys.length; x++) {
        value = value.replace(promiseKeys[x], '');
    }

    value = value.replace('?', '').replace(':', '');

    if (!definitions.getDefinition(key, 'return') || getSedefEnv('PRIORITY') == SEDEF_COMMENT) {
        const definition = parseAndConvertDefinition(str.replace(value, '').replace(':', 'return'), value);
        definitions.add(key, definition);
    }
};

const adaptDefinitionsFromParametersCommentString = (str, definitions, key, definitionKey) => {
    if (!str) {
        return;
    }

    let value = str;

    for (let x = 0; x < iterablesKeys.length; x++) {
        value = value.replace(iterablesKeys[x], '');
    }

    for (let x = 0; x < promiseKeys.length; x++) {
        value = value.replace(promiseKeys[x], '');
    }

    value = value.replace('?', '').replace(':', '');

    if (!definitions.getDefinition(key, definitionKey) || getSedefEnv('PRIORITY') == SEDEF_COMMENT) {
        const definition = parseAndConvertDefinition(str.replace(value, '').replace(':', definitionKey), value);
        definitions.add(key, definition);
    }
};

const parseAndConvertDefinition = (key, value) => {
    const definition = new Definition();
    if (key.startsWith('?')) {
        key = key.slice(1);
        definition.isNullable = true;
    }

    for (let x = 0; x < iterablesKeys.length; x++) {
        const ik = iterablesKeys[x];
        if (key.endsWith(ik)) {
            key = key.slice(0, -ik.length);
            definition.isNullableIterable = ik.startsWith('[?');
            definition.checkIterable = true;
            break;
        }
    }

    for (let x = 0; x < promiseKeys.length; x++) {
        const pk = promiseKeys[x];
        if (key.endsWith(pk)) {
            key = key.slice(0, -pk.length);
            definition.isNullablePromise = pk.startsWith('?');
            definition.checkPromise = true;
            break;
        }
    }

    definition.name = key.trim();
    definition.type = value;
    return definition;
};

const parseAndConvertDefinitions = rawDefinitions => {
    const definitions = new Definitions();
    Object.keys(rawDefinitions).forEach(key => {
        Object.keys(rawDefinitions[key]).forEach(subkey => {
            definitions.add(key, parseAndConvertDefinition(subkey, rawDefinitions[key][subkey]));
        });
    });
    return definitions;
};

const getTypeCastingByDefinition = (definition = null, source = null, isParameter = false, filepath = '') => {
    if (definition !== null && !(definition instanceof Definition)) {
        throw new SyntaxExtenderNotValidArgumentError(
            `getTypeCastingByDefinition(definition = null, source = null, isParameter = false, filepath = '') argument 1 must be null or Definition type.`
        );
    }
    if (!isBoolean(isParameter)) {
        throw new SyntaxExtenderNotValidArgumentError(
            `getTypeCastingByDefinition(definition = null, source = null, isParameter = false, filepath = '') argument 3 must be a boolean.`
        );
    }
    if (!isString(filepath)) {
        throw new SyntaxExtenderNotValidArgumentError(
            `getTypeCastingByDefinition(definition = null, source = null, isParameter = false, filepath = '') argument 4 must be a string.`
        );
    }
    const obj = isParameter ? new Parameter() : new Return();

    if (definition === null) {
        return obj;
    }

    obj.isNullable = definition.isNullable;
    obj.isNullablePromise = definition.isNullablePromise;
    obj.checkPromise = definition.checkPromise;
    obj.isNullableIterable = definition.isNullableIterable;
    obj.checkIterable = definition.checkIterable;

    if (!isString(definition.type)) {
        if (!isConstructorFunction(definition.type)) {
            throw new SyntaxExtenderTypeCastingInvalidError();
        }

        obj.type = definition.type.name || ANONYMOUS;
        obj.source = definition.type;

        return obj;
    }

    const exploded = definition.type.split('|');
    const multipleDefinitions = [];

    for (let x = 0; x < exploded.length; x++) {
        const type = exploded[x];
        if (type !== TYPE_ANY && multipleDefinitions.indexOf(type) === -1) {
            multipleDefinitions.push(type);
        }
    }

    if (multipleDefinitions.length > 1) {
        if (multipleDefinitions.indexOf('self') > -1) {
            throw new SyntaxExtenderTypeCastingMultipleInvalidError(multipleDefinitions.join('|'), 'self');
        }
        if (multipleDefinitions.indexOf('parent') > -1) {
            throw new SyntaxExtenderTypeCastingMultipleInvalidError(multipleDefinitions.join('|'), 'parent');
        }
    }

    for (let x = 0; x < multipleDefinitions.length; x++) {
        let definition = multipleDefinitions[x];

        if (!isStandardTypeCasting(definition)) {
            try {
                source = require(definition.startsWith('.') && filepath
                    ? `${path.dirname(filepath)}/${definition}`
                    : definition);
            } catch (error) {
                throw new SyntaxExtenderTypeCastingInvalidError(definition);
            }

            if (multipleDefinitions.length > 1) {
                throw new SyntaxExtenderTypeCastingMultipleInvalidError(multipleDefinitions.join('|'), definition);
            }

            obj.type = source.name || ANONYMOUS;
            obj.source = source;

            return obj;
        }

        if (definition === 'self') {
            if (!isConstructorFunction(source)) {
                throw new SyntaxExtenderTypeCastingWrongSourceTypeError(definition);
            }
            obj.type = source.name || ANONYMOUS;
            obj.source = source;
            return obj;
        }

        if (definition === 'parent') {
            if (!isConstructorFunction(source)) {
                throw new SyntaxExtenderTypeCastingWrongSourceTypeError(definition);
            }

            source = Object.getPrototypeOf(source);

            if (!isConstructorFunction(source)) {
                throw new SyntaxExtenderTypeCastingWrongSourceTypeError(definition);
            }

            obj.type = source.name || ANONYMOUS;
            obj.source = source;
            return obj;
        }
    }

    obj.type = multipleDefinitions.join('|') || null;
    obj.isBuiltin = true;

    return obj;
};

const isValidTypeCasting = (type, hasDefault, value, isNullable = false, constructor = null) => {
    if (!isString(type)) {
        throw new SyntaxExtenderNotValidArgumentError(
            'isValidTypeCasting(type, hasDefault, value, isNullable = false, constructor = null) argument 1 must be a string.'
        );
    }
    if (!isBoolean(hasDefault)) {
        throw new SyntaxExtenderNotValidArgumentError(
            'isValidTypeCasting(type, hasDefault, value, isNullable = false, constructor = null) argument 2 must be a boolean.'
        );
    }
    if (!isBoolean(isNullable)) {
        throw new SyntaxExtenderNotValidArgumentError(
            'isValidTypeCasting(type, hasDefault, value, isNullable = false, constructor = null) argument 4 must be a boolean.'
        );
    }

    if (hasDefault) {
        // when a value is undefined and parameter has default value we can proceed
        // the parameter will become the default
        if (value === undefined) {
            return true;
        }
    }
    // when a value is null we need to verify if isNullable no matter parameter has a default
    // because the parameter will not become the default, it remain "null"
    // no matter what the type declaration is, (param = null) will be treated as nullable
    if (isNullable && value === null) {
        return true;
    }

    switch (type) {
        case 'array':
            return isArray(value);
        case 'async':
            return isAsyncFunction(value);
        case 'bigint':
            return isBigint(value);
        case 'boolean':
            return isBoolean(value);
        case 'callable':
            return isFunction(value) && !isGeneratorFunction(value) && !isConstructorFunction(value);
        case 'date':
            return value instanceof Date;
        case 'dictionary':
            return !isIterable(value) && isDictionary(value);
        case 'float':
            return isFloat(value);
        case 'generator':
            return isGeneratorFunction(value);
        case 'integer':
            return isInteger(value);
        case 'iterable':
            // this is not a real type
            // but is used to check iterable values
            // generator function will be considered iterable
            // because we can intercept the original function
            return isIterable(value) || isGeneratorFunction(value);
        case 'map':
            return isMap(value);
        case 'number':
            return isNumber(value);
        case 'object':
            return isObject(value);
        case 'promise':
            return isPromise(value);
        case 'set':
            return isSet(value);
        case 'string':
            return isString(value);
        case 'typedArray':
            return isTypedArray(value);
        case 'symbol':
            return isSymbol(value);
        case 'void':
            return value === undefined;
        case 'weakmap':
            return isWeakmap(value);
        case 'weakset':
            return isWeakset(value);
        default:
            if (!value) {
                return false;
            }
            if (!constructor || !constructor[Symbol.hasInstance]) {
                return false;
            }
            try {
                return value instanceof constructor;
            } catch (err) {
                return false;
            }
    }
};

const isPromise = source => {
    return util.types.isPromise(source);
};

const isBigint = source => {
    return typeof source === 'bigint';
};

const isFloat = n => {
    return typeof n === 'number' && n % 1 !== 0;
};

const isInteger = n => {
    return typeof n === 'number' && n % 1 === 0;
};

const isNumber = source => {
    return typeof source === 'number';
};

const isObject = source => {
    return typeof source === 'object';
};

const isMap = source => {
    return util.types.isMap(source);
};

const isSet = source => {
    return util.types.isSet(source);
};

const isWeakset = source => {
    return util.types.isWeakSet(source);
};

const isWeakmap = source => {
    return util.types.isWeakMap(source);
};

module.exports.isIterableTypeCasting = isIterableTypeCasting;
module.exports.isValidTypeCasting = isValidTypeCasting;
module.exports.getTypeCastingByDefinition = getTypeCastingByDefinition;
module.exports.parseAndConvertDefinition = parseAndConvertDefinition;
module.exports.adaptDefinitionsFromReturnCommentString = adaptDefinitionsFromReturnCommentString;
module.exports.adaptDefinitionsFromParametersCommentString = adaptDefinitionsFromParametersCommentString;
module.exports.parseAndConvertDefinitions = parseAndConvertDefinitions;
