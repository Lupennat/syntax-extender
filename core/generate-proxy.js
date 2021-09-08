'use strict';

const {
    METADATA,
    INTERFACE,
    CLASS,
    ABSTRACT,
    UUID,
    METHOD,
    GETTER,
    SETTER,
    CONSTRUCT,
    GET,
    SET,
    HAS,
    STATICGET,
    STATICSET,
    DELETE,
    BYPASSARGUMENT,
    HANDLERS,
    MODULEID
} = require('./constants');

const {
    isFunction,
    isConstructorFunction,
    isString,
    isDictionary,
    hasStaticMagicGetter,
    hasStaticMagicSetter,
    hasMagicConstruct,
    hasMagicSetter,
    hasMagicHas,
    hasMagicDelete,
    hasMagicMethods,
    hasMagicPrototypeMethods,
    hasMagicGetter,
    isSymbol,
    hasStaticMagicMethods,
    dontTrapProperty,
    hasOwn,
    isArray
} = require('./utils');

const { getMetadata } = require('./metadata');

const validateParameters = require('./validate-parameters');
const validateReturn = require('./validate-return');

const SyntaxExtenderNotValidArgumentError = require('../errors/syntax-extender-not-valid-argument-error');
const SyntaxExtenderNotValidTypeError = require('../errors/syntax-extender-not-valid-type-error');
const SyntaxExtenderRunningError = require('../errors/syntax-extender-running-error');
const SyntaxExtenderAbstractCollisionError = require('../errors/syntax-extender-abstract-collision-error');
const SyntaxExtenderGenerateProxyMagicAndPrivatesError = require('../errors/generate-proxy/syntax-extender-generate-proxy-magic-and-privates-error');
const SyntaxExtenderGenerateProxyMagicAndInheritedPrivatesError = require('../errors/generate-proxy/syntax-extender-generate-proxy-magic-and-inherited-privates-error');

const getDefinedProperty = (type, sourceName, name, freeze) => {
    switch (type) {
        case METHOD:
            return {
                value() {
                    throw new SyntaxExtenderRunningError(`Cannot call abstract method ${sourceName}.${name}.`);
                },
                writable: !freeze,
                enumerable: false,
                configurable: !freeze
            };
        case GETTER:
            return {
                get() {
                    throw new SyntaxExtenderRunningError(`Cannot call abstract getter ${sourceName}.${name}.`);
                },
                enumerable: false,
                configurable: !freeze
            };
        case SETTER:
            return {
                set(value) {
                    throw new SyntaxExtenderRunningError(`Cannot call abstract setter ${sourceName}.${name}.`);
                },
                enumerable: false,
                configurable: !freeze
            };
    }
};

