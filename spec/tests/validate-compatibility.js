'use strict';

const validateCompatibility = require('../../core/validate-compatibility');
const extractDescriptors = require('../../core/extract-descriptors');

const Descriptor = require('../../core/models/descriptor');

const SyntaxExtenderNotValidArgumentError = require('../../errors/syntax-extender-not-valid-argument-error');
const SyntaxExtenderValidateCompatibilityRefuseCompareError = require('../../errors/validate-compatibility/syntax-extender-validate-compatibility-refuse-compare-error');
const SyntaxExtenderValidateCompatibilityRefuseCompareTypeError = require('../../errors/validate-compatibility/syntax-extender-validate-compatibility-refuse-compare-type-error');
const SyntaxExtenderValidateCompatibilityRefuseComparePropertiesError = require('../../errors/validate-compatibility/syntax-extender-validate-compatibility-refuse-compare-properties-error');
const SyntaxExtenderValidateCompatibilityRefuseCompareStaticError = require('../../errors/validate-compatibility/syntax-extender-validate-compatibility-refuse-compare-static-error');
const SyntaxExtenderValidateCompatibilityNotCompatibleError = require('../../errors/validate-compatibility/syntax-extender-validate-compatibility-not-compatible-error');

module.exports = () => {
    it('works arguments validation', function () {
        expect(validateCompatibility(new Descriptor(), new Descriptor())).toBeTruthy();
        expect(() => {
            validateCompatibility({}, new Descriptor());
        }).toThrowError(SyntaxExtenderNotValidArgumentError);
        expect(() => {
            validateCompatibility(new Descriptor(), {});
        }).toThrowError(SyntaxExtenderNotValidArgumentError);
    });

    it('works compatibility refuse to compare different descriptor name', function () {
        const desc = extractDescriptors(
            class Test {
                test() {}
            }
        ).get(0);

        const inheritDesc = extractDescriptors(
            class Test2 {
                test2() {}
            }
        ).get(0);

        expect(() => {
            validateCompatibility(desc, inheritDesc);
        }).toThrowError(SyntaxExtenderValidateCompatibilityRefuseCompareError);
    });

    it('works compatibility refuse to compare different types', function () {
        const desc = extractDescriptors(
            class Test {
                get test() {}
            }
        ).get(0);

        const inheritDesc = extractDescriptors(
            class Test2 {
                test() {}
            }
        ).get(0);

        expect(() => {
            validateCompatibility(desc, inheritDesc);
        }).toThrowError(SyntaxExtenderValidateCompatibilityRefuseCompareTypeError);
    });

    it('works compatibility refuse to compare properties', function () {
        const desc = extractDescriptors(
            class Test {
                test = 1;
            },
            false
        ).get(0);

        const inheritDesc = extractDescriptors(
            class Test2 {
                test = 2;
            },
            false
        ).get(0);

        expect(() => {
            validateCompatibility(desc, inheritDesc);
        }).toThrowError(SyntaxExtenderValidateCompatibilityRefuseComparePropertiesError);
    });

    it('works compatibility refuse to compare different static', function () {
        const desc = extractDescriptors(
            class Test {
                static test(test = 'test') {}
            }
        ).get(0);

        const inheritDesc = extractDescriptors(
            class Test2 {
                test(test = 'test') {}
            }
        ).get(0);

        expect(() => {
            validateCompatibility(desc, inheritDesc);
        }).toThrowError(SyntaxExtenderValidateCompatibilityRefuseCompareStaticError);
    });

    it('works compatibility wrong default', function () {
        const desc = extractDescriptors(
            class Test {
                test(test) {}
            }
        ).get(0);

        const inheritDesc = extractDescriptors(
            class Test2 {
                test(test = 'test') {}
            }
        ).get(0);

        expect(() => {
            validateCompatibility(desc, inheritDesc);
        }).toThrowError(SyntaxExtenderValidateCompatibilityNotCompatibleError);

        expect(validateCompatibility(inheritDesc, desc)).toBeTruthy();
    });

    it('works compatibility wrong parameter count', function () {
        const desc = extractDescriptors(
            class Test {
                test(test) {}
            }
        ).get(0);

        const inheritDesc = extractDescriptors(
            class Test2 {
                test(test, test2) {}
            }
        ).get(0);

        expect(() => {
            validateCompatibility(desc, inheritDesc);
        }).toThrowError(SyntaxExtenderValidateCompatibilityNotCompatibleError);

        expect(() => {
            validateCompatibility(inheritDesc, desc);
        }).toThrowError(SyntaxExtenderValidateCompatibilityNotCompatibleError);

        const desc2 = extractDescriptors(
            class Test {
                test(test, test2) {}
            }
        ).get(0);

        expect(validateCompatibility(desc2, inheritDesc)).toBeTruthy();

        const desc3 = extractDescriptors(
            class Test {
                test(test = null, test2) {}
            }
        ).get(0);

        expect(validateCompatibility(desc3, inheritDesc)).toBeTruthy();

        const desc4 = extractDescriptors(
            class Test {
                test(test, test2 = null) {}
            }
        ).get(0);

        expect(validateCompatibility(desc4, inheritDesc)).toBeTruthy();

        const desc5 = extractDescriptors(
            class Test {
                test(test = null, test2 = null) {}
            }
        ).get(0);

        expect(validateCompatibility(desc5, inheritDesc)).toBeTruthy();

        const desc6 = extractDescriptors(
            class Test {
                test(test, test2, test3) {}
            }
        ).get(0);

        expect(() => {
            validateCompatibility(desc6, inheritDesc);
        }).toThrowError(SyntaxExtenderValidateCompatibilityNotCompatibleError);

        const desc7 = extractDescriptors(
            class Test {
                test(test, test2, test3 = null) {}
            }
        ).get(0);

        expect(validateCompatibility(desc7, inheritDesc)).toBeTruthy();
    });

    it('works compatibility wrong variadic', function () {
        const desc = extractDescriptors(
            class Test {
                test(test) {}
            }
        ).get(0);

        const inheritDesc = extractDescriptors(
            class Test2 {
                test(...test) {}
            }
        ).get(0);

        expect(() => {
            validateCompatibility(desc, inheritDesc);
        }).toThrowError(SyntaxExtenderValidateCompatibilityNotCompatibleError);
        expect(() => {
            validateCompatibility(inheritDesc, desc);
        }).toThrowError(SyntaxExtenderValidateCompatibilityNotCompatibleError);
    });

    it('works compatibility wrong parameter type', function () {
        let desc = extractDescriptors(
            class Test {
                test(test) {}
            },
            true,
            {}
        ).get(0);

        let inheritDesc = extractDescriptors(
            class Test2 {
                test(test) {}
            },
            true,
            { test: { 1: 'integer' } }
        ).get(0);

        expect(validateCompatibility(desc, inheritDesc)).toBeTruthy();

        expect(() => {
            validateCompatibility(inheritDesc, desc);
        }).toThrowError(SyntaxExtenderValidateCompatibilityNotCompatibleError);

        desc = extractDescriptors(
            class Test {
                test(test) {}
            },
            true,
            { test: { 1: 'string' } }
        ).get(0);

        expect(() => {
            validateCompatibility(desc, inheritDesc);
        }).toThrowError(SyntaxExtenderValidateCompatibilityNotCompatibleError);

        expect(() => {
            validateCompatibility(inheritDesc, desc);
        }).toThrowError(SyntaxExtenderValidateCompatibilityNotCompatibleError);

        class Base {}
        class Custom extends Base {}
        class Extended extends Custom {}
        class Other {}

        desc = extractDescriptors(
            class Test {
                test(test) {}
            },
            true,
            { test: { 1: Extended } }
        ).get(0);

        inheritDesc = extractDescriptors(
            class Test2 {
                test(test) {}
            },
            true,
            { test: { 1: Extended } }
        ).get(0);

        validateCompatibility(inheritDesc, desc);
        validateCompatibility(desc, inheritDesc);

        inheritDesc = extractDescriptors(
            class Test2 {
                test(test) {}
            },
            true,
            { test: { 1: Custom } }
        ).get(0);

        expect(() => {
            validateCompatibility(desc, inheritDesc);
        }).toThrowError(SyntaxExtenderValidateCompatibilityNotCompatibleError);

        validateCompatibility(inheritDesc, desc);

        inheritDesc = extractDescriptors(
            class Test2 {
                test(test) {}
            },
            true,
            { test: { 1: Base } }
        ).get(0);

        expect(() => {
            validateCompatibility(desc, inheritDesc);
        }).toThrowError(SyntaxExtenderValidateCompatibilityNotCompatibleError);

        validateCompatibility(inheritDesc, desc);

        desc = extractDescriptors(
            class Test {
                test(test) {}
            },
            true,
            { test: { 1: Custom } }
        ).get(0);

        inheritDesc = extractDescriptors(
            class Test2 {
                test(test) {}
            },
            true,
            { test: { 1: Extended } }
        ).get(0);

        validateCompatibility(desc, inheritDesc);
        expect(() => {
            validateCompatibility(inheritDesc, desc);
        }).toThrowError(SyntaxExtenderValidateCompatibilityNotCompatibleError);

        inheritDesc = extractDescriptors(
            class Test2 {
                test(test) {}
            },
            true,
            { test: { 1: Custom } }
        ).get(0);

        validateCompatibility(desc, inheritDesc);
        validateCompatibility(inheritDesc, desc);

        inheritDesc = extractDescriptors(
            class Test2 {
                test(test) {}
            },
            true,
            { test: { 1: Base } }
        ).get(0);

        expect(() => {
            validateCompatibility(desc, inheritDesc);
        }).toThrowError(SyntaxExtenderValidateCompatibilityNotCompatibleError);

        validateCompatibility(inheritDesc, desc);

        desc = extractDescriptors(
            class Test {
                test(test) {}
            },
            true,
            { test: { 1: Base } }
        ).get(0);

        inheritDesc = extractDescriptors(
            class Test2 {
                test(test) {}
            },
            true,
            { test: { 1: Extended } }
        ).get(0);

        validateCompatibility(desc, inheritDesc);
        expect(() => {
            validateCompatibility(inheritDesc, desc);
        }).toThrowError(SyntaxExtenderValidateCompatibilityNotCompatibleError);

        inheritDesc = extractDescriptors(
            class Test2 {
                test(test) {}
            },
            true,
            { test: { 1: Custom } }
        ).get(0);

        validateCompatibility(desc, inheritDesc);
        expect(() => {
            validateCompatibility(inheritDesc, desc);
        }).toThrowError(SyntaxExtenderValidateCompatibilityNotCompatibleError);

        inheritDesc = extractDescriptors(
            class Test2 {
                test(test) {}
            },
            true,
            { test: { 1: Base } }
        ).get(0);

        validateCompatibility(desc, inheritDesc);
        validateCompatibility(inheritDesc, desc);

        desc = extractDescriptors(
            class Test {
                test(test) {}
            },
            true,
            { test: { 1: Other } }
        ).get(0);

        expect(() => {
            validateCompatibility(desc, inheritDesc);
        }).toThrowError(SyntaxExtenderValidateCompatibilityNotCompatibleError);

        expect(() => {
            validateCompatibility(inheritDesc, desc);
        }).toThrowError(SyntaxExtenderValidateCompatibilityNotCompatibleError);

        class Test2 {
            test(test) {}
        }

        desc = extractDescriptors(
            class Test extends Test2 {
                test(test) {}
            },
            true,
            { test: { 1: 'parent' } }
        ).get(0);

        inheritDesc = extractDescriptors(Test2, true, { test: { 1: 'self' } }).get(0);

        validateCompatibility(desc, inheritDesc);

        desc = extractDescriptors(
            class Test extends Test2 {
                test(test) {}
            },
            true,
            { test: { 1: 'self' } }
        ).get(0);

        expect(() => {
            validateCompatibility(desc, inheritDesc);
        }).toThrowError(SyntaxExtenderValidateCompatibilityNotCompatibleError);

        class Test3 extends Test2 {
            test(test) {}
        }

        desc = extractDescriptors(
            class Test extends Test3 {
                test(test) {}
            },
            true,
            { test: { 1: 'parent' } }
        ).get(0);

        inheritDesc = extractDescriptors(Test3, true, { test: { 1: 'parent' } }).get(0);
        expect(() => {
            validateCompatibility(desc, inheritDesc);
        }).toThrowError(SyntaxExtenderValidateCompatibilityNotCompatibleError);
    });

    it('works compatibility wrong parameter union types type', function () {
        const desc = extractDescriptors(
            class Test {
                test(test) {}
            },
            true,
            { test: { 1: 'string|array|integer' } }
        ).get(0);

        const inheritDesc = extractDescriptors(
            class Test2 {
                test(test) {}
            },
            true,
            { test: { 1: 'string|array' } }
        ).get(0);

        validateCompatibility(desc, inheritDesc);
        expect(() => {
            validateCompatibility(inheritDesc, desc);
        }).toThrowError(SyntaxExtenderValidateCompatibilityNotCompatibleError);
    });

    it('works compatibility wrong parameter nullable type', function () {
        const desc = extractDescriptors(
            class Test {
                test(test) {}
            },
            true,
            { test: { '?1': 'string' } }
        ).get(0);

        const inheritDesc = extractDescriptors(
            class Test2 {
                test(test) {}
            },
            true,
            { test: { 1: 'string' } }
        ).get(0);

        validateCompatibility(desc, inheritDesc);
        expect(() => {
            validateCompatibility(inheritDesc, desc);
        }).toThrowError(SyntaxExtenderValidateCompatibilityNotCompatibleError);
    });

    it('works compatibility wrong parameter nullable type from default', function () {
        const desc = extractDescriptors(
            class Test {
                test(test = null) {}
            },
            true,
            { test: { 1: 'string' } }
        ).get(0);

        const inheritDesc = extractDescriptors(
            class Test2 {
                test(test) {}
            },
            true,
            { test: { 1: 'string' } }
        ).get(0);

        validateCompatibility(desc, inheritDesc);
        expect(() => {
            validateCompatibility(inheritDesc, desc);
        }).toThrowError(SyntaxExtenderValidateCompatibilityNotCompatibleError);
    });

    it('works compatibility wrong parameter promise', function () {
        const desc = extractDescriptors(
            class Test {
                test(test) {}
            },
            true,
            { test: { 1: 'string' } }
        ).get(0);

        const inheritDesc = extractDescriptors(
            class Test2 {
                test(test) {}
            },
            true,
            { test: { '1->': 'string' } }
        ).get(0);

        validateCompatibility(desc, inheritDesc);
        expect(() => {
            validateCompatibility(inheritDesc, desc);
        }).toThrowError(SyntaxExtenderValidateCompatibilityNotCompatibleError);
    });

    it('works compatibility wrong parameter nullable promise', function () {
        const desc = extractDescriptors(
            class Test {
                test(test) {}
            },
            true,
            { test: { '1?>': 'string' } }
        ).get(0);

        const inheritDesc = extractDescriptors(
            class Test2 {
                test(test) {}
            },
            true,
            { test: { '1->': 'string' } }
        ).get(0);

        validateCompatibility(desc, inheritDesc);
        expect(() => {
            validateCompatibility(inheritDesc, desc);
        }).toThrowError(SyntaxExtenderValidateCompatibilityNotCompatibleError);
    });

    it('works parameter compatibility between promise', function () {
        let desc = extractDescriptors(
            class Test {
                test(test) {}
            },
            true,
            {}
        ).get(0);

        let inheritDesc = extractDescriptors(
            class Test2 {
                test(test) {}
            },
            true,
            { test: { 1: 'promise' } }
        ).get(0);

        validateCompatibility(desc, inheritDesc);
        expect(() => {
            validateCompatibility(inheritDesc, desc);
        }).toThrowError(SyntaxExtenderValidateCompatibilityNotCompatibleError);

        desc = extractDescriptors(
            class Test {
                test(test) {}
            },
            true,
            { test: { 1: 'promise' } }
        ).get(0);

        validateCompatibility(desc, inheritDesc);
        validateCompatibility(inheritDesc, desc);

        desc = extractDescriptors(
            class Test {
                test(test) {}
            },
            true,
            { test: { '1->': 'string' } }
        ).get(0);

        expect(() => {
            validateCompatibility(desc, inheritDesc);
        }).toThrowError(SyntaxExtenderValidateCompatibilityNotCompatibleError);
        validateCompatibility(inheritDesc, desc);

        inheritDesc = extractDescriptors(
            class Test2 {
                test(test) {}
            },
            true,
            { test: { 1: 'string' } }
        ).get(0);

        desc = extractDescriptors(
            class Test {
                test(test) {}
            },
            true,
            { test: { 1: 'promise' } }
        ).get(0);

        expect(() => {
            validateCompatibility(desc, inheritDesc);
        }).toThrowError(SyntaxExtenderValidateCompatibilityNotCompatibleError);
        expect(() => {
            validateCompatibility(inheritDesc, desc);
        }).toThrowError(SyntaxExtenderValidateCompatibilityNotCompatibleError);

        desc = extractDescriptors(
            class Test {
                test(test) {}
            },
            true,
            { test: { '1->': 'string' } }
        ).get(0);

        expect(() => {
            validateCompatibility(desc, inheritDesc);
        }).toThrowError(SyntaxExtenderValidateCompatibilityNotCompatibleError);
        validateCompatibility(inheritDesc, desc);

        desc = extractDescriptors(
            class Test {
                test(test) {}
            },
            true,
            { test: { '1->': 'array' } }
        ).get(0);

        expect(() => {
            validateCompatibility(desc, inheritDesc);
        }).toThrowError(SyntaxExtenderValidateCompatibilityNotCompatibleError);
        expect(() => {
            validateCompatibility(inheritDesc, desc);
        }).toThrowError(SyntaxExtenderValidateCompatibilityNotCompatibleError);

        inheritDesc = extractDescriptors(
            class Test2 {
                test(test) {}
            },
            true,
            {}
        ).get(0);

        desc = extractDescriptors(
            class Test {
                test(test) {}
            },
            true,
            { test: { 1: 'promise' } }
        ).get(0);

        expect(() => {
            validateCompatibility(desc, inheritDesc);
        }).toThrowError(SyntaxExtenderValidateCompatibilityNotCompatibleError);
        validateCompatibility(inheritDesc, desc);

        desc = extractDescriptors(
            class Test {
                test(test) {}
            },
            true,
            { test: { '1->': 'string' } }
        ).get(0);

        expect(() => {
            validateCompatibility(desc, inheritDesc);
        }).toThrowError(SyntaxExtenderValidateCompatibilityNotCompatibleError);
        validateCompatibility(inheritDesc, desc);

        desc = extractDescriptors(
            class Test {
                test(test) {}
            },
            true,
            { test: { '1->': 'array' } }
        ).get(0);

        expect(() => {
            validateCompatibility(desc, inheritDesc);
        }).toThrowError(SyntaxExtenderValidateCompatibilityNotCompatibleError);
        validateCompatibility(inheritDesc, desc);
    });

    it('works compatibility wrong return type', function () {
        let desc = extractDescriptors(
            class Test {
                test(test) {}
            },
            true,
            { test: { return: 'integer' } }
        ).get(0);

        let inheritDesc = extractDescriptors(
            class Test2 {
                test(test) {}
            },
            true,
            {}
        ).get(0);

        expect(validateCompatibility(desc, inheritDesc)).toBeTruthy();

        expect(() => {
            validateCompatibility(inheritDesc, desc);
        }).toThrowError(SyntaxExtenderValidateCompatibilityNotCompatibleError);

        inheritDesc = extractDescriptors(
            class Test {
                test(test) {}
            },
            true,
            { test: { return: 'string' } }
        ).get(0);

        expect(() => {
            validateCompatibility(desc, inheritDesc);
        }).toThrowError(SyntaxExtenderValidateCompatibilityNotCompatibleError);

        expect(() => {
            validateCompatibility(inheritDesc, desc);
        }).toThrowError(SyntaxExtenderValidateCompatibilityNotCompatibleError);

        class Base {}
        class Custom extends Base {}
        class Extended extends Custom {}
        class Other {}

        desc = extractDescriptors(
            class Test {
                test(test) {}
            },
            true,
            { test: { return: Extended } }
        ).get(0);

        inheritDesc = extractDescriptors(
            class Test2 {
                test(test) {}
            },
            true,
            { test: { return: Extended } }
        ).get(0);

        validateCompatibility(inheritDesc, desc);
        validateCompatibility(desc, inheritDesc);

        inheritDesc = extractDescriptors(
            class Test2 {
                test(test) {}
            },
            true,
            { test: { return: Custom } }
        ).get(0);

        validateCompatibility(desc, inheritDesc);

        expect(() => {
            validateCompatibility(inheritDesc, desc);
        }).toThrowError(SyntaxExtenderValidateCompatibilityNotCompatibleError);

        inheritDesc = extractDescriptors(
            class Test2 {
                test(test) {}
            },
            true,
            { test: { return: Base } }
        ).get(0);

        validateCompatibility(desc, inheritDesc);
        expect(() => {
            validateCompatibility(inheritDesc, desc);
        }).toThrowError(SyntaxExtenderValidateCompatibilityNotCompatibleError);

        desc = extractDescriptors(
            class Test {
                test(test) {}
            },
            true,
            { test: { return: Custom } }
        ).get(0);

        inheritDesc = extractDescriptors(
            class Test2 {
                test(test) {}
            },
            true,
            { test: { return: Extended } }
        ).get(0);

        validateCompatibility(inheritDesc, desc);
        expect(() => {
            validateCompatibility(desc, inheritDesc);
        }).toThrowError(SyntaxExtenderValidateCompatibilityNotCompatibleError);

        inheritDesc = extractDescriptors(
            class Test2 {
                test(test) {}
            },
            true,
            { test: { return: Custom } }
        ).get(0);

        validateCompatibility(desc, inheritDesc);
        validateCompatibility(inheritDesc, desc);

        inheritDesc = extractDescriptors(
            class Test2 {
                test(test) {}
            },
            true,
            { test: { return: Base } }
        ).get(0);

        expect(() => {
            validateCompatibility(inheritDesc, desc);
        }).toThrowError(SyntaxExtenderValidateCompatibilityNotCompatibleError);

        validateCompatibility(desc, inheritDesc);

        desc = extractDescriptors(
            class Test {
                test(test) {}
            },
            true,
            { test: { return: Base } }
        ).get(0);

        inheritDesc = extractDescriptors(
            class Test2 {
                test(test) {}
            },
            true,
            { test: { return: Extended } }
        ).get(0);

        validateCompatibility(inheritDesc, desc);
        expect(() => {
            validateCompatibility(desc, inheritDesc);
        }).toThrowError(SyntaxExtenderValidateCompatibilityNotCompatibleError);

        inheritDesc = extractDescriptors(
            class Test2 {
                test(test) {}
            },
            true,
            { test: { return: Custom } }
        ).get(0);

        validateCompatibility(inheritDesc, desc);
        expect(() => {
            validateCompatibility(desc, inheritDesc);
        }).toThrowError(SyntaxExtenderValidateCompatibilityNotCompatibleError);

        inheritDesc = extractDescriptors(
            class Test2 {
                test(test) {}
            },
            true,
            { test: { return: Base } }
        ).get(0);

        validateCompatibility(desc, inheritDesc);
        validateCompatibility(inheritDesc, desc);

        desc = extractDescriptors(
            class Test {
                test(test) {}
            },
            true,
            { test: { return: Other } }
        ).get(0);

        expect(() => {
            validateCompatibility(desc, inheritDesc);
        }).toThrowError(SyntaxExtenderValidateCompatibilityNotCompatibleError);

        expect(() => {
            validateCompatibility(inheritDesc, desc);
        }).toThrowError(SyntaxExtenderValidateCompatibilityNotCompatibleError);

        class Test2 {
            test(test) {}
        }

        desc = extractDescriptors(
            class Test extends Test2 {
                test(test) {}
            },
            true,
            { test: { return: 'parent' } }
        ).get(0);

        inheritDesc = extractDescriptors(Test2, true, { test: { return: 'self' } }).get(0);

        validateCompatibility(desc, inheritDesc);

        desc = extractDescriptors(
            class Test extends Test2 {
                test(test) {}
            },
            true,
            { test: { return: 'self' } }
        ).get(0);

        validateCompatibility(desc, inheritDesc);

        class Test3 extends Test2 {
            test(test) {}
        }

        desc = extractDescriptors(
            class Test extends Test3 {
                test(test) {}
            },
            true,
            { test: { return: 'parent' } }
        ).get(0);

        inheritDesc = extractDescriptors(Test3, true, { test: { return: 'parent' } }).get(0);
        validateCompatibility(desc, inheritDesc);
    });

    it('works compatibility wrong promise type', function () {
        const desc = extractDescriptors(
            class Test {
                test() {}
            },
            true,
            { test: { 'return->': 'string' } }
        ).get(0);

        let inheritDesc = extractDescriptors(
            class Test2 {
                test() {}
            },
            true,
            { test: { return: 'promise' } }
        ).get(0);

        validateCompatibility(desc, inheritDesc);
        expect(() => {
            validateCompatibility(inheritDesc, desc);
        }).toThrowError(SyntaxExtenderValidateCompatibilityNotCompatibleError);

        inheritDesc = extractDescriptors(
            class Test2 {
                test() {}
            },
            true,
            { test: { return: 'promise|array' } }
        ).get(0);

        expect(() => {
            validateCompatibility(desc, inheritDesc);
        }).toThrowError(SyntaxExtenderValidateCompatibilityNotCompatibleError);

        expect(() => {
            validateCompatibility(inheritDesc, desc);
        }).toThrowError(SyntaxExtenderValidateCompatibilityNotCompatibleError);
    });

    it('works compatibility wrong iterable type', function () {
        const desc = extractDescriptors(
            class Test {
                test() {}
            },
            true,
            { test: { 'return[]': 'string' } }
        ).get(0);

        let inheritDesc = extractDescriptors(
            class Test2 {
                test() {}
            },
            true,
            { test: { return: 'array' } }
        ).get(0);

        validateCompatibility(desc, inheritDesc);
        expect(() => {
            validateCompatibility(inheritDesc, desc);
        }).toThrowError(SyntaxExtenderValidateCompatibilityNotCompatibleError);

        inheritDesc = extractDescriptors(
            class Test2 {
                test() {}
            },
            true,
            { test: { return: 'array|string' } }
        ).get(0);

        expect(() => {
            validateCompatibility(desc, inheritDesc);
        }).toThrowError(SyntaxExtenderValidateCompatibilityNotCompatibleError);

        expect(() => {
            validateCompatibility(inheritDesc, desc);
        }).toThrowError(SyntaxExtenderValidateCompatibilityNotCompatibleError);
    });

    it('works compatibility wrong return union types type', function () {
        const desc = extractDescriptors(
            class Test {
                test() {}
            },
            true,
            { test: { return: 'string|array' } }
        ).get(0);

        const inheritDesc = extractDescriptors(
            class Test2 {
                test() {}
            },
            true,
            { test: { return: 'string|array|integer' } }
        ).get(0);

        validateCompatibility(desc, inheritDesc);
        expect(() => {
            validateCompatibility(inheritDesc, desc);
        }).toThrowError(SyntaxExtenderValidateCompatibilityNotCompatibleError);
    });

    it('works compatibility wrong return nullable type', function () {
        const desc = extractDescriptors(
            class Test {
                test() {}
            },
            true,
            { test: { return: 'string' } }
        ).get(0);

        const inheritDesc = extractDescriptors(
            class Test2 {
                test() {}
            },
            true,
            { test: { '?return': 'string' } }
        ).get(0);

        validateCompatibility(desc, inheritDesc);
        expect(() => {
            validateCompatibility(inheritDesc, desc);
        }).toThrowError(SyntaxExtenderValidateCompatibilityNotCompatibleError);
    });

    it('works compatibility non promise to promise', function () {
        const desc = extractDescriptors(
            class Test {
                test() {}
            },
            true,
            { test: { 'return->': 'string' } }
        ).get(0);

        const inheritDesc = extractDescriptors(
            class Test2 {
                test() {}
            },
            true,
            { test: { return: 'string' } }
        ).get(0);

        validateCompatibility(desc, inheritDesc);
        expect(() => {
            validateCompatibility(inheritDesc, desc);
        }).toThrowError(SyntaxExtenderValidateCompatibilityNotCompatibleError);
    });

    it('works compatibility wrong return nullable promise', function () {
        const desc = extractDescriptors(
            class Test {
                test() {}
            },
            true,
            { test: { 'return->': 'string' } }
        ).get(0);

        const inheritDesc = extractDescriptors(
            class Test2 {
                test() {}
            },
            true,
            { test: { 'return?>': 'string' } }
        ).get(0);

        validateCompatibility(desc, inheritDesc);
        expect(() => {
            validateCompatibility(inheritDesc, desc);
        }).toThrowError(SyntaxExtenderValidateCompatibilityNotCompatibleError);
    });

    it('works compatibility wrong return nullable iterable', function () {
        const desc = extractDescriptors(
            class Test {
                test() {}
            },
            true,
            { test: { 'return[]': 'string' } }
        ).get(0);

        const inheritDesc = extractDescriptors(
            class Test2 {
                test() {}
            },
            true,
            { test: { 'return[?]': 'string' } }
        ).get(0);

        validateCompatibility(desc, inheritDesc);
        expect(() => {
            validateCompatibility(inheritDesc, desc);
        }).toThrowError(SyntaxExtenderValidateCompatibilityNotCompatibleError);
    });

    it('works return compatibility between promise', function () {
        let desc = extractDescriptors(
            class Test {
                test() {}
            },
            true,
            {}
        ).get(0);

        let inheritDesc = extractDescriptors(
            class Test2 {
                async test() {}
            },
            true,
            {}
        ).get(0);

        expect(() => {
            validateCompatibility(desc, inheritDesc);
        }).toThrowError(SyntaxExtenderValidateCompatibilityNotCompatibleError);
        validateCompatibility(inheritDesc, desc);

        desc = extractDescriptors(
            class Test {
                async test() {}
            },
            true,
            {}
        ).get(0);

        validateCompatibility(desc, inheritDesc);
        validateCompatibility(inheritDesc, desc);

        desc = extractDescriptors(
            class Test {
                test() {}
            },
            true,
            { test: { return: 'promise' } }
        ).get(0);

        validateCompatibility(desc, inheritDesc);
        validateCompatibility(inheritDesc, desc);

        desc = extractDescriptors(
            class Test {
                test() {}
            },
            true,
            { test: { 'return->': 'string' } }
        ).get(0);

        validateCompatibility(desc, inheritDesc);

        expect(() => {
            validateCompatibility(inheritDesc, desc);
        }).toThrowError(SyntaxExtenderValidateCompatibilityNotCompatibleError);

        inheritDesc = extractDescriptors(
            class Test2 {
                test() {}
            },
            true,
            { test: { return: 'string' } }
        ).get(0);

        desc = extractDescriptors(
            class Test {
                async test() {}
            },
            true,
            {}
        ).get(0);

        expect(() => {
            validateCompatibility(desc, inheritDesc);
        }).toThrowError(SyntaxExtenderValidateCompatibilityNotCompatibleError);
        expect(() => {
            validateCompatibility(inheritDesc, desc);
        }).toThrowError(SyntaxExtenderValidateCompatibilityNotCompatibleError);

        desc = extractDescriptors(
            class Test {
                test() {}
            },
            true,
            { test: { return: 'promise' } }
        ).get(0);

        expect(() => {
            validateCompatibility(desc, inheritDesc);
        }).toThrowError(SyntaxExtenderValidateCompatibilityNotCompatibleError);
        expect(() => {
            validateCompatibility(inheritDesc, desc);
        }).toThrowError(SyntaxExtenderValidateCompatibilityNotCompatibleError);

        desc = extractDescriptors(
            class Test {
                test() {}
            },
            true,
            { test: { 'return->': 'string' } }
        ).get(0);

        validateCompatibility(desc, inheritDesc);
        expect(() => {
            validateCompatibility(inheritDesc, desc);
        }).toThrowError(SyntaxExtenderValidateCompatibilityNotCompatibleError);

        desc = extractDescriptors(
            class Test {
                test() {}
            },
            true,
            { test: { 'return->': 'array' } }
        ).get(0);

        expect(() => {
            validateCompatibility(desc, inheritDesc);
        }).toThrowError(SyntaxExtenderValidateCompatibilityNotCompatibleError);
        expect(() => {
            validateCompatibility(inheritDesc, desc);
        }).toThrowError(SyntaxExtenderValidateCompatibilityNotCompatibleError);

        inheritDesc = extractDescriptors(
            class Test2 {
                test() {}
            },
            true,
            {}
        ).get(0);

        desc = extractDescriptors(
            class Test {
                async test() {}
            },
            true,
            {}
        ).get(0);

        validateCompatibility(desc, inheritDesc);
        expect(() => {
            validateCompatibility(inheritDesc, desc);
        }).toThrowError(SyntaxExtenderValidateCompatibilityNotCompatibleError);

        desc = extractDescriptors(
            class Test {
                test() {}
            },
            true,
            { test: { return: 'promise' } }
        ).get(0);

        validateCompatibility(desc, inheritDesc);
        expect(() => {
            validateCompatibility(inheritDesc, desc);
        }).toThrowError(SyntaxExtenderValidateCompatibilityNotCompatibleError);

        desc = extractDescriptors(
            class Test {
                test() {}
            },
            true,
            { test: { 'return->': 'string' } }
        ).get(0);

        validateCompatibility(desc, inheritDesc);
        expect(() => {
            validateCompatibility(inheritDesc, desc);
        }).toThrowError(SyntaxExtenderValidateCompatibilityNotCompatibleError);

        desc = extractDescriptors(
            class Test {
                test() {}
            },
            true,
            { test: { 'return->': 'array' } }
        ).get(0);

        validateCompatibility(desc, inheritDesc);
        expect(() => {
            validateCompatibility(inheritDesc, desc);
        }).toThrowError(SyntaxExtenderValidateCompatibilityNotCompatibleError);
    });

    it('works return compatibility between generator', function () {
        let desc = extractDescriptors(
            class Test {
                test() {}
            },
            true,
            {}
        ).get(0);

        let inheritDesc = extractDescriptors(
            class Test2 {
                *test() {}
            },
            true,
            {}
        ).get(0);

        expect(() => {
            validateCompatibility(desc, inheritDesc);
        }).toThrowError(SyntaxExtenderValidateCompatibilityNotCompatibleError);
        validateCompatibility(inheritDesc, desc);

        desc = extractDescriptors(
            class Test {
                *test() {}
            },
            true,
            {}
        ).get(0);

        validateCompatibility(desc, inheritDesc);
        validateCompatibility(inheritDesc, desc);

        desc = extractDescriptors(
            class Test {
                test() {}
            },
            true,
            { test: { return: 'generator' } }
        ).get(0);

        validateCompatibility(desc, inheritDesc);
        validateCompatibility(inheritDesc, desc);

        desc = extractDescriptors(
            class Test {
                test() {}
            },
            true,
            { test: { 'return[]': 'string' } }
        ).get(0);

        validateCompatibility(desc, inheritDesc);

        expect(() => {
            validateCompatibility(inheritDesc, desc);
        }).toThrowError(SyntaxExtenderValidateCompatibilityNotCompatibleError);

        inheritDesc = extractDescriptors(
            class Test2 {
                test() {}
            },
            true,
            { test: { return: 'string' } }
        ).get(0);

        desc = extractDescriptors(
            class Test {
                *test() {}
            },
            true,
            {}
        ).get(0);

        expect(() => {
            validateCompatibility(desc, inheritDesc);
        }).toThrowError(SyntaxExtenderValidateCompatibilityNotCompatibleError);
        expect(() => {
            validateCompatibility(inheritDesc, desc);
        }).toThrowError(SyntaxExtenderValidateCompatibilityNotCompatibleError);

        desc = extractDescriptors(
            class Test {
                test() {}
            },
            true,
            { test: { return: 'generator' } }
        ).get(0);

        expect(() => {
            validateCompatibility(desc, inheritDesc);
        }).toThrowError(SyntaxExtenderValidateCompatibilityNotCompatibleError);
        expect(() => {
            validateCompatibility(inheritDesc, desc);
        }).toThrowError(SyntaxExtenderValidateCompatibilityNotCompatibleError);

        desc = extractDescriptors(
            class Test {
                test() {}
            },
            true,
            { test: { 'return[]': 'string' } }
        ).get(0);

        expect(() => {
            validateCompatibility(desc, inheritDesc);
        }).toThrowError(SyntaxExtenderValidateCompatibilityNotCompatibleError);
        expect(() => {
            validateCompatibility(inheritDesc, desc);
        }).toThrowError(SyntaxExtenderValidateCompatibilityNotCompatibleError);

        inheritDesc = extractDescriptors(
            class Test2 {
                test() {}
            },
            true,
            {}
        ).get(0);

        desc = extractDescriptors(
            class Test {
                *test() {}
            },
            true,
            {}
        ).get(0);

        validateCompatibility(desc, inheritDesc);
        expect(() => {
            validateCompatibility(inheritDesc, desc);
        }).toThrowError(SyntaxExtenderValidateCompatibilityNotCompatibleError);

        desc = extractDescriptors(
            class Test {
                test() {}
            },
            true,
            { test: { return: 'generator' } }
        ).get(0);

        validateCompatibility(desc, inheritDesc);
        expect(() => {
            validateCompatibility(inheritDesc, desc);
        }).toThrowError(SyntaxExtenderValidateCompatibilityNotCompatibleError);

        desc = extractDescriptors(
            class Test {
                test() {}
            },
            true,
            { test: { 'return[]': 'string' } }
        ).get(0);

        validateCompatibility(desc, inheritDesc);
        expect(() => {
            validateCompatibility(inheritDesc, desc);
        }).toThrowError(SyntaxExtenderValidateCompatibilityNotCompatibleError);

        desc = extractDescriptors(
            class Test {
                test() {}
            },
            true,
            { test: { 'return[]': 'array' } }
        ).get(0);

        validateCompatibility(desc, inheritDesc);
        expect(() => {
            validateCompatibility(inheritDesc, desc);
        }).toThrowError(SyntaxExtenderValidateCompatibilityNotCompatibleError);
    });

    it('works return compatibility between promise generator', function () {
        let desc = extractDescriptors(
            class Test {
                test() {}
            },
            true,
            {}
        ).get(0);

        let inheritDesc = extractDescriptors(
            class Test2 {
                async *test() {}
            },
            true,
            {}
        ).get(0);

        expect(() => {
            validateCompatibility(desc, inheritDesc);
        }).toThrowError(SyntaxExtenderValidateCompatibilityNotCompatibleError);
        validateCompatibility(inheritDesc, desc);

        desc = extractDescriptors(
            class Test {
                async *test() {}
            },
            true,
            {}
        ).get(0);

        validateCompatibility(desc, inheritDesc);
        validateCompatibility(inheritDesc, desc);

        desc = extractDescriptors(
            class Test {
                test() {}
            },
            true,
            { test: { return: 'promise' } }
        ).get(0);

        expect(() => {
            // async generator function always return promise generator
            // you have to define at least 'return->' : generator
            // promise is too generic
            validateCompatibility(desc, inheritDesc);
        }).toThrowError(SyntaxExtenderValidateCompatibilityNotCompatibleError);
        validateCompatibility(inheritDesc, desc);

        desc = extractDescriptors(
            class Test {
                test() {}
            },
            true,
            { test: { 'return->': 'generator' } }
        ).get(0);

        validateCompatibility(desc, inheritDesc);
        validateCompatibility(inheritDesc, desc);

        desc = extractDescriptors(
            class Test {
                test() {}
            },
            true,
            { test: { 'return->[]': 'string' } }
        ).get(0);

        validateCompatibility(desc, inheritDesc);

        expect(() => {
            validateCompatibility(inheritDesc, desc);
        }).toThrowError(SyntaxExtenderValidateCompatibilityNotCompatibleError);

        inheritDesc = extractDescriptors(
            class Test2 {
                test() {}
            },
            true,
            { test: { return: 'string' } }
        ).get(0);

        desc = extractDescriptors(
            class Test {
                async *test() {}
            },
            true,
            {}
        ).get(0);

        expect(() => {
            validateCompatibility(desc, inheritDesc);
        }).toThrowError(SyntaxExtenderValidateCompatibilityNotCompatibleError);
        expect(() => {
            validateCompatibility(inheritDesc, desc);
        }).toThrowError(SyntaxExtenderValidateCompatibilityNotCompatibleError);

        desc = extractDescriptors(
            class Test {
                test() {}
            },
            true,
            { test: { return: 'generator' } }
        ).get(0);

        expect(() => {
            validateCompatibility(desc, inheritDesc);
        }).toThrowError(SyntaxExtenderValidateCompatibilityNotCompatibleError);
        expect(() => {
            validateCompatibility(inheritDesc, desc);
        }).toThrowError(SyntaxExtenderValidateCompatibilityNotCompatibleError);

        desc = extractDescriptors(
            class Test {
                test() {}
            },
            true,
            { test: { 'return->[]': 'string' } }
        ).get(0);

        expect(() => {
            validateCompatibility(desc, inheritDesc);
        }).toThrowError(SyntaxExtenderValidateCompatibilityNotCompatibleError);
        expect(() => {
            validateCompatibility(inheritDesc, desc);
        }).toThrowError(SyntaxExtenderValidateCompatibilityNotCompatibleError);

        inheritDesc = extractDescriptors(
            class Test2 {
                test() {}
            },
            true,
            {}
        ).get(0);

        desc = extractDescriptors(
            class Test {
                async *test() {}
            },
            true,
            {}
        ).get(0);

        validateCompatibility(desc, inheritDesc);
        expect(() => {
            validateCompatibility(inheritDesc, desc);
        }).toThrowError(SyntaxExtenderValidateCompatibilityNotCompatibleError);

        desc = extractDescriptors(
            class Test {
                test() {}
            },
            true,
            { test: { return: 'generator' } }
        ).get(0);

        validateCompatibility(desc, inheritDesc);
        expect(() => {
            validateCompatibility(inheritDesc, desc);
        }).toThrowError(SyntaxExtenderValidateCompatibilityNotCompatibleError);

        desc = extractDescriptors(
            class Test {
                test() {}
            },
            true,
            { test: { 'return->[]': 'string' } }
        ).get(0);

        validateCompatibility(desc, inheritDesc);
        expect(() => {
            validateCompatibility(inheritDesc, desc);
        }).toThrowError(SyntaxExtenderValidateCompatibilityNotCompatibleError);

        desc = extractDescriptors(
            class Test {
                test() {}
            },
            true,
            { test: { 'return->[]': 'array' } }
        ).get(0);

        validateCompatibility(desc, inheritDesc);
        expect(() => {
            validateCompatibility(inheritDesc, desc);
        }).toThrowError(SyntaxExtenderValidateCompatibilityNotCompatibleError);
    });
};
