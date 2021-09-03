const SyntaxExtenderMetadataError = require('./syntax-extender-metadata-error');

class SyntaxExtenderMetadataInterfacePropertyError extends SyntaxExtenderMetadataError {
    constructor(sourceName, propertyName) {
        super(
            sourceName,
            `interface can not have properties, only static properties are allowed, "${propertyName}" founded.`
        );
    }
}

module.exports = SyntaxExtenderMetadataInterfacePropertyError;
