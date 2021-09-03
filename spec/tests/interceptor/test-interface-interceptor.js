'use strict';

class TestInterfaceInterceptor {
    test() {}
}

module.exports = TestInterfaceInterceptor;
module.exports.__interface = true;
module.exports.__define = { test: { 'return?>': 'array' } };
