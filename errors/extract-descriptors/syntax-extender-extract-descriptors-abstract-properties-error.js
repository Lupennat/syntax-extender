const SyntaxExtenderExtractDescriptorsError = require('./syntax-extender-extract-descriptors-error');

class SyntaxExtenderExtractDescriptorsAbstractPropertiesError extends SyntaxExtenderExtractDescriptorsError {
    constructor(sourceName, name, isStatic) {
        super(sourceName, `abstract definition is forbidden for ${isStatic ? 'static ' : ''}property "${name}".`);
    }
}

module.exports = SyntaxExtenderExtractDescriptorsAbstractPropertiesError;
