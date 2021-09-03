const SyntaxExtenderError = require('../syntax-extender-error');

class SyntaxExtenderInterceptorError extends SyntaxExtenderError {
    constructor(message) {
        super(message);
    }
}

module.exports = SyntaxExtenderInterceptorError;
