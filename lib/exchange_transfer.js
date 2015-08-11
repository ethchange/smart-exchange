/**
 * This script should be run as child process
 */
var web3 = require('web3');

var registrar = require('./namereg');
var utils = require('./utils');
var errors = require('./errors');
var abi = require('./contracts/SmartExchange.json');

var transfer = function (config, identifier, from, to, txPayload, callback) {
    try {
        // setup configurable properties
        var owner = config.owner;

        var value = txPayload.value;
        txPayload.value = 0;
        txPayload.from = txPayload.from || owner;

        var namereg = config.namereg === 'default' ? web3.eth.namereg : registrar.at(config.namereg);

        // start web3.js
        web3.setProvider(new web3.providers.HttpProvider('http://' + config.jsonrpc_host + ':' + config.jsonrpc_port));

        // validate new exchange identifier
        if (!utils.validateIdentifier(identifier)) {
            return callback(errors.IDENTIFIER_IS_INCORRECT);
        }
        
        var encodedIdentifier = web3.fromAscii(identifier);

        // check if identifier is owned by us
        // TODO: This is not required
        if (namereg.owner(encodedIdentifier) !== owner) {
            return callback(errors.IDENTIFIER_NOT_OWNED);
        }

        // check if identifier is empty
        var contractAddress = namereg.addr(encodedIdentifier);
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
            var hash = web3.eth.contract(abi).at(contractAddress).transfer(web3.fromAscii(from), address, value, txPayload);
            return callback(null, hash);

        } else if (toIndirectIBAN || toUserid) {

            var toIdentifier = toUserid ? encodedIdentifier : web3.fromAscii(utils.indirectIBANToIdentifier(to));
            var address = namereg.addr(toIdentifier);

            if (utils.isEmptyAddress(address)) {
                return callback(errors.TO_IDENTIFIER_NO_ADDRESS);
            }

            var indirectId = toUserid ? to : utils.indirectIBANToUserid(to);
            var hash = web3.eth.contract(abi).at(contractAddress).icapTransfer(web3.fromAscii(from), address, web3.fromAscii(indirectId), value, txPayload);
            
            return callback(null, hash);
        }
           
        return callback(errors.TO_IS_INCORRECT);

    } catch (err) {
        callback(errors.UNKNOWN_ERROR(err));
    };
};

module.exports = transfer;

