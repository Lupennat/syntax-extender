const SyntaxExtenderTypeCastingError = require('./syntax-extender-type-casting-error');

class SyntaxExtenderTypeCastingInvalidError extends SyntaxExtenderTypeCastingError {
    constructor(definition) {
        super(
            `definition "${definition}" must be a valid type declaration, class, constructor function or require path.`
        );
    }
}

module.exports = SyntaxExtenderTypeCastingInvalidError;
