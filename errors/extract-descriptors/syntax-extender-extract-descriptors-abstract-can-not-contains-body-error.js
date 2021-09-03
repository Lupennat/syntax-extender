const SyntaxExtenderExtractDescriptorsError = require('./syntax-extender-extract-descriptors-error');

class SyntaxExtenderExtractDescriptorsAbstractCanNotContainsBodyError extends SyntaxExtenderExtractDescriptorsError {
    constructor(sourceName, name, isStatic) {
        super(sourceName, `${isStatic ? 'static ' : ''}abstract function "${name}" can not contains body.`);
    }
}

module.exports = SyntaxExtenderExtractDescriptorsAbstractCanNotContainsBodyError;
