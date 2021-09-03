const SyntaxExtenderTypeCastingError = require('./syntax-extender-type-casting-error');

class SyntaxExtenderTypeCastingWrongSourceTypeError extends SyntaxExtenderTypeCastingError {
    constructor(definition) {
        super(`definition ${definition} need class or constructor function as source.`);
    }
}

module.exports = SyntaxExtenderTypeCastingWrongSourceTypeError;
