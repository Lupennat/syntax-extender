const SyntaxExtenderMetadataError = require('./syntax-extender-metadata-error');

class SyntaxExtenderMetadataAlreadyExtendedInterfaceError extends SyntaxExtenderMetadataError {
    constructor(sourceName, targetName) {
        super(sourceName, `cannot extends previously extended interface "${targetName}".`);
    }
}

module.exports = SyntaxExtenderMetadataAlreadyExtendedInterfaceError;
