'use strict';

const { ANONYMOUS, STRIP_ALL_COMMENTS, ALL_SPACES } = require('./constants');

const {
    isFunction,
    isConstructorFunction,
    isString,
    isClass,
    extractParametersString,
    extractTypeCastingFromComment,
    getSedefEnv
} = require('./utils');

const {
    getTypeCastingByDefinition,
    adaptDefinitionsFromParametersCommentString,
    isValidTypeCasting
} = require('./type-casting');

const Parameters = require('./models/parameters');
const Definitions = require('./models/definitions');

const SyntaxExtenderExtractParameterDestructeredVariadicError = require('../errors/extract-parameters/syntax-extender-extract-parameter-destructered-variadic-error');
const SyntaxExtenderExtractParameterAvoidCustomTypeDestructuredDefinitionError = require('../errors/extract-parameters/syntax-extender-extract-parameter-avoid-custom-type-destructured-definition-error');
const SyntaxExtenderExtractParameterDestructeredInternalVariadicError = require('../errors/extract-parameters/syntax-extender-extract-parameter-destructered-internal-variadic-error');
const SyntaxExtenderExtractParameterDestructeredDefinitionError = require('../errors/extract-parameters/syntax-extender-extract-parameter-destructered-definition-error');
const SyntaxExtenderTypeCastingError = require('../errors/type-casting/syntax-extender-type-casting-error');
const SyntaxExtenderExtractParameterError = require('../errors/extract-parameters/syntax-extender-extract-parameter-error');
const SyntaxExtenderExtractParametersError = require('../errors/extract-parameters/syntax-extender-extract-parameters-error');
const SyntaxExtenderNotValidArgumentError = require('../errors/syntax-extender-not-valid-argument-error');
const SyntaxExtenderExtractParameterDefaultValueNullError = require('../errors/extract-parameters/syntax-extender-extract-parameter-default-value-null-error');
const SyntaxExtenderExtractParameterDefaultValueTypeMismatchError = require('../errors/extract-parameters/syntax-extender-extract-parameter-default-value-type-mismatch-error');
const SyntaxExtenderExtractParameterDefaultValueEvaluationError = require('../errors/extract-parameters/syntax-extender-extract-parameter-default-value-evaluation-error');

const extractDestructuredString = destructured => {
    let skip = 0;
    let start = 0;
    let beforeIsWildcard = false;
    let beforeIsSlash = false;
    let insideComment = false;
    for (let x = 0; x < destructured.length; x++) {
        if (!insideComment && beforeIsSlash && destructured[x] === '*') {
            insideComment = true;
            beforeIsWildcard = false;
            continue;
        }

        if (insideComment && beforeIsWildcard && destructured[x] === '/') {
            insideComment = false;
            beforeIsSlash = false;
            continue;
        }

        beforeIsWildcard = destructured[x] === '*';
        beforeIsSlash = destructured[x] === '/';

        if (insideComment) {
            continue;
        }

        if (destructured[x] === '{') {
            if (start == 0) {
                start = x + 1;
            } else {
                skip += 1;
            }
            continue;
        }
        if (destructured[x] === '}') {
            if (skip == 0 && start > 0) {
                return destructured.substring(start, x);
            } else {
                skip -= 1;
            }
            continue;
        }
    }

    return '';
};

