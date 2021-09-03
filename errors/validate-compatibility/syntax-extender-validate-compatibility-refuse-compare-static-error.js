const SyntaxExtenderValidateCompatibilityError = require('./syntax-extender-validate-compatibility-error');

class SyntaxExtenderValidateCompatibilityRefuseCompareStaticError extends SyntaxExtenderValidateCompatibilityError {
    constructor(sourceName, type, name, parameters, returnDef) {
        super(
            `refuse to validate compatibility between static/not-static ${type} ${sourceName}.${name}(${parameters})${returnDef}`
        );
    }
}

module.exports = SyntaxExtenderValidateCompatibilityRefuseCompareStaticError;
