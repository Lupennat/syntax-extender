'use strict';

const { setSedefEnv } = require('../../core/utils');
const { parseAndConvertDefinitions } = require('../../core/type-casting');

const extractParameters = require('../../core/extract-parameters');

const Parameters = require('../../core/models/parameters');

const SyntaxExtenderExtractParameterAvoidCustomTypeDestructuredDefinitionError = require('../../errors/extract-parameters/syntax-extender-extract-parameter-avoid-custom-type-destructured-definition-error');
const SyntaxExtenderExtractParameterDestructeredDefinitionError = require('../../errors/extract-parameters/syntax-extender-extract-parameter-destructered-definition-error');
const SyntaxExtenderExtractParameterDestructeredInternalVariadicError = require('../../errors/extract-parameters/syntax-extender-extract-parameter-destructered-internal-variadic-error');
const SyntaxExtenderExtractParameterDestructeredVariadicError = require('../../errors/extract-parameters/syntax-extender-extract-parameter-destructered-variadic-error');
const SyntaxExtenderExtractParameterError = require('../../errors/extract-parameters/syntax-extender-extract-parameter-error');
const SyntaxExtenderExtractParametersError = require('../../errors/extract-parameters/syntax-extender-extract-parameters-error');
const SyntaxExtenderNotValidArgumentError = require('../../errors/syntax-extender-not-valid-argument-error');
const SyntaxExtenderExtractParameterDefaultValueTypeMismatchError = require('../../errors/extract-parameters/syntax-extender-extract-parameter-default-value-type-mismatch-error');
const SyntaxExtenderExtractParameterDefaultValueEvaluationError = require('../../errors/extract-parameters/syntax-extender-extract-parameter-default-value-evaluation-error');
const SyntaxExtenderExtractParameterDefaultValueNullError = require('../../errors/extract-parameters/syntax-extender-extract-parameter-default-value-null-error');

