const SyntaxExtenderTypeCastingError = require('./syntax-extender-type-casting-error');

class SyntaxExtenderTypeCastingMultipleInvalidError extends SyntaxExtenderTypeCastingError {
    constructor(definition, type) {
        super(`multiple definition "${definition}", is not valid for type "${type}".`);
    }
}

module.exports = SyntaxExtenderTypeCastingMultipleInvalidError;
