const SyntaxExtenderMetadataError = require('./syntax-extender-metadata-error');

class SyntaxExtenderMetadataAccessTypeOnInterfaceError extends SyntaxExtenderMetadataError {
    constructor(sourceName, type, name, isStatic) {
        super(sourceName, `Access type for ${isStatic ? 'static ' : ''}${type} "${name}" must be omitted.`);
    }
}

module.exports = SyntaxExtenderMetadataAccessTypeOnInterfaceError;
