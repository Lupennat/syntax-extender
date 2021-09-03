'use strict';

const { ANONYMOUS, PROMISE, ITERABLE } = require('./constants');

const { isConstructorFunction, isFunction, isGeneratorFunction, isIterable, isArray } = require('./utils');
const { isValidTypeCasting } = require('./type-casting');

const Parameters = require('./models/parameters');

const SyntaxExtenderValidateParametersMissingDestructuredPropertyError = require('../errors/validate-parameters/syntax-extender-validate-parameter-missing-destructured-property-error');
const SyntaxExtenderValidateParametersMissingParameterError = require('../errors/validate-parameters/syntax-extender-validate-parameter-missing-parameter-error');
const SyntaxExtenderValidateParametersNotValidDestructuredPropertyError = require('../errors/validate-parameters/syntax-extender-validate-parameter-not-valid-destructured-property-error');
const SyntaxExtenderValidateParametersNotValidParameterError = require('../errors/validate-parameters/syntax-extender-validate-parameter-not-valid-parameter-error');
const SyntaxExtenderNotValidArgumentError = require('../errors/syntax-extender-not-valid-argument-error');

const validateTypeCastingValue = (
    sourceName,
    functionName,
    isDestructured,
    parameter,
    parentPosition,
    pos,
    value,
    mustBe = '',
    checkNull = ''
) => {
    let types = parameter.type.split('|');
    let error = true;
    for (let x = 0; x < types.length; x++) {
        const type = types[x];

        if (
            isValidTypeCasting(
                mustBe === PROMISE ? 'promise' : mustBe === ITERABLE ? 'iterable' : type,
                parameter.hasDefault,
                value,
                checkNull === PROMISE
                    ? parameter.isNullablePromise
                    : checkNull === ITERABLE
                    ? parameter.isNullableIterable
                    : parameter.isNullable,
                parameter.source
            )
        ) {
            error = false;
            break;
        }
    }
    if (error) {
        let source = parameter.toError();
        let given =
            value === null
                ? null
                : typeof value !== 'object'
                ? typeof value
                : value.constructor && isConstructorFunction(value.constructor)
                ? value.constructor.name || `${ANONYMOUS} class`
                : isConstructorFunction(value)
                ? value.name || `${ANONYMOUS} class`
                : 'object';
        if (isDestructured) {
            throw new SyntaxExtenderValidateParametersNotValidDestructuredPropertyError(
                sourceName,
                functionName,
                parentPosition,
                pos,
                source,
                given
            );
        } else {
            throw new SyntaxExtenderValidateParametersNotValidParameterError(
                sourceName,
                functionName,
                pos,
                source,
                given
            );
        }
    }
};

const createPromiseInterceptor = (
    sourceName,
    functionName,
    isDestructured,
    parameter,
    parentPosition,
    pos,
    value,
    checkIterator
) => {
    if (value && value.then && isFunction(value.then)) {
        return new Promise((resolve, reject) => {
            value
                .then(res => {
                    if (res !== null && checkIterator) {
                        res = createIterableInterceptor(
                            sourceName,
                            functionName,
                            isDestructured,
                            parameter,
                            parentPosition,
                            pos,
                            res,
                            false
                        );
                    } else {
                        validateTypeCastingValue(
                            sourceName,
                            functionName,
                            isDestructured,
                            parameter,
                            parentPosition,
                            pos,
                            res,
                            '',
                            PROMISE
                        );
                    }

                    resolve(res);
                })
                .catch(error => {
                    reject(error);
                });
        });
    } else {
        validateTypeCastingValue(
            sourceName,
            functionName,
            isDestructured,
            parameter,
            parentPosition,
            pos,
            value,
            PROMISE
        );
    }

    return value;
};

