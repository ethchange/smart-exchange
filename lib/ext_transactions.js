/**
 * This script should be run as child process
 */
var web3 = require('web3');
web3.setProvider(new web3.providers.HttpProvider("http://localhost:8545"));

var utils = require('./utils');
var errors = require('./errors');

var abi = [{
    "type": "event", "name": "OnTransfer", "inputs": [
        {"indexed": true, "name": "from", "type": "bytes32"},
        {"indexed": true, "name": "to", "type": "address"},
        {"indexed": false, "name": "value", "type": "uint"},
    ]
}, {
    "type": "event", "name": "OnIcapTransfer", "inputs": [
        {"indexed": true, "name": "from", "type": "bytes32"},
        {"indexed": true, "name": "to", "type": "address"},
        {"indexed": false, "name": "indirectId", "type": "bytes32"},
        {"indexed": false, "name": "value", "type": "uint"},
    ]
}, {
    "type": "function", "name": "transfer", "constant": false, "inputs": [
        {"name": "from", "type": "bytes32"},
        {"name": "to", "type": "address"},
        {"name": "value", "type": "uint"},
    ]
}, {
    "type": "function", "name": "icapTransfer", "constant": false, "inputs": [
        {"name": "from", "type": "bytes32"},
        {"name": "to", "type": "address"},
        {"name": "indirectId", "type": "bytes32"},
        {"name": "value", "type": "uint"},
    ]
}];

var transactions = function (identifier, options, callback) {
    try {
        if (!utils.validateIdentifier(identifier)) {
            return callback(errors.IDENTIFIER_IS_INCORRECT);
        }

        var address = web3.eth.namereg.addr(identifier);
        if (utils.isEmptyAddress(address)) {
            return callback(errors.IDENTIFIER_NO_ADDRESS);
        }
    
        // this may take a while if we search from block 0
        // TODO: merge OnTransfer && OnIcapTransfer ?
        var SmartExchange = web3.eth.contract(abi).at(address);
        var txs = SmartExchange.OnTransfer({}, options).get();
        var icapTxs = SmartExchange.OnIcapTransfer({}, options).get();
        callback(null, txs.concat(icapTxs));

    } catch(err) {
        callback(errors.UNKNOWN_ERROR);
    }
};

module.exports = transactions;

