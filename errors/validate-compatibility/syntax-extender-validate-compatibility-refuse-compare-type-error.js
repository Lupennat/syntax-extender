const SyntaxExtenderValidateCompatibilityError = require('./syntax-extender-validate-compatibility-error');

class SyntaxExtenderValidateCompatibilityRefuseCompareTypeError extends SyntaxExtenderValidateCompatibilityError {
    constructor(
        sourceName,
        type,
        name,
        parameters,
        returnDef,
        inheritSourceName,
        inheritType,
        inheritName,
        inheritParameters,
        inheritReturnDef
    ) {
        super(
            `refuse to validate compatibility between ${type} ${sourceName}.${name}(${parameters})${returnDef} and ${inheritType} ${inheritSourceName}.${inheritName}(${inheritParameters}${inheritReturnDef})`
        );
    }
}

module.exports = SyntaxExtenderValidateCompatibilityRefuseCompareTypeError;
