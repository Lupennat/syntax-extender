const SyntaxExtenderMetadataError = require('./syntax-extender-metadata-error');

class SyntaxExtenderMetadataMissingAbstractsError extends SyntaxExtenderMetadataError {
    constructor(sourceName, isStatic, type, targetName, name) {
        super(
            sourceName,
            `contains abstract ${
                isStatic ? 'static ' : ''
            }${type} and must therefore be declared abstract or implement the remaining ${
                isStatic ? 'static ' : ''
            }${type} ${targetName}.${name}.`
        );
    }
}

module.exports = SyntaxExtenderMetadataMissingAbstractsError;
