const SyntaxExtenderError = require('../syntax-extender-error');

class SyntaxExtenderInheritanceError extends SyntaxExtenderError {
    constructor(message) {
        super(message);
    }
}

module.exports = SyntaxExtenderInheritanceError;
