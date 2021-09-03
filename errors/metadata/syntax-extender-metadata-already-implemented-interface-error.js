const SyntaxExtenderMetadataError = require('./syntax-extender-metadata-error');

class SyntaxExtenderMetadataAlreadyImplementedInterfaceError extends SyntaxExtenderMetadataError {
    constructor(sourceName, targetName) {
        super(sourceName, `cannot implements previously implemented interface "${targetName}".`);
    }
}

module.exports = SyntaxExtenderMetadataAlreadyImplementedInterfaceError;
