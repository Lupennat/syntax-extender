const SyntaxExtenderValidateCompatibilityError = require('./syntax-extender-validate-compatibility-error');

class SyntaxExtenderValidateCompatibilityNotCompatibleError extends SyntaxExtenderValidateCompatibilityError {
    constructor(
        isStatic,
        name,
        sourceName,
        parameters,
        returnDef,
        inheritSourceName,
        inheritParameters,
        inheritReturnDef
    ) {
        super(
            `Declaration of ${
                isStatic ? '' : 'static '
            }${sourceName}.${name}(${parameters})${returnDef} must be compatible with ${inheritSourceName}.${name}(${inheritParameters})${inheritReturnDef}`
        );
    }
}

module.exports = SyntaxExtenderValidateCompatibilityNotCompatibleError;
