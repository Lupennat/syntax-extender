const SyntaxExtenderExtractDescriptorsError = require('./syntax-extender-extract-descriptors-error');

class SyntaxExtenderExtractDescriptorsAbstractNotAbstractCollisionError extends SyntaxExtenderExtractDescriptorsError {
    constructor(sourceName, name, isStatic) {
        super(sourceName, `${isStatic ? 'static ' : ''}"${name}" is defined both abstract and not abstract.`);
    }
}

module.exports = SyntaxExtenderExtractDescriptorsAbstractNotAbstractCollisionError;
