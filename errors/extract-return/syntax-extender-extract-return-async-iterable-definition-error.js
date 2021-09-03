const SyntaxExtenderExtractReturnError = require('./syntax-extender-extract-return-error');

class SyntaxExtenderExtractReturnAsyncIterableDefinitionError extends SyntaxExtenderExtractReturnError {
    constructor(sourceName, functionName, type) {
        super(
            sourceName,
            functionName,
            `cannot declare a return type "${type}" on async generator function, please use syntax { 'return->' : 'iterable' } or key "return->*" to define type.`
        );
    }
}

module.exports = SyntaxExtenderExtractReturnAsyncIterableDefinitionError;
