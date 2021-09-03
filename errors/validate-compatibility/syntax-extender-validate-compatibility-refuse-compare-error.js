const SyntaxExtenderValidateCompatibilityError = require('./syntax-extender-validate-compatibility-error');

class SyntaxExtenderValidateCompatibilityRefuseCompareError extends SyntaxExtenderValidateCompatibilityError {
    constructor(
        sourceName,
        name,
        parameters,
        returnDef,
        inheritSourceName,
        inheritName,
        inheritParameters,
        inheritReturnDef
    ) {
        super(
            `refuse to validate compatibility between ${sourceName}.${name}(${parameters})${returnDef} and ${inheritSourceName}.${inheritName}(${inheritParameters})${inheritReturnDef}`
        );
    }
}

module.exports = SyntaxExtenderValidateCompatibilityRefuseCompareError;
