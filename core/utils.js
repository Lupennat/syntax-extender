'use strict';

const util = require('util');

const hasOwn = require('object.hasown').getPolyfill();

const {
    STRIP_ALL_COMMENTS,
    NATIVE_CONSTRUCTOR,
    ALL_SPACES,
    NATIVE_EXTENDS,
    STATICSET,
    STATICGET,
    GET,
    SET,
    HAS,
    DELETE,
    CONSTRUCT,
    NATIVE_THIS_PRIVATE,
    STRIP_LINE_COMMENTS,
    INTERNAL,
    RESERVED
} = require('./constants');

const featuresDefaults = require('./features-defaults');

const builtinObjects = [
    Object,
    Function,
    Boolean,
    Symbol,
    Error,
    EvalError,
    RangeError,
    ReferenceError,
    SyntaxError,
    TypeError,
    URIError,
    Number,
    BigInt,
    Math,
    Date,
    String,
    RegExp,
    Array,
    Int8Array,
    Uint8Array,
    Uint8ClampedArray,
    Int16Array,
    Uint16Array,
    Int32Array,
    Uint32Array,
    Float32Array,
    Float64Array,
    BigInt64Array,
    BigUint64Array,
    Map,
    Set,
    WeakMap,
    WeakSet,
    ArrayBuffer,
    SharedArrayBuffer,
    Atomics,
    DataView,
    JSON,
    Promise,
    Reflect,
    Proxy,
    WebAssembly,
    WebAssembly.Module,
    WebAssembly.Instance,
    WebAssembly.Memory,
    WebAssembly.Table,
    WebAssembly.CompileError,
    WebAssembly.LinkError,
    WebAssembly.RuntimeError,
    Intl,
    Intl.Collator,
    Intl.DateTimeFormat,
    Intl.ListFormat,
    Intl.NumberFormat,
    Intl.PluralRules,
    Intl.RelativeTimeFormat,
    Intl.Locale
];

const isBuiltinObject = source => {
    return builtinObjects.find(target => source === target) !== undefined;
};

const hasNativeExtends = source => {
    return !!Function.prototype.toString.call(source).replace(STRIP_ALL_COMMENTS, '').match(NATIVE_EXTENDS);
};

const hasNativeConstructor = source => {
    return !!Function.prototype.toString.call(source).replace(STRIP_ALL_COMMENTS, '').match(NATIVE_CONSTRUCTOR);
};

const hasNativePrivate = source => {
    return !!Function.prototype.toString.call(source).replace(STRIP_ALL_COMMENTS, '').match(NATIVE_THIS_PRIVATE);
};

const getFileContentForManipulation = source => {
    return Function.prototype.toString
        .call(source)
        .replace(withComment ? STRIP_LINE_COMMENTS : STRIP_ALL_COMMENTS, '')
        .replace(ALL_SPACES, ' ')
        .replace(/\s\s+/g, '');
};

const getFunctionStringForExtraction = (source, withComment) => {
    return Function.prototype.toString
        .call(source)
        .replace(withComment ? STRIP_LINE_COMMENTS : STRIP_ALL_COMMENTS, '')
        .replace(ALL_SPACES, ' ')
        .replace(/\s\s+/g, '');
};

const getParameterStringStartEndStop = string => {
    let skip = 0;
    let founded = 0;
    let start = 0;
    let stop = 0;

    for (let x = 0; x < string.length; x++) {
        if (string[x] === '[') {
            skip += 1;
            continue;
        }
        if (string[x] === ']') {
            skip -= 1;
            continue;
        }
        if (skip === 0) {
            if (string[x] === '(') {
                if (founded === 0) {
                    start = x + 1;
                }
                founded += 1;
            }
            if (string[x] === ')') {
                founded -= 1;
                if (founded === 0) {
                    stop = x;
                    break;
                }
            }
        }
    }

    return [start, stop];
};

const extractReturnString = source => {
    const fnStr = getFunctionStringForExtraction(source, true);
    const [paramStart, paramStop] = getParameterStringStartEndStop(fnStr);

    return extractTypeCastingFromComment(fnStr.substring(paramStop + 1));
};

