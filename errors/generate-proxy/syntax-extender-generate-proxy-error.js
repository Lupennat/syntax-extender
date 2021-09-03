const SyntaxExtenderError = require('../syntax-extender-error');

class SyntaxExtenderGenerateProxyError extends SyntaxExtenderError {
    constructor(sourceName, message) {
        super(`${sourceName} ${message}`);
    }
}

module.exports = SyntaxExtenderGenerateProxyError;
