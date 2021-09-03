'use strict';

const { UUID, IMPLEMENTS, DEFINE } = require('../../core/constants');

const { getMetadata } = require('../../core/metadata');

const toClass = require('../../core/to-class');
const toInterface = require('../../core/to-interface');
const toAbstract = require('../../core/to-abstract');

const SyntaxExtenderNativeConstructorError = require('../../errors/syntax-extender-native-constructor-error');
const SyntaxExtenderNotValidArgumentError = require('../../errors/syntax-extender-not-valid-argument-error');
const SyntaxExtenderMetadataMissingAbstractsError = require('../../errors/metadata/syntax-extender-metadata-missing-abstracts-error');
const SyntaxExtenderRunningError = require('../../errors/syntax-extender-running-error');
const SyntaxExtenderValidateCompatibilityNotCompatibleError = require('../../errors/validate-compatibility/syntax-extender-validate-compatibility-not-compatible-error');

module.exports = () => {
    it('works must be a class', function () {
        const ConstrFn = function () {};
        expect(() => {
            toClass(ConstrFn);
        }).toThrowError(SyntaxExtenderNotValidArgumentError);
    });

    it('works class can not use native constructor', function () {
        expect(() => {
            toClass(
                class Test {
                    constructor() {}
                }
            );
        }).toThrowError(SyntaxExtenderNativeConstructorError);
    });

    it('works class uuid definition', function () {
        const Test = toClass(class Test {});
        expect(Test[UUID]).toBe(getMetadata(Test).uuid);
    });

    it('works class can not have abstracts', function () {
        expect(() => {
            toClass(abs => {
                return class Test {
                    [abs('test')]() {}
                };
            });
        }).toThrowError(SyntaxExtenderNotValidArgumentError);
    });

    it('works class inheritance is safe on native constructor', function () {
        class TestInherit {
            constructor(safe) {
                if (!safe) {
                    throw new Error('inherited constructor error.');
                }
            }
        }
        const Test = toClass(class Test extends TestInherit {});

        expect(() => {
            new Test();
        }).toThrowError('inherited constructor error.');

        new Test(true);
    });

    it('works magic __implements', function () {
        const ExtendedInterface = toInterface(
            class ExtendedInterface {
                static test = 'test';
            }
        );
        const ExtendedInterface2 = toInterface(class ExtendedInterface2 {});
        const Test = toClass(
            class Test {
                static [IMPLEMENTS] = ExtendedInterface;
            }
        );

        let metadata = getMetadata(Test);

        expect(metadata.interfaces).toEqual([ExtendedInterface[UUID]]);

        const Test2 = toClass(
            class Test2 {
                static [IMPLEMENTS] = [ExtendedInterface, ExtendedInterface2];
            }
        );

        metadata = getMetadata(Test2);
        expect(metadata.interfaces).toEqual([ExtendedInterface2[UUID], ExtendedInterface[UUID]]);
    });

    it('works interfaces constants inheritance', function () {
        const ExtendedInterface = toInterface(
            class ExtendedInterface {
                static test = 'test';
            }
        );
        const Test = toClass(
            class Test {
                static [IMPLEMENTS] = ExtendedInterface;
            }
        );

        expect(Test.test).toEqual('test');
    });

    it('works instanceof interfaces', function () {
        const ExtendedInterface = toInterface(
            class ExtendedInterface {
                static test = 'test';
            }
        );
        const TestAbstract = toAbstract(
            class TestAbstract {
                static [IMPLEMENTS] = ExtendedInterface;
            }
        );

        const Test = toClass(class Test extends TestAbstract {});

        const t = new Test();

        expect(t).toBeInstanceOf(ExtendedInterface);
    });

    it('works abstract should implements all interfaces methods', function () {
        const ExtendedInterface = toInterface(
            class ExtendedInterface {
                static test() {}
                static test2() {}
                test() {}
                test2() {}
            }
        );

        expect(() => {
            const Test = toClass(
                class Test {
                    static [IMPLEMENTS] = ExtendedInterface;
                    static test2() {
                        return 'test2';
                    }
                    test2() {
                        return 'test2';
                    }
                }
            );
        }).toThrowError(SyntaxExtenderMetadataMissingAbstractsError);

        const Test = toClass(
            class Test {
                static [IMPLEMENTS] = ExtendedInterface;
                static test() {
                    return 'test';
                }
                static test2() {
                    return 'test2';
                }
                test() {
                    return 'test';
                }
                test2() {
                    return 'test2';
                }
            }
        );

        expect(Test.test()).toBe('test');
        expect(Test.test2()).toBe('test2');

        const t = new Test();

        expect(t.test()).toBe('test');
        expect(t.test2()).toBe('test2');
    });

    it('works should implements all abstracts methods', function () {
        const Abstract = toAbstract(abs => {
            return class Abstract {
                static [abs('test')]() {}
                static [abs('test2')]() {}
                [abs('test')]() {}
                [abs('test2')]() {}
            };
        });

        expect(() => {
            toClass(
                class Test extends Abstract {
                    static test2() {
                        return 'test2';
                    }
                    test2() {
                        return 'test2';
                    }
                }
            );
        }).toThrowError(SyntaxExtenderMetadataMissingAbstractsError);

        const Test = toClass(
            class Test extends Abstract {
                static test() {
                    return 'test';
                }
                static test2() {
                    return 'test2';
                }
                test() {
                    return 'test';
                }
                test2() {
                    return 'test2';
                }
            }
        );

        expect(Test.test()).toBe('test');
        expect(Test.test2()).toBe('test2');

        const t = new Test();

        expect(t.test()).toBe('test');
        expect(t.test2()).toBe('test2');
    });

    it('works should implements all mixed abstracts methods', function () {
        const ExtendedInterface = toInterface(
            class ExtendedInterface {
                static test() {}
                test() {}
            }
        );

        const Abstract = toAbstract(abs => {
            return class Abstract {
                static [abs('test2')]() {}
                [abs('test2')]() {}
            };
        });

        expect(() => {
            toClass(
                class Test extends Abstract {
                    static [IMPLEMENTS] = ExtendedInterface;
                    static test2() {
                        return 'test2';
                    }
                    test2() {
                        return 'test2';
                    }
                }
            );
        }).toThrowError(SyntaxExtenderMetadataMissingAbstractsError);

        const Test = toClass(
            class Test extends Abstract {
                static [IMPLEMENTS] = ExtendedInterface;
                static test() {
                    return 'test';
                }
                static test2() {
                    return 'test2';
                }
                test() {
                    return 'test';
                }
                test2() {
                    return 'test2';
                }
            }
        );

        expect(Test.test()).toBe('test');
        expect(Test.test2()).toBe('test2');

        const t = new Test();

        expect(t.test()).toBe('test');
        expect(t.test2()).toBe('test2');
    });

    it('works mixed classes and interfaces inheritance', function () {
        const TestInterface = toInterface(
            class TestInterface {
                static TEST = 'test';
                test(a, b = null) {}
            }
        );

        const TestInterface2 = toInterface(
            class TestInterface2 {
                static TEST2 = 'test2';
                test(a, b) {}
            }
        );

        class Test extends TestInterface {}

        const Abstract = toAbstract(abs => {
            return class Abs extends Test {
                get [abs('test2')]() {}
            };
        });
        class Test2 extends Abstract {}

        class Another {}

        const Test3 = toClass(
            class Test3 extends Test2 {
                static [IMPLEMENTS] = [TestInterface2];
                test(a, b = null) {
                    return [a, b];
                }
                get test2() {
                    return 'test2';
                }
            }
        );

        expect(Test3.TEST).toBe('test');
        expect(Test3.TEST2).toBe('test2');

        const t = new Test3();

        expect(t.test(1)).toEqual([1, null]);
        expect(t.test2).toBe('test2');

        expect(t).toBeInstanceOf(Test3);
        expect(t).toBeInstanceOf(Test2);
        expect(t).toBeInstanceOf(Abstract);
        expect(t).toBeInstanceOf(Test);
        expect(t).toBeInstanceOf(TestInterface);
        expect(t).toBeInstanceOf(TestInterface2);
        expect(t).not.toBeInstanceOf(Another);
    });

    it('works magic __define', function () {
        class Custom {}
        class Other {}

        let Test1 = toClass(
            class Test1 {
                static [DEFINE] = {
                    test: { return: 'array' },
                    'static:test': { return: Custom }
                };
                test() {
                    return 'string';
                }
                static test() {
                    return new Other();
                }
            }
        );

        let metadata = getMetadata(Test1);
        expect(metadata.get('method', 'test').return.type).toBe('array');
        expect(metadata.get('method', 'static:test').return.type).toBe('Custom');
        expect(metadata.get('method', 'static:test').return.source).toEqual(Custom);

        expect(() => {
            Test1.test();
        }).toThrowError(SyntaxExtenderRunningError);

        let t = new Test1();

        expect(() => {
            t.test();
        }).toThrowError(SyntaxExtenderRunningError);

        let Test = toClass(
            class Test {
                prop = '';
                static [DEFINE] = {
                    test: { 1: Custom, 2: 'array', return: 'array' },
                    property: { 1: 'string', return: 'array' }
                };
                set property(value) {
                    this.prop = value;
                }
                get property() {
                    return [this.prop];
                }
                test(first, second) {
                    return [first, second];
                }
            }
        );

        metadata = getMetadata(Test);

        expect(metadata.get('getter', 'property').return.type).toBe('array');
        expect(metadata.get('getter', 'property').parameters.size()).toBe(0);
        expect(metadata.get('setter', 'property').return.type).toBe(null);
        expect(metadata.get('setter', 'property').parameters.get(0).type).toBe('string');
        expect(metadata.get('setter', 'property').parameters.get(0).isBuiltin).toBeTruthy();
        expect(metadata.get('method', 'test').parameters.get(0).type).toBe('Custom');
        expect(metadata.get('method', 'test').parameters.get(0).source).toEqual(Custom);
        expect(metadata.get('method', 'test').parameters.get(0).isBuiltin).toBeFalsy();
        expect(metadata.get('method', 'test').parameters.get(1).type).toBe('array');
        expect(metadata.get('method', 'test').parameters.get(1).isBuiltin).toBeTruthy();
        expect(metadata.get('method', 'test').return.type).toBe('array');

        t = new Test();
        expect(() => {
            t.test();
        }).toThrowError(SyntaxExtenderRunningError);
        expect(() => {
            t.test('a');
        }).toThrowError(SyntaxExtenderRunningError);
        expect(() => {
            t.test([], 1);
        }).toThrowError(SyntaxExtenderRunningError);
        expect(() => {
            t.property = [1, 2];
        }).toThrowError(SyntaxExtenderRunningError);

        expect(t.test(new Custom(), [1, 2])).toEqual([new Custom(), [1, 2]]);
        t.property = 'test';
        expect(t.prop).toBe('test');
        expect(t.property).toEqual(['test']);

        const FnConstr = function () {};

        Test = toClass(
            class Test {
                static [DEFINE] = {
                    'static:test': { 1: FnConstr, 2: 'array', return: 'array' },
                    'static:property': { 1: 'string', return: 'array' }
                };
                static prop = '';
                static set property(value) {
                    this.prop = value;
                }
                static get property() {
                    return [this.prop];
                }

                static test(first, second) {
                    return [first, second];
                }
            }
        );

        metadata = getMetadata(Test);

        expect(metadata.get('getter', 'static:property').return.type).toBe('array');
        expect(metadata.get('getter', 'static:property').parameters.size()).toBe(0);
        expect(metadata.get('setter', 'static:property').return.type).toBe(null);
        expect(metadata.get('setter', 'static:property').parameters.get(0).type).toBe('string');
        expect(metadata.get('setter', 'static:property').parameters.get(0).isBuiltin).toBeTruthy();
        expect(metadata.get('method', 'static:test').parameters.get(0).type).toBe('FnConstr');
        expect(metadata.get('method', 'static:test').parameters.get(0).source).toEqual(FnConstr);
        expect(metadata.get('method', 'static:test').parameters.get(0).isBuiltin).toBeFalsy();
        expect(metadata.get('method', 'static:test').parameters.get(1).type).toBe('array');
        expect(metadata.get('method', 'static:test').parameters.get(1).isBuiltin).toBeTruthy();
        expect(metadata.get('method', 'static:test').return.type).toBe('array');

        expect(() => {
            Test.test();
        }).toThrowError(SyntaxExtenderRunningError);
        expect(() => {
            Test.test('a');
        }).toThrowError(SyntaxExtenderRunningError);
        expect(() => {
            Test.test([], 1);
        }).toThrowError(SyntaxExtenderRunningError);
        expect(() => {
            Test.property = [1, 2];
        }).toThrowError(SyntaxExtenderRunningError);

        expect(Test.test(new FnConstr(), [1, 2])).toEqual([new FnConstr(), [1, 2]]);
        Test.property = 'test';
        expect(Test.prop).toBe('test');
        expect(Test.property).toEqual(['test']);
    });

    it('works parameter validations on inherit', async function () {
        class Base {}
        class Custom extends Base {}

        const TestAbstract = toAbstract(abs => {
            return class TestAbstract {
                static [DEFINE] = {
                    test: { 1: Custom, 2: 'array' },
                    test3: { '1->': 'string' }
                };

                [abs('test')](first, second) {}
                async [abs('test3')](first) {}
            };
        });

        const TestInterface = toInterface(
            class TestInterface {
                static [DEFINE] = {
                    test2: { 1: Custom, 2: 'string' }
                };

                test2(first, second) {}
            }
        );

        const Test = toClass(
            class Test extends TestAbstract {
                static [DEFINE] = {
                    test2: { 1: Base, 2: 'string' },
                    test3: { 1: 'string' }
                };
                static [IMPLEMENTS] = TestInterface;

                test(first, second) {
                    return [first, second];
                }

                test2(first, second) {
                    return [first, second];
                }

                async test3(first) {
                    return first;
                }
            }
        );

        const t = new Test();

        // this works because methods on class does not have definitions
        // php works exactly like this
        expect(t.test(1, 2)).toEqual([1, 2]);
        // this works because of Custom inheritance
        t.test2(new Base(), 'test');
        t.test2(new Custom(), 'test');
        await expectAsync(t.test3('string')).toBeResolvedTo('string');
    });

    it('works async fn inheritance', function () {
        const TestInterface = toInterface(
            class TestInterface {
                async fn() {}
            }
        );

        expect(() => {
            toClass(
                class {
                    static [IMPLEMENTS] = [TestInterface];
                    fn() {}
                }
            );
        }).toThrowError(SyntaxExtenderValidateCompatibilityNotCompatibleError);

        toClass(
            class {
                static [IMPLEMENTS] = [TestInterface];
                async fn() {}
            }
        );

        toClass(
            class {
                static [IMPLEMENTS] = [TestInterface];
                static [DEFINE] = { fn: { return: 'promise' } };
                fn() {}
            }
        );

        toClass(
            class {
                static [IMPLEMENTS] = [TestInterface];
                static [DEFINE] = { fn: { 'return->': 'string' } };
                fn() {}
            }
        );
    });

    it('works promise parameter', async function () {
        class Custom {}
        const Test = toClass(
            class Test {
                static __define = { test: { '1->': Custom } };
                async test(test) {
                    return await test;
                }
            }
        );

        const t = new Test();
        await expectAsync(t.test(Promise.resolve(new Custom()))).toBeResolvedTo(new Custom());

        const Test3 = toClass(
            class Test3 {
                static __define = { test: { '1?>': Custom } };
                async test(test) {
                    return test;
                }
            }
        );

        const t3 = new Test3();
        await expectAsync(t3.test(Promise.resolve(new Custom()))).toBeResolvedTo(new Custom());
        await expectAsync(t3.test(Promise.resolve(null))).toBeResolvedTo(null);
        await expect(() => {
            t3.test(null);
        }).toThrowError(SyntaxExtenderRunningError);

        const Test4 = toClass(
            class Test4 {
                static __define = { test: { '?1?>': Custom } };
                async test(test) {
                    return test;
                }
            }
        );

        const t4 = new Test4();
        await expectAsync(t4.test(null)).toBeResolvedTo(null);
        await expectAsync(t4.test(Promise.resolve(new Custom()))).toBeResolvedTo(new Custom());
        await expectAsync(t4.test(Promise.resolve(null))).toBeResolvedTo(null);

        const Test6 = toClass(
            class Test6 {
                static __define = { test: { '1?>': Custom } };
                test(test) {
                    return test;
                }
            }
        );

        const t6 = new Test6();
        await expectAsync(t6.test(Promise.reject(new Error('internal error')))).toBeRejectedWithError('internal error');
    });

    it('works promise return', async function () {
        class Custom {}
        const Test = toClass(
            class Test {
                static __define = { test: { 'return->': Custom } };
                async test() {
                    return new Custom();
                }
            }
        );

        const t = new Test();
        await expectAsync(t.test()).toBeResolvedTo(new Custom());

        const Test2 = toClass(
            class Test2 {
                static __define = { test: { 'return->': Custom } };
                async test() {
                    return [];
                }
            }
        );

        const t2 = new Test2();
        await expectAsync(t2.test()).toBeRejectedWithError(SyntaxExtenderRunningError);

        const Test3 = toClass(
            class Test3 {
                static __define = { test: { 'return?>': Custom } };
                async test() {
                    return null;
                }
            }
        );

        const t3 = new Test3();
        await expectAsync(t3.test()).toBeResolvedTo(null);

        const Test4 = toClass(
            class Test4 {
                static __define = { test: { '?return?>': Custom } };
                test() {
                    return null;
                }
            }
        );

        const t4 = new Test4();
        expect(t4.test()).toEqual(null);

        const Test5 = toClass(
            class Test5 {
                static __define = { test: { 'return?>': Custom } };
                test() {
                    return null;
                }
            }
        );

        const t5 = new Test5();
        expect(() => {
            t5.test();
        }).toThrowError(SyntaxExtenderRunningError);

        const Test6 = toClass(
            class Test6 {
                static __define = { test: { 'return?>': Custom } };
                test() {
                    return Promise.reject(new Error('internal error'));
                }
            }
        );

        const t6 = new Test6();
        await expectAsync(t6.test()).toBeRejectedWithError('internal error');

        const Test7 = toClass(
            class Test7 {
                static __define = { test: { 'return?>': Custom } };
                test() {
                    return Promise.resolve(new Custom());
                }
            }
        );

        const t7 = new Test7();
        await expectAsync(t7.test()).toBeResolvedTo(new Custom());

        const Test8 = toClass(
            class Test8 {
                static __define = { test: { 'return?>': Custom } };
                test() {
                    return Promise.resolve(null);
                }
            }
        );

        const t8 = new Test8();
        await expectAsync(t8.test()).toBeResolvedTo(null);
    });
};
