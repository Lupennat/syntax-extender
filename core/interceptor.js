'use strict';

const fs = require('fs');
const Module = require('module');
const nodePath = require('path');

const { INTERFACE, ABSTRACT, FEATURES } = require('./constants');
const { isFunction, isString, isDictionary, setSedefEnv, hasOwn } = require('./utils');
const toAbstract = require('./to-abstract');
const toClass = require('./to-class');
const toInterface = require('./to-interface');

const SyntaxExtenderNotValidArgumentError = require('../errors/syntax-extender-not-valid-argument-error');
const SyntaxExtenderInterceptorAlreadyRegisteredError = require('../errors/interceptor/syntax-extender-interceptor-already-registered-error');
const SyntaxExtenderInterceptorMissingNamespaceError = require('../errors/interceptor/syntax-extender-interceptor-missing-namespace-error');
const SyntaxExtenderInterceptorInvalidPathError = require('../errors/interceptor/syntax-extender-interceptor-invalid-path-error');
const SyntaxExtenderInterceptorNotADirectoryError = require('../errors/interceptor/syntax-extender-interceptor-not-a-directory-error');

const originalRequire = Module.prototype.require;
const originalResolveFilename = Module._resolveFilename;

let namespacesNames = [];
let pathsNames = [];

const namespaces = {};
const paths = {};
const callbacks = {};
const features = {};
const middlewares = {};

const cache = {
    modules: {},
    processed: {},
    resolvedId: {},
    resolvedPath: {},
    namespaced: {}
};

const isNative = function (id) {
    return hasOwn(process.binding('natives'), id);
};

const isPathMatchesNamespaces = function (path, namespace) {
    if (path.indexOf(namespace) === 0) {
        if (path.length === namespace.length) {
            return true;
        }
        if (path[namespace.length] === '/') {
            return true;
        }
    }
    return false;
};

const generateRequireInfo = function (id, absPath) {
    return {
        moduleId: id,
        namespace: cache.namespaced[absPath],
        absPath: absPath,
        extname: nodePath.extname(absPath),
        processed: cache.processed[absPath] || false
    };
};

const createResolveFilenameInterceptor = function (__resolveFilename) {
    return function interceptedResolveFilename(request, parentModule, isMain, options) {
        if (isNative(request)) {
            return __resolveFilename.call(this, request, parentModule, isMain, options);
        }

        if (cache.resolvedId[request]) {
            return cache.resolvedId[request];
        }

        if (cache.resolvedPath[request]) {
            return cache.resolvedPath[request];
        }

        const originalRequest = request;
        let namespaceFounded = false;
        for (let i = namespacesNames.length; i-- > 0; ) {
            const namespace = namespacesNames[i];
            if (isPathMatchesNamespaces(request, namespace)) {
                const namespaceTarget = namespaces[namespace];
                namespaceFounded = namespace;
                request = nodePath.join(namespaceTarget, request.substr(namespace.length));
                break;
            }
        }

        const filename = __resolveFilename.call(this, request, parentModule, isMain, options);

        if (namespaceFounded) {
            cache.namespaced[filename] = namespaceFounded;
            cache.modules[filename] = originalRequest.replace('.js', '');
        } else {
            for (let i = pathsNames.length; i-- > 0; ) {
                const path = pathsNames[i];
                if (filename.startsWith(path)) {
                    cache.namespaced[filename] = paths[path];
                    cache.modules[filename] = filename.replace(path, paths[path]).replace('.js', '');
                    break;
                }
            }
        }

        cache.resolvedPath[filename] = filename;
        cache.resolvedId[originalRequest] = filename;

        return filename;
    };
};

const createRequireInterceptor = function (__require) {
    return function interceptedRequire(id) {
        let __exports = __require.call(this, id);

        const filename = cache.resolvedId[id] || '';

        if (filename && cache.modules[filename]) {
            const info = generateRequireInfo(cache.modules[filename], filename);

            if (!info.processed) {
                if (callbacks[info.namespace]) {
                    __exports = callbacks[info.namespace].call(
                        callbacks[info.namespace],
                        __exports,
                        { ...info },
                        callback(),
                        features[info.namespace]
                    );
                } else {
                    __exports = callback()(__exports, { ...info }, features[info.namespace]);
                }

                Module._cache[info.absPath].exports = __exports;
                cache.processed[info.absPath] = true;
                info.processed = true;
            }

            for (let x = 0; x < middlewares[info.namespace].length; x++) {
                __exports = middlewares[info.namespace][x].call(middlewares[info.namespace][x], __exports, { ...info });
            }
        }

        return __exports;
    };
};

