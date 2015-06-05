/**
 * This script should be run as child process
 */
var web3 = require('web3');

var utils = require('./utils');
var errors = require('./errors');

var abi = [{
    "type": "event", "name": "Transfer", "inputs": [
        {"indexed": true, "name": "from", "type": "bytes32"},
        {"indexed": true, "name": "to", "type": "address"},
        {"indexed": false, "name": "value", "type": "uint256"},
    ]
}, {
    "type": "event", "name": "IcapTransfer", "inputs": [
        {"indexed": true, "name": "from", "type": "bytes32"},
        {"indexed": true, "name": "to", "type": "address"},
        {"indexed": false, "name": "indirectId", "type": "bytes32"},
        {"indexed": false, "name": "value", "type": "uint256"},
    ]
}, {
    "type": "event", "name": "AnonymousDeposit", "inputs": [
        {"indexed": true, "name": "from", "type": "address"},
        {"indexed": false, "name": "value", "type": "uint256"},
    ]
}, {
    "type": "event", "name": "Deposit", "inputs": [
        {"indexed": true, "name": "from", "type": "address"},
        {"indexed": true, "name": "to", "type": "bytes32"},
        {"indexed": false, "name": "value", "type": "uint256"},
    ]
}, {
    "type": "function", "name": "transfer", "constant": false, "inputs": [
        {"name": "from", "type": "bytes32"},
        {"name": "to", "type": "address"},
        {"name": "value", "type": "uint256"},
    ], "outputs": []
}, {
    "type": "function", "name": "icapTransfer", "constant": false, "inputs": [
        {"name": "from", "type": "bytes32"},
        {"name": "to", "type": "address"},
        {"name": "indirectId", "type": "bytes32"},
        {"name": "value", "type": "uint256"},
    ], "outputs": []
}];

var transactions = function (config, identifier, options, callback) {
    try {

        var namereg = config.namereg === 'default' ? web3.eth.namereg : globalRegistrar.at(config.namereg);

        web3.setProvider(new web3.providers.HttpProvider('http://' + config.jsonrpc_host + ':' + config.jsonrpc_port));
        if (!utils.validateIdentifier(identifier)) {
            return callback(errors.IDENTIFIER_IS_INCORRECT);
        }

        var address = namereg.addr(identifier);
        if (utils.isEmptyAddress(address)) {
            return callback(errors.IDENTIFIER_NO_ADDRESS);
        }
    
        // this may take a while if we search from block 0
        // TODO: merge everything together ?
        var SmartExchange = web3.eth.contract(abi).at(address);
        var deposits = SmartExchange.Deposit({}, options).get();
        var anonymousDeposits = SmartExchange.AnonymousDeposit({}, options).get();
        var txs = SmartExchange.Transfer({}, options).get();
        var icapTxs = SmartExchange.IcapTransfer({}, options).get();
        callback(null, deposits.concat(anonymousDeposits).concat(txs).concat(icapTxs)); 

    } catch(err) {
        callback(errors.UNKNOWN_ERROR(err));
    }
};

module.exports = transactions;

