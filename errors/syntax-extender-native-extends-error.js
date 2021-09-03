'use strict';
const SyntaxExtenderError = require('./syntax-extender-error');

class SyntaxExtenderNativeExtendsError extends SyntaxExtenderError {
    constructor(sourceName, key) {
        super(`native extends is not supported for ${sourceName} use "${key}" static property.`);
    }
}

module.exports = SyntaxExtenderNativeExtendsError;
