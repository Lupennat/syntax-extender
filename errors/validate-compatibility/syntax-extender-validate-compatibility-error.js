const SyntaxExtenderError = require('../syntax-extender-error');

class SyntaxExtenderValidateCompatibilityError extends SyntaxExtenderError {
    constructor(message) {
        super(message);
    }
}

module.exports = SyntaxExtenderValidateCompatibilityError;
