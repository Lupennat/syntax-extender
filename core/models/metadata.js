'use strict';

const util = require('util');

const pluralize = require('pluralize');
const { v4: uuidv4 } = require('uuid');

const { PROPERTY, METHOD, GETTER, SETTER, INTERFACE, CONSTRUCT, PUBLIC } = require('../constants');
const validateCompatibility = require('../validate-compatibility');

const Descriptor = require('./descriptor');

const SyntaxExtenderMetadataInterfacePropertyError = require('../../errors/metadata/syntax-extender-metadata-interface-property-error');
const SyntaxExtenderMetadataOverrideConstantsError = require('../../errors/metadata/syntax-extender-metadata-override-constants-error');
const SyntaxExtenderMetadataAccessTypeOnInterfaceError = require('../../errors/metadata/syntax-extender-metadata-access-type-on-interface-error');

class Metadata extends Object {
    constructor(...args) {
        super(...args);
        Object.defineProperties(this, {
            featuresEnabled: {
                value: [],
                enumerable: false,
                writable: true
            },
            type: {
                value: '',
                enumerable: false,
                writable: true
            },
            filepath: {
                value: '',
                enumerable: false,
                writable: true
            },
            name: {
                value: '',
                enumerable: false,
                writable: true
            },
            namespace: {
                value: '',
                enumerable: false,
                writable: true
            },
            moduleId: {
                value: '',
                enumerable: false,
                writable: true
            },
            isSafeClass: {
                value: false,
                enumerable: false,
                writable: true
            },
            interfaces: {
                value: [],
                enumerable: false,
                writable: true
            },
            constants: {
                value: {},
                enumerable: false,
                writable: true
            },
            abstractsMap: {
                value: {},
                enumerable: false,
                writable: true
            },
            staticprivates: {
                value: {},
                enumerable: false,
                writable: true
            },
            staticprotecteds: {
                value: {},
                enumerable: false,
                writable: true
            },
            privates: {
                value: {},
                enumerable: false,
                writable: true
            },
            protecteds: {
                value: {},
                enumerable: false,
                writable: true
            },
            hasNativePrivate: {
                value: false,
                enumerable: false,
                writable: true
            },
            nativePrivatesMap: {
                value: {},
                enumerable: false,
                writable: true
            },
            validationMap: {
                value: [],
                enumerable: false,
                writable: true
            },
            [pluralize(PROPERTY)]: {
                value: {},
                enumerable: false,
                writable: true
            },
            [pluralize(METHOD)]: {
                value: {},
                enumerable: false,
                writable: true
            },
            [pluralize(GETTER)]: {
                value: {},
                enumerable: false,
                writable: true
            },
            [pluralize(SETTER)]: {
                value: {},
                enumerable: false,
                writable: true
            }
        });
    }

    init(uuid = null) {
        Object.defineProperty(this, 'uuid', {
            value: uuid || uuidv4(),
            enumerable: false,
            writable: false
        });
        Object.seal(this);
    }

    feature(feature) {
        if (!this.hasFeature(feature)) {
            this.featuresEnabled.push(feature);
        }
    }

    hasFeature(feature) {
        return this.featuresEnabled.indexOf(feature) > -1;
    }

    add(descriptor) {
        if (descriptor && descriptor instanceof Descriptor) {
            const keyType = pluralize(descriptor.type);
            const keyName = `${descriptor.isStatic ? 'static:' : ''}${descriptor.name}`;
            if (descriptor.visibility !== PUBLIC) {
                if (this.type === INTERFACE) {
                    throw new SyntaxExtenderMetadataAccessTypeOnInterfaceError(
                        descriptor.sourceName,
                        descriptor.name,
                        descriptor.type,
                        descriptor.isStatic
                    );
                } else {
                    this[(descriptor.isStatic ? 'static' : '') + pluralize(descriptor.visibility)][
                        descriptor.name
                    ] = true;
                }
            }

            if (descriptor.type === PROPERTY && descriptor.isStatic) {
                if (descriptor.name in this.constants) {
                    throw new SyntaxExtenderMetadataOverrideConstantsError(
                        descriptor.sourceName,
                        descriptor.name,
                        this.constants[descriptor.name].sourceName
                    );
                }
            }

            if (this.type === INTERFACE && descriptor.type === PROPERTY) {
                if (!descriptor.isStatic) {
                    throw new SyntaxExtenderMetadataInterfacePropertyError(this.sourceName, descriptor.name);
                } else {
                    this.constants[descriptor.name] = {
                        value: descriptor.value,
                        sourceName: descriptor.sourceName,
                        uuid: this.uuid
                    };
                }
            } else {
                if (descriptor.type === SETTER || descriptor.type === GETTER || descriptor.type === METHOD) {
                    const inherited = this[keyType][keyName] || null;
                    if (inherited && descriptor.name !== CONSTRUCT) {
                        if (this.hasFeature('COMPATIBILITY')) {
                            validateCompatibility(descriptor, inherited);
                        }
                    }
                    if (!descriptor.isAbstract && this.uuid === descriptor.sourceUuid) {
                        const key = `${descriptor.type}:${descriptor.isStatic ? 'static:' : ''}${descriptor.name}`;
                        if (this.validationMap.indexOf(key) === -1) {
                            this.validationMap.push(key);
                        }
                    }
                }
                if (descriptor.isAbstract) {
                    // because of mixed content
                    // Interface = toInterface(class Interface { test() {} })
                    // class A extends Interface {}
                    // Abs = toAbstract((abs) => class Abs extends A { [abs('test')]() {} })
                    // we need to remove inherited abstract from interfaces
                    const uuidFromInterfacesExtended = `${descriptor.type}:${descriptor.isStatic ? 'static:' : ''}${
                        descriptor.name
                    }`;
                    if (uuidFromInterfacesExtended in this.abstractsMap) {
                        delete this.abstractsMap[uuidFromInterfacesExtended];
                    }
                    this.abstractsMap[descriptor.originalName] = {
                        name: descriptor.name,
                        source: descriptor.sourceName,
                        isStatic: descriptor.isStatic,
                        type: descriptor.type
                    };
                }
                this[keyType][keyName] = descriptor;
            }
        }
    }

