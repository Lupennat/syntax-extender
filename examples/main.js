require('./bootstrap');

const Cache = require('./services/cache');
const Redis = require('./support/facades/redis');
const manager = require('./manager');

console.log('get' in Redis); // false
console.log('set' in Redis); // false
console.log('doesntExist' in Redis); // false

console.log(Redis.get('key')); // null

Redis.set('key', 1024);

console.log(Redis.get('key')); // 1024

try {
    Redis.doesntExist();
} catch (error) {
    console.log(error.message); //  Redis.doesntExist is not a function
}

try {
    manager.add();
} catch (error) {
    console.log(error.message); //  Manager.add missing parameters at position 1.
}
try {
    manager.add('test', []);
} catch (error) {
    console.log(error.message); //  Manager.add parameter at position 2 expected to be "Service", "Array" given.
}

manager.add('cache', new Cache());

try {
    require('./services/db');
} catch (error) {
    console.log(error.message); // Declaration of static Db.get(times:integer): any must be compatible with Service.get(times:integer): Promise<[integer]>
}
