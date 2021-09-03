const SyntaxExtenderExtractReturnError = require('./syntax-extender-extract-return-error');

class SyntaxExtenderExtractReturnAsyncDefinitionError extends SyntaxExtenderExtractReturnError {
    constructor(sourceName, functionName, type) {
        super(
            sourceName,
            functionName,
            `cannot declare a return type "${type}" on async function, please use key "return->" instead "return".`
        );
    }
}

module.exports = SyntaxExtenderExtractReturnAsyncDefinitionError;
