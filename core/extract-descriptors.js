'use strict';

const {
    STRIP_ALL_COMMENTS,
    ALL_SPACES,
    METHOD,
    SETTER,
    GETTER,
    PROPERTY,
    ANONYMOUS,
    BYPASSARGUMENT,
    PUBLIC,
    PROTECTED,
    INTERNAL,
    RESERVED,
    PRIVATE
} = require('./constants');

const {
    isConstructorFunction,
    isFunction,
    isDictionary,
    isBoolean,
    isMagicMethod,
    getMagicMethodParametersFixedLength,
    isString,
    isProtectedProperty,
    getSedefEnv,
    isPrivateProperty
} = require('./utils');

const { parseAndConvertDefinitions } = require('./type-casting');

const extractReturn = require('./extract-return');
const extractParameters = require('./extract-parameters');

const Descriptors = require('./models/descriptors');
const Descriptor = require('./models/descriptor');

const SyntaxExtenderNotValidArgumentError = require('../errors/syntax-extender-not-valid-argument-error');
const SyntaxExtenderExtractDescriptorsAbstractNotFoundError = require('../errors/extract-descriptors/syntax-extender-extract-descriptors-abstract-not-found-error');
const SyntaxExtenderExtractDescriptorsDefinitionsMismatchError = require('../errors/extract-descriptors/syntax-extender-extract-descriptors-definitions-mismatch-error');
const SyntaxExtenderExtractDescriptorsAbstractPropertiesError = require('../errors/extract-descriptors/syntax-extender-extract-descriptors-abstract-properties-error');
const SyntaxExtenderExtractDescriptorsAbstractCanNotContainsBodyError = require('../errors/extract-descriptors/syntax-extender-extract-descriptors-abstract-can-not-contains-body-error');
const SyntaxExtenderExtractDescriptorsAbstractNotAbstractCollisionError = require('../errors/extract-descriptors/syntax-extender-extract-descriptors-abstract-not-abstract-collision-error');
const SyntaxExtenderExtractDescriptorsAbstractAbstractCollisionError = require('../errors/extract-descriptors/syntax-extender-extract-descriptors-abstract-abstract-collision-error');

const excludeStatic = ['length', 'prototype', 'name', Symbol.hasInstance, Symbol.species]
    .concat(INTERNAL)
    .concat(RESERVED);

const exclude = [
    'constructor',
    Symbol.asyncIterator,
    Symbol.isConcatSpreadable,
    Symbol.iterator,
    Symbol.match,
    Symbol.matchAll,
    Symbol.replace,
    Symbol.search,
    Symbol.split,
    Symbol.toPrimitive,
    Symbol.toStringTag,
    Symbol.unscopables
];

const fnHasBody = source => {
    const fnStr = Function.prototype.toString.call(source).replace(STRIP_ALL_COMMENTS, '').replace(ALL_SPACES, '');
    const emptyBody = fnStr.substr(fnStr.length - 2);

    return emptyBody !== '{}';
};

const doExtraction = (source, isStatic) => {
    const filters = isStatic ? excludeStatic : exclude;

    const names = Object.getOwnPropertyNames(source).filter(name => filters.indexOf(name) === -1);

    const descriptors = names.reduce((carry, key) => {
        carry[key] = Object.getOwnPropertyDescriptor(source, key);
        return carry;
    }, {});

    const syms = Object.getOwnPropertySymbols(source).filter(name => filters.indexOf(name) === -1);

    syms.reduce((carry, sym) => {
        carry[sym] = Object.getOwnPropertyDescriptor(source, sym);
        return carry;
    }, descriptors);

    return descriptors;
};

