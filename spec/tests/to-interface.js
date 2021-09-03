'use strict';

const { UUID, EXTENDS, DEFINE, IMPLEMENTS } = require('../../core/constants');

const { getMetadata } = require('../../core/metadata');

const toInterface = require('../../core/to-interface');
const toClass = require('../../core/to-class');

const SyntaxExtenderNativeConstructorError = require('../../errors/syntax-extender-native-constructor-error');
const SyntaxExtenderNativeExtendsError = require('../../errors/syntax-extender-native-extends-error');
const SyntaxExtenderRunningError = require('../../errors/syntax-extender-running-error');

module.exports = () => {
    it('works interface can not use native extends', function () {
        expect(() => {
            toInterface(class TestInterface extends Array {});
        }).toThrowError(SyntaxExtenderNativeExtendsError);
    });

    it('works interface can not use native constructor', function () {
        expect(() => {
            toInterface(
                class TestInterface {
                    constructor() {}
                }
            );
        }).toThrowError(SyntaxExtenderNativeConstructorError);
    });

    it('works interface uuid definition', function () {
        const TestInterface = toInterface(class TestInterface {});
        expect(TestInterface[UUID]).toBe(getMetadata(TestInterface).uuid);
    });

    it('works interface can not be istantiate', function () {
        const TestInterface = toInterface(class TestInterface {});
        expect(() => {
            new TestInterface();
        }).toThrowError(SyntaxExtenderRunningError);
    });

    it('works interface methods and accessors can not be called', function () {
        const TestInterface = toInterface(
            class TestInterface {
                static testFn() {}
                static get test() {}
                static set test(value) {}
            }
        );

        expect(() => {
            TestInterface.testFn();
        }).toThrowError(SyntaxExtenderRunningError);

        expect(() => {
            TestInterface.test;
        }).toThrowError(SyntaxExtenderRunningError);

        expect(() => {
            TestInterface.test = '';
        }).toThrowError(SyntaxExtenderRunningError);
    });

    it('works interface magic __extends', function () {
        const ExtendedInterface = toInterface(class ExtendedInterface {});
        const ExtendedInterface2 = toInterface(class ExtendedInterface2 {});
        const TestInterface = toInterface(
            class TestInterface {
                static [EXTENDS] = ExtendedInterface;
            }
        );

        let metadata = getMetadata(TestInterface);

        expect(metadata.interfaces).toEqual([ExtendedInterface[UUID]]);

        const TestInterface2 = toInterface(
            class TestInterface2 {
                static [EXTENDS] = [ExtendedInterface, ExtendedInterface2];
            }
        );

        metadata = getMetadata(TestInterface2);
        expect(metadata.interfaces).toEqual([ExtendedInterface2[UUID], ExtendedInterface[UUID]]);
    });

    it('works interface magic __define', function () {
        class Test {}

        let TestInterface = toInterface(
            class TestInterface {
                static [DEFINE] = {
                    test: { 1: Test, 2: 'array' }
                };

                test(first, second) {}
            }
        );

        let metadata = getMetadata(TestInterface);

        expect(metadata.get('method', 'test').parameters.get(0).type).toBe('Test');
        expect(metadata.get('method', 'test').parameters.get(0).source).toEqual(Test);
        expect(metadata.get('method', 'test').parameters.get(0).isBuiltin).toBeFalsy();
        expect(metadata.get('method', 'test').parameters.get(1).type).toBe('array');
        expect(metadata.get('method', 'test').parameters.get(1).isBuiltin).toBeTruthy();

        const FnConstr = function () {};

        TestInterface = toInterface(
            class TestInterface {
                static [DEFINE] = {
                    'static:test': { 1: FnConstr, 2: 'array' }
                };

                static test(first, second) {}
            }
        );

        metadata = getMetadata(TestInterface);

        expect(metadata.get('method', 'static:test').parameters.get(0).type).toBe('FnConstr');
        expect(metadata.get('method', 'static:test').parameters.get(0).source).toEqual(FnConstr);
        expect(metadata.get('method', 'static:test').parameters.get(0).isBuiltin).toBeFalsy();
        expect(metadata.get('method', 'static:test').parameters.get(1).type).toBe('array');
        expect(metadata.get('method', 'static:test').parameters.get(1).isBuiltin).toBeTruthy();
    });

    it('works normal class extends interface', function () {
        const TestInterface = toInterface(
            class TestInterface {
                static CONST = 'constant';
                static testFn() {}
                static get test() {}
                static set test(value) {}
                testFn() {}
                get test() {}
                set test(value) {}
            }
        );
        class Test extends TestInterface {
            static CONST = 'constant2';
        }

        expect(() => {
            Test.testFn();
        }).toThrowError(SyntaxExtenderRunningError);

        expect(() => {
            Test.test;
        }).toThrowError(SyntaxExtenderRunningError);

        expect(() => {
            Test.test = '';
        }).toThrowError(SyntaxExtenderRunningError);

        const t = new Test();
        expect(() => {
            t.testFn();
        }).toThrowError(SyntaxExtenderRunningError);

        expect(() => {
            t.test;
        }).toThrowError(SyntaxExtenderRunningError);

        expect(() => {
            t.test = '';
        }).toThrowError(SyntaxExtenderRunningError);

        // can't prevent override
        expect(Test.CONST).toBe('constant2');
        expect(t).toBeInstanceOf(TestInterface);
        expect(t).toBeInstanceOf(Test);
    });

    it('works instance of interface', function () {
        const BaseInterface = toInterface(class TestInterface {});
        const TestInterface = toInterface(
            class TestInterface {
                static [EXTENDS] = [BaseInterface];
            }
        );

        const Test = toClass(
            class Test {
                static [IMPLEMENTS] = TestInterface;
            }
        );

        const t = new Test();

        expect(t).toBeInstanceOf(TestInterface);
        expect(t).toBeInstanceOf(BaseInterface);

        const TestInherit = toClass(class TestInherit extends Test {});

        const i = new TestInherit();

        expect(i).toBeInstanceOf(TestInterface);
        expect(i).toBeInstanceOf(BaseInterface);

        class NoImplements {}

        const n = new NoImplements();

        expect(n).not.toBeInstanceOf(TestInterface);
        expect(n).not.toBeInstanceOf(BaseInterface);
    });
};
