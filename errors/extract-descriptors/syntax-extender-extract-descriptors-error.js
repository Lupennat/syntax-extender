const SyntaxExtenderError = require('../syntax-extender-error');

class SyntaxExtenderExtractDescriptorsError extends SyntaxExtenderError {
    constructor(sourceName, message) {
        super(`${sourceName} ${message}`);
    }
}

module.exports = SyntaxExtenderExtractDescriptorsError;
