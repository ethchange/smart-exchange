/**
 * This script should be run as child process
 */
var fs = require('fs');
var web3 = require('web3');
web3.setProvider(new web3.providers.HttpProvider("http://localhost:8545"));

var utils = require('./utils');
var errors = require('./errors');

var owner = web3.eth.coinbase;


var create = function (identifier, overwrite, callback) {
    try {
        if (!utils.validateIdentifier(identifier)) {
            return callback(errors.IDENTIFIER_IS_INCORRECT);
        }

        var idOwner = web3.eth.namereg.owner(identifier);
        if (!utils.isEmptyAddress(idOwner)) {
            if (idOwner !== owner) {
                return callback(errors.IDENTIFIER_NOT_OWNED);
            }

            if (!overwrite) {
                return callback(errors.IDENTIFIER_CANNOT_OVERWRITE);
            }
        }

        var file = fs.readFileSync(__dirname + '/contracts/SmartExchange.sol');
        var compiled = web3.eth.compile.solidity(file.toString());

        var code = compiled.SmartExchange.code;
        var abi = compiled.SmartExchange.info.abiDefinition;

        var SmartExchange = web3.eth.contract(abi).new({data: code, from: owned});

        web3.eth.namreg.setAddress(identifier, SmartExchange.address, true, {from: owned});
        callback(null, SmartExchange.address);
    } catch (err) {
        callback(errors.UNKNOWN_ERROR(err));
    }
};

module.exports = create;

