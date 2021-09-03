'use strict';

const { isConstructorFunction, isBuiltinObject, hasNativeExtends, isClass } = require('./utils');

const SyntaxExtenderInheritanceError = require('../errors/inheritance/syntax-extender-inheritance-error');
const SyntaxExtenderNotValidArgumentError = require('../errors/syntax-extender-not-valid-argument-error');

const extractInherited = source => {
    if (!isConstructorFunction(source)) {
        throw new SyntaxExtenderNotValidArgumentError(
            'extractInherited(source, excludeFirst = true, callback = null) argument 1 must be a constructor function.'
        );
    }

    if (isClass(source) && hasNativeExtends(source)) {
        try {
            const inherit = Object.getPrototypeOf(source);

            if (isConstructorFunction(inherit) && !isBuiltinObject(inherit)) {
                return inherit;
            }
        } catch (error) {
            throw new SyntaxExtenderInheritanceError(error.message);
        }
    }

    return null;
};

module.exports = extractInherited;
