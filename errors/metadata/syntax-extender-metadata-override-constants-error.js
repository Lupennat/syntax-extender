const SyntaxExtenderMetadataError = require('./syntax-extender-metadata-error');

class SyntaxExtenderMetadataOverrideConstantsError extends SyntaxExtenderMetadataError {
    constructor(sourceName, constantName, interfaceName) {
        super(
            sourceName,
            `static property "${constantName}" defined on implemented interface "${interfaceName}" can not be overrided.`
        );
    }
}

module.exports = SyntaxExtenderMetadataOverrideConstantsError;
