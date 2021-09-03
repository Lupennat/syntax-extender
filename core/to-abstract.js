'use strict';

const { ABSTRACT } = require('./constants');

const toBaseClass = require('./to-base-class');

const toAbstract = (source, filepath = '', namespace = '', moduleId = '') => {
    return toBaseClass(source, ABSTRACT, filepath, namespace, moduleId);
};

module.exports = toAbstract;
