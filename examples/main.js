'use strict';

require('./bootstrap');
const App = require('examples/app');
const Cache = require('examples/services/cache');
const RedisAdapted = require('examples/services/redis-adapted');
const Facade = require('examples/support/facades/facade');
const Redis = require('examples/support/facades/redis');

const app = new App();

Facade.setFacadeApplication(app);

app.redis = new RedisAdapted();

console.log('get' in Redis); // false
console.log('set' in Redis); // false
console.log('doesntExist' in Redis); // false

(async () => {
    console.log(await Redis.get('key')); // null
})();
Redis.set('key', 1024);

(async () => {
    console.log(await Redis.get('key')); // 1024
})();

try {
    Redis.doesntExist();
} catch (error) {
    console.log(error.message); //  Redis.doesntExist is not a function
}

try {
    app.add();
} catch (error) {
    console.log(error.message); //  app.add missing parameters at position 1.
}
try {
    app.add('test', []);
} catch (error) {
    console.log(error.message); //  app.add parameter at position 2 expected to be "Service", "Array" given.
}

try {
    app.test = [];
} catch (error) {
    console.log(error.message); //  app.add parameter at position 2 expected to be "Service", "Array" given.
}

app.cache = new Cache();

try {
    require('examples/services/db');
} catch (error) {
    console.log(error.message); // Declaration of static Db.get(times:integer): any must be compatible with Service.get(times:integer): Promise<[integer]>
}
