var jayson = require('jayson');
var inter = require('./interface');
var log = require('./log');
var spec = require('./spec.json');

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

var extend = function (destination, source) {
    for (var property in source) {
        destination[property] = source[property];
    }
    return destination;
};

var logRequest = function (name) {
    log.info(name + ' called...');
};

var logResponse = function (name, err, result) {
    if (err) {
        return log.warn(name + ' failed with error: ', err);
    }
    log.info(name + ' response: ', result);
};

var listen = function (config) {
    var relay = jayson.client.http({
        hostname: config.jsonrpc_host,
        port: config.jsonrpc_port
    });

    var proxy = spec.map(function (method) {
        return method.name; 
    }).reduce(function (acc, name) {
        acc[name] = relay;
        return acc;
    }, {});

    var server = jayson.server(extend(proxy, {
        ext_create: requireParams(2, function (identifier, overwrite, callback) {
            logRequest('ext_create');
            inter.create(identifier, overwrite, function (err, result) {
                logResponse('ext_create', err, result);
                callback(err, result);
            });
        }),

        ext_transfer: requireParams(4, function (identifier, from, to, value, callback) {
            logRequest('ext_transfer');
            inter.transactions(identifier, from, to, value, function (err, result) {
                logResponse('ext_transfer', err, result);
                callback(err, result);
            });
        }),

        ext_transactions: requireParams(2, function (identifier, options, callback) {
            logRequest('ext_transactions');
            inter.transactions(identifier, options, function (err, result) {
                logResponse('ext_transactions', err, result);
                callback(err, result);
            });
        }),

        ext_balance: requireParams(1, function (identifier, callback) {
            logRequest('ext_balance');
            inter.balance(identifier, function (err, result) {
                logResponse('ext_balance', err, result);
                callback(err, result);
            });
        })

    }));
        
    // TODO: support other things than http
    server.http().listen(config.ext_port);
};

module.exports = {
    listen: listen
};