    addInterface(metadata) {
        if (metadata && metadata instanceof this.constructor) {
            for (const name in metadata.constants) {
                if (name in this.constants && this.constants[name].uuid !== metadata.constants[name].uuid) {
                    throw new SyntaxExtenderMetadataOverrideConstantsError(
                        this.constants[name].sourceName,
                        name,
                        metadata.constants[name].sourceName
                    );
                }
                this.constants[name] = {
                    value: metadata.constants[name].value,
                    sourceName: metadata.constants[name].sourceName,
                    uuid: metadata.constants[name].uuid
                };
            }

            for (let x = 0; x < metadata.interfaces.length; x++) {
                const uuid = metadata.interfaces[x];
                if (this.interfaces.indexOf(uuid) === -1) {
                    this.interfaces.push(uuid);
                }
            }
            const toInherits = [pluralize(PROPERTY), pluralize(METHOD), pluralize(GETTER), pluralize(SETTER)];
            for (let x = 0; x < toInherits.length; x++) {
                const type = toInherits[x];
                for (const [key, value] of Object.entries(metadata[type])) {
                    this.add(value.clone());
                }
            }
            if (this.interfaces.indexOf(metadata.uuid) === -1) {
                this.interfaces.push(metadata.uuid);
            }
        }
    }

    get(type, name) {
        if (type && name) {
            type = pluralize(type);
            return (this[type] && this[type][name]) || null;
        }
    }

    getAbstracts() {
        const toCheck = [pluralize(METHOD), pluralize(GETTER), pluralize(SETTER)];
        const founded = [];
        for (let x = 0; x < toCheck.length; x++) {
            const key = toCheck[x];
            Object.values(this[key]).forEach(item => {
                if (item.isAbstract) {
                    founded.push(item);
                }
            });
        }
        return founded;
    }

    inherit(metadata) {
        if (metadata && metadata instanceof this.constructor) {
            if (metadata.hasNativePrivate) {
                this.nativePrivatesMap[metadata.uuid] = metadata.name;
            }

            for (let x = 0; x < metadata.interfaces.length; x++) {
                const uuid = metadata.interfaces[x];
                if (this.interfaces.indexOf(uuid) === -1) {
                    this.interfaces.push(uuid);
                }
            }
            for (const name in metadata.constants) {
                if (name in this.constants && this.constants[name].uuid !== metadata.constants[name].uuid) {
                    throw new SyntaxExtenderMetadataOverrideConstantsError(
                        this.constants[name].sourceName,
                        name,
                        metadata.constants[name].sourceName
                    );
                }
                this.constants[name] = {
                    value: metadata.constants[name].value,
                    sourceName: metadata.constants[name].sourceName,
                    uuid: metadata.constants[name].uuid
                };
            }
            const toInherits = [pluralize(PROPERTY), pluralize(METHOD), pluralize(GETTER), pluralize(SETTER)];
            for (let x = 0; x < toInherits.length; x++) {
                const type = toInherits[x];
                for (const [key, value] of Object.entries(metadata[type])) {
                    this.add(value.clone());
                }
            }
        }
    }

    inspect() {
        return util.inspect(this.toObject(), { showHidden: false, depth: null });
    }

    toObject() {
        return {
            uuid: this.uuid,
            type: this.type,
            name: this.name,
            features: this.featuresEnabled,
            namespace: this.namespace,
            moduleId: this.moduleId,
            interfaces: this.interfaces,
            constants: this.constants,
            [pluralize(PROPERTY)]: Object.keys(this[pluralize(PROPERTY)]).reduce((carry, key) => {
                carry[key] = this[pluralize(PROPERTY)][key].toObject();
                return carry;
            }, {}),
            [pluralize(METHOD)]: Object.keys(this[pluralize(METHOD)]).reduce((carry, key) => {
                carry[key] = this[pluralize(METHOD)][key].toObject();
                return carry;
            }, {}),
            [pluralize(GETTER)]: Object.keys(this[pluralize(GETTER)]).reduce((carry, key) => {
                carry[key] = this[pluralize(GETTER)][key].toObject();
                return carry;
            }, {}),
            [pluralize(SETTER)]: Object.keys(this[pluralize(SETTER)]).reduce((carry, key) => {
                carry[key] = this[pluralize(SETTER)][key].toObject();
                return carry;
            }, {})
        };
    }
}

Object.seal(Metadata);

module.exports = Metadata;
