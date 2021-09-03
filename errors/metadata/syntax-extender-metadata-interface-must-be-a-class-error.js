const SyntaxExtenderMetadataError = require('./syntax-extender-metadata-error');

class SyntaxExtenderMetadataInterfaceMustBeAClassError extends SyntaxExtenderMetadataError {
    constructor(sourceName) {
        super(sourceName, `only javascript classes can be interfaces.`);
    }
}

module.exports = SyntaxExtenderMetadataInterfaceMustBeAClassError;
