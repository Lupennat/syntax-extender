'use strict';

const { parseAndConvertDefinitions } = require('../../core/type-casting');

const extractParameters = require('../../core/extract-parameters');
const validateParameters = require('../../core/validate-parameters');

const Parameters = require('../../core/models/parameters');

const SyntaxExtenderValidateParametersMissingDestructuredPropertyError = require('../../errors/validate-parameters/syntax-extender-validate-parameter-missing-destructured-property-error');
const SyntaxExtenderValidateParametersMissingParameterError = require('../../errors/validate-parameters/syntax-extender-validate-parameter-missing-parameter-error');
const SyntaxExtenderValidateParametersNotValidDestructuredPropertyError = require('../../errors/validate-parameters/syntax-extender-validate-parameter-not-valid-destructured-property-error');
const SyntaxExtenderValidateParametersNotValidParameterError = require('../../errors/validate-parameters/syntax-extender-validate-parameter-not-valid-parameter-error');
const SyntaxExtenderNotValidArgumentError = require('../../errors/syntax-extender-not-valid-argument-error');

module.exports = () => {
    it('works arguments validation', function () {
        validateParameters(new Parameters());
        expect(() => {
            validateParameters({});
        }).toThrowError(SyntaxExtenderNotValidArgumentError);
    });

    it('works parameters base validation', function () {
        class Custom {}
        const Custom2 = function () {};

        class Custom3 extends Custom {}

        const Test = function () {};
        Test.prototype.test = function (custom) {};
        Test.prototype.testSelf = function (self) {};

        const parametersTest = extractParameters(
            Object.getOwnPropertyDescriptor(Test.prototype, 'test').value,
            parseAndConvertDefinitions({ test: { 1: Custom } }),
            'test',
            'test',
            Test
        );
        const parametersTestSelf = extractParameters(
            Test.prototype.testSelf,
            parseAndConvertDefinitions({ test: { 1: 'self' } }),
            'test',
            'testSelf',
            Test
        );

        class ExtendedTest extends Test {
            testParent(parent) {}
            testSelf(self) {}
        }

        const parametersTestParent = extractParameters(
            ExtendedTest.prototype.testParent,
            parseAndConvertDefinitions({ test: { 1: 'parent' } }),
            'test',
            'testParent',
            ExtendedTest
        );

        const parametersTestExtendeSelf = extractParameters(
            ExtendedTest.prototype.testSelf,
            parseAndConvertDefinitions({ test: { 1: 'self' } }),
            'test',
            'testSelf',
            ExtendedTest
        );

        // simulate Test.prototype.test(new Custom())
        validateParameters(parametersTest, new Custom());
        // simulate Test.prototype.test(new Custom3())
        validateParameters(parametersTest, new Custom3());

        // simulate Test.prototype.testSelf(new Test())
        validateParameters(parametersTestSelf, new Test());
        // simulate Test.prototype.testSelf(new ExtendedTest())
        validateParameters(parametersTestSelf, new ExtendedTest());

        // simulate ExtendedTest.prototype.testParent(new Test())
        validateParameters(parametersTestParent, new Test());
        // simulate ExtendedTest.prototype.testParent(new ExtendedTest())
        validateParameters(parametersTestParent, new ExtendedTest());

        // simulate ExtendedTest.prototype.testSelf(new ExtendedTest())
        validateParameters(parametersTestExtendeSelf, new ExtendedTest());
        expect(() => {
            // simulate ExtendedTest.prototype.testSelf(new Test())
            validateParameters(parametersTestExtendeSelf, new Test());
        }).toThrowError(SyntaxExtenderValidateParametersNotValidParameterError);

        // simulate Test.prototype.test()
        expect(() => {
            validateParameters(parametersTest);
        }).toThrowError(SyntaxExtenderValidateParametersMissingParameterError);

        // simulate Test.prototype.test('string')
        expect(() => {
            validateParameters(parametersTest, 'string');
        }).toThrowError(SyntaxExtenderValidateParametersNotValidParameterError);

        // simulate Test.prototype.test(() => {})
        expect(() => {
            validateParameters(parametersTest, () => {});
        }).toThrowError(SyntaxExtenderValidateParametersNotValidParameterError);

        // simulate Test.prototype.test(custom2)
        expect(() => {
            validateParameters(parametersTest, new Custom2());
        }).toThrowError(SyntaxExtenderValidateParametersNotValidParameterError);
    });

    it('works parameters validation setters and accessors', function () {
        class Custom {}
        class Test {
            set testSetter(test) {}
            set testAccessor(test) {}
            get testAccessor() {}
        }
        const parametersTestSetter = extractParameters(
            Object.getOwnPropertyDescriptor(Test.prototype, 'testSetter').set,
            parseAndConvertDefinitions({ test: { 1: Custom } }),
            'test',
            'testSetter',
            Test
        );
        const parametersTestAccessor = extractParameters(
            Object.getOwnPropertyDescriptor(Test.prototype, 'testAccessor').set,
            parseAndConvertDefinitions({ test: { 1: Custom } }),
            'test',
            'testAccessor',
            Test
        );
        // simulate Test.prototype.testSetter = new Custom();
        validateParameters(parametersTestSetter, new Custom());
        // simulate Test.prototype.testAccessor = new Custom();
        validateParameters(parametersTestAccessor, new Custom());
    });

    it('works parameters validation multiple', function () {
        const Test = function () {};
        Test.prototype.testmulti = function (custom) {};

        const parametersTest = extractParameters(
            Object.getOwnPropertyDescriptor(Test.prototype, 'testmulti').value,
            parseAndConvertDefinitions({ test: { 1: 'string|integer' } }),
            'test',
            'testmulti'
        );

        validateParameters(parametersTest, 1);
        validateParameters(parametersTest, 'test');
        expect(() => {
            validateParameters(parametersTest, []);
        }).toThrowError(SyntaxExtenderValidateParametersNotValidParameterError);
    });

    it('works parameters validation with default', function () {
        class Custom {}
        const Test = function () {};
        Test.prototype.test = function (custom = null) {};
        Test.prototype.testDefaultPosition = function (custom = null, test) {};
        Test.prototype.testDefaultPosition2 = function (custom = undefined, test) {};
        const parametersTest = extractParameters(
            Test.prototype.test,
            parseAndConvertDefinitions({ test: { 1: Custom } }),
            'test',
            'test',
            Test
        );
        const parametersTestDefaultPosition = extractParameters(
            Test.prototype.testDefaultPosition,
            parseAndConvertDefinitions({ test: { 1: Custom } }),
            'test',
            'testDefaultPosition',
            Test
        );

        const parametersTestDefaultPosition2 = extractParameters(
            Test.prototype.testDefaultPosition2,
            parseAndConvertDefinitions({ test: { 1: Custom } }),
            'test',
            'testDefaultPosition2',
            Test
        );

        // simulate Test.prototype.test(new Custom())
        validateParameters(parametersTest, new Custom());
        // simulate Test.prototype.testDefaultPosition(new Custom())
        expect(() => {
            validateParameters(parametersTestDefaultPosition, new Custom());
        }).toThrowError(SyntaxExtenderValidateParametersMissingParameterError);
        // simulate Test.prototype.testDefaultPosition(undefined, 'string')
        validateParameters(parametersTestDefaultPosition, undefined, 'string');
        // simulate Test.prototype.testDefaultPosition(null, 'string')
        validateParameters(parametersTestDefaultPosition, null, 'string');
        // simulate Test.prototype.testDefaultPosition2(undefined, 'string')
        validateParameters(parametersTestDefaultPosition2, undefined, 'string');
        // simulate Test.prototype.testDefaultPosition2(null, 'string')
        expect(() => {
            validateParameters(parametersTestDefaultPosition2, null, 'string');
        }).toThrowError(SyntaxExtenderValidateParametersNotValidParameterError);
    });

    it('works parameters validation on destructuring', function () {
        class Custom {}
        const Test = function () {};
        Test.prototype.testDestructuring = function ({ custom, string, ...variadic }) {};
        Test.prototype.testDestructuringVariadic = function (...{ custom, string, ...variadic }) {};

        const parametersTest = extractParameters(
            Test.prototype.testDestructuring,
            parseAndConvertDefinitions({ test: { 1.1: Custom, 1.2: 'string' } }),
            'test',
            'testDestructuring',
            Test
        );

        // simulate Test.prototype.test({})
        expect(() => {
            validateParameters(parametersTest, {});
        }).toThrowError(SyntaxExtenderValidateParametersMissingDestructuredPropertyError);
        // simulate Test.prototype.test({ custom: new Custom()})
        expect(() => {
            validateParameters(parametersTest, { custom: new Custom() });
        }).toThrowError(SyntaxExtenderValidateParametersMissingDestructuredPropertyError);
        // simulate Test.prototype.test({ custom: new Custom(), string: 'test'})
        validateParameters(parametersTest, { custom: new Custom(), string: 'test' });
        // simulate Test.prototype.test({ custom: {}, string: 'string'})
        expect(() => {
            validateParameters(parametersTest, { custom: {}, string: 'string' });
        }).toThrowError(SyntaxExtenderValidateParametersNotValidDestructuredPropertyError);
        // simulate Test.prototype.test({ custom: new Custom(), string: []})
        expect(() => {
            validateParameters(parametersTest, { custom: new Custom(), string: [] });
        }).toThrowError(SyntaxExtenderValidateParametersNotValidDestructuredPropertyError);

        // simulate Test.prototype.test({ custom: new Custom(), string: 'test', test: 'extra', again: true })
        validateParameters(parametersTest, { custom: new Custom(), string: 'test', test: 'extra', again: true });
    });

    it('works parameter validation nullable', function () {
        class Custom {}
        const Test = function () {};
        Test.prototype.test = function (test) {};
        Test.prototype.des = function (t, { de, at }) {};

        const definitionTest = extractParameters(
            Test.prototype.test,
            parseAndConvertDefinitions({ test: { '?1': Custom } }),
            'test',
            'test',
            Test
        );

        const definitionDes = extractParameters(
            Test.prototype.des,
            parseAndConvertDefinitions({ des: { '?2.2': Custom } }),
            'des',
            'des',
            Test
        );

        // simulate Test.prototype.test() { return new Custom();}
        validateParameters(definitionTest, new Custom());
        // simulate Test.prototype.test() { return new Custom();}
        validateParameters(definitionDes, 1, { de: 1, at: new Custom() });
        // simulate Test.prototype.test() { return null;}
        validateParameters(definitionTest, null);
        // simulate Test.prototype.test() { return new Custom();}
        validateParameters(definitionDes, 1, { de: 1, at: null });
        // simulate Test.prototype.definitionTest() { return undefined; }
        expect(() => {
            validateParameters(definitionTest, undefined);
        }).toThrowError(SyntaxExtenderValidateParametersNotValidParameterError);

        expect(() => {
            validateParameters(definitionDes, 1, { de: 1, at: undefined });
        }).toThrowError(SyntaxExtenderValidateParametersNotValidDestructuredPropertyError);
    });

    it('works parameter validation undefined not nullable', function () {
        const Test = function () {};
        Test.prototype.test = function (test) {};

        let definitionTest = extractParameters(
            Test.prototype.test,
            parseAndConvertDefinitions({ test: { '?1': 'void' } }),
            'test',
            'test',
            Test
        );

        validateParameters(definitionTest, undefined);
        validateParameters(definitionTest, null);

        definitionTest = extractParameters(
            Test.prototype.test,
            parseAndConvertDefinitions({ test: { 1: 'void' } }),
            'test',
            'test',
            Test
        );

        validateParameters(definitionTest, undefined);
        expect(() => {
            validateParameters(definitionTest, null);
        }).toThrowError(SyntaxExtenderValidateParametersNotValidParameterError);
    });

    it('works parameter validation promise', async function () {
        class Custom {}
        const Test = function () {};
        Test.prototype.test = function (test) {};
        Test.prototype.des = function (t, { de, at }) {};

        const definitionTest = extractParameters(
            Test.prototype.test,
            parseAndConvertDefinitions({ test: { '1->': Custom } }),
            'test',
            'test',
            Test
        );

        const definitionDes = extractParameters(
            Test.prototype.des,
            parseAndConvertDefinitions({ des: { '2.2->': Custom } }),
            'des',
            'des',
            Test
        );

        await expectAsync(
            validateParameters(
                definitionTest,
                new Promise(resolve => {
                    resolve(new Custom());
                })
            )[0]
        ).toBeResolvedTo(new Custom());

        await expectAsync(
            validateParameters(definitionDes, 1, {
                de: 1,
                at: new Promise(resolve => {
                    resolve(new Custom());
                })
            })[1].at
        ).toBeResolvedTo(new Custom());

        await expectAsync(
            validateParameters(
                definitionTest,
                new Promise(resolve => {
                    resolve('string');
                })
            )[0]
        ).toBeRejectedWithError(SyntaxExtenderValidateParametersNotValidParameterError);

        await expectAsync(
            validateParameters(definitionDes, 1, {
                de: 1,
                at: new Promise(resolve => {
                    resolve('string');
                })
            })[1].at
        ).toBeRejectedWithError(SyntaxExtenderValidateParametersNotValidDestructuredPropertyError);

        // simulate Test.prototype.definitionTest() { return new Custom(); }
        expect(() => {
            validateParameters(definitionTest, new Custom());
        }).toThrowError(SyntaxExtenderValidateParametersNotValidParameterError);

        expect(() => {
            validateParameters(definitionDes, 1, { de: 1, at: new Custom() });
        }).toThrowError(SyntaxExtenderValidateParametersNotValidDestructuredPropertyError);
    });

    it('works parameter validation iterable', async function () {
        class Custom {}
        const Test = function () {};
        Test.prototype.test = function (test) {};
        Test.prototype.des = function (t, { de, at }) {};

        const definitionTest = extractParameters(
            Test.prototype.test,
            parseAndConvertDefinitions({ test: { '1[]': Custom } }),
            'test',
            'test',
            Test
        );

        const definitionDes = extractParameters(
            Test.prototype.des,
            parseAndConvertDefinitions({ des: { '2.2[]': Custom } }),
            'des',
            'des',
            Test
        );

        expect(validateParameters(definitionTest, [new Custom()])[0]).toEqual([new Custom()]);

        expect(
            validateParameters(definitionDes, 1, {
                de: 1,
                at: [new Custom()]
            })[1].at
        ).toEqual([new Custom()]);

        expect(() => {
            validateParameters(definitionTest, ['string'])[0];
        }).toThrowError(SyntaxExtenderValidateParametersNotValidParameterError);

        expect(() => {
            validateParameters(definitionDes, 1, {
                de: 1,
                at: ['string']
            })[1].at;
        }).toThrowError(SyntaxExtenderValidateParametersNotValidDestructuredPropertyError);

        // simulate Test.prototype.definitionTest() { return new Custom(); }
        expect(() => {
            validateParameters(definitionTest, new Custom());
        }).toThrowError(SyntaxExtenderValidateParametersNotValidParameterError);

        expect(() => {
            validateParameters(definitionDes, 1, { de: 1, at: new Custom() });
        }).toThrowError(SyntaxExtenderValidateParametersNotValidDestructuredPropertyError);
    });

    it('works parameter validation nullable promise', async function () {
        class Custom {}
        const Test = function () {};
        Test.prototype.test = function (test) {};
        Test.prototype.des = function (t, { de, at }) {};

        const definitionTest = extractParameters(
            Test.prototype.test,
            parseAndConvertDefinitions({ test: { '?1->': Custom } }),
            'test',
            'test',
            Test
        );

        const definitionDes = extractParameters(
            Test.prototype.des,
            parseAndConvertDefinitions({ des: { '?2.2->': Custom } }),
            'des',
            'des',
            Test
        );

        await expectAsync(
            validateParameters(
                definitionTest,
                new Promise(resolve => {
                    resolve(new Custom());
                })
            )[0]
        ).toBeResolvedTo(new Custom());

        await expectAsync(
            validateParameters(definitionDes, 1, {
                de: 1,
                at: new Promise(resolve => {
                    resolve(new Custom());
                })
            })[1].at
        ).toBeResolvedTo(new Custom());

        await expectAsync(
            validateParameters(
                definitionTest,
                new Promise(resolve => {
                    resolve('string');
                })
            )[0]
        ).toBeRejectedWithError(SyntaxExtenderValidateParametersNotValidParameterError);

        await expectAsync(
            validateParameters(definitionDes, 1, {
                de: 1,
                at: new Promise(resolve => {
                    resolve('string');
                })
            })[1].at
        ).toBeRejectedWithError(SyntaxExtenderValidateParametersNotValidDestructuredPropertyError);

        await expectAsync(
            validateParameters(
                definitionTest,
                new Promise(resolve => {
                    resolve(null);
                })
            )[0]
        ).toBeRejectedWithError(SyntaxExtenderValidateParametersNotValidParameterError);

        await expectAsync(
            validateParameters(definitionDes, 1, {
                de: 1,
                at: new Promise(resolve => {
                    resolve(null);
                })
            })[1].at
        ).toBeRejectedWithError(SyntaxExtenderValidateParametersNotValidDestructuredPropertyError);

        validateParameters(definitionTest, null);

        validateParameters(definitionDes, 1, { de: 1, at: null });
    });

    it('works parameter validation nullable iterables', async function () {
        class Custom {}
        const Test = function () {};
        Test.prototype.test = function (test) {};
        Test.prototype.des = function (t, { de, at }) {};

        const definitionTest = extractParameters(
            Test.prototype.test,
            parseAndConvertDefinitions({ test: { '?1[]': Custom } }),
            'test',
            'test',
            Test
        );

        const definitionDes = extractParameters(
            Test.prototype.des,
            parseAndConvertDefinitions({ des: { '?2.2[]': Custom } }),
            'des',
            'des',
            Test
        );

        expect(validateParameters(definitionTest, [new Custom()])[0]).toEqual([new Custom()]);

        expect(
            validateParameters(definitionDes, 1, {
                de: 1,
                at: [new Custom()]
            })[1].at
        ).toEqual([new Custom()]);

        expect(() => {
            validateParameters(definitionTest, ['string'])[0];
        }).toThrowError(SyntaxExtenderValidateParametersNotValidParameterError);

        expect(() => {
            validateParameters(definitionDes, 1, {
                de: 1,
                at: ['string']
            })[1].at;
        }).toThrowError(SyntaxExtenderValidateParametersNotValidDestructuredPropertyError);

        expect(() => {
            validateParameters(definitionTest, [null])[0];
        }).toThrowError(SyntaxExtenderValidateParametersNotValidParameterError);

        expect(() => {
            validateParameters(definitionDes, 1, {
                de: 1,
                at: [null]
            })[1].at;
        }).toThrowError(SyntaxExtenderValidateParametersNotValidDestructuredPropertyError);

        validateParameters(definitionTest, null);

        validateParameters(definitionDes, 1, { de: 1, at: null });
    });

    it('works parameter validation nullable on promise resolver', async function () {
        class Custom {}
        const Test = function () {};
        Test.prototype.test = function (test) {};
        Test.prototype.des = function (t, { de, at }) {};

        const definitionTest = extractParameters(
            Test.prototype.test,
            parseAndConvertDefinitions({ test: { '1?>': Custom } }),
            'test',
            'test',
            Test
        );

        const definitionDes = extractParameters(
            Test.prototype.des,
            parseAndConvertDefinitions({ des: { '2.2?>': Custom } }),
            'des',
            'des',
            Test
        );

        await expectAsync(
            validateParameters(
                definitionTest,
                new Promise(resolve => {
                    resolve(new Custom());
                })
            )[0]
        ).toBeResolvedTo(new Custom());

        await expectAsync(
            validateParameters(definitionDes, 1, {
                de: 1,
                at: new Promise(resolve => {
                    resolve(new Custom());
                })
            })[1].at
        ).toBeResolvedTo(new Custom());

        await expectAsync(
            validateParameters(
                definitionTest,
                new Promise(resolve => {
                    resolve('string');
                })
            )[0]
        ).toBeRejectedWithError(SyntaxExtenderValidateParametersNotValidParameterError);

        await expectAsync(
            validateParameters(definitionDes, 1, {
                de: 1,
                at: new Promise(resolve => {
                    resolve('string');
                })
            })[1].at
        ).toBeRejectedWithError(SyntaxExtenderValidateParametersNotValidDestructuredPropertyError);

        await expectAsync(
            validateParameters(
                definitionTest,
                new Promise(resolve => {
                    resolve(null);
                })
            )[0]
        ).toBeResolvedTo(null);

        await expectAsync(
            validateParameters(definitionDes, 1, {
                de: 1,
                at: new Promise(resolve => {
                    resolve(null);
                })
            })[1].at
        ).toBeResolvedTo(null);

        expect(() => {
            validateParameters(definitionTest, null);
        }).toThrowError(SyntaxExtenderValidateParametersNotValidParameterError);

        expect(() => {
            validateParameters(definitionDes, 1, { de: 1, at: null });
        }).toThrowError(SyntaxExtenderValidateParametersNotValidDestructuredPropertyError);
    });

    it('works parameter validation nullable on iterable resolver', async function () {
        class Custom {}
        const Test = function () {};
        Test.prototype.test = function (test) {};
        Test.prototype.des = function (t, { de, at }) {};

        const definitionTest = extractParameters(
            Test.prototype.test,
            parseAndConvertDefinitions({ test: { '1[?]': Custom } }),
            'test',
            'test',
            Test
        );

        const definitionDes = extractParameters(
            Test.prototype.des,
            parseAndConvertDefinitions({ des: { '2.2[?]': Custom } }),
            'des',
            'des',
            Test
        );

        expect(validateParameters(definitionTest, [new Custom()])[0]).toEqual([new Custom()]);

        expect(
            validateParameters(definitionDes, 1, {
                de: 1,
                at: [new Custom()]
            })[1].at
        ).toEqual([new Custom()]);

        expect(() => {
            validateParameters(definitionTest, ['string'])[0];
        }).toThrowError(SyntaxExtenderValidateParametersNotValidParameterError);

        expect(() => {
            validateParameters(definitionDes, 1, {
                de: 1,
                at: ['string']
            })[1].at;
        }).toThrowError(SyntaxExtenderValidateParametersNotValidDestructuredPropertyError);

        expect(validateParameters(definitionTest, [null])[0]).toEqual([null]);

        expect(
            validateParameters(definitionDes, 1, {
                de: 1,
                at: [null]
            })[1].at
        ).toEqual([null]);

        expect(() => {
            validateParameters(definitionTest, null);
        }).toThrowError(SyntaxExtenderValidateParametersNotValidParameterError);

        expect(() => {
            validateParameters(definitionDes, 1, { de: 1, at: null });
        }).toThrowError(SyntaxExtenderValidateParametersNotValidDestructuredPropertyError);
    });

    it('works parameter validation multiple promise', async function () {
        class Custom {}
        const Test = function () {};
        Test.prototype.test = function (test) {};
        Test.prototype.des = function (t, { de, at }) {};

        const definitionTest = extractParameters(
            Test.prototype.test,
            parseAndConvertDefinitions({ test: { '?1->': 'string|array' } }),
            'test',
            'test',
            Test
        );

        const definitionDes = extractParameters(
            Test.prototype.des,
            parseAndConvertDefinitions({ des: { '?2.2->': 'string|array' } }),
            'des',
            'des',
            Test
        );

        await expectAsync(
            validateParameters(
                definitionTest,
                new Promise(resolve => {
                    resolve('string');
                })
            )[0]
        ).toBeResolvedTo('string');

        await expectAsync(
            validateParameters(definitionDes, 1, {
                de: 1,
                at: new Promise(resolve => {
                    resolve('string');
                })
            })[1].at
        ).toBeResolvedTo('string');

        await expectAsync(
            validateParameters(
                definitionTest,
                new Promise(resolve => {
                    resolve([1, 2]);
                })
            )[0]
        ).toBeResolvedTo([1, 2]);

        await expectAsync(
            validateParameters(definitionDes, 1, {
                de: 1,
                at: new Promise(resolve => {
                    resolve([1, 2]);
                })
            })[1].at
        ).toBeResolvedTo([1, 2]);

        await expectAsync(
            validateParameters(
                definitionTest,
                new Promise(resolve => {
                    resolve(new Custom());
                })
            )[0]
        ).toBeRejectedWithError(SyntaxExtenderValidateParametersNotValidParameterError);

        await expectAsync(
            validateParameters(definitionDes, 1, {
                de: 1,
                at: new Promise(resolve => {
                    resolve(new Custom());
                })
            })[1].at
        ).toBeRejectedWithError(SyntaxExtenderValidateParametersNotValidDestructuredPropertyError);
    });

    it('works parameter validation multiple iteration value type', async function () {
        class Custom {}
        const Test = function () {};
        Test.prototype.test = function (test) {};
        Test.prototype.des = function (t, { de, at }) {};

        const definitionTest = extractParameters(
            Test.prototype.test,
            parseAndConvertDefinitions({ test: { '?1[]': 'string|array' } }),
            'test',
            'test',
            Test
        );

        const definitionDes = extractParameters(
            Test.prototype.des,
            parseAndConvertDefinitions({ des: { '?2.2[]': 'string|array' } }),
            'des',
            'des',
            Test
        );

        expect(validateParameters(definitionTest, ['string'])[0]).toEqual(['string']);

        expect(
            validateParameters(definitionDes, 1, {
                de: 1,
                at: ['string']
            })[1].at
        ).toEqual(['string']);

        expect(validateParameters(definitionTest, [[1, 2]])[0]).toEqual([[1, 2]]);

        expect(
            validateParameters(definitionDes, 1, {
                de: 1,
                at: [[1, 2]]
            })[1].at
        ).toEqual([[1, 2]]);

        expect(() => {
            validateParameters(definitionTest, [new Custom()])[0];
        }).toThrowError(SyntaxExtenderValidateParametersNotValidParameterError);

        expect(() => {
            validateParameters(definitionDes, 1, {
                de: 1,
                at: [new Custom()]
            })[1].at;
        }).toThrowError(SyntaxExtenderValidateParametersNotValidDestructuredPropertyError);
    });

    it('works return validation nullable multiple promise', async function () {
        class Custom {}
        const Test = function () {};
        Test.prototype.test = function (test) {};
        Test.prototype.des = function (t, { de, at }) {};

        const definitionTest = extractParameters(
            Test.prototype.test,
            parseAndConvertDefinitions({ test: { '1?>': 'string|array' } }),
            'test',
            'test',
            Test
        );

        const definitionDes = extractParameters(
            Test.prototype.des,
            parseAndConvertDefinitions({ des: { '2.2?>': 'string|array' } }),
            'des',
            'des',
            Test
        );

        await expectAsync(
            validateParameters(
                definitionTest,
                new Promise(resolve => {
                    resolve(null);
                })
            )[0]
        ).toBeResolvedTo(null);

        await expectAsync(
            validateParameters(definitionDes, 1, {
                de: 1,
                at: new Promise(resolve => {
                    resolve(null);
                })
            })[1].at
        ).toBeResolvedTo(null);

        expect(() => {
            validateParameters(definitionTest, null);
        }).toThrowError(SyntaxExtenderValidateParametersNotValidParameterError);

        expect(() => {
            validateParameters(definitionDes, 1, { de: 1, at: null });
        }).toThrowError(SyntaxExtenderValidateParametersNotValidDestructuredPropertyError);
    });

    it('works return validation nullable multiple iteration values', async function () {
        class Custom {}
        const Test = function () {};
        Test.prototype.test = function (test) {};
        Test.prototype.des = function (t, { de, at }) {};

        const definitionTest = extractParameters(
            Test.prototype.test,
            parseAndConvertDefinitions({ test: { '1[?]': 'string|array' } }),
            'test',
            'test',
            Test
        );

        const definitionDes = extractParameters(
            Test.prototype.des,
            parseAndConvertDefinitions({ des: { '2.2[?]': 'string|array' } }),
            'des',
            'des',
            Test
        );

        expect(validateParameters(definitionTest, [null])[0]).toEqual([null]);

        expect(
            validateParameters(definitionDes, 1, {
                de: 1,
                at: [null]
            })[1].at
        ).toEqual([null]);

        expect(() => {
            validateParameters(definitionTest, null);
        }).toThrowError(SyntaxExtenderValidateParametersNotValidParameterError);

        expect(() => {
            validateParameters(definitionDes, 1, { de: 1, at: null });
        }).toThrowError(SyntaxExtenderValidateParametersNotValidDestructuredPropertyError);
    });

    it('works return validation all nullable also promise', async function () {
        const Test = function () {};
        Test.prototype.test = function (test) {};
        Test.prototype.des = function (t, { de, at }) {};

        const definitionTest = extractParameters(
            Test.prototype.test,
            parseAndConvertDefinitions({ test: { '?1?>': 'string' } }),
            'test',
            'test',
            Test
        );

        const definitionDes = extractParameters(
            Test.prototype.des,
            parseAndConvertDefinitions({ des: { '?2.2?>': 'string|array' } }),
            'des',
            'des',
            Test
        );

        await expectAsync(
            validateParameters(
                definitionTest,
                new Promise(resolve => {
                    resolve(null);
                })
            )[0]
        ).toBeResolvedTo(null);

        await expectAsync(
            validateParameters(definitionDes, 1, {
                de: 1,
                at: new Promise(resolve => {
                    resolve(null);
                })
            })[1].at
        ).toBeResolvedTo(null);

        validateParameters(definitionTest, null);
        validateParameters(definitionDes, 1, { de: 1, at: null });
    });

    it('works return validation all nullable also iterable', async function () {
        const Test = function () {};
        Test.prototype.test = function (test) {};
        Test.prototype.des = function (t, { de, at }) {};

        const definitionTest = extractParameters(
            Test.prototype.test,
            parseAndConvertDefinitions({ test: { '?1[?]': 'string' } }),
            'test',
            'test',
            Test
        );

        const definitionDes = extractParameters(
            Test.prototype.des,
            parseAndConvertDefinitions({ des: { '?2.2[?]': 'string|array' } }),
            'des',
            'des',
            Test
        );

        expect(validateParameters(definitionTest, [null])[0]).toEqual([null]);

        expect(
            validateParameters(definitionDes, 1, {
                de: 1,
                at: [null]
            })[1].at
        ).toEqual([null]);

        validateParameters(definitionTest, null);
        validateParameters(definitionDes, 1, { de: 1, at: null });
    });
};
