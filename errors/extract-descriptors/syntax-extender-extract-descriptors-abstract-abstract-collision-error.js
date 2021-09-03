const SyntaxExtenderExtractDescriptorsError = require('./syntax-extender-extract-descriptors-error');

class SyntaxExtenderExtractDescriptorsAbstractAbstractCollisionError extends SyntaxExtenderExtractDescriptorsError {
    constructor(sourceName, name, firstAbstract, secondAbstract, isStatic) {
        super(
            sourceName,
            `${
                isStatic ? 'static ' : ''
            }"${firstAbstract}" is mapped as "${name}" but same name is already defined for abstract "${secondAbstract}".`
        );
    }
}

module.exports = SyntaxExtenderExtractDescriptorsAbstractAbstractCollisionError;
