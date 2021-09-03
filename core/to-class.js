'use strict';

const { CLASS } = require('./constants');

const toBaseClass = require('./to-base-class');

const toClass = (source, filepath = '', namespace = '', moduleId = '') => {
    return toBaseClass(source, CLASS, filepath, namespace, moduleId);
};

module.exports = toClass;
