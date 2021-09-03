const SyntaxExtenderError = require('../syntax-extender-error');

class SyntaxExtenderExtractParametersError extends SyntaxExtenderError {
    constructor(sourceName, message) {
        super(`${sourceName} ${message}`);
    }
}

module.exports = SyntaxExtenderExtractParametersError;
