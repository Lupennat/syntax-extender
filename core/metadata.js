'use strict';

const {
    METADATA,
    INTERFACE,
    CLASS,
    ABSTRACT,
    UUID,
    ANONYMOUS,
    CLASSINHERIT,
    PRIORITY,
    SEDEF_COMMENT,
    SEDEF_STATIC,
    FEATURES,
    CONSTRUCT,
    INTERFACEMANDATORY
} = require('./constants');

const {
    isArray,
    isConstructorFunction,
    isString,
    isDictionary,
    hasNativeConstructor,
    isClass,
    hasNativePrivate,
    hasOwn,
    getSedefEnv,
    setSedefEnv
} = require('./utils');

const extractInherited = require('./extract-inherited');
const extractDescriptors = require('./extract-descriptors');

const Metadata = require('./models/metadata');

const SyntaxExtenderNotValidArgumentError = require('../errors/syntax-extender-not-valid-argument-error');
const SyntaxExtenderMetadataNotValidTypeError = require('../errors/metadata/syntax-extender-metadata-not-valid-type-error');
const SyntaxExtenderMetadataWrongInterfaceError = require('../errors/metadata/syntax-extender-metadata-wrong-interface-error');
const SyntaxExtenderMetadataInterfaceMustBeAClassError = require('../errors/metadata/syntax-extender-metadata-interface-must-be-a-class-error');
const SyntaxExtenderMetadataMissingAbstractsError = require('../errors/metadata/syntax-extender-metadata-missing-abstracts-error');
const SyntaxExtenderMetadataAlreadyExtendedInterfaceError = require('../errors/metadata/syntax-extender-metadata-already-extended-interface-error');
const SyntaxExtenderMetadataAlreadyImplementedInterfaceError = require('../errors/metadata/syntax-extender-metadata-already-implemented-interface-error');
const SyntaxExtenderMetadataPrivatesOnInterfaceError = require('../errors/metadata/syntax-extender-metadata-privates-on-interface-error');
const SyntaxExtenderNativeConstructorError = require('../errors/syntax-extender-native-constructor-error');

