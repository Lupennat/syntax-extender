const SyntaxExtenderExtractParameterError = require('./syntax-extender-extract-parameter-error');

class SyntaxExtenderExtractParameterDefaultValueEvaluationError extends SyntaxExtenderExtractParameterError {
    constructor(sourceName, name, definitionKey, defaultValue, message) {
        super(
            sourceName,
            name,
            definitionKey,
            `"${defaultValue}" evaluation throw "${message}", please change default value.`
        );
    }
}

module.exports = SyntaxExtenderExtractParameterDefaultValueEvaluationError;
