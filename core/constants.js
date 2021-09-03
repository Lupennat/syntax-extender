'use strict';

module.exports.NATIVE_CONSTRUCTOR = /^\s*?constructor\s*?\(\s*([^)]*)\)/m;
module.exports.NATIVE_THIS_PRIVATE = /\s*?this\.(constructor\.)?#\S/gm;
module.exports.NATIVE_EXTENDS = /^\s*?class.*[\s].*[\S].*[\s]extends/m;
module.exports.STRIP_ALL_COMMENTS = /((\/\/.*$)|(\/\*[\s\S]*?\*\/))/gm;
module.exports.ALL_SPACES = /\s/gm;
module.exports.STRIP_ALL_MULTIPLE_SPACE_AND_LINE = /\s\s+/g;
module.exports.STRIP_LINE_COMMENTS = /(\/\/.*$)/gm;

// bypass argument
module.exports.BYPASSARGUMENT = Symbol('syntax-extender:bypassargument');

// magic methods
module.exports.CONSTRUCT = '__construct';
module.exports.GET = '__get';
module.exports.SET = '__set';
module.exports.HAS = '__has';
module.exports.DELETE = '__delete';
module.exports.STATICGET = '__getStatic';
module.exports.STATICSET = '__setStatic';

// type of extender classes
module.exports.INTERFACE = '__interface';
module.exports.CLASS = '__class';
module.exports.CLASSINHERIT = '__classinherit';
module.exports.ABSTRACT = '__abstract';
module.exports.MODULEID = '__moduleId';

// key for descriptors type
module.exports.METHOD = 'method';
module.exports.SETTER = 'setter';
module.exports.GETTER = 'getter';
module.exports.PROPERTY = 'property';

// key for visibility type
module.exports.PRIVATE = 'private';
module.exports.PROTECTED = 'protected';
module.exports.PUBLIC = 'public';

// type checkingPriority
module.exports.PROMISE = 'promise';
module.exports.ITERABLE = 'iterable';

// wildcard key type
module.exports.TYPE_ANY = 'any';
// symbol for metadata
module.exports.METADATA = Symbol('syntax-extender:metadata');
// symbol for uuid
module.exports.UUID = Symbol('syntax-extender:uuid');
// symbol for handlers
module.exports.HANDLERS = Symbol('syntax-extender:handlers');

// default name when missing
module.exports.ANONYMOUS = 'anonymous';

// definition priority
module.exports.SEDEF_COMMENT = 'COMMENT';
module.exports.SEDEF_STATIC = 'STATIC';

// syntax extender reserved keywords
module.exports.ABSTRACTS = '__abstracts';
module.exports.EXTENDS = '__extends';
module.exports.IMPLEMENTS = '__implements';
module.exports.DEFINE = '__define';

// experimental keywords
Symbol.for('CHECKDEFAULT');
module.exports.CHECKDEFAULT = Symbol.for('CHECKDEFAULT');
Symbol.for('COMMENT');
module.exports.COMMENT = Symbol.for('COMMENT');
Symbol.for('PRIORITY');
module.exports.PRIORITY = Symbol.for('PRIORITY');

// feature keywords
Symbol.for('ACCESSIBILITY');
module.exports.ACCESSIBILITY = Symbol.for('ACCESSIBILITY');
Symbol.for('CONSTRUCTOR');
module.exports.CONSTRUCTOR = Symbol.for('CONSTRUCTOR');
Symbol.for('COMPATIBILITY');
module.exports.COMPATIBILITY = Symbol.for('COMPATIBILITY');
Symbol.for('MAGIC');
module.exports.MAGIC = Symbol.for('MAGIC');
Symbol.for('VALIDATION');
module.exports.VALIDATION = Symbol.for('VALIDATION');

// all features to check
module.exports.FEATURES = {
    CHECKDEFAULT: this.CHECKDEFAULT,
    COMMENT: this.COMMENT,
    ACCESSIBILITY: this.ACCESSIBILITY,
    VALIDATION: this.VALIDATION,
    MAGIC: this.MAGIC,
    COMPATIBILITY: this.COMPATIBILITY,
    CONSTRUCTOR: this.CONSTRUCTOR
};

// all reserved keywords (dont trap and remove from source)
module.exports.RESERVED = [
    this.INTERFACE,
    this.CLASS,
    this.CLASSINHERIT,
    this.ABSTRACT,
    this.ABSTRACTS,
    this.EXTENDS,
    this.IMPLEMENTS,
    this.DEFINE,
    this.PRIORITY
].concat(Object.values(this.FEATURES));

// all internal keywords (dont trap)
module.exports.INTERNAL = [this.UUID, this.METADATA, this.HANDLERS];

module.exports.INTERFACEMANDATORY = ['CONSTRUCTOR', 'COMPATIBILITY', 'VALIDATION', 'MAGIC', 'ACCESSIBILITY'];
