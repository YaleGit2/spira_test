'use strict';

module.exports.x509Validator = /x509::.+::.+/i;
module.exports.orgAtChaincodeValidator = /^[\w-]+@([\w-])+[\w-]$/i;
module.exports.orgAtChaincodeGetter = (data) => {
    if (!this.orgAtChaincodeValidator.test(data)) {
        throw new Error('Data format is not valid');
    }
    const s = data.split('@');
    return {
        org: s[0],
        chaincode: s[1]
    };
};
