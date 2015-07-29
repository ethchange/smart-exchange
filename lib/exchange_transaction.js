/**
 * This script should be run as child process
 */
var web3 = require('web3');

var globalRegistrar = require('./global_registrar');
var utils = require('./utils');
var errors = require('./errors');

/**
 * If any synchronous JSON-RPC request fails, UNKNOWN_ERROR should be thrown
 */
var transactions = function (config, hash, logIndex, callback) {
    try {

        // setup configurable properties
        var namereg = config.namereg === 'default' ? web3.eth.namereg : globalRegistrar.at(config.namereg);

        // start web3.js
        web3.setProvider(new web3.providers.HttpProvider('http://' + config.jsonrpc_host + ':' + config.jsonrpc_port));
    
        var transaction = web3.eth.getTransactionReceipt(hash);
        
        // we have to filter logs, cause this transaction could also trigger logs in other contracts
        var log = transaction.logs.filter(function (l) {
            // allow to loosely match. use ==, instead of === 
            return l.logIndex == logIndex;
        })[0];
        
        callback(null, log);

    } catch(err) {
        callback(errors.UNKNOWN_ERROR(err));
    }
};

module.exports = transactions;

