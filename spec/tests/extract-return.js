'use strict';

const { CONSTRUCT } = require('../../core/constants');
const { setSedefEnv } = require('../../core/utils');
const { parseAndConvertDefinitions } = require('../../core/type-casting');

const extractReturn = require('../../core/extract-return');

const Return = require('../../core/models/return');

const SyntaxExtenderExtractReturnError = require('../../errors/extract-return/syntax-extender-extract-return-error');
const SyntaxExtenderNotValidArgumentError = require('../../errors/syntax-extender-not-valid-argument-error');
const SyntaxExtenderExtractReturnForbiddenError = require('../../errors/extract-return/syntax-extender-extract-return-forbidden-error');
const SyntaxExtenderExtractReturnAsyncDefinitionError = require('../../errors/extract-return/syntax-extender-extract-return-async-definition-error');
const SyntaxExtenderExtractReturnIterableDefinitionError = require('../../errors/extract-return/syntax-extender-extract-return-iterable-definition-error');
const SyntaxExtenderExtractReturnAsyncIterableDefinitionError = require('../../errors/extract-return/syntax-extender-extract-return-async-iterable-definition-error');

module.exports = () => {
    it('works arguments validation', function () {
        expect(extractReturn(function () {})).toBeInstanceOf(Return);
        expect(extractReturn(function () {}).toObject()).toEqual({
            type: null,
            isBuiltin: false,
            checkIterable: false,
            checkPromise: false,
            isNullableIterable: false,
            isNullablePromise: false,
            isNullable: false,
            source: null
        });
        expect(() => {
            extractReturn([]);
        }).toThrowError(SyntaxExtenderNotValidArgumentError);
        expect(extractReturn(function () {}, null, 'test').toObject()).toEqual({
            type: null,
            isBuiltin: false,
            checkIterable: false,
            checkPromise: false,
            isNullableIterable: false,
            isNullablePromise: false,
            isNullable: false,
            source: null
        });
        expect(() => {
            extractReturn(function () {}, null, {});
        }).toThrowError(SyntaxExtenderNotValidArgumentError);
        expect(extractReturn(function () {}, null, 'test', 'test').toObject()).toEqual({
            type: null,
            isBuiltin: false,
            checkIterable: false,
            checkPromise: false,
            isNullableIterable: false,
            isNullablePromise: false,
            isNullable: false,
            source: null
        });
        expect(() => {
            extractReturn(function () {}, null, 'test', {});
        }).toThrowError(SyntaxExtenderNotValidArgumentError);

        expect(extractReturn(function () {}, null, '', '', null).toObject()).toEqual({
            type: null,
            isBuiltin: false,
            checkIterable: false,
            checkPromise: false,
            isNullableIterable: false,
            isNullablePromise: false,
            isNullable: false,
            source: null
        });
        expect(extractReturn(function () {}, null, '', '', class Test {}).toObject()).toEqual({
            type: null,
            isBuiltin: false,
            checkIterable: false,
            checkPromise: false,
            isNullableIterable: false,
            isNullablePromise: false,
            isNullable: false,
            source: null
        });
        expect(() => {
            extractReturn(function () {}, null, '', '', {});
        }).toThrowError(SyntaxExtenderNotValidArgumentError);

        expect(extractReturn(async function () {}, null, '', '', null).toObject()).toEqual({
            type: 'promise',
            isBuiltin: true,
            checkIterable: false,
            checkPromise: false,
            isNullableIterable: false,
            isNullablePromise: false,
            isNullable: false,
            source: null
        });
        expect(extractReturn(function* () {}, null, '', '', null).toObject()).toEqual({
            type: 'generator',
            isBuiltin: true,
            checkIterable: false,
            checkPromise: false,
            isNullableIterable: false,
            isNullablePromise: false,
            isNullable: false,
            source: null
        });
        expect(extractReturn(async function* () {}, null, '', '', null).toObject()).toEqual({
            type: 'generator',
            isBuiltin: true,
            checkIterable: false,
            checkPromise: true,
            isNullableIterable: false,
            isNullablePromise: false,
            isNullable: false,
            source: null
        });
        expect(extractReturn(function () {}, null, '', '', null, __filename).toObject()).toEqual({
            type: null,
            isBuiltin: false,
            checkIterable: false,
            checkPromise: false,
            isNullableIterable: false,
            isNullablePromise: false,
            isNullable: false,
            source: null
        });
        expect(() => {
            extractReturn(function () {}, null, '', '', null, {});
        }).toThrowError(SyntaxExtenderNotValidArgumentError);
    });

    it('works return extraction', function () {
        expect(extractReturn(function () {}).toObject()).toEqual({
            type: null,
            isBuiltin: false,
            checkIterable: false,
            checkPromise: false,
            isNullableIterable: false,
            isNullablePromise: false,
            isNullable: false,
            source: null
        });

        // standard
        expect(
            extractReturn(function () {}, parseAndConvertDefinitions({ test: { return: 'string' } }), 'test').toObject()
        ).toEqual({
            type: 'string',
            isBuiltin: true,
            checkIterable: false,
            checkPromise: false,
            isNullableIterable: false,
            isNullablePromise: false,
            isNullable: false,
            source: null
        });

        class Base {}
        class Custom extends Base {}

        // wrong definition
        expect(() => {
            extractReturn(
                function () {},
                parseAndConvertDefinitions({ test: { return: 'notvalid' } }),
                'test'
            ).toObject();
        }).toThrowError(SyntaxExtenderExtractReturnError);

        // wrong definition
        expect(() => {
            extractReturn(function () {}, parseAndConvertDefinitions({ test: { return: 'self' } }), 'test').toObject();
        }).toThrowError(SyntaxExtenderExtractReturnError);

        expect(
            extractReturn(
                function () {},
                parseAndConvertDefinitions({ test: { return: 'self' } }),
                'test',
                '',
                Custom
            ).toObject()
        ).toEqual({
            type: 'Custom',
            isBuiltin: false,
            checkIterable: false,
            checkPromise: false,
            isNullableIterable: false,
            isNullablePromise: false,
            isNullable: false,
            source: Custom
        });

        // wrong definition
        expect(() => {
            extractReturn(
                function () {},
                parseAndConvertDefinitions({ test: { return: 'parent' } }),
                'test'
            ).toObject();
        }).toThrowError(SyntaxExtenderExtractReturnError);

        expect(
            extractReturn(
                function () {},
                parseAndConvertDefinitions({ test: { return: 'parent' } }),
                'test',
                '',
                Custom
            ).toObject()
        ).toEqual({
            type: 'Base',
            isBuiltin: false,
            checkIterable: false,
            checkPromise: false,
            isNullableIterable: false,
            isNullablePromise: false,
            isNullable: false,
            source: Base
        });
    });

    it('works return nullable extraction', function () {
        expect(
            extractReturn(function () {}, parseAndConvertDefinitions({ test: { return: 'string' } }), 'test').toObject()
        ).toEqual({
            type: 'string',
            isBuiltin: true,
            checkIterable: false,
            checkPromise: false,
            isNullableIterable: false,
            isNullablePromise: false,
            isNullable: false,
            source: null
        });

        expect(
            extractReturn(
                function () {},
                parseAndConvertDefinitions({ test: { '?return': 'string' } }),
                'test'
            ).toObject()
        ).toEqual({
            type: 'string',
            isBuiltin: true,
            checkIterable: false,
            checkPromise: false,
            isNullableIterable: false,
            isNullablePromise: false,
            isNullable: true,
            source: null
        });
    });

    it('works return promise extraction validate async', function () {
        expect(() => {
            extractReturn(
                async function () {},
                parseAndConvertDefinitions({ test: { return: 'string' } }),
                'test',
                'test',
                null
            ).toObject();
        }).toThrowError(SyntaxExtenderExtractReturnAsyncDefinitionError);
        expect(
            extractReturn(
                async function () {},
                parseAndConvertDefinitions({ test: { 'return->': 'string' } }),
                'test',
                'test',
                null
            ).toObject()
        ).toEqual({
            type: 'string',
            isBuiltin: true,
            checkIterable: false,
            checkPromise: true,
            isNullableIterable: false,
            isNullablePromise: false,
            isNullable: false,
            source: null
        });

        expect(
            extractReturn(
                async function () {},
                parseAndConvertDefinitions({ test: { return: 'promise' } }),
                'test',
                'test',
                null
            ).toObject()
        ).toEqual({
            type: 'promise',
            isBuiltin: true,
            checkIterable: false,
            checkPromise: false,
            isNullableIterable: false,
            isNullablePromise: false,
            isNullable: false,
            source: null
        });

        expect(
            extractReturn(async function () {}, parseAndConvertDefinitions({}), 'test', 'test', null).toObject()
        ).toEqual({
            type: 'promise',
            isBuiltin: true,
            checkIterable: false,
            checkPromise: false,
            isNullableIterable: false,
            isNullablePromise: false,
            isNullable: false,
            source: null
        });
    });

    it('works return promise extraction', function () {
        expect(
            extractReturn(function () {}, parseAndConvertDefinitions({ test: { return: 'string' } }), 'test').toObject()
        ).toEqual({
            type: 'string',
            isBuiltin: true,
            checkIterable: false,
            checkPromise: false,
            isNullableIterable: false,
            isNullablePromise: false,
            isNullable: false,
            source: null
        });
        expect(
            extractReturn(
                async function () {},
                parseAndConvertDefinitions({ test: { 'return->': 'string' } }),
                'test'
            ).toObject()
        ).toEqual({
            type: 'string',
            isBuiltin: true,
            checkIterable: false,
            checkPromise: true,
            isNullableIterable: false,
            isNullablePromise: false,
            isNullable: false,
            source: null
        });
    });

    it('works return nullable promise extraction', function () {
        expect(
            extractReturn(
                async function () {},
                parseAndConvertDefinitions({ test: { '?return?>': 'string' } }),
                'test'
            ).toObject()
        ).toEqual({
            type: 'string',
            isBuiltin: true,
            checkIterable: false,
            checkPromise: true,
            isNullableIterable: false,
            isNullablePromise: true,
            isNullable: true,
            source: null
        });
    });

    it('works return iterable extraction validate async', function () {
        expect(() => {
            extractReturn(
                function* () {},
                parseAndConvertDefinitions({ test: { return: 'string' } }),
                'test',
                'test',
                null
            ).toObject();
        }).toThrowError(SyntaxExtenderExtractReturnIterableDefinitionError);
        expect(
            extractReturn(
                function* () {},
                parseAndConvertDefinitions({ test: { 'return[]': 'string' } }),
                'test',
                'test',
                null
            ).toObject()
        ).toEqual({
            type: 'string',
            isBuiltin: true,
            checkIterable: true,
            checkPromise: false,
            isNullableIterable: false,
            isNullablePromise: false,
            isNullable: false,
            source: null
        });

        expect(
            extractReturn(
                function* () {},
                parseAndConvertDefinitions({ test: { return: 'generator' } }),
                'test',
                'test',
                null
            ).toObject()
        ).toEqual({
            type: 'generator',
            isBuiltin: true,
            checkIterable: false,
            checkPromise: false,
            isNullableIterable: false,
            isNullablePromise: false,
            isNullable: false,
            source: null
        });

        expect(extractReturn(function* () {}, parseAndConvertDefinitions({}), 'test', 'test', null).toObject()).toEqual(
            {
                type: 'generator',
                isBuiltin: true,
                checkIterable: false,
                checkPromise: false,
                isNullableIterable: false,
                isNullablePromise: false,
                isNullable: false,
                source: null
            }
        );
    });

    it('works return iterable extraction', function () {
        expect(
            extractReturn(function () {}, parseAndConvertDefinitions({ test: { return: 'string' } }), 'test').toObject()
        ).toEqual({
            type: 'string',
            isBuiltin: true,
            checkIterable: false,
            checkPromise: false,
            isNullableIterable: false,
            isNullablePromise: false,
            isNullable: false,
            source: null
        });
        expect(
            extractReturn(
                function* () {},
                parseAndConvertDefinitions({ test: { 'return[]': 'string' } }),
                'test'
            ).toObject()
        ).toEqual({
            type: 'string',
            isBuiltin: true,
            checkIterable: true,
            checkPromise: false,
            isNullableIterable: false,
            isNullablePromise: false,
            isNullable: false,
            source: null
        });
    });

    it('works return nullable iterable extraction', function () {
        expect(
            extractReturn(
                function* () {},
                parseAndConvertDefinitions({ test: { '?return[?]': 'string' } }),
                'test'
            ).toObject()
        ).toEqual({
            type: 'string',
            isBuiltin: true,
            checkIterable: true,
            checkPromise: false,
            isNullableIterable: true,
            isNullablePromise: false,
            isNullable: true,
            source: null
        });
    });

    it('works return async iterable extraction validate async', function () {
        expect(() => {
            extractReturn(
                async function* () {},
                parseAndConvertDefinitions({ test: { return: 'string' } }),
                'test',
                'test',
                null
            ).toObject();
        }).toThrowError(SyntaxExtenderExtractReturnAsyncDefinitionError);

        expect(() => {
            extractReturn(
                async function* () {},
                parseAndConvertDefinitions({ test: { 'return->': 'string' } }),
                'test',
                'test',
                null
            ).toObject();
        }).toThrowError(SyntaxExtenderExtractReturnAsyncIterableDefinitionError);

        expect(
            extractReturn(
                async function* () {},
                parseAndConvertDefinitions({ test: { 'return->': 'generator' } }),
                'test',
                'test',
                null
            ).toObject()
        ).toEqual({
            type: 'generator',
            isBuiltin: true,
            checkIterable: false,
            checkPromise: true,
            isNullableIterable: false,
            isNullablePromise: false,
            isNullable: false,
            source: null
        });

        expect(
            extractReturn(
                async function* () {},
                parseAndConvertDefinitions({ test: { 'return->[]': 'string' } }),
                'test',
                'test',
                null
            ).toObject()
        ).toEqual({
            type: 'string',
            isBuiltin: true,
            checkIterable: true,
            checkPromise: true,
            isNullableIterable: false,
            isNullablePromise: false,
            isNullable: false,
            source: null
        });

        expect(
            extractReturn(
                async function* () {},
                parseAndConvertDefinitions({ test: { return: 'promise' } }),
                'test',
                'test',
                null
            ).toObject()
        ).toEqual({
            type: 'promise',
            isBuiltin: true,
            checkIterable: false,
            checkPromise: false,
            isNullableIterable: false,
            isNullablePromise: false,
            isNullable: false,
            source: null
        });

        expect(
            extractReturn(async function* () {}, parseAndConvertDefinitions({}), 'test', 'test', null).toObject()
        ).toEqual({
            type: 'generator',
            isBuiltin: true,
            checkIterable: false,
            checkPromise: true,
            isNullableIterable: false,
            isNullablePromise: false,
            isNullable: false,
            source: null
        });
    });

    it('works return async iterable extraction', function () {
        expect(
            extractReturn(function () {}, parseAndConvertDefinitions({ test: { return: 'string' } }), 'test').toObject()
        ).toEqual({
            type: 'string',
            isBuiltin: true,
            checkIterable: false,
            checkPromise: false,
            isNullableIterable: false,
            isNullablePromise: false,
            isNullable: false,
            source: null
        });

        expect(
            extractReturn(
                async function* () {},
                parseAndConvertDefinitions({ test: { 'return->[]': 'string' } }),
                'test'
            ).toObject()
        ).toEqual({
            type: 'string',
            isBuiltin: true,
            checkIterable: true,
            checkPromise: true,
            isNullableIterable: false,
            isNullablePromise: false,
            isNullable: false,
            source: null
        });
    });

    it('works return nullable async iterable extraction', function () {
        expect(
            extractReturn(
                async function* () {},
                parseAndConvertDefinitions({ test: { '?return?>[?]': 'string' } }),
                'test'
            ).toObject()
        ).toEqual({
            type: 'string',
            isBuiltin: true,
            checkIterable: true,
            checkPromise: true,
            isNullableIterable: true,
            isNullablePromise: true,
            isNullable: true,
            source: null
        });
    });

    it('works return extraction forbidden safety', function () {
        expect(() => {
            extractReturn(
                function () {},
                parseAndConvertDefinitions({ test: { return: 'string' } }),
                'test',
                CONSTRUCT,
                null
            ).toObject();
        }).toThrowError(SyntaxExtenderExtractReturnForbiddenError);

        setSedefEnv('MAGIC', false);
        expect(
            extractReturn(
                function () {},
                parseAndConvertDefinitions({ test: { return: 'string' } }),
                'test',
                CONSTRUCT,
                null
            ).toObject()
        ).toEqual({
            type: 'string',
            isBuiltin: true,
            checkIterable: false,
            checkPromise: false,
            isNullableIterable: false,
            isNullablePromise: false,
            isNullable: false,
            source: null
        });
        setSedefEnv('MAGIC', true);
    });

    it('works return extraction from comment', function () {
        setSedefEnv('COMMENT', true);
        expect(extractReturn(function () /* :string */ {}, parseAndConvertDefinitions({}), 'test').toObject()).toEqual({
            type: 'string',
            isBuiltin: true,
            checkIterable: false,
            checkPromise: false,
            isNullableIterable: false,
            isNullablePromise: false,
            isNullable: false,
            source: null
        });
        setSedefEnv('COMMENT', false);
    });

    it('works return extraction from comment priority', function () {
        setSedefEnv('COMMENT', true);
        expect(
            extractReturn(
                function () /* :array */ {},
                parseAndConvertDefinitions({ test: { return: 'string' } }),
                'test'
            ).toObject()
        ).toEqual({
            type: 'string',
            isBuiltin: true,
            checkIterable: false,
            checkPromise: false,
            isNullableIterable: false,
            isNullablePromise: false,
            isNullable: false,
            source: null
        });
        setSedefEnv('PRIORITY', 'COMMENT');
        expect(
            extractReturn(
                function () /* :array */ {},
                parseAndConvertDefinitions({ test: { return: 'string' } }),
                'test'
            ).toObject()
        ).toEqual({
            type: 'array',
            isBuiltin: true,
            checkIterable: false,
            checkPromise: false,
            isNullableIterable: false,
            isNullablePromise: false,
            isNullable: false,
            source: null
        });
        setSedefEnv('PRIORITY', 'STATIC');
        expect(
            extractReturn(
                function () /* :array */ {},
                parseAndConvertDefinitions({ test: { return: 'string' } }),
                'test'
            ).toObject()
        ).toEqual({
            type: 'string',
            isBuiltin: true,
            checkIterable: false,
            checkPromise: false,
            isNullableIterable: false,
            isNullablePromise: false,
            isNullable: false,
            source: null
        });
        setSedefEnv('COMMENT', false);
    });

    it('works return extraction custom class from comment', function () {
        setSedefEnv('COMMENT', true);

        expect(
            extractReturn(
                function () /* :./models/test */ {},
                parseAndConvertDefinitions({}),
                'test',
                undefined,
                undefined,
                __filename
            ).toObject()
        ).toEqual({
            type: 'Test',
            isBuiltin: false,
            checkIterable: false,
            checkPromise: false,
            isNullableIterable: false,
            isNullablePromise: false,
            isNullable: false,
            source: require('./models/test')
        });

        setSedefEnv('COMMENT', false);
    });

    it('works return extraction syntax from comment', function () {
        setSedefEnv('COMMENT', true);
        expect(
            extractReturn(
                function () /* ?:string */ {},
                parseAndConvertDefinitions({}),
                'test',
                undefined,
                undefined,
                undefined,
                __filename
            ).toObject()
        ).toEqual({
            type: 'string',
            isBuiltin: true,
            checkIterable: false,
            checkPromise: false,
            isNullableIterable: false,
            isNullablePromise: false,
            isNullable: true,
            source: null
        });

        expect(
            extractReturn(
                function () /* ?:->string */ {},
                parseAndConvertDefinitions({}),
                'test',
                undefined,
                undefined,
                undefined,
                __filename
            ).toObject()
        ).toEqual({
            type: 'string',
            isBuiltin: true,
            checkIterable: false,
            checkPromise: true,
            isNullableIterable: false,
            isNullablePromise: false,
            isNullable: true,
            source: null
        });

        expect(
            extractReturn(
                function () /* ?:?>string */ {},
                parseAndConvertDefinitions({}),
                'test',
                undefined,
                undefined,
                undefined,
                __filename
            ).toObject()
        ).toEqual({
            type: 'string',
            isBuiltin: true,
            checkIterable: false,
            checkPromise: true,
            isNullableIterable: false,
            isNullablePromise: true,
            isNullable: true,
            source: null
        });

        expect(
            extractReturn(
                function () /* ?:[]string */ {},
                parseAndConvertDefinitions({}),
                'test',
                undefined,
                undefined,
                undefined,
                __filename
            ).toObject()
        ).toEqual({
            type: 'string',
            isBuiltin: true,
            checkIterable: true,
            checkPromise: false,
            isNullableIterable: false,
            isNullablePromise: false,
            isNullable: true,
            source: null
        });

        expect(
            extractReturn(
                function () /* ?:[?]string */ {},
                parseAndConvertDefinitions({}),
                'test',
                undefined,
                undefined,
                undefined,
                __filename
            ).toObject()
        ).toEqual({
            type: 'string',
            isBuiltin: true,
            checkIterable: true,
            checkPromise: false,
            isNullableIterable: true,
            isNullablePromise: false,
            isNullable: true,
            source: null
        });

        expect(
            extractReturn(
                function () /* ?:?>[?]string */ {},
                parseAndConvertDefinitions({}),
                'test',
                undefined,
                undefined,
                undefined,
                __filename
            ).toObject()
        ).toEqual({
            type: 'string',
            isBuiltin: true,
            checkIterable: true,
            checkPromise: true,
            isNullableIterable: true,
            isNullablePromise: true,
            isNullable: true,
            source: null
        });

        expect(
            extractReturn(
                function () /* ?:?>[?]string|array|dictionary */ {},
                parseAndConvertDefinitions({}),
                'test',
                undefined,
                undefined,
                undefined,
                __filename
            ).toObject()
        ).toEqual({
            type: 'string|array|dictionary',
            isBuiltin: true,
            checkIterable: true,
            checkPromise: true,
            isNullableIterable: true,
            isNullablePromise: true,
            isNullable: true,
            source: null
        });

        setSedefEnv('COMMENT', false);
    });
};
