/**
 * This script should be run as child process
 */
var fs = require('fs');
var web3 = require('web3');
var sleep = require('sleep');

var registrar = require('./namereg');
var utils = require('./utils');
var errors = require('./errors');

// wait for contract to be mined for 120 seconds
var waitForReceipt = function (transactionHash) {
    var receipt = null;
    var counter = 0;
    while ((receipt = web3.eth.getTransactionReceipt(transactionHash)) === null) {
        if (counter++ > 120) {
            break;
        }
        sleep.sleep(1);
    }
    return receipt;
};

/**
 * If any synchronous JSON-RPC request fails, UNKNOWN_ERROR should be thrown
 */
var create = function (config, identifier, overwrite, callback) {
    try {
        
        // setup configurable properties
        var owner = config.owner;
        var namereg = config.namereg === 'default' ? web3.eth.namereg : registrar.at(config.namereg);

        // start web3.js
        web3.setProvider(new web3.providers.HttpProvider('http://' + config.jsonrpc_host + ':' + config.jsonrpc_port));

        var code = web3.eth.getCode(namereg.address);
        if (code === '0x' || !code) {
            return callback(errors.NAMEREG_IS_INCORRECT);
        }

        // validate new exchange identifier 
        if (!utils.validateIdentifier(identifier)) {
            return callback(errors.IDENTIFIER_IS_INCORRECT);
        }

        var encodedIdentifier = web3.fromAscii(identifier);

        // check if exchange with given identifier can be created
        var idOwner = namereg.owner(encodedIdentifier);
        var reserved = !utils.isEmptyAddress(idOwner);
        if (reserved) {
            if (idOwner !== owner) {
                return callback(errors.IDENTIFIER_NOT_OWNED);
            }

            if (!overwrite) {
                return callback(errors.IDENTIFIER_CANNOT_OVERWRITE);
            }
        } else {
            var reserveHash = namereg.reserve(encodedIdentifier, {from: owner, value: web3.toWei(69, 'ether')});
            var reserveReceipt = waitForReceipt(reserveHash);
            reserved = !!reserveReceipt;
        }

        // compile contract, TODO: it should use config contract location instead
        var file = fs.readFileSync(__dirname + '/contracts/SmartExchange.sol');
        var compiled = web3.eth.compile.solidity(file.toString());

        // TODO: config add contract class name to config
        var code = compiled.SmartExchange.code;
        var abi = compiled.SmartExchange.info.abiDefinition;

        // create new contract and get it's transaction hash
        // smart-exchange requires at least 267886 gas, so let's require a little more
        var transactionHash = web3.eth.contract(abi).new({data: code, from: owner, gas: 280000}).transactionHash;
        var receipt = waitForReceipt(transactionHash);

        if (receipt && reserved) {

            // after receiving transaction receipt we can assume, that contract is properly created
            namereg.setAddr(encodedIdentifier, receipt.contractAddress, {from: owner});
            callback(null, receipt.contractAddress); 
        } else {
            callback(errors.CONTRACT_DEPLOYMENT_ERROR);
        }

    } catch (err) {
        callback(errors.UNKNOWN_ERROR(err));
    }
};

module.exports = create;

