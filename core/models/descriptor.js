'use strict';

const util = require('util');

const Parameters = require('./parameters');
const Return = require('./return');

class Descriptor extends Object {
    constructor(...args) {
        super(...args);
        Object.defineProperties(this, {
            isAbstract: {
                value: false,
                enumerable: false,
                writable: true
            },
            name: {
                value: '',
                enumerable: false,
                writable: true
            },
            originalName: {
                value: '',
                enumerable: false,
                writable: true
            },
            parameters: {
                value: new Parameters(),
                enumerable: false,
                writable: true
            },
            isMagic: {
                value: false,
                enumerable: false,
                writable: true
            },
            isStatic: {
                value: false,
                enumerable: false,
                writable: true
            },
            sourceName: {
                value: '',
                enumerable: false,
                writable: true
            },
            sourceUuid: {
                value: '',
                enumerable: false,
                writable: true
            },
            sourceNamespace: {
                value: '',
                enumerable: false,
                writable: true
            },
            sourceModuleId: {
                value: '',
                enumerable: false,
                writable: true
            },
            return: {
                value: new Return(),
                enumerable: false,
                writable: true
            },
            type: {
                value: '',
                enumerable: false,
                writable: true
            },
            visibility: {
                value: '',
                enumerable: false,
                writable: true
            },
            value: {
                value: '',
                enumerable: false,
                writable: true
            }
        });
        Object.seal(this);
    }

    clone() {
        const cloned = new Descriptor();
        cloned.isAbstract = this.isAbstract;
        cloned.isMagic = this.isMagic;
        cloned.name = this.name;
        cloned.originalName = this.originalName;
        cloned.parameters = this.parameters.clone();
        cloned.isStatic = this.isStatic;
        cloned.return = this.return.clone();
        cloned.sourceName = this.sourceName;
        cloned.sourceNamespace = this.sourceNamespace;
        cloned.sourceModuleId = this.sourceModuleId;
        cloned.type = this.type;
        cloned.value = this.value;
        cloned.visibility = this.visibility;

        return cloned;
    }

    inspect() {
        return util.inspect(this.toObject(), { showHidden: false, depth: null });
    }

    toObject() {
        return {
            isAbstract: this.isAbstract,
            isMagic: this.isMagic,
            name: this.name,
            originalName: this.originalName,
            parameters: this.parameters.toObject(),
            isStatic: this.isStatic,
            return: this.return.toObject(),
            sourceName: this.sourceName,
            sourceUuid: this.sourceUuid,
            sourceNamespace: this.sourceNamespace,
            sourceModuleId: this.sourceModuleId,
            type: this.type,
            value: this.value,
            visibility: this.visibility
        };
    }
}

Object.seal(Descriptor);

module.exports = Descriptor;