module.exports = () => {
    it('works arguments validation', function () {
        const definitions = parseAndConvertDefinitions({});
        expect(extractParameters(function () {})).toBeInstanceOf(Parameters);
        expect(() => {
            extractParameters({});
        }).toThrowError(SyntaxExtenderNotValidArgumentError);
        expect(() => {
            extractParameters(class {});
        }).toThrowError(SyntaxExtenderNotValidArgumentError);

        expect(extractParameters(function () {}, definitions).toObject()).toEqual([]);
        expect(() => {
            extractParameters(function () {}, []);
        }).toThrowError(SyntaxExtenderNotValidArgumentError);
        expect(extractParameters(function () {}, definitions, '').toObject()).toEqual([]);
        expect(() => {
            extractParameters(function () {}, definitions, {});
        }).toThrowError(SyntaxExtenderNotValidArgumentError);
        expect(extractParameters(function () {}, definitions, '', 'test').toObject()).toEqual([]);
        expect(() => {
            extractParameters(function () {}, definitions, '', {});
        }).toThrowError(SyntaxExtenderNotValidArgumentError);
        expect(extractParameters(function () {}, definitions, '', '', null).toObject()).toEqual([]);
        expect(extractParameters(function () {}, definitions, '', '', class Test {}).toObject()).toEqual([]);
        expect(() => {
            extractParameters(function () {}, definitions, '', '', {});
        }).toThrowError(SyntaxExtenderNotValidArgumentError);
        expect(extractParameters(function () {}, definitions, '', '', null, __filename).toObject()).toEqual([]);
        expect(() => {
            extractParameters(function () {}, definitions, '', '', null, {});
        }).toThrowError(SyntaxExtenderNotValidArgumentError);
    });

    it('works parameters extraction', function () {
        // empty
        expect(extractParameters(function () {}).toObject()).toEqual([]);
        // overcomma
        expect(
            // prettier-ignore
            extractParameters(function (
                test,
            ) {}).toObject()
        ).toEqual([
            {
                param: 'test',
                name: 'test',
                hasDefault: false,
                isNullableIterable: false,
                isNullablePromise: false,
                isNullable: false,
                variadic: false,
                source: null,
                type: null,
                checkIterable: false,
                checkPromise: false,
                isBuiltin: false,
                destructured: []
            }
        ]);
        // simple
        expect(extractParameters(function (test) {}).toObject()).toEqual([
            {
                param: 'test',
                name: 'test',
                hasDefault: false,
                isNullableIterable: false,
                isNullablePromise: false,
                isNullable: false,
                variadic: false,
                source: null,
                type: null,
                checkIterable: false,
                checkPromise: false,
                isBuiltin: false,
                destructured: []
            }
        ]);
        // with default
        expect(extractParameters(function (test = 'ciao') {}).toObject()).toEqual([
            {
                param: "test = 'ciao'",
                name: 'test',
                hasDefault: true,
                isNullableIterable: false,
                isNullablePromise: false,
                isNullable: false,
                variadic: false,
                source: null,
                type: null,
                checkIterable: false,
                checkPromise: false,
                isBuiltin: false,
                destructured: []
            }
        ]);
        // variadic
        expect(extractParameters(function (...test) {}).toObject()).toEqual([
            {
                param: '...test',
                name: 'test',
                hasDefault: false,
                isNullableIterable: false,
                isNullablePromise: false,
                isNullable: false,
                variadic: true,
                source: null,
                type: null,
                checkIterable: false,
                checkPromise: false,
                isBuiltin: false,
                destructured: []
            }
        ]);
        // destructuring
        expect(extractParameters(function ({ de, struc, turing }) {}).toObject()).toEqual([
            {
                param: '{ de, struc, turing }',
                name: null,
                hasDefault: false,
                isNullableIterable: false,
                isNullablePromise: false,
                isNullable: false,
                variadic: false,
                source: null,
                type: 'dictionary',
                checkIterable: false,
                checkPromise: false,
                isBuiltin: true,
                destructured: [
                    {
                        param: 'de',
                        name: 'de',
                        variadic: false,
                        hasDefault: false,
                        isNullableIterable: false,
                        isNullablePromise: false,
                        isNullable: false,
                        source: null,
                        type: null,
                        checkIterable: false,
                        checkPromise: false,
                        isBuiltin: false,
                        destructured: []
                    },
                    {
                        param: 'struc',
                        name: 'struc',
                        variadic: false,
                        hasDefault: false,
                        isNullableIterable: false,
                        isNullablePromise: false,
                        isNullable: false,
                        source: null,
                        type: null,
                        checkIterable: false,
                        checkPromise: false,
                        isBuiltin: false,
                        destructured: []
                    },
                    {
                        param: 'turing',
                        name: 'turing',
                        variadic: false,
                        hasDefault: false,
                        isNullableIterable: false,
                        isNullablePromise: false,
                        isNullable: false,
                        source: null,
                        type: null,
                        checkIterable: false,
                        checkPromise: false,
                        isBuiltin: false,
                        destructured: []
                    }
                ]
            }
        ]);

        // all
        expect(
            extractParameters(function (
                test,
                test2 = 'test2',
                { de2, de3 },
                { de = 'test', struc = 'test', ...turing } = { test: { test: 'test' } },
                ...test3
            ) {}).toObject()
        ).toEqual([
            {
                param: 'test',
                name: 'test',
                variadic: false,
                hasDefault: false,
                isNullableIterable: false,
                isNullablePromise: false,
                isNullable: false,
                source: null,
                type: null,
                checkIterable: false,
                checkPromise: false,
                isBuiltin: false,
                destructured: []
            },
            {
                param: "test2 = 'test2'",
                name: 'test2',
                variadic: false,
                hasDefault: true,
                isNullableIterable: false,
                isNullablePromise: false,
                isNullable: false,
                source: null,
                type: null,
                checkIterable: false,
                checkPromise: false,
                isBuiltin: false,
                destructured: []
            },
            {
                param: '{ de2, de3 }',
                name: null,
                variadic: false,
                hasDefault: false,
                isNullableIterable: false,
                isNullablePromise: false,
                isNullable: false,
                source: null,
                type: 'dictionary',
                checkIterable: false,
                checkPromise: false,
                isBuiltin: true,
                destructured: [
                    {
                        param: 'de2',
                        name: 'de2',
                        variadic: false,
                        hasDefault: false,
                        isNullableIterable: false,
                        isNullablePromise: false,
                        isNullable: false,
                        source: null,
                        type: null,
                        checkIterable: false,
                        checkPromise: false,
                        isBuiltin: false,
                        destructured: []
                    },
                    {
                        param: 'de3',
                        name: 'de3',
                        variadic: false,
                        hasDefault: false,
                        isNullableIterable: false,
                        isNullablePromise: false,
                        isNullable: false,
                        source: null,
                        type: null,
                        checkIterable: false,
                        checkPromise: false,
                        isBuiltin: false,
                        destructured: []
                    }
                ]
            },
            {
                param: "{ de = 'test', struc = 'test', ...turing } = { test: { test: 'test' } }",
                name: null,
                variadic: false,
                hasDefault: true,
                isNullableIterable: false,
                isNullablePromise: false,
                isNullable: false,
                type: 'dictionary',
                source: null,
                checkIterable: false,
                checkPromise: false,
                isBuiltin: true,
                destructured: [
                    {
                        param: "de = 'test'",
                        name: 'de',
                        variadic: false,
                        hasDefault: true,
                        isNullableIterable: false,
                        isNullablePromise: false,
                        isNullable: false,
                        source: null,
                        type: null,
                        checkIterable: false,
                        checkPromise: false,
                        isBuiltin: false,
                        destructured: []
                    },
                    {
                        param: "struc = 'test'",
                        name: 'struc',
                        variadic: false,
                        hasDefault: true,
                        isNullableIterable: false,
                        isNullablePromise: false,
                        isNullable: false,
                        source: null,
                        type: null,
                        checkIterable: false,
                        checkPromise: false,
                        isBuiltin: false,
                        destructured: []
                    },
                    {
                        param: '...turing',
                        name: 'turing',
                        variadic: true,
                        hasDefault: false,
                        isNullableIterable: false,
                        isNullablePromise: false,
                        isNullable: false,
                        source: null,
                        type: null,
                        checkIterable: false,
                        checkPromise: false,
                        isBuiltin: false,
                        destructured: []
                    }
                ]
            },
            {
                param: '...test3',
                name: 'test3',
                variadic: true,
                hasDefault: false,
                isNullableIterable: false,
                isNullablePromise: false,
                isNullable: false,
                source: null,
                type: null,
                checkIterable: false,
                checkPromise: false,
                isBuiltin: false,
                destructured: []
            }
        ]);
    });

    it('works parameters variadic destructured safety', function () {
        expect(() => {
            extractParameters(function (...{ a, b }) {}).toObject();
        }).toThrowError(SyntaxExtenderExtractParameterDestructeredVariadicError);

        setSedefEnv('VALIDATION', false);

        extractParameters(function (...{ a, b }) {}).toObject();

        setSedefEnv('VALIDATION', true);
    });

    it('works parameters extraction with definition', function () {
        let definitions = parseAndConvertDefinitions({ test: { 1: 'string' } });
        // standard
        expect(extractParameters(function (test) {}, definitions, 'test').toObject()).toEqual([
            {
                param: 'test',
                name: 'test',
                hasDefault: false,
                isNullableIterable: false,
                isNullablePromise: false,
                isNullable: false,
                variadic: false,
                source: null,
                type: 'string',
                checkIterable: false,
                checkPromise: false,
                isBuiltin: true,
                destructured: []
            }
        ]);

        definitions = parseAndConvertDefinitions({ test: { 1: 'notvalid' } });
        // wrong definition
        expect(() => {
            extractParameters(function (test) {}, definitions, 'test').toObject();
        }).toThrowError(SyntaxExtenderExtractParameterError);

        definitions = parseAndConvertDefinitions({ test: { 1: 'string', 2: 'boolean' } });
        expect(() => {
            extractParameters(function (test) {}, definitions, 'test').toObject();
        }).toThrowError(SyntaxExtenderExtractParametersError);

        definitions = parseAndConvertDefinitions({ test: { 1: 'dictionary' } });
        // destructured only dictionary or custom instance
        expect(extractParameters(function ({ de }) {}, definitions, 'test').toObject()).toEqual([
            {
                param: '{ de }',
                name: null,
                hasDefault: false,
                isNullableIterable: false,
                isNullablePromise: false,
                isNullable: false,
                variadic: false,
                source: null,
                type: 'dictionary',
                checkIterable: false,
                checkPromise: false,
                isBuiltin: true,
                destructured: [
                    {
                        param: 'de',
                        name: 'de',
                        variadic: false,
                        hasDefault: false,
                        isNullableIterable: false,
                        isNullablePromise: false,
                        isNullable: false,
                        source: null,
                        type: null,
                        checkIterable: false,
                        checkPromise: false,
                        isBuiltin: false,
                        destructured: []
                    }
                ]
            }
        ]);
        class Test {}
        definitions = parseAndConvertDefinitions({ test: { 1: Test } });
        expect(extractParameters(function ({ de }) {}, definitions, 'test').toObject()).toEqual([
            {
                param: '{ de }',
                name: null,
                hasDefault: false,
                isNullableIterable: false,
                isNullablePromise: false,
                isNullable: false,
                variadic: false,
                source: Test,
                type: 'Test',
                checkIterable: false,
                checkPromise: false,
                isBuiltin: false,
                destructured: [
                    {
                        param: 'de',
                        name: 'de',
                        variadic: false,
                        hasDefault: false,
                        isNullableIterable: false,
                        isNullablePromise: false,
                        isNullable: false,
                        source: null,
                        type: null,
                        checkIterable: false,
                        checkPromise: false,
                        isBuiltin: false,
                        destructured: []
                    }
                ]
            }
        ]);

        definitions = parseAndConvertDefinitions({ test: { 1: 'string' } });
        expect(() => {
            extractParameters(function ({ de }) {}, definitions, 'test').toObject();
        }).toThrowError(SyntaxExtenderExtractParameterDestructeredDefinitionError);
        // define destructured parameters
        definitions = parseAndConvertDefinitions({ test: { 1: 'dictionary', 1.1: 'string', 1.2: Test } });
        expect(extractParameters(function ({ de, stru }) {}, definitions, 'test').toObject()).toEqual([
            {
                param: '{ de, stru }',
                name: null,
                hasDefault: false,
                isNullableIterable: false,
                isNullablePromise: false,
                isNullable: false,
                variadic: false,
                source: null,
                type: 'dictionary',
                checkIterable: false,
                checkPromise: false,
                isBuiltin: true,
                destructured: [
                    {
                        param: 'de',
                        name: 'de',
                        variadic: false,
                        hasDefault: false,
                        isNullableIterable: false,
                        isNullablePromise: false,
                        isNullable: false,
                        source: null,
                        type: 'string',
                        checkIterable: false,
                        checkPromise: false,
                        isBuiltin: true,
                        destructured: []
                    },
                    {
                        param: 'stru',
                        name: 'stru',
                        variadic: false,
                        hasDefault: false,
                        isNullableIterable: false,
                        isNullablePromise: false,
                        isNullable: false,
                        source: Test,
                        type: 'Test',
                        checkIterable: false,
                        checkPromise: false,
                        isBuiltin: false,
                        destructured: []
                    }
                ]
            }
        ]);

        // wrong definition destructured parameter
        definitions = parseAndConvertDefinitions({ test: { 1.1: 'notvalid' } });
        expect(() => {
            extractParameters(function ({ de }) {}, definitions, 'test').toObject();
        }).toThrowError(SyntaxExtenderExtractParameterError);

        // avoid definition on destructured parameter on custom class destructured
        definitions = parseAndConvertDefinitions({ test: { 1: Test, 1.1: 'string' } });
        expect(() => {
            extractParameters(function ({ de }) {}, definitions, 'test').toObject();
        }).toThrowError(SyntaxExtenderExtractParameterAvoidCustomTypeDestructuredDefinitionError);
        // definition for variadic destructured parameter is forbidden
        definitions = parseAndConvertDefinitions({ test: { 1.1: 'string' } });
        expect(() => {
            extractParameters(function ({ ...de }) {}, definitions, 'test').toObject();
        }).toThrowError(SyntaxExtenderExtractParameterDestructeredInternalVariadicError);

        definitions = parseAndConvertDefinitions({ test: { 1.1: 'string', 1.2: 'string', 1.3: 'boolean' } });
        expect(() => {
            extractParameters(function ({ de }) {}, definitions, 'test').toObject();
        }).toThrowError(SyntaxExtenderExtractParametersError);

        definitions = parseAndConvertDefinitions({ test: { 1.1: 'string', 1.2: 'string' } });
        expect(() => {
            extractParameters(function ({ de, ...stru }) {}, definitions, 'test').toObject();
        }).toThrowError(SyntaxExtenderExtractParameterDestructeredInternalVariadicError);
    });

    it('works parameters extraction from comment', function () {
        setSedefEnv('COMMENT', true);
        expect(
            extractParameters(function (de /* :string */) {}, parseAndConvertDefinitions({}), 'test').toObject()
        ).toEqual([
            {
                param: 'de',
                name: 'de',
                variadic: false,
                hasDefault: false,
                isNullableIterable: false,
                isNullablePromise: false,
                isNullable: false,
                source: null,
                type: 'string',
                checkIterable: false,
                checkPromise: false,
                isBuiltin: true,
                destructured: []
            }
        ]);

        setSedefEnv('COMMENT', false);
    });

    it('works parameters extraction from comment priority', function () {
        setSedefEnv('COMMENT', true);
        expect(
            extractParameters(
                function (de /* :array */) {},
                parseAndConvertDefinitions({ test: { 1: 'string' } }),
                'test'
            ).toObject()
        ).toEqual([
            {
                param: 'de',
                name: 'de',
                variadic: false,
                hasDefault: false,
                isNullableIterable: false,
                isNullablePromise: false,
                isNullable: false,
                source: null,
                type: 'string',
                checkIterable: false,
                checkPromise: false,
                isBuiltin: true,
                destructured: []
            }
        ]);

        setSedefEnv('PRIORITY', 'COMMENT');
        expect(
            extractParameters(
                function (de /* :array */) {},
                parseAndConvertDefinitions({ test: { 1: 'string' } }),
                'test'
            ).toObject()
        ).toEqual([
            {
                param: 'de',
                name: 'de',
                variadic: false,
                hasDefault: false,
                isNullableIterable: false,
                isNullablePromise: false,
                isNullable: false,
                source: null,
                type: 'array',
                checkIterable: false,
                checkPromise: false,
                isBuiltin: true,
                destructured: []
            }
        ]);

        setSedefEnv('PRIORITY', 'STATIC');
        expect(
            extractParameters(
                function (de /* :array */) {},
                parseAndConvertDefinitions({ test: { 1: 'string' } }),
                'test'
            ).toObject()
        ).toEqual([
            {
                param: 'de',
                name: 'de',
                variadic: false,
                hasDefault: false,
                isNullableIterable: false,
                isNullablePromise: false,
                isNullable: false,
                source: null,
                type: 'string',
                checkIterable: false,
                checkPromise: false,
                isBuiltin: true,
                destructured: []
            }
        ]);

        setSedefEnv('COMMENT', false);
    });

    it('works parameters extraction custom class from comment', function () {
        setSedefEnv('COMMENT', true);

        expect(
            extractParameters(
                function (de /* :./models/test */) {},
                parseAndConvertDefinitions({}),
                'test',
                undefined,
                undefined,
                __filename
            ).toObject()
        ).toEqual([
            {
                param: 'de',
                name: 'de',
                variadic: false,
                hasDefault: false,
                isNullableIterable: false,
                isNullablePromise: false,
                isNullable: false,
                source: require('./models/test'),
                type: 'Test',
                checkIterable: false,
                checkPromise: false,
                isBuiltin: false,
                destructured: []
            }
        ]);

        setSedefEnv('COMMENT', false);
    });

    it('works parameters extraction syntax from comment', function () {
        setSedefEnv('COMMENT', true);
        expect(
            extractParameters(function (de /* ?:string */) {}, parseAndConvertDefinitions({}), 'test').toObject()
        ).toEqual([
            {
                param: 'de',
                name: 'de',
                variadic: false,
                hasDefault: false,
                isNullableIterable: false,
                isNullablePromise: false,
                isNullable: true,
                source: null,
                type: 'string',
                checkIterable: false,
                checkPromise: false,
                isBuiltin: true,
                destructured: []
            }
        ]);

        expect(
            extractParameters(function (de /* ?:->string */) {}, parseAndConvertDefinitions({}), 'test').toObject()
        ).toEqual([
            {
                param: 'de',
                name: 'de',
                variadic: false,
                hasDefault: false,
                isNullableIterable: false,
                isNullablePromise: false,
                isNullable: true,
                source: null,
                type: 'string',
                checkIterable: false,
                checkPromise: true,
                isBuiltin: true,
                destructured: []
            }
        ]);

        expect(
            extractParameters(function (de /* ?:?>string */) {}, parseAndConvertDefinitions({}), 'test').toObject()
        ).toEqual([
            {
                param: 'de',
                name: 'de',
                variadic: false,
                hasDefault: false,
                isNullableIterable: false,
                isNullablePromise: true,
                isNullable: true,
                source: null,
                type: 'string',
                checkIterable: false,
                checkPromise: true,
                isBuiltin: true,
                destructured: []
            }
        ]);

        expect(
            extractParameters(function (de /* ?:[]string */) {}, parseAndConvertDefinitions({}), 'test').toObject()
        ).toEqual([
            {
                param: 'de',
                name: 'de',
                variadic: false,
                hasDefault: false,
                isNullableIterable: false,
                isNullablePromise: false,
                isNullable: true,
                source: null,
                type: 'string',
                checkIterable: true,
                checkPromise: false,
                isBuiltin: true,
                destructured: []
            }
        ]);

        expect(
            extractParameters(function (de /* ?:[?]string */) {}, parseAndConvertDefinitions({}), 'test').toObject()
        ).toEqual([
            {
                param: 'de',
                name: 'de',
                variadic: false,
                hasDefault: false,
                isNullableIterable: true,
                isNullablePromise: false,
                isNullable: true,
                source: null,
                type: 'string',
                checkIterable: true,
                checkPromise: false,
                isBuiltin: true,
                destructured: []
            }
        ]);

        expect(
            extractParameters(function (de /* ?:?>[?]string */) {}, parseAndConvertDefinitions({}), 'test').toObject()
        ).toEqual([
            {
                param: 'de',
                name: 'de',
                variadic: false,
                hasDefault: false,
                isNullableIterable: true,
                isNullablePromise: true,
                isNullable: true,
                source: null,
                type: 'string',
                checkIterable: true,
                checkPromise: true,
                isBuiltin: true,
                destructured: []
            }
        ]);

        expect(
            extractParameters(
                function (de /* ?:?>[?]string|array|dictionary */) {},
                parseAndConvertDefinitions({}),
                'test'
            ).toObject()
        ).toEqual([
            {
                param: 'de',
                name: 'de',
                variadic: false,
                hasDefault: false,
                isNullableIterable: true,
                isNullablePromise: true,
                isNullable: true,
                source: null,
                type: 'string|array|dictionary',
                checkIterable: true,
                checkPromise: true,
                isBuiltin: true,
                destructured: []
            }
        ]);

        setSedefEnv('COMMENT', false);
    });

    it('works parameters validate default value', function () {
        setSedefEnv('COMMENT', true);
        setSedefEnv('CHECKDEFAULT', true);
        extractParameters(function (de /* :string */ = null) {}, parseAndConvertDefinitions({}), 'test');
        extractParameters(function (de /* :string */ = undefined) {}, parseAndConvertDefinitions({}), 'test');
        extractParameters(function (de /* :date */ = new Date()) {}, parseAndConvertDefinitions({}), 'test');
        expect(() => {
            extractParameters(function (de /* :string */ = []) {}, parseAndConvertDefinitions({}), 'test');
        }).toThrowError(SyntaxExtenderExtractParameterDefaultValueTypeMismatchError);
        class Test {}
        expect(() => {
            extractParameters(function (de /* :string */ = new Test()) {}, parseAndConvertDefinitions({}), 'test');
        }).toThrowError(SyntaxExtenderExtractParameterDefaultValueEvaluationError);
        extractParameters(
            function (de /* :./models/test */ = null) {},
            parseAndConvertDefinitions({}),
            'test',
            undefined,
            undefined,
            __filename
        );
        extractParameters(
            function (de /* :./models/test */ = undefined) {},
            parseAndConvertDefinitions({}),
            'test',
            undefined,
            undefined,
            __filename
        );
        expect(() => {
            extractParameters(
                function (de /* :./models/test */ = 'string') {},
                parseAndConvertDefinitions({}),
                'test',
                undefined,
                undefined,
                __filename
            );
        }).toThrowError(SyntaxExtenderExtractParameterDefaultValueNullError);

        setSedefEnv('CHECKDEFAULT', false);

        extractParameters(function (de /* :string */ = null) {}, parseAndConvertDefinitions({}), 'test');
        extractParameters(function (de /* :string */ = undefined) {}, parseAndConvertDefinitions({}), 'test');
        extractParameters(function (de /* :date */ = new Date()) {}, parseAndConvertDefinitions({}), 'test');
        extractParameters(function (de /* :string */ = []) {}, parseAndConvertDefinitions({}), 'test');

        extractParameters(function (de /* :string */ = new Test()) {}, parseAndConvertDefinitions({}), 'test');

        extractParameters(
            function (de /* :./models/test */ = null) {},
            parseAndConvertDefinitions({}),
            'test',
            undefined,
            undefined,
            __filename
        );
        extractParameters(
            function (de /* :./models/test */ = undefined) {},
            parseAndConvertDefinitions({}),
            'test',
            undefined,
            undefined,
            __filename
        );
        extractParameters(
            function (de /* :./models/test */ = 'string') {},
            parseAndConvertDefinitions({}),
            'test',
            undefined,
            undefined,
            __filename
        );
        setSedefEnv('COMMENT', false);
    });
};
