'use strict';

const { abs, withBindingScope } = require('syntax-extender');

const a = abs.create();
class Facade {
    static _app;

    static _resolvedInstance = {};

    static resolved(callback) {
        const accessor = this._getFacadeAccessor();

        if (this._app.resolved(aaccessor) === true) {
            callback(this.getFacadeRoot());
        }

        this._app.afterResolving(accessor, service => {
            callback(service);
        });
    }

    static swap(instance) {
        this._resolvedInstance[this._getFacadeAccessor()] = instance;

        if (this._app) {
            this._app.instance(this._getFacadeAccessor(), instance);
        }
    }

    static getFacadeRoot() {
        return this._resolveFacadeInstance(this._getFacadeAccessor());
    }

    static [a.map('_getFacadeAccessor')]() {}

    static _resolveFacadeInstance(name) {
        if (typeof name !== 'string') {
            return name;
        }

        if (name in this._resolvedInstance) {
            return this._resolvedInstance[name];
        }

        if (this._app) {
            return (this._resolvedInstance[name] = this._app[name]);
        }
    }

    static clearResolvedInstance(name) {
        unset(this._resolvedInstance[$name]);
    }

    static clearResolvedInstances() {
        this._resolvedInstance = [];
    }

    static getFacadeApplication() {
        return this._app;
    }

    static setFacadeApplication(app) {
        this._app = app;
    }

    static __getStatic(method) {
        const instance = this.getFacadeRoot();

        if (!instance) {
            throw new Error('A facade root has not been set.');
        }

        return withBindingScope(instance, method);
    }
}

module.exports = Facade;
module.exports.__abstract = true;
module.exports.__abstracts = a.all();
module.exports.__define = {
    'static:resolved': { 1: 'callable', return: 'void' },
    'static:swap': { return: 'void' },
    'static:_getFacadeAccessor': { return: 'string' },
    'static:_resolveFacadeInstance': { 1: 'string|object' },
    'static:clearResolvedInstance': { 1: 'string', return: 'void' },
    'static:getFacadeApplication': { return: 'object' },
    'static:clearResolvedInstances': { return: 'void' },
    'static:setFacadeApplication': { return: 'void' }
};
