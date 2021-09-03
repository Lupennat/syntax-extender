const SyntaxExtenderValidateCompatibilityError = require('./syntax-extender-validate-compatibility-error');

class SyntaxExtenderValidateCompatibilityRefuseComparePropertiesError extends SyntaxExtenderValidateCompatibilityError {
    constructor(sourceName, type, name) {
        super(`refuse to validate compatibility between ${type} ${sourceName}.${name}`);
    }
}

module.exports = SyntaxExtenderValidateCompatibilityRefuseComparePropertiesError;
