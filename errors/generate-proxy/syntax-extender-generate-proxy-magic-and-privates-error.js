const SyntaxExtenderGenerateProxyError = require('./syntax-extender-generate-proxy-error');

class SyntaxExtenderGenerateProxyMagicAndPrivatesError extends SyntaxExtenderGenerateProxyError {
    constructor(sourceName) {
        super(
            sourceName,
            'can not contains privates members or methods referring to "this.#" or "this.constructor.#" scope if magic methods __get, __set, __has or __delete are defined.'
        );
    }
}

module.exports = SyntaxExtenderGenerateProxyMagicAndPrivatesError;
