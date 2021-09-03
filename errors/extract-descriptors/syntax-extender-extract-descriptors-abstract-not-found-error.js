const SyntaxExtenderExtractDescriptorsError = require('./syntax-extender-extract-descriptors-error');

class SyntaxExtenderExtractDescriptorsAbstractNotFoundError extends SyntaxExtenderExtractDescriptorsError {
    constructor(sourceName, abstract, name) {
        super(sourceName, `abstract "${abstract}" mapped as "${name}" not found.`);
    }
}

module.exports = SyntaxExtenderExtractDescriptorsAbstractNotFoundError;
