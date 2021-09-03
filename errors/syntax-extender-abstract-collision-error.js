'use strict';
const SyntaxExtenderError = require('./syntax-extender-error');

class SyntaxExtenderAbstractCollisionError extends SyntaxExtenderError {
    constructor(sourceName, name) {
        super(`${sourceName} you have defined abstract "${name}" both method and accessor.`);
    }
}

module.exports = SyntaxExtenderAbstractCollisionError;
