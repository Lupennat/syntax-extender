'use strict';
const SyntaxExtenderError = require('./syntax-extender-error');

class SyntaxExtenderNotAClassError extends SyntaxExtenderError {
    constructor() {
        super('given source is not a class');
    }
}

module.exports = SyntaxExtenderNotAClassError;
