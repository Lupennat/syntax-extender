const SyntaxExtenderExtractDescriptorsError = require('./syntax-extender-extract-descriptors-error');

class SyntaxExtenderExtractDescriptorsDefinitionsMismatchError extends SyntaxExtenderExtractDescriptorsError {
    constructor(sourceName, definitions = []) {
        super(
            sourceName,
            `definitions [${definitions.join(
                ', '
            )}] do not match any setter and method. Please use right definitions key using "static:$name" for statics.`
        );
    }
}

module.exports = SyntaxExtenderExtractDescriptorsDefinitionsMismatchError;
