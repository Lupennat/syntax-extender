'use strict';

const { toInterface } = require('../..');
const { setSedefEnv } = require('../../core/utils');

setSedefEnv('COMMENT', true);
setSedefEnv('PRIORITY', 'COMMENT');

const Service = toInterface(
    class Service {
        async *get(times /* :integer */) /*:->[]integer */ {}
    }
);

setSedefEnv('COMMENT', false);
setSedefEnv('PRIORITY', 'STATIC');

module.exports = Service;
