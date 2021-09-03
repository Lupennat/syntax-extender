const SyntaxExtenderMetadataError = require('./syntax-extender-metadata-error');

class SyntaxExtenderMetadataPrivatesOnInterfaceError extends SyntaxExtenderMetadataError {
    constructor(sourceName) {
        super(sourceName, `cannot have native private members or methods.`);
    }
}

module.exports = SyntaxExtenderMetadataPrivatesOnInterfaceError;
