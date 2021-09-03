const SyntaxExtenderValidateParametersError = require('./syntax-extender-validate-parameters-error');

class SyntaxExtenderValidateParametersNotValidParameterError extends SyntaxExtenderValidateParametersError {
    constructor(sourceName, functionName, position, source, given) {
        super(
            sourceName,
            functionName,
            `parameter at position ${position} expected to be "${source}", "${given}" given.`
        );
    }
}

module.exports = SyntaxExtenderValidateParametersNotValidParameterError;
