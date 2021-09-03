'use strict';

const { toClass } = require('../');
const { setSedefEnv } = require('../core/utils');

setSedefEnv('COMMENT', true);
setSedefEnv('PRIORITY', 'COMMENT');
setSedefEnv('CHECKDEFAULT', true);

const Manager = toClass(
    class Manager {
        #service = {};
        add(name /* :string */, service /*:./contracts/service*/) {
            this.#service[name] = service;
        }

        get(name /* :string */) {
            return this.#service[name];
        }
    }
);

setSedefEnv('COMMENT', false);
setSedefEnv('PRIORITY', 'STATIC');
setSedefEnv('CHECKDEFAULT', false);

module.exports = new Manager();
