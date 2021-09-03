'use strict';
const SyntaxExtenderError = require('./syntax-extender-error');

class SyntaxExtenderNotValidArgumentError extends SyntaxExtenderError {
    constructor(message) {
        super(message);
    }
}

module.exports = SyntaxExtenderNotValidArgumentError;