const getParametersFromString = (
    parametersStr,
    definitions,
    key,
    sourceName,
    name,
    source,
    filepath,
    destructeredParam = null
) => {
    let rawParameters = [];

    let skip = 0;
    let start = 0;
    let beforeIsWildcard = false;
    let beforeIsSlash = false;
    let insideComment = false;

    for (let x = 0; x < parametersStr.length; x++) {
        if (x === parametersStr.length - 1 && parametersStr[x] !== ',') {
            rawParameters.push(parametersStr.substring(start, x + 1));
            continue;
        }
        // we skip ',' because you can set overcomma on parameter functions
        if (!insideComment && beforeIsSlash && parametersStr[x] === '*') {
            insideComment = true;
            beforeIsWildcard = false;
            continue;
        }

        if (insideComment && beforeIsWildcard && parametersStr[x] === '/') {
            insideComment = false;
            beforeIsSlash = false;
            continue;
        }

        beforeIsWildcard = parametersStr[x] === '*';
        beforeIsSlash = parametersStr[x] === '/';

        if (insideComment) {
            continue;
        }

        if (parametersStr[x] === '{') {
            skip += 1;
            continue;
        }
        if (parametersStr[x] === '}') {
            skip -= 1;
            continue;
        }

        if (skip === 0 && parametersStr[x] === ',') {
            rawParameters.push(parametersStr.substring(start, x));
            start = x + 1;
        }
    }

    const requiredPositions = [];
    const destructuredPositions = [];
    const validatePositions = [];
    const parameters = new Parameters();

    rawParameters.forEach((param, index) => {
        let beautifiedParam = param.replace(STRIP_ALL_COMMENTS, '');
        const originalParam = beautifiedParam.trim();
        beautifiedParam = beautifiedParam.replace(ALL_SPACES, '');
        const definitionKey = `${destructeredParam !== null ? destructeredParam.index + '.' : ''}${index + 1}`;
        const isVariadic = beautifiedParam.startsWith('...');
        let destructuredStr = '';
        if ((isVariadic ? beautifiedParam.substring(3) : beautifiedParam).startsWith('{')) {
            destructuredStr = extractDestructuredString(param);
            param = param.replace(destructuredStr, 'destructured');
            beautifiedParam = beautifiedParam.replace(
                destructuredStr.replace(ALL_SPACES, '').replace(STRIP_ALL_COMMENTS, ''),
                'destructured'
            );
        }

        let [paramName, defaultValue] = param.split('=');
        // we find the real parameter name
        const beautifiedParamName = paramName.replace(ALL_SPACES, '').replace(STRIP_ALL_COMMENTS, '');
        // we detect the start position of parameter inside the string with comment
        const startParameter = paramName.indexOf(beautifiedParamName);
        // we detect the end position of parameter inside the string with comment
        const endParameter = startParameter + beautifiedParamName.length;
        // we detect only the position of comment after parameter not before
        const startComment = paramName.substring(endParameter).indexOf('/*');
        const commentString =
            startComment > -1
                ? extractTypeCastingFromComment(paramName.substring(endParameter).substring(startComment))
                : '';

        paramName = paramName.replace(ALL_SPACES, '').replace(STRIP_ALL_COMMENTS, '');
        defaultValue = isString(defaultValue) ? defaultValue.replace(STRIP_ALL_COMMENTS, '').trim() : '';
        const hasDefault = defaultValue.replace(ALL_SPACES, '') !== '';
        const isDestructured = destructuredStr !== '';

        adaptDefinitionsFromParametersCommentString(commentString, definitions, key, definitionKey);

        if (getSedefEnv('VALIDATION') == 'true' && isDestructured && isVariadic) {
            throw new SyntaxExtenderExtractParameterDestructeredVariadicError(sourceName, name, definitionKey);
        }

        let destructured = new Parameters();
        if (!hasDefault && !isVariadic) {
            requiredPositions.push(index);
        }

        paramName = isDestructured ? null : isVariadic ? paramName.substring(3) : paramName;

        let parameter;

        try {
            parameter = getTypeCastingByDefinition(
                definitions.getDefinition(key, definitionKey),
                source,
                true,
                filepath
            );
        } catch (error) {
            if (error instanceof SyntaxExtenderTypeCastingError) {
                error = new SyntaxExtenderExtractParameterError(
                    sourceName,
                    name,
                    definitionKey,
                    `parameter ${error.message}`
                );
            }
            throw error;
        }

        if (destructeredParam !== null && destructeredParam.type && parameter.type !== null) {
            throw new SyntaxExtenderExtractParameterAvoidCustomTypeDestructuredDefinitionError(
                sourceName,
                destructeredParam.name,
                destructeredParam.definitionKey,
                destructeredParam.type
            );
        }
        if (parameter.type !== null) {
            if (destructeredParam !== null && isVariadic) {
                throw new SyntaxExtenderExtractParameterDestructeredInternalVariadicError(
                    sourceName,
                    name,
                    definitionKey
                );
            }
            validatePositions.push(index);
        }

        definitions.removeDefinition(key, definitionKey);

        if (isDestructured) {
            if (parameter.type && parameter.isBuiltin && parameter.type !== 'dictionary') {
                throw new SyntaxExtenderExtractParameterDestructeredDefinitionError(sourceName, name, definitionKey);
            }

            if (parameter.type === null) {
                parameter.type = 'dictionary';
                parameter.isBuiltin = true;
                validatePositions.push(index);
            }

            destructured = getParametersFromString(
                destructuredStr,
                definitions,
                key,
                sourceName,
                name,
                source,
                filepath,
                {
                    type: parameter.type && !parameter.isBuiltin ? parameter.type || 'anonymous' : null,
                    index: index + 1,
                    definitionKey: definitionKey,
                    name: name || 'anonymous'
                }
            );

            if (
                parameter.type === null &&
                (destructured.validatePositions.length > 0 || destructured.requiredPositions.length > 0)
            ) {
                destructuredPositions.push(index);
            }
        }

        parameter.name = paramName;
        parameter.param = originalParam;
        parameter.variadic = isVariadic;
        parameter.hasDefault = hasDefault;

        if (
            getSedefEnv('CHECKDEFAULT') == 'true' &&
            parameter.type !== null &&
            parameter.hasDefault &&
            !(defaultValue.replace(ALL_SPACES, '') === 'null' || defaultValue.replace(ALL_SPACES, '') === 'undefined')
        ) {
            if (!parameter.isBuiltin) {
                throw new SyntaxExtenderExtractParameterDefaultValueNullError(
                    sourceName,
                    name,
                    definitionKey,
                    defaultValue
                );
            } else {
                try {
                    const context = { value: undefined };
                    new Function(`with(this) { value = ${defaultValue}; }`).call(context);

                    const types = parameter.type.split('|');
                    let isValidDefault = false;

                    for (let x = 0; x < types.length; x++) {
                        if (isValidTypeCasting(types[x], false, context.value)) {
                            isValidDefault = true;
                        }
                    }
                    if (!isValidDefault) {
                        throw new SyntaxExtenderExtractParameterDefaultValueTypeMismatchError(
                            sourceName,
                            name,
                            definitionKey,
                            defaultValue,
                            parameter.type
                        );
                    }
                } catch (error) {
                    if (error instanceof SyntaxExtenderExtractParameterError) {
                        throw error;
                    }

                    throw new SyntaxExtenderExtractParameterDefaultValueEvaluationError(
                        sourceName,
                        name,
                        definitionKey,
                        defaultValue,
                        error.message
                    );
                }
            }
        }

        if (!parameter.isNullable) {
            parameter.isNullable = defaultValue.replace(ALL_SPACES, '') === 'null';
        }
        parameter.destructured = destructured;

        parameters.add(parameter);
    });

    if (definitions.size(key) > 0) {
        throw new SyntaxExtenderExtractParametersError(
            sourceName,
            `definition of "${name}" parameters: [${definitions.keys(key).join(', ')}] does not exist.`
        );
    }

    parameters.requiredPositions = requiredPositions;
    parameters.validatePositions = validatePositions;
    parameters.isDestructured = destructeredParam !== null;
    if (parameters.isDestructured) {
        parameters.parentPosition = destructeredParam.index;
    }
    parameters.destructuredPositions = destructuredPositions;
    parameters.sourceName = sourceName;
    parameters.functionName = name;

    return parameters;
};

