const SyntaxExtenderInterceptorError = require('./syntax-extender-interceptor-error');

class SyntaxExtenderInterceptorNotADirectoryError extends SyntaxExtenderInterceptorError {
    constructor(path) {
        super(`path can only be a directory, ${path} provided.`);
    }
}

module.exports = SyntaxExtenderInterceptorNotADirectoryError;
