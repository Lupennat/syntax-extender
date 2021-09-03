'use strict';

const { PROPERTY } = require('./constants');

const { isIterableTypeCasting } = require('./type-casting');

const Descriptor = require('./models/descriptor');

const SyntaxExtenderValidateCompatibilityRefuseCompareError = require('../errors/validate-compatibility/syntax-extender-validate-compatibility-refuse-compare-error');
const SyntaxExtenderNotValidArgumentError = require('../errors/syntax-extender-not-valid-argument-error');
const SyntaxExtenderValidateCompatibilityRefuseCompareTypeError = require('../errors/validate-compatibility/syntax-extender-validate-compatibility-refuse-compare-type-error');
const SyntaxExtenderValidateCompatibilityRefuseComparePropertiesError = require('../errors/validate-compatibility/syntax-extender-validate-compatibility-refuse-compare-properties-error');
const SyntaxExtenderValidateCompatibilityRefuseCompareStaticError = require('../errors/validate-compatibility/syntax-extender-validate-compatibility-refuse-compare-static-error');
const SyntaxExtenderValidateCompatibilityNotCompatibleError = require('../errors/validate-compatibility/syntax-extender-validate-compatibility-not-compatible-error');

const getSyntaxExtenderValidateCompatibilityNotCompatibleError = (descriptor, inheritDescriptor) => {
    return new SyntaxExtenderValidateCompatibilityNotCompatibleError(
        descriptor.isStatic,
        descriptor.name,
        descriptor.sourceName,
        descriptor.parameters.toOriginal(),
        descriptor.return.toOriginal(),
        inheritDescriptor.sourceName,
        inheritDescriptor.parameters.toOriginal(),
        inheritDescriptor.return.toOriginal()
    );
};

