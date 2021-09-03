'use strict';

const TestAbstractInterceptor = require('./test-abstract-interceptor');
const TestInterfaceInterceptor = require('./test-interface-interceptor');

class TestBaseInterceptor extends TestAbstractInterceptor {
    async test(param = null) {}
    get abstrGet() {}
    abstrFn(uno, due, tre = null) {}
}

module.exports = TestBaseInterceptor;
module.exports.__implements = TestInterfaceInterceptor;
module.exports.__define = { test: { 'return?>': 'array' } };
