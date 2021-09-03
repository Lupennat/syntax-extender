const SyntaxExtenderError = require('../syntax-extender-error');

class SyntaxExtenderMetadataErorr extends SyntaxExtenderError {
    constructor(sourceName, message) {
        super(`${sourceName} ${message}`);
    }
}

module.exports = SyntaxExtenderMetadataErorr;
