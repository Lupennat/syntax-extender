'use strict';
const SyntaxExtenderError = require('./syntax-extender-error');

class SyntaxExtenderNotValidTypeError extends SyntaxExtenderError {
    constructor(message) {
        super(message);
    }
}

module.exports = SyntaxExtenderNotValidTypeError;
