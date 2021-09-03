'use strict';

const { SEDEF_STATIC } = require('./constants');

module.exports = {
    COMPATIBILITY_DEFAULT: true,
    MAGIC_DEFAULT: true,
    VALIDATION_DEFAULT: true,
    CONSTRUCTOR_DEFAULT: true,
    CHECKDEFAULT_DEFAULT: false, // experimental
    COMMENT_DEFAULT: false, // experimental
    PRIORITY_DEFAULT: SEDEF_STATIC, // experimental
    ACCESSIBILITY_DEFAULT: true // experimental
};
