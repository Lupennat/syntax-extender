'use strict';

const { ANONYMOUS, PROMISE, ITERABLE } = require('./constants');

const { isConstructorFunction, isFunction, isGeneratorFunction, isIterable, isArray } = require('./utils');
const { isValidTypeCasting } = require('./type-casting');

const Return = require('./models/return');

const SyntaxExtenderNotValidArgumentError = require('../errors/syntax-extender-not-valid-argument-error');
const SyntaxExtenderValidateReturnNotValidReturnError = require('../errors/validate-return/syntax-extender-validate-return-not-valid-return-error');

const validateTypeCastingValue = (sourceName, functionName, returnDefinition, value, mustBe = '', checkNull = '') => {
    let types = returnDefinition.type.split('|');
    let error = true;
    for (let x = 0; x < types.length; x++) {
        const type = types[x];
        if (
            isValidTypeCasting(
                mustBe === PROMISE ? 'promise' : mustBe === ITERABLE ? 'iterable' : type,
                false,
                value,
                checkNull === PROMISE
                    ? returnDefinition.isNullablePromise
                    : checkNull === ITERABLE
                    ? returnDefinition.isNullableIterable
                    : returnDefinition.isNullable,
                returnDefinition.source
            )
        ) {
            error = false;
            break;
        }
    }
    if (error) {
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

        throw new SyntaxExtenderValidateReturnNotValidReturnError(
            sourceName,
            functionName,
            returnDefinition.toError(),
            given
        );
    }
};

const createPromiseInterceptor = (sourceName, functionName, returnDefinition, value, checkIterator) => {
    if (value && value.then && isFunction(value.then)) {
        return new Promise((resolve, reject) => {
            value
                .then(res => {
                    if (res !== null && checkIterator) {
                        res = createIterableInterceptor(sourceName, functionName, returnDefinition, res, false);
                    } else {
                        validateTypeCastingValue(sourceName, functionName, returnDefinition, res, '', PROMISE);
                    }

                    resolve(res);
                })
                .catch(error => {
                    reject(error);
                });
        });
    } else {
        validateTypeCastingValue(sourceName, functionName, returnDefinition, value, PROMISE);
    }

    return value;
};

const createIterableInterceptor = (sourceName, functionName, returnDefinition, value) => {
    if (isArray(value)) {
        for (let val of value) {
            validateTypeCastingValue(sourceName, functionName, returnDefinition, val, '', ITERABLE);
        }
    } else if (isIterable(value)) {
        const original = value[Symbol.iterator];
        value[Symbol.iterator] = function* (...args) {
            for (let val of original.call(this, ...args)) {
                validateTypeCastingValue(sourceName, functionName, returnDefinition, val, '', ITERABLE);
                yield val;
            }
        };
    } else if (value && isGeneratorFunction(value)) {
        return function* (...args) {
            for (let val of value.call(value, ...args)) {
                validateTypeCastingValue(sourceName, functionName, returnDefinition, val, '', ITERABLE);
                yield val;
            }
        };
    } else {
        validateTypeCastingValue(sourceName, functionName, returnDefinition, value, ITERABLE);
    }

    return value;
};

const validateReturn = (returnDefinition, value) => {
    if (!returnDefinition || !(returnDefinition instanceof Return)) {
        throw new SyntaxExtenderNotValidArgumentError(
            'validateReturn(returnDefinition, value) argument 1 must be a "Return" Object.'
        );
    }

    const sourceName = returnDefinition.sourceName;
    const functionName = returnDefinition.functionName;

    if (returnDefinition.type) {
        if (returnDefinition.checkPromise) {
            value = createPromiseInterceptor(
                sourceName,
                functionName,
                returnDefinition,
                value,
                returnDefinition.checkIterable
            );
        } else if (returnDefinition.checkIterable) {
            value = createIterableInterceptor(sourceName, functionName, returnDefinition, value);
        } else {
            validateTypeCastingValue(sourceName, functionName, returnDefinition, value);
        }
    }

    return value;
};

module.exports = validateReturn;
