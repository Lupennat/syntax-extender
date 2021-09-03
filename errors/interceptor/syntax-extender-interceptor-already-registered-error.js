const SyntaxExtenderInterceptorError = require('./syntax-extender-interceptor-error');

class SyntaxExtenderInterceptorAlreadyRegisteredError extends SyntaxExtenderInterceptorError {
    constructor(first, second, value) {
        super(`${first} already registered with ${second} "${value}".`);
    }
}

module.exports = SyntaxExtenderInterceptorAlreadyRegisteredError;
