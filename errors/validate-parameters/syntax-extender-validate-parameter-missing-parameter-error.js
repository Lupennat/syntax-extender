const SyntaxExtenderValidateParametersError = require('./syntax-extender-validate-parameters-error');

class SyntaxExtenderValidateParametersMissingParameterError extends SyntaxExtenderValidateParametersError {
    constructor(sourceName, functionName, position) {
        super(sourceName, functionName, `missing parameters at position ${position}.`);
    }
}

module.exports = SyntaxExtenderValidateParametersMissingParameterError;
