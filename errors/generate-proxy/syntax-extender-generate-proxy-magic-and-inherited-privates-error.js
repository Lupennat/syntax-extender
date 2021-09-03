const SyntaxExtenderGenerateProxyError = require('./syntax-extender-generate-proxy-error');

class SyntaxExtenderGenerateProxyMagicAndInheritedPrivatesError extends SyntaxExtenderGenerateProxyError {
    constructor(sourceName, targetName) {
        super(
            sourceName,
            `can not contains magic methods __get, __set, __has or __delete because inherited class ${targetName} contains private members or methods referring to "this.#" or "this.constructor.#" scope.`
        );
    }
}

module.exports = SyntaxExtenderGenerateProxyMagicAndInheritedPrivatesError;