const generateDescriptoFromRaw = (
    type,
    filepath,
    source,
    sourceName,
    rawDescriptor,
    uuid,
    isStatic,
    allFunctionsAbstracts,
    definitions,
    abstracts,
    collisions,
    foundedAbstracts
) => {
    let internalUuid = uuid;

    const functionHasBody =
        type === METHOD
            ? fnHasBody(rawDescriptor.value)
            : type === SETTER
            ? fnHasBody(rawDescriptor.set)
            : type === GETTER
            ? fnHasBody(rawDescriptor.get)
            : null;

    let isAbstract = internalUuid in abstracts;

    const name = (isAbstract ? abstracts[internalUuid] : internalUuid).toString();

    if (allFunctionsAbstracts && type !== PROPERTY) {
        isAbstract = true;
    }

    if (type === PROPERTY && isAbstract) {
        throw new SyntaxExtenderExtractDescriptorsAbstractPropertiesError(sourceName, name, isStatic);
    }
    if (isAbstract && functionHasBody) {
        throw new SyntaxExtenderExtractDescriptorsAbstractCanNotContainsBodyError(sourceName, name, isStatic);
    }

    const collisionKey = `${isStatic ? 'static:' : ''}${type}${name}`;
    const definitionKey = `${isStatic ? 'static:' : ''}${name}`;

    if (allFunctionsAbstracts && type !== PROPERTY) {
        // we force this new uuid because static and prototype can have same name
        // we force also method because of setter and getter have same name
        internalUuid = `${type}:${isStatic ? 'static:' : ''}${uuid}`;
    }

    if (collisionKey in collisions) {
        const collision = collisions[collisionKey];
        if (collision.isAbstract && isAbstract) {
            throw new SyntaxExtenderExtractDescriptorsAbstractAbstractCollisionError(
                sourceName,
                name,
                internalUuid,
                collision.uuid,
                isStatic
            );
        } else {
            throw new SyntaxExtenderExtractDescriptorsAbstractNotAbstractCollisionError(sourceName, name, isStatic);
        }
    }

    foundedAbstracts.push(internalUuid);
    collisions[collisionKey] = { isAbstract: isAbstract, uuid: internalUuid };

    const descriptor = new Descriptor();
    if (type !== SETTER && type !== PROPERTY) {
        descriptor.return = extractReturn(
            type === METHOD ? rawDescriptor.value : rawDescriptor.get,
            definitions,
            definitionKey,
            name,
            source,
            filepath
        );
    }

    const isPrivate = isPrivateProperty(name, isStatic, getSedefEnv('MAGIC') == 'true');
    const isProtected = isProtectedProperty(name, isStatic, getSedefEnv('MAGIC') == 'true');
    const visibility = isPrivate ? PRIVATE : isProtected ? PROTECTED : PUBLIC;

    descriptor.visibility = visibility;
    descriptor.isAbstract = isAbstract;
    descriptor.name = name;
    descriptor.originalName = internalUuid;
    if (type !== GETTER && type !== PROPERTY) {
        descriptor.parameters = extractParameters(
            type === METHOD ? rawDescriptor.value : rawDescriptor.set,
            definitions,
            definitionKey,
            name,
            source,
            filepath
        );
    }
    descriptor.isStatic = isStatic;
    descriptor.sourceName = sourceName;
    descriptor.type = type;
    descriptor.value = type === PROPERTY ? rawDescriptor.value : '';
    descriptor.isMagic = getSedefEnv('MAGIC') == 'true' && isMagicMethod(isStatic, name);

    if (descriptor.isMagic) {
        if (descriptor.type !== METHOD) {
            throw new SyntaxExtenderNotValidArgumentError(`${sourceName} "${name}" is a reserved magic method.`);
        }
        const max = getMagicMethodParametersFixedLength(name);
        if (max !== null) {
            if (descriptor.parameters.size() !== max) {
                throw new SyntaxExtenderNotValidArgumentError(
                    `Method ${sourceName}.${name}() must take exactly ${max} arguments`
                );
            }
            descriptor.parameters.all().forEach(param => {
                if (param.variadic) {
                    throw new SyntaxExtenderNotValidArgumentError(
                        `Method ${sourceName}.${name}() must take exactly ${max} arguments`
                    );
                }
            });
        }
    }

    if (definitions.size(definitionKey) === 0) {
        definitions.remove(definitionKey);
    }

    return descriptor;
};

const getProcessedDescriptor = (
    filepath,
    source,
    sourceName,
    rawDescriptor,
    uuid,
    isStatic,
    allFunctionsAbstracts,
    definitions,
    abstracts,
    collisions,
    foundedAbstracts
) => {
    const isFn = isFunction(rawDescriptor.value);
    const isSetter = isFunction(rawDescriptor.set);
    const isGetter = isFunction(rawDescriptor.get);

    const descs = [];
    if (isSetter && isGetter) {
        descs.push(
            generateDescriptoFromRaw(
                GETTER,
                filepath,
                source,
                sourceName,
                rawDescriptor,
                uuid,
                isStatic,
                allFunctionsAbstracts,
                definitions,
                abstracts,
                collisions,
                foundedAbstracts
            )
        );
        descs.push(
            generateDescriptoFromRaw(
                SETTER,
                filepath,
                source,
                sourceName,
                rawDescriptor,
                uuid,
                isStatic,
                allFunctionsAbstracts,
                definitions,
                abstracts,
                collisions,
                foundedAbstracts
            )
        );
    } else {
        const type = isFn ? METHOD : isSetter ? SETTER : isGetter ? GETTER : PROPERTY;
        descs.push(
            generateDescriptoFromRaw(
                type,
                filepath,
                source,
                sourceName,
                rawDescriptor,
                uuid,
                isStatic,
                allFunctionsAbstracts,
                definitions,
                abstracts,
                collisions,
                foundedAbstracts
            )
        );
    }
    return descs;
};