const extractParameters = (fn, definitions = null, key = '', name = ANONYMOUS, source = null, filepath = '') => {
    if (!isFunction(fn) || isClass(fn)) {
        throw new SyntaxExtenderNotValidArgumentError(
            `extractParameters(fn,definitions = null, key = '', name = ANONYMOUS, source = null, filepath = '') argument 1 must be a function.`
        );
    }
    if (definitions !== null && !(definitions instanceof Definitions)) {
        throw new SyntaxExtenderNotValidArgumentError(
            `extractParameters(fn,definitions = null, key = '', name = ANONYMOUS, source = null, filepath = '') argument 2 must be null or of Definitions type.`
        );
    }
    if (!isString(key)) {
        throw new SyntaxExtenderNotValidArgumentError(
            `extractParameters(fn,definitions = null, key = '', name = ANONYMOUS, source = null, filepath = '') argument 3 must be a string.`
        );
    }
    if (!isString(name)) {
        throw new SyntaxExtenderNotValidArgumentError(
            `extractParameters(fn,definitions = null, key = '', name = ANONYMOUS, source = null, filepath = '') argument 4 must be a string.`
        );
    }
    if (source !== null && !isConstructorFunction(source)) {
        throw new SyntaxExtenderNotValidArgumentError(
            `extractParameters(fn,definitions = null, key = '', name = ANONYMOUS, source = null, filepath = '') argument 5 must be null or a Constructor function.`
        );
    }
    if (!isString(filepath)) {
        throw new SyntaxExtenderNotValidArgumentError(
            `extractParameters(fn,definitions = null, key = '', name = ANONYMOUS, source = null, filepath = '') argument 6 must be a string.`
        );
    }

    const sourceName = (source && source.name) || ANONYMOUS;

    definitions = definitions || new Definitions();

    const parametersStr = extractParametersString(fn, getSedefEnv('COMMENT') != 'false');

    return getParametersFromString(parametersStr, definitions, key, sourceName, name, source, filepath);
};

module.exports = extractParameters;
