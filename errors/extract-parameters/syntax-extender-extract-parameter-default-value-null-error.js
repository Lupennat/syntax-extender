const SyntaxExtenderExtractParameterError = require('./syntax-extender-extract-parameter-error');

class SyntaxExtenderExtractParameterDefaultValueNullError extends SyntaxExtenderExtractParameterError {
    constructor(sourceName, name, definitionKey, defaultValue) {
        super(
            sourceName,
            name,
            definitionKey,
            `default value can be only "null" or "undefined", "${defaultValue}" provided.`
        );
    }
}

module.exports = SyntaxExtenderExtractParameterDefaultValueNullError;
