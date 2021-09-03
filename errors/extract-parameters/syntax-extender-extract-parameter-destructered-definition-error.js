const SyntaxExtenderExtractParameterError = require('./syntax-extender-extract-parameter-error');

class SyntaxExtenderExtractParameterDestructeredDefinitionError extends SyntaxExtenderExtractParameterError {
    constructor(sourceName, name, definitionKey) {
        super(
            sourceName,
            name,
            definitionKey,
            'destructured parameter can only be defined as "dictionary" or custom class, you can define destructured internal parameters using syntax "x.1", "x.2", ...'
        );
    }
}

module.exports = SyntaxExtenderExtractParameterDestructeredDefinitionError;
