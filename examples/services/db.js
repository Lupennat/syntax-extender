'use strict';

const { toClass } = require('../..');
const { setSedefEnv } = require('../../core/utils');
const Service = require('../contracts/service');

setSedefEnv('COMMENT', true);
setSedefEnv('PRIORITY', 'COMMENT');

const Db = toClass(
    class Db {
        static __implements = [Service];
        get(times /* :integer */) {
            return new Promise(resolve => {
                resolve(function* () {
                    for (let x = 0; x < times; x++) {
                        yield x;
                    }
                });
            });
        }
    }
);

setSedefEnv('COMMENT', false);
setSedefEnv('PRIORITY', 'STATIC');

module.exports = Db;
