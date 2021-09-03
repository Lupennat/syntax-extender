'use strict';

const { isValidTypeCasting, getTypeCastingByDefinition } = require('../../core/type-casting');

const Parameter = require('../../core/models/parameter');
const Return = require('../../core/models/return');
const Definition = require('../../core/models/definition');

const SyntaxExtenderTypeCastingInvalidError = require('../../errors/type-casting/syntax-extender-type-casting-invalid-error');
const SyntaxExtenderTypeCastingWrongSourceTypeError = require('../../errors/type-casting/syntax-extender-type-casting-wrong-source-type-error');
const SyntaxExtenderNotValidArgumentError = require('../../errors/syntax-extender-not-valid-argument-error');
const SyntaxExtenderTypeCastingMultipleInvalidError = require('../../errors/type-casting/syntax-extender-type-casting-multiple-invalid-error');

class Obj {}
class Test {
    callable() {}
}
class ExtendedTest extends Test {}
class ExtendedTestAgain extends ExtendedTest {}
const promise = Promise.resolve();
const test = new Test();
const testExtended = new ExtendedTest();
const testExtendedAgain = new ExtendedTestAgain();
function ConstructFn() {}
const array = [];
const asyncFn = async () => {};
const bigint = BigInt(9007199254740991);
const boolean = true;
const date = new Date();
const dictionary = { test: true };
const float = 1.24;
const generator = function* () {
    yield 1;
    yield 2;
    yield 3;
};
const integer = 1;
const iterator = {
    *[Symbol.iterator]() {
        yield 1;
        yield 2;
        yield 3;
    }
};
const map = new Map();
const number = Number(100);
const object = new Obj();
const set = new Set();
const string = 'test';
const symbol = Symbol('test');
const weakmap = new WeakMap();
const weakset = new WeakSet();
const typedArray = new Int8Array(8);

