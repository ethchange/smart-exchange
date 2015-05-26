/**
 * This script should be run as child process
 */
var web3 = require('web3');

var utils = require('./utils');
var errors = require('./errors');

var abi = [{
    "type": "event", "name": "OnTransfer", "inputs": [
        {"indexed": true, "name": "from", "type": "bytes32"},
        {"indexed": true, "name": "to", "type": "address"},
        {"indexed": false, "name": "value", "type": "uint256"},
    ]
}, {
    "type": "event", "name": "OnIcapTransfer", "inputs": [
        {"indexed": true, "name": "from", "type": "bytes32"},
        {"indexed": true, "name": "to", "type": "address"},
        {"indexed": false, "name": "indirectId", "type": "bytes32"},
        {"indexed": false, "name": "value", "type": "uint256"},
    ]
}, {
    "type": "function", "name": "transfer", "constant": false, "inputs": [
        {"name": "from", "type": "bytes32"},
        {"name": "to", "type": "address"},
        {"name": "value", "type": "uint256"},
    ]
}, {
    "type": "function", "name": "icapTransfer", "constant": false, "inputs": [
        {"name": "from", "type": "bytes32"},
        {"name": "to", "type": "address"},
        {"name": "indirectId", "type": "bytes32"},
        {"name": "value", "type": "uint256"},
    ]
}];

var transfer = function (config, identifier, from, to, value, callback) {
    try {
        web3.setProvider(new web3.providers.HttpProvider('http://' + config.jsonrpc_host + ':' + config.jsonrpc_port));
        var owner = config.owner;
        if (!utils.validateIdentifier(identifier)) {
            return callback(errors.IDENTIFIER_IS_INCORRECT);
        }
        
        if (web3.eth.namereg.owner(identifier) !== owner) {
            return callback(errors.IDENTIFIER_NOT_OWNED);
        }

        var contractAddress = web3.eth.namereg.addr(identifier);
        if (utils.isEmptyAddress(contractAddress)) {
            return callback(errors.IDENTIFIER_NO_ADDRESS);
        }

        if (!utils.validateUserid(from)) {
            return callback(errors.FROM_IS_INCORRECT);
        }

        var toAddress = utils.validateAddress(to);
        var toDirectIBAN = utils.validateDirectIBAN(to);
        var toIndirectIBAN = utils.validateIndirectIBAN(to);
        var toUserid = utils.validateUserid(to);

        if (toAddress || toDirectIBAN) {
            var address = toAddress ? to : utils.directIBANToAddress(to);
            web3.eth.contract(abi).at(contractAddress).transfer(from, address, value, {from: owner});
            return callback(null);

        } else if (toDirectIBAN || toUserid) {
            var toIdentifier = toUserid ? identifier : utils.indirectIBANToIdentifier(to);
            
            var address = web3.eth.namereg.addr(toIdentifier);
            if (utils.isEmptyAddress(address)) {
                return callback(errors.TO_IDENTIFIER_NO_ADDRESS);
            }

            var indirectId = toUserid ? to : utils.indirectIBANToUserid(to);

            web3.eth.contract(abi).at(contractAddress).icapTransfer(from, address, indirectId, value, {from: owner});
            
            return callback(null);
        }
           
        return callback(errors.TO_IS_INCORRECT);

    } catch (err) {
        callback(errors.UNKNOWN_ERROR(err));
    };
};

module.exports = transfer;