const extractTypeCastingFromComment = source => {
    source = source.replace(ALL_SPACES, '');

    if (!source.startsWith('/*')) {
        return '';
    }
    source = source.substring(2);
    let start = 0;
    let beforeIsWildcard = false;
    let beforeIsQuestionMark = false;
    let founded = false;
    let stop = 0;
    for (let x = 0; x < source.length; x++) {
        if (source[x] === '/' && beforeIsWildcard) {
            break;
        }
        beforeIsWildcard = source[x] === '*';
        start = source[x] === ':' ? (beforeIsQuestionMark ? x - 1 : x) : start;
        if (!founded && source[x] === ':') {
            founded = true;
        }
        beforeIsQuestionMark = source[x] === '?';
        stop = source[x] !== '*' ? x + 1 : stop;
    }

    return founded ? source.substring(start, stop) : '';
};

const extractParametersString = (source, withComment = false) => {
    const fnStr = getFunctionStringForExtraction(source, withComment);
    const [start, stop] = getParameterStringStartEndStop(fnStr);
    return fnStr.substring(start, stop);
};

const isFunction = source => {
    return typeof source === 'function';
};

const isConstructorFunction = source => {
    if (isFunction(source) && !isGeneratorFunction(source) && source.prototype) {
        try {
            source.arguments && source.caller;
        } catch (e) {
            return true;
        }
    }
    return false;
};

const isGeneratorFunction = source => {
    return util.types.isGeneratorFunction(source);
};

const isAsyncFunction = source => {
    return util.types.isAsyncFunction(source);
};

const isString = source => {
    return typeof source === 'string';
};

const isArray = source => {
    return Array.isArray(source);
};

const isBoolean = source => {
    return source === true || source === false;
};

const isDictionary = source => {
    if (!source) {
        return false;
    }

    if (typeof source !== 'object') {
        return false;
    }

    if (
        source.constructor &&
        source.constructor.prototype &&
        !hasOwnProperty.call(source.constructor.prototype, 'isPrototypeOf')
    ) {
        return false;
    }

    return true;
};

const isClass = source => {
    if (!isFunction(source)) {
        return false;
    }
    const string = Function.prototype.toString
        .call(source)
        .replace(STRIP_ALL_COMMENTS, '')
        .replace(ALL_SPACES, ' ')
        .replace(/\s\s+/g, ' ');

    if (!/^\s*class\s+/.test(string)) {
        return false;
    }

    return true;
};

const isSymbol = source => {
    return typeof source === 'symbol';
};

const isIterable = source => {
    // we don't want typedArray and String to be Iterable
    return source && typeof source[Symbol.iterator] === 'function' && !isTypedArray(source) && !isString(source);
};

const isTypedArray = source => {
    return util.types.isTypedArray(source);
};

const isMagicMethod = (isStatic, name) => {
    return isStatic
        ? name === STATICSET || name === STATICGET
        : name === CONSTRUCT || name === GET || name === SET || name === HAS || name === DELETE;
};

const getMagicMethodParametersFixedLength = name => {
    switch (name) {
        case STATICSET:
        case SET:
            return 2;
        case STATICGET:
        case GET:
        case HAS:
        case DELETE:
            return 1;
        default:
            return null;
    }
};

const withBindingScope = (instance, name) => {
    return isFunction(instance[name]) ? instance[name].bind(instance) : instance[name];
};

const hasAnyMagicMethods = source => {
    return hasStaticMagicMethods(source) || hasMagicMethods(source);
};

const hasStaticMagicMethods = source => {
    return hasStaticMagicSetter(source) || hasStaticMagicGetter(source);
};

const hasMagicMethods = source => {
    return hasMagicConstruct(source) || hasMagicPrototypeMethods(source);
};

const hasMagicPrototypeMethods = source => {
    return hasMagicSetter(source) || hasMagicGetter(source) || hasMagicHas(source) || hasMagicDelete(source);
};

const hasStaticMagicSetter = source => {
    return hasOwn(source, STATICSET);
};

const hasStaticMagicGetter = source => {
    return hasOwn(source, STATICGET);
};

const hasMagicConstruct = source => {
    return hasOwn(source.prototype, CONSTRUCT);
};

const hasMagicSetter = source => {
    return hasOwn(source.prototype, SET);
};

const hasMagicGetter = source => {
    return hasOwn(source.prototype, GET);
};

