var BigNumber = require('bignumber.js');

/**
 * This function should be called to validate identifier
 *
 * @method validateIdentifier
 * @param {String} identifier
 * @returns {Boolean} true if it is valid, otherwise false
 */
var validateIdentifier = function (identifier) {
    return /^[0-9A-Z]{4}$/g.test(identifier);
};

/**
 * This function should be called to validate userid
 *
 * @method validateUserid
 * @param {String} userid
 * @returns {Boolean} true if it is valid, otherwise false
 */
var validateUserid = function (userid) {
    return /^[0-9A-Z]{9}$/g.test(userid);
};

/**
 * This function should be called to validate address
 *
 * @method validateAddress
 * @param {String} address
 * @returns {Boolean} true if it valid, otherwise false
 */
var validateAddress = function (address) {
    return /^0x[0-9a-f]{40}$/g.test(address);
};

/**
 * This function should be called to validate direct IBAN
 *
 * @method validateDirectIBAN
 * @param {String} iban
 * @returns {Boolean} true if it is valid, otherwise false
 */
var validateDirectIBAN = function (iban) {
    return /^XE[0-9]{2}[0-9A-Z]{30,31}/g.test(iban);
};

/**
 * This function should be called to transfer direct IBAN to 
 * ethereum address
 *
 * @method directIBANToAddress
 * @param {String} iban
 * @returns {String} ethereum address
 */
var directIBANToAddress = function (iban) {
    return '0x' + (new BigNumber(iban.substr(4), 36).toString(16));
};

/**
 * This function should be called to validate indirect IBAN
 *
 * @method validateIndirectIBAN
 * @param {String} iban
 * @returns {Boolean} true if it is valid, otherwise false
 */
var validateIndirectIBAN = function (iban) {
    return /^XE[0-9]{2}ETH[0-9A-Z]{13}$/g.test(iban);
};

/**
 * This function should be called to get indirect IBAN's identifier
 *
 * @method indirectIBANToIdentifier
 * @param {String} iban
 * @returns {String} identifier
 */
var indirectIBANToIdentifier = function (iban) {
    return iban.substr(7, 4);
};

/**
 * This function should be called to get indirect IBAN's userid
 *
 * @method indirectIBANToUserid
 * @param {String} iban
 * @returns {String} userid
 */
var indirectIBANToUserid = function (iban) {
    return iban.substr(11);
};

/**
 * This function should be called to check if address is empty
 *
 * @method isEmptyAddress
 * @param {String} address
 * @returns {Boolean} true if the address is empty
 */
var isEmptyAddress = function (address) {
    return address === '0x0000000000000000000000000000000000000000' || address === '0x';
};

module.exports = {
    validateIdentifier: validateIdentifier,
    validateUserid: validateUserid,
    validateAddress: validateAddress,
    validateDirectIBAN: validateDirectIBAN,
    validateIndirectIBAN: validateIndirectIBAN,
    directIBANToAddress: directIBANToAddress,
    indirectIBANToUserid: indirectIBANToUserid,
    indirectIBANToIdentifier: indirectIBANToIdentifier,
    isEmptyAddress: isEmptyAddress
};

