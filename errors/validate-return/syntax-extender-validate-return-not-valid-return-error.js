const SyntaxExtenderValidateReturnError = require('./syntax-extender-validate-return-error');

class SyntaxExtenderValidateReturnNotValidReturnError extends SyntaxExtenderValidateReturnError {
    constructor(sourceName, functionName, source, given) {
        super(sourceName, functionName, `returned value expected to be "${source}", "${given}" returned.`);
    }
}

module.exports = SyntaxExtenderValidateReturnNotValidReturnError;
