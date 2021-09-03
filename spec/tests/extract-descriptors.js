'use strict';

const { GETTER, SETTER, METHOD, PROPERTY, PROTECTED, PUBLIC, PRIVATE } = require('../../core/constants');

const { setSedefEnv } = require('../../core/utils');

const extractDescriptors = require('../../core/extract-descriptors');

const Descriptor = require('../../core/models/descriptor');
const Descriptors = require('../../core/models/descriptors');

const SyntaxExtenderNotValidArgumentError = require('../../errors/syntax-extender-not-valid-argument-error');
const SyntaxExtenderExtractDescriptorsAbstractNotFoundError = require('../../errors/extract-descriptors/syntax-extender-extract-descriptors-abstract-not-found-error');
const SyntaxExtenderExtractDescriptorsDefinitionsMismatchError = require('../../errors/extract-descriptors/syntax-extender-extract-descriptors-definitions-mismatch-error');
const SyntaxExtenderExtractDescriptorsAbstractPropertiesError = require('../../errors/extract-descriptors/syntax-extender-extract-descriptors-abstract-properties-error');
const SyntaxExtenderExtractDescriptorsAbstractCanNotContainsBodyError = require('../../errors/extract-descriptors/syntax-extender-extract-descriptors-abstract-can-not-contains-body-error');
const SyntaxExtenderExtractDescriptorsAbstractNotAbstractCollisionError = require('../../errors/extract-descriptors/syntax-extender-extract-descriptors-abstract-not-abstract-collision-error');
const SyntaxExtenderExtractDescriptorsAbstractAbstractCollisionError = require('../../errors/extract-descriptors/syntax-extender-extract-descriptors-abstract-abstract-collision-error');
const SyntaxExtenderExtractReturnAsyncDefinitionError = require('../../errors/extract-return/syntax-extender-extract-return-async-definition-error');
const SyntaxExtenderExtractReturnIterableDefinitionError = require('../../errors/extract-return/syntax-extender-extract-return-iterable-definition-error');
const SyntaxExtenderExtractReturnAsyncIterableDefinitionError = require('../../errors/extract-return/syntax-extender-extract-return-async-iterable-definition-error');

