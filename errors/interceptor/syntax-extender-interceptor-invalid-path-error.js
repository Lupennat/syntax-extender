const SyntaxExtenderInterceptorError = require('./syntax-extender-interceptor-error');

class SyntaxExtenderInterceptorInvalidPathError extends SyntaxExtenderInterceptorError {
    constructor(path) {
        super(`invalid path "${path}" provided, please provide an existing absolute path.`);
    }
}

module.exports = SyntaxExtenderInterceptorInvalidPathError;
