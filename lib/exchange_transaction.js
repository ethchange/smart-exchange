/**
 * This script should be run as child process
 */
var web3 = require('web3');

var registrar = require('./namereg');
var utils = require('./utils');
var errors = require('./errors');

/**
 * If any synchronous JSON-RPC request fails, UNKNOWN_ERROR should be thrown
 */
var transactions = function (config, identifier, hash, callback) {
    try {

        // setup configurable properties
        var namereg = config.namereg === 'default' ? web3.eth.namereg : registrar.at(config.namereg);

        // start web3.js
        web3.setProvider(new web3.providers.HttpProvider('http://' + config.jsonrpc_host + ':' + config.jsonrpc_port));
        if (!utils.validateIdentifier(identifier)) {
            return callback(errors.IDENTIFIER_IS_INCORRECT);
        }

        var encodedIdentifier = web3.fromAscii(identifier);

        // validate exchange identifier
        var address = namereg.addr(encodedIdentifier);
        if (utils.isEmptyAddress(address)) {
            return callback(errors.IDENTIFIER_NO_ADDRESS);
        }
    
        var transaction = web3.eth.getTransactionReceipt(hash);
        
        // we have to filter logs, cause this transaction could also trigger logs in other contracts
        var logs = transaction.logs.filter(function (l) {
            return l.address = address;
        });
        
        callback(null, logs);

    } catch(err) {
        callback(errors.UNKNOWN_ERROR(err));
    }
};

module.exports = transactions;

