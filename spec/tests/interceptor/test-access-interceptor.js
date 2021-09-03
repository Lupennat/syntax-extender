'use strict';

class TestAccessInterceptor {
    static _protectedProperty = '_protectedProperty';

    static _protectedFn(...args) {
        return 'TestAccessInterceptor._testProtected' + args.join(' ');
    }

    static get _protectedGetter() {
        return TestAccessInterceptor._protectedProperty;
    }

    static set _protectedSetter(value) {
        TestAccessInterceptor._protectedProperty = value;
    }

    static publicFn(...args) {
        return TestAccessInterceptor._protectedFn(...args);
    }

    static get publicGetter() {
        return TestAccessInterceptor._protectedGetter;
    }

    static set publicSetter(value) {
        TestAccessInterceptor._protectedSetter = value;
    }
}

module.exports = TestAccessInterceptor;
module.exports.__access = true;