module.exports = () => {
    it('works arguments validation', function () {
        class Test {}
        function ConstrFn() {}
        expect(extractDescriptors(Test)).toBeInstanceOf(Descriptors);
        expect(extractDescriptors(Test).size()).toBe(0);
        expect(extractDescriptors(ConstrFn).size()).toBe(0);
        expect(extractDescriptors(Test, true).size()).toBe(0);
        expect(extractDescriptors(Test, false).size()).toBe(0);
        expect(extractDescriptors(Test, false, {}).size()).toBe(0);
        expect(extractDescriptors(Test, false, {}, {}).size()).toBe(0);
        expect(extractDescriptors(Test, false, {}, {}, true).size()).toBe(0);
        expect(extractDescriptors(Test, false, {}, {}, false).size()).toBe(0);
        expect(extractDescriptors(Test, false, {}, {}, false, null).size()).toBe(0);
        expect(extractDescriptors(Test, false, {}, {}, false, () => {})).toBe(undefined);
        expect(extractDescriptors(Test, false, {}, {}, false, null, __filename).size()).toBe(0);
        expect(() => {
            extractDescriptors(() => {});
        }).toThrowError(SyntaxExtenderNotValidArgumentError);
        expect(() => {
            extractDescriptors([]);
        }).toThrowError(SyntaxExtenderNotValidArgumentError);
        expect(() => {
            extractDescriptors(Object.create(Test));
        }).toThrowError(SyntaxExtenderNotValidArgumentError);
        expect(() => {
            extractDescriptors(Object.create(ConstrFn));
        }).toThrowError(SyntaxExtenderNotValidArgumentError);
        expect(() => {
            extractDescriptors('test');
        }).toThrowError(SyntaxExtenderNotValidArgumentError);
        expect(() => {
            extractDescriptors(Test, null);
        }).toThrowError(SyntaxExtenderNotValidArgumentError);
        expect(() => {
            extractDescriptors(Test, false, []);
        }).toThrowError(SyntaxExtenderNotValidArgumentError);
        expect(() => {
            extractDescriptors(Test, false, {}, []);
        }).toThrowError(SyntaxExtenderNotValidArgumentError);
        expect(() => {
            extractDescriptors(Test, false, {}, {}, null);
        }).toThrowError(SyntaxExtenderNotValidArgumentError);
        expect(() => {
            extractDescriptors(Test, false, {}, {}, false, {});
        }).toThrowError(SyntaxExtenderNotValidArgumentError);
        expect(() => {
            extractDescriptors(Test, false, {}, {}, false, null, {});
        }).toThrowError(SyntaxExtenderNotValidArgumentError);
    });

    it('works descriptors extract safe', function () {
        class Test {
            prop;
        }
        expect(extractDescriptors(Test).size()).toBe(0);
        expect(extractDescriptors(Test, false).size()).toBe(1);
        class TestError {
            constructor() {
                throw new Error('this is not safe');
            }
        }
        expect(extractDescriptors(TestError).size()).toBe(0);
        expect(() => {
            extractDescriptors(TestError, false);
        }).toThrowError('this is not safe');
    });

    it('works descriptors definitions', function () {
        class Test {
            fn(test) {}
        }

        let descriptor = extractDescriptors(Test, true, { fn: { 1: 'string|boolean|integer', return: 'string' } });
        expect(descriptor.get(0).parameters.get(0).type).toBe('string|boolean|integer');
        expect(descriptor.get(0).return.type).toBe('string');

        class TestStatic {
            static fn(test) {}
        }

        descriptor = extractDescriptors(TestStatic, true, { 'static:fn': { 1: 'string', return: 'string' } });
        expect(descriptor.get(0).parameters.get(0).type).toBe('string');
        expect(descriptor.get(0).return.type).toBe('string');

        class Custom {}

        class Test2 {
            fn(test) {}
            async fnAsync(test) {}
            *generator(test) {}
            async *asyncGenerator(test) {}
        }

        descriptor = extractDescriptors(Test2, true, { fn: { '?return': Custom } });
        expect(descriptor.get(0).return.type).toBe('Custom');
        expect(descriptor.get(0).return.isNullable).toBe(true);

        descriptor = extractDescriptors(Test2, true, { fn: { return: Custom } });
        expect(descriptor.get(0).return.type).toBe('Custom');
        expect(descriptor.get(0).return.isNullable).toBe(false);

        expect(() => {
            extractDescriptors(Test2, true, { fnAsync: { return: Custom } });
        }).toThrowError(SyntaxExtenderExtractReturnAsyncDefinitionError);

        expect(() => {
            extractDescriptors(Test2, true, { generator: { return: Custom } });
        }).toThrowError(SyntaxExtenderExtractReturnIterableDefinitionError);

        expect(() => {
            extractDescriptors(Test2, true, { asyncGenerator: { return: Custom } });
        }).toThrowError(SyntaxExtenderExtractReturnAsyncDefinitionError);

        expect(() => {
            extractDescriptors(Test2, true, { asyncGenerator: { 'return->': Custom } });
        }).toThrowError(SyntaxExtenderExtractReturnAsyncIterableDefinitionError);

        descriptor = extractDescriptors(Test2, true, {});
        expect(descriptor.get(1).return.type).toBe('promise');
        expect(descriptor.get(1).return.isBuiltin).toBe(true);
        expect(descriptor.get(2).return.type).toBe('generator');
        expect(descriptor.get(2).return.isBuiltin).toBe(true);
        expect(descriptor.get(3).return.type).toBe('generator');
        expect(descriptor.get(3).return.isBuiltin).toBe(true);

        descriptor = extractDescriptors(Test2, true, { fnAsync: { 'return->': Custom } });
        expect(descriptor.get(1).return.type).toBe('Custom');
        expect(descriptor.get(1).return.isBuiltin).toBe(false);
        expect(descriptor.get(1).return.checkPromise).toBe(true);

        descriptor = extractDescriptors(Test2, true, { generator: { 'return[]': Custom } });
        expect(descriptor.get(2).return.type).toBe('Custom');
        expect(descriptor.get(2).return.isBuiltin).toBe(false);
        expect(descriptor.get(2).return.checkPromise).toBe(false);
        expect(descriptor.get(2).return.checkIterable).toBe(true);

        descriptor = extractDescriptors(Test2, true, { asyncGenerator: { 'return->': 'generator' } });
        expect(descriptor.get(3).return.type).toBe('generator');
        expect(descriptor.get(3).return.isBuiltin).toBe(true);
        expect(descriptor.get(3).return.checkPromise).toBe(true);
        expect(descriptor.get(3).return.checkIterable).toBe(false);

        descriptor = extractDescriptors(Test2, true, { asyncGenerator: { 'return->[]': Custom } });
        expect(descriptor.get(3).return.type).toBe('Custom');
        expect(descriptor.get(3).return.isBuiltin).toBe(false);
        expect(descriptor.get(3).return.checkPromise).toBe(true);
        expect(descriptor.get(3).return.checkIterable).toBe(true);
    });

    it('works descriptors definitions must match', function () {
        class Test {
            fn(test) {}
        }

        expect(() => {
            extractDescriptors(Test, true, { 'static:fn': { 1: 'string' } });
        }).toThrowError(SyntaxExtenderExtractDescriptorsDefinitionsMismatchError);

        class TestStatic {
            static fn(test) {}
        }

        expect(() => {
            extractDescriptors(TestStatic, true, { fn: { 1: 'string' } });
        }).toThrowError(SyntaxExtenderExtractDescriptorsDefinitionsMismatchError);
    });

    it('works descriptors abstracts', function () {
        class Test {
            abstractName() {}
            matchName() {}
        }

        const descriptors = extractDescriptors(Test, true, {}, { abstractName: 'realName' });
        expect(descriptors.get(0).isAbstract).toBeTruthy();
        expect(descriptors.get(0).name).toBe('realName');
        expect(descriptors.get(0).originalName).toBe('abstractName');
        expect(descriptors.get(1).isAbstract).toBeFalsy();
        expect(descriptors.get(1).name).toBe('matchName');
        expect(descriptors.get(1).originalName).toBe('matchName');
    });

    it('works descriptors abstracts properties forbidden', function () {
        expect(() => {
            extractDescriptors(
                class Test {
                    static abstractProp;
                },
                true,
                {},
                { abstractProp: 'prop' }
            );
        }).toThrowError(SyntaxExtenderExtractDescriptorsAbstractPropertiesError);
        expect(() => {
            extractDescriptors(
                class Test {
                    abstractProp;
                },
                false,
                {},
                { abstractProp: 'prop' }
            );
        }).toThrowError(SyntaxExtenderExtractDescriptorsAbstractPropertiesError);
    });

    it('works descriptors abstracts must match', function () {
        expect(() => {
            extractDescriptors(
                class Test {
                    static abstractMethod() {}
                },
                true,
                {},
                { method: 'newMethod' }
            );
        }).toThrowError(SyntaxExtenderExtractDescriptorsAbstractNotFoundError);
    });

    it('works abstracts functions can not contains body', function () {
        expect(() => {
            extractDescriptors(
                class Test {
                    static abstractMethod() {
                        return 'this function has body';
                    }
                },
                true,
                {},
                { abstractMethod: 'newMethod' }
            );
        }).toThrowError(SyntaxExtenderExtractDescriptorsAbstractCanNotContainsBodyError);
        expect(
            extractDescriptors(
                class Test {
                    static abstractMethod() {
                        // return 'this function doen't have body';
                    }
                },
                true,
                {},
                { abstractMethod: 'newMethod' }
            ).get(0).name
        ).toBe('newMethod');
    });

    it('works descriptors abstracts name collision', function () {
        expect(() => {
            extractDescriptors(
                class Test {
                    abstractName() {}
                    realName() {}
                },
                true,
                {},
                { abstractName: 'realName' }
            );
        }).toThrowError(SyntaxExtenderExtractDescriptorsAbstractNotAbstractCollisionError);

        expect(() => {
            extractDescriptors(
                class Test {
                    abstractName() {}
                    abstractName2() {}
                },
                true,
                {},
                { abstractName: 'realName', abstractName2: 'realName' }
            );
        }).toThrowError(SyntaxExtenderExtractDescriptorsAbstractAbstractCollisionError);
    });

    it('works descriptors all functions abstracts', function () {
        let descriptors = extractDescriptors(
            class Test {
                name() {}
                set setter(value) {}
                get getter() {}
            },
            true,
            {},
            {},
            true
        );
        expect(descriptors.get(0).isAbstract).toBeTruthy();
        expect(descriptors.get(1).isAbstract).toBeTruthy();
        expect(descriptors.get(2).isAbstract).toBeTruthy();

        expect(() => {
            extractDescriptors(
                class Test {
                    name() {
                        return 'as body';
                    }
                    set setter(value) {}
                    get getter() {}
                },
                true,
                {},
                {},
                true
            );
        }).toThrowError(SyntaxExtenderExtractDescriptorsAbstractCanNotContainsBodyError);

        descriptors = extractDescriptors(
            class Test {
                name() {}
                set setter(value) {}
                get getter() {}
            },
            true,
            {},
            {},
            false
        );

        expect(descriptors.get(0).isAbstract).toBeFalsy();
        expect(descriptors.get(1).isAbstract).toBeFalsy();
        expect(descriptors.get(2).isAbstract).toBeFalsy();
    });

    it('works descriptors callback function', function () {
        const test = {
            callback: descriptor => {}
        };
        const spy = spyOn(test, 'callback');
        spy.and.callFake(descriptor => {
            expect(descriptor).toBeInstanceOf(Descriptor);
        });

        extractDescriptors(
            class Test {
                name() {}
            },
            true,
            {},
            {},
            false,
            test.callback
        );
        expect(spy).toHaveBeenCalledTimes(1);
    });

    it('works descriptors static setters', function () {
        class Test {
            static set setter(name) {}
        }

        const descriptors = extractDescriptors(Test);

        expect(descriptors.get(0).type).toBe(SETTER);
        expect(descriptors.get(0).isStatic).toBeTruthy();
    });

    it('works descriptors setters', function () {
        class Test {
            set setter(name) {}
        }

        const descriptors = extractDescriptors(Test);

        expect(descriptors.get(0).type).toBe(SETTER);
        expect(descriptors.get(0).isStatic).toBeFalsy();
    });

    it('works descriptors static getters', function () {
        class Test {
            static get getter() {}
        }

        const descriptors = extractDescriptors(Test);

        expect(descriptors.get(0).type).toBe(GETTER);
        expect(descriptors.get(0).isStatic).toBeTruthy();
    });

    it('works descriptors getters', function () {
        class Test {
            get getter() {}
        }

        const descriptors = extractDescriptors(Test);

        expect(descriptors.get(0).type).toBe(GETTER);
        expect(descriptors.get(0).isStatic).toBeFalsy();
    });

    it('works descriptors static accessors', function () {
        class Test {
            static get accessor() {}
            static set accessor(value) {}
        }

        const descriptors = extractDescriptors(Test);

        expect(descriptors.get(0).type).toBe(GETTER);
        expect(descriptors.get(0).isStatic).toBeTruthy();
        expect(descriptors.get(1).type).toBe(SETTER);
        expect(descriptors.get(1).isStatic).toBeTruthy();
    });

    it('works descriptors accessors', function () {
        class Test {
            get accessor() {}
            set accessor(value) {}
        }

        const descriptors = extractDescriptors(Test);

        expect(descriptors.get(0).type).toBe(GETTER);
        expect(descriptors.get(0).isStatic).toBeFalsy();
        expect(descriptors.get(1).type).toBe(SETTER);
        expect(descriptors.get(1).isStatic).toBeFalsy();
    });

    it('works descriptors static methods', function () {
        class Test {
            static fn() {}
        }

        const descriptors = extractDescriptors(Test);

        expect(descriptors.get(0).type).toBe(METHOD);
        expect(descriptors.get(0).isStatic).toBeTruthy();
    });

    it('works descriptors methods', function () {
        class Test {
            fn() {}
        }

        const descriptors = extractDescriptors(Test);

        expect(descriptors.get(0).type).toBe(METHOD);
        expect(descriptors.get(0).isStatic).toBeFalsy();
    });

    it('works descriptors static properties', function () {
        class Test {
            static test = 'test';
        }

        const descriptors = extractDescriptors(Test);

        expect(descriptors.get(0).type).toBe(PROPERTY);
        expect(descriptors.get(0).isStatic).toBeTruthy();
        expect(descriptors.get(0).value).toBe('test');
    });

    it('works descriptors properties', function () {
        class Test {
            test = 'test';
        }

        //only when safe false properties can be described
        expect(extractDescriptors(Test, true).size()).toBe(0);

        const descriptors = extractDescriptors(Test, false);

        expect(descriptors.get(0).type).toBe(PROPERTY);
        expect(descriptors.get(0).isStatic).toBeFalsy();
        expect(descriptors.get(0).value).toBe('test');
    });

    it('works descriptor visibility type', function () {
        class Test {
            __private = 'test';
            _protected = 'test';
            public = 'test';
        }

        let descriptors = extractDescriptors(Test, false);

        expect(descriptors.size()).toBe(3);
        expect(descriptors.get(0).type).toBe(PROPERTY);
        expect(descriptors.get(0).isStatic).toBeFalsy();
        expect(descriptors.get(0).visibility).toBe(PRIVATE);
        expect(descriptors.get(1).type).toBe(PROPERTY);
        expect(descriptors.get(1).isStatic).toBeFalsy();
        expect(descriptors.get(1).visibility).toBe(PROTECTED);
        expect(descriptors.get(2).type).toBe(PROPERTY);
        expect(descriptors.get(2).isStatic).toBeFalsy();
        expect(descriptors.get(2).visibility).toBe(PUBLIC);
    });
};