const extractDescriptors = (
    source,
    safe = true,
    definitions = {},
    abstracts = {},
    allFunctionsAbstracts = false,
    callback = null,
    filepath = ''
) => {
    if (!isConstructorFunction(source)) {
        throw new SyntaxExtenderNotValidArgumentError(
            `extractDescriptors(source, safe = true, definitions = {}, abstracts = {}, allFunctionsAbstracts = false, callback = null, filepath = '') argument 1 must be a constructor function.`
        );
    }
    if (!isBoolean(safe)) {
        throw new SyntaxExtenderNotValidArgumentError(
            `extractDescriptors(source, safe = true, definitions = {}, abstracts = {}, allFunctionsAbstracts = false, callback = null, filepath = '') argument 2 must be a boolean.`
        );
    }
    if (!isDictionary(definitions)) {
        throw new SyntaxExtenderNotValidArgumentError(
            `extractDescriptors(source, safe = true, definitions = {}, abstracts = {}, allFunctionsAbstracts = false, callback = null, filepath = '') argument 3 must be a dictionary.`
        );
    }
    if (!isDictionary(abstracts)) {
        throw new SyntaxExtenderNotValidArgumentError(
            `extractDescriptors(source, safe = true, definitions = {}, abstracts = {}, allFunctionsAbstracts = false, callback = null, filepath = '') argument 4 must be a dictionary.`
        );
    }
    if (!isBoolean(allFunctionsAbstracts)) {
        throw new SyntaxExtenderNotValidArgumentError(
            `extractDescriptors(source, safe = true, definitions = {}, abstracts = {}, allFunctionsAbstracts = false, callback = null, filepath = '') argument 5 must be a boolean.`
        );
    }

    if (callback !== null && !isFunction(callback)) {
        throw new SyntaxExtenderNotValidArgumentError(
            `extractDescriptors(source, safe = true, definitions = {}, abstracts = {}, allFunctionsAbstracts = false, callback = null, filepath = '') argument 6 must be null or function.`
        );
    }

    if (!isString(filepath)) {
        throw new SyntaxExtenderNotValidArgumentError(
            `extractDescriptors(source, safe = true, definitions = {}, abstracts = {}, allFunctionsAbstracts = false, callback = null, filepath = '') argument 7 must be a string.`
        );
    }

    const sourceName = source.name || ANONYMOUS;

    const rawStaticDescriptors = doExtraction(source, true);
    const hasCallback = isFunction(callback);
    const rawDescriptors = {
        ...doExtraction(source.prototype, false),
        // we use BYPASSARGUMENT to skip proxy instance handler generated
        ...(safe ? {} : doExtraction(new source(BYPASSARGUMENT), false))
    };

    const collisions = {};
    const foundedAbstracts = [];
    const descriptors = new Descriptors();

    definitions = parseAndConvertDefinitions(definitions);

    Reflect.ownKeys(rawStaticDescriptors).forEach(uuid => {
        const descs = getProcessedDescriptor(
            filepath,
            source,
            sourceName,
            Reflect.get(rawStaticDescriptors, uuid),
            uuid,
            true,
            allFunctionsAbstracts,
            definitions,
            abstracts,
            collisions,
            foundedAbstracts
        );
        for (let x = 0; x < descs.length; x++) {
            const descriptor = descs[x];
            if (hasCallback) {
                callback(descriptor);
            } else {
                descriptors.add(descriptor);
            }
        }
    });

    Reflect.ownKeys(rawDescriptors).map(uuid => {
        const descs = getProcessedDescriptor(
            filepath,
            source,
            sourceName,
            Reflect.get(rawDescriptors, uuid),
            uuid,
            false,
            allFunctionsAbstracts,
            definitions,
            abstracts,
            collisions,
            foundedAbstracts
        );

        for (let x = 0; x < descs.length; x++) {
            const descriptor = descs[x];
            if (hasCallback) {
                callback(descriptor);
            } else {
                descriptors.add(descriptor);
            }
        }
    });

    for (const uuid in abstracts) {
        if (foundedAbstracts.indexOf(uuid) === -1) {
            throw new SyntaxExtenderExtractDescriptorsAbstractNotFoundError(sourceName, uuid, abstracts[uuid]);
        }
    }

    if (definitions.size() > 0) {
        throw new SyntaxExtenderExtractDescriptorsDefinitionsMismatchError(sourceName, definitions.keys());
    }

    if (!hasCallback) {
        return descriptors;
    }
};

module.exports = extractDescriptors;
