'use strict';
const SyntaxExtenderError = require('./syntax-extender-error');

class SyntaxExtenderNativeConstructorError extends SyntaxExtenderError {
    constructor(sourceName, key) {
        super(`native constructor is not supported for ${sourceName} use "${key}" method.`);
    }
}

module.exports = SyntaxExtenderNativeConstructorError;
