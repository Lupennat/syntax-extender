'use strict';

const { CONSTRUCT, GET, STATICGET, SET, STATICSET, DELETE, HAS } = require('../../core/constants');

const { withBindingScope } = require('../../core/utils');

const toClass = require('../../core/to-class');
const toAbstract = require('../../core/to-abstract');

const SyntaxExtenderGenerateProxyMagicAndPrivatesError = require('../../errors/generate-proxy/syntax-extender-generate-proxy-magic-and-privates-error');
const SyntaxExtenderGenerateProxyMagicAndInheritedPrivatesError = require('../../errors/generate-proxy/syntax-extender-generate-proxy-magic-and-inherited-privates-error');

module.exports = () => {
    it('works magic __construct', function () {
        const Abstract = toAbstract(abs => {
            return class Abstract {
                static prop = false;
                [CONSTRUCT]() {
                    Abstract.prop = true;
                }
            };
        });
        class Test extends Abstract {
            constructor() {
                super();
            }
        }
        expect(Test.prop).toBeFalsy();
        new Test();
        expect(Test.prop).toBeTruthy();

        const Test2 = toClass(class Test2 extends Abstract {});
        expect(Test2.prop).toBeTruthy();
        new Test2();
        expect(Test2.prop).toBeTruthy();

        const Test3 = toClass(
            class Test3 extends Abstract {
                static prop = false;
                [CONSTRUCT]() {
                    Test3.prop = true;
                }
            }
        );

        expect(Test3.prop).toBeFalsy();
        new Test3();
        expect(Test3.prop).toBeTruthy();
    });

    it('works magic __construct parent call order', function () {
        const Abstract = toAbstract(abs => {
            return class Abstract {
                prop = '';
                [CONSTRUCT](prop) {
                    this.prop = `parent:${prop}`;
                }
            };
        });

        const Test = toClass(
            class Test extends Abstract {
                [CONSTRUCT](prop) {
                    super[CONSTRUCT](prop);
                    this.prop = prop;
                }
            }
        );

        const t = new Test('test');
        expect(t.prop).toBe('test');

        const Test2 = toClass(
            class Test2 extends Abstract {
                [CONSTRUCT](prop) {
                    this.prop = prop;
                    super[CONSTRUCT](prop);
                }
            }
        );

        const t2 = new Test2('test');
        expect(t2.prop).toBe('parent:test');
    });

    it('works magic __construct should not be called', function () {
        const Abstract = toAbstract(abs => {
            return class Abstract {
                [CONSTRUCT](prop) {
                    throw new Error('should not be called');
                }
            };
        });

        const Test = toClass(
            class Test extends Abstract {
                [CONSTRUCT](prop) {
                    this.prop = prop;
                }
            }
        );

        const t = new Test('test');
        expect(t.prop).toBe('test');
    });

    it('works class magic __construct native inheritance', function () {
        class TestInherit {
            prop = '';
            constructor(prop) {
                this.prop = prop;
            }
        }

        const Test = toClass(
            class Test extends TestInherit {
                __construct(prop) {
                    this.prop = prop + 'test';
                }
                test() {
                    return this.prop;
                }
            }
        );

        const t = new Test('proof');
        expect(t.test()).toBe('prooftest');
    });

    it('works magic __getStatic', function () {
        const Abstract = toAbstract(abs => {
            return class Abstract {
                static [STATICGET](name) {
                    if (name.startsWith('fn')) {
                        return (...args) => {
                            return `abstract magic call ${args.join(', ')}`;
                        };
                    }
                    return `abstract magic get ${name}`;
                }
                static test() {
                    return 'test';
                }
            };
        });
        class Test extends Abstract {}
        expect(Test.test()).toBe('test');

        expect(Test.test2).toBe(`abstract magic get test2`);
        expect(Test.fnTest2('a', 'b')).toBe(`abstract magic call a, b`);

        const Test2 = toClass(
            class Test2 extends Abstract {
                static [STATICGET](name) {
                    if (name.startsWith('fn')) {
                        return (...args) => {
                            return `test2 magic call ${args.join(', ')}`;
                        };
                    }
                    return `test2 magic get ${name}`;
                }
            }
        );
        expect(Test2.test()).toBe('test');

        expect(Test2.test3).toBe(`test2 magic get test3`);
        expect(Test2.fnTest3('a', 'b')).toBe(`test2 magic call a, b`);

        const Test3 = toClass(
            class Test3 extends Abstract {
                static [STATICGET](name) {
                    return super[STATICGET](name);
                }
            }
        );
        expect(Test3.test()).toBe('test');

        expect(Test3.test4).toBe(`abstract magic get test4`);
        expect(Test3.fnTest4('a', 'b')).toBe(`abstract magic call a, b`);
    });

    it('works magic __getStatic scope', function () {
        class RedisFake {
            get(name) {
                return this[name];
            }

            set(name, value) {
                this[name] = value;
            }
        }
        const Facade = toAbstract(
            class Facade {
                static _app = {
                    redis: new RedisFake()
                };
                static _resolvedInstance = {};

                static getFacadeRoot() {
                    return this.resolveFacadeInstance(this.getFacadeAccessor());
                }

                static getFacadeAccessor() {
                    throw new Error(`Facade '${this.name}' does not implement 'getFacadeAccessor' method.`);
                }

                static resolveFacadeInstance(name) {
                    if (typeof name !== 'string' && typeof name !== 'function') {
                        return name;
                    }

                    if (name in this._resolvedInstance) {
                        return this._resolvedInstance[name];
                    }

                    if (this._app) {
                        return (this._resolvedInstance[name] = this._app[name]);
                    }
                }

                static [STATICGET](method) {
                    const instance = this.getFacadeRoot();

                    if (!instance) {
                        throw new Error('A facade root has not been set.');
                    }

                    // please be very careful with scopes you need to bind function to specific context
                    // otherwise internal "this" scope will not match
                    return withBindingScope(instance, method);
                }
            }
        );

        const Redis = toClass(
            class Redis extends Facade {
                static getFacadeAccessor() {
                    return 'redis';
                }
            }
        );

        Redis.set('test', '1.2.3');
        expect(Redis.get('test')).toBe('1.2.3');
    });

    it('works magic __setStatic', function () {
        const Abstract = toAbstract(abs => {
            return class Abstract {
                static test = 'test';
                static [STATICSET](name, value) {
                    this[name] = value;
                }
            };
        });
        class Test extends Abstract {}
        expect(Test.test).toBe('test');
        Test.test = 'test2';
        expect(Test.test).toBe('test2');
        expect(Test.test2).toEqual(undefined);
        Test.test2 = 'test3';
        expect(Test.test2).toBe('test3');

        const Test2 = toClass(
            class Test2 extends Abstract {
                static test = 'test';
                static [STATICSET](name, value) {
                    this[name] = value;
                }
            }
        );
        expect(Test2.test).toBe('test');
        Test2.test = 'test2';
        expect(Test2.test).toBe('test2');
        expect(Test2.test2).toEqual(undefined);
        Test2.test2 = 'test3';
        expect(Test2.test2).toBe('test3');

        const Test3 = toClass(
            class Test3 extends Abstract {
                static [STATICSET](name, value) {
                    super[STATICSET](name, value);
                }
            }
        );
        expect(Test3.test).toBe('test');
        Test3.test = 'test2';
        expect(Test3.test).toBe('test2');
        expect(Test3.test2).toEqual(undefined);
        Test3.test2 = 'test3';
        expect(Test3.test2).toBe('test3');
    });

    it('works static private members and functions never raise an error if scope is right', function () {
        const Test = toClass(
            class Test {
                static #prop = 'this is private prop';

                [CONSTRUCT]() {}
                [GET](name) {}
                [SET](name, value) {}
                [HAS](name) {}
                [DELETE](name) {}
                static [STATICSET](name, value) {}
                static [STATICGET](name) {}

                static get prop() {
                    return Test.#prop;
                }

                static #testPrivate() {
                    return 'this is private fn';
                }

                static test() {
                    return Test.#testPrivate();
                }

                test() {
                    return Test.#testPrivate();
                }

                get prop() {
                    return Test.#prop;
                }
            }
        );

        expect(Test.prop).toBe('this is private prop');
        expect(Test.test()).toBe('this is private fn');
        let t = new Test();
        expect(t.prop).toBe('this is private prop');
        expect(t.test()).toBe('this is private fn');
    });

    it('works private members and functions raise an error when magicMethods defined on prototype', function () {
        const Test = toClass(
            class Test {
                #prop = 'this is private prop';

                [CONSTRUCT]() {}

                get prop() {
                    return this.#prop;
                }

                #testPrivate() {
                    return 'this is private fn';
                }

                test() {
                    return this.#testPrivate();
                }
                static [STATICSET](name, value) {}
                static [STATICGET](name) {}
            }
        );

        let t = new Test();
        expect(t.prop).toBe('this is private prop');
        expect(t.test()).toBe('this is private fn');

        expect(() => {
            toClass(
                class Test2 {
                    #prop = 'this is private prop';

                    get prop() {
                        return this.#prop;
                    }

                    #testPrivate() {
                        return 'this is private fn';
                    }

                    test() {
                        return this.#testPrivate();
                    }

                    [GET](name) {}
                }
            );
        }).toThrowError(SyntaxExtenderGenerateProxyMagicAndPrivatesError);

        class Inherited {
            #prop = 'test';
            get prop() {
                return this.#prop;
            }
        }

        expect(() => {
            toClass(
                class Test3 extends Inherited {
                    [GET](name) {}
                }
            );
        }).toThrowError(SyntaxExtenderGenerateProxyMagicAndInheritedPrivatesError);

        // quick workaround create a normal class with native private
        // and extends a class with magic methods
        const Test4 = toClass(
            class Test4 {
                [GET](name) {
                    return name;
                }
            }
        );

        class Test5 extends Test4 {
            #prop = 'this is private prop';

            get prop() {
                return this.#prop;
            }

            #testPrivate() {
                return 'this is private fn';
            }

            test() {
                return this.#testPrivate();
            }
        }

        t = new Test5();

        expect(t.prop).toBe('this is private prop');
        expect(t.test()).toBe('this is private fn');
        expect(t.notDefinedProp).toBe('notDefinedProp');

        // quick workaround use symbols
        // symbols is not a real private
        const prop = Symbol('prop');
        const method = Symbol('method');
        const Test6 = toClass(
            class Test6 {
                [prop] = 'this is private prop';

                get prop() {
                    return this[prop];
                }

                [method]() {
                    return 'this is private fn';
                }

                test() {
                    return this[method]();
                }
                [GET](name) {
                    return name;
                }
            }
        );

        t = new Test6();

        expect(t.prop).toBe('this is private prop');
        expect(t.test()).toBe('this is private fn');
        expect(t.notDefinedProp).toBe('notDefinedProp');
    });

    it('works magic __get', function () {
        const Abstract = toAbstract(abs => {
            return class Abstract {
                [GET](name) {
                    if (name.startsWith('fn')) {
                        return (...args) => {
                            return `abstract magic call ${args.join(', ')}`;
                        };
                    }
                    return `abstract magic get ${name}`;
                }
                test() {
                    return 'test';
                }
            };
        });
        class Test extends Abstract {}
        let t = new Test();

        expect(t.test()).toBe('test');

        expect(t.test2).toBe(`abstract magic get test2`);
        expect(t.fnTest2('a', 'b')).toBe(`abstract magic call a, b`);

        const Test2 = toClass(
            class Test2 extends Abstract {
                [GET](name) {
                    if (name.startsWith('fn')) {
                        return (...args) => {
                            return `test2 magic call ${args.join(', ')}`;
                        };
                    }
                    return `test2 magic get ${name}`;
                }
            }
        );

        t = new Test2();
        expect(t.test()).toBe('test');

        expect(t.test3).toBe(`test2 magic get test3`);
        expect(t.fnTest3('a', 'b')).toBe(`test2 magic call a, b`);

        const Test3 = toClass(
            class Test3 extends Abstract {
                [GET](name) {
                    return super[GET](name);
                }
            }
        );

        t = new Test3();
        expect(t.test()).toBe('test');

        expect(t.test4).toBe(`abstract magic get test4`);
        expect(t.fnTest4('a', 'b')).toBe(`abstract magic call a, b`);
    });

    it('works magic __set', function () {
        const Abstract = toAbstract(abs => {
            return class Abstract {
                test = 'test';
                [SET](name, value) {
                    this[name] = value;
                }
            };
        });
        class Test extends Abstract {}
        let t = new Test();
        expect(t.test).toBe('test');
        t.test = 'test2';
        expect(t.test).toBe('test2');
        expect(t.test2).toEqual(undefined);
        t.test2 = 'test3';
        expect(t.test2).toBe('test3');

        const Test2 = toClass(
            class Test2 extends Abstract {
                test = 'test';
                [SET](name, value) {
                    this[name] = value;
                }
            }
        );
        t = new Test2();
        expect(t.test).toBe('test');
        t.test = 'test2';
        expect(t.test).toBe('test2');
        expect(t.test2).toEqual(undefined);
        t.test2 = 'test3';
        expect(t.test2).toBe('test3');

        const Test3 = toClass(
            class Test3 extends Abstract {
                [SET](name, value) {
                    super[SET](name, value);
                }
            }
        );
        t = new Test3();
        expect(t.test).toBe('test');
        t.test = 'test2';
        expect(t.test).toBe('test2');
        expect(t.test2).toEqual(undefined);
        t.test2 = 'test3';
        expect(t.test2).toBe('test3');
    });

    it('works magic __has', function () {
        const Abstract = toAbstract(abs => {
            return class Abstract {
                test = 'test';
                [HAS](name) {
                    if (name === 'test2') {
                        return true;
                    } else {
                        return false;
                    }
                }
            };
        });
        class Test extends Abstract {}
        let t = new Test();
        expect('test' in t).toBeTruthy();
        expect('test2' in t).toBeTruthy();
        expect('test3' in t).toBeFalsy();
        const Test2 = toClass(
            class Test2 extends Abstract {
                test = 'test';
                [HAS](name) {
                    if (name === 'test2') {
                        return true;
                    } else {
                        return false;
                    }
                }
            }
        );
        t = new Test2();
        expect('test' in t).toBeTruthy();
        expect('test2' in t).toBeTruthy();
        expect('test3' in t).toBeFalsy();

        const Test3 = toClass(
            class Test3 extends Abstract {
                [HAS](name) {
                    return super[HAS](name);
                }
            }
        );
        t = new Test3();
        expect('test' in t).toBeTruthy();
        expect('test2' in t).toBeTruthy();
        expect('test3' in t).toBeFalsy();
    });

    it('works magic __delete', function () {
        const Abstract = toAbstract(abs => {
            return class Abstract {
                test = 'test';
                test2 = 'test2';
                [DELETE](name) {
                    if (name === 'test3') {
                        delete this.test2;
                    }
                }
            };
        });
        class Test extends Abstract {}
        let t = new Test();
        expect(t.test).toBe('test');
        expect(t.test2).toBe('test2');
        delete t.test;
        expect(t.test).toEqual(undefined);
        delete t.test3;
        expect(t.test2).toEqual(undefined);
        const Test2 = toClass(
            class Test2 extends Abstract {
                test = 'test';
                test2 = 'test2';
                [DELETE](name) {
                    if (name === 'test3') {
                        delete this.test2;
                    }
                }
            }
        );
        t = new Test2();
        expect(t.test).toBe('test');
        expect(t.test2).toBe('test2');
        delete t.test;
        expect(t.test).toEqual(undefined);
        delete t.test3;
        expect(t.test2).toEqual(undefined);

        const Test3 = toClass(
            class Test3 extends Abstract {
                test = 'test';
                test2 = 'test2';
                [DELETE](name) {
                    super[DELETE](name);
                }
            }
        );
        t = new Test3();
        expect(t.test).toBe('test');
        expect(t.test2).toBe('test2');
        delete t.test;
        expect(t.test).toEqual(undefined);
        delete t.test3;
        expect(t.test2).toEqual(undefined);
    });

    it('works magic method __has do not interfer with __get, __set, __delete', function () {
        const Test = toClass(
            class Test {
                test = 'test';

                [GET](name) {
                    return 'magic get';
                }
                [SET](name, value) {
                    this[name] = value;
                }
                [HAS](name) {
                    throw new Error('magic method __has called');
                }
                [DELETE](name) {
                    throw new Error('magic method __delete called');
                }
            }
        );

        const t = new Test();
        expect(t.test).toBe('test');
        t.test = 'test2';
        expect(t.test).toBe('test2');
        delete t.test;
        expect(t.test).toEqual('magic get');
        expect(t.test2).toEqual('magic get');
        t.test2 = 'test';
        expect(t.test2).toBe('test');
        expect(t.test3).toBe('magic get');
        expect(() => {
            delete t.test3;
        }).toThrowError('magic method __delete called');
    });
};
