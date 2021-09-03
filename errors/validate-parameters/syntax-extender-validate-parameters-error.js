const SyntaxExtenderRunningError = require('../syntax-extender-running-error');

class SyntaxExtenderValidateParametersError extends SyntaxExtenderRunningError {
    constructor(sourceName, functionName, message) {
        super(`${sourceName}.${functionName} ${message}`);
    }
}

module.exports = SyntaxExtenderValidateParametersError;
