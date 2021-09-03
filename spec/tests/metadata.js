'use strict';

const { CLASS, ABSTRACT, INTERFACE, METHOD, UUID, PUBLIC, PROTECTED } = require('../../core/constants');

const { setSedefEnv } = require('../../core/utils');

const { generateMetadata, getMetadata } = require('../../core/metadata');

const SyntaxExtenderNotValidArgumentError = require('../../errors/syntax-extender-not-valid-argument-error');
const SyntaxExtenderValidateCompatibilityNotCompatibleError = require('../../errors/validate-compatibility/syntax-extender-validate-compatibility-not-compatible-error');
const SyntaxExtenderExtractParametersError = require('../../errors/extract-parameters/syntax-extender-extract-parameters-error');
const SyntaxExtenderMetadataNotValidTypeError = require('../../errors/metadata/syntax-extender-metadata-not-valid-type-error');
const SyntaxExtenderMetadataWrongInterfaceError = require('../../errors/metadata/syntax-extender-metadata-wrong-interface-error');
const SyntaxExtenderMetadataInterfaceMustBeAClassError = require('../../errors/metadata/syntax-extender-metadata-interface-must-be-a-class-error');
const SyntaxExtenderMetadataInterfacePropertyError = require('../../errors/metadata/syntax-extender-metadata-interface-property-error');
const SyntaxExtenderMetadataOverrideConstantsError = require('../../errors/metadata/syntax-extender-metadata-override-constants-error');
const SyntaxExtenderMetadataMissingAbstractsError = require('../../errors/metadata/syntax-extender-metadata-missing-abstracts-error');
const SyntaxExtenderMetadataAlreadyExtendedInterfaceError = require('../../errors/metadata/syntax-extender-metadata-already-extended-interface-error');
const SyntaxExtenderMetadataAlreadyImplementedInterfaceError = require('../../errors/metadata/syntax-extender-metadata-already-implemented-interface-error');
const SyntaxExtenderMetadataPrivatesOnInterfaceError = require('../../errors/metadata/syntax-extender-metadata-privates-on-interface-error');
const SyntaxExtenderExtractParameterDefaultValueTypeMismatchError = require('../../errors/extract-parameters/syntax-extender-extract-parameter-default-value-type-mismatch-error');

