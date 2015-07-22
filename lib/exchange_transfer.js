/**
 * This script should be run as child process
 */
var web3 = require('web3');

var globalRegistrar = require('./global_registrar');
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
        {"name": "value", "type": "uint256"}
    ], "outputs": []
}, {
    "type": "function", "name": "icapTransfer", "constant": false, "inputs": [
        {"name": "from", "type": "bytes32"},
        {"name": "to", "type": "address"},
        {"name": "indirectId", "type": "bytes32"},
        {"name": "value", "type": "uint256"}
    ], "outputs": []
}];

var transfer = function (config, identifier, from, to, value, callback) {
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
        
        // check if identifier is owned by us
        // TODO: This is not required
        if (namereg.owner(identifier) !== owner) {
            return callback(errors.IDENTIFIER_NOT_OWNED);
        }

        // check if identifier is empty
        var contractAddress = namereg.addr(identifier);
        if (utils.isEmptyAddress(contractAddress)) {
            return callback(errors.IDENTIFIER_NO_ADDRESS);
        }

        // validate from
        if (!utils.validateUserid(from)) {
            return callback(errors.FROM_IS_INCORRECT);
        }

        // validate to
        var toAddress = utils.validateAddress(to);
        var toDirectIBAN = utils.validateDirectIBAN(to);
        var toIndirectIBAN = utils.validateIndirectIBAN(to);
        var toUserid = utils.validateUserid(to);

        if (toAddress || toDirectIBAN) {
            var address = toAddress ? to : utils.directIBANToAddress(to);
            var hash = web3.eth.contract(abi).at(contractAddress).transfer(from, address, value, {from: owner});
            return callback(null, hash);

        } else if (toIndirectIBAN || toUserid) {
            var toIdentifier = toUserid ? identifier : utils.indirectIBANToIdentifier(to);
            
            var address = namereg.addr(toIdentifier);
            if (utils.isEmptyAddress(address)) {
                return callback(errors.TO_IDENTIFIER_NO_ADDRESS);
            }

            var indirectId = toUserid ? to : utils.indirectIBANToUserid(to);

            var hash = web3.eth.contract(abi).at(contractAddress).icapTransfer(from, address, indirectId, value, {from: owner});
            
            return callback(null, hash);
        }
           
        return callback(errors.TO_IS_INCORRECT);

    } catch (err) {
        callback(errors.UNKNOWN_ERROR(err));
    };
};

module.exports = transfer;

