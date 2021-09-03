'use strict';

const { UUID, IMPLEMENTS, DEFINE } = require('../../core/constants');

const { getMetadata } = require('../../core/metadata');

const toAbstract = require('../../core/to-abstract');
const toInterface = require('../../core/to-interface');

const SyntaxExtenderNativeConstructorError = require('../../errors/syntax-extender-native-constructor-error');
const SyntaxExtenderRunningError = require('../../errors/syntax-extender-running-error');
const SyntaxExtenderExtractDescriptorsAbstractCanNotContainsBodyError = require('../../errors/extract-descriptors/syntax-extender-extract-descriptors-abstract-can-not-contains-body-error');
const SyntaxExtenderExtractDescriptorsAbstractPropertiesError = require('../../errors/extract-descriptors/syntax-extender-extract-descriptors-abstract-properties-error');
const SyntaxExtenderAbstractCollisionError = require('../../errors/syntax-extender-abstract-collision-error');
const SyntaxExtenderNotValidArgumentError = require('../../errors/syntax-extender-not-valid-argument-error');

module.exports = () => {
    it('works abstracts must be a class', function () {
        const ConstrFn = function () {};
        expect(() => {
            toAbstract(ConstrFn);
        }).toThrowError(SyntaxExtenderNotValidArgumentError);
    });

    it('works abstract can not use native constructor', function () {
        expect(() => {
            toAbstract(
                class Test {
                    constructor() {}
                }
            );
        }).toThrowError(SyntaxExtenderNativeConstructorError);
    });

    it('works abstract uuid definition', function () {
        const Test = toAbstract(class Test {});
        expect(Test[UUID]).toBe(getMetadata(Test).uuid);
    });

    it('works abstract can not be istantiate', function () {
        const Test = toAbstract(class Test {});
        expect(() => {
            new Test();
        }).toThrowError(SyntaxExtenderRunningError);
    });

    it('works class extended abstract can be istantiate', function () {
        const Abstract = toAbstract(class Abstract {});
        class Test extends Abstract {}

        const t = new Test();
        expect(t).toBeInstanceOf(Test);
        expect(t).toBeInstanceOf(Abstract);
    });

    it('works abstract with abstracts', function () {
        expect(() => {
            toAbstract(abs => {
                return class Test {
                    [abs('test')]() {
                        return 'this is body function, forbidden';
                    }
                };
            });
        }).toThrowError(SyntaxExtenderExtractDescriptorsAbstractCanNotContainsBodyError);

        expect(() => {
            toAbstract(abs => {
                return class Test {
                    [abs('test')] = 'prop can not be abstract wrong';
                };
            });
        }).toThrowError(SyntaxExtenderExtractDescriptorsAbstractPropertiesError);

        expect(() => {
            toAbstract(abs => {
                return class Test {
                    static [abs('test')] = 'prop can not be abstract wrong';
                };
            });
        }).toThrowError(SyntaxExtenderExtractDescriptorsAbstractPropertiesError);

        expect(() => {
            toAbstract(abs => {
                return class Test {
                    static [abs('test')]() {}
                    static get [abs('test')]() {}
                    static set [abs('test')](value) {}
                };
            });
        }).toThrowError(SyntaxExtenderAbstractCollisionError);

        expect(() => {
            toAbstract(abs => {
                return class Test {
                    [abs('test')]() {}
                    get [abs('test')]() {}
                    set [abs('test')](value) {}
                };
            });
        }).toThrowError(SyntaxExtenderAbstractCollisionError);
    });

    it('works mixed classes and interfaces inheritance', function () {
        const TestInterface = toInterface(
            class TestInterface {
                test() {}
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

        const t = new Test2();

        expect(() => {
            t.test();
        }).toThrowError(SyntaxExtenderRunningError);

        expect(() => {
            t.test2;
        }).toThrowError(SyntaxExtenderRunningError);

        expect(t).toBeInstanceOf(Test2);
        expect(t).toBeInstanceOf(Abstract);
        expect(t).toBeInstanceOf(Test);
        expect(t).toBeInstanceOf(TestInterface);
        expect(t).not.toBeInstanceOf(Another);
    });

    it('works abstracts methods and accessors can not be called', function () {
        const Abstract = toAbstract(abs => {
            return class Abstract {
                static [abs('testFn')]() {}
                static get [abs('test')]() {}
                static set [abs('test')](value) {}
                [abs('testFn')]() {}
                get [abs('test')]() {}
                set [abs('test')](value) {}
            };
        });

        expect(() => {
            Abstract.testFn();
        }).toThrowError(SyntaxExtenderRunningError);

        expect(() => {
            Abstract.test;
        }).toThrowError(SyntaxExtenderRunningError);

        expect(() => {
            Abstract.test = '';
        }).toThrowError(SyntaxExtenderRunningError);

        // normal class do not validate abstracts methods and accessors
        // we want to be sure that abstracts methods always throw errror
        class Test extends Abstract {}

        const t = new Test();

        expect(() => {
            Test.testFn();
        }).toThrowError(SyntaxExtenderRunningError);

        expect(() => {
            Test.test;
        }).toThrowError(SyntaxExtenderRunningError);

        expect(() => {
            Test.test = '';
        }).toThrowError(SyntaxExtenderRunningError);

        expect(() => {
            t.testFn();
        }).toThrowError(SyntaxExtenderRunningError);

        expect(() => {
            t.test;
        }).toThrowError(SyntaxExtenderRunningError);

        expect(() => {
            t.test = '';
        }).toThrowError(SyntaxExtenderRunningError);
    });

    it('works abstracts magic __implements', function () {
        const ExtendedInterface = toInterface(
            class ExtendedInterface {
                static test = 'test';
            }
        );
        const ExtendedInterface2 = toInterface(class ExtendedInterface2 {});
        const TestAbstract = toAbstract(
            class TestAbstract {
                static [IMPLEMENTS] = ExtendedInterface;
            }
        );

        let metadata = getMetadata(TestAbstract);

        expect(metadata.interfaces).toEqual([ExtendedInterface[UUID]]);

        const TestAbstract2 = toAbstract(
            class TestAbstract2 {
                static [IMPLEMENTS] = [ExtendedInterface, ExtendedInterface2];
            }
        );

        metadata = getMetadata(TestAbstract2);
        expect(metadata.interfaces).toEqual([ExtendedInterface2[UUID], ExtendedInterface[UUID]]);
    });

    it('works interfaces constants inheritance', function () {
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

        expect(TestAbstract.test).toEqual('test');
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

        class Test extends TestAbstract {}

        const t = new Test();

        expect(t).toBeInstanceOf(ExtendedInterface);
    });

    it('works abstract should not implements all interfaces methods', function () {
        const ExtendedInterface = toInterface(
            class ExtendedInterface {
                static test() {}
                static test2() {}
                test() {}
                test2() {}
            }
        );

        const TestAbstract = toAbstract(
            class TestAbstract {
                static [IMPLEMENTS] = ExtendedInterface;
                static test2() {
                    return 'test2';
                }
                test2() {
                    return 'test2';
                }
            }
        );

        expect(() => {
            TestAbstract.test();
        }).toThrowError(SyntaxExtenderRunningError);
        expect(TestAbstract.test2()).toBe('test2');

        class Test extends TestAbstract {}

        const t = new Test();

        expect(() => {
            t.test();
        }).toThrowError(SyntaxExtenderRunningError);
        expect(t.test2()).toBe('test2');
    });

    it('works abstracts magic __define', function () {
        class Custom {}

        let TestAbstract = toAbstract(
            class TestAbstract {
                static [DEFINE] = {
                    test: { 1: Custom, 2: 'array' }
                };

                test(first, second) {
                    return [first, second];
                }
            }
        );

        let metadata = getMetadata(TestAbstract);

        expect(metadata.get('method', 'test').parameters.get(0).type).toBe('Custom');
        expect(metadata.get('method', 'test').parameters.get(0).source).toEqual(Custom);
        expect(metadata.get('method', 'test').parameters.get(0).isBuiltin).toBeFalsy();
        expect(metadata.get('method', 'test').parameters.get(1).type).toBe('array');
        expect(metadata.get('method', 'test').parameters.get(1).isBuiltin).toBeTruthy();

        class Test extends TestAbstract {}

        const t = new Test();
        expect(() => {
            t.test();
        }).toThrowError(SyntaxExtenderRunningError);
        expect(() => {
            t.test('a');
        }).toThrowError(SyntaxExtenderRunningError);
        expect(() => {
            t.test([], 1);
        }).toThrowError(SyntaxExtenderRunningError);

        expect(t.test(new Custom(), [1, 2])).toEqual([new Custom(), [1, 2]]);

        const FnConstr = function () {};

        TestAbstract = toAbstract(
            class TestAbstract {
                static [DEFINE] = {
                    'static:test': { 1: FnConstr, 2: 'array' }
                };

                static test(first, second) {
                    return [first, second];
                }
            }
        );

        metadata = getMetadata(TestAbstract);

        expect(metadata.get('method', 'static:test').parameters.get(0).type).toBe('FnConstr');
        expect(metadata.get('method', 'static:test').parameters.get(0).source).toEqual(FnConstr);
        expect(metadata.get('method', 'static:test').parameters.get(0).isBuiltin).toBeFalsy();
        expect(metadata.get('method', 'static:test').parameters.get(1).type).toBe('array');
        expect(metadata.get('method', 'static:test').parameters.get(1).isBuiltin).toBeTruthy();

        class Test2 extends TestAbstract {}

        expect(() => {
            Test2.test();
        }).toThrowError(SyntaxExtenderRunningError);
        expect(() => {
            Test2.test('a');
        }).toThrowError(SyntaxExtenderRunningError);
        expect(() => {
            Test2.test([], 1);
        }).toThrowError(SyntaxExtenderRunningError);

        expect(Test2.test(new FnConstr(), [1, 2])).toEqual([new FnConstr(), [1, 2]]);
    });
};
