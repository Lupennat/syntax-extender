const Facade = require('./support/facades/facade');

class Redis {
    #store = {};

    static __define = {
        set: { 1: 'string' },
        get: { 1: 'string' }
    };

    set(name, value = null) {
        this.#store[name] = value;
    }

    get(name) {
        return this.#store[name] || null;
    }
}

Facade.setFacadeApplication({
    redis: new Redis()
});
