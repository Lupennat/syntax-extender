const SyntaxExtenderExtractParameterError = require('./syntax-extender-extract-parameter-error');

class SyntaxExtenderExtractParameterAvoidCustomTypeDestructuredDefinitionError extends SyntaxExtenderExtractParameterError {
    constructor(sourceName, name, definitionKey, customDestructered) {
        super(
            sourceName,
            name,
            definitionKey,
            `avoid definition of destructured properties if you define the parameter as custom type "${customDestructered}".`
        );
    }
}

module.exports = SyntaxExtenderExtractParameterAvoidCustomTypeDestructuredDefinitionError;