const generateMetadata = (
    source,
    type,
    interfaces = [],
    abstracts = {},
    definitions = {},
    filepath = '',
    namespace = '',
    moduleId = ''
) => {
    if (!isConstructorFunction(source)) {
        throw new SyntaxExtenderNotValidArgumentError(
            `generateMetadata(source, type, interfaces = [], abstracts = {}, definitions = {}, filepath = '', namespace = '', moduleId = '') argument 1 must be a Constructor function.`
        );
    }
    if (!isString(type)) {
        throw new SyntaxExtenderNotValidArgumentError(
            `generateMetadata(source, type, interfaces = [], abstracts = {}, definitions = {}, filepath = '', namespace = '', moduleId = '') argument 2 must be a string.`
        );
    }
    if (!isArray(interfaces)) {
        throw new SyntaxExtenderNotValidArgumentError(
            `generateMetadata(source, type, interfaces = [], abstracts = {}, definitions = {}, filepath = '', namespace = '', moduleId = '') argument 3 must be an array.`
        );
    }
    if (!isDictionary(abstracts)) {
        throw new SyntaxExtenderNotValidArgumentError(
            `generateMetadata(source, type, interfaces = [], abstracts = {}, definitions = {}, filepath = '', namespace = '', moduleId = '') argument 4 must be a dictionary.`
        );
    }
    if (!isDictionary(definitions)) {
        throw new SyntaxExtenderNotValidArgumentError(
            `generateMetadata(source, type, interfaces = [], abstracts = {}, definitions = {}, filepath = '', namespace = '', moduleId = '') argument 5 must be a dictionary.`
        );
    }
    if (!isString(filepath)) {
        throw new SyntaxExtenderNotValidArgumentError(
            `generateMetadata(source, type, interfaces = [], abstracts = {}, definitions = {}, filepath = '', namespace = '', moduleId = '') argument 6 must be a string.`
        );
    }
    if (!isString(namespace)) {
        throw new SyntaxExtenderNotValidArgumentError(
            `generateMetadata(source, type, interfaces = [], abstracts = {}, definitions = {}, filepath = '', namespace = '', moduleId = '') argument 7 must be a string.`
        );
    }
    if (!isString(moduleId)) {
        throw new SyntaxExtenderNotValidArgumentError(
            `generateMetadata(source, type, interfaces = [], abstracts = {}, definitions = {}, filepath = '', namespace = '', moduleId = '') argument 8 must be a string.`
        );
    }

    const sourceName = source.name || ANONYMOUS;

    if (type === INTERFACE && !isClass(source)) {
        throw new SyntaxExtenderMetadataInterfaceMustBeAClassError(sourceName);
    }

    if (this.hasMetadata(source)) {
        return;
        // throw new SyntaxExtenderMetadataAlreadyDefinedError(sourceName);
    }

    const isInherited = type === CLASSINHERIT;

    // restore default type
    if (isInherited) {
        type = CLASS;
    }

    const keysToRemove = [];
    const prevValues = Object.keys(FEATURES).reduce((carry, feature) => {
        carry[feature] = getSedefEnv(feature);
        return carry;
    }, {});

    prevValues['PRIORITY'] = getSedefEnv('PRIORITY');

    try {
        // no feature on inherited classes for safety reason
        if (isInherited) {
            Object.keys(FEATURES).forEach(feature => {
                setSedefEnv(feature, false);
            });
        } else {
            Object.keys(FEATURES).forEach(feature => {
                const key = FEATURES[feature];
                if (type === INTERFACE && INTERFACEMANDATORY.indexOf(feature) > -1) {
                    setSedefEnv(feature, true);
                    if (hasOwn(source, key)) {
                        keysToRemove.push(source[key]);
                    }
                } else {
                    if (hasOwn(source, key)) {
                        setSedefEnv(feature, !!source[key]);
                        keysToRemove.push(source[key]);
                    }
                }
            });
            if (hasOwn(source, PRIORITY)) {
                setSedefEnv(
                    'PRIORITY',
                    [SEDEF_COMMENT, SEDEF_STATIC].indexOf(source[PRIORITY]) > -1 ? source[PRIORITY] : prevPriority
                );
                keysToRemove.push(source[PRIORITY]);
            }
        }

        const validTypes = [ABSTRACT, INTERFACE, CLASS];

        if (validTypes.indexOf(type) === -1) {
            throw new SyntaxExtenderMetadataNotValidTypeError(sourceName, type, validTypes.join(', '));
        }

        const interfacesMetadata = [];
        const foundedInterfaces = [];
        interfaces.reverse().forEach(interf => {
            const metadata = getMetadata(interf);
            if (!metadata || metadata.type !== INTERFACE) {
                throw new SyntaxExtenderMetadataWrongInterfaceError(interf.name || ANONYMOUS);
            }
            if (foundedInterfaces.indexOf(metadata.uuid) > -1) {
                if (type === INTERFACE) {
                    throw new SyntaxExtenderMetadataAlreadyExtendedInterfaceError(sourceName, metadata.name);
                } else {
                    throw new SyntaxExtenderMetadataAlreadyImplementedInterfaceError(sourceName, metadata.name);
                }
            }
            foundedInterfaces.push(metadata.uuid);
            interfacesMetadata.push(metadata);
        });

        const metadata = new Metadata();
        metadata.init();
        metadata.namespace = namespace;
        metadata.moduleId = moduleId;
        metadata.type = type;
        metadata.name = sourceName;
        metadata.filepath = filepath;
        metadata.hasNativePrivate = hasNativePrivate(source);

        Object.keys(FEATURES).forEach(feature => {
            if (getSedefEnv(feature) == 'true') {
                metadata.feature(feature);
            }
        });

        if (type === INTERFACE && metadata.hasNativePrivate) {
            throw new SyntaxExtenderMetadataPrivatesOnInterfaceError(sourceName);
        }

        if (hasNativeConstructor(source)) {
            if (type === INTERFACE || (!isInherited && metadata.hasFeature('CONSTRUCTOR'))) {
                throw new SyntaxExtenderNativeConstructorError(source.name, CONSTRUCT);
            }
        }

        let inheritedMetadata = null;
        const inherited = extractInherited(source);

        if (inherited) {
            if (!hasMetadata(inherited)) {
                generateMetadata(inherited, CLASSINHERIT);
            }

            inheritedMetadata = getMetadata(inherited);

            // native class can extends interfaces
            if (inheritedMetadata.type === INTERFACE) {
                interfacesMetadata.push(inheritedMetadata);
                inheritedMetadata = null;
            }
        }

        const isCurrentSourceSafe = isClass(source) && !hasNativeConstructor(source);

        const needToExecuteSafeExtraction = inheritedMetadata
            ? !inheritedMetadata.isSafeClass || !isCurrentSourceSafe
            : !isCurrentSourceSafe;

        metadata.isSafeClass = !needToExecuteSafeExtraction;

        for (let x = 0; x < interfacesMetadata.length; x++) {
            metadata.addInterface(interfacesMetadata[x]);
        }
        metadata.inherit(inheritedMetadata);

        extractDescriptors(
            source,
            needToExecuteSafeExtraction,
            definitions,
            abstracts,
            type === INTERFACE,
            descriptor => {
                descriptor.sourceUuid = metadata.uuid;
                descriptor.sourceNamespace = metadata.namespace;
                descriptor.sourceModuleId = metadata.moduleId;
                metadata.add(descriptor);
            },
            filepath
        );

        // inherited classes can extends classes generated by syntax-extender
        // like interfaces or abstracts
        // in this case abstracts will be inherited by metadata and we don't want to make validation
        // because if class was inherited the parent class can implement remaining abstracts
        if (!isInherited && type === CLASS) {
            const abstractsToImplements = metadata.getAbstracts();
            if (abstractsToImplements.length > 0) {
                throw new SyntaxExtenderMetadataMissingAbstractsError(
                    sourceName,
                    abstractsToImplements[0].isStatic,
                    abstractsToImplements[0].type,
                    abstractsToImplements[0].sourceName,
                    abstractsToImplements[0].name
                );
            }
        }

        assignMetadata(source, metadata);

        Object.keys(prevValues).forEach(feature => {
            setSedefEnv(feature, prevValues[feature]);
        });

        return keysToRemove;
    } catch (error) {
        // if something went wrong we have to reset runtime feature changes
        // otherwise feature will be applied as default
        Object.keys(prevValues).forEach(feature => {
            setSedefEnv(feature, prevValues[feature]);
        });
        // now we can throw the error
        throw error;
    }
};

const getMetadata = source => {
    if (!this.hasMetadata(source)) {
        return null;
    }

    return source[METADATA];
};

const hasMetadata = source => {
    return hasOwn(source, METADATA);
};

const assignMetadata = (source, metadata) => {
    Object.defineProperty(source, UUID, {
        value: metadata.uuid,
        enumerable: false,
        writable: false,
        configurable: false
    });

    Object.defineProperty(source, METADATA, {
        value: metadata,
        enumerable: false,
        writable: false,
        configurable: true
    });
};

module.exports.generateMetadata = generateMetadata;
module.exports.getMetadata = getMetadata;
module.exports.hasMetadata = hasMetadata;
module.exports.assignMetadata = assignMetadata;