const fixSourceAbstracts = (source, metadata, abstracts, force = false, freeze = false) => {
    const staticDescriptors = {};
    const prototypeDescriptors = {};
    const keysToRemove = [];
    const prototypeKeysToRemove = [];

    for (const uuid in abstracts) {
        if (uuid in metadata.abstractsMap) {
            const data = metadata.abstractsMap[uuid];
            delete metadata.abstractsMap[uuid];
            if (data.isStatic) {
                if (hasOwn(source, uuid)) {
                    keysToRemove.push(uuid);
                    if (hasOwn(source, data.name)) {
                        if (data.type === METHOD) {
                            continue;
                        }
                    }
                    if (hasOwn(staticDescriptors, data.name)) {
                        if (data.type !== METHOD) {
                            if (isFunction(staticDescriptors[data.name].value)) {
                                throw new SyntaxExtenderAbstractCollisionError(source.name, data.name);
                            }
                        } else {
                            if (
                                isFunction(staticDescriptors[data.name].get) ||
                                isFunction(staticDescriptors[data.name].set)
                            ) {
                                throw new SyntaxExtenderAbstractCollisionError(source.name, data.name);
                            }
                        }
                        Object.assign(
                            staticDescriptors[data.name],
                            getDefinedProperty(data.type, data.source, data.name, freeze)
                        );
                    } else {
                        staticDescriptors[data.name] = getDefinedProperty(data.type, data.source, data.name, freeze);
                    }
                }
            } else {
                if (hasOwn(source.prototype, uuid)) {
                    prototypeKeysToRemove.push(uuid);
                    if (hasOwn(source.prototype, data.name)) {
                        if (data.type === METHOD) {
                            continue;
                        }
                    }
                    if (hasOwn(prototypeDescriptors, data.name)) {
                        if (data.type !== METHOD) {
                            if (isFunction(prototypeDescriptors[data.name].value)) {
                                throw new SyntaxExtenderAbstractCollisionError(source.name, data.name);
                            }
                        } else {
                            if (
                                isFunction(prototypeDescriptors[data.name].get) ||
                                isFunction(prototypeDescriptors[data.name].set)
                            ) {
                                throw new SyntaxExtenderAbstractCollisionError(source.name, data.name);
                            }
                        }
                        Object.assign(
                            prototypeDescriptors[data.name],
                            getDefinedProperty(data.type, data.source, data.name, freeze)
                        );
                    } else {
                        prototypeDescriptors[data.name] = getDefinedProperty(data.type, data.source, data.name, freeze);
                    }
                }
            }
        }
    }

    for (const uuid in metadata.abstractsMap) {
        const data = metadata.abstractsMap[uuid];
        delete metadata.abstractsMap[uuid];
        if (data.isStatic) {
            if (!metadata.get(data.type, `static:${data.name}`).isAbstract) {
                continue;
            }
            if (!force && hasOwn(source, data.name)) {
                continue;
            }
            if (hasOwn(staticDescriptors, data.name)) {
                if (data.type !== METHOD) {
                    if (isFunction(staticDescriptors[data.name].value)) {
                        throw new SyntaxExtenderAbstractCollisionError(source.name, data.name);
                    }
                } else {
                    if (isFunction(staticDescriptors[data.name].get) || isFunction(staticDescriptors[data.name].set)) {
                        throw new SyntaxExtenderAbstractCollisionError(source.name, data.name);
                    }
                }

                Object.assign(
                    staticDescriptors[data.name],
                    getDefinedProperty(data.type, data.source, data.name, freeze)
                );
            } else {
                staticDescriptors[data.name] = getDefinedProperty(data.type, data.source, data.name, freeze);
            }
        } else {
            if (!metadata.get(data.type, data.name).isAbstract) {
                continue;
            }
            if (!force && hasOwn(source.prototype, data.name)) {
                continue;
            }
            if (hasOwn(prototypeDescriptors, data.name)) {
                if (data.type !== METHOD) {
                    if (isFunction(prototypeDescriptors[data.name].value)) {
                        throw new SyntaxExtenderAbstractCollisionError(source.name, data.name);
                    }
                } else {
                    if (
                        isFunction(prototypeDescriptors[data.name].get) ||
                        isFunction(prototypeDescriptors[data.name].set)
                    ) {
                        throw new SyntaxExtenderAbstractCollisionError(source.name, data.name);
                    }
                }
                Object.assign(
                    prototypeDescriptors[data.name],
                    getDefinedProperty(data.type, data.source, data.name, freeze)
                );
            } else {
                prototypeDescriptors[data.name] = getDefinedProperty(data.type, data.source, data.name, freeze);
            }
        }
    }
    Object.defineProperties(source, staticDescriptors);
    Object.defineProperties(source.prototype, prototypeDescriptors);

    return [keysToRemove, prototypeKeysToRemove];
};

const addValidationRule = (source, isStatic, descriptor) => {
    const name = isSymbol(descriptor.originalName) ? descriptor.originalName : descriptor.name;
    const desc = Object.getOwnPropertyDescriptor(isStatic ? source : source.prototype, name);
    if (isFunction(desc.value)) {
        const originalMethod = desc.value;
        desc.value = function (...args) {
            return validateReturn(
                descriptor.return,
                originalMethod.apply(this, validateParameters(descriptor.parameters, ...args))
            );
        };
    }
    if (isFunction(desc.set)) {
        const originalMethod = desc.set;
        desc.set = function (arg) {
            return originalMethod.apply(this, validateParameters(descriptor.parameters, arg));
        };
    }

    if (isFunction(desc.get)) {
        const originalMethod = desc.get;
        desc.get = function () {
            return validateReturn(descriptor.return, originalMethod.apply(this, []));
        };
    }

    Object.defineProperty(isStatic ? source : source.prototype, descriptor.name, desc);
};

const fixSourceConstants = (source, metadata) => {
    Object.defineProperties(
        source,
        Object.keys(metadata.constants || {}).reduce((c, k) => {
            c[k] = {
                value: metadata.constants[k].value,
                writable: false,
                enumerable: false,
                configurable: false
            };
            return c;
        }, {})
    );
};

const addValidationRules = (source, metadata) => {
    for (let x = 0; x < metadata.validationMap.length; x++) {
        const key = metadata.validationMap[x];
        const [type, ...rest] = key.split(':');
        const name = rest.join(':');
        const isStatic = name.startsWith('static:');
        addValidationRule(source, isStatic, metadata.get(type, name));
    }
};

