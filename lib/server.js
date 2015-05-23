var jayson = require('jayson');
var inter = require('./interface');
var spec = require('./spec.json');

var requireParams = function (x, f) {
    return function () {
        var callback = Array.prototype.slice.call(arguments, x)[0];
        if (typeof callback !== 'function') {
            callback = Array.prototype.pop.call(arguments);
            return callback('wrong number of input params');
        }
        f.apply(null, arguments);
    };
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

var server = jayson.server(Object.create(proxy, {
    ext_createNewExchange: requireParams(1, function (identifier, callback) {
        inter.createNewExchange(identifier, function (err, result) {
            callback(null, result);
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

