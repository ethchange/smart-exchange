/**
 * This script should be run as child process
 */
var web3 = require('web3');

var registrar = require('./namereg');
var utils = require('./utils');
var errors = require('./errors');
var abi = require('./contracts/SmartExchange.json');

/**
 * If any synchronous JSON-RPC request fails, UNKNOWN_ERROR should be thrown
 */
var transactions = function (config, identifier, options, callback) {
    try {

        // setup configurable properties
        var namereg = config.namereg === 'default' ? web3.eth.namereg : registrar.at(config.namereg);

        // start web3.js
        web3.setProvider(new web3.providers.HttpProvider('http://' + config.jsonrpc_host + ':' + config.jsonrpc_port));
        if (!utils.validateIdentifier(identifier)) {
            return callback(errors.IDENTIFIER_IS_INCORRECT);
        }

        // validate exchange identifier
        var address = namereg.addr(identifier);
        if (utils.isEmptyAddress(address)) {
            return callback(errors.IDENTIFIER_NO_ADDRESS);
        }
    
        var SmartExchange = web3.eth.contract(abi).at(address);
        var transactions = SmartExchange.allEvents(options).get();
        callback(null, transactions);
    } catch(err) {
        callback(errors.UNKNOWN_ERROR(err));
    }
};

module.exports = transactions;