const validateCompatibility = (descriptor, inheritDescriptor) => {
    if (!descriptor || !(descriptor instanceof Descriptor)) {
        throw new SyntaxExtenderNotValidArgumentError(
            `validateCompatibility(descriptor, inheritDescriptor) argument 1 must be a "Descriptor" Object.`
        );
    }
    if (!inheritDescriptor || !(inheritDescriptor instanceof Descriptor)) {
        throw new SyntaxExtenderNotValidArgumentError(
            `validateCompatibility(descriptor, inheritDescriptor) argument 2 must be a "Descriptor" Object.`
        );
    }

    if (descriptor.type !== inheritDescriptor.type) {
        throw new SyntaxExtenderValidateCompatibilityRefuseCompareTypeError(
            descriptor.sourceName,
            descriptor.type,
            descriptor.name,
            descriptor.parameters.toOriginal(),
            descriptor.return.toOriginal(),
            inheritDescriptor.sourceName,
            inheritDescriptor.type,
            inheritDescriptor.name,
            inheritDescriptor.parameters.toOriginal(),
            inheritDescriptor.return.toOriginal()
        );
    }

    if (descriptor.type === PROPERTY) {
        throw new SyntaxExtenderValidateCompatibilityRefuseComparePropertiesError(
            descriptor.sourceName,
            descriptor.type,
            descriptor.name
        );
    }

    if (descriptor.name !== inheritDescriptor.name) {
        throw new SyntaxExtenderValidateCompatibilityRefuseCompareError(
            descriptor.sourceName,
            descriptor.name,
            descriptor.parameters.toOriginal(),
            descriptor.return.toOriginal(),
            inheritDescriptor.sourceName,
            inheritDescriptor.name,
            inheritDescriptor.parameters.toOriginal(),
            inheritDescriptor.return.toOriginal()
        );
    }

    if (descriptor.isStatic !== inheritDescriptor.isStatic) {
        throw new SyntaxExtenderValidateCompatibilityRefuseCompareStaticError(
            descriptor.sourceName,
            descriptor.type,
            descriptor.name,
            descriptor.parameters.toOriginal(),
            descriptor.return.toOriginal()
        );
    }

    const currentReturn = descriptor.return;
    const inheritReturn = inheritDescriptor.return;

    // if current type is not defined and inherit is defined throw error
    if (currentReturn.type === null && inheritReturn.type !== null) {
        throw getSyntaxExtenderValidateCompatibilityNotCompatibleError(descriptor, inheritDescriptor);
    }

    // if inherit return doesn't have type skip all other check
    if (inheritReturn.type !== null) {
        // if current is nullable and not inherit throw error
        if (!inheritReturn.isNullable && currentReturn.isNullable) {
            throw getSyntaxExtenderValidateCompatibilityNotCompatibleError(descriptor, inheritDescriptor);
        }

        // if current promise is nullable and not inherit promise throw error
        if (!inheritReturn.isNullablePromise && currentReturn.isNullablePromise) {
            throw getSyntaxExtenderValidateCompatibilityNotCompatibleError(descriptor, inheritDescriptor);
        }

        // if current iterable is nullable and not inherit iterable throw error
        if (!inheritReturn.isNullableIterable && currentReturn.isNullableIterable) {
            throw getSyntaxExtenderValidateCompatibilityNotCompatibleError(descriptor, inheritDescriptor);
        }

        // if builtin mismatch we can throw error without other check
        if (currentReturn.isBuiltin !== inheritReturn.isBuiltin) {
            throw getSyntaxExtenderValidateCompatibilityNotCompatibleError(descriptor, inheritDescriptor);
        }

        let skip = false;
        // if inherit is defined as promise and current check the value of promise we can skip
        if (inheritReturn.type === 'promise' && currentReturn.checkPromise) {
            skip = true;
        }
        // if inherit is defined as iterable and current check the value of iterable we can skip
        if (isIterableTypeCasting(inheritReturn.type) && currentReturn.checkIterable) {
            skip = true;
        }

        if (!skip) {
            // if inherit is a promise and not current throw error
            if (inheritReturn.checkPromise && !currentReturn.checkPromise) {
                throw getSyntaxExtenderValidateCompatibilityNotCompatibleError(descriptor, inheritDescriptor);
            }

            // if iterable is mismatched throw an error
            if (inheritReturn.checkIterable !== currentReturn.checkIterable) {
                throw getSyntaxExtenderValidateCompatibilityNotCompatibleError(descriptor, inheritDescriptor);
            }

            if (currentReturn.isBuiltin) {
                const returnTypes = currentReturn.type.split('|');
                const inheritReturnTypes = inheritReturn.type.split('|');
                // check all union types and throw error if at least one current is missing
                if (returnTypes.length > inheritReturnTypes.length) {
                    throw getSyntaxExtenderValidateCompatibilityNotCompatibleError(descriptor, inheritDescriptor);
                }
                for (let x = 0; x < returnTypes.length; x++) {
                    const type = returnTypes[x];
                    if (inheritReturnTypes.indexOf(type) === -1) {
                        throw getSyntaxExtenderValidateCompatibilityNotCompatibleError(descriptor, inheritDescriptor);
                    }
                }
            }

            if (inheritReturn.source !== null) {
                // if source mismatch and inherit is not a prototype of current throw error
                try {
                    if (
                        currentReturn.source !== inheritReturn.source &&
                        !inheritReturn.source.isPrototypeOf(currentReturn.source)
                    ) {
                        throw getSyntaxExtenderValidateCompatibilityNotCompatibleError(descriptor, inheritDescriptor);
                    }
                } catch (error) {
                    throw getSyntaxExtenderValidateCompatibilityNotCompatibleError(descriptor, inheritDescriptor);
                }
            }
        }
    }

    const currentLength = descriptor.parameters.size();
    const inheritLength = inheritDescriptor.parameters.size();
    if (currentLength !== inheritLength) {
        // if current parameters < inherit parameters throw error
        // if current parameters > inherit parameters throw error only if new parameters
        // do not have default value
        if (currentLength > inheritLength) {
            const start = currentLength - inheritLength;
            descriptor.parameters
                .all()
                .slice(-start)
                .forEach(i => {
                    if (!i.hasDefault) {
                        throw getSyntaxExtenderValidateCompatibilityNotCompatibleError(descriptor, inheritDescriptor);
                    }
                });
        } else {
            throw getSyntaxExtenderValidateCompatibilityNotCompatibleError(descriptor, inheritDescriptor);
        }
    } else {
        for (let x = 0; x < descriptor.parameters.size(); x++) {
            const param = descriptor.parameters.get(x);
            const inheritParam = inheritDescriptor.parameters.get(x);

            // if inherit has default and not current throw error
            if (!param.hasDefault && inheritParam.hasDefault) {
                throw getSyntaxExtenderValidateCompatibilityNotCompatibleError(descriptor, inheritDescriptor);
            }

            // if inherit is nullable and not current throw error
            if (!param.isNullable && inheritParam.isNullable) {
                throw getSyntaxExtenderValidateCompatibilityNotCompatibleError(descriptor, inheritDescriptor);
            }

            // if inherit promise is nullable and not current promise throw error
            if (!param.isNullablePromise && inheritParam.isNullablePromise) {
                throw getSyntaxExtenderValidateCompatibilityNotCompatibleError(descriptor, inheritDescriptor);
            }

            // if inherit iterable is nullable and not current iterable throw error
            if (!param.isNullableIterable && inheritParam.isNullableIterable) {
                throw getSyntaxExtenderValidateCompatibilityNotCompatibleError(descriptor, inheritDescriptor);
            }

            // if variadic mismatch throw error
            if (param.variadic !== inheritParam.variadic) {
                throw getSyntaxExtenderValidateCompatibilityNotCompatibleError(descriptor, inheritDescriptor);
            }

            // if inherit type is not defined and current is defined throw error
            if (inheritParam.type === null && param.type !== null) {
                throw getSyntaxExtenderValidateCompatibilityNotCompatibleError(descriptor, inheritDescriptor);
            }

            // if current parameter doesn't have type skip all other check
            if (param.type === null) {
                continue;
            }

            // if current is defined as promise and inherit check the value of promise we can skip
            if (param.type === 'promise' && inheritParam.checkPromise) {
                continue;
            }

            // if current is defined as iterable and inherit check the value of iterable we can skip
            if (isIterableTypeCasting(param.type) && inheritParam.checkIterable) {
                continue;
            }

            // if current is a promise and not inherit throw error
            if (param.checkPromise && !inheritParam.checkPromise) {
                throw getSyntaxExtenderValidateCompatibilityNotCompatibleError(descriptor, inheritDescriptor);
            }

            // if iterable is mismatched throw an error
            if (param.checkIterable !== inheritParam.checkIterable) {
                throw getSyntaxExtenderValidateCompatibilityNotCompatibleError(descriptor, inheritDescriptor);
            }

            // if builtin mismatch we can throw error without other check
            if (param.isBuiltin !== inheritParam.isBuiltin) {
                throw getSyntaxExtenderValidateCompatibilityNotCompatibleError(descriptor, inheritDescriptor);
            }

            if (param.isBuiltin) {
                const paramTypes = param.type.split('|');
                const inheritParamTypes = inheritParam.type.split('|');

                // check all union types and throw error if at least one inherit is missing
                if (inheritParamTypes.length > paramTypes.length) {
                    throw getSyntaxExtenderValidateCompatibilityNotCompatibleError(descriptor, inheritDescriptor);
                }
                for (let x = 0; x < inheritParamTypes.length; x++) {
                    const type = inheritParamTypes[x];
                    if (paramTypes.indexOf(type) === -1) {
                        throw getSyntaxExtenderValidateCompatibilityNotCompatibleError(descriptor, inheritDescriptor);
                    }
                }
            }
            if (param.source !== null) {
                // if source mismatch and current is not a prototype of inherit throw error
                try {
                    if (param.source !== inheritParam.source && !param.source.isPrototypeOf(inheritParam.source)) {
                        throw getSyntaxExtenderValidateCompatibilityNotCompatibleError(descriptor, inheritDescriptor);
                    }
                } catch (error) {
                    throw getSyntaxExtenderValidateCompatibilityNotCompatibleError(descriptor, inheritDescriptor);
                }
            }
        }
    }

    return true;
};

module.exports = validateCompatibility;
