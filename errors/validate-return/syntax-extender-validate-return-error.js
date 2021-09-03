const SyntaxExtenderRunningError = require('../syntax-extender-running-error');

class SyntaxExtenderValidateReturnError extends SyntaxExtenderRunningError {
    constructor(sourceName, functionName, message) {
        super(`${sourceName}.${functionName} ${message}`);
    }
}

module.exports = SyntaxExtenderValidateReturnError;