const generateInterfaceProxy = (source, keysToRemove) => {
    const name = source.name;
    const metadata = getMetadata(source);

    let [staticKeysToRemove, prototypeKeysToRemove] = fixSourceAbstracts(source, metadata, {}, true, true);

    staticKeysToRemove = staticKeysToRemove.concat(keysToRemove);

    const originalHasInstance = source[Symbol.hasInstance];
    Object.defineProperty(source, Symbol.hasInstance, {
        value: function (instance) {
            // check original to compatibility with standard class
            if (originalHasInstance.call(this, instance)) {
                return true;
            }

            // check by metadata inheritance
            if (instance && instance.constructor && METADATA in instance.constructor) {
                const metadata = instance.constructor[METADATA];
                return ((metadata || {}).interfaces || []).indexOf(this[UUID]) > -1;
            }

            return false;
        }
    });

    for (let x = 0; x < staticKeysToRemove.length; x++) {
        delete source[staticKeysToRemove[x]];
    }

    for (let x = 0; x < prototypeKeysToRemove.length; x++) {
        delete source.prototype[prototypeKeysToRemove[x]];
    }

    Object.defineProperty(source, MODULEID, {
        value: metadata.moduleId,
        writable: false,
        enumerable: false,
        configurable: true
    });

    return new Proxy(source, {
        construct(target, argumentsList, newTarget) {
            if (target.name === newTarget.name) {
                throw new SyntaxExtenderRunningError(`cannot instantiate interface ${name}.`);
            }

            const isBypass = argumentsList.length === 1 && argumentsList[0] === BYPASSARGUMENT;

            // we need to bypass any proxy when we generate new instance to extract properties
            if (isBypass) {
                return Reflect.construct(target, [], newTarget);
            }

            return Reflect.construct(target, argumentsList, newTarget);
        }
    });
};

const generateAbstractProxy = (source, abstracts, keysToRemove) => {
    return generateClassProxy(source, abstracts, keysToRemove, true);
};

