# Syntax Extender

javascript Syntax Extender tries to introduce the concepts of interfaces and abstract classes (including abstract methods) already present in other languages.\
It introduces at the same time some additional features including:

-   [compatibility checking between methods of inherited classes or interfaces](#methods-compatibility).
-   [access type definition](#access-type-definition). \*\*only visibility descriptor available
-   [methods parameters and return validation](#methods-validation).
-   [parameters default value type validation](#experimental-default-value-validation) \*\*Experimental off by default
-   [type declaration](#type-declaration) for methods.
-   [type declaration through comments](#experimental-type-declaration-by-comment) \*\*Experimental off by default
-   [magic methods](#magic-methods) for classes.

> All these features can be enabled/disabled at runtime or globally for a defined namespace (interfaces doesn't follow user specification, but always use the feature defaults)

To achieve this goal, some limitations have been introduced:\
**all restrictions refer to sources that use syntax-extender.**

-   [Strict mode for scripts](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Strict_mode)\*
-   only a javascript class can be transformed.
-   it is not always possible to use native private members and methods ([more info](#classes-and-abstracts)).
-   it is not possible to define the native method 'constructor' of the class (see [\_\_construct](#__construct)).
-   interfaces cannot use the native extends (see [\_\_extends](#extend-interfaces)).
-   abstracts methods and interfaces methods can not contains body.
-   classes and abstracts can not native extends interfaces.

> Strict mode is not mandatory, but non-use could generate unexpected errors.\
> Please take into account that also class setter and getter are functions.\
> Support for native constructor is a feature you can enable/disable it

## Compatibility with standard Javascript Classes

Interfaces, Abstract and Classes generated through syntax-extender can be used outside syntax-extender project.\
You can easly extends an Interface a Class or an Abstract but they always respect rules applied by syntax-extender.\
If you extend and interface you can not be able to override a constant and every time you try to call an interface method that is not implemented an error will be thrown. You will not be able to create an instance of an interface.\
If you extend an abstract class every time you try to call an abstract method that is not implemented an error will be thrown. You will not be able to create an instance of an abstract. All magic methods implemented on abstract class, will continue to work. All constants of implemented interfaces can not be overrided.\
If you extend an extended class, all magic methods implemented on abstract class, will continue to work. All constants of implemented interfaces can not be overrided.

## Exposed functionality

Syntax Extender expose these methods:

-   [abs](#abstract-methods) (to generate abstracts methods and accessors maps)
-   [interceptor](#interceptor) (to register project namespace and enable syntax-extender)
-   [withBindingScope](#withBindingScope) (a useful helper for magic methods).

# Usage

On the folder `examples` you can find some implementation examples. (node entry point is main.js)

## class

Creating an extended class automatically adds the ability to use [magic methods](#magic-methods), [declare type of arguments](#type-declaration),[implement interfaces](#implement-interfaces), [generate metadata](#lifecycle).

```js
'use strict';

module.exports = class Test {
    __construct() {}
    test(a, b) {}
};

// if you define module.exports.* after the module.exports assignement
// the properties will be assigned as static properties of the class

module.exports.__implements = [require('./interface')];
module.exports.__define = { test: { 1: 'string', 2: 'array' } };
```

## abstract class

Creating an abstract class automatically adds the ability to use [magic methods](#magic-methods), [declare type of arguments](#type-declaration),[implement interfaces](#implement-interfaces), [generate metadata](#lifecycle) and [create abstract methods](#abstract-methods).

```js
'use strict';

const { abs } = require('syntax-extender');
const a = abs.create();

module.exports = class Abstract {
    __construct() {}
    test(a, b) {}
    [a.map('abstractMethod')]() {}
};

// if you define module.exports.* after the module.exports assignement
// the properties will be assigned as static properties of the class

module.exports.__abstract = true;
module.exports.__abstracts = a.all(); // without this abstract methods not works
module.exports.__implements = [require('./interface')];
module.exports.__define = { test: { 1: 'string', 2: 'array' } };
```

## interface

Creating an interface automatically adds the ability to [define magic methods](#magic-methods), define constants, [declare type of arguments](#type-declaration),[extend interfaces](#extend-interfaces), [generate metadata](#lifecycle).

```js
'use strict';

module.exports = class Interface {
    static THISISACOSTANT = 'VALUE';
    test(a, b) {}
};

// if you define module.exports.* after the module.exports assignement
// the properties will be assigned as static properties of the class

module.exports.__interface = true;
module.exports.__extends = [require('./another-interface')];
module.exports.__define = { test: { 1: 'string', 2: 'array' } };
```

> Only static properties, methods and static methods are allowed in interfaces classes.\
> Static properties will be used as constants.

## extend interfaces

You can simply extends interfaces and inherit interface constants via static property `__extends`.\
Value of extends can be a single interface or an array of interfaces

```js
class Test {
    static __extends = require('./interface'); // or [require('./interface1'), require('./interface2'), ...]
}
```

## implement interfaces

You can simply implements interfaces and inherit interface constants via static property `__implements`.\
Value of implements can be a single interface or an array of interfaces

```js
class Test {
    static __implements = require('./interface'); // or [require('./interface1'), require('./interface2'), ...]
}
```

## abstract methods

You can simply create Abstract methods using an exposed functionality;

```js
'use strict';
const { abs } = require('syntax-extender');
const a = abs.create();

class Abstract {
    [a.map('method')]() {}
}

Abstract.__abstracts = a.all();
```

> Only methods (and accesors) can be abstracts not properties

# interceptor

Interceptor is a feature that automates the generation of extended classes, this can be very convenient when a project follow OOP.\
Interceptor hack the nodejs original "Module" to intercept any require invoked and provide to the developers the ability to manage the result of the export.

## interceptor usage

> With great power comes great responsibility

```js
const { interceptor } = require('syntax-extender');

// first of all you need to register a namespace
// the namespace should be linked to the app project root
// only registered namespaced will use syntax-extender
// if you want only to use interceptor you can override default callback
interceptor.registerNamespace('app', absolutePath, {
    callback: function (module, info, syntaxExtenderCallback, features) {
        // module is the original module from require
        // syntaxExtenderCallback is the original callback to extend syntax
        // always return something

        // you can bypass and return your implementation maybe to mock classes
        if (info.moduleId === 'to-mock') {
            return MockedClass;
        }

        // or you can call syntax-extender original callback with these 3 parameters
        return syntaxExtenderCallback(module, info, features);
    },
    features: {
        COMPATIBILITY: false
    }
});

// you can also apply a middleware to any existing namespace registered on interceptor
// it will be called ad every require but only after the original callback from registerNamespace
// result from middleware is not registered on Module._cache
interceptor.middleware('app', function (module, info) {
    // should be useful to inspect or log something
    // but you can also use this to decorate an existing module
    // try to avoid direct module manipulation
    // always return something
    return class Decorator extends module {
        newMethod() {}
    };
});
```

Info is an object containing useful information

```js
{
    "moduleId": "./model/existing-test", // moduleId string
    "namespace": "app", // base namespace
    "namespaceFull": "app/model", // full namespace
    "absPath": "/${fullpath}/existing-test", // absolute path of file required (only if non native)
    "processed": true // or false if is first processing
}
```

## interceptor config

-   callback
-   features

You can define features status by config, and also override the default callback providing a custom callback.

## how it works

In order to register a namespace it modifies the internal Module.\_resolveFilename method so that when you use require or import it first checks whether the given string starts with one of the registered namespace, if so, it replaces the namespace in the string with the target path of the namespace.

In order to automatically extends loaded modules it modifies Module.prototype.require and apply extensions to the original module. After the extensions it register on Module.\_cache[filename].exports the new content to cache the extended object.

> Only at first require the syntax-extender will be applied.\
> Credit to [intercept-require](https://github.com/bttmly/intercept-require)\
> Credit to [module-alias](https://github.com/ilearnio/module-alias)

# access type definition

> feature keyword VALIDATION (default true)\
> module.exports[Symbol.for('VALIDATION')] for runtime

name of properties, methods and accessors, will define the visibility of the descriptor, every name starting with `_${name}` will be processed as protected and `__${name}` as private, any other syntax will be processed as public (real private `#${name}` can not be detected by syntax-extender, they are real privates)

```js
class Test {
    __privateFn() {}
    _protectedFn() {}
    publicFn() {}
    ___thisIsPublic() {}
}
```

**in a future release protected and private properties, may not be accessible outside the instance or class**

> only descriptor.visibility on metadata will be affected, no restriction to object.property is currently implemented

# type declaration

Through a static property it is possible to define the type of every argument of every function and return type.\
The value of the property must be a dictionary containing as key the `$name` of the method (`static:$name` for static methods) and as value an object containing as key the index of the parameter and as value its type.\
The type can be a string or a JS object to make a custom type. For destructured parameters it is possible to define the type of every single destructured parameter by specifying as key "index.subindex".\
You can define multiple type using `union type` sintax `|`, multiple type is forbidden for Custom type and for builtin `self` and `parent`.\
return type should be defined using key `return`.\
You can define a type of a promise using sintax `${name}->`, if the value returned from promise can be nullable you can use the syntax `${name}?>`.\
If the promise can be nullable but not the value returned from promise you can use the syntax `?${name}->`.

```js
'use strict';
class CustomObj {}
module.exports = class Base {
    fn(first, second) {
        return second;
    }
    fn2(first, { a, b, b } = {}) {}
    async fnAsync(a) {
        return a;
    }
    static fn(first, second) {
        if (first > 0) {
            return Promise.resolve(second);
        }

        return null;
    }
};

// if you define module.exports.* after the module.exports assignement
// the properties will be assigned as static properties of the class
module.exports.__define = {
    fn: { 1: 'string', '?2': CustomObj, '?return': CustomObj },
    fn2: { 1: 'string|number', 2.1: 'integer', 2.2: 'float', 2.3: 'callable' },
    asyncFn: { '1?>': 'number', 'return?>': 'number' },
    'static:fn': { 1: 'integer', 2: 'array', '?return->': 'array' }
};
```

```js
// file base.js
'use strict';

class Base {
    a(test = 'string') {
        return test;
    }
    b(test) {
        return test;
    }
}

// if you define module.exports.* after the module.exports assignement
// the properties will be assigned as static properties of the class
module.exports.__define = { a: { '?1': 'string' }, b: { '?1': 'string' } };

// file main.js

const Base = require('./base);
const base = new Base();

console.log(base.a()); // 'string'
console.log(base.b()); // throw SyntaxExtenderRunningError
console.log(base.b(undefined)); // throw SyntaxExtenderRunningError
console.log(base.b(null)); // null
```

You can define a type of a promise using key `${name}->`, if the value returned from promise can be nullable you can use the key `${name}?>`.\
If the promise can be nullable but not the value returned from promise you can use the key `?${name}->`.

You can define a type of an iteration using key `${name}[]`, if the value returned from iteration can be nullable you can use the key `${name}[?]`.\
If the iterable can be nullable but not the value returned from iteration you can use the key `?${name}[]`.\
You can define a type of a promise iteration using the key `${name}->[]`\
You can also define and concatenate the nullables using:

-   `?{name}->[]` the value can be `null` or a `promise` and the promise resolved must be an iterable that return the defined type.
-   `{name}?>[]` the value must be a `promise` and the promise can resolve `null` or an `iterator` and the iterator type must be of defined type.
-   `{name}?>[?]` the value must be a `promise` and the promise can resolve `null` or an `iterator` and the iterator can return `null` or defined type.

> return type is automatically setted by function type
>
> -   async fn() is a promise return type `{fn : {return: 'promise'}}`
> -   \*fn () is a generator return type `{fn: {return: 'generator'}}`
> -   async \*fn() is a promise generator return type `{fn : {'retun->': 'generator'}}`
>
> you can always be more specific using `return->` or `return[]` or `return->[]`

**`void|undefined` is different from `null`, please make sure to always return `null` if is nullable, object passed to a function can be `void|undefined` everytime parameter has a default value or type is `void|undefined`, object can be `null` only if parameter is nullable**

```js
if (hasDefault) {
    // when a value is undefined and parameter has default value we can proceed
    // the parameter will become the default
    if (value === undefined) {
        return true;
    }
}
// when a value is null we need to verify if isNullable no matter parameter has a default
// because the parameter will not become the default, it remain "null"
// no matter what the type declaration is, (param = null) will be treated as nullable
if (isNullable && value === null) {
    return true;
}
```

All arguments and return definitions will be used to generate class metadata and will be used for [compatibility checking between methods](#methods-compatibility) and [arguments validation](#methods-validation) when a function is invoked.

## experimental type declaration by comment

> feature keyword COMMENT (default false)\
> module.exports[Symbol.for('COMMENT')]

If enabled, the comments of the function parameters and the comment for the return type declaration will be processed.\
Only the comments that have this structure and are placed in the order described below will be taken into consideration.

```js
    function (
        test /* ?:array */ = [],
        {first /* :string */, second /* :array */} /* dictionary */,
        custom /* ./custom-object */ = null,
        generator /* ?:[?]string */ = null,
        promise /* ?:?>string */ = null,
        promiseiterable /* ?:?>[?]string */ = null

    ) /* :array */ {
        return test;
    }
```

-   the comment must begin with `:`
-   parameter comment should be positioned after the parameter name and before the optional `=`
-   return comment should be positioned after the parameters and before the starting bracket
-   custom type declaration can be a require `path`, it can be relative or absolute
-   nullable parameter can be defined using the `?` before the `:`
-   iteration type can be defined using `[]${type}` syntax
-   nullable iteration value can be defined using `[?]${type}`
-   promise type can be defined using `->${type}` syntax
-   nullable promide value can be defined using `?>${type}`
-   promise iteration can be defined using `->[]${type}` syntax
-   multiple type can be defined using `${type}|${type}` syntax

when both definition is defined, via comment and via static `__define`, the priority is defined by a variable

```js
class Test {}

module.exports = Test;

// if you define module.exports.* after the module.exports assignement
// the properties will be assigned as static properties of the class
module.exports[Symbol.for('PRIORITY')] = 'COMMENT';
```

## type declaration builtins

-   array
-   async (every async function)
-   bigint
-   boolean
-   callable (every function)
-   date
-   dictionary (only plain object)
-   float
-   generator (every generator function)
-   integer
-   map
-   number (bigint is not a number)
-   object
-   parent
-   promise
-   self
-   set
-   string (only real string not an Object that implement toString())
-   symbol
-   typedArray
-   void
-   weakmap
-   weakset

> \* type declaration can be more specific using iterable syntax `$name[]` see [compatibility chapter](#methods-compatibility)

`typedArray` and `string` are iterables by default, but declaration iterables is forbidden because result of iteration will be always a `string` or a `binary` if original type is correct.

Custom class can not be declared iterables, you can use alternative solutions to validate value returned by an iterations.

## experimental default value validation

> feature keyword CHECKDEFAULT (default false)\
> module.exports[Symbol.for('CHECKDEFAULT')] for runtime

When feature is enabled, an extra validation will be applied for default parameters value.

-   a custom definition type can have only a `null` or `undefined` default
-   `self` and `parent` builtin type can have only a `null` or `undefined` default
-   all others builtin can have a `null` or `undefined` default, if default is different and it doesn't match the type an error will be thrown

```js


function (
    test /* :string */ = undefined, // ok
    test1 /* :string */ = null, // ok
    test2 /* :string */ = [], // will throw an error
    test3 /* :string */ = '', // ok
    test4 /* date */ = new Date(), // ok
    test5 /* promise */ = Promise.resolve() // ok
) {}
```

> validation of default will fail everytime the value should be an instance of a custom class

## methods compatibility

> feature keyword COMPATIBILITY (default true)\
> module.exports[Symbol.for('COMPATIBILITY')] for runtime

When overriding a method, its signature must be compatible with the parent method. Otherwise, an error is emitted. A signature is compatible if it respects the **variance** rules, makes a mandatory parameter optional, and if any new parameters are optional. This is known as the Liskov Substitution Principle, or LSP for short. The [\_\_construct](#construct), and private methods are exempt from these signature compatibility rules, and thus won't emit error in case of a signature mismatch. The [\_\_construct](#construct) return type is forbidden by default.

> A type declaration is considered more specific in the following case:
>
> -   A Promise type is changed to a Non-Promise type
> -   A type is removed from a union type
> -   A class type is changed to a child class type
> -   An iterable type is changed to iterable[value] type

## methods validation

> feature keyword VALIDATION (default true)\
> module.exports[Symbol.for('VALIDATION')] for runtime

Every time a class function is invoked, arguments will be validated and error will be raised if something do not match signature (see [Lifecycle](#lifecycle) for more details).

## promise and iterable validation

To intercept and validate definition types of promises and iterables, we need to override default behaviour.\
When `${name}->` is defined, the value returned or passed to a function will be changed.

```js
// ...
if (value && value.then && isFunction(value.then)) {
    return new Promise((resolve, reject) => {
        value
            .then(res => {
                // validation stuff
                // add validation iterable if `$name->[]`
                resolve(res);
            })
            .catch(error => {
                reject(error);
            });
    });
}
// ...
```

When `${name}[]` is defined, the value returned or passed to a function will be changed.

```js
// simple array
if (isArray(value)) {
    for (let val of value) {
        // validate all values sync
    }
    return value;
}

// map, set
if (isIterable(value)) {
    const original = value[Symbol.iterator];
    value[Symbol.iterator] = function* (...args) {
        for (let val of original.call(this, ...args)) {
            // validate value
            yield val;
        }
    };
    return value;
}

// generator fn
if (value && isGeneratorFunction(value)) {
    return function* (...args) {
        for (let val of value.call(value, ...args)) {
            // validate value
            yield val;
        }
    };
}
```

**Because Array values can be returned without an iteration, values of array will be validated in a sync loop, this operation can be memory consuming**

# magic methods

> feature keyword MAGIC (default true)\
> module.exports[Symbol.for('MAGIC')] for runtime

Every Class or Abstract created by Syntax Extender can use magic methods

## \_\_construct

the native method 'constructor', has a limit, it does not allow the developer to decide when and if to invoke the constructor of the inherited class.\
This is a real limit for class reflection, to generate metadata of instance defined property we are forced to make a new instance and check properties of the instance, without magic `__construct` create a new instance without can be very dangerous.

```js
class Base {
    prefix = 'base:';
    constructor(value) {
        this.name = value;
        this.test = this.init();
    }
    init() {
        return this.prefix + this.name;
    }
}

class Custom extends Base {
    constructor(value) {
        // you can't use "this" without call super()
        // this.prefix = 'custom:'
        super(value);
        // here is too late
        this.prefix = 'custom:';
    }
}

const c = new Custom('hello!');
console.log(this.test); // base:hello!
```

```js
// base.js
class Base {
    prefix = 'base:';
    __construct(value) {
        this.name = value;
        this.test = this.init();
    }
    init() {
        return this.prefix + this.name;
    }
}
module.exports = Base;

// custom.js
const Base = require('base');

class Custom extends Base {
    __construct(value) {
        // you can call before
        // super.__construct(value)
        this.prefix = 'custom:';
        // you can call after
        super.__construct(value);
        // or you can only override __construct
        // without calling parent __construct
    }
}

module.exports = Custom;

// in another file
const c = new Custom('hello!');
console.log(this.test); // custom:hello!
```

## \_\_getStatic

Because of the chain, in javascript it is impossible to distinguish a call to a method from an access to a property.\
magic method \_\_getStatic can be used for both scope.

```js
'use strict';
const { withBindingScope } = require('syntax-extend');

class Custom {
    name = 'custom';
    customFn(...args) {
        return `${this.name} instance call customFn ${args.join(', ')}`;
    }
}

class Test {
    static prop = 'property';

    static getInstanceFromStuff(name) {
        if (name === 'custom') {
            return new Custom();
        }

        return null;
    }

    internalFn() {}

    // static is mandatory
    // one argument is mandatory
    static __getStatic(name) {
        if (name.startsWith('fn')) {
            // arrow function to preserve scope
            return (...args) => {
                return `test magic call ${args.join(', ')}`;
            };
            // or manual binding
            // return function(...args) {}.bind(this)
            // or with helpers if you want to use internal method
            // return withBindingScope(this, 'internalFn');
        }

        const instance = this.getInstanceFromStuff(name);

        if (instance) {
            // this helper assign the right scope on instance when method is invoked
            return withBindingScope(instance, `${name}Fn`);
        }

        return `test magic get ${name}`;
    }
}

module.exports = Test;

// in another file
console.log(Test.prop); // property
console.log(Test.prop2); // test magic get prop2
console.log(Test.fnTest(1, 2)); // test magic call 1,2
console.log(Test.custom(1, 2)); // custom instance call customFn 1,2
```

## \_\_setStatic

```js
class Test {
    static test = 'test';
    // static is mandatory
    // two arguments is mandatory
    static __setStatic(name, value) {
        this[name] = value;
    }
}

module.exports = Test;

// in another file
console.log(Test.test); // test
Test.test = 'test2';
console.log(Test.test); // test2
console.log(Test.test2); // undefined
Test.test2 = 'test3';
console.log(Test.test2); // test3
```

## \_\_get

Because of the chain, in javascript it is impossible to distinguish a call to a method from an access to a property.\
magic method \_\_get can be used for both scope.

```js
const { withBindingScope } = require('syntax-extend');

class Custom {
    name = 'custom';
    customFn(...args) {
        return `${this.name} instance call customFn ${args.join(', ')}`;
    }
}

class Test {
    prop = 'property';

    getInstanceFromStuff(name) {
        if (name === 'custom') {
            return new Custom();
        }

        return null;
    }

    internalFn() {}

    // without static is mandatory
    // one argument is mandatory
    __get(name) {
        if (name.startsWith('fn')) {
            // arrow function to preserve scope
            return (...args) => {
                return `test magic call ${args.join(', ')}`;
            };
            // or manual binding
            // return function(...args) {}.bind(this)
            // or with helpers if you want to use internal method
            // return withBindingScope(this, 'internalFn');
        }

        const instance = this.getInstanceFromStuff(name);

        if (instance) {
            // this helper assign the right scope on instance when method is invoked
            return withBindingScope(instance, `${name}Fn`);
        }

        return `test magic get ${name}`;
    }
}

module.exports = Test;

// in another file
const t = new Test();

console.log(t.prop); // property
console.log(t.prop2); // test magic get prop2
console.log(t.fnTest(1, 2)); // test magic call 1,2
console.log(t.custom(1, 2)); // custom instance call customFn 1,2
```

## \_\_set

```js
class Test {
    test = 'test';
    // without static is mandatory
    // two arguments is mandatory
    __set(name, value) {
        this[name] = value;
    }
}

module.exports = Test;

// in another file
const t = new Test();

console.log(t.test); // test
t.test = 'test2';
console.log(t.test); // test2
console.log(t.test2); // undefined
t.test2 = 'test3';
console.log(t.test2); // test3
```

## \_\_has

```js
class Test {
    test = 'test';
    // without static is mandatory
    // one argument is mandatory
    __has(name) {
        if (name === 'test2') {
            return true;
        } else {
            return false;
        }
    }
}

module.exports = Test;

// in another file
const t = new Test();

console.log('test' in t); // true
console.log('test2' in t); // true
console.log('test3' in t); // false
```

## \_\_delete

```js
class Test {
    test = 'test';
    test2 = 'test2';

    // without static is mandatory
    // one argument is mandatory
    __delete(name) {
        if (name === 'test3') {
            delete this.test2;
        }
    }
}

module.exports = Test;

// in another file
const t = new Test();

console.log(t.test); // test
console.log(t.test2); // test2
delete t.test;
console.log(t.test); // undefined
delete t.test3;
console.log(t.test2); // undefined
```

# withBindingScope

WithBindingScope is usefull to assign the right scope when a function is returned from [\_\_get](#__get) or [\_\_getStatic](#__getStatic).\
Without this helper the scope will be wrong and `this` inside the function wil not refer to the right context.

# LifeCycle

## extracting and generating metadata

Every time a method is invoked (toClass, toInterface, toAbstract), the class is processed, metadata are generated and assigned and a unique uuid is assigned to it.\
During the class process, all extended classes or constructor functions are processed to generate as much metadata as possible.\
The process happens once for each class, in fact the generated metadata are stored directly in the class and at each subsequent use of the class the process generates only metadata for the new classes.\
A "safe" mechanism for extracting non-static properties is used to generate the metadata. Static methods, static properties and prototype methods of the class can be extracted and verified directly through the class itself, while non-static properties can be extracted only by creating a new instance of the object.\
To avoid dangerous invocations, a check is made on the whole constructor chain and only if the chain is in a safe state then a test instance is created for analysis.\
in general all the inherited classes that contain the native constructor method and all the inherited constructor functions are considered not safe.\
All generated classes that contains only the magic `__construct` method are considered "safe", in fact through a bypass is avoided the invocation of the `__construct` method during the generation of the test instance. (see chapter [class manipulation](#class-manipulation))

```js
class Test {
    prop1 = 'value';
}
class Test2 {
    constructor() {}
}

const Test3 = function () {};

// safe => metadata contains properties
class Extend extends Test {}
module.exports = Extend;

// not safe => metadata not contains properties
class Extend2 extends Test2 {}
module.exports = Extend2;

// not safe => metadata not contains properties
class Extend3 extends Test3 {}
module.exports = Extend3;
```

## Class manipulation

After the generation and assignment of metadata the class is manipulated based on them.\

### interfaces

The class will be manipulated, and a javascript proxy will be returned.\
All methods will be implemented as Abstract and will throw an error if invoked.\

```js
// ...
switch (type) {
    case METHOD:
        return {
            value() {
                throw new SyntaxExtenderRunningError(`Cannot call abstract method ${sourceName}.${name}.`);
            },
            writable: true,
            enumerable: false,
            configurable: true
        };
    case GETTER:
        return {
            get() {
                throw new SyntaxExtenderRunningError(`Cannot call abstract getter ${sourceName}.${name}.`);
            },
            enumerable: false,
            configurable: true
        };
    case SETTER:
        return {
            set(value) {
                throw new SyntaxExtenderRunningError(`Cannot call abstract setter ${sourceName}.${name}.`);
            },
            enumerable: false,
            configurable: true
        };
}
// ...
```

Interface has custom implementation of constructor

```js
handler.construct = function (target, argumentsList, newTarget) {
    if (target.name === newTarget.name) {
        throw new SyntaxExtenderRunningError(`cannot instantiate interface ${name}.`);
    }

    // ...
};
```

and a custom implementation of the Symbol.hasInstance method.

```js
//...
const originalHasInstance = source[Symbol.hasInstance];
Object.defineProperty(source, Symbol.hasInstance, {
    value: function (instance) {
        // check original to compatibility with standard class extends
        if (originalHasInstance.call(this, instance)) {
            return true;
        }

        // check by metadata inheritance
        if (instance && instance.constructor && METADATA in instance.constructor) {
            const metadata = instance.constructor[METADATA];
            return ((metadata || {}).interfaces || []).indexOf(this[UUID]) > -1;
        }

        return false;
    }
});

//...

return source;
```

```js
const Contract = class Contract {}; // interface
const Contract2 = class Contract2 {}; // interface

class Test {
    static __implements = Contract;
}

module.exports = Test;

// in another file
const t = new Test();
console.log(t instanceof Contract); //true
console.log(t instanceof Contract2); //false
console.log(t instanceof Test); //true

class Test2 extends Contract2 {}

const t2 = new Test2();
console.log(t2 instanceof Contract); //false
console.log(t2 instanceof Contract2); //true
console.log(t2 instanceof Test2); //true
```

### classes and abstracts

The class will be manipulated, and a javascript proxy will be returned if necessary.\
All abstract methods will be implemented and will throw an error if invoked

```js
// ...
switch (type) {
    case METHOD:
        return {
            value() {
                throw new SyntaxExtenderRunningError(`Cannot call abstract method ${sourceName}.${name}.`);
            },
            writable: true,
            enumerable: false,
            configurable: true
        };
    case GETTER:
        return {
            get() {
                throw new SyntaxExtenderRunningError(`Cannot call abstract getter ${sourceName}.${name}.`);
            },
            enumerable: false,
            configurable: true
        };
    case SETTER:
        return {
            set(value) {
                throw new SyntaxExtenderRunningError(`Cannot call abstract setter ${sourceName}.${name}.`);
            },
            enumerable: false,
            configurable: true
        };
}
// ...
```

all constants inherited from interfaces will be assigned

```js
Object.defineProperties(
    source,
    Object.keys(metadata.constants || {}).reduce((c, k) => {
        c[k] = {
            value: metadata.constants[k].value,
            writable: false,
            enumerable: false,
            configurable: false
        };
        return c;
    }, {})
);
```

all implemented methods will be "proxied" and parameter validation rules will be added

```js
// ...

const name = isSymbol(descriptor.originalName) ? descriptor.originalName : descriptor.name;
const desc = Object.getOwnPropertyDescriptor(isStatic ? source : source.prototype, name);
if (isFunction(desc.value)) {
    const originalMethod = desc.value;
    desc.value = function (...args) {
        return validateReturn(
            descriptor.return,
            originalMethod.apply(this, validateParameters(descriptor.parameters, ...args))
        );
    };
}
if (isFunction(desc.set)) {
    const originalMethod = desc.set;
    desc.set = function (arg) {
        return originalMethod.apply(this, validateParameters(descriptor.parameters, arg));
    };
}

if (isFunction(desc.get)) {
    const originalMethod = desc.get;
    desc.get = function () {
        return validateReturn(descriptor.return, originalMethod.apply(this, []));
    };
}
Object.defineProperty(isStatic ? source : source.prototype, descriptor.name, desc);

// ...
```

**PLEASE READ CHAPTER [PROMISE AND ITERABLE VALIDATION](#promise-and-iterable-validation)**

Abstract always returns a proxy, because the handler construct always throw an error if an instance of abstract will be created

```js
handler.construct = function (target, argumentsList, newTarget) {
    if (target.name === newTarget.name) {
        throw new SyntaxExtenderRunningError(`cannot instantiate abstract class ${name}.`);
    }

    // ...
};
```

Depending on whether the class implements magic methods, a proxy of the class will be returned and in turn a proxy on the created instance will also be returned if it implements magic methods of the prototype.\

```js
if (hasStaticMagicMethods(source)) {
    if (hasStaticMagicGetter(source)) {
        handler.get = function (target, property, receiver) {
            // ...
        };
    }
    if (hasStaticMagicSetter(source)) {
        handler.set = function (target, property, value, receiver) {
            // ...
        };
    }
}

if (hasMagicMethods(source)) {
    const hasMagicPrototype = hasMagicPrototypeMethods(source);
    if (hasMagicPrototype) {
        if (metadata.hasNativePrivate) {
            throw new SyntaxExtenderGenerateProxyMagicAndPrivatesError(metadata.name);
        }
        for (const uuid in metadata.privatesMap) {
            throw new SyntaxExtenderGenerateProxyMagicAndInheritedPrivatesError(
                metadata.name,
                metadata.privatesMap[uuid]
            );
        }
    }
    handler.construct = function (target, argumentsList, newTarget) {
        // ...
        const instance = Reflect.construct(target, argumentsList, newTarget);
        // ...

        if (hasMagicConstruct(source)) {
            // ...
        }

        if (!hasMagicPrototype) {
            return instance;
        }

        const handler = {};

        if (hasMagicGetter(source)) {
            handler.get = function (target, property, receiver) {
                // ...
            };
        }

        if (hasMagicSetter(source)) {
            // we don't need enabled because no infinite loop will be raised
            handler.set = function (target, property, value, receiver) {
                // ...
            };
        }
        if (hasMagicHas(source)) {
            handler.has = function (target, property) {
                // ...
            };
        }

        if (hasMagicDelete(source)) {
            handler.deleteProperty = function (target, property) {
                // ...
            };
        }

        return new Proxy(instance, handler);
    };
}

if (Object.keys(handler) === 0) {
    return source;
}

return new Proxy(source, handler);
```

> Because of this ["bug"](https://github.com/tc39/proposal-class-fields/issues/106), depending on the implemented magic methods, it is not allowed to use members and private methods. An error will be raised in case the use of syntaxes of type `this.#` is recognized within the class.\
> The use of private static members and methods is instead always allowed because it requires to avoid the use of the syntax `this.#`, [here](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Classes/Private_class_fields#private_static_fields) you can find more information.
> If you really need to use privates members and methods you can find a [workaround here](#private-workaround)

**to avoid errors, there are some cases in which certain "properties" are ignored and the handler natively executes its natural correspondent through reflection**

```js
const dontTrapProperty = property => {
    // symbols are "private" trap it is very dangerous
    // then, catch, finally are reserved words (thenable)
    // arguments, prototype & constructor are reserved words
    // we don't want to trap all internal keys
    return (
        typeof property === 'symbol' ||
        property === 'then' ||
        property === 'catch' ||
        property === 'finally' ||
        property === 'arguments' ||
        property === 'prototype' ||
        property === 'constructor' ||
        property === 'toJSON' ||
        ALL_SYNTAX_EXTENDER_RESERVED_KEYWORDS
    );
};

handler.get = function (target, property, receiver) {
    // ...
    if (dontTrapProperty(property) || exists) {
        return Reflect.get(target, property, receiver);
    }
    // ...
};
```

## private workaround

workaround should be implemented if you really want to define private, otherwise you can use `__name` syntax, in the next future something will be implemented to transform this syntax in a real private.

create a native class with private and extends a class with magic methods

```js
class Test {
    static #prop = 'this is static private prop';

    static get prop() {
        return Test.#prop;
    }

    static __getStatic(name) {
        return `static ${name}`;
    }

    __get(name) {
        return name;
    }

    static #testPrivate() {
        return 'this is static private fn';
    }

    static test() {
        return Test.#testPrivate();
    }
}

class Test2 extends Test {
    #prop = 'this is private prop';

    get prop() {
        return this.#prop;
    }

    #testPrivate() {
        return 'this is private fn';
    }

    test() {
        return this.#testPrivate();
    }
}

console.log(Test2.test()); // this is static private fn
console.log(Test2.prop); // this is static private prop
console.log(Test2.notDefinedProp); // static notDefinedProp

const t = new Test2();
console.log(t.test()); // this is private fn
console.log(t.prop); // this is private prop
console.log(t.notDefinedProp); // notDefinedProp
```

use symbol (symbols is not a real private, descriptors can be extracted)

```js
const prop = Symbol('prop');
const method = Symbol('method');

class Test {
    [prop] = 'this is private prop';

    get prop() {
        return this[prop];
    }

    [method]() {
        return 'this is private fn';
    }

    test() {
        return this[method]();
    }
    __get(name) {
        return name;
    }
}

const t = new Test();
console.log(t.test()); // this is private fn
console.log(t.prop); // this is private prop
console.log(t.notDefinedProp); // notDefinedProp
```

use scoped variables

```js
let prop = 'this is private prop';
let method = function () {
    return 'this is private fn';
};

class Test {
    get prop() {
        return prop;
    }

    test(...args) {
        return method.call(this, ...args);
    }
    __get(name) {
        return name;
    }
}

const t = new Test();
console.log(t.test()); // this is private fn
console.log(t.prop); // this is private prop
console.log(t.notDefinedProp); // notDefinedProp
```