module.exports = () => {
    it('works arguments validation', function () {
        expect(getTypeCastingByDefinition(null, null, false)).toBeInstanceOf(Return);
        expect(getTypeCastingByDefinition(null, null, true)).toBeInstanceOf(Parameter);
        let definition = new Definition();
        definition.type = 'array';
        expect(getTypeCastingByDefinition(definition, null, false)).toBeInstanceOf(Return);
        expect(() => {
            getTypeCastingByDefinition({}, null, null);
        }).toThrowError(SyntaxExtenderNotValidArgumentError);
        expect(() => {
            getTypeCastingByDefinition(definition, null, null);
        }).toThrowError(SyntaxExtenderNotValidArgumentError);
    });

    it('works get type casting by definition', function () {
        let definition = new Definition();
        definition.type = 'any';

        expect(getTypeCastingByDefinition(definition).toObject()).toEqual({
            type: null,
            isNullableIterable: false,
            isNullablePromise: false,
            isNullable: false,
            checkIterable: false,
            checkPromise: false,
            isBuiltin: true,
            source: null
        });
        definition.type = 'array';
        expect(getTypeCastingByDefinition(definition).toObject()).toEqual({
            type: 'array',
            isNullableIterable: false,
            isNullablePromise: false,
            isNullable: false,
            checkIterable: false,
            checkPromise: false,
            isBuiltin: true,
            source: null
        });
        definition.type = 'async';
        expect(getTypeCastingByDefinition(definition).toObject()).toEqual({
            type: 'async',
            isNullableIterable: false,
            isNullablePromise: false,
            isNullable: false,
            checkIterable: false,
            checkPromise: false,
            isBuiltin: true,
            source: null
        });
        definition.type = 'bigint';
        expect(getTypeCastingByDefinition(definition).toObject()).toEqual({
            type: 'bigint',
            isNullableIterable: false,
            isNullablePromise: false,
            isNullable: false,
            checkIterable: false,
            checkPromise: false,
            isBuiltin: true,
            source: null
        });
        definition.type = 'boolean';
        expect(getTypeCastingByDefinition(definition).toObject()).toEqual({
            type: 'boolean',
            isNullableIterable: false,
            isNullablePromise: false,
            isNullable: false,
            checkIterable: false,
            checkPromise: false,
            isBuiltin: true,
            source: null
        });
        definition.type = 'callable';
        expect(getTypeCastingByDefinition(definition).toObject()).toEqual({
            type: 'callable',
            isNullableIterable: false,
            isNullablePromise: false,
            isNullable: false,
            checkIterable: false,
            checkPromise: false,
            isBuiltin: true,
            source: null
        });
        definition.type = 'promise';
        expect(getTypeCastingByDefinition(definition).toObject()).toEqual({
            type: 'promise',
            isNullableIterable: false,
            isNullablePromise: false,
            isNullable: false,
            checkIterable: false,
            checkPromise: false,
            isBuiltin: true,
            source: null
        });
        definition.type = 'date';
        expect(getTypeCastingByDefinition(definition).toObject()).toEqual({
            type: 'date',
            isNullableIterable: false,
            isNullablePromise: false,
            isNullable: false,
            checkIterable: false,
            checkPromise: false,
            isBuiltin: true,
            source: null
        });
        definition.type = 'dictionary';
        expect(getTypeCastingByDefinition(definition).toObject()).toEqual({
            type: 'dictionary',
            isNullableIterable: false,
            isNullablePromise: false,
            isNullable: false,
            checkIterable: false,
            checkPromise: false,
            isBuiltin: true,
            source: null
        });
        definition.type = 'float';
        expect(getTypeCastingByDefinition(definition).toObject()).toEqual({
            type: 'float',
            isNullableIterable: false,
            isNullablePromise: false,
            isNullable: false,
            checkIterable: false,
            checkPromise: false,
            isBuiltin: true,
            source: null
        });
        definition.type = 'integer';
        expect(getTypeCastingByDefinition(definition).toObject()).toEqual({
            type: 'integer',
            isNullableIterable: false,
            isNullablePromise: false,
            isNullable: false,
            checkIterable: false,
            checkPromise: false,
            isBuiltin: true,
            source: null
        });
        definition.type = 'generator';
        expect(getTypeCastingByDefinition(definition).toObject()).toEqual({
            type: 'generator',
            isNullableIterable: false,
            isNullablePromise: false,
            isNullable: false,
            checkIterable: false,
            checkPromise: false,
            isBuiltin: true,
            source: null
        });
        definition.type = 'map';
        expect(getTypeCastingByDefinition(definition).toObject()).toEqual({
            type: 'map',
            isNullableIterable: false,
            isNullablePromise: false,
            isNullable: false,
            checkIterable: false,
            checkPromise: false,
            isBuiltin: true,
            source: null
        });
        definition.type = 'number';
        expect(getTypeCastingByDefinition(definition).toObject()).toEqual({
            type: 'number',
            isNullableIterable: false,
            isNullablePromise: false,
            isNullable: false,
            checkIterable: false,
            checkPromise: false,
            isBuiltin: true,
            source: null
        });
        definition.type = 'object';
        expect(getTypeCastingByDefinition(definition).toObject()).toEqual({
            type: 'object',
            isNullableIterable: false,
            isNullablePromise: false,
            isNullable: false,
            checkIterable: false,
            checkPromise: false,
            isBuiltin: true,
            source: null
        });
        definition.type = 'parent';
        expect(getTypeCastingByDefinition(definition, ExtendedTest).toObject()).toEqual({
            type: 'Test',
            isNullableIterable: false,
            isNullablePromise: false,
            isNullable: false,
            checkIterable: false,
            checkPromise: false,
            isBuiltin: false,
            source: Test
        });
        definition.type = 'self';
        expect(getTypeCastingByDefinition(definition, Test).toObject()).toEqual({
            type: 'Test',
            isNullableIterable: false,
            isNullablePromise: false,
            isNullable: false,
            checkIterable: false,
            checkPromise: false,
            isBuiltin: false,
            source: Test
        });
        definition.type = 'set';
        expect(getTypeCastingByDefinition(definition).toObject()).toEqual({
            type: 'set',
            isNullableIterable: false,
            isNullablePromise: false,
            isNullable: false,
            checkIterable: false,
            checkPromise: false,
            isBuiltin: true,
            source: null
        });
        definition.type = 'string';
        expect(getTypeCastingByDefinition(definition).toObject()).toEqual({
            type: 'string',
            isNullableIterable: false,
            isNullablePromise: false,
            isNullable: false,
            checkIterable: false,
            checkPromise: false,
            isBuiltin: true,
            source: null
        });
        definition.type = 'symbol';
        expect(getTypeCastingByDefinition(definition).toObject()).toEqual({
            type: 'symbol',
            isNullableIterable: false,
            isNullablePromise: false,
            isNullable: false,
            checkIterable: false,
            checkPromise: false,
            isBuiltin: true,
            source: null
        });
        definition.type = 'typedArray';
        expect(getTypeCastingByDefinition(definition).toObject()).toEqual({
            type: 'typedArray',
            isNullableIterable: false,
            isNullablePromise: false,
            isNullable: false,
            checkIterable: false,
            checkPromise: false,
            isBuiltin: true,
            source: null
        });
        definition.type = 'weakmap';
        expect(getTypeCastingByDefinition(definition).toObject()).toEqual({
            type: 'weakmap',
            isNullableIterable: false,
            isNullablePromise: false,
            isNullable: false,
            checkIterable: false,
            checkPromise: false,
            isBuiltin: true,
            source: null
        });
        definition.type = 'weakset';
        expect(getTypeCastingByDefinition(definition).toObject()).toEqual({
            type: 'weakset',
            isNullableIterable: false,
            isNullablePromise: false,
            isNullable: false,
            checkIterable: false,
            checkPromise: false,
            isBuiltin: true,
            source: null
        });
        definition.type = Test;
        expect(getTypeCastingByDefinition(definition).toObject()).toEqual({
            type: 'Test',
            isNullableIterable: false,
            isNullablePromise: false,
            isNullable: false,
            checkIterable: false,
            checkPromise: false,
            isBuiltin: false,
            source: Test
        });
        definition.type = ConstructFn;
        expect(getTypeCastingByDefinition(definition).toObject()).toEqual({
            type: 'ConstructFn',
            isNullableIterable: false,
            isNullablePromise: false,
            isNullable: false,
            checkIterable: false,
            checkPromise: false,
            isBuiltin: false,
            source: ConstructFn
        });
        definition.type =
            'array|async|bigint|boolean|callable|date|dictionary|float|integer|generator|map|number|object|set|string|symbol|typedArray|weakmap|weakset';
        expect(getTypeCastingByDefinition(definition).toObject()).toEqual({
            type: 'array|async|bigint|boolean|callable|date|dictionary|float|integer|generator|map|number|object|set|string|symbol|typedArray|weakmap|weakset',
            isNullableIterable: false,
            isNullablePromise: false,
            isNullable: false,
            checkIterable: false,
            checkPromise: false,
            isBuiltin: true,
            source: null
        });

        definition.type = 'any|integer|number|any|number|string';
        expect(getTypeCastingByDefinition(definition).toObject()).toEqual({
            type: 'integer|number|string',
            isNullableIterable: false,
            isNullablePromise: false,
            isNullable: false,
            checkIterable: false,
            checkPromise: false,
            isBuiltin: true,
            source: null
        });

        definition.type = array;
        expect(() => {
            getTypeCastingByDefinition(definition).toObject();
        }).toThrowError(SyntaxExtenderTypeCastingInvalidError);
        definition.type = asyncFn;
        expect(() => {
            getTypeCastingByDefinition(definition).toObject();
        }).toThrowError(SyntaxExtenderTypeCastingInvalidError);
        definition.type = bigint;
        expect(() => {
            getTypeCastingByDefinition(definition).toObject();
        }).toThrowError(SyntaxExtenderTypeCastingInvalidError);
        definition.type = boolean;
        expect(() => {
            getTypeCastingByDefinition(definition).toObject();
        }).toThrowError(SyntaxExtenderTypeCastingInvalidError);
        definition.type = test;
        expect(() => {
            getTypeCastingByDefinition(definition).toObject();
        }).toThrowError(SyntaxExtenderTypeCastingInvalidError);
        definition.type = () => {};
        expect(() => {
            getTypeCastingByDefinition(definition).toObject();
        }).toThrowError(SyntaxExtenderTypeCastingInvalidError);
        definition.type = date;
        expect(() => {
            getTypeCastingByDefinition(definition).toObject();
        }).toThrowError(SyntaxExtenderTypeCastingInvalidError);
        definition.type = dictionary;
        expect(() => {
            getTypeCastingByDefinition(definition).toObject();
        }).toThrowError(SyntaxExtenderTypeCastingInvalidError);
        definition.type = float;
        expect(() => {
            getTypeCastingByDefinition(definition).toObject();
        }).toThrowError(SyntaxExtenderTypeCastingInvalidError);
        definition.type = generator;
        expect(() => {
            getTypeCastingByDefinition(definition).toObject();
        }).toThrowError(SyntaxExtenderTypeCastingInvalidError);
        definition.type = generator();
        expect(() => {
            getTypeCastingByDefinition(definition).toObject();
        }).toThrowError(SyntaxExtenderTypeCastingInvalidError);
        definition.type = integer;
        expect(() => {
            getTypeCastingByDefinition(definition).toObject();
        }).toThrowError(SyntaxExtenderTypeCastingInvalidError);
        definition.type = iterator;
        expect(() => {
            getTypeCastingByDefinition(definition).toObject();
        }).toThrowError(SyntaxExtenderTypeCastingInvalidError);
        definition.type = map;
        expect(() => {
            getTypeCastingByDefinition(definition).toObject();
        }).toThrowError(SyntaxExtenderTypeCastingInvalidError);
        definition.type = number;
        expect(() => {
            getTypeCastingByDefinition(definition).toObject();
        }).toThrowError(SyntaxExtenderTypeCastingInvalidError);
        definition.type = object;
        expect(() => {
            getTypeCastingByDefinition(definition).toObject();
        }).toThrowError(SyntaxExtenderTypeCastingInvalidError);
        definition.type = set;
        expect(() => {
            getTypeCastingByDefinition(definition).toObject();
        }).toThrowError(SyntaxExtenderTypeCastingInvalidError);
        definition.type = string;
        expect(() => {
            getTypeCastingByDefinition(definition).toObject();
        }).toThrowError(SyntaxExtenderTypeCastingInvalidError);
        definition.type = symbol;
        expect(() => {
            getTypeCastingByDefinition(definition).toObject();
        }).toThrowError(SyntaxExtenderTypeCastingInvalidError);
        definition.type = weakmap;
        expect(() => {
            getTypeCastingByDefinition(definition).toObject();
        }).toThrowError(SyntaxExtenderTypeCastingInvalidError);
        definition.type = weakset;
        expect(() => {
            getTypeCastingByDefinition(definition).toObject();
        }).toThrowError(SyntaxExtenderTypeCastingInvalidError);
        definition.type = test;
        expect(() => {
            getTypeCastingByDefinition(definition).toObject();
        }).toThrowError(SyntaxExtenderTypeCastingInvalidError);
        definition.type = testExtended;
        expect(() => {
            getTypeCastingByDefinition(definition).toObject();
        }).toThrowError(SyntaxExtenderTypeCastingInvalidError);
        definition.type = testExtendedAgain;
        expect(() => {
            getTypeCastingByDefinition(definition).toObject();
        }).toThrowError(SyntaxExtenderTypeCastingInvalidError);
        definition.type = test;
        expect(() => {
            getTypeCastingByDefinition(definition).toObject();
        }).toThrowError(SyntaxExtenderTypeCastingInvalidError);
        definition.type = testExtended;
        expect(() => {
            getTypeCastingByDefinition(definition).toObject();
        }).toThrowError(SyntaxExtenderTypeCastingInvalidError);
        definition.type = testExtendedAgain;
        expect(() => {
            getTypeCastingByDefinition(definition).toObject();
        }).toThrowError(SyntaxExtenderTypeCastingInvalidError);
        definition.type = test;
        expect(() => {
            getTypeCastingByDefinition(definition).toObject();
        }).toThrowError(SyntaxExtenderTypeCastingInvalidError);
        definition.type = testExtended;
        expect(() => {
            getTypeCastingByDefinition(definition).toObject();
        }).toThrowError(SyntaxExtenderTypeCastingInvalidError);
        definition.type = testExtendedAgain;
        expect(() => {
            getTypeCastingByDefinition(definition).toObject();
        }).toThrowError(SyntaxExtenderTypeCastingInvalidError);
        definition.type = 'parent';
        expect(() => {
            getTypeCastingByDefinition(definition, Test).toObject();
        }).toThrowError(SyntaxExtenderTypeCastingWrongSourceTypeError);
        definition.type = 'parent';
        expect(() => {
            getTypeCastingByDefinition(definition).toObject();
        }).toThrowError(SyntaxExtenderTypeCastingWrongSourceTypeError);
        definition.type = 'self';
        expect(() => {
            getTypeCastingByDefinition(definition).toObject();
        }).toThrowError(SyntaxExtenderTypeCastingWrongSourceTypeError);
        definition.type = 'self|array';
        expect(() => {
            getTypeCastingByDefinition(definition).toObject();
        }).toThrowError(SyntaxExtenderTypeCastingMultipleInvalidError);

        definition.type = 'parent|array';
        expect(() => {
            getTypeCastingByDefinition(definition).toObject();
        }).toThrowError(SyntaxExtenderTypeCastingMultipleInvalidError);
    });

    it('works validate type array', function () {
        expect(isValidTypeCasting('array', true, undefined)).toBeTruthy();
        expect(isValidTypeCasting('array', false, undefined)).toBeFalsy();
        // when value is null and parameter hasDefault, we need an extra parameter isNullable to validate
        expect(isValidTypeCasting('array', true, null, true)).toBeTruthy();
        expect(isValidTypeCasting('array', true, null, false)).toBeFalsy();
        expect(isValidTypeCasting('array', false, null)).toBeFalsy();
        expect(isValidTypeCasting('array', true, array)).toBeTruthy();
        expect(isValidTypeCasting('array', false, array)).toBeTruthy();
        expect(isValidTypeCasting('array', true, promise)).toBeFalsy();
        expect(isValidTypeCasting('array', false, promise)).toBeFalsy();
        expect(isValidTypeCasting('array', true, asyncFn)).toBeFalsy();
        expect(isValidTypeCasting('array', false, asyncFn)).toBeFalsy();
        expect(isValidTypeCasting('array', true, bigint)).toBeFalsy();
        expect(isValidTypeCasting('array', false, bigint)).toBeFalsy();
        expect(isValidTypeCasting('array', true, boolean)).toBeFalsy();
        expect(isValidTypeCasting('array', false, boolean)).toBeFalsy();
        expect(isValidTypeCasting('array', true, test.callable)).toBeFalsy();
        expect(isValidTypeCasting('array', false, test.callable)).toBeFalsy();
        expect(isValidTypeCasting('array', true, () => {})).toBeFalsy();
        expect(isValidTypeCasting('array', false, () => {})).toBeFalsy();
        expect(isValidTypeCasting('array', true, date)).toBeFalsy();
        expect(isValidTypeCasting('array', false, date)).toBeFalsy();
        expect(isValidTypeCasting('array', true, dictionary)).toBeFalsy();
        expect(isValidTypeCasting('array', false, dictionary)).toBeFalsy();
        expect(isValidTypeCasting('array', true, float)).toBeFalsy();
        expect(isValidTypeCasting('array', false, float)).toBeFalsy();
        expect(isValidTypeCasting('array', true, generator)).toBeFalsy();
        expect(isValidTypeCasting('array', false, generator)).toBeFalsy();
        expect(isValidTypeCasting('array', true, generator())).toBeFalsy();
        expect(isValidTypeCasting('array', false, generator())).toBeFalsy();
        expect(isValidTypeCasting('array', true, integer)).toBeFalsy();
        expect(isValidTypeCasting('array', false, integer)).toBeFalsy();
        expect(isValidTypeCasting('array', true, iterator)).toBeFalsy();
        expect(isValidTypeCasting('array', false, iterator)).toBeFalsy();
        expect(isValidTypeCasting('array', true, map)).toBeFalsy();
        expect(isValidTypeCasting('array', false, map)).toBeFalsy();
        expect(isValidTypeCasting('array', true, number)).toBeFalsy();
        expect(isValidTypeCasting('array', false, number)).toBeFalsy();
        expect(isValidTypeCasting('array', true, object)).toBeFalsy();
        expect(isValidTypeCasting('array', false, object)).toBeFalsy();
        expect(isValidTypeCasting('array', true, set)).toBeFalsy();
        expect(isValidTypeCasting('array', false, set)).toBeFalsy();
        expect(isValidTypeCasting('array', true, string)).toBeFalsy();
        expect(isValidTypeCasting('array', false, string)).toBeFalsy();
        expect(isValidTypeCasting('array', true, symbol)).toBeFalsy();
        expect(isValidTypeCasting('array', false, symbol)).toBeFalsy();
        expect(isValidTypeCasting('array', true, weakmap)).toBeFalsy();
        expect(isValidTypeCasting('array', false, weakmap)).toBeFalsy();
        expect(isValidTypeCasting('array', true, weakset)).toBeFalsy();
        expect(isValidTypeCasting('array', false, weakset)).toBeFalsy();
        expect(isValidTypeCasting('array', true, test)).toBeFalsy();
        expect(isValidTypeCasting('array', false, test)).toBeFalsy();
        expect(isValidTypeCasting('array', true, typedArray)).toBeFalsy();
        expect(isValidTypeCasting('array', false, typedArray)).toBeFalsy();
        expect(isValidTypeCasting('array', true, testExtended)).toBeFalsy();
        expect(isValidTypeCasting('array', false, testExtended)).toBeFalsy();
        expect(isValidTypeCasting('array', true, testExtendedAgain)).toBeFalsy();
        expect(isValidTypeCasting('array', false, testExtendedAgain)).toBeFalsy();
    });

    it('works validate type async', function () {
        expect(isValidTypeCasting('async', true, undefined)).toBeTruthy();
        expect(isValidTypeCasting('async', false, undefined)).toBeFalsy();
        // when value is null and parameter hasDefault, we need an extra parameter isNullable to validate
        expect(isValidTypeCasting('async', true, null, true)).toBeTruthy();
        expect(isValidTypeCasting('async', true, null, false)).toBeFalsy();
        expect(isValidTypeCasting('async', false, null)).toBeFalsy();
        expect(isValidTypeCasting('async', true, array)).toBeFalsy();
        expect(isValidTypeCasting('async', false, array)).toBeFalsy();
        expect(isValidTypeCasting('async', true, promise)).toBeFalsy();
        expect(isValidTypeCasting('async', false, promise)).toBeFalsy();
        expect(isValidTypeCasting('async', true, asyncFn)).toBeTruthy();
        expect(isValidTypeCasting('async', false, asyncFn)).toBeTruthy();
        expect(isValidTypeCasting('async', true, bigint)).toBeFalsy();
        expect(isValidTypeCasting('async', false, bigint)).toBeFalsy();
        expect(isValidTypeCasting('async', true, boolean)).toBeFalsy();
        expect(isValidTypeCasting('async', false, boolean)).toBeFalsy();
        expect(isValidTypeCasting('async', true, test.callable)).toBeFalsy();
        expect(isValidTypeCasting('async', false, test.callable)).toBeFalsy();
        expect(isValidTypeCasting('async', true, () => {})).toBeFalsy();
        expect(isValidTypeCasting('async', false, () => {})).toBeFalsy();
        expect(isValidTypeCasting('async', true, date)).toBeFalsy();
        expect(isValidTypeCasting('async', false, date)).toBeFalsy();
        expect(isValidTypeCasting('async', true, dictionary)).toBeFalsy();
        expect(isValidTypeCasting('async', false, dictionary)).toBeFalsy();
        expect(isValidTypeCasting('async', true, float)).toBeFalsy();
        expect(isValidTypeCasting('async', false, float)).toBeFalsy();
        expect(isValidTypeCasting('async', true, generator)).toBeFalsy();
        expect(isValidTypeCasting('async', false, generator)).toBeFalsy();
        expect(isValidTypeCasting('async', true, generator())).toBeFalsy();
        expect(isValidTypeCasting('async', false, generator())).toBeFalsy();
        expect(isValidTypeCasting('async', true, integer)).toBeFalsy();
        expect(isValidTypeCasting('async', false, integer)).toBeFalsy();
        expect(isValidTypeCasting('async', true, iterator)).toBeFalsy();
        expect(isValidTypeCasting('async', false, iterator)).toBeFalsy();
        expect(isValidTypeCasting('async', true, map)).toBeFalsy();
        expect(isValidTypeCasting('async', false, map)).toBeFalsy();
        expect(isValidTypeCasting('async', true, number)).toBeFalsy();
        expect(isValidTypeCasting('async', false, number)).toBeFalsy();
        expect(isValidTypeCasting('async', true, object)).toBeFalsy();
        expect(isValidTypeCasting('async', false, object)).toBeFalsy();
        expect(isValidTypeCasting('async', true, set)).toBeFalsy();
        expect(isValidTypeCasting('async', false, set)).toBeFalsy();
        expect(isValidTypeCasting('async', true, string)).toBeFalsy();
        expect(isValidTypeCasting('async', false, string)).toBeFalsy();
        expect(isValidTypeCasting('async', true, symbol)).toBeFalsy();
        expect(isValidTypeCasting('async', false, symbol)).toBeFalsy();
        expect(isValidTypeCasting('async', true, weakmap)).toBeFalsy();
        expect(isValidTypeCasting('async', false, weakmap)).toBeFalsy();
        expect(isValidTypeCasting('async', true, weakset)).toBeFalsy();
        expect(isValidTypeCasting('async', false, weakset)).toBeFalsy();
        expect(isValidTypeCasting('async', true, test)).toBeFalsy();
        expect(isValidTypeCasting('async', false, test)).toBeFalsy();
        expect(isValidTypeCasting('async', true, typedArray)).toBeFalsy();
        expect(isValidTypeCasting('async', false, typedArray)).toBeFalsy();
        expect(isValidTypeCasting('async', true, testExtended)).toBeFalsy();
        expect(isValidTypeCasting('async', false, testExtended)).toBeFalsy();
        expect(isValidTypeCasting('async', true, testExtendedAgain)).toBeFalsy();
        expect(isValidTypeCasting('async', false, testExtendedAgain)).toBeFalsy();
    });

    it('works validate type bigint', function () {
        expect(isValidTypeCasting('bigint', true, undefined)).toBeTruthy();
        expect(isValidTypeCasting('bigint', false, undefined)).toBeFalsy();
        // when value is null and parameter hasDefault, we need an extra parameter isNullable to validate
        expect(isValidTypeCasting('bigint', true, null, true)).toBeTruthy();
        expect(isValidTypeCasting('bigint', true, null, false)).toBeFalsy();
        expect(isValidTypeCasting('bigint', false, null)).toBeFalsy();
        expect(isValidTypeCasting('bigint', true, array)).toBeFalsy();
        expect(isValidTypeCasting('bigint', false, array)).toBeFalsy();
        expect(isValidTypeCasting('bigint', true, promise)).toBeFalsy();
        expect(isValidTypeCasting('bigint', false, promise)).toBeFalsy();
        expect(isValidTypeCasting('bigint', true, asyncFn)).toBeFalsy();
        expect(isValidTypeCasting('bigint', false, asyncFn)).toBeFalsy();
        expect(isValidTypeCasting('bigint', true, bigint)).toBeTruthy();
        expect(isValidTypeCasting('bigint', false, bigint)).toBeTruthy();
        expect(isValidTypeCasting('bigint', true, boolean)).toBeFalsy();
        expect(isValidTypeCasting('bigint', false, boolean)).toBeFalsy();
        expect(isValidTypeCasting('bigint', true, test.callable)).toBeFalsy();
        expect(isValidTypeCasting('bigint', false, test.callable)).toBeFalsy();
        expect(isValidTypeCasting('bigint', true, () => {})).toBeFalsy();
        expect(isValidTypeCasting('bigint', false, () => {})).toBeFalsy();
        expect(isValidTypeCasting('bigint', true, date)).toBeFalsy();
        expect(isValidTypeCasting('bigint', false, date)).toBeFalsy();
        expect(isValidTypeCasting('bigint', true, dictionary)).toBeFalsy();
        expect(isValidTypeCasting('bigint', false, dictionary)).toBeFalsy();
        expect(isValidTypeCasting('bigint', true, float)).toBeFalsy();
        expect(isValidTypeCasting('bigint', false, float)).toBeFalsy();
        expect(isValidTypeCasting('bigint', true, generator)).toBeFalsy();
        expect(isValidTypeCasting('bigint', false, generator)).toBeFalsy();
        expect(isValidTypeCasting('bigint', true, generator())).toBeFalsy();
        expect(isValidTypeCasting('bigint', false, generator())).toBeFalsy();
        expect(isValidTypeCasting('bigint', true, integer)).toBeFalsy();
        expect(isValidTypeCasting('bigint', false, integer)).toBeFalsy();
        expect(isValidTypeCasting('bigint', true, iterator)).toBeFalsy();
        expect(isValidTypeCasting('bigint', false, iterator)).toBeFalsy();
        expect(isValidTypeCasting('bigint', true, map)).toBeFalsy();
        expect(isValidTypeCasting('bigint', false, map)).toBeFalsy();
        expect(isValidTypeCasting('bigint', true, number)).toBeFalsy();
        expect(isValidTypeCasting('bigint', false, number)).toBeFalsy();
        expect(isValidTypeCasting('bigint', true, object)).toBeFalsy();
        expect(isValidTypeCasting('bigint', false, object)).toBeFalsy();
        expect(isValidTypeCasting('bigint', true, set)).toBeFalsy();
        expect(isValidTypeCasting('bigint', false, set)).toBeFalsy();
        expect(isValidTypeCasting('bigint', true, string)).toBeFalsy();
        expect(isValidTypeCasting('bigint', false, string)).toBeFalsy();
        expect(isValidTypeCasting('bigint', true, symbol)).toBeFalsy();
        expect(isValidTypeCasting('bigint', false, symbol)).toBeFalsy();
        expect(isValidTypeCasting('bigint', true, weakmap)).toBeFalsy();
        expect(isValidTypeCasting('bigint', false, weakmap)).toBeFalsy();
        expect(isValidTypeCasting('bigint', true, weakset)).toBeFalsy();
        expect(isValidTypeCasting('bigint', false, weakset)).toBeFalsy();
        expect(isValidTypeCasting('bigint', true, test)).toBeFalsy();
        expect(isValidTypeCasting('bigint', false, test)).toBeFalsy();
        expect(isValidTypeCasting('bigint', true, typedArray)).toBeFalsy();
        expect(isValidTypeCasting('bigint', false, typedArray)).toBeFalsy();
        expect(isValidTypeCasting('bigint', true, testExtended)).toBeFalsy();
        expect(isValidTypeCasting('bigint', false, testExtended)).toBeFalsy();
        expect(isValidTypeCasting('bigint', true, testExtendedAgain)).toBeFalsy();
        expect(isValidTypeCasting('bigint', false, testExtendedAgain)).toBeFalsy();
    });

    it('works validate type boolean', function () {
        expect(isValidTypeCasting('boolean', true, undefined)).toBeTruthy();
        expect(isValidTypeCasting('boolean', false, undefined)).toBeFalsy();
        // when value is null and parameter hasDefault, we need an extra parameter isNullable to validate
        expect(isValidTypeCasting('boolean', true, null, true)).toBeTruthy();
        expect(isValidTypeCasting('boolean', true, null, false)).toBeFalsy();
        expect(isValidTypeCasting('boolean', false, null)).toBeFalsy();
        expect(isValidTypeCasting('boolean', true, array)).toBeFalsy();
        expect(isValidTypeCasting('boolean', false, array)).toBeFalsy();
        expect(isValidTypeCasting('boolean', true, promise)).toBeFalsy();
        expect(isValidTypeCasting('boolean', false, promise)).toBeFalsy();
        expect(isValidTypeCasting('boolean', true, asyncFn)).toBeFalsy();
        expect(isValidTypeCasting('boolean', false, asyncFn)).toBeFalsy();
        expect(isValidTypeCasting('boolean', true, bigint)).toBeFalsy();
        expect(isValidTypeCasting('boolean', false, bigint)).toBeFalsy();
        expect(isValidTypeCasting('boolean', true, boolean)).toBeTruthy();
        expect(isValidTypeCasting('boolean', false, boolean)).toBeTruthy();
        expect(isValidTypeCasting('boolean', true, test.callable)).toBeFalsy();
        expect(isValidTypeCasting('boolean', false, test.callable)).toBeFalsy();
        expect(isValidTypeCasting('boolean', true, () => {})).toBeFalsy();
        expect(isValidTypeCasting('boolean', false, () => {})).toBeFalsy();
        expect(isValidTypeCasting('boolean', true, date)).toBeFalsy();
        expect(isValidTypeCasting('boolean', false, date)).toBeFalsy();
        expect(isValidTypeCasting('boolean', true, dictionary)).toBeFalsy();
        expect(isValidTypeCasting('boolean', false, dictionary)).toBeFalsy();
        expect(isValidTypeCasting('boolean', true, float)).toBeFalsy();
        expect(isValidTypeCasting('boolean', false, float)).toBeFalsy();
        expect(isValidTypeCasting('boolean', true, generator)).toBeFalsy();
        expect(isValidTypeCasting('boolean', false, generator)).toBeFalsy();
        expect(isValidTypeCasting('boolean', true, generator())).toBeFalsy();
        expect(isValidTypeCasting('boolean', false, generator())).toBeFalsy();
        expect(isValidTypeCasting('boolean', true, integer)).toBeFalsy();
        expect(isValidTypeCasting('boolean', false, integer)).toBeFalsy();
        expect(isValidTypeCasting('boolean', true, iterator)).toBeFalsy();
        expect(isValidTypeCasting('boolean', false, iterator)).toBeFalsy();
        expect(isValidTypeCasting('boolean', true, map)).toBeFalsy();
        expect(isValidTypeCasting('boolean', false, map)).toBeFalsy();
        expect(isValidTypeCasting('boolean', true, number)).toBeFalsy();
        expect(isValidTypeCasting('boolean', false, number)).toBeFalsy();
        expect(isValidTypeCasting('boolean', true, object)).toBeFalsy();
        expect(isValidTypeCasting('boolean', false, object)).toBeFalsy();
        expect(isValidTypeCasting('boolean', true, set)).toBeFalsy();
        expect(isValidTypeCasting('boolean', false, set)).toBeFalsy();
        expect(isValidTypeCasting('boolean', true, string)).toBeFalsy();
        expect(isValidTypeCasting('boolean', false, string)).toBeFalsy();
        expect(isValidTypeCasting('boolean', true, symbol)).toBeFalsy();
        expect(isValidTypeCasting('boolean', false, symbol)).toBeFalsy();
        expect(isValidTypeCasting('boolean', true, weakmap)).toBeFalsy();
        expect(isValidTypeCasting('boolean', false, weakmap)).toBeFalsy();
        expect(isValidTypeCasting('boolean', true, weakset)).toBeFalsy();
        expect(isValidTypeCasting('boolean', false, weakset)).toBeFalsy();
        expect(isValidTypeCasting('boolean', true, test)).toBeFalsy();
        expect(isValidTypeCasting('boolean', false, test)).toBeFalsy();
        expect(isValidTypeCasting('boolean', true, typedArray)).toBeFalsy();
        expect(isValidTypeCasting('boolean', false, typedArray)).toBeFalsy();
        expect(isValidTypeCasting('boolean', true, testExtended)).toBeFalsy();
        expect(isValidTypeCasting('boolean', false, testExtended)).toBeFalsy();
        expect(isValidTypeCasting('boolean', true, testExtendedAgain)).toBeFalsy();
        expect(isValidTypeCasting('boolean', false, testExtendedAgain)).toBeFalsy();
    });

    it('works validate type callable', function () {
        expect(isValidTypeCasting('callable', true, undefined)).toBeTruthy();
        expect(isValidTypeCasting('callable', false, undefined)).toBeFalsy();
        // when value is null and parameter hasDefault, we need an extra parameter isNullable to validate
        expect(isValidTypeCasting('callable', true, null, true)).toBeTruthy();
        expect(isValidTypeCasting('callable', true, null, false)).toBeFalsy();
        expect(isValidTypeCasting('callable', false, null)).toBeFalsy();
        expect(isValidTypeCasting('callable', true, array)).toBeFalsy();
        expect(isValidTypeCasting('callable', false, array)).toBeFalsy();
        expect(isValidTypeCasting('callable', true, promise)).toBeFalsy();
        expect(isValidTypeCasting('callable', false, promise)).toBeFalsy();
        expect(isValidTypeCasting('callable', true, asyncFn)).toBeTruthy();
        expect(isValidTypeCasting('callable', false, asyncFn)).toBeTruthy();
        expect(isValidTypeCasting('callable', true, bigint)).toBeFalsy();
        expect(isValidTypeCasting('callable', false, bigint)).toBeFalsy();
        expect(isValidTypeCasting('callable', true, boolean)).toBeFalsy();
        expect(isValidTypeCasting('callable', false, boolean)).toBeFalsy();
        expect(isValidTypeCasting('callable', true, test.callable)).toBeTruthy();
        expect(isValidTypeCasting('callable', false, test.callable)).toBeTruthy();
        expect(isValidTypeCasting('callable', true, () => {})).toBeTruthy();
        expect(isValidTypeCasting('callable', false, () => {})).toBeTruthy();
        expect(isValidTypeCasting('callable', true, date)).toBeFalsy();
        expect(isValidTypeCasting('callable', false, date)).toBeFalsy();
        expect(isValidTypeCasting('callable', true, dictionary)).toBeFalsy();
        expect(isValidTypeCasting('callable', false, dictionary)).toBeFalsy();
        expect(isValidTypeCasting('callable', true, float)).toBeFalsy();
        expect(isValidTypeCasting('callable', false, float)).toBeFalsy();
        expect(isValidTypeCasting('callable', true, generator)).toBeFalsy();
        expect(isValidTypeCasting('callable', false, generator)).toBeFalsy();
        expect(isValidTypeCasting('callable', true, generator())).toBeFalsy();
        expect(isValidTypeCasting('callable', false, generator())).toBeFalsy();
        expect(isValidTypeCasting('callable', true, integer)).toBeFalsy();
        expect(isValidTypeCasting('callable', false, integer)).toBeFalsy();
        expect(isValidTypeCasting('callable', true, iterator)).toBeFalsy();
        expect(isValidTypeCasting('callable', false, iterator)).toBeFalsy();
        expect(isValidTypeCasting('callable', true, map)).toBeFalsy();
        expect(isValidTypeCasting('callable', false, map)).toBeFalsy();
        expect(isValidTypeCasting('callable', true, number)).toBeFalsy();
        expect(isValidTypeCasting('callable', false, number)).toBeFalsy();
        expect(isValidTypeCasting('callable', true, object)).toBeFalsy();
        expect(isValidTypeCasting('callable', false, object)).toBeFalsy();
        expect(isValidTypeCasting('callable', true, set)).toBeFalsy();
        expect(isValidTypeCasting('callable', false, set)).toBeFalsy();
        expect(isValidTypeCasting('callable', true, string)).toBeFalsy();
        expect(isValidTypeCasting('callable', false, string)).toBeFalsy();
        expect(isValidTypeCasting('callable', true, symbol)).toBeFalsy();
        expect(isValidTypeCasting('callable', false, symbol)).toBeFalsy();
        expect(isValidTypeCasting('callable', true, weakmap)).toBeFalsy();
        expect(isValidTypeCasting('callable', false, weakmap)).toBeFalsy();
        expect(isValidTypeCasting('callable', true, weakset)).toBeFalsy();
        expect(isValidTypeCasting('callable', false, weakset)).toBeFalsy();
        expect(isValidTypeCasting('callable', true, test)).toBeFalsy();
        expect(isValidTypeCasting('callable', false, test)).toBeFalsy();
        expect(isValidTypeCasting('callable', true, typedArray)).toBeFalsy();
        expect(isValidTypeCasting('callable', false, typedArray)).toBeFalsy();
        expect(isValidTypeCasting('callable', true, testExtended)).toBeFalsy();
        expect(isValidTypeCasting('callable', false, testExtended)).toBeFalsy();
        expect(isValidTypeCasting('callable', true, testExtendedAgain)).toBeFalsy();
        expect(isValidTypeCasting('callable', false, testExtendedAgain)).toBeFalsy();
    });

    it('works validate type date', function () {
        expect(isValidTypeCasting('date', true, undefined)).toBeTruthy();
        expect(isValidTypeCasting('date', false, undefined)).toBeFalsy();
        // when value is null and parameter hasDefault, we need an extra parameter isNullable to validate
        expect(isValidTypeCasting('date', true, null, true)).toBeTruthy();
        expect(isValidTypeCasting('date', true, null, false)).toBeFalsy();
        expect(isValidTypeCasting('date', false, null)).toBeFalsy();
        expect(isValidTypeCasting('date', true, array)).toBeFalsy();
        expect(isValidTypeCasting('date', false, array)).toBeFalsy();
        expect(isValidTypeCasting('date', true, promise)).toBeFalsy();
        expect(isValidTypeCasting('date', false, promise)).toBeFalsy();
        expect(isValidTypeCasting('date', true, asyncFn)).toBeFalsy();
        expect(isValidTypeCasting('date', false, asyncFn)).toBeFalsy();
        expect(isValidTypeCasting('date', true, bigint)).toBeFalsy();
        expect(isValidTypeCasting('date', false, bigint)).toBeFalsy();
        expect(isValidTypeCasting('date', true, boolean)).toBeFalsy();
        expect(isValidTypeCasting('date', false, boolean)).toBeFalsy();
        expect(isValidTypeCasting('date', true, test.callable)).toBeFalsy();
        expect(isValidTypeCasting('date', false, test.callable)).toBeFalsy();
        expect(isValidTypeCasting('date', true, () => {})).toBeFalsy();
        expect(isValidTypeCasting('date', false, () => {})).toBeFalsy();
        expect(isValidTypeCasting('date', true, date)).toBeTruthy();
        expect(isValidTypeCasting('date', false, date)).toBeTruthy();
        expect(isValidTypeCasting('date', true, dictionary)).toBeFalsy();
        expect(isValidTypeCasting('date', false, dictionary)).toBeFalsy();
        expect(isValidTypeCasting('date', true, float)).toBeFalsy();
        expect(isValidTypeCasting('date', false, float)).toBeFalsy();
        expect(isValidTypeCasting('date', true, generator)).toBeFalsy();
        expect(isValidTypeCasting('date', false, generator)).toBeFalsy();
        expect(isValidTypeCasting('date', true, generator())).toBeFalsy();
        expect(isValidTypeCasting('date', false, generator())).toBeFalsy();
        expect(isValidTypeCasting('date', true, integer)).toBeFalsy();
        expect(isValidTypeCasting('date', false, integer)).toBeFalsy();
        expect(isValidTypeCasting('date', true, iterator)).toBeFalsy();
        expect(isValidTypeCasting('date', false, iterator)).toBeFalsy();
        expect(isValidTypeCasting('date', true, map)).toBeFalsy();
        expect(isValidTypeCasting('date', false, map)).toBeFalsy();
        expect(isValidTypeCasting('date', true, number)).toBeFalsy();
        expect(isValidTypeCasting('date', false, number)).toBeFalsy();
        expect(isValidTypeCasting('date', true, object)).toBeFalsy();
        expect(isValidTypeCasting('date', false, object)).toBeFalsy();
        expect(isValidTypeCasting('date', true, set)).toBeFalsy();
        expect(isValidTypeCasting('date', false, set)).toBeFalsy();
        expect(isValidTypeCasting('date', true, string)).toBeFalsy();
        expect(isValidTypeCasting('date', false, string)).toBeFalsy();
        expect(isValidTypeCasting('date', true, symbol)).toBeFalsy();
        expect(isValidTypeCasting('date', false, symbol)).toBeFalsy();
        expect(isValidTypeCasting('date', true, weakmap)).toBeFalsy();
        expect(isValidTypeCasting('date', false, weakmap)).toBeFalsy();
        expect(isValidTypeCasting('date', true, weakset)).toBeFalsy();
        expect(isValidTypeCasting('date', false, weakset)).toBeFalsy();
        expect(isValidTypeCasting('date', true, test)).toBeFalsy();
        expect(isValidTypeCasting('date', false, test)).toBeFalsy();
        expect(isValidTypeCasting('date', true, typedArray)).toBeFalsy();
        expect(isValidTypeCasting('date', false, typedArray)).toBeFalsy();
        expect(isValidTypeCasting('date', true, testExtended)).toBeFalsy();
        expect(isValidTypeCasting('date', false, testExtended)).toBeFalsy();
        expect(isValidTypeCasting('date', true, testExtendedAgain)).toBeFalsy();
        expect(isValidTypeCasting('date', false, testExtendedAgain)).toBeFalsy();
    });

    it('works validate type dictionary', function () {
        expect(isValidTypeCasting('dictionary', true, undefined)).toBeTruthy();
        expect(isValidTypeCasting('dictionary', false, undefined)).toBeFalsy();
        // when value is null and parameter hasDefault, we need an extra parameter isNullable to validate
        expect(isValidTypeCasting('dictionary', true, null, true)).toBeTruthy();
        expect(isValidTypeCasting('dictionary', true, null, false)).toBeFalsy();
        expect(isValidTypeCasting('dictionary', false, null)).toBeFalsy();
        expect(isValidTypeCasting('dictionary', true, array)).toBeFalsy();
        expect(isValidTypeCasting('dictionary', false, array)).toBeFalsy();
        expect(isValidTypeCasting('dictionary', true, promise)).toBeFalsy();
        expect(isValidTypeCasting('dictionary', false, promise)).toBeFalsy();
        expect(isValidTypeCasting('dictionary', true, asyncFn)).toBeFalsy();
        expect(isValidTypeCasting('dictionary', false, asyncFn)).toBeFalsy();
        expect(isValidTypeCasting('dictionary', true, bigint)).toBeFalsy();
        expect(isValidTypeCasting('dictionary', false, bigint)).toBeFalsy();
        expect(isValidTypeCasting('dictionary', true, boolean)).toBeFalsy();
        expect(isValidTypeCasting('dictionary', false, boolean)).toBeFalsy();
        expect(isValidTypeCasting('dictionary', true, test.callable)).toBeFalsy();
        expect(isValidTypeCasting('dictionary', false, test.callable)).toBeFalsy();
        expect(isValidTypeCasting('dictionary', true, () => {})).toBeFalsy();
        expect(isValidTypeCasting('dictionary', false, () => {})).toBeFalsy();
        expect(isValidTypeCasting('dictionary', true, date)).toBeFalsy();
        expect(isValidTypeCasting('dictionary', false, date)).toBeFalsy();
        expect(isValidTypeCasting('dictionary', true, dictionary)).toBeTruthy();
        expect(isValidTypeCasting('dictionary', false, dictionary)).toBeTruthy();
        expect(isValidTypeCasting('dictionary', true, float)).toBeFalsy();
        expect(isValidTypeCasting('dictionary', false, float)).toBeFalsy();
        expect(isValidTypeCasting('dictionary', true, generator)).toBeFalsy();
        expect(isValidTypeCasting('dictionary', false, generator)).toBeFalsy();
        expect(isValidTypeCasting('dictionary', true, generator())).toBeFalsy();
        expect(isValidTypeCasting('dictionary', false, generator())).toBeFalsy();
        expect(isValidTypeCasting('dictionary', true, integer)).toBeFalsy();
        expect(isValidTypeCasting('dictionary', false, integer)).toBeFalsy();
        expect(isValidTypeCasting('dictionary', true, iterator)).toBeFalsy();
        expect(isValidTypeCasting('dictionary', false, iterator)).toBeFalsy();
        expect(isValidTypeCasting('dictionary', true, map)).toBeFalsy();
        expect(isValidTypeCasting('dictionary', false, map)).toBeFalsy();
        expect(isValidTypeCasting('dictionary', true, number)).toBeFalsy();
        expect(isValidTypeCasting('dictionary', false, number)).toBeFalsy();
        expect(isValidTypeCasting('dictionary', true, object)).toBeFalsy();
        expect(isValidTypeCasting('dictionary', false, object)).toBeFalsy();
        expect(isValidTypeCasting('dictionary', true, set)).toBeFalsy();
        expect(isValidTypeCasting('dictionary', false, set)).toBeFalsy();
        expect(isValidTypeCasting('dictionary', true, string)).toBeFalsy();
        expect(isValidTypeCasting('dictionary', false, string)).toBeFalsy();
        expect(isValidTypeCasting('dictionary', true, symbol)).toBeFalsy();
        expect(isValidTypeCasting('dictionary', false, symbol)).toBeFalsy();
        expect(isValidTypeCasting('dictionary', true, weakmap)).toBeFalsy();
        expect(isValidTypeCasting('dictionary', false, weakmap)).toBeFalsy();
        expect(isValidTypeCasting('dictionary', true, weakset)).toBeFalsy();
        expect(isValidTypeCasting('dictionary', false, weakset)).toBeFalsy();
        expect(isValidTypeCasting('dictionary', true, test)).toBeFalsy();
        expect(isValidTypeCasting('dictionary', false, test)).toBeFalsy();
        expect(isValidTypeCasting('dictionary', true, typedArray)).toBeFalsy();
        expect(isValidTypeCasting('dictionary', false, typedArray)).toBeFalsy();
        expect(isValidTypeCasting('dictionary', true, testExtended)).toBeFalsy();
        expect(isValidTypeCasting('dictionary', false, testExtended)).toBeFalsy();
        expect(isValidTypeCasting('dictionary', true, testExtendedAgain)).toBeFalsy();
        expect(isValidTypeCasting('dictionary', false, testExtendedAgain)).toBeFalsy();
    });

    it('works validate type float', function () {
        expect(isValidTypeCasting('float', true, undefined)).toBeTruthy();
        expect(isValidTypeCasting('float', false, undefined)).toBeFalsy();
        // when value is null and parameter hasDefault, we need an extra parameter isNullable to validate
        expect(isValidTypeCasting('float', true, null, true)).toBeTruthy();
        expect(isValidTypeCasting('float', true, null, false)).toBeFalsy();
        expect(isValidTypeCasting('float', false, null)).toBeFalsy();
        expect(isValidTypeCasting('float', true, array)).toBeFalsy();
        expect(isValidTypeCasting('float', false, array)).toBeFalsy();
        expect(isValidTypeCasting('float', true, promise)).toBeFalsy();
        expect(isValidTypeCasting('float', false, promise)).toBeFalsy();
        expect(isValidTypeCasting('float', true, asyncFn)).toBeFalsy();
        expect(isValidTypeCasting('float', false, asyncFn)).toBeFalsy();
        expect(isValidTypeCasting('float', true, bigint)).toBeFalsy();
        expect(isValidTypeCasting('float', false, bigint)).toBeFalsy();
        expect(isValidTypeCasting('float', true, boolean)).toBeFalsy();
        expect(isValidTypeCasting('float', false, boolean)).toBeFalsy();
        expect(isValidTypeCasting('float', true, test.callable)).toBeFalsy();
        expect(isValidTypeCasting('float', false, test.callable)).toBeFalsy();
        expect(isValidTypeCasting('float', true, () => {})).toBeFalsy();
        expect(isValidTypeCasting('float', false, () => {})).toBeFalsy();
        expect(isValidTypeCasting('float', true, date)).toBeFalsy();
        expect(isValidTypeCasting('float', false, date)).toBeFalsy();
        expect(isValidTypeCasting('float', true, dictionary)).toBeFalsy();
        expect(isValidTypeCasting('float', false, dictionary)).toBeFalsy();
        expect(isValidTypeCasting('float', true, float)).toBeTruthy();
        expect(isValidTypeCasting('float', false, float)).toBeTruthy();
        expect(isValidTypeCasting('float', true, generator)).toBeFalsy();
        expect(isValidTypeCasting('float', false, generator)).toBeFalsy();
        expect(isValidTypeCasting('float', true, generator())).toBeFalsy();
        expect(isValidTypeCasting('float', false, generator())).toBeFalsy();
        expect(isValidTypeCasting('float', true, integer)).toBeFalsy();
        expect(isValidTypeCasting('float', false, integer)).toBeFalsy();
        expect(isValidTypeCasting('float', true, iterator)).toBeFalsy();
        expect(isValidTypeCasting('float', false, iterator)).toBeFalsy();
        expect(isValidTypeCasting('float', true, map)).toBeFalsy();
        expect(isValidTypeCasting('float', false, map)).toBeFalsy();
        expect(isValidTypeCasting('float', true, number)).toBeFalsy();
        expect(isValidTypeCasting('float', false, number)).toBeFalsy();
        expect(isValidTypeCasting('float', true, object)).toBeFalsy();
        expect(isValidTypeCasting('float', false, object)).toBeFalsy();
        expect(isValidTypeCasting('float', true, set)).toBeFalsy();
        expect(isValidTypeCasting('float', false, set)).toBeFalsy();
        expect(isValidTypeCasting('float', true, string)).toBeFalsy();
        expect(isValidTypeCasting('float', false, string)).toBeFalsy();
        expect(isValidTypeCasting('float', true, symbol)).toBeFalsy();
        expect(isValidTypeCasting('float', false, symbol)).toBeFalsy();
        expect(isValidTypeCasting('float', true, weakmap)).toBeFalsy();
        expect(isValidTypeCasting('float', false, weakmap)).toBeFalsy();
        expect(isValidTypeCasting('float', true, weakset)).toBeFalsy();
        expect(isValidTypeCasting('float', false, weakset)).toBeFalsy();
        expect(isValidTypeCasting('float', true, test)).toBeFalsy();
        expect(isValidTypeCasting('float', false, test)).toBeFalsy();
        expect(isValidTypeCasting('float', true, typedArray)).toBeFalsy();
        expect(isValidTypeCasting('float', false, typedArray)).toBeFalsy();
        expect(isValidTypeCasting('float', true, testExtended)).toBeFalsy();
        expect(isValidTypeCasting('float', false, testExtended)).toBeFalsy();
        expect(isValidTypeCasting('float', true, testExtendedAgain)).toBeFalsy();
        expect(isValidTypeCasting('float', false, testExtendedAgain)).toBeFalsy();
    });

    it('works validate type generator', function () {
        expect(isValidTypeCasting('generator', true, undefined)).toBeTruthy();
        expect(isValidTypeCasting('generator', false, undefined)).toBeFalsy();
        // when value is null and parameter hasDefault, we need an extra parameter isNullable to validate
        expect(isValidTypeCasting('generator', true, null, true)).toBeTruthy();
        expect(isValidTypeCasting('generator', true, null, false)).toBeFalsy();
        expect(isValidTypeCasting('generator', false, null)).toBeFalsy();
        expect(isValidTypeCasting('generator', true, array)).toBeFalsy();
        expect(isValidTypeCasting('generator', false, array)).toBeFalsy();
        expect(isValidTypeCasting('generator', true, promise)).toBeFalsy();
        expect(isValidTypeCasting('generator', false, promise)).toBeFalsy();
        expect(isValidTypeCasting('generator', true, asyncFn)).toBeFalsy();
        expect(isValidTypeCasting('generator', false, asyncFn)).toBeFalsy();
        expect(isValidTypeCasting('generator', true, bigint)).toBeFalsy();
        expect(isValidTypeCasting('generator', false, bigint)).toBeFalsy();
        expect(isValidTypeCasting('generator', true, boolean)).toBeFalsy();
        expect(isValidTypeCasting('generator', false, boolean)).toBeFalsy();
        expect(isValidTypeCasting('generator', true, test.callable)).toBeFalsy();
        expect(isValidTypeCasting('generator', false, test.callable)).toBeFalsy();
        expect(isValidTypeCasting('generator', true, () => {})).toBeFalsy();
        expect(isValidTypeCasting('generator', false, () => {})).toBeFalsy();
        expect(isValidTypeCasting('generator', true, date)).toBeFalsy();
        expect(isValidTypeCasting('generator', false, date)).toBeFalsy();
        expect(isValidTypeCasting('generator', true, dictionary)).toBeFalsy();
        expect(isValidTypeCasting('generator', false, dictionary)).toBeFalsy();
        expect(isValidTypeCasting('generator', true, float)).toBeFalsy();
        expect(isValidTypeCasting('generator', false, float)).toBeFalsy();
        expect(isValidTypeCasting('generator', true, generator)).toBeTruthy();
        expect(isValidTypeCasting('generator', false, generator)).toBeTruthy();
        expect(isValidTypeCasting('generator', true, generator())).toBeFalsy();
        expect(isValidTypeCasting('generator', false, generator())).toBeFalsy();
        expect(isValidTypeCasting('generator', true, integer)).toBeFalsy();
        expect(isValidTypeCasting('generator', false, integer)).toBeFalsy();
        expect(isValidTypeCasting('generator', true, iterator)).toBeFalsy();
        expect(isValidTypeCasting('generator', false, iterator)).toBeFalsy();
        expect(isValidTypeCasting('generator', true, map)).toBeFalsy();
        expect(isValidTypeCasting('generator', false, map)).toBeFalsy();
        expect(isValidTypeCasting('generator', true, number)).toBeFalsy();
        expect(isValidTypeCasting('generator', false, number)).toBeFalsy();
        expect(isValidTypeCasting('generator', true, object)).toBeFalsy();
        expect(isValidTypeCasting('generator', false, object)).toBeFalsy();
        expect(isValidTypeCasting('generator', true, set)).toBeFalsy();
        expect(isValidTypeCasting('generator', false, set)).toBeFalsy();
        expect(isValidTypeCasting('generator', true, string)).toBeFalsy();
        expect(isValidTypeCasting('generator', false, string)).toBeFalsy();
        expect(isValidTypeCasting('generator', true, symbol)).toBeFalsy();
        expect(isValidTypeCasting('generator', false, symbol)).toBeFalsy();
        expect(isValidTypeCasting('generator', true, weakmap)).toBeFalsy();
        expect(isValidTypeCasting('generator', false, weakmap)).toBeFalsy();
        expect(isValidTypeCasting('generator', true, weakset)).toBeFalsy();
        expect(isValidTypeCasting('generator', false, weakset)).toBeFalsy();
        expect(isValidTypeCasting('generator', true, test)).toBeFalsy();
        expect(isValidTypeCasting('generator', false, test)).toBeFalsy();
        expect(isValidTypeCasting('generator', true, typedArray)).toBeFalsy();
        expect(isValidTypeCasting('generator', false, typedArray)).toBeFalsy();
        expect(isValidTypeCasting('generator', true, testExtended)).toBeFalsy();
        expect(isValidTypeCasting('generator', false, testExtended)).toBeFalsy();
        expect(isValidTypeCasting('generator', true, testExtendedAgain)).toBeFalsy();
        expect(isValidTypeCasting('generator', false, testExtendedAgain)).toBeFalsy();
    });

    it('works validate type integer', function () {
        expect(isValidTypeCasting('integer', true, undefined)).toBeTruthy();
        expect(isValidTypeCasting('integer', false, undefined)).toBeFalsy();
        // when value is null and parameter hasDefault, we need an extra parameter isNullable to validate
        expect(isValidTypeCasting('integer', true, null, true)).toBeTruthy();
        expect(isValidTypeCasting('integer', true, null, false)).toBeFalsy();
        expect(isValidTypeCasting('integer', false, null)).toBeFalsy();
        expect(isValidTypeCasting('integer', true, array)).toBeFalsy();
        expect(isValidTypeCasting('integer', false, array)).toBeFalsy();
        expect(isValidTypeCasting('integer', true, promise)).toBeFalsy();
        expect(isValidTypeCasting('integer', false, promise)).toBeFalsy();
        expect(isValidTypeCasting('integer', true, asyncFn)).toBeFalsy();
        expect(isValidTypeCasting('integer', false, asyncFn)).toBeFalsy();
        expect(isValidTypeCasting('integer', true, bigint)).toBeFalsy();
        expect(isValidTypeCasting('integer', false, bigint)).toBeFalsy();
        expect(isValidTypeCasting('integer', true, boolean)).toBeFalsy();
        expect(isValidTypeCasting('integer', false, boolean)).toBeFalsy();
        expect(isValidTypeCasting('integer', true, test.callable)).toBeFalsy();
        expect(isValidTypeCasting('integer', false, test.callable)).toBeFalsy();
        expect(isValidTypeCasting('integer', true, () => {})).toBeFalsy();
        expect(isValidTypeCasting('integer', false, () => {})).toBeFalsy();
        expect(isValidTypeCasting('integer', true, date)).toBeFalsy();
        expect(isValidTypeCasting('integer', false, date)).toBeFalsy();
        expect(isValidTypeCasting('integer', true, dictionary)).toBeFalsy();
        expect(isValidTypeCasting('integer', false, dictionary)).toBeFalsy();
        expect(isValidTypeCasting('integer', true, float)).toBeFalsy();
        expect(isValidTypeCasting('integer', false, float)).toBeFalsy();
        expect(isValidTypeCasting('integer', true, generator)).toBeFalsy();
        expect(isValidTypeCasting('integer', false, generator)).toBeFalsy();
        expect(isValidTypeCasting('integer', true, generator())).toBeFalsy();
        expect(isValidTypeCasting('integer', false, generator())).toBeFalsy();
        expect(isValidTypeCasting('integer', true, integer)).toBeTruthy();
        expect(isValidTypeCasting('integer', false, integer)).toBeTruthy();
        expect(isValidTypeCasting('integer', true, iterator)).toBeFalsy();
        expect(isValidTypeCasting('integer', false, iterator)).toBeFalsy();
        expect(isValidTypeCasting('integer', true, map)).toBeFalsy();
        expect(isValidTypeCasting('integer', false, map)).toBeFalsy();
        expect(isValidTypeCasting('integer', true, number)).toBeTruthy();
        expect(isValidTypeCasting('integer', false, number)).toBeTruthy();
        expect(isValidTypeCasting('integer', true, object)).toBeFalsy();
        expect(isValidTypeCasting('integer', false, object)).toBeFalsy();
        expect(isValidTypeCasting('integer', true, set)).toBeFalsy();
        expect(isValidTypeCasting('integer', false, set)).toBeFalsy();
        expect(isValidTypeCasting('integer', true, string)).toBeFalsy();
        expect(isValidTypeCasting('integer', false, string)).toBeFalsy();
        expect(isValidTypeCasting('integer', true, symbol)).toBeFalsy();
        expect(isValidTypeCasting('integer', false, symbol)).toBeFalsy();
        expect(isValidTypeCasting('integer', true, weakmap)).toBeFalsy();
        expect(isValidTypeCasting('integer', false, weakmap)).toBeFalsy();
        expect(isValidTypeCasting('integer', true, weakset)).toBeFalsy();
        expect(isValidTypeCasting('integer', false, weakset)).toBeFalsy();
        expect(isValidTypeCasting('integer', true, test)).toBeFalsy();
        expect(isValidTypeCasting('integer', false, test)).toBeFalsy();
        expect(isValidTypeCasting('integer', true, typedArray)).toBeFalsy();
        expect(isValidTypeCasting('integer', false, typedArray)).toBeFalsy();
        expect(isValidTypeCasting('integer', true, testExtended)).toBeFalsy();
        expect(isValidTypeCasting('integer', false, testExtended)).toBeFalsy();
        expect(isValidTypeCasting('integer', true, testExtendedAgain)).toBeFalsy();
        expect(isValidTypeCasting('integer', false, testExtendedAgain)).toBeFalsy();
    });

    it('works validate type iterable', function () {
        expect(isValidTypeCasting('iterable', true, undefined)).toBeTruthy();
        expect(isValidTypeCasting('iterable', false, undefined)).toBeFalsy();
        // when value is null and parameter hasDefault, we need an extra parameter isNullable to validate
        expect(isValidTypeCasting('iterable', true, null, true)).toBeTruthy();
        expect(isValidTypeCasting('iterable', true, null, false)).toBeFalsy();
        expect(isValidTypeCasting('iterable', false, null)).toBeFalsy();
        expect(isValidTypeCasting('iterable', true, array)).toBeTruthy();
        expect(isValidTypeCasting('iterable', false, array)).toBeTruthy();
        expect(isValidTypeCasting('iterable', true, promise)).toBeFalsy();
        expect(isValidTypeCasting('iterable', false, promise)).toBeFalsy();
        expect(isValidTypeCasting('iterable', true, asyncFn)).toBeFalsy();
        expect(isValidTypeCasting('iterable', false, asyncFn)).toBeFalsy();
        expect(isValidTypeCasting('iterable', true, bigint)).toBeFalsy();
        expect(isValidTypeCasting('iterable', false, bigint)).toBeFalsy();
        expect(isValidTypeCasting('iterable', true, boolean)).toBeFalsy();
        expect(isValidTypeCasting('iterable', false, boolean)).toBeFalsy();
        expect(isValidTypeCasting('iterable', true, test.callable)).toBeFalsy();
        expect(isValidTypeCasting('iterable', false, test.callable)).toBeFalsy();
        expect(isValidTypeCasting('iterable', true, () => {})).toBeFalsy();
        expect(isValidTypeCasting('iterable', false, () => {})).toBeFalsy();
        expect(isValidTypeCasting('iterable', true, date)).toBeFalsy();
        expect(isValidTypeCasting('iterable', false, date)).toBeFalsy();
        expect(isValidTypeCasting('iterable', true, dictionary)).toBeFalsy();
        expect(isValidTypeCasting('iterable', false, dictionary)).toBeFalsy();
        expect(isValidTypeCasting('iterable', true, float)).toBeFalsy();
        expect(isValidTypeCasting('iterable', false, float)).toBeFalsy();
        expect(isValidTypeCasting('iterable', true, generator)).toBeTruthy();
        expect(isValidTypeCasting('iterable', false, generator)).toBeTruthy();
        expect(isValidTypeCasting('iterable', true, generator())).toBeTruthy();
        expect(isValidTypeCasting('iterable', false, generator())).toBeTruthy();
        expect(isValidTypeCasting('iterable', true, integer)).toBeFalsy();
        expect(isValidTypeCasting('iterable', false, integer)).toBeFalsy();
        expect(isValidTypeCasting('iterable', true, iterator)).toBeTruthy();
        expect(isValidTypeCasting('iterable', false, iterator)).toBeTruthy();
        expect(isValidTypeCasting('iterable', true, map)).toBeTruthy();
        expect(isValidTypeCasting('iterable', false, map)).toBeTruthy();
        expect(isValidTypeCasting('iterable', true, number)).toBeFalsy();
        expect(isValidTypeCasting('iterable', false, number)).toBeFalsy();
        expect(isValidTypeCasting('iterable', true, object)).toBeFalsy();
        expect(isValidTypeCasting('iterable', false, object)).toBeFalsy();
        expect(isValidTypeCasting('iterable', true, set)).toBeTruthy();
        expect(isValidTypeCasting('iterable', false, set)).toBeTruthy();
        expect(isValidTypeCasting('iterable', true, string)).toBeFalsy();
        expect(isValidTypeCasting('iterable', false, string)).toBeFalsy();
        expect(isValidTypeCasting('iterable', true, symbol)).toBeFalsy();
        expect(isValidTypeCasting('iterable', false, symbol)).toBeFalsy();
        expect(isValidTypeCasting('iterable', true, weakmap)).toBeFalsy();
        expect(isValidTypeCasting('iterable', false, weakmap)).toBeFalsy();
        expect(isValidTypeCasting('iterable', true, weakset)).toBeFalsy();
        expect(isValidTypeCasting('iterable', false, weakset)).toBeFalsy();
        expect(isValidTypeCasting('iterable', true, test)).toBeFalsy();
        expect(isValidTypeCasting('iterable', false, test)).toBeFalsy();
        expect(isValidTypeCasting('iterable', true, typedArray)).toBeFalsy();
        expect(isValidTypeCasting('iterable', false, typedArray)).toBeFalsy();
        expect(isValidTypeCasting('iterable', true, testExtended)).toBeFalsy();
        expect(isValidTypeCasting('iterable', false, testExtended)).toBeFalsy();
        expect(isValidTypeCasting('iterable', true, testExtendedAgain)).toBeFalsy();
        expect(isValidTypeCasting('iterable', false, testExtendedAgain)).toBeFalsy();
    });

    it('works validate type map', function () {
        expect(isValidTypeCasting('map', true, undefined)).toBeTruthy();
        expect(isValidTypeCasting('map', false, undefined)).toBeFalsy();
        // when value is null and parameter hasDefault, we need an extra parameter isNullable to validate
        expect(isValidTypeCasting('map', true, null, true)).toBeTruthy();
        expect(isValidTypeCasting('map', true, null, false)).toBeFalsy();
        expect(isValidTypeCasting('map', false, null)).toBeFalsy();
        expect(isValidTypeCasting('map', true, array)).toBeFalsy();
        expect(isValidTypeCasting('map', false, array)).toBeFalsy();
        expect(isValidTypeCasting('map', true, promise)).toBeFalsy();
        expect(isValidTypeCasting('map', false, promise)).toBeFalsy();
        expect(isValidTypeCasting('map', true, asyncFn)).toBeFalsy();
        expect(isValidTypeCasting('map', false, asyncFn)).toBeFalsy();
        expect(isValidTypeCasting('map', true, bigint)).toBeFalsy();
        expect(isValidTypeCasting('map', false, bigint)).toBeFalsy();
        expect(isValidTypeCasting('map', true, boolean)).toBeFalsy();
        expect(isValidTypeCasting('map', false, boolean)).toBeFalsy();
        expect(isValidTypeCasting('map', true, test.callable)).toBeFalsy();
        expect(isValidTypeCasting('map', false, test.callable)).toBeFalsy();
        expect(isValidTypeCasting('map', true, () => {})).toBeFalsy();
        expect(isValidTypeCasting('map', false, () => {})).toBeFalsy();
        expect(isValidTypeCasting('map', true, date)).toBeFalsy();
        expect(isValidTypeCasting('map', false, date)).toBeFalsy();
        expect(isValidTypeCasting('map', true, dictionary)).toBeFalsy();
        expect(isValidTypeCasting('map', false, dictionary)).toBeFalsy();
        expect(isValidTypeCasting('map', true, float)).toBeFalsy();
        expect(isValidTypeCasting('map', false, float)).toBeFalsy();
        expect(isValidTypeCasting('map', true, generator)).toBeFalsy();
        expect(isValidTypeCasting('map', false, generator)).toBeFalsy();
        expect(isValidTypeCasting('map', true, generator())).toBeFalsy();
        expect(isValidTypeCasting('map', false, generator())).toBeFalsy();
        expect(isValidTypeCasting('map', true, integer)).toBeFalsy();
        expect(isValidTypeCasting('map', false, integer)).toBeFalsy();
        expect(isValidTypeCasting('map', true, iterator)).toBeFalsy();
        expect(isValidTypeCasting('map', false, iterator)).toBeFalsy();
        expect(isValidTypeCasting('map', true, map)).toBeTruthy();
        expect(isValidTypeCasting('map', false, map)).toBeTruthy();
        expect(isValidTypeCasting('map', true, number)).toBeFalsy();
        expect(isValidTypeCasting('map', false, number)).toBeFalsy();
        expect(isValidTypeCasting('map', true, object)).toBeFalsy();
        expect(isValidTypeCasting('map', false, object)).toBeFalsy();
        expect(isValidTypeCasting('map', true, set)).toBeFalsy();
        expect(isValidTypeCasting('map', false, set)).toBeFalsy();
        expect(isValidTypeCasting('map', true, string)).toBeFalsy();
        expect(isValidTypeCasting('map', false, string)).toBeFalsy();
        expect(isValidTypeCasting('map', true, symbol)).toBeFalsy();
        expect(isValidTypeCasting('map', false, symbol)).toBeFalsy();
        expect(isValidTypeCasting('map', true, weakmap)).toBeFalsy();
        expect(isValidTypeCasting('map', false, weakmap)).toBeFalsy();
        expect(isValidTypeCasting('map', true, weakset)).toBeFalsy();
        expect(isValidTypeCasting('map', false, weakset)).toBeFalsy();
        expect(isValidTypeCasting('map', true, test)).toBeFalsy();
        expect(isValidTypeCasting('map', false, test)).toBeFalsy();
        expect(isValidTypeCasting('map', true, typedArray)).toBeFalsy();
        expect(isValidTypeCasting('map', false, typedArray)).toBeFalsy();
        expect(isValidTypeCasting('map', true, testExtended)).toBeFalsy();
        expect(isValidTypeCasting('map', false, testExtended)).toBeFalsy();
        expect(isValidTypeCasting('map', true, testExtendedAgain)).toBeFalsy();
        expect(isValidTypeCasting('map', false, testExtendedAgain)).toBeFalsy();
    });

    it('works validate type number', function () {
        expect(isValidTypeCasting('number', true, undefined)).toBeTruthy();
        expect(isValidTypeCasting('number', false, undefined)).toBeFalsy();
        // when value is null and parameter hasDefault, we need an extra parameter isNullable to validate
        expect(isValidTypeCasting('number', true, null, true)).toBeTruthy();
        expect(isValidTypeCasting('number', true, null, false)).toBeFalsy();
        expect(isValidTypeCasting('number', false, null)).toBeFalsy();
        expect(isValidTypeCasting('number', true, array)).toBeFalsy();
        expect(isValidTypeCasting('number', false, array)).toBeFalsy();
        expect(isValidTypeCasting('number', true, promise)).toBeFalsy();
        expect(isValidTypeCasting('number', false, promise)).toBeFalsy();
        expect(isValidTypeCasting('number', true, asyncFn)).toBeFalsy();
        expect(isValidTypeCasting('number', false, asyncFn)).toBeFalsy();
        expect(isValidTypeCasting('number', true, bigint)).toBeFalsy();
        expect(isValidTypeCasting('number', false, bigint)).toBeFalsy();
        expect(isValidTypeCasting('number', true, boolean)).toBeFalsy();
        expect(isValidTypeCasting('number', false, boolean)).toBeFalsy();
        expect(isValidTypeCasting('number', true, test.callable)).toBeFalsy();
        expect(isValidTypeCasting('number', false, test.callable)).toBeFalsy();
        expect(isValidTypeCasting('number', true, () => {})).toBeFalsy();
        expect(isValidTypeCasting('number', false, () => {})).toBeFalsy();
        expect(isValidTypeCasting('number', true, date)).toBeFalsy();
        expect(isValidTypeCasting('number', false, date)).toBeFalsy();
        expect(isValidTypeCasting('number', true, dictionary)).toBeFalsy();
        expect(isValidTypeCasting('number', false, dictionary)).toBeFalsy();
        expect(isValidTypeCasting('number', true, float)).toBeTruthy();
        expect(isValidTypeCasting('number', false, float)).toBeTruthy();
        expect(isValidTypeCasting('number', true, generator)).toBeFalsy();
        expect(isValidTypeCasting('number', false, generator)).toBeFalsy();
        expect(isValidTypeCasting('number', true, generator())).toBeFalsy();
        expect(isValidTypeCasting('number', false, generator())).toBeFalsy();
        expect(isValidTypeCasting('number', true, integer)).toBeTruthy();
        expect(isValidTypeCasting('number', false, integer)).toBeTruthy();
        expect(isValidTypeCasting('number', true, iterator)).toBeFalsy();
        expect(isValidTypeCasting('number', false, iterator)).toBeFalsy();
        expect(isValidTypeCasting('number', true, map)).toBeFalsy();
        expect(isValidTypeCasting('number', false, map)).toBeFalsy();
        expect(isValidTypeCasting('number', true, number)).toBeTruthy();
        expect(isValidTypeCasting('number', false, number)).toBeTruthy();
        expect(isValidTypeCasting('number', true, object)).toBeFalsy();
        expect(isValidTypeCasting('number', false, object)).toBeFalsy();
        expect(isValidTypeCasting('number', true, set)).toBeFalsy();
        expect(isValidTypeCasting('number', false, set)).toBeFalsy();
        expect(isValidTypeCasting('number', true, string)).toBeFalsy();
        expect(isValidTypeCasting('number', false, string)).toBeFalsy();
        expect(isValidTypeCasting('number', true, symbol)).toBeFalsy();
        expect(isValidTypeCasting('number', false, symbol)).toBeFalsy();
        expect(isValidTypeCasting('number', true, weakmap)).toBeFalsy();
        expect(isValidTypeCasting('number', false, weakmap)).toBeFalsy();
        expect(isValidTypeCasting('number', true, weakset)).toBeFalsy();
        expect(isValidTypeCasting('number', false, weakset)).toBeFalsy();
        expect(isValidTypeCasting('number', true, test)).toBeFalsy();
        expect(isValidTypeCasting('number', false, test)).toBeFalsy();
        expect(isValidTypeCasting('number', true, typedArray)).toBeFalsy();
        expect(isValidTypeCasting('number', false, typedArray)).toBeFalsy();
        expect(isValidTypeCasting('number', true, testExtended)).toBeFalsy();
        expect(isValidTypeCasting('number', false, testExtended)).toBeFalsy();
        expect(isValidTypeCasting('number', true, testExtendedAgain)).toBeFalsy();
        expect(isValidTypeCasting('number', false, testExtendedAgain)).toBeFalsy();
    });

    it('works validate type promise', function () {
        expect(isValidTypeCasting('promise', true, undefined)).toBeTruthy();
        expect(isValidTypeCasting('promise', false, undefined)).toBeFalsy();
        // when value is null and parameter hasDefault, we need an extra parameter isNullable to validate
        expect(isValidTypeCasting('promise', true, null, true)).toBeTruthy();
        expect(isValidTypeCasting('promise', true, null, false)).toBeFalsy();
        expect(isValidTypeCasting('promise', false, null)).toBeFalsy();
        expect(isValidTypeCasting('promise', true, array)).toBeFalsy();
        expect(isValidTypeCasting('promise', false, array)).toBeFalsy();
        expect(isValidTypeCasting('promise', true, promise)).toBeTruthy();
        expect(isValidTypeCasting('promise', false, promise)).toBeTruthy();
        expect(isValidTypeCasting('promise', true, asyncFn)).toBeFalsy();
        expect(isValidTypeCasting('promise', false, asyncFn)).toBeFalsy();
        expect(isValidTypeCasting('promise', true, bigint)).toBeFalsy();
        expect(isValidTypeCasting('promise', false, bigint)).toBeFalsy();
        expect(isValidTypeCasting('promise', true, boolean)).toBeFalsy();
        expect(isValidTypeCasting('promise', false, boolean)).toBeFalsy();
        expect(isValidTypeCasting('promise', true, test.callable)).toBeFalsy();
        expect(isValidTypeCasting('promise', false, test.callable)).toBeFalsy();
        expect(isValidTypeCasting('promise', true, () => {})).toBeFalsy();
        expect(isValidTypeCasting('promise', false, () => {})).toBeFalsy();
        expect(isValidTypeCasting('promise', true, date)).toBeFalsy();
        expect(isValidTypeCasting('promise', false, date)).toBeFalsy();
        expect(isValidTypeCasting('promise', true, dictionary)).toBeFalsy();
        expect(isValidTypeCasting('promise', false, dictionary)).toBeFalsy();
        expect(isValidTypeCasting('promise', true, float)).toBeFalsy();
        expect(isValidTypeCasting('promise', false, float)).toBeFalsy();
        expect(isValidTypeCasting('promise', true, generator)).toBeFalsy();
        expect(isValidTypeCasting('promise', false, generator)).toBeFalsy();
        expect(isValidTypeCasting('promise', true, generator())).toBeFalsy();
        expect(isValidTypeCasting('promise', false, generator())).toBeFalsy();
        expect(isValidTypeCasting('promise', true, integer)).toBeFalsy();
        expect(isValidTypeCasting('promise', false, integer)).toBeFalsy();
        expect(isValidTypeCasting('promise', true, iterator)).toBeFalsy();
        expect(isValidTypeCasting('promise', false, iterator)).toBeFalsy();
        expect(isValidTypeCasting('promise', true, map)).toBeFalsy();
        expect(isValidTypeCasting('promise', false, map)).toBeFalsy();
        expect(isValidTypeCasting('promise', true, number)).toBeFalsy();
        expect(isValidTypeCasting('promise', false, number)).toBeFalsy();
        expect(isValidTypeCasting('promise', true, object)).toBeFalsy();
        expect(isValidTypeCasting('promise', false, object)).toBeFalsy();
        expect(isValidTypeCasting('promise', true, set)).toBeFalsy();
        expect(isValidTypeCasting('promise', false, set)).toBeFalsy();
        expect(isValidTypeCasting('promise', true, string)).toBeFalsy();
        expect(isValidTypeCasting('promise', false, string)).toBeFalsy();
        expect(isValidTypeCasting('promise', true, symbol)).toBeFalsy();
        expect(isValidTypeCasting('promise', false, symbol)).toBeFalsy();
        expect(isValidTypeCasting('promise', true, weakmap)).toBeFalsy();
        expect(isValidTypeCasting('promise', false, weakmap)).toBeFalsy();
        expect(isValidTypeCasting('promise', true, weakset)).toBeFalsy();
        expect(isValidTypeCasting('promise', false, weakset)).toBeFalsy();
        expect(isValidTypeCasting('promise', true, test)).toBeFalsy();
        expect(isValidTypeCasting('promise', false, test)).toBeFalsy();
        expect(isValidTypeCasting('promise', true, typedArray)).toBeFalsy();
        expect(isValidTypeCasting('promise', false, typedArray)).toBeFalsy();
        expect(isValidTypeCasting('promise', true, testExtended)).toBeFalsy();
        expect(isValidTypeCasting('promise', false, testExtended)).toBeFalsy();
        expect(isValidTypeCasting('promise', true, testExtendedAgain)).toBeFalsy();
        expect(isValidTypeCasting('promise', false, testExtendedAgain)).toBeFalsy();
    });

    it('works validate type set', function () {
        expect(isValidTypeCasting('set', true, undefined)).toBeTruthy();
        expect(isValidTypeCasting('set', false, undefined)).toBeFalsy();
        // when value is null and parameter hasDefault, we need an extra parameter isNullable to validate
        expect(isValidTypeCasting('set', true, null, true)).toBeTruthy();
        expect(isValidTypeCasting('set', true, null, false)).toBeFalsy();
        expect(isValidTypeCasting('set', false, null)).toBeFalsy();
        expect(isValidTypeCasting('set', true, array)).toBeFalsy();
        expect(isValidTypeCasting('set', false, array)).toBeFalsy();
        expect(isValidTypeCasting('set', true, promise)).toBeFalsy();
        expect(isValidTypeCasting('set', false, promise)).toBeFalsy();
        expect(isValidTypeCasting('set', true, asyncFn)).toBeFalsy();
        expect(isValidTypeCasting('set', false, asyncFn)).toBeFalsy();
        expect(isValidTypeCasting('set', true, bigint)).toBeFalsy();
        expect(isValidTypeCasting('set', false, bigint)).toBeFalsy();
        expect(isValidTypeCasting('set', true, boolean)).toBeFalsy();
        expect(isValidTypeCasting('set', false, boolean)).toBeFalsy();
        expect(isValidTypeCasting('set', true, test.callable)).toBeFalsy();
        expect(isValidTypeCasting('set', false, test.callable)).toBeFalsy();
        expect(isValidTypeCasting('set', true, () => {})).toBeFalsy();
        expect(isValidTypeCasting('set', false, () => {})).toBeFalsy();
        expect(isValidTypeCasting('set', true, date)).toBeFalsy();
        expect(isValidTypeCasting('set', false, date)).toBeFalsy();
        expect(isValidTypeCasting('set', true, dictionary)).toBeFalsy();
        expect(isValidTypeCasting('set', false, dictionary)).toBeFalsy();
        expect(isValidTypeCasting('set', true, float)).toBeFalsy();
        expect(isValidTypeCasting('set', false, float)).toBeFalsy();
        expect(isValidTypeCasting('set', true, generator)).toBeFalsy();
        expect(isValidTypeCasting('set', false, generator)).toBeFalsy();
        expect(isValidTypeCasting('set', true, generator())).toBeFalsy();
        expect(isValidTypeCasting('set', false, generator())).toBeFalsy();
        expect(isValidTypeCasting('set', true, integer)).toBeFalsy();
        expect(isValidTypeCasting('set', false, integer)).toBeFalsy();
        expect(isValidTypeCasting('set', true, iterator)).toBeFalsy();
        expect(isValidTypeCasting('set', false, iterator)).toBeFalsy();
        expect(isValidTypeCasting('set', true, map)).toBeFalsy();
        expect(isValidTypeCasting('set', false, map)).toBeFalsy();
        expect(isValidTypeCasting('set', true, number)).toBeFalsy();
        expect(isValidTypeCasting('set', false, number)).toBeFalsy();
        expect(isValidTypeCasting('set', true, object)).toBeFalsy();
        expect(isValidTypeCasting('set', false, object)).toBeFalsy();
        expect(isValidTypeCasting('set', true, set)).toBeTruthy();
        expect(isValidTypeCasting('set', false, set)).toBeTruthy();
        expect(isValidTypeCasting('set', true, string)).toBeFalsy();
        expect(isValidTypeCasting('set', false, string)).toBeFalsy();
        expect(isValidTypeCasting('set', true, symbol)).toBeFalsy();
        expect(isValidTypeCasting('set', false, symbol)).toBeFalsy();
        expect(isValidTypeCasting('set', true, weakmap)).toBeFalsy();
        expect(isValidTypeCasting('set', false, weakmap)).toBeFalsy();
        expect(isValidTypeCasting('set', true, weakset)).toBeFalsy();
        expect(isValidTypeCasting('set', false, weakset)).toBeFalsy();
        expect(isValidTypeCasting('set', true, test)).toBeFalsy();
        expect(isValidTypeCasting('set', false, test)).toBeFalsy();
        expect(isValidTypeCasting('set', true, typedArray)).toBeFalsy();
        expect(isValidTypeCasting('set', false, typedArray)).toBeFalsy();
        expect(isValidTypeCasting('set', true, testExtended)).toBeFalsy();
        expect(isValidTypeCasting('set', false, testExtended)).toBeFalsy();
        expect(isValidTypeCasting('set', true, testExtendedAgain)).toBeFalsy();
        expect(isValidTypeCasting('set', false, testExtendedAgain)).toBeFalsy();
    });

    it('works validate type string', function () {
        expect(isValidTypeCasting('string', true, undefined)).toBeTruthy();
        expect(isValidTypeCasting('string', false, undefined)).toBeFalsy();
        // when value is null and parameter hasDefault, we need an extra parameter isNullable to validate
        expect(isValidTypeCasting('string', true, null, true)).toBeTruthy();
        expect(isValidTypeCasting('string', true, null, false)).toBeFalsy();
        expect(isValidTypeCasting('string', false, null)).toBeFalsy();
        expect(isValidTypeCasting('string', true, array)).toBeFalsy();
        expect(isValidTypeCasting('string', false, array)).toBeFalsy();
        expect(isValidTypeCasting('string', true, promise)).toBeFalsy();
        expect(isValidTypeCasting('string', false, promise)).toBeFalsy();
        expect(isValidTypeCasting('string', true, asyncFn)).toBeFalsy();
        expect(isValidTypeCasting('string', false, asyncFn)).toBeFalsy();
        expect(isValidTypeCasting('string', true, bigint)).toBeFalsy();
        expect(isValidTypeCasting('string', false, bigint)).toBeFalsy();
        expect(isValidTypeCasting('string', true, boolean)).toBeFalsy();
        expect(isValidTypeCasting('string', false, boolean)).toBeFalsy();
        expect(isValidTypeCasting('string', true, test.callable)).toBeFalsy();
        expect(isValidTypeCasting('string', false, test.callable)).toBeFalsy();
        expect(isValidTypeCasting('string', true, () => {})).toBeFalsy();
        expect(isValidTypeCasting('string', false, () => {})).toBeFalsy();
        expect(isValidTypeCasting('string', true, date)).toBeFalsy();
        expect(isValidTypeCasting('string', false, date)).toBeFalsy();
        expect(isValidTypeCasting('string', true, dictionary)).toBeFalsy();
        expect(isValidTypeCasting('string', false, dictionary)).toBeFalsy();
        expect(isValidTypeCasting('string', true, float)).toBeFalsy();
        expect(isValidTypeCasting('string', false, float)).toBeFalsy();
        expect(isValidTypeCasting('string', true, generator)).toBeFalsy();
        expect(isValidTypeCasting('string', false, generator)).toBeFalsy();
        expect(isValidTypeCasting('string', true, generator())).toBeFalsy();
        expect(isValidTypeCasting('string', false, generator())).toBeFalsy();
        expect(isValidTypeCasting('string', true, integer)).toBeFalsy();
        expect(isValidTypeCasting('string', false, integer)).toBeFalsy();
        expect(isValidTypeCasting('string', true, iterator)).toBeFalsy();
        expect(isValidTypeCasting('string', false, iterator)).toBeFalsy();
        expect(isValidTypeCasting('string', true, map)).toBeFalsy();
        expect(isValidTypeCasting('string', false, map)).toBeFalsy();
        expect(isValidTypeCasting('string', true, number)).toBeFalsy();
        expect(isValidTypeCasting('string', false, number)).toBeFalsy();
        expect(isValidTypeCasting('string', true, object)).toBeFalsy();
        expect(isValidTypeCasting('string', false, object)).toBeFalsy();
        expect(isValidTypeCasting('string', true, set)).toBeFalsy();
        expect(isValidTypeCasting('string', false, set)).toBeFalsy();
        expect(isValidTypeCasting('string', true, string)).toBeTruthy();
        expect(isValidTypeCasting('string', false, string)).toBeTruthy();
        expect(isValidTypeCasting('string', true, symbol)).toBeFalsy();
        expect(isValidTypeCasting('string', false, symbol)).toBeFalsy();
        expect(isValidTypeCasting('string', true, weakmap)).toBeFalsy();
        expect(isValidTypeCasting('string', false, weakmap)).toBeFalsy();
        expect(isValidTypeCasting('string', true, weakset)).toBeFalsy();
        expect(isValidTypeCasting('string', false, weakset)).toBeFalsy();
        expect(isValidTypeCasting('string', true, test)).toBeFalsy();
        expect(isValidTypeCasting('string', false, test)).toBeFalsy();
        expect(isValidTypeCasting('string', true, typedArray)).toBeFalsy();
        expect(isValidTypeCasting('string', false, typedArray)).toBeFalsy();
        expect(isValidTypeCasting('string', true, testExtended)).toBeFalsy();
        expect(isValidTypeCasting('string', false, testExtended)).toBeFalsy();
        expect(isValidTypeCasting('string', true, testExtendedAgain)).toBeFalsy();
        expect(isValidTypeCasting('string', false, testExtendedAgain)).toBeFalsy();
    });

    it('works validate type symbol', function () {
        expect(isValidTypeCasting('symbol', true, undefined)).toBeTruthy();
        expect(isValidTypeCasting('symbol', false, undefined)).toBeFalsy();
        // when value is null and parameter hasDefault, we need an extra parameter isNullable to validate
        expect(isValidTypeCasting('symbol', true, null, true)).toBeTruthy();
        expect(isValidTypeCasting('symbol', true, null, false)).toBeFalsy();
        expect(isValidTypeCasting('symbol', false, null)).toBeFalsy();
        expect(isValidTypeCasting('symbol', true, array)).toBeFalsy();
        expect(isValidTypeCasting('symbol', false, array)).toBeFalsy();
        expect(isValidTypeCasting('symbol', true, promise)).toBeFalsy();
        expect(isValidTypeCasting('symbol', false, promise)).toBeFalsy();
        expect(isValidTypeCasting('symbol', true, asyncFn)).toBeFalsy();
        expect(isValidTypeCasting('symbol', false, asyncFn)).toBeFalsy();
        expect(isValidTypeCasting('symbol', true, bigint)).toBeFalsy();
        expect(isValidTypeCasting('symbol', false, bigint)).toBeFalsy();
        expect(isValidTypeCasting('symbol', true, boolean)).toBeFalsy();
        expect(isValidTypeCasting('symbol', false, boolean)).toBeFalsy();
        expect(isValidTypeCasting('symbol', true, test.callable)).toBeFalsy();
        expect(isValidTypeCasting('symbol', false, test.callable)).toBeFalsy();
        expect(isValidTypeCasting('symbol', true, () => {})).toBeFalsy();
        expect(isValidTypeCasting('symbol', false, () => {})).toBeFalsy();
        expect(isValidTypeCasting('symbol', true, date)).toBeFalsy();
        expect(isValidTypeCasting('symbol', false, date)).toBeFalsy();
        expect(isValidTypeCasting('symbol', true, dictionary)).toBeFalsy();
        expect(isValidTypeCasting('symbol', false, dictionary)).toBeFalsy();
        expect(isValidTypeCasting('symbol', true, float)).toBeFalsy();
        expect(isValidTypeCasting('symbol', false, float)).toBeFalsy();
        expect(isValidTypeCasting('symbol', true, generator)).toBeFalsy();
        expect(isValidTypeCasting('symbol', false, generator)).toBeFalsy();
        expect(isValidTypeCasting('symbol', true, generator())).toBeFalsy();
        expect(isValidTypeCasting('symbol', false, generator())).toBeFalsy();
        expect(isValidTypeCasting('symbol', true, integer)).toBeFalsy();
        expect(isValidTypeCasting('symbol', false, integer)).toBeFalsy();
        expect(isValidTypeCasting('symbol', true, iterator)).toBeFalsy();
        expect(isValidTypeCasting('symbol', false, iterator)).toBeFalsy();
        expect(isValidTypeCasting('symbol', true, map)).toBeFalsy();
        expect(isValidTypeCasting('symbol', false, map)).toBeFalsy();
        expect(isValidTypeCasting('symbol', true, number)).toBeFalsy();
        expect(isValidTypeCasting('symbol', false, number)).toBeFalsy();
        expect(isValidTypeCasting('symbol', true, object)).toBeFalsy();
        expect(isValidTypeCasting('symbol', false, object)).toBeFalsy();
        expect(isValidTypeCasting('symbol', true, set)).toBeFalsy();
        expect(isValidTypeCasting('symbol', false, set)).toBeFalsy();
        expect(isValidTypeCasting('symbol', true, string)).toBeFalsy();
        expect(isValidTypeCasting('symbol', false, string)).toBeFalsy();
        expect(isValidTypeCasting('symbol', true, symbol)).toBeTruthy();
        expect(isValidTypeCasting('symbol', false, symbol)).toBeTruthy();
        expect(isValidTypeCasting('symbol', true, weakmap)).toBeFalsy();
        expect(isValidTypeCasting('symbol', false, weakmap)).toBeFalsy();
        expect(isValidTypeCasting('symbol', true, weakset)).toBeFalsy();
        expect(isValidTypeCasting('symbol', false, weakset)).toBeFalsy();
        expect(isValidTypeCasting('symbol', true, test)).toBeFalsy();
        expect(isValidTypeCasting('symbol', false, test)).toBeFalsy();
        expect(isValidTypeCasting('symbol', true, typedArray)).toBeFalsy();
        expect(isValidTypeCasting('symbol', false, typedArray)).toBeFalsy();
        expect(isValidTypeCasting('symbol', true, testExtended)).toBeFalsy();
        expect(isValidTypeCasting('symbol', false, testExtended)).toBeFalsy();
        expect(isValidTypeCasting('symbol', true, testExtendedAgain)).toBeFalsy();
        expect(isValidTypeCasting('symbol', false, testExtendedAgain)).toBeFalsy();
    });

    it('works validate type typedArray', function () {
        expect(isValidTypeCasting('typedArray', true, undefined)).toBeTruthy();
        expect(isValidTypeCasting('typedArray', false, undefined)).toBeFalsy();
        // when value is null and parameter hasDefault, we need an extra parameter isNullable to validate
        expect(isValidTypeCasting('typedArray', true, null, true)).toBeTruthy();
        expect(isValidTypeCasting('typedArray', true, null, false)).toBeFalsy();
        expect(isValidTypeCasting('typedArray', false, null)).toBeFalsy();
        expect(isValidTypeCasting('typedArray', true, array)).toBeFalsy();
        expect(isValidTypeCasting('typedArray', false, array)).toBeFalsy();
        expect(isValidTypeCasting('typedArray', true, promise)).toBeFalsy();
        expect(isValidTypeCasting('typedArray', false, promise)).toBeFalsy();
        expect(isValidTypeCasting('typedArray', true, asyncFn)).toBeFalsy();
        expect(isValidTypeCasting('typedArray', false, asyncFn)).toBeFalsy();
        expect(isValidTypeCasting('typedArray', true, bigint)).toBeFalsy();
        expect(isValidTypeCasting('typedArray', false, bigint)).toBeFalsy();
        expect(isValidTypeCasting('typedArray', true, boolean)).toBeFalsy();
        expect(isValidTypeCasting('typedArray', false, boolean)).toBeFalsy();
        expect(isValidTypeCasting('typedArray', true, test.callable)).toBeFalsy();
        expect(isValidTypeCasting('typedArray', false, test.callable)).toBeFalsy();
        expect(isValidTypeCasting('typedArray', true, () => {})).toBeFalsy();
        expect(isValidTypeCasting('typedArray', false, () => {})).toBeFalsy();
        expect(isValidTypeCasting('typedArray', true, date)).toBeFalsy();
        expect(isValidTypeCasting('typedArray', false, date)).toBeFalsy();
        expect(isValidTypeCasting('typedArray', true, dictionary)).toBeFalsy();
        expect(isValidTypeCasting('typedArray', false, dictionary)).toBeFalsy();
        expect(isValidTypeCasting('typedArray', true, float)).toBeFalsy();
        expect(isValidTypeCasting('typedArray', false, float)).toBeFalsy();
        expect(isValidTypeCasting('typedArray', true, generator)).toBeFalsy();
        expect(isValidTypeCasting('typedArray', false, generator)).toBeFalsy();
        expect(isValidTypeCasting('typedArray', true, generator())).toBeFalsy();
        expect(isValidTypeCasting('typedArray', false, generator())).toBeFalsy();
        expect(isValidTypeCasting('typedArray', true, integer)).toBeFalsy();
        expect(isValidTypeCasting('typedArray', false, integer)).toBeFalsy();
        expect(isValidTypeCasting('typedArray', true, iterator)).toBeFalsy();
        expect(isValidTypeCasting('typedArray', false, iterator)).toBeFalsy();
        expect(isValidTypeCasting('typedArray', true, map)).toBeFalsy();
        expect(isValidTypeCasting('typedArray', false, map)).toBeFalsy();
        expect(isValidTypeCasting('typedArray', true, number)).toBeFalsy();
        expect(isValidTypeCasting('typedArray', false, number)).toBeFalsy();
        expect(isValidTypeCasting('typedArray', true, object)).toBeFalsy();
        expect(isValidTypeCasting('typedArray', false, object)).toBeFalsy();
        expect(isValidTypeCasting('typedArray', true, set)).toBeFalsy();
        expect(isValidTypeCasting('typedArray', false, set)).toBeFalsy();
        expect(isValidTypeCasting('typedArray', true, string)).toBeFalsy();
        expect(isValidTypeCasting('typedArray', false, string)).toBeFalsy();
        expect(isValidTypeCasting('typedArray', true, symbol)).toBeFalsy();
        expect(isValidTypeCasting('typedArray', false, symbol)).toBeFalsy();
        expect(isValidTypeCasting('typedArray', true, weakmap)).toBeFalsy();
        expect(isValidTypeCasting('typedArray', false, weakmap)).toBeFalsy();
        expect(isValidTypeCasting('typedArray', true, weakset)).toBeFalsy();
        expect(isValidTypeCasting('typedArray', false, weakset)).toBeFalsy();
        expect(isValidTypeCasting('typedArray', true, test)).toBeFalsy();
        expect(isValidTypeCasting('typedArray', false, test)).toBeFalsy();
        expect(isValidTypeCasting('typedArray', true, typedArray)).toBeTruthy();
        expect(isValidTypeCasting('typedArray', false, typedArray)).toBeTruthy();
        expect(isValidTypeCasting('typedArray', true, testExtended)).toBeFalsy();
        expect(isValidTypeCasting('typedArray', false, testExtended)).toBeFalsy();
        expect(isValidTypeCasting('typedArray', true, testExtendedAgain)).toBeFalsy();
        expect(isValidTypeCasting('typedArray', false, testExtendedAgain)).toBeFalsy();
    });

    it('works validate type weakmap', function () {
        expect(isValidTypeCasting('weakmap', true, undefined)).toBeTruthy();
        expect(isValidTypeCasting('weakmap', false, undefined)).toBeFalsy();
        // when value is null and parameter hasDefault, we need an extra parameter isNullable to validate
        expect(isValidTypeCasting('weakmap', true, null, true)).toBeTruthy();
        expect(isValidTypeCasting('weakmap', true, null, false)).toBeFalsy();
        expect(isValidTypeCasting('weakmap', false, null)).toBeFalsy();
        expect(isValidTypeCasting('weakmap', true, array)).toBeFalsy();
        expect(isValidTypeCasting('weakmap', false, array)).toBeFalsy();
        expect(isValidTypeCasting('weakmap', true, promise)).toBeFalsy();
        expect(isValidTypeCasting('weakmap', false, promise)).toBeFalsy();
        expect(isValidTypeCasting('weakmap', true, asyncFn)).toBeFalsy();
        expect(isValidTypeCasting('weakmap', false, asyncFn)).toBeFalsy();
        expect(isValidTypeCasting('weakmap', true, bigint)).toBeFalsy();
        expect(isValidTypeCasting('weakmap', false, bigint)).toBeFalsy();
        expect(isValidTypeCasting('weakmap', true, boolean)).toBeFalsy();
        expect(isValidTypeCasting('weakmap', false, boolean)).toBeFalsy();
        expect(isValidTypeCasting('weakmap', true, test.callable)).toBeFalsy();
        expect(isValidTypeCasting('weakmap', false, test.callable)).toBeFalsy();
        expect(isValidTypeCasting('weakmap', true, () => {})).toBeFalsy();
        expect(isValidTypeCasting('weakmap', false, () => {})).toBeFalsy();
        expect(isValidTypeCasting('weakmap', true, date)).toBeFalsy();
        expect(isValidTypeCasting('weakmap', false, date)).toBeFalsy();
        expect(isValidTypeCasting('weakmap', true, dictionary)).toBeFalsy();
        expect(isValidTypeCasting('weakmap', false, dictionary)).toBeFalsy();
        expect(isValidTypeCasting('weakmap', true, float)).toBeFalsy();
        expect(isValidTypeCasting('weakmap', false, float)).toBeFalsy();
        expect(isValidTypeCasting('weakmap', true, generator)).toBeFalsy();
        expect(isValidTypeCasting('weakmap', false, generator)).toBeFalsy();
        expect(isValidTypeCasting('weakmap', true, generator())).toBeFalsy();
        expect(isValidTypeCasting('weakmap', false, generator())).toBeFalsy();
        expect(isValidTypeCasting('weakmap', true, integer)).toBeFalsy();
        expect(isValidTypeCasting('weakmap', false, integer)).toBeFalsy();
        expect(isValidTypeCasting('weakmap', true, iterator)).toBeFalsy();
        expect(isValidTypeCasting('weakmap', false, iterator)).toBeFalsy();
        expect(isValidTypeCasting('weakmap', true, map)).toBeFalsy();
        expect(isValidTypeCasting('weakmap', false, map)).toBeFalsy();
        expect(isValidTypeCasting('weakmap', true, number)).toBeFalsy();
        expect(isValidTypeCasting('weakmap', false, number)).toBeFalsy();
        expect(isValidTypeCasting('weakmap', true, object)).toBeFalsy();
        expect(isValidTypeCasting('weakmap', false, object)).toBeFalsy();
        expect(isValidTypeCasting('weakmap', true, set)).toBeFalsy();
        expect(isValidTypeCasting('weakmap', false, set)).toBeFalsy();
        expect(isValidTypeCasting('weakmap', true, string)).toBeFalsy();
        expect(isValidTypeCasting('weakmap', false, string)).toBeFalsy();
        expect(isValidTypeCasting('weakmap', true, symbol)).toBeFalsy();
        expect(isValidTypeCasting('weakmap', false, symbol)).toBeFalsy();
        expect(isValidTypeCasting('weakmap', true, weakmap)).toBeTruthy();
        expect(isValidTypeCasting('weakmap', false, weakmap)).toBeTruthy();
        expect(isValidTypeCasting('weakmap', true, weakset)).toBeFalsy();
        expect(isValidTypeCasting('weakmap', false, weakset)).toBeFalsy();
        expect(isValidTypeCasting('weakmap', true, test)).toBeFalsy();
        expect(isValidTypeCasting('weakmap', false, test)).toBeFalsy();
        expect(isValidTypeCasting('weakmap', true, typedArray)).toBeFalsy();
        expect(isValidTypeCasting('weakmap', false, typedArray)).toBeFalsy();
        expect(isValidTypeCasting('weakmap', true, testExtended)).toBeFalsy();
        expect(isValidTypeCasting('weakmap', false, testExtended)).toBeFalsy();
        expect(isValidTypeCasting('weakmap', true, testExtendedAgain)).toBeFalsy();
        expect(isValidTypeCasting('weakmap', false, testExtendedAgain)).toBeFalsy();
    });

    it('works validate type weakset', function () {
        expect(isValidTypeCasting('weakset', true, undefined)).toBeTruthy();
        expect(isValidTypeCasting('weakset', false, undefined)).toBeFalsy();
        // when value is null and parameter hasDefault, we need an extra parameter isNullable to validate
        expect(isValidTypeCasting('weakset', true, null, true)).toBeTruthy();
        expect(isValidTypeCasting('weakset', true, null, false)).toBeFalsy();
        expect(isValidTypeCasting('weakset', false, null)).toBeFalsy();
        expect(isValidTypeCasting('weakset', true, array)).toBeFalsy();
        expect(isValidTypeCasting('weakset', false, array)).toBeFalsy();
        expect(isValidTypeCasting('weakset', true, promise)).toBeFalsy();
        expect(isValidTypeCasting('weakset', false, promise)).toBeFalsy();
        expect(isValidTypeCasting('weakset', true, asyncFn)).toBeFalsy();
        expect(isValidTypeCasting('weakset', false, asyncFn)).toBeFalsy();
        expect(isValidTypeCasting('weakset', true, bigint)).toBeFalsy();
        expect(isValidTypeCasting('weakset', false, bigint)).toBeFalsy();
        expect(isValidTypeCasting('weakset', true, boolean)).toBeFalsy();
        expect(isValidTypeCasting('weakset', false, boolean)).toBeFalsy();
        expect(isValidTypeCasting('weakset', true, test.callable)).toBeFalsy();
        expect(isValidTypeCasting('weakset', false, test.callable)).toBeFalsy();
        expect(isValidTypeCasting('weakset', true, () => {})).toBeFalsy();
        expect(isValidTypeCasting('weakset', false, () => {})).toBeFalsy();
        expect(isValidTypeCasting('weakset', true, date)).toBeFalsy();
        expect(isValidTypeCasting('weakset', false, date)).toBeFalsy();
        expect(isValidTypeCasting('weakset', true, dictionary)).toBeFalsy();
        expect(isValidTypeCasting('weakset', false, dictionary)).toBeFalsy();
        expect(isValidTypeCasting('weakset', true, float)).toBeFalsy();
        expect(isValidTypeCasting('weakset', false, float)).toBeFalsy();
        expect(isValidTypeCasting('weakset', true, generator)).toBeFalsy();
        expect(isValidTypeCasting('weakset', false, generator)).toBeFalsy();
        expect(isValidTypeCasting('weakset', true, generator())).toBeFalsy();
        expect(isValidTypeCasting('weakset', false, generator())).toBeFalsy();
        expect(isValidTypeCasting('weakset', true, integer)).toBeFalsy();
        expect(isValidTypeCasting('weakset', false, integer)).toBeFalsy();
        expect(isValidTypeCasting('weakset', true, iterator)).toBeFalsy();
        expect(isValidTypeCasting('weakset', false, iterator)).toBeFalsy();
        expect(isValidTypeCasting('weakset', true, map)).toBeFalsy();
        expect(isValidTypeCasting('weakset', false, map)).toBeFalsy();
        expect(isValidTypeCasting('weakset', true, number)).toBeFalsy();
        expect(isValidTypeCasting('weakset', false, number)).toBeFalsy();
        expect(isValidTypeCasting('weakset', true, object)).toBeFalsy();
        expect(isValidTypeCasting('weakset', false, object)).toBeFalsy();
        expect(isValidTypeCasting('weakset', true, set)).toBeFalsy();
        expect(isValidTypeCasting('weakset', false, set)).toBeFalsy();
        expect(isValidTypeCasting('weakset', true, string)).toBeFalsy();
        expect(isValidTypeCasting('weakset', false, string)).toBeFalsy();
        expect(isValidTypeCasting('weakset', true, symbol)).toBeFalsy();
        expect(isValidTypeCasting('weakset', false, symbol)).toBeFalsy();
        expect(isValidTypeCasting('weakset', true, weakmap)).toBeFalsy();
        expect(isValidTypeCasting('weakset', false, weakmap)).toBeFalsy();
        expect(isValidTypeCasting('weakset', true, weakset)).toBeTruthy();
        expect(isValidTypeCasting('weakset', false, weakset)).toBeTruthy();
        expect(isValidTypeCasting('weakset', true, test)).toBeFalsy();
        expect(isValidTypeCasting('weakset', false, test)).toBeFalsy();
        expect(isValidTypeCasting('weakset', true, typedArray)).toBeFalsy();
        expect(isValidTypeCasting('weakset', false, typedArray)).toBeFalsy();
        expect(isValidTypeCasting('weakset', true, testExtended)).toBeFalsy();
        expect(isValidTypeCasting('weakset', false, testExtended)).toBeFalsy();
        expect(isValidTypeCasting('weakset', true, testExtendedAgain)).toBeFalsy();
        expect(isValidTypeCasting('weakset', false, testExtendedAgain)).toBeFalsy();
        expect(isValidTypeCasting('weakset', true, test)).toBeFalsy();
        expect(isValidTypeCasting('weakset', false, test)).toBeFalsy();
        expect(isValidTypeCasting('weakset', true, typedArray)).toBeFalsy();
        expect(isValidTypeCasting('weakset', false, typedArray)).toBeFalsy();
        expect(isValidTypeCasting('weakset', true, testExtended)).toBeFalsy();
        expect(isValidTypeCasting('weakset', false, testExtended)).toBeFalsy();
        expect(isValidTypeCasting('weakset', true, testExtendedAgain)).toBeFalsy();
        expect(isValidTypeCasting('weakset', false, testExtendedAgain)).toBeFalsy();
        expect(isValidTypeCasting('weakset', true, test)).toBeFalsy();
        expect(isValidTypeCasting('weakset', false, test)).toBeFalsy();
        expect(isValidTypeCasting('weakset', true, typedArray)).toBeFalsy();
        expect(isValidTypeCasting('weakset', false, typedArray)).toBeFalsy();
        expect(isValidTypeCasting('weakset', true, testExtended)).toBeFalsy();
        expect(isValidTypeCasting('weakset', false, testExtended)).toBeFalsy();
        expect(isValidTypeCasting('weakset', true, testExtendedAgain)).toBeFalsy();
        expect(isValidTypeCasting('weakset', false, testExtendedAgain)).toBeFalsy();
    });

    it('works validate type void', function () {
        expect(isValidTypeCasting('void', true, undefined)).toBeTruthy();
        expect(isValidTypeCasting('void', false, undefined)).toBeTruthy();
        // when value is null and parameter hasDefault, we need an extra parameter isNullable to validate
        expect(isValidTypeCasting('void', true, null, true)).toBeTruthy();
        expect(isValidTypeCasting('void', true, null, false)).toBeFalsy();
        expect(isValidTypeCasting('void', false, null)).toBeFalsy();
        expect(isValidTypeCasting('void', true, array)).toBeFalsy();
        expect(isValidTypeCasting('void', false, array)).toBeFalsy();
        expect(isValidTypeCasting('void', true, promise)).toBeFalsy();
        expect(isValidTypeCasting('void', false, promise)).toBeFalsy();
        expect(isValidTypeCasting('void', true, asyncFn)).toBeFalsy();
        expect(isValidTypeCasting('void', false, asyncFn)).toBeFalsy();
        expect(isValidTypeCasting('void', true, bigint)).toBeFalsy();
        expect(isValidTypeCasting('void', false, bigint)).toBeFalsy();
        expect(isValidTypeCasting('void', true, boolean)).toBeFalsy();
        expect(isValidTypeCasting('void', false, boolean)).toBeFalsy();
        expect(isValidTypeCasting('void', true, test.callable)).toBeFalsy();
        expect(isValidTypeCasting('void', false, test.callable)).toBeFalsy();
        expect(isValidTypeCasting('void', true, () => {})).toBeFalsy();
        expect(isValidTypeCasting('void', false, () => {})).toBeFalsy();
        expect(isValidTypeCasting('void', true, date)).toBeFalsy();
        expect(isValidTypeCasting('void', false, date)).toBeFalsy();
        expect(isValidTypeCasting('void', true, dictionary)).toBeFalsy();
        expect(isValidTypeCasting('void', false, dictionary)).toBeFalsy();
        expect(isValidTypeCasting('void', true, float)).toBeFalsy();
        expect(isValidTypeCasting('void', false, float)).toBeFalsy();
        expect(isValidTypeCasting('void', true, generator)).toBeFalsy();
        expect(isValidTypeCasting('void', false, generator)).toBeFalsy();
        expect(isValidTypeCasting('void', true, generator())).toBeFalsy();
        expect(isValidTypeCasting('void', false, generator())).toBeFalsy();
        expect(isValidTypeCasting('void', true, integer)).toBeFalsy();
        expect(isValidTypeCasting('void', false, integer)).toBeFalsy();
        expect(isValidTypeCasting('void', true, iterator)).toBeFalsy();
        expect(isValidTypeCasting('void', false, iterator)).toBeFalsy();
        expect(isValidTypeCasting('void', true, map)).toBeFalsy();
        expect(isValidTypeCasting('void', false, map)).toBeFalsy();
        expect(isValidTypeCasting('void', true, number)).toBeFalsy();
        expect(isValidTypeCasting('void', false, number)).toBeFalsy();
        expect(isValidTypeCasting('void', true, object)).toBeFalsy();
        expect(isValidTypeCasting('void', false, object)).toBeFalsy();
        expect(isValidTypeCasting('void', true, set)).toBeFalsy();
        expect(isValidTypeCasting('void', false, set)).toBeFalsy();
        expect(isValidTypeCasting('void', true, string)).toBeFalsy();
        expect(isValidTypeCasting('void', false, string)).toBeFalsy();
        expect(isValidTypeCasting('void', true, symbol)).toBeFalsy();
        expect(isValidTypeCasting('void', false, symbol)).toBeFalsy();
        expect(isValidTypeCasting('void', true, weakmap)).toBeFalsy();
        expect(isValidTypeCasting('void', false, weakmap)).toBeFalsy();
        expect(isValidTypeCasting('void', true, weakset)).toBeFalsy();
        expect(isValidTypeCasting('void', false, weakset)).toBeFalsy();
        expect(isValidTypeCasting('void', true, test)).toBeFalsy();
        expect(isValidTypeCasting('void', false, test)).toBeFalsy();
        expect(isValidTypeCasting('void', true, typedArray)).toBeFalsy();
        expect(isValidTypeCasting('void', false, typedArray)).toBeFalsy();
        expect(isValidTypeCasting('void', true, testExtended)).toBeFalsy();
        expect(isValidTypeCasting('void', false, testExtended)).toBeFalsy();
        expect(isValidTypeCasting('void', true, testExtendedAgain)).toBeFalsy();
        expect(isValidTypeCasting('void', false, testExtendedAgain)).toBeFalsy();
    });

    it('works validate type custom', function () {
        expect(isValidTypeCasting('Test', true, undefined, undefined, Test)).toBeTruthy();
        expect(isValidTypeCasting('Test', false, undefined, undefined, Test)).toBeFalsy();
        // when value is null and parameter hasDefault, we need an extra parameter isNullable to validate
        expect(isValidTypeCasting('Test', true, null, true, undefined, Test)).toBeTruthy();
        expect(isValidTypeCasting('Test', true, null, false, undefined, Test)).toBeFalsy();
        expect(isValidTypeCasting('Test', false, null, undefined, Test)).toBeFalsy();
        expect(isValidTypeCasting('Test', true, promise, undefined, Test)).toBeFalsy();
        expect(isValidTypeCasting('Test', false, promise, undefined, Test)).toBeFalsy();
        expect(isValidTypeCasting('Test', true, array, undefined, Test)).toBeFalsy();
        expect(isValidTypeCasting('Test', false, array, undefined, Test)).toBeFalsy();
        expect(isValidTypeCasting('Test', true, asyncFn, undefined, Test)).toBeFalsy();
        expect(isValidTypeCasting('Test', false, asyncFn, undefined, Test)).toBeFalsy();
        expect(isValidTypeCasting('Test', true, bigint, undefined, Test)).toBeFalsy();
        expect(isValidTypeCasting('Test', false, bigint, undefined, Test)).toBeFalsy();
        expect(isValidTypeCasting('Test', true, boolean, undefined, Test)).toBeFalsy();
        expect(isValidTypeCasting('Test', false, boolean, undefined, Test)).toBeFalsy();
        expect(isValidTypeCasting('Test', true, test.callable, undefined, Test)).toBeFalsy();
        expect(isValidTypeCasting('Test', false, test.callable, undefined, Test)).toBeFalsy();
        expect(isValidTypeCasting('Test', true, () => {}, undefined, Test)).toBeFalsy();
        expect(isValidTypeCasting('Test', false, () => {}, undefined, Test)).toBeFalsy();
        expect(isValidTypeCasting('Test', true, date, undefined, Test)).toBeFalsy();
        expect(isValidTypeCasting('Test', false, date, undefined, Test)).toBeFalsy();
        expect(isValidTypeCasting('Test', true, dictionary, undefined, Test)).toBeFalsy();
        expect(isValidTypeCasting('Test', false, dictionary, undefined, Test)).toBeFalsy();
        expect(isValidTypeCasting('Test', true, float, undefined, Test)).toBeFalsy();
        expect(isValidTypeCasting('Test', false, float, undefined, Test)).toBeFalsy();
        expect(isValidTypeCasting('Test', true, generator, undefined, Test)).toBeFalsy();
        expect(isValidTypeCasting('Test', false, generator, undefined, Test)).toBeFalsy();
        expect(isValidTypeCasting('Test', true, generator(), undefined, Test)).toBeFalsy();
        expect(isValidTypeCasting('Test', false, generator(), undefined, Test)).toBeFalsy();
        expect(isValidTypeCasting('Test', true, integer, undefined, Test)).toBeFalsy();
        expect(isValidTypeCasting('Test', false, integer, undefined, Test)).toBeFalsy();
        expect(isValidTypeCasting('Test', true, iterator, undefined, Test)).toBeFalsy();
        expect(isValidTypeCasting('Test', false, iterator, undefined, Test)).toBeFalsy();
        expect(isValidTypeCasting('Test', true, map, undefined, Test)).toBeFalsy();
        expect(isValidTypeCasting('Test', false, map, undefined, Test)).toBeFalsy();
        expect(isValidTypeCasting('Test', true, number, undefined, Test)).toBeFalsy();
        expect(isValidTypeCasting('Test', false, number, undefined, Test)).toBeFalsy();
        expect(isValidTypeCasting('Test', true, object, undefined, Test)).toBeFalsy();
        expect(isValidTypeCasting('Test', false, object, undefined, Test)).toBeFalsy();
        expect(isValidTypeCasting('Test', true, set, undefined, Test)).toBeFalsy();
        expect(isValidTypeCasting('Test', false, set, undefined, Test)).toBeFalsy();
        expect(isValidTypeCasting('Test', true, string, undefined, Test)).toBeFalsy();
        expect(isValidTypeCasting('Test', false, string, undefined, Test)).toBeFalsy();
        expect(isValidTypeCasting('Test', true, symbol, undefined, Test)).toBeFalsy();
        expect(isValidTypeCasting('Test', false, symbol, undefined, Test)).toBeFalsy();
        expect(isValidTypeCasting('Test', true, typedArray, undefined, Test)).toBeFalsy();
        expect(isValidTypeCasting('Test', false, typedArray, undefined, Test)).toBeFalsy();
        expect(isValidTypeCasting('Test', true, weakmap, undefined, Test)).toBeFalsy();
        expect(isValidTypeCasting('Test', false, weakmap, undefined, Test)).toBeFalsy();
        expect(isValidTypeCasting('Test', true, weakset, undefined, Test)).toBeFalsy();
        expect(isValidTypeCasting('Test', false, weakset, undefined, Test)).toBeFalsy();
        expect(isValidTypeCasting('Test', true, test, undefined, Test)).toBeTruthy();
        expect(isValidTypeCasting('Test', false, test, undefined, Test)).toBeTruthy();
        expect(isValidTypeCasting('Test', true, testExtended, undefined, Test)).toBeTruthy();
        expect(isValidTypeCasting('Test', false, testExtended, undefined, Test)).toBeTruthy();
        expect(isValidTypeCasting('Test', true, testExtendedAgain, undefined, Test)).toBeTruthy();
        expect(isValidTypeCasting('Test', false, testExtendedAgain, undefined, Test)).toBeTruthy();
        // test inheritance of value
        expect(isValidTypeCasting('ExtendedTest', true, test, undefined, ExtendedTest)).toBeFalsy();
        expect(isValidTypeCasting('ExtendedTest', false, test, undefined, ExtendedTest)).toBeFalsy();
        expect(isValidTypeCasting('ExtendedTest', true, testExtended, undefined, ExtendedTest)).toBeTruthy();
        expect(isValidTypeCasting('ExtendedTest', false, testExtended, undefined, ExtendedTest)).toBeTruthy();
        expect(isValidTypeCasting('ExtendedTest', true, testExtendedAgain, undefined, ExtendedTest)).toBeTruthy();
        expect(isValidTypeCasting('ExtendedTest', false, testExtendedAgain, undefined, ExtendedTest)).toBeTruthy();
        expect(isValidTypeCasting('ExtendedTestAgain', true, test, undefined, ExtendedTestAgain)).toBeFalsy();
        expect(isValidTypeCasting('ExtendedTestAgain', false, test, undefined, ExtendedTestAgain)).toBeFalsy();
        expect(isValidTypeCasting('ExtendedTestAgain', true, testExtended, undefined, ExtendedTestAgain)).toBeFalsy();
        expect(isValidTypeCasting('ExtendedTestAgain', false, testExtended, undefined, ExtendedTestAgain)).toBeFalsy();
        expect(
            isValidTypeCasting('ExtendedTestAgain', true, testExtendedAgain, undefined, ExtendedTestAgain)
        ).toBeTruthy();
        expect(
            isValidTypeCasting('ExtendedTestAgain', false, testExtendedAgain, undefined, ExtendedTestAgain)
        ).toBeTruthy();
    });
};
