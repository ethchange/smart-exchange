/**
 * This script should be run as child process
 */
var fs = require('fs');
var web3 = require('web3');
var sleep = require('sleep');

var globalRegistrar = require('./global_registrar');
var utils = require('./utils');
var errors = require('./errors');

/**
 * If any synchronous JSON-RPC request fails, UNKNOWN_ERROR should be thrown
 */
var create = function (config, identifier, overwrite, callback) {
    try {
        
        // setup configurable properties
        var owner = config.owner;
        var namereg = config.namereg === 'default' ? web3.eth.namereg : globalRegistrar.at(config.namereg);

        // start web3.js
        web3.setProvider(new web3.providers.HttpProvider('http://' + config.jsonrpc_host + ':' + config.jsonrpc_port));

        // validate new exchange identifier 
        if (!utils.validateIdentifier(identifier)) {
            return callback(errors.IDENTIFIER_IS_INCORRECT);
        }

        // check if exchange with given identifier can be created
        var idOwner = namereg.owner(identifier);
        if (!utils.isEmptyAddress(idOwner)) {
            if (idOwner !== owner) {
                return callback(errors.IDENTIFIER_NOT_OWNED);
            }

            if (!overwrite) {
                return callback(errors.IDENTIFIER_CANNOT_OVERWRITE);
            }
        }

        // compile contract, TODO: it should use config contract location instead
        var file = fs.readFileSync(__dirname + '/contracts/SmartExchange.sol');
        var compiled = web3.eth.compile.solidity(file.toString());

        // TODO: config add contract class name to config
        var code = compiled.SmartExchange.code;
        var abi = compiled.SmartExchange.info.abiDefinition;

        // create new contract and get it's transaction hash
        var transactionHash = web3.eth.contract(abi).new({data: code, from: owner, gas: 2500000}).transactionHash;

        // wait for contract to be mined for 120 seconds
        // TODO: validate receipt code
        var receipt = null;
        var counter = 0;
        while ((receipt = web3.eth.getTransactionReceipt(transactionHash)) === null) {
            if (counter++ > 120) {
                break;
            }
            sleep.sleep(1);
        }

        if (receipt) {
            // after receiving transaction receipt we can assume, that contract is properly created
            // let's reserve identifier in namereg && save pair (identifier, address)
            namereg.reserve(identifier, {from: owner});
            namereg.setAddress(identifier, receipt.contractAddress, true, {from: owner});
            callback(null, receipt.contractAddress); 
        } else {
            callback(errors.CONTRACT_DEPLOYMENT_ERROR);
        }

    } catch (err) {
        callback(errors.UNKNOWN_ERROR(err));
    }
};

module.exports = create;

