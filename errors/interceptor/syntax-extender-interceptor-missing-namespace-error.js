const SyntaxExtenderInterceptorError = require('./syntax-extender-interceptor-error');

class SyntaxExtenderInterceptorMissingNamespaceError extends SyntaxExtenderInterceptorError {
    constructor(namespace) {
        super(`namespace ${namespace} is missing, please register namespace before providing an hook.`);
    }
}

module.exports = SyntaxExtenderInterceptorMissingNamespaceError;
