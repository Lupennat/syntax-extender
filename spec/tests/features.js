'use strict';

const util = require('util');

const { CLASS, HANDLERS, ABSTRACT, INTERFACE, SEDEF_COMMENT, SEDEF_STATIC } = require('../../core/constants');

const { getSedefEnv, setSedefEnv } = require('../../core/utils');

const { getMetadata, generateMetadata } = require('../../core/metadata');

const toAbstract = require('../../core/to-abstract');
const toClass = require('../../core/to-class');

const SyntaxExtenderExtractParameterDefaultValueEvaluationError = require('../../errors/extract-parameters/syntax-extender-extract-parameter-default-value-evaluation-error');
const SyntaxExtenderExtractParameterDefaultValueNullError = require('../../errors/extract-parameters/syntax-extender-extract-parameter-default-value-null-error');
const SyntaxExtenderExtractParameterDefaultValueTypeMismatchError = require('../../errors/extract-parameters/syntax-extender-extract-parameter-default-value-type-mismatch-error');
const SyntaxExtenderExtractParameterDestructeredVariadicError = require('../../errors/extract-parameters/syntax-extender-extract-parameter-destructered-variadic-error');
const SyntaxExtenderExtractParameterError = require('../../errors/extract-parameters/syntax-extender-extract-parameter-error');
const SyntaxExtenderExtractReturnForbiddenError = require('../../errors/extract-return/syntax-extender-extract-return-forbidden-error');
const SyntaxExtenderNativeConstructorError = require('../../errors/syntax-extender-native-constructor-error');
const SyntaxExtenderValidateCompatibilityNotCompatibleError = require('../../errors/validate-compatibility/syntax-extender-validate-compatibility-not-compatible-error');
const SyntaxExtenderValidateParametersNotValidParameterError = require('../../errors/validate-parameters/syntax-extender-validate-parameter-not-valid-parameter-error');
const SyntaxExtenderValidateReturnNotValidReturnError = require('../../errors/validate-return/syntax-extender-validate-return-not-valid-return-error');

