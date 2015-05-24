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

var relay = jayson.client.http({
    hostname: 'localhost',
    port: 8545
});

var proxy = spec.map(function (method) {
    return method.name; 
}).reduce(function (acc, name) {
    acc[name] = relay;
    return acc;
}, {});

var server = jayson.server(extend(proxy, {
    ext_createNewExchange: requireParams(1, function (identifier, callback) {
        log.info('called ext_createNewExchange');
        inter.createNewExchange(identifier, function (err, result) {
            callback(err, result);
        });
    }),

    ext_transfer: requireParams(3, function (identifier, from, to, callback) {
    }),

    ext_transactions: requireParams(2, function (identifier, options, callback) {
    }),

    ext_balance: requireParams(1, function (identifier, callback) {
    })

}));

module.exports = {
    listen: function (config) {
        // TODO: support other things than http
        server.http().listen(config.port);
    }
};

