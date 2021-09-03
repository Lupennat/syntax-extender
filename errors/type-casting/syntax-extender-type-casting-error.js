const SyntaxExtenderError = require('../syntax-extender-error');

class SyntaxExtenderTypeCastingError extends SyntaxExtenderError {
    constructor(message) {
        super(message);
    }
}

module.exports = SyntaxExtenderTypeCastingError;
