const SyntaxExtenderExtractParameterError = require('./syntax-extender-extract-parameter-error');

class SyntaxExtenderExtractParameterDestructeredVariadicError extends SyntaxExtenderExtractParameterError {
    constructor(sourceName, name, definitionKey) {
        super(sourceName, name, definitionKey, 'define a variadic destructured parameter is a no-sense pattern.');
    }
}

module.exports = SyntaxExtenderExtractParameterDestructeredVariadicError;
