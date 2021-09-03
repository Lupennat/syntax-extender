const SyntaxExtenderExtractParametersError = require('./syntax-extender-extract-parameters-error');

class SyntaxExtenderExtractParameterError extends SyntaxExtenderExtractParametersError {
    constructor(sourceName, name, definitionKey, message) {
        super(sourceName, `definition of "${name}" at position ${definitionKey}: ${message}`);
    }
}

module.exports = SyntaxExtenderExtractParameterError;
