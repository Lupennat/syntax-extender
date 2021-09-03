'use strict';

const abs = require('../../../core/abs');

const a = abs.create();

class TestAbstractInterceptor {
    get [a.map('abstrGet')]() {}
    [a.map('abstrFn')](uno, due) {}
}

module.exports = TestAbstractInterceptor;
module.exports.__abstract = true;
module.exports.__abstracts = a.all();