const generateClassProxy = (source, abstracts, keysToRemove, isAbstract = false) => {
    const name = source.name;
    const metadata = getMetadata(source);
    const hasMagicFeature = metadata.hasFeature('MAGIC');

    fixSourceConstants(source, metadata);

    let [staticKeysToRemove, prototypeKeysToRemove] = fixSourceAbstracts(source, metadata, abstracts);

    staticKeysToRemove = staticKeysToRemove.concat(keysToRemove);

    if (metadata.hasFeature('VALIDATION')) {
        addValidationRules(source, metadata);
    }

    const handler = {};
    if (hasMagicFeature && hasStaticMagicMethods(source)) {
        if (hasStaticMagicGetter(source)) {
            handler.get = function (target, property, receiver) {
                if (dontTrapProperty(property, true, hasMagicFeature) || Reflect.has(target, property)) {
                    return Reflect.get(target, property, receiver);
                }

                return target[STATICGET].call(receiver, property);
            };
        }
        if (hasStaticMagicSetter(source)) {
            // we use enabled to give possibility on __setStatic to assign a value to non existing prop
            // in that way we prevent infinite loop
            let enabled = true;
            handler.set = function (target, property, value, receiver) {
                if (!enabled || dontTrapProperty(property, true, hasMagicFeature) || Reflect.has(target, property)) {
                    return Reflect.set(target, property, value, receiver);
                }

                enabled = false;
                target[STATICSET].call(receiver, property, value);
                enabled = true;

                return true;
            };
        }
    }

    if (hasMagicFeature && hasMagicMethods(source)) {
        const hasMagicPrototype = hasMagicPrototypeMethods(source);
        if (hasMagicPrototype) {
            if (metadata.hasNativePrivate) {
                throw new SyntaxExtenderGenerateProxyMagicAndPrivatesError(metadata.name);
            }
            for (const uuid in metadata.nativePrivatesMap) {
                throw new SyntaxExtenderGenerateProxyMagicAndInheritedPrivatesError(
                    metadata.name,
                    metadata.nativePrivatesMap[uuid]
                );
            }
        }
        handler.construct = function (target, argumentsList, newTarget) {
            if (isAbstract) {
                if (target.name === newTarget.name) {
                    throw new SyntaxExtenderRunningError(`cannot instantiate abstract class ${name}.`);
                }
            }

            const isBypass = argumentsList.length === 1 && argumentsList[0] === BYPASSARGUMENT;
            // we need to bypass any proxy when we generate new instance to extract properties

            if (isBypass) {
                return Reflect.construct(target, [], newTarget);
            }

            const instance = Reflect.construct(target, argumentsList, newTarget);

            // if (newTarget.prototype instanceof target) {
            //     // only current class set proxy and call magic __construct not extended;
            //     return instance;
            // }

            if (hasMagicConstruct(source)) {
                instance[CONSTRUCT].call(instance, ...argumentsList);
            }

            if (!hasMagicPrototype) {
                Object.defineProperty(instance, HANDLERS, {
                    value: [],
                    writable: false,
                    enumerable: false,
                    configurable: true
                });
                return instance;
            }

            let magicHasIsEnabled = true;
            const handler = {};

            if (hasMagicGetter(source)) {
                handler.get = function (target, property, receiver) {
                    magicHasIsEnabled = false;
                    const exists = Reflect.has(target, property);
                    magicHasIsEnabled = true;

                    if (dontTrapProperty(property, false, hasMagicFeature) || exists) {
                        return Reflect.get(target, property, receiver);
                    }

                    const value = target[GET].call(target, property);
                    return isFunction(value) ? value.bind(target) : value;
                };
            }

            if (hasMagicSetter(source)) {
                // we don't need enabled because no infinite loop will be raised
                handler.set = function (target, property, value, receiver) {
                    magicHasIsEnabled = false;
                    const exists = Reflect.has(target, property);
                    magicHasIsEnabled = true;

                    if (dontTrapProperty(property, false, hasMagicFeature) || exists) {
                        return Reflect.set(target, property, value, receiver);
                    }

                    target[SET].call(target, property, value);

                    return true;
                };
            }
            if (hasMagicHas(source)) {
                handler.has = function (target, property) {
                    if (!magicHasIsEnabled || dontTrapProperty(property, false, hasMagicFeature)) {
                        return Reflect.has(target, property);
                    }
                    if (Reflect.has(target, property)) {
                        return true;
                    } else {
                        return target[HAS].call(target, property);
                    }
                };
            }

            if (hasMagicDelete(source)) {
                handler.deleteProperty = function (target, property) {
                    magicHasIsEnabled = false;
                    const exists = Reflect.has(target, property);
                    magicHasIsEnabled = true;

                    if (dontTrapProperty(property, false, hasMagicFeature) || exists) {
                        return Reflect.deleteProperty(target, property);
                    }

                    target[DELETE].call(target, property);
                    return true;
                };
            }

            Object.defineProperty(instance, HANDLERS, {
                value: Object.keys(handler),
                writable: false,
                enumerable: false,
                configurable: true
            });

            return new Proxy(instance, handler);
        };
    } else {
        if (isAbstract) {
            handler.construct = function (target, argumentsList, newTarget) {
                if (target.name === newTarget.name) {
                    throw new SyntaxExtenderRunningError(`cannot instantiate abstract class ${name}.`);
                }

                const isBypass = argumentsList.length === 1 && argumentsList[0] === BYPASSARGUMENT;

                // we need to bypass any proxy when we generate new instance to extract properties
                if (isBypass) {
                    return Reflect.construct(target, [], newTarget);
                }

                return Reflect.construct(target, argumentsList, newTarget);
            };
        }
    }

    for (let x = 0; x < staticKeysToRemove.length; x++) {
        delete source[staticKeysToRemove[x]];
    }

    for (let x = 0; x < prototypeKeysToRemove.length; x++) {
        delete source.prototype[prototypeKeysToRemove[x]];
    }

    Object.defineProperty(source, HANDLERS, {
        value: Object.keys(handler),
        writable: false,
        enumerable: false,
        configurable: true
    });

    Object.defineProperty(source, MODULEID, {
        value: metadata.moduleId,
        writable: false,
        enumerable: false,
        configurable: true
    });

    if (Object.keys(handler).length === 0) {
        return source;
    }

    return new Proxy(source, handler);
};

const generateProxy = (source, type, abstracts = {}, keysToRemove = []) => {
    if (!isConstructorFunction(source)) {
        throw new SyntaxExtenderNotValidArgumentError(
            'generateProxy(source, type, abstracts = {}, keysToRemove = []) argument 1 must be a Constructor function.'
        );
    }
    if (!isString(type)) {
        throw new SyntaxExtenderNotValidArgumentError(
            'generateProxy(source, type, abstracts = {}, keysToRemove = []) argument 2 must be a string.'
        );
    }
    if (!isDictionary(abstracts)) {
        throw new SyntaxExtenderNotValidArgumentError(
            'generateProxy(source, type, abstracts = {}, keysToRemove = []) argument 3 must be a dictionary.'
        );
    }
    if (!isArray(keysToRemove)) {
        throw new SyntaxExtenderNotValidArgumentError(
            'generateProxy(source, type, abstracts = {}, keysToRemove = []) argument 4 must be an array.'
        );
    }

    switch (type) {
        case INTERFACE:
            return generateInterfaceProxy(source, keysToRemove);
        case CLASS:
            return generateClassProxy(source, abstracts, keysToRemove);
        case ABSTRACT:
            return generateAbstractProxy(source, abstracts, keysToRemove);
        default:
            throw new SyntaxExtenderNotValidTypeError(
                `type "${type}" not supported, valid types: __class, __interface, __abstract`
            );
    }
};

module.exports = generateProxy;
