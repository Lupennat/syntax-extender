describe('Test Suit', function () {
    describe('syntax extender features', require('./tests/features'));
    describe('syntax extender type validation', require('./tests/type-validation'));
    describe('syntax extender extract parameters', require('./tests/extract-parameters'));
    describe('syntax extender validate parameters', require('./tests/validate-parameters'));
    describe('syntax extender extract return', require('./tests/extract-return'));
    describe('syntax extender validate return', require('./tests/validate-return'));
    describe('syntax extender extract descriptors', require('./tests/extract-descriptors'));
    describe('syntax extender validate compatibility', require('./tests/validate-compatibility'));
    describe('syntax extender extract inherited', require('./tests/extract-inherited'));
    describe('syntax extender metadata', require('./tests/metadata'));
    describe('syntax extender interface', require('./tests/to-interface'));
    describe('syntax extender abstracts', require('./tests/to-abstract'));
    describe('syntax extender class', require('./tests/to-class'));
    describe('syntax extender magic methods', require('./tests/magic-methods'));
    describe('syntax extender interceptor', require('./tests/interceptor'));
});