const callback = function () {
    return function (resolved, info, features) {
        if (info.extname === '.js' && resolved) {
            for (const feature in features) {
                if (Object.keys(FEATURES).indexOf(feature) === -1) {
                    continue;
                }
                setSedefEnv(feature, !!features[feature]);
            }
            if (hasOwn(resolved, INTERFACE)) {
                resolved = toInterface(resolved, info.absPath, info.namespace, info.id);
            } else if (hasOwn(resolved, ABSTRACT)) {
                resolved = toAbstract(resolved, info.absPath, info.namespace, info.id);
            } else {
                resolved = toClass(resolved, info.absPath, info.namespace, info.id);
            }
        }

        return resolved;
    };
};

Module._resolveFilename = createResolveFilenameInterceptor(originalResolveFilename);
Module.prototype.require = createRequireInterceptor(originalRequire);

const interceptor = {
    namespaces() {
        return namespaces;
    },
    registerNamespace(namespace, path, config = {}) {
        if (!isString(namespace)) {
            throw new SyntaxExtenderNotValidArgumentError(
                `registerNamespace(namespace, path, config = {}) argument 1 must be a string.`
            );
        }

        if (!isString(path)) {
            throw new SyntaxExtenderNotValidArgumentError(
                `registerNamespace(namespace, path, config = {}) argument 2 must be a string.`
            );
        }

        if (!isDictionary(config)) {
            throw new SyntaxExtenderNotValidArgumentError(
                `registerNamespace(namespace, path, config = {}) argument 3 must be a dictionary.`
            );
        }

        if ('callback' in config && !isFunction(config.callback)) {
            throw new SyntaxExtenderNotValidArgumentError(`config.callback must be a function.`);
        }

        if ('features' in config && !isDictionary(config.features)) {
            throw new SyntaxExtenderNotValidArgumentError(`config.features must be a dictionary.`);
        }

        if (!fs.existsSync(path)) {
            throw new SyntaxExtenderInterceptorInvalidPathError(path);
        }

        if (!fs.lstatSync(path).isDirectory()) {
            throw new SyntaxExtenderInterceptorNotADirectoryError(
                `namespace path can only be a directory, ${path} provided`
            );
        }

        path = nodePath.resolve(path);

        if (namespaces[namespace] !== undefined) {
            throw new SyntaxExtenderInterceptorAlreadyRegisteredError('namespace', 'path', path);
        }

        if (paths[path] !== undefined) {
            throw new SyntaxExtenderInterceptorAlreadyRegisteredError('path', 'namespace', namespace);
        }

        middlewares[namespace] = [];

        if (config.callback) {
            callbacks[namespace] = config.callback;
        }

        if (config.features) {
            features[namespace] = config.features;
        }

        paths[path] = namespace;
        namespaces[namespace] = path;

        namespacesNames = Object.keys(namespaces);
        namespacesNames.sort();

        pathsNames = Object.keys(paths);
        pathsNames.sort();

        return this;
    },
    middleware(namespace, callback) {
        if (!isString(namespace)) {
            throw new SyntaxExtenderNotValidArgumentError(
                'addBeforeHook(namespace, callback) argument 1 must be a string.'
            );
        }
        if (!isFunction(callback)) {
            throw new SyntaxExtenderNotValidArgumentError(
                'addBeforeHook(namespace, callback) argument 2 must be a functions.'
            );
        }

        if (namespaces[namespace] === undefined) {
            throw new SyntaxExtenderInterceptorMissingNamespaceError(namespace);
        }

        middlewares[namespace].push(callback);

        return this;
    }
};

Object.seal(interceptor);
Object.freeze(interceptor);

module.exports = interceptor;
