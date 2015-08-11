/**
 * This script should be run as child process
 */
var fs = require('fs');
var web3 = require('web3');
var sleep = require('sleep');

var registrar = require('./namereg');
var utils = require('./utils');
var errors = require('./errors');

/**
 * If any synchronous JSON-RPC request fails, UNKNOWN_ERROR should be thrown
 */
var disown = function (config, identifier, callback) {
    try {
        
        // setup configurable properties
        var owner = config.owner;
        var namereg = config.namereg === 'default' ? web3.eth.namereg : registrar.at(config.namereg);

        // start web3.js
        web3.setProvider(new web3.providers.HttpProvider('http://' + config.jsonrpc_host + ':' + config.jsonrpc_port));

        // validate new exchange identifier 
        if (!utils.validateIdentifier(identifier)) {
            return callback(errors.IDENTIFIER_IS_INCORRECT);
        }

        var encodedIdentifier = web3.fromAscii(identifier);

        // check if exchange with given identifier can be created
        var idOwner = namereg.owner(encodedIdentifier);
        var reserved = !utils.isEmptyAddress(idOwner);
        if ((!reserved) || (reserved && idOwner !== owner)) {
            return callback(errors.IDENTIFIER_NOT_OWNED);
        }

        namereg.disown(encodedIdentifier, owner, {from: owner});
        callback(null, true);

    } catch (err) {
        callback(errors.UNKNOWN_ERROR(err));
    }
};

module.exports = disown;

