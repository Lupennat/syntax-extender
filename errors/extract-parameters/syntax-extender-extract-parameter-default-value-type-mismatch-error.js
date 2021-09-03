const SyntaxExtenderExtractParameterError = require('./syntax-extender-extract-parameter-error');

class SyntaxExtenderExtractParameterDefaultValueTypeMismatchError extends SyntaxExtenderExtractParameterError {
    constructor(sourceName, name, definitionKey, defaultValue, type) {
        super(
            sourceName,
            name,
            definitionKey,
            `type of default value "${defaultValue}" is not of defined type "${type}".`
        );
    }
}

module.exports = SyntaxExtenderExtractParameterDefaultValueTypeMismatchError;
