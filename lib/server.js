var jayson = require('jayson');
var inter = require('./interface');
var log = require('./log');
var spec = require('./spec.json');

/**
 * Wrapper function that returns an error if number of arguments is not equal x
 */
var requireParams = function (x, f) {
    return function () {
        var callback = Array.prototype.slice.call(arguments, x)[0];
        if (typeof callback !== 'function') {
            callback = Array.prototype.pop.call(arguments);
            return callback(this.error(-32602));
        }
        f.apply(null, arguments);
    };
};

/**
 * Add additional properties from source to destination
 */
var extend = function (destination, source) {
    for (var property in source) {
        destination[property] = source[property];
    }
    return destination;
};

/**
 * Utility used for logging requests
 */
var logRequest = function (name) {
    log.info(name + ' called...');
};

/**
 * Utility for logging responses
 */
var logResponse = function (name, err, result) {
    if (err) {
        log.warn(name + ' failed with error: ', err);
        if (err.stack) {
            log.error(err.stack);
        }
        return;
    }
    log.info(name + ' response: ', result);
};

var listen = function (config) {

    // create a relay to go/cpp jsonrpcserver
    var relay = jayson.client.http({
        hostname: config.jsonrpc_host,
        port: config.jsonrpc_port
    });

    // set up which methods should be proxied
    var proxy = spec.map(function (method) {
        return method.name; 
    }).reduce(function (acc, name) {
        acc[name] = relay;
        return acc;
    }, {});

    // add 'smart-exchange' methods
    var server = jayson.server(extend(proxy, {
        exchange_create: requireParams(2, function (identifier, overwrite, callback) {
            logRequest('exchange_create');
            inter.create(config, identifier, overwrite, function (err, result) {
                logResponse('exchange_create', err, result);
                callback(err, result);
            });
        }),

        exchange_transfer: requireParams(4, function (identifier, from, to, value, callback) {
            logRequest('exchange_transfer');
            inter.transfer(config, identifier, from, to, value, function (err, result) {
                logResponse('exchange_transfer', err, result);
                callback(err, result);
            });
        }),

        exchange_transaction: requireParams(2, function (identifier, hash, callback) {
            logRequest('exchange_transaction');
            inter.transaction(config, identifier, hash, function (err, result) {
                logResponse('exchange_transaction', err, result);
                callback(err, result);
            });
        }),

        exchange_transactions: requireParams(2, function (identifier, options, callback) {
            logRequest('exchange_transactions');
            inter.transactions(config, identifier, options, function (err, result) {
                logResponse('exchange_transactions', err, result);
                callback(err, result);
            });
        }),

        exchange_balance: requireParams(1, function (identifier, callback) {
            logRequest('exchange_balance');
            inter.balance(config, identifier, function (err, result) {
                logResponse('exchange_balance', err, result);
                callback(err, result);
            });
        }),

        exchange_address: requireParams(1, function (identifier, callback) {
            logRequest('exchange_address');
            inter.address(config, identifier, function (err, result) {
                logResponse('exchange_address', err, result);
                callback(err, result);
            });
        }),

        exchange_disown: requireParams(1, function (identifier, callback) {
            logRequest('exchange_disown');
            inter.disown(config, identifier, function (err, result) {
                logResponse('exchange_disown', err, result);
                callback(err, result);
            });
        })
    }));
        
    // start server
    if (config.exchange_interface === 'http') {
        server.http().listen(config.exchange_port);
    } else if (config.exchange_interface === 'tcp') {
        server.tcp().listen(config.exchange_port);
    } else {
        throw new Error(config.exchange_interface + ' not supported!');
    }
};

module.exports = {
    listen: listen
};

