const SyntaxExtenderExtractParameterError = require('./syntax-extender-extract-parameter-error');

class SyntaxExtenderExtractParameterDestructeredInternalVariadicError extends SyntaxExtenderExtractParameterError {
    constructor(sourceName, name, definitionKey) {
        super(sourceName, name, definitionKey, 'definition is forbidden for variadic destructured parameter.');
    }
}

module.exports = SyntaxExtenderExtractParameterDestructeredInternalVariadicError;
