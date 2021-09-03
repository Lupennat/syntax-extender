const SyntaxExtenderValidateParametersError = require('./syntax-extender-validate-parameters-error');

class SyntaxExtenderValidateParametersMissingDestructuredPropertyError extends SyntaxExtenderValidateParametersError {
    constructor(sourceName, functionName, parentPosition, name) {
        super(sourceName, functionName, `at position ${parentPosition}: missing destructured property "${name}".`);
    }
}

module.exports = SyntaxExtenderValidateParametersMissingDestructuredPropertyError;
