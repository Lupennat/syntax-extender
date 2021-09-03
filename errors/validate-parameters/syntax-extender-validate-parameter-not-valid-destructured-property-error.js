const SyntaxExtenderValidateParametersError = require('./syntax-extender-validate-parameters-error');

class SyntaxExtenderValidateParametersNotValidDestructuredPropertyError extends SyntaxExtenderValidateParametersError {
    constructor(sourceName, functionName, parentPosition, name, source, given) {
        super(
            sourceName,
            functionName,
            `at position ${parentPosition}: property "${name}" expected to be "${source}", "${given}" given.`
        );
    }
}

module.exports = SyntaxExtenderValidateParametersNotValidDestructuredPropertyError;
