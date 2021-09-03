'use strict';

const { ANONYMOUS, CONSTRUCT } = require('./constants');

const {
    isConstructorFunction,
    isString,
    isFunction,
    isClass,
    isAsyncFunction,
    isGeneratorFunction,
    getSedefEnv
} = require('./utils');

const { getTypeCastingByDefinition, adaptDefinitionsFromReturnCommentString } = require('./type-casting');

const Return = require('./models/return');
const Definitions = require('./models/definitions');

const SyntaxExtenderNotValidArgumentError = require('../errors/syntax-extender-not-valid-argument-error');
const SyntaxExtenderExtractReturnForbiddenError = require('../errors/extract-return/syntax-extender-extract-return-forbidden-error');
const SyntaxExtenderTypeCastingError = require('../errors/type-casting/syntax-extender-type-casting-error');
const SyntaxExtenderExtractReturnError = require('../errors/extract-return/syntax-extender-extract-return-error');
const SyntaxExtenderExtractReturnAsyncDefinitionError = require('../errors/extract-return/syntax-extender-extract-return-async-definition-error');
const SyntaxExtenderExtractReturnIterableDefinitionError = require('../errors/extract-return/syntax-extender-extract-return-iterable-definition-error');
const SyntaxExtenderExtractReturnAsyncIterableDefinitionError = require('../errors/extract-return/syntax-extender-extract-return-async-iterable-definition-error');

const extractReturn = (fn, definitions = null, key = '', name = ANONYMOUS, source = null, filepath = '') => {
    if (!isFunction(fn) || isClass(fn)) {
        throw new SyntaxExtenderNotValidArgumentError(
            `extractReturn(fn, definitions = null, key = '', name = ANONYMOUS, source = null, filepath = '') argument 1 must be a function.`
        );
    }
    if (definitions !== null && !(definitions instanceof Definitions)) {
        throw new SyntaxExtenderNotValidArgumentError(
            `extractReturn(fn, definitions = null, key = '', name = ANONYMOUS, source = null, filepath = '') argument 2 must be null or of Definitions type.`
        );
    }
    if (!isString(key)) {
        throw new SyntaxExtenderNotValidArgumentError(
            `extractReturn(fn, definitions = null, key = '', name = ANONYMOUS, source = null, filepath = '') argument 3 must be a string.`
        );
    }
    if (!isString(name)) {
        throw new SyntaxExtenderNotValidArgumentError(
            `extractReturn(fn, definitions = null, key = '', name = ANONYMOUS, source = null, filepath = '') argument 4 must be a string.`
        );
    }
    if (source !== null && !isConstructorFunction(source)) {
        throw new SyntaxExtenderNotValidArgumentError(
            `extractReturn(fn, definitions = null, key = '', name = ANONYMOUS, source = null, filepath = '') argument 5 must be null or a Constructor function.`
        );
    }

    if (!isString(filepath)) {
        throw new SyntaxExtenderNotValidArgumentError(
            `extractReturn(fn, definitions = null, key = '', name = ANONYMOUS, source = null, filepath = '') argument 6 must be a string.`
        );
    }

    const isAsync = isAsyncFunction(fn);
    const isGenerator = isGeneratorFunction(fn);

    if (getSedefEnv('COMMENT') != 'false') {
        adaptDefinitionsFromReturnCommentString(fn, definitions, key);
    }

    definitions = definitions || new Definitions();

    let returnType = new Return();
    const sourceName = (source && source.name) || ANONYMOUS;

    try {
        returnType = getTypeCastingByDefinition(definitions.getDefinition(key, 'return'), source, false, filepath);
        definitions.removeDefinition(key, 'return');
    } catch (error) {
        if (error instanceof SyntaxExtenderTypeCastingError) {
            error = new SyntaxExtenderExtractReturnError(sourceName, name, `return ${error.message}`);
        }
        throw error;
    }

    if (isAsync && isGenerator) {
        if (returnType.type !== null) {
            if (returnType.type !== 'promise' && !returnType.checkPromise) {
                throw new SyntaxExtenderExtractReturnAsyncDefinitionError(sourceName, name, returnType.type);
            }

            if (returnType.checkPromise && returnType.type !== 'generator' && !returnType.checkIterable) {
                throw new SyntaxExtenderExtractReturnAsyncIterableDefinitionError(sourceName, name, returnType.type);
            }
        } else {
            returnType.type = 'generator';
            returnType.isBuiltin = true;
            returnType.checkPromise = true;
        }
    } else if (isAsync) {
        if (returnType.type !== null) {
            if (returnType.type !== 'promise' && !returnType.checkPromise) {
                throw new SyntaxExtenderExtractReturnAsyncDefinitionError(sourceName, name, returnType.type);
            }
        } else {
            returnType.type = 'promise';
            returnType.isBuiltin = true;
        }
    } else if (isGenerator) {
        if (returnType.type !== null) {
            if (returnType.type !== 'generator' && !returnType.checkIterable) {
                throw new SyntaxExtenderExtractReturnIterableDefinitionError(sourceName, name, returnType.type);
            }
        } else {
            returnType.type = 'generator';
            returnType.isBuiltin = true;
        }
    }

    returnType.sourceName = sourceName;
    returnType.functionName = name;

    if (getSedefEnv('MAGIC') == 'true' && returnType.type !== null && returnType.functionName === CONSTRUCT) {
        throw new SyntaxExtenderExtractReturnForbiddenError(returnType.sourceName, returnType.functionName);
    }

    return returnType;
};

module.exports = extractReturn;
