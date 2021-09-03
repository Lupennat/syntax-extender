'use strict';

const extractInherited = require('../../core/extract-inherited');

const SyntaxExtenderNotValidArgumentError = require('../../errors/syntax-extender-not-valid-argument-error');

module.exports = () => {
    it('works arguments validation', function () {
        expect(extractInherited(function () {})).toEqual(null);
        expect(() => {
            extractInherited([]);
        }).toThrowError(SyntaxExtenderNotValidArgumentError);
        expect(() => {
            extractInherited({});
        }).toThrowError(SyntaxExtenderNotValidArgumentError);
    });

    it('works inheritance extraction', function () {
        class Test1 {
            test1() {}
        }
        class Test2 extends Test1 {
            test2() {}
        }
        class Test3 extends Test2 {
            test3() {}
        }
        class Test4 extends Test3 {
            test4() {}
        }
        expect(extractInherited(Test1)).toEqual(null);
        expect(extractInherited(Test2)).toEqual(Test1);
        expect(extractInherited(Test3)).toEqual(Test2);
        expect(extractInherited(Test4)).toEqual(Test3);
        function ConstrFn1() {}
        ConstrFn1.prototype.test1 = () => {};
        function ConstrFn2() {}
        ConstrFn2.prototype = Object.create(ConstrFn1.prototype);
        ConstrFn2.prototype.constructor = ConstrFn2;
        ConstrFn2.prototype.test2 = () => {};
        // Constructor Function inheritance is uncatchable
        expect(extractInherited(ConstrFn1)).toEqual(null);
        expect(extractInherited(ConstrFn2)).toEqual(null);
    });

    it('works inheritance extraction without BuiltinClass', function () {
        class Test1 extends Array {
            test1() {}
        }
        class Test2 extends Test1 {
            test2() {}
        }
        class Test3 extends Test2 {
            test3() {}
        }
        class Test4 extends Test3 {
            test4() {}
        }
        expect(extractInherited(Test1)).toEqual(null);
        expect(extractInherited(Test2)).toEqual(Test1);
        expect(extractInherited(Test3)).toEqual(Test2);
        expect(extractInherited(Test4)).toEqual(Test3);
    });
};
