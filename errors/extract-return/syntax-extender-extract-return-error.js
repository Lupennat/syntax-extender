const SyntaxExtenderError = require('../syntax-extender-error');

class SyntaxExtenderExtractReturnError extends SyntaxExtenderError {
    constructor(sourceName, functionName, message) {
        super(`${sourceName}.${functionName}() ${message}`);
    }
}

module.exports = SyntaxExtenderExtractReturnError;
