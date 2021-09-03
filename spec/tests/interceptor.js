'use strict';

const { getMetadata, hasMetadata } = require('../../core/metadata');
const interceptor = require('../../core/interceptor');

const SyntaxExtenderNotValidArgumentError = require('../../errors/syntax-extender-not-valid-argument-error');
const SyntaxExtenderInterceptorInvalidPathError = require('../../errors/interceptor/syntax-extender-interceptor-invalid-path-error');
const SyntaxExtenderInterceptorNotADirectoryError = require('../../errors/interceptor/syntax-extender-interceptor-not-a-directory-error');
const SyntaxExtenderInterceptorAlreadyRegisteredError = require('../../errors/interceptor/syntax-extender-interceptor-already-registered-error');
const SyntaxExtenderInterceptorMissingNamespaceError = require('../../errors/interceptor/syntax-extender-interceptor-missing-namespace-error');

module.exports = () => {
    it('works register namespace', function () {
        expect(() => {
            interceptor.registerNamespace();
        }).toThrowError(SyntaxExtenderNotValidArgumentError);

        expect(() => {
            interceptor.registerNamespace([]);
        }).toThrowError(SyntaxExtenderNotValidArgumentError);

        expect(() => {
            interceptor.registerNamespace('test', []);
        }).toThrowError(SyntaxExtenderNotValidArgumentError);

        expect(() => {
            interceptor.registerNamespace('test', 'path', []);
        }).toThrowError(SyntaxExtenderNotValidArgumentError);

        expect(() => {
            interceptor.registerNamespace('test', 'path', { callback: [] });
        }).toThrowError(SyntaxExtenderNotValidArgumentError);

        expect(() => {
            interceptor.registerNamespace('test', 'path', { features: [] });
        }).toThrowError(SyntaxExtenderNotValidArgumentError);

        expect(() => {
            interceptor.registerNamespace('test', __dirname + '/../not-exists');
        }).toThrowError(SyntaxExtenderInterceptorInvalidPathError);

        expect(() => {
            interceptor.registerNamespace('test', __dirname + '/metadata.js');
        }).toThrowError(SyntaxExtenderInterceptorNotADirectoryError);

        interceptor.registerNamespace('syntax-extender/tests/interceptor', __dirname + '/../tests/interceptor', {
            callback: function (module, info, callback, features) {
                expect(info.moduleId).toBe('syntax-extender/tests/interceptor/test-abstract-interceptor');
                expect(module.__middleware).toBeFalsy();
                expect(getMetadata(module)).toBe(null);
                return callback(module, info, features);
            },
            features: {
                ACCESSIBILITY: true,
                MAGIC: false,
                VALIDATION: false,
                COMMENT: true
            }
        });

        expect(() => {
            interceptor.registerNamespace('syntax-extender/tests/interceptor', __dirname);
        }).toThrowError(SyntaxExtenderInterceptorAlreadyRegisteredError);

        expect(() => {
            interceptor.registerNamespace('new-namespace', __dirname + '/../tests/interceptor');
        }).toThrowError(SyntaxExtenderInterceptorAlreadyRegisteredError);

        expect(() => {
            interceptor.middleware([]);
        }).toThrowError(SyntaxExtenderNotValidArgumentError);

        expect(() => {
            interceptor.middleware('test', []);
        }).toThrowError(SyntaxExtenderNotValidArgumentError);

        expect(() => {
            interceptor.middleware('test', function () {});
        }).toThrowError(SyntaxExtenderInterceptorMissingNamespaceError);

        class Wrapper {
            original;
            constructor(original) {
                this.original = original;
            }
        }

        let middlewaresCounter = 0;

        interceptor.middleware('syntax-extender/tests/interceptor', function (module, info) {
            expect(info.processed).toBeTruthy();
            middlewaresCounter++;
            return new Wrapper(module);
        });

        interceptor.middleware('syntax-extender/tests/interceptor', function (module, info) {
            expect(info.processed).toBeTruthy();
            expect(module).toBeInstanceOf(Wrapper);
            middlewaresCounter++;
            return module;
        });

        const wrappedInstanceBecauseMiddleware = require('syntax-extender/tests/interceptor/test-abstract-interceptor');
        // multiple require to check middleware launches
        require('syntax-extender/tests/interceptor/test-abstract-interceptor');
        require('syntax-extender/tests/interceptor/test-abstract-interceptor');

        expect(middlewaresCounter).toBe(6);

        expect(hasMetadata(wrappedInstanceBecauseMiddleware.original)).toBeTruthy();

        expect(getMetadata(wrappedInstanceBecauseMiddleware.original).toObject().features).toEqual([
            'COMMENT',
            'ACCESSIBILITY',
            'COMPATIBILITY',
            'CONSTRUCTOR'
        ]);
    });
};