const hasMagicHas = source => {
    return hasOwn(source.prototype, HAS);
};

const hasMagicDelete = source => {
    return hasOwn(source.prototype, DELETE);
};

const isPrivateProperty = (property, isStatic, hasMagicFeature) => {
    const regex = new RegExp('^__[^_]');
    return !dontTrapProperty(property, isStatic, hasMagicFeature) && regex.test(property);
};

const isProtectedProperty = (property, isStatic, hasMagicFeature) => {
    const regex = new RegExp('^_[^_]');
    return !dontTrapProperty(property, isStatic, hasMagicFeature) && regex.test(property);
};

const dontTrapProperty = (property, isStatic, hasMagicFeature) => {
    let reservedKeyword = INTERNAL.concat(RESERVED);

    if (hasMagicFeature) {
        reservedKeyword = reservedKeyword.concat(
            isStatic ? [STATICSET, STATICGET] : [CONSTRUCT, GET, SET, HAS, DELETE]
        );
    }

    // symbols are "private" trap it is very dangerous
    // then, catch, finally are reserved words (thenable)
    // arguments, prototype & constructor are reserved words
    // we don't want to trap all internal keys
    return (
        typeof property === 'symbol' ||
        property === 'then' ||
        property === 'catch' ||
        property === 'finally' ||
        property === 'arguments' ||
        property === 'prototype' ||
        property === 'constructor' ||
        property === 'toJSON' ||
        reservedKeyword.indexOf(property.toString()) > -1
    );
};

const getSedefEnv = function (type) {
    const key = `SEDEF_${type}`;
    const defaultValue = featuresDefaults[`${type}_DEFAULT`] || '';
    const value = key in process.env ? process.env[key] : defaultValue;
    return typeof value === 'string' ? value : JSON.stringify(value);
};

const setSedefEnv = function (type, value) {
    const key = `SEDEF_${type}`;
    process.env[key] = typeof value === 'string' ? value : JSON.stringify(value);
};

module.exports.hasOwn = hasOwn;
module.exports.getSedefEnv = getSedefEnv;
module.exports.setSedefEnv = setSedefEnv;
module.exports.getMagicMethodParametersFixedLength = getMagicMethodParametersFixedLength;
module.exports.extractReturnString = extractReturnString;
module.exports.extractParametersString = extractParametersString;
module.exports.extractTypeCastingFromComment = extractTypeCastingFromComment;
module.exports.hasNativeExtends = hasNativeExtends;
module.exports.hasNativeConstructor = hasNativeConstructor;
module.exports.hasNativePrivate = hasNativePrivate;
module.exports.isArray = isArray;
module.exports.isAsyncFunction = isAsyncFunction;
module.exports.isBoolean = isBoolean;
module.exports.isBuiltinObject = isBuiltinObject;
module.exports.isConstructorFunction = isConstructorFunction;
module.exports.isDictionary = isDictionary;
module.exports.isFunction = isFunction;
module.exports.isGeneratorFunction = isGeneratorFunction;
module.exports.isIterable = isIterable;
module.exports.isMagicMethod = isMagicMethod;
module.exports.isString = isString;
module.exports.isSymbol = isSymbol;
module.exports.isClass = isClass;
module.exports.isTypedArray = isTypedArray;
module.exports.withBindingScope = withBindingScope;

module.exports.hasAnyMagicMethods = hasAnyMagicMethods;
module.exports.hasMagicMethods = hasMagicMethods;
module.exports.hasStaticMagicMethods = hasStaticMagicMethods;
module.exports.hasStaticMagicSetter = hasStaticMagicSetter;
module.exports.hasStaticMagicGetter = hasStaticMagicGetter;
module.exports.hasMagicConstruct = hasMagicConstruct;
module.exports.hasMagicSetter = hasMagicSetter;
module.exports.hasMagicGetter = hasMagicGetter;
module.exports.hasMagicHas = hasMagicHas;
module.exports.hasMagicDelete = hasMagicDelete;
module.exports.hasMagicPrototypeMethods = hasMagicPrototypeMethods;

module.exports.dontTrapProperty = dontTrapProperty;
module.exports.isProtectedProperty = isProtectedProperty;
module.exports.isPrivateProperty = isPrivateProperty;
