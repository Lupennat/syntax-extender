const SyntaxExtenderExtractReturnError = require('./syntax-extender-extract-return-error');

class SyntaxExtenderExtractReturnIterableDefinitionError extends SyntaxExtenderExtractReturnError {
    constructor(sourceName, functionName, type) {
        super(
            sourceName,
            functionName,
            `cannot declare a return type "${type}" on generator function, please use key "return*" instead "return".`
        );
    }
}

module.exports = SyntaxExtenderExtractReturnIterableDefinitionError;
