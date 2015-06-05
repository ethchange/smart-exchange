/**
 * This script should be run as child process
 */
var web3 = require('web3');

var globalRegistrar = require('./global_registrar');
var utils = require('./utils');
var errors = require('./errors');

var balance = function (config, identifier, callback) {
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

        var balance = web3.eth.getBalance(address);
        callback(null, balance);
    } catch (err) {
        callback(errors.UNKNOWN_ERROR(err));
    };
};

module.exports = balance;