module.exports = () => {
    it('works runtime feature detection', function () {
        class Test {
            static [Symbol.for('ACCESSIBILITY')] = false;
            static [Symbol.for('MAGIC')] = false;
            static [Symbol.for('CONSTRUCTOR')] = false;
            static [Symbol.for('VALIDATION')] = false;
            static [Symbol.for('COMPATIBILITY')] = false;
        }

        generateMetadata(Test, CLASS);

        let metadata = getMetadata(Test);

        expect(metadata.hasFeature('ACCESSIBILITY')).toBeFalsy();
        expect(metadata.hasFeature('MAGIC')).toBeFalsy();
        expect(metadata.hasFeature('CONSTRUCTOR')).toBeFalsy();
        expect(metadata.hasFeature('VALIDATION')).toBeFalsy();
        expect(metadata.hasFeature('COMPATIBILITY')).toBeFalsy();

        class Test2 {
            static [Symbol.for('ACCESSIBILITY')] = false;
            static [Symbol.for('MAGIC')] = false;
            static [Symbol.for('CONSTRUCTOR')] = false;
            static [Symbol.for('VALIDATION')] = false;
            static [Symbol.for('COMPATIBILITY')] = false;
        }

        generateMetadata(Test2, ABSTRACT);

        metadata = getMetadata(Test2);

        expect(metadata.hasFeature('ACCESSIBILITY')).toBeFalsy();
        expect(metadata.hasFeature('MAGIC')).toBeFalsy();
        expect(metadata.hasFeature('CONSTRUCTOR')).toBeFalsy();
        expect(metadata.hasFeature('VALIDATION')).toBeFalsy();
        expect(metadata.hasFeature('COMPATIBILITY')).toBeFalsy();

        class Test3 {
            static [Symbol.for('ACCESSIBILITY')] = true;
            static [Symbol.for('MAGIC')] = true;
            static [Symbol.for('CONSTRUCTOR')] = true;
            static [Symbol.for('VALIDATION')] = true;
            static [Symbol.for('COMPATIBILITY')] = true;
        }

        generateMetadata(Test3, CLASS);

        metadata = getMetadata(Test3);
        expect(metadata.hasFeature('ACCESSIBILITY')).toBeTruthy();
        expect(metadata.hasFeature('MAGIC')).toBeTruthy();
        expect(metadata.hasFeature('CONSTRUCTOR')).toBeTruthy();
        expect(metadata.hasFeature('VALIDATION')).toBeTruthy();
        expect(metadata.hasFeature('COMPATIBILITY')).toBeTruthy();

        class Test4 {
            static [Symbol.for('ACCESSIBILITY')] = true;
            static [Symbol.for('MAGIC')] = true;
            static [Symbol.for('CONSTRUCTOR')] = true;
            static [Symbol.for('VALIDATION')] = true;
            static [Symbol.for('COMPATIBILITY')] = true;
        }

        generateMetadata(Test4, ABSTRACT);

        metadata = getMetadata(Test4);
        expect(metadata.hasFeature('ACCESSIBILITY')).toBeTruthy();
        expect(metadata.hasFeature('MAGIC')).toBeTruthy();
        expect(metadata.hasFeature('CONSTRUCTOR')).toBeTruthy();
        expect(metadata.hasFeature('VALIDATION')).toBeTruthy();
        expect(metadata.hasFeature('COMPATIBILITY')).toBeTruthy();
    });

    it('works interface feature always enabled', function () {
        class Test {}

        generateMetadata(Test, INTERFACE);

        let metadata = getMetadata(Test);

        expect(metadata.hasFeature('ACCESSIBILITY')).toBeTruthy();
        expect(metadata.hasFeature('MAGIC')).toBeTruthy();
        expect(metadata.hasFeature('CONSTRUCTOR')).toBeTruthy();
        expect(metadata.hasFeature('VALIDATION')).toBeTruthy();
        expect(metadata.hasFeature('COMPATIBILITY')).toBeTruthy();

        class Test2 {
            static [Symbol.for('MAGIC')] = false;
            static [Symbol.for('CONSTRUCTOR')] = false;
            static [Symbol.for('VALIDATION')] = false;
            static [Symbol.for('COMPATIBILITY')] = false;
        }

        generateMetadata(Test2, INTERFACE);

        metadata = getMetadata(Test2);

        expect(metadata.hasFeature('ACCESSIBILITY')).toBeTruthy();
        expect(metadata.hasFeature('MAGIC')).toBeTruthy();
        expect(metadata.hasFeature('CONSTRUCTOR')).toBeTruthy();
        expect(metadata.hasFeature('VALIDATION')).toBeTruthy();
        expect(metadata.hasFeature('COMPATIBILITY')).toBeTruthy();
    });

    it('works feature magic detection', function () {
        const previousMagic = getSedefEnv('MAGIC');
        const previousComment = getSedefEnv('COMMENT');
        setSedefEnv('MAGIC', true);
        setSedefEnv('COMMENT', true);
        class Test {
            static [Symbol.for('MAGIC')] = false;
            __construct() /* :array */ {}
            static __getStatic() {}
            static __setStatic() {}
            __set() {}
            __get() {}
            __has() {}
            __delete() {}
        }

        generateMetadata(Test, CLASS);

        let metadata = getMetadata(Test);

        for (const key in metadata.methods) {
            expect(metadata.methods[key].isMagic).toBeFalsy();
        }

        let model = toClass(
            class {
                static [Symbol.for('MAGIC')] = false;
                __construct() {}
                static __getStatic(key) {}
                static __setStatic(key, value) {}
                __set(key, value) {}
                __get(key) {}
                __has(key) {}
                __delete(key) {}
            }
        );

        expect(util.types.isProxy(model)).toBeFalsy();

        let t = new model();

        expect(util.types.isProxy(t)).toBeFalsy();

        model = toAbstract(
            class {
                static [Symbol.for('MAGIC')] = false;
                static __getStatic(key) {}
                static __setStatic(key, value) {}
                __set(key, value) {}
                __get(key) {}
                __has(key) {}
                __delete(key) {}
            }
        );

        expect(util.types.isProxy(model)).toBeTruthy();

        expect(model[HANDLERS]).toEqual(['construct']);

        let T = class extends model {};

        t = new T();

        expect(util.types.isProxy(t)).toBeFalsy();

        setSedefEnv('MAGIC', false);

        class Test2 {
            static [Symbol.for('MAGIC')] = true;
            __construct() {}
            static __getStatic(key) {}
            static __setStatic(key, value) {}
            __set(key, value) {}
            __get(key) {}
            __has(key) {}
            __delete(key) {}
        }

        generateMetadata(Test2, CLASS);

        metadata = getMetadata(Test2);

        for (const key in metadata.methods) {
            expect(metadata.methods[key].isMagic).toBeTruthy();
        }

        model = toClass(
            class {
                static [Symbol.for('MAGIC')] = true;
                __construct() {}
                static __getStatic(key) {}
                static __setStatic(key, value) {}
                __set(key, value) {}
                __get(key) {}
                __has(key) {}
                __delete(key) {}
            }
        );

        expect(util.types.isProxy(model)).toBeTruthy();

        expect(model[HANDLERS]).toEqual(['get', 'set', 'construct']);

        t = new model();

        expect(util.types.isProxy(t)).toBeTruthy();

        expect(t[HANDLERS]).toEqual(['get', 'set', 'has', 'deleteProperty']);

        model = toAbstract(
            class {
                static [Symbol.for('MAGIC')] = true;
                static __getStatic(key) {}
                static __setStatic(key, value) {}
                __set(key, value) {}
                __get(key) {}
                __has(key) {}
                __delete(key) {}
            }
        );

        expect(util.types.isProxy(model)).toBeTruthy();

        expect(model[HANDLERS]).toEqual(['get', 'set', 'construct']);

        T = class extends model {};

        t = new T();

        expect(util.types.isProxy(t)).toBeTruthy();

        expect(t[HANDLERS]).toEqual(['get', 'set', 'has', 'deleteProperty']);

        expect(() => {
            class Test3 {
                static [Symbol.for('MAGIC')] = true;
                __construct() /* :array */ {}
            }
            generateMetadata(Test3, CLASS);
        }).toThrowError(SyntaxExtenderExtractReturnForbiddenError);

        setSedefEnv('MAGIC', previousMagic);
        setSedefEnv('COMMENT', previousComment);
    });

    it('works feature constructor detection', function () {
        const previousConstructor = getSedefEnv('CONSTRUCTOR');
        setSedefEnv('CONSTRUCTOR', true);
        class Test {
            static [Symbol.for('CONSTRUCTOR')] = false;
            constructor() {}
        }

        generateMetadata(Test, CLASS);

        class Test2 {
            static [Symbol.for('CONSTRUCTOR')] = false;
            constructor() {}
        }

        generateMetadata(Test2, ABSTRACT);

        class Test3 {
            static [Symbol.for('CONSTRUCTOR')] = false;
            constructor() {}
        }

        expect(() => {
            generateMetadata(Test3, INTERFACE);
        }).toThrowError(SyntaxExtenderNativeConstructorError);

        setSedefEnv('CONSTRUCTOR', false);

        class Test4 {
            static [Symbol.for('CONSTRUCTOR')] = true;
            constructor() {}
        }

        expect(() => {
            generateMetadata(Test4, CLASS);
        }).toThrowError(SyntaxExtenderNativeConstructorError);

        class Test5 {
            static [Symbol.for('CONSTRUCTOR')] = true;
            constructor() {}
        }

        expect(() => {
            generateMetadata(Test5, ABSTRACT);
        }).toThrowError(SyntaxExtenderNativeConstructorError);

        class Test6 {
            static [Symbol.for('CONSTRUCTOR')] = true;
            constructor() {}
        }

        expect(() => {
            generateMetadata(Test6, INTERFACE);
        }).toThrowError(SyntaxExtenderNativeConstructorError);

        setSedefEnv('CONSTRUCTOR', previousConstructor);
    });

    it('works feature compatibility detection', function () {
        const previousCompatibility = getSedefEnv('COMPATIBILITY');
        setSedefEnv('COMPATIBILITY', true);

        class Inherit {
            test() {}
        }

        class Test extends Inherit {
            static [Symbol.for('COMPATIBILITY')] = false;
            test(parameter) {}
        }

        generateMetadata(Test, CLASS);

        let metadata = getMetadata(Test);

        expect(metadata.methods.test.parameters.get(0).name).toBe('parameter');

        setSedefEnv('COMPATIBILITY', false);

        class Test2 extends Inherit {
            static [Symbol.for('COMPATIBILITY')] = true;
            test(parameter) {}
        }

        expect(() => {
            generateMetadata(Test2, CLASS);
        }).toThrowError(SyntaxExtenderValidateCompatibilityNotCompatibleError);

        setSedefEnv('COMPATIBILITY', previousCompatibility);
    });

    it('works feature coercivng detection', function () {
        const previousCoercing = getSedefEnv('VALIDATION');
        setSedefEnv('VALIDATION', true);

        let Test = toClass(
            class {
                static [Symbol.for('VALIDATION')] = false;
                static __define = { test: { 1: 'string', return: 'array' } };
                test(array = []) {
                    return 'test';
                }
                test2(...{ a, b }) {
                    return 'completly no sense pattern destructured variadic, you can only get parameters through "arguments" keywords';
                }
                test3({ a, b }) {
                    return [a, b];
                }
            }
        );

        let t = new Test();
        expect(t.test([])).toBe('test');
        expect(t.test('')).toBe('test');

        setSedefEnv('VALIDATION', false);

        Test = toClass(
            class {
                static [Symbol.for('VALIDATION')] = true;
                static __define = { test: { 1: 'string', return: 'array' } };
                test(array = []) {
                    return 'test';
                }
            }
        );

        t = new Test();

        expect(() => {
            toClass(
                class {
                    static [Symbol.for('VALIDATION')] = true;
                    test(...{ a, b }) {
                        console.log({ a, b });
                    }
                }
            );
        }).toThrowError(SyntaxExtenderExtractParameterDestructeredVariadicError);

        expect(() => {
            t.test('');
        }).toThrowError(SyntaxExtenderValidateReturnNotValidReturnError);

        expect(() => {
            t.test([]);
        }).toThrowError(SyntaxExtenderValidateParametersNotValidParameterError);

        setSedefEnv('VALIDATION', previousCoercing);
    });

    it('works runtime experimental feature detection', function () {
        class Test {
            static [Symbol.for('COMMENT')] = false;
            static [Symbol.for('CHECKDEFAULT')] = false;
        }

        generateMetadata(Test, CLASS);

        let metadata = getMetadata(Test);
        expect(metadata.hasFeature('COMMENT')).toBeFalsy();
        expect(metadata.hasFeature('CHECKDEFAULT')).toBeFalsy();

        class Test2 {
            static [Symbol.for('COMMENT')] = true;
            static [Symbol.for('CHECKDEFAULT')] = true;
            static [Symbol.for('ACCESSIBILITY')] = true;
        }

        generateMetadata(Test2, CLASS);

        metadata = getMetadata(Test2);
        expect(metadata.hasFeature('COMMENT')).toBeTruthy();
        expect(metadata.hasFeature('CHECKDEFAULT')).toBeTruthy();
    });

    it('works feature comment detection', function () {
        const previousComment = getSedefEnv('COMMENT');
        const previousPriority = getSedefEnv('PRIORITY');

        setSedefEnv('COMMENT', true);
        setSedefEnv('COMMENT', SEDEF_STATIC);

        class Test {
            static [Symbol.for('COMMENT')] = false;
            test(array /* : array */ = []) /* :array */ {}
        }

        generateMetadata(Test, CLASS);

        let metadata = getMetadata(Test);

        expect(metadata.methods.test.return.type).toBeNull();
        expect(metadata.methods.test.parameters.get(0).type).toBeNull();

        class Test2 {
            static [Symbol.for('COMMENT')] = false;
            static [Symbol.for('PRIORITY')] = SEDEF_COMMENT;
            test(array /* : array */ = []) /* :array */ {}
        }

        generateMetadata(Test2, CLASS, undefined, undefined, { test: { 1: 'string', return: 'string' } });

        metadata = getMetadata(Test2);

        expect(metadata.methods.test.return.type).toBe('string');
        expect(metadata.methods.test.parameters.get(0).type).toBe('string');

        setSedefEnv('COMMENT', false);
        setSedefEnv('COMMENT', SEDEF_COMMENT);

        class Test3 {
            static [Symbol.for('COMMENT')] = true;
            static [Symbol.for('PRIORITY')] = SEDEF_STATIC;
            test(array /* : array */ = []) /* :array */ {}
        }

        generateMetadata(Test3, CLASS);
        metadata = getMetadata(Test3);

        expect(metadata.methods.test.return.type).toBe('array');
        expect(metadata.methods.test.parameters.get(0).type).toBe('array');

        class Test4 {
            static [Symbol.for('COMMENT')] = true;
            static [Symbol.for('PRIORITY')] = SEDEF_STATIC;
            test(array /* : array */ = []) /* :array */ {}
        }

        generateMetadata(Test4, CLASS, undefined, undefined, { test: { 1: 'string', return: 'string' } });

        metadata = getMetadata(Test4);

        expect(metadata.methods.test.return.type).toBe('string');
        expect(metadata.methods.test.parameters.get(0).type).toBe('string');

        setSedefEnv('COMMENT', previousComment);
        setSedefEnv('PRIORITY', previousPriority);
    });

    it('works feature check default detection', function () {
        const previousValidation = getSedefEnv('CHECKDEFAULT');
        setSedefEnv('CHECKDEFAULT', true);
        class Obj {}

        class Test {
            static [Symbol.for('CHECKDEFAULT')] = false;
            test(array = 'string') {}
        }

        class Test2 {
            static [Symbol.for('CHECKDEFAULT')] = false;
            test(array = 'string') {}
        }

        class Test3 {
            static [Symbol.for('CHECKDEFAULT')] = false;
            test(array = new Obj()) {}
        }

        class Test4 {
            static [Symbol.for('CHECKDEFAULT')] = false;
            test(array = null) {}
        }

        expect(() => {
            generateMetadata(Test, CLASS, undefined, undefined, { test: { 1: 'not-valid' } });
        }).toThrowError(SyntaxExtenderExtractParameterError);

        generateMetadata(Test, CLASS, undefined, undefined, { test: { 1: 'array' } });
        generateMetadata(Test2, CLASS, undefined, undefined, { test: { 1: Obj } });
        generateMetadata(Test3, CLASS, undefined, undefined, { test: { 1: 'array' } });
        generateMetadata(Test4, CLASS, undefined, undefined, { test: { 1: Obj } });

        class Test5 {
            static [Symbol.for('CHECKDEFAULT')] = true;
            test(array = 'string') {}
        }

        class Test6 {
            static [Symbol.for('CHECKDEFAULT')] = true;
            test(array = 'string') {}
        }

        class Test7 {
            static [Symbol.for('CHECKDEFAULT')] = true;
            test(array = new Obj()) {}
        }

        class Test8 {
            static [Symbol.for('CHECKDEFAULT')] = true;
            test(array = null) {}
        }

        expect(() => {
            generateMetadata(Test5, CLASS, undefined, undefined, { test: { 1: 'not-valid' } });
        }).toThrowError(SyntaxExtenderExtractParameterError);

        expect(() => {
            generateMetadata(Test5, CLASS, undefined, undefined, { test: { 1: 'array' } });
        }).toThrowError(SyntaxExtenderExtractParameterDefaultValueTypeMismatchError);

        expect(() => {
            generateMetadata(Test7, CLASS, undefined, undefined, { test: { 1: 'array' } });
        }).toThrowError(SyntaxExtenderExtractParameterDefaultValueEvaluationError);

        expect(() => {
            generateMetadata(Test6, CLASS, undefined, undefined, { test: { 1: Obj } });
        }).toThrowError(SyntaxExtenderExtractParameterDefaultValueNullError);

        generateMetadata(Test8, CLASS, undefined, undefined, { test: { 1: Obj } });

        setSedefEnv('CHECKDEFAULT', false);

        setSedefEnv('PRIORITY', previousValidation);
    });
};