module.exports = () => {
    it('works arguments validation', function () {
        expect(() => {
            generateMetadata({});
        }).toThrowError(SyntaxExtenderNotValidArgumentError);
        expect(() => {
            generateMetadata(function () {}, {});
        }).toThrowError(SyntaxExtenderNotValidArgumentError);
        expect(() => {
            generateMetadata(function () {}, '', {});
        }).toThrowError(SyntaxExtenderNotValidArgumentError);
        expect(() => {
            generateMetadata(function () {}, '', [], []);
        }).toThrowError(SyntaxExtenderNotValidArgumentError);
        expect(() => {
            generateMetadata(function () {}, '', [], {}, []);
        }).toThrowError(SyntaxExtenderNotValidArgumentError);
        generateMetadata(class Test {}, CLASS, [], {}, {});
        generateMetadata(class Test {}, CLASS, [], {}, {}, __filename);
        expect(() => {
            generateMetadata(class Test {}, CLASS, [], {}, {}, {});
        }).toThrowError(SyntaxExtenderNotValidArgumentError);
    });

    it('works interface source must be a class', function () {
        function TestWrongInterface() {}

        expect(() => {
            generateMetadata(TestWrongInterface, INTERFACE);
        }).toThrowError(SyntaxExtenderMetadataInterfaceMustBeAClassError);
    });

    it('works metadata already defined', function () {
        class Test {}
        generateMetadata(Test, CLASS);
        generateMetadata(Test, CLASS);
    });

    it('works metadata interfaces validation', function () {
        expect(() => {
            generateMetadata(class Test {}, CLASS, [class NotAnInterface {}]);
        }).toThrowError(SyntaxExtenderMetadataWrongInterfaceError);

        class InterfaceTest {}
        generateMetadata(InterfaceTest, INTERFACE);
        expect(getMetadata(InterfaceTest).type).toBe(INTERFACE);
    });

    it('works metadata generation validate type', function () {
        expect(() => {
            generateMetadata(class Test {}, 'wrong-type');
        }).toThrowError(SyntaxExtenderMetadataNotValidTypeError);

        class Test {}
        generateMetadata(Test, CLASS);
        expect(getMetadata(Test).type).toBe(CLASS);
        class AbstractTest {}
        generateMetadata(AbstractTest, ABSTRACT);
        expect(getMetadata(AbstractTest).type).toBe(ABSTRACT);
        class InterfaceTest {}
        generateMetadata(InterfaceTest, INTERFACE);
        expect(getMetadata(InterfaceTest).type).toBe(INTERFACE);
    });

    it('works metadata inheritance', function () {
        class Test {
            test() {}
        }

        class Test2 extends Test {
            test1() {}
            test2(test2) {}
        }

        class Test3 extends Test2 {
            test2(test4, test5 = null) {}
            static test3(...args) {}
        }

        generateMetadata(Test3, CLASS);

        const metadata = getMetadata(Test3);
        expect(metadata.get(METHOD, 'static:test3').sourceName).toBe('Test3');
        expect(metadata.get(METHOD, 'test2').sourceName).toBe('Test3');
        expect(metadata.get(METHOD, 'test1').sourceName).toBe('Test2');
        expect(metadata.get(METHOD, 'test').sourceName).toBe('Test');
    });

    it('works metadata safe extraction', function () {
        class TestNotSafeClass {
            static [Symbol.for('CONSTRUCTOR')] = false;
            constructor() {
                throw new Error('this is not safe');
            }
        }

        generateMetadata(TestNotSafeClass, CLASS);

        expect(getMetadata(TestNotSafeClass).isSafeClass).toBe(false);

        class TestIsSafeClass {
            prop = 'test';
            __construct() {
                throw new Error('this is safe');
            }
        }

        generateMetadata(TestIsSafeClass, CLASS);

        expect(getMetadata(TestIsSafeClass).isSafeClass).toBe(true);
        expect(Object.keys(getMetadata(TestIsSafeClass).properties)).toEqual(['prop']);
    });

    it('works metadata safe inheritance', function () {
        class TestNotSafeClass {
            constructor() {
                throw new Error('this is not safe');
            }
        }

        class TestIsSafe extends TestNotSafeClass {
            prop = 'test';
        }

        generateMetadata(TestIsSafe, CLASS);
        expect(getMetadata(TestIsSafe).isSafeClass).toEqual(false);
        expect(getMetadata(TestIsSafe).properties).toEqual({});

        class TestThisIsSafe {
            prop1 = 'test';
        }

        class AlsoThisIsSafe extends TestThisIsSafe {
            prop2 = 'test';
        }

        generateMetadata(AlsoThisIsSafe, CLASS);
        expect(getMetadata(AlsoThisIsSafe).isSafeClass).toEqual(true);
        expect(Object.keys(getMetadata(AlsoThisIsSafe).properties)).toEqual(['prop1', 'prop2']);

        function ConstrFnSafe() {
            return 'this should be safe but no one can know it.';
        }

        class AlsoThisShouldBeSafe extends ConstrFnSafe {
            prop1 = 'test';
        }

        generateMetadata(AlsoThisShouldBeSafe, CLASS);
        expect(getMetadata(AlsoThisShouldBeSafe).isSafeClass).toEqual(false);
    });

    it('works metadata inheritance not modify inherited metadata', function () {
        class Test3 {
            test(test, test2) {}
        }

        class Test4 extends Test3 {
            test(test, test2, test3 = null) {}
        }

        generateMetadata(Test4, CLASS);
        let metadata = getMetadata(Test4);
        expect(metadata.get(METHOD, 'test').sourceName).toBe('Test4');
        expect(metadata.get(METHOD, 'test').parameters.size()).toBe(3);

        metadata = getMetadata(Test3);
        expect(metadata.get(METHOD, 'test').sourceName).toBe('Test3');
        expect(metadata.get(METHOD, 'test').parameters.size()).toBe(2);
    });

    it('works metadata inheritance compatibility', function () {
        class Test {
            test(test) {}
        }

        class Test2 extends Test {
            test(test, test2) {}
        }

        expect(() => {
            generateMetadata(Test2, CLASS);
        }).toThrowError(SyntaxExtenderValidateCompatibilityNotCompatibleError);
    });

    it('works metadata interfaces cannot have properties', function () {
        class InterfaceTest {
            prop = 'should throw an error';
        }
        expect(() => {
            generateMetadata(InterfaceTest, INTERFACE);
        }).toThrowError(SyntaxExtenderMetadataInterfacePropertyError);
    });

    it('works metadata interfaces cannot have native privates', function () {
        class InterfaceTest {
            #prop = 'should throw an error';
            get prop() {
                return this.#prop;
            }
        }

        expect(() => {
            generateMetadata(InterfaceTest, INTERFACE);
        }).toThrowError(SyntaxExtenderMetadataPrivatesOnInterfaceError);

        class InterfaceTest2 {
            #method() {}
            method() {
                return this.#method();
            }
        }
        expect(() => {
            generateMetadata(InterfaceTest2, INTERFACE);
        }).toThrowError(SyntaxExtenderMetadataPrivatesOnInterfaceError);
    });

    it('works metadata interfaces static properties are constants', function () {
        class InterfaceTestStatic {
            static prop = 'yep it works';
        }

        generateMetadata(InterfaceTestStatic, INTERFACE);

        expect(Object.keys(getMetadata(InterfaceTestStatic).constants)).toEqual(['prop']);
        expect(getMetadata(InterfaceTestStatic).properties).toEqual({});
    });

    it('works metadata interfaces should be assigned', function () {
        class InterfaceTest {}
        generateMetadata(InterfaceTest, INTERFACE);

        class Test {}

        generateMetadata(Test, CLASS, [InterfaceTest]);
        expect(getMetadata(Test).interfaces.indexOf(InterfaceTest[UUID]) > -1).toBeTruthy();
    });

    it('works metadata interfaces constants can not be overriden ', function () {
        class InterfaceTest {
            static prop = 'test';
        }

        generateMetadata(InterfaceTest, INTERFACE);

        class InterfaceTest2 {
            static prop = 'test';
        }

        expect(() => {
            generateMetadata(InterfaceTest2, INTERFACE, [InterfaceTest]);
        }).toThrowError(SyntaxExtenderMetadataOverrideConstantsError);

        class Test {
            static prop = 'test';
        }
        expect(() => {
            generateMetadata(Test, CLASS, [InterfaceTest]);
        }).toThrowError(SyntaxExtenderMetadataOverrideConstantsError);

        class Inherit {
            static prop = 'test';
        }

        class Extended extends Inherit {}

        expect(() => {
            generateMetadata(Extended, CLASS, [InterfaceTest]);
        }).toThrowError(SyntaxExtenderMetadataOverrideConstantsError);

        class Implement {}

        generateMetadata(Implement, CLASS, [InterfaceTest]);

        class ExtendImplement extends Implement {
            static prop = 'test';
        }

        expect(() => {
            generateMetadata(ExtendImplement, CLASS);
        }).toThrowError(SyntaxExtenderMetadataOverrideConstantsError);

        class ExtendAndImplementSame extends Implement {}

        class AnotherInterface {
            static prop2 = 'test';
        }

        generateMetadata(AnotherInterface, INTERFACE);

        generateMetadata(ExtendAndImplementSame, CLASS, [InterfaceTest, AnotherInterface]);

        expect(getMetadata(ExtendAndImplementSame).interfaces.length).toEqual(2);
    });

    it('works metadata interface missing abstracts', function () {
        class InterfaceTest {
            test() {}
        }

        generateMetadata(InterfaceTest, INTERFACE);

        class Test2 {}

        expect(() => {
            generateMetadata(Test2, CLASS, [InterfaceTest]);
        }).toThrowError(SyntaxExtenderMetadataMissingAbstractsError);
    });

    it('works metadata missing interface abstracts', function () {
        class InterfaceTest {
            testFn() {}
            set test(value) {}
            get test() {}
        }

        generateMetadata(InterfaceTest, INTERFACE);

        class Test2 {
            set test(value) {}
            get test() {}
        }

        expect(() => {
            generateMetadata(Test2, CLASS, [InterfaceTest]);
        }).toThrowError(SyntaxExtenderMetadataMissingAbstractsError);

        class Test3 {
            testFn() {}
            get test() {}
        }

        expect(() => {
            generateMetadata(Test3, CLASS, [InterfaceTest]);
        }).toThrowError(SyntaxExtenderMetadataMissingAbstractsError);

        class Test4 {
            testFn() {}
            set test(value) {}
        }

        expect(() => {
            generateMetadata(Test4, CLASS, [InterfaceTest]);
        }).toThrowError(SyntaxExtenderMetadataMissingAbstractsError);

        class Test5 {
            testFn() {}
            set test(value) {}
            get test() {}
        }

        generateMetadata(Test5, CLASS, [InterfaceTest]);
    });

    it('works metadata abstracts can have abstracts', function () {
        class Test {
            abstractTest() {}
        }

        generateMetadata(Test, ABSTRACT, [], { abstractTest: 'test' });

        expect(getMetadata(Test).get('method', 'test').isAbstract).toBeTruthy();
    });

    it('works metadata missing abstract abstracts', function () {
        class Test {
            abstractTest() {}
        }

        generateMetadata(Test, ABSTRACT, [], { abstractTest: 'test' });

        class Test2 extends Test {
            test2() {}
        }

        expect(() => {
            generateMetadata(Test2, CLASS);
        }).toThrowError(SyntaxExtenderMetadataMissingAbstractsError);

        class Test3 extends Test {
            test() {}
        }

        generateMetadata(Test3, CLASS);

        expect(getMetadata(Test3).get('method', 'test').isAbstract).toBeFalsy();
    });

    it('works class must implement abstract and interface abstracts', function () {
        class Test {
            abstractTest() {}
        }

        generateMetadata(Test, ABSTRACT, [], { abstractTest: 'test' });

        class InterfaceTest {
            set test(value) {}
            get test() {}
        }

        generateMetadata(InterfaceTest, INTERFACE);

        class Test2 extends Test {
            test() {}
            set test(value) {}
            get test() {}
        }

        // this error can not be solved props and methods have same scope in javascript
        expect(() => {
            generateMetadata(Test2, CLASS, [InterfaceTest]);
        }).toThrowError(SyntaxExtenderMetadataMissingAbstractsError);

        class Test3 {
            abstractTest() {}
        }

        generateMetadata(Test3, ABSTRACT, [], { abstractTest: 'test2' });

        class Test4 extends Test3 {
            test2() {}
            set test(value) {}
            get test() {}
        }

        generateMetadata(Test4, CLASS, [InterfaceTest]);

        expect(getMetadata(Test4).get('method', 'test2').isAbstract).toBeFalsy();
        expect(getMetadata(Test4).get('getter', 'test').isAbstract).toBeFalsy();
        expect(getMetadata(Test4).get('setter', 'test').isAbstract).toBeFalsy();
    });

    it('works parameters definitions', function () {
        class Custom {}
        class Test {
            test(param, param2) {}
        }

        generateMetadata(Test, CLASS, [], {}, { test: { 1: 'string', 2: Custom } });

        const metadataParameters = getMetadata(Test).get('method', 'test').parameters;

        expect(metadataParameters.get(0).type).toBe('string');
        expect(metadataParameters.get(1).type).toBe('Custom');
        expect(metadataParameters.get(1).source).toBe(Custom);

        class Test2 {
            test(param, param2) {}
        }
        expect(() => {
            generateMetadata(Test2, CLASS, [], {}, { test: { 1: 'string', 2: Custom, 3: 'integer' } });
        }).toThrowError(SyntaxExtenderExtractParametersError);
    });

    it('works parameters definitions validations', function () {
        class Base {}

        class Custom extends Base {}

        class Bigger extends Custom {}

        class Other {}
        class Test {
            test(param, param2) {}
        }

        generateMetadata(Test, CLASS, [], {}, { test: { 1: 'string', 2: Custom } });

        class Test2 extends Test {
            test(a, b) {}
        }

        generateMetadata(Test2, CLASS, [], {}, { test: { 1: 'string', 2: Base } });

        let metadataParameters = getMetadata(Test2).get('method', 'test').parameters;

        expect(metadataParameters.get(0).type).toBe('string');
        expect(metadataParameters.get(1).type).toBe('Base');
        expect(metadataParameters.get(1).source).toBe(Base);

        class Test3 extends Test {
            test(a, b) {}
        }

        expect(() => {
            generateMetadata(Test3, CLASS, [], {}, { test: { 1: 'string', 2: Bigger } });
        }).toThrowError(SyntaxExtenderValidateCompatibilityNotCompatibleError);

        class Test4 extends Test {
            test(a, b) {}
        }

        expect(() => {
            generateMetadata(Test4, CLASS, [], {}, { test: { 1: 'string', 2: Other } });
        }).toThrowError(SyntaxExtenderValidateCompatibilityNotCompatibleError);

        class Parent {
            test(a) {}
        }

        generateMetadata(Parent, CLASS, [], {}, { test: { 1: 'self' } });

        class Extend extends Parent {
            test(a) {}
        }

        generateMetadata(Extend, CLASS, [], {}, { test: { 1: 'parent' } });

        class Extend2 extends Parent {
            test(a) {}
        }
        expect(() => {
            generateMetadata(Extend2, CLASS, [], {}, { test: { 1: 'self' } });
        }).toThrowError(SyntaxExtenderValidateCompatibilityNotCompatibleError);
    });

    it('works parameters definitions validations ignore __construct', function () {
        class Test {}
        class Test2 {}

        class A {
            __construct(a) {}
        }

        generateMetadata(A, CLASS, [], {}, { __construct: { 1: Test } });

        class B extends A {
            __construct(a, b, c) {}
        }

        generateMetadata(B, CLASS, [], {}, { __construct: { 1: Test2, 2: 'string' } });
    });

    it('works interfaces no duplicate entry', function () {
        class InterfaceTest {}

        generateMetadata(InterfaceTest, INTERFACE);

        class InterfaceExtend {}
        expect(() => {
            generateMetadata(InterfaceExtend, INTERFACE, [InterfaceTest, InterfaceTest]);
        }).toThrowError(SyntaxExtenderMetadataAlreadyExtendedInterfaceError);

        class TestImplement {}

        expect(() => {
            generateMetadata(TestImplement, CLASS, [InterfaceTest, InterfaceTest]);
        }).toThrowError(SyntaxExtenderMetadataAlreadyImplementedInterfaceError);
    });

    it('works interfaces loading order', function () {
        class Base {}

        class Custom extends Base {}

        class Extended extends Custom {}
        class Test {
            test(a) {}
        }
        generateMetadata(Test, INTERFACE, [], {}, { test: { 1: Extended } });

        class Test2 {
            test(a) {}
        }
        generateMetadata(Test2, INTERFACE, [], {}, { test: { 1: Custom } });

        class Test3 {}

        generateMetadata(Test3, INTERFACE, [Test2, Test]);

        class Test4 {}

        expect(() => {
            generateMetadata(Test4, INTERFACE, [Test, Test2]);
        }).toThrowError(SyntaxExtenderValidateCompatibilityNotCompatibleError);

        class Test5 {
            test(a) {}
        }

        generateMetadata(Test5, CLASS, [Test2, Test], {}, { test: { 1: Custom } });
        class Test6 {
            test(a) {}
        }

        expect(() => {
            generateMetadata(Test6, CLASS, [Test2, Test], {}, { test: { 1: Extended } });
        }).toThrowError(SyntaxExtenderValidateCompatibilityNotCompatibleError);

        expect(() => {
            generateMetadata(Test6, CLASS, [Test, Test2], {}, {});
        }).toThrowError(SyntaxExtenderValidateCompatibilityNotCompatibleError);
    });

    it('works inherited class ignore experimental features', function () {
        setSedefEnv('COMMENT', true);
        setSedefEnv('CHECKDEFAULT', true);

        class InheritedNotConverted {
            withComment(test /* :array */ = []) {}
            notValidDefault(test /* :array */ = {}) {}
        }

        class UseSyntaxExtender extends InheritedNotConverted {}

        generateMetadata(UseSyntaxExtender, CLASS, [], {}, {});

        let metadata = getMetadata(UseSyntaxExtender).toObject();

        expect(metadata.methods.withComment.parameters[0].type).toBeNull();

        class Converted {
            withComment(test /* :array */ = []) {}
        }

        generateMetadata(Converted, CLASS, [], {}, {});

        metadata = getMetadata(Converted).toObject();

        expect(metadata.methods.withComment.parameters[0].type).toBe('array');

        expect(() => {
            class GenerateErrorValidation {
                notValidDefault(test /* :array */ = {}) {}
            }

            generateMetadata(GenerateErrorValidation, CLASS, [], {}, {});
        }).toThrowError(SyntaxExtenderExtractParameterDefaultValueTypeMismatchError);

        setSedefEnv('COMMENT', false);
        setSedefEnv('CHECKDEFAULT', false);
    });
};
