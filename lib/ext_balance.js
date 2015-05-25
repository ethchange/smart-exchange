/**
 * This script should be run as child process
 */
var web3 = require('web3');
web3.setProvider(new web3.providers.HttpProvider("http://localhost:8545"));

var utils = require('./utils');
var errors = require('./errors');

var balance = function (identifier, callback) {
    try {
        if (!utils.validateIdentifier(identifier)) {
            return callback(errors.IDENTIFIER_IS_INCORRECT);
        }

        var address = web3.eth.namereg.addr(identifier);
        if (utils.isEmptyAddress(address)) {
            return callback(errors.IDENTIFIER_NO_ADDRESS);
        }

        var balance = web3.eth.getBalance(address);
        callback(null, balance);
    } catch (err) {
        callback(errors.UNKNOWN_ERROR(err));
    };
};

module.exports = balance;

