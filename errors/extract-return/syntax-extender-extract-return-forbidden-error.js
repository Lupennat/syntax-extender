const SyntaxExtenderExtractReturnError = require('./syntax-extender-extract-return-error');

class SyntaxExtenderExtractReturnForbiddenError extends SyntaxExtenderExtractReturnError {
    constructor(sourceName, functionName) {
        super(sourceName, functionName, `cannot declare a return type.`);
    }
}

module.exports = SyntaxExtenderExtractReturnForbiddenError;
