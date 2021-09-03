const SyntaxExtenderMetadataError = require('./syntax-extender-metadata-error');

class SyntaxExtenderMetadataWrongInterfaceError extends SyntaxExtenderMetadataError {
    constructor(targetName) {
        super(targetName, `provided is not a valid interface.`);
    }
}

module.exports = SyntaxExtenderMetadataWrongInterfaceError;
