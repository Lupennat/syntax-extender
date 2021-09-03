'use strict';
const SyntaxExtenderError = require('./syntax-extender-error');

class SyntaxExtenderRunningError extends SyntaxExtenderError {
    constructor(message) {
        super(message);
    }
}

module.exports = SyntaxExtenderRunningError;
