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
var balance = function (config, identifier, callback) {
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

        // get balance 
        var balance = web3.eth.getBalance(address);
        callback(null, balance);
    } catch (err) {
        callback(errors.UNKNOWN_ERROR(err));
    };
};

module.exports = balance;

