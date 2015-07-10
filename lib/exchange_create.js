/**
 * This script should be run as child process
 */
var fs = require('fs');
var web3 = require('web3');
var sleep = require('sleep');

var globalRegistrar = require('./global_registrar');
var utils = require('./utils');
var errors = require('./errors');

var create = function (config, identifier, overwrite, callback) {
    try {
        var owner = config.owner;
        var namereg = config.namereg === 'default' ? web3.eth.namereg : globalRegistrar.at(config.namereg);

        web3.setProvider(new web3.providers.HttpProvider('http://' + config.jsonrpc_host + ':' + config.jsonrpc_port));
        if (!utils.validateIdentifier(identifier)) {
            return callback(errors.IDENTIFIER_IS_INCORRECT);
        }

        var idOwner = namereg.owner(identifier);
        console.log('owner: ' + idOwner);
        if (!utils.isEmptyAddress(idOwner)) {
            if (idOwner !== owner) {
                console.log('owner ' + owner);
                console.log('idOwner ' + idOwner);
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

        var transactionHash = web3.eth.contract(abi).new({data: code, from: owner, gas: 2500000}).transactionHash;

        var receipt = null;
        var counter = 0;
        while ((receipt = web3.eth.getTransactionReceipt(transactionHash)) === null) {
            if (counter++ > 60) {
                callback(errors.CONTRACT_DEPLOYMENT_ERROR);
                break;
            }
            sleep.sleep(1);
        }

        if (receipt) {
            namereg.reserve(identifier, {from: owner});
            namereg.setAddress(identifier, receipt.contractAddress, true, {from: owner});
            callback(null, receipt.contractAddress); 
        }

    } catch (err) {
        callback(errors.UNKNOWN_ERROR(err));
    }
};

module.exports = create;

