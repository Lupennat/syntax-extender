'use strict';

const TestAccessInterceptor = require('syntax-extender/tests/interceptor/test-access-interceptor');

class TestAccessExtendedInterceptor extends TestAccessInterceptor {
    static extPublicFn(...args) {
        return this._protectedFn(...args);
    }

    static get extPublicGetter() {
        return this._protectedGetter;
    }
}

module.exports = TestAccessExtendedInterceptor;
module.exports.__access = true;