const createIterableInterceptor = (sourceName, functionName, isDestructured, parameter, parentPosition, pos, value) => {
    if (isArray(value)) {
        for (let val of value) {
            validateTypeCastingValue(
                sourceName,
                functionName,
                isDestructured,
                parameter,
                parentPosition,
                pos,
                val,
                '',
                ITERABLE
            );
        }
    } else if (isIterable(value)) {
        const original = value[Symbol.iterator];
        value[Symbol.iterator] = function* (...args) {
            for (let val of original.call(this, ...args)) {
                validateTypeCastingValue(
                    sourceName,
                    functionName,
                    isDestructured,
                    parameter,
                    parentPosition,
                    pos,
                    val,
                    '',
                    ITERABLE
                );
                yield val;
            }
        };
    } else if (value && isGeneratorFunction(value)) {
        return function* (...args) {
            for (let val of value.call(value, ...args)) {
                validateTypeCastingValue(
                    sourceName,
                    functionName,
                    isDestructured,
                    parameter,
                    parentPosition,
                    pos,
                    val,
                    '',
                    ITERABLE
                );
                yield val;
            }
        };
    } else {
        validateTypeCastingValue(
            sourceName,
            functionName,
            isDestructured,
            parameter,
            parentPosition,
            pos,
            value,
            ITERABLE
        );
    }

    return value;
};

const validateParameters = (parameters, ...values) => {
    if (!parameters || !(parameters instanceof Parameters)) {
        throw new SyntaxExtenderNotValidArgumentError(
            'validateParameters(parameters, ...values) argument 1 must be a "Parameters" Object.'
        );
    }

    const requiredPositions = parameters.requiredPositions;
    const validatePositions = parameters.validatePositions;
    const destructuredPositions = parameters.destructuredPositions;
    const isDestructured = parameters.isDestructured;
    const sourceName = parameters.sourceName;
    const functionName = parameters.functionName;
    const parentPosition = parameters.parentPosition;

    if (isDestructured) {
        for (let x = 0; x < requiredPositions.length; x++) {
            const param = parameters.get(requiredPositions[x]);
            const name = param.name;
            if (!(name in values[0])) {
                throw new SyntaxExtenderValidateParametersMissingDestructuredPropertyError(
                    sourceName,
                    functionName,
                    parentPosition,
                    name
                );
            }
        }
    } else {
        for (let x = 0; x < requiredPositions.length; x++) {
            if (values.length < requiredPositions[x] + 1) {
                throw new SyntaxExtenderValidateParametersMissingParameterError(
                    sourceName,
                    functionName,
                    requiredPositions[x] + 1
                );
            }
        }
    }

    for (let x = 0; x < validatePositions.length; x++) {
        const index = validatePositions[x];
        const parameter = parameters.get(index);
        let value;
        let pos;
        if (isDestructured) {
            pos = parameter.name;
            value = values[0][pos];
            if (parameter.variadic) {
                // variadic on destructured is forbidden
                value = [];
            } else {
                value = [value];
            }
        } else {
            value = values[index];
            pos = index + 1;
            if (parameter.variadic) {
                if (parameter.destructured.size() > 0) {
                    // destructured parameter variadic is forbidden
                    value = [];
                } else {
                    value = values.slice(index);
                }
            } else {
                value = [value];
            }
        }

        for (let y = 0; y < value.length; y++) {
            const val = value[y];

            if (parameter.checkPromise) {
                const promise = createPromiseInterceptor(
                    sourceName,
                    functionName,
                    isDestructured,
                    parameter,
                    parentPosition,
                    pos,
                    val,
                    parameter.checkIterable
                );
                if (isDestructured) {
                    values[0][pos] = promise;
                } else {
                    values[y] = promise;
                }
            } else if (parameter.checkIterable) {
                const iterator = createIterableInterceptor(
                    sourceName,
                    functionName,
                    isDestructured,
                    parameter,
                    parentPosition,
                    pos,
                    val,
                    value
                );
                if (isDestructured) {
                    values[0][pos] = iterator;
                } else {
                    values[y] = iterator;
                }
            } else {
                validateTypeCastingValue(sourceName, functionName, isDestructured, parameter, parentPosition, pos, val);
            }
        }

        if (parameter.destructured.size() > 0) {
            for (let y = 0; y < value.length; y++) {
                value[y] = validateParameters(parameter.destructured, value[y]);
            }
        }
    }

    for (let x = 0; x < destructuredPositions.length; x++) {
        const index = destructuredPositions[x];
        const parameter = parameters[index];
        const value = values[index];
        if (parameter.destructured.size() > 0) {
            values[index] = validateParameters(parameter.destructured, value);
        }
    }

    return values;
};

module.exports = validateParameters;
