'use strict';

const { parseAndConvertDefinitions } = require('../../core/type-casting');

const extractReturn = require('../../core/extract-return');
const validateReturn = require('../../core/validate-return');

const Return = require('../../core/models/return');

const SyntaxExtenderNotValidArgumentError = require('../../errors/syntax-extender-not-valid-argument-error');
const SyntaxExtenderValidateReturnNotValidReturnError = require('../../errors/validate-return/syntax-extender-validate-return-not-valid-return-error');

module.exports = () => {
    it('works arguments validation', function () {
        validateReturn(new Return());
        expect(() => {
            validateReturn({});
        }).toThrowError(SyntaxExtenderNotValidArgumentError);
    });

    it('works return base validation', function () {
        class Custom {}
        const Custom2 = function () {};

        class Custom3 extends Custom {}

        const Test = function () {};
        Test.prototype.test = function () {};
        Test.prototype.testSelf = function () {};

        const definitionTest = extractReturn(
            Test.prototype.test,
            parseAndConvertDefinitions({ test: { return: Custom } }),
            'test',
            'test',
            Test
        );
        const definitionTestSelf = extractReturn(
            Test.prototype.testSelf,
            parseAndConvertDefinitions({ test: { return: 'self' } }),
            'test',
            'testSelf',
            Test
        );

        class ExtendedTest extends Test {
            testParent() {}
            testSelf(sef) {}
        }

        const definitionTestParent = extractReturn(
            ExtendedTest.prototype.testParent,
            parseAndConvertDefinitions({ test: { return: 'parent' } }),
            'test',
            'testParent',
            ExtendedTest
        );

        const definitionTestExtendeSelf = extractReturn(
            ExtendedTest.prototype.testSelf,
            parseAndConvertDefinitions({ test: { return: 'self' } }),
            'test',
            'testSelf',
            ExtendedTest
        );

        // simulate Test.prototype.test() {return new Custom()); }
        validateReturn(definitionTest, new Custom());
        // simulate Test.prototype.test() { return new Custom3(); }
        validateReturn(definitionTest, new Custom3());

        // simulate Test.prototype.testSelf() { return new Test(); }
        validateReturn(definitionTestSelf, new Test());
        // simulate Test.prototype.testSelf() { return new ExtendedTest(); }
        validateReturn(definitionTestSelf, new ExtendedTest());

        // simulate ExtendedTest.prototype.testParent() { return new Test(); }
        validateReturn(definitionTestParent, new Test());
        // simulate ExtendedTest.prototype.testParent() { return new ExtendedTest(); }
        validateReturn(definitionTestParent, new ExtendedTest());

        // simulate ExtendedTest.prototype.testSelf() { return new ExtendedTest(); }
        validateReturn(definitionTestExtendeSelf, new ExtendedTest());
        expect(() => {
            // simulate ExtendedTest.prototype.testSelf()  { return new Test(); }
            validateReturn(definitionTestExtendeSelf, new Test());
        }).toThrowError(SyntaxExtenderValidateReturnNotValidReturnError);

        // simulate Test.prototype.test() { return undefined; }
        expect(() => {
            validateReturn(definitionTest);
        }).toThrowError(SyntaxExtenderValidateReturnNotValidReturnError);

        // simulate Test.prototype.test() { return 'string'; }
        expect(() => {
            validateReturn(definitionTest, 'string');
        }).toThrowError(SyntaxExtenderValidateReturnNotValidReturnError);

        // simulate Test.prototype.test() { return () => {}; }
        expect(() => {
            validateReturn(definitionTest, () => {});
        }).toThrowError(SyntaxExtenderValidateReturnNotValidReturnError);

        // simulate Test.prototype.test() { return  new Custom2(); }
        expect(() => {
            validateReturn(definitionTest, new Custom2());
        }).toThrowError(SyntaxExtenderValidateReturnNotValidReturnError);
    });

    it('works return validation multiple', function () {
        const Test = function () {};
        Test.prototype.testmulti = function () {};

        const definitionTest = extractReturn(
            Test.prototype.testmulti,
            parseAndConvertDefinitions({ test: { return: 'string|integer' } }),
            'test',
            'testmulti'
        );

        validateReturn(definitionTest, 1);
        validateReturn(definitionTest, 'test');
        expect(() => {
            validateReturn(definitionTest, []);
        }).toThrowError(SyntaxExtenderValidateReturnNotValidReturnError);
    });

    it('works return validation nullable', function () {
        class Custom {}
        const Test = function () {};
        Test.prototype.test = function () {};

        const definitionTest = extractReturn(
            Test.prototype.test,
            parseAndConvertDefinitions({ test: { '?return': Custom } }),
            'test',
            'test',
            Test
        );

        // simulate Test.prototype.test() { return new Custom();}
        validateReturn(definitionTest, new Custom());
        // simulate Test.prototype.test() { return null;}
        validateReturn(definitionTest, null);
        // simulate Test.prototype.definitionTest() { return undefined; }
        expect(() => {
            validateReturn(definitionTest, undefined);
        }).toThrowError(SyntaxExtenderValidateReturnNotValidReturnError);
    });

    it('works return validation promise', async function () {
        class Custom {}
        const Test = function () {};
        Test.prototype.test = function () {};

        const definitionTest = extractReturn(
            Test.prototype.test,
            parseAndConvertDefinitions({ test: { 'return->': Custom } }),
            'test',
            'test',
            Test
        );

        await expectAsync(
            validateReturn(
                definitionTest,
                new Promise(resolve => {
                    resolve(new Custom());
                })
            )
        ).toBeResolvedTo(new Custom());

        await expectAsync(
            validateReturn(
                definitionTest,
                new Promise(resolve => {
                    resolve('string');
                })
            )
        ).toBeRejectedWithError(SyntaxExtenderValidateReturnNotValidReturnError);

        // simulate Test.prototype.definitionTest() { return new Custom(); }
        expect(() => {
            validateReturn(definitionTest, new Custom());
        }).toThrowError(SyntaxExtenderValidateReturnNotValidReturnError);
    });

    it('works return validation nullable promise', async function () {
        class Custom {}
        const Test = function () {};
        Test.prototype.test = function () {};

        const definitionTest = extractReturn(
            Test.prototype.test,
            parseAndConvertDefinitions({ test: { '?return->': Custom } }),
            'test',
            'test',
            Test
        );

        await expectAsync(
            validateReturn(
                definitionTest,
                new Promise(resolve => {
                    resolve(new Custom());
                })
            )
        ).toBeResolvedTo(new Custom());

        await expectAsync(
            validateReturn(
                definitionTest,
                new Promise(resolve => {
                    resolve('string');
                })
            )
        ).toBeRejectedWithError(SyntaxExtenderValidateReturnNotValidReturnError);

        await expectAsync(
            validateReturn(
                definitionTest,
                new Promise(resolve => {
                    resolve(null);
                })
            )
        ).toBeRejectedWithError(SyntaxExtenderValidateReturnNotValidReturnError);

        validateReturn(definitionTest, null);
    });

    it('works return validation nullable on promise resolver', async function () {
        class Custom {}
        const Test = function () {};
        Test.prototype.test = function () {};

        const definitionTest = extractReturn(
            Test.prototype.test,
            parseAndConvertDefinitions({ test: { 'return?>': Custom } }),
            'test',
            'test',
            Test
        );

        await expectAsync(
            validateReturn(
                definitionTest,
                new Promise(resolve => {
                    resolve(new Custom());
                })
            )
        ).toBeResolvedTo(new Custom());

        await expectAsync(
            validateReturn(
                definitionTest,
                new Promise(resolve => {
                    resolve('string');
                })
            )
        ).toBeRejectedWithError(SyntaxExtenderValidateReturnNotValidReturnError);

        await expectAsync(
            validateReturn(
                definitionTest,
                new Promise(resolve => {
                    resolve(null);
                })
            )
        ).toBeResolvedTo(null);

        expect(() => {
            validateReturn(definitionTest, null);
        }).toThrowError(SyntaxExtenderValidateReturnNotValidReturnError);
    });

    it('works return validation multiple promise', async function () {
        class Custom {}
        const Test = function () {};
        Test.prototype.test = function () {};

        const definitionTest = extractReturn(
            Test.prototype.test,
            parseAndConvertDefinitions({ test: { '?return->': 'string|array' } }),
            'test',
            'test',
            Test
        );

        await expectAsync(
            validateReturn(
                definitionTest,
                new Promise(resolve => {
                    resolve('string');
                })
            )
        ).toBeResolvedTo('string');

        await expectAsync(
            validateReturn(
                definitionTest,
                new Promise(resolve => {
                    resolve([1, 2]);
                })
            )
        ).toBeResolvedTo([1, 2]);

        await expectAsync(
            validateReturn(
                definitionTest,
                new Promise(resolve => {
                    resolve(new Custom());
                })
            )
        ).toBeRejectedWithError(SyntaxExtenderValidateReturnNotValidReturnError);
    });

    it('works return validation nullable multiple promise', async function () {
        class Custom {}
        const Test = function () {};
        Test.prototype.test = function () {};

        const definitionTest = extractReturn(
            Test.prototype.test,
            parseAndConvertDefinitions({ test: { 'return?>': 'string|array' } }),
            'test',
            'test',
            Test
        );

        await expectAsync(
            validateReturn(
                definitionTest,
                new Promise(resolve => {
                    resolve(null);
                })
            )
        ).toBeResolvedTo(null);

        expect(() => {
            validateReturn(definitionTest, null);
        }).toThrowError(SyntaxExtenderValidateReturnNotValidReturnError);
    });

    it('works return validation all nullable also promise', async function () {
        const Test = function () {};
        Test.prototype.test = function () {};

        const definitionTest = extractReturn(
            Test.prototype.test,
            parseAndConvertDefinitions({ test: { '?return?>': 'string' } }),
            'test',
            'test',
            Test
        );

        await expectAsync(
            validateReturn(
                definitionTest,
                new Promise(resolve => {
                    resolve(null);
                })
            )
        ).toBeResolvedTo(null);

        validateReturn(definitionTest, null);
    });

    it('works return validation for all iterables', async function () {
        class Custom {}
        const Test = function () {};
        Test.prototype.test = function () {};

        let definitionTest = extractReturn(
            Test.prototype.test,
            parseAndConvertDefinitions({ test: { 'return[]': Custom } }),
            'test',
            'test',
            Test
        );

        let iterable = validateReturn(definitionTest, function* () {
            for (let x = 0; x < 3; x++) {
                yield new Custom();
            }
        });

        expect(...iterable()).toEqual(new Custom());

        iterable = validateReturn(definitionTest, {
            *[Symbol.iterator]() {
                for (let x = 0; x < 3; x++) {
                    yield new Custom();
                }
            }
        });

        expect(...iterable).toEqual(new Custom());

        expect(validateReturn(definitionTest, [new Custom(), new Custom(), new Custom()])).toEqual([
            new Custom(),
            new Custom(),
            new Custom()
        ]);

        expect(...iterable).toEqual(new Custom());

        iterable = validateReturn(definitionTest, []);

        expect(...iterable).toEqual();

        const map = new Map();
        map.set(new Custom());
        map.set(new Custom());
        map.set(new Custom());

        iterable = validateReturn(definitionTest, map);

        expect(...iterable.keys()).toEqual(new Custom());

        const set = new Set();
        set.add(new Custom());
        set.add(new Custom());
        set.add(new Custom());

        iterable = validateReturn(definitionTest, set);

        expect(...iterable).toEqual(new Custom());

        // typedArray not iterables
        expect(() => {
            validateReturn(definitionTest, new Int8Array(8));
        }).toThrowError(SyntaxExtenderValidateReturnNotValidReturnError);
    });

    it('works return validation nullable iterables', async function () {
        class Custom {}
        const Test = function () {};
        Test.prototype.test = function () {};

        const definitionTest = extractReturn(
            Test.prototype.test,
            parseAndConvertDefinitions({ test: { '?return[]': Custom } }),
            'test',
            'test',
            Test
        );

        let iterable = validateReturn(definitionTest, [new Custom(), new Custom(), new Custom()]);

        expect(...iterable).toEqual(new Custom());

        expect(() => {
            validateReturn(definitionTest, [1, 2, 3]);
        }).toThrowError(SyntaxExtenderValidateReturnNotValidReturnError);

        expect(() => {
            validateReturn(definitionTest, [null, null, null]);
        }).toThrowError(SyntaxExtenderValidateReturnNotValidReturnError);

        let set = new Set();
        set.add(null);
        set.add(new Custom());
        set.add(null);

        iterable = validateReturn(definitionTest, set);

        expect(() => {
            [...iterable];
        }).toThrowError(SyntaxExtenderValidateReturnNotValidReturnError);

        expect(validateReturn(definitionTest, null)).toEqual(null);
    });

    it('works return validation nullable on iteration', async function () {
        class Custom {}
        const Test = function () {};
        Test.prototype.test = function () {};

        const definitionTest = extractReturn(
            Test.prototype.test,
            parseAndConvertDefinitions({ test: { 'return[?]': Custom } }),
            'test',
            'test',
            Test
        );

        expect(validateReturn(definitionTest, [new Custom()])).toEqual([new Custom()]);
        expect(() => {
            validateReturn(definitionTest, [1, 2, 3]);
        }).toThrowError(SyntaxExtenderValidateReturnNotValidReturnError);
        expect(validateReturn(definitionTest, [null, new Custom()])).toEqual([null, new Custom()]);

        expect(() => {
            validateReturn(definitionTest, null);
        }).toThrowError(SyntaxExtenderValidateReturnNotValidReturnError);
    });

    it('works return validation multiple iterable', async function () {
        const Test = function () {};
        Test.prototype.test = function () {};

        const definitionTest = extractReturn(
            Test.prototype.test,
            parseAndConvertDefinitions({ test: { '?return[]': 'integer|float' } }),
            'test',
            'test',
            Test
        );

        expect(validateReturn(definitionTest, [1.5, 2.3, 3, 4])).toEqual([1.5, 2.3, 3, 4]);

        expect(() => {
            validateReturn(definitionTest, ['a', 'b', 'c']);
        }).toThrowError(SyntaxExtenderValidateReturnNotValidReturnError);
    });

    it('works return validation nullable multiple iteration', async function () {
        const Test = function () {};
        Test.prototype.test = function () {};

        const definitionTest = extractReturn(
            Test.prototype.test,
            parseAndConvertDefinitions({ test: { 'return[?]': 'integer|float' } }),
            'test',
            'test',
            Test
        );

        expect(validateReturn(definitionTest, [1.5, 2.3, 3, 4, null, null])).toEqual([1.5, 2.3, 3, 4, null, null]);

        expect(() => {
            validateReturn(definitionTest, null);
        }).toThrowError(SyntaxExtenderValidateReturnNotValidReturnError);
    });

    it('works return validation iterable nullable and also iteration', async function () {
        const Test = function () {};
        Test.prototype.test = function () {};

        const definitionTest = extractReturn(
            Test.prototype.test,
            parseAndConvertDefinitions({ test: { '?return[?]': 'integer|float' } }),
            'test',
            'test',
            Test
        );

        expect(validateReturn(definitionTest, [1.5, 2.3, 3, 4, null, null])).toEqual([1.5, 2.3, 3, 4, null, null]);

        expect(validateReturn(definitionTest, null)).toEqual(null);
    });

    it('works promise - iterable chain', async function () {
        const Test = function () {};
        Test.prototype.test = function (test) {};

        let definitionTest = extractReturn(
            Test.prototype.test,
            parseAndConvertDefinitions({ test: { 'return->[]': 'number' } }),
            'test',
            'test',
            Test
        );

        expect(() => {
            validateReturn(definitionTest, []);
        }).toThrowError(SyntaxExtenderValidateReturnNotValidReturnError);

        await expectAsync(
            validateReturn(
                definitionTest,
                new Promise(resolve => {
                    resolve('string');
                })
            )
        ).toBeRejectedWithError(SyntaxExtenderValidateReturnNotValidReturnError);

        await expectAsync(
            validateReturn(
                definitionTest,
                new Promise(resolve => {
                    resolve([1, 2, 3, 4]);
                })
            )
        ).toBeResolvedTo([1, 2, 3, 4]);

        let set = new Set();
        set.add(1);
        set.add(2);
        set.add(3);

        let resolved = await validateReturn(
            definitionTest,
            new Promise(resolve => {
                resolve(set);
            })
        );

        expect(...resolved).toEqual(jasmine.any(Number));

        await expectAsync(
            validateReturn(
                definitionTest,
                new Promise(resolve => {
                    resolve(null);
                })
            )
        ).toBeRejectedWithError(SyntaxExtenderValidateReturnNotValidReturnError);

        await expectAsync(
            validateReturn(
                definitionTest,
                new Promise(resolve => {
                    resolve([null, null, 3, 4]);
                })
            )
        ).toBeRejectedWithError(SyntaxExtenderValidateReturnNotValidReturnError);

        expect(() => {
            validateReturn(definitionTest, null);
        }).toThrowError(SyntaxExtenderValidateReturnNotValidReturnError);

        definitionTest = extractReturn(
            Test.prototype.test,
            parseAndConvertDefinitions({ test: { 'return->[?]': 'number' } }),
            'test',
            'test',
            Test
        );

        await expectAsync(
            validateReturn(
                definitionTest,
                new Promise(resolve => {
                    resolve([1, 2, 3, 4]);
                })
            )
        ).toBeResolvedTo([1, 2, 3, 4]);

        set = new Set();
        set.add(1);
        set.add(2);
        set.add(3);

        resolved = await validateReturn(
            definitionTest,
            new Promise(resolve => {
                resolve(set);
            })
        );

        expect(...resolved).toEqual(jasmine.any(Number));

        await expectAsync(
            validateReturn(
                definitionTest,
                new Promise(resolve => {
                    resolve(null);
                })
            )
        ).toBeRejectedWithError(SyntaxExtenderValidateReturnNotValidReturnError);

        await expectAsync(
            validateReturn(
                definitionTest,
                new Promise(resolve => {
                    resolve([null, null, 3, 4]);
                })
            )
        ).toBeResolvedTo([null, null, 3, 4]);

        expect(() => {
            validateReturn(definitionTest, null);
        }).toThrowError(SyntaxExtenderValidateReturnNotValidReturnError);

        definitionTest = extractReturn(
            Test.prototype.test,
            parseAndConvertDefinitions({ test: { 'return?>[]': 'number' } }),
            'test',
            'test',
            Test
        );

        await expectAsync(
            validateReturn(
                definitionTest,
                new Promise(resolve => {
                    resolve([1, 2, 3, 4]);
                })
            )
        ).toBeResolvedTo([1, 2, 3, 4]);

        await expectAsync(
            validateReturn(
                definitionTest,
                new Promise(resolve => {
                    resolve(null);
                })
            )
        ).toBeResolvedTo(null);

        await expectAsync(
            validateReturn(
                definitionTest,
                new Promise(resolve => {
                    resolve([null, null, 3, 4]);
                })
            )
        ).toBeRejectedWithError(SyntaxExtenderValidateReturnNotValidReturnError);

        expect(() => {
            validateReturn(definitionTest, null);
        }).toThrowError(SyntaxExtenderValidateReturnNotValidReturnError);

        definitionTest = extractReturn(
            Test.prototype.test,
            parseAndConvertDefinitions({ test: { 'return?>[?]': 'number' } }),
            'test',
            'test',
            Test
        );

        await expectAsync(
            validateReturn(
                definitionTest,
                new Promise(resolve => {
                    resolve([1, 2, 3, 4]);
                })
            )
        ).toBeResolvedTo([1, 2, 3, 4]);

        await expectAsync(
            validateReturn(
                definitionTest,
                new Promise(resolve => {
                    resolve(null);
                })
            )
        ).toBeResolvedTo(null);

        await expectAsync(
            validateReturn(
                definitionTest,
                new Promise(resolve => {
                    resolve([null, null, 3, 4]);
                })
            )
        ).toBeResolvedTo([null, null, 3, 4]);

        expect(() => {
            validateReturn(definitionTest, null);
        }).toThrowError(SyntaxExtenderValidateReturnNotValidReturnError);

        definitionTest = extractReturn(
            Test.prototype.test,
            parseAndConvertDefinitions({ test: { '?return?>[?]': 'number' } }),
            'test',
            'test',
            Test
        );

        await expectAsync(
            validateReturn(
                definitionTest,
                new Promise(resolve => {
                    resolve([1, 2, 3, 4]);
                })
            )
        ).toBeResolvedTo([1, 2, 3, 4]);

        await expectAsync(
            validateReturn(
                definitionTest,
                new Promise(resolve => {
                    resolve(null);
                })
            )
        ).toBeResolvedTo(null);

        await expectAsync(
            validateReturn(
                definitionTest,
                new Promise(resolve => {
                    resolve([null, null, 3, 4]);
                })
            )
        ).toBeResolvedTo([null, null, 3, 4]);

        expect(validateReturn(definitionTest, null)).toEqual(null);
    });

    it('works return undefined not nullable', async function () {
        const Test = function () {};
        Test.prototype.test = function (test) {};

        let definitionTest = extractReturn(
            Test.prototype.test,
            parseAndConvertDefinitions({ test: { '?return': 'void' } }),
            'test',
            'test',
            Test
        );

        expect(validateReturn(definitionTest, undefined)).toEqual(undefined);
        expect(validateReturn(definitionTest, null)).toEqual(null);

        definitionTest = extractReturn(
            Test.prototype.test,
            parseAndConvertDefinitions({ test: { return: 'void' } }),
            'test',
            'test',
            Test
        );

        expect(validateReturn(definitionTest, undefined)).toEqual(undefined);
        expect(() => {
            validateReturn(definitionTest, null);
        }).toThrowError(SyntaxExtenderValidateReturnNotValidReturnError);

        definitionTest = extractReturn(
            Test.prototype.test,
            parseAndConvertDefinitions({ test: { '?return->': 'void' } }),
            'test',
            'test',
            Test
        );

        expect(() => {
            validateReturn(definitionTest, undefined);
        }).toThrowError(SyntaxExtenderValidateReturnNotValidReturnError);

        expect(validateReturn(definitionTest, null)).toEqual(null);

        await expectAsync(validateReturn(definitionTest, Promise.resolve(undefined))).toBeResolvedTo(undefined);
        await expectAsync(validateReturn(definitionTest, Promise.resolve(null))).toBeRejectedWithError(
            SyntaxExtenderValidateReturnNotValidReturnError
        );

        definitionTest = extractReturn(
            Test.prototype.test,
            parseAndConvertDefinitions({ test: { '?return?>': 'void' } }),
            'test',
            'test',
            Test
        );

        expect(() => {
            validateReturn(definitionTest, undefined);
        }).toThrowError(SyntaxExtenderValidateReturnNotValidReturnError);

        expect(validateReturn(definitionTest, null)).toEqual(null);

        await expectAsync(validateReturn(definitionTest, Promise.resolve(undefined))).toBeResolvedTo(undefined);
        await expectAsync(validateReturn(definitionTest, Promise.resolve(null))).toBeResolvedTo(null);
    });
};
