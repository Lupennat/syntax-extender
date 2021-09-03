const SyntaxExtenderMetadataError = require('./syntax-extender-metadata-error');

class SyntaxExtenderMetadataNotValidTypeError extends SyntaxExtenderMetadataError {
    constructor(sourceName, type, validTypes) {
        super(sourceName, `type "${type}" not supported, valid types: ${validTypes}.`);
    }
}

module.exports = SyntaxExtenderMetadataNotValidTypeError;
