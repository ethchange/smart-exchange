var program = require('commander');
var Promise = require('bluebird');
var fs = Promise.promisifyAll(require('fs'));
var log = require('./lib/log');
var server = require('./lib/server');
var configPath = './config.json';

/**
 * Define program options
 */
program
    .version('0.0.1')
    .option('-c, --config <path>', 'set config path. default to ./config.json')
    .parse(process.argv);

configPath = program.config || configPath;

/**
 * Helper functions
 */
var toString = function (obj) {
    return obj.toString();
};

log.info('1/2 Loading config file ' + configPath);

fs.readFileAsync(configPath)
.catch(function (err) {
    log.error('Cannot load config file.');
    process.exit(1);
})
.then(toString)
.then(JSON.parse)
.catch(function (err) {
    log.error('Config file is not valid JSON file.');
    process.exit(1);
})
.then(function (config) {  
    var missingKeys = [
        'contract', 'contract_name', 
        'jsonrpc_host', 'jsonrpc_port',
        'ext_interface', 'ext_port',
        'owner'].filter(function (key) {
        return config[key] === undefined;
    });

    if (missingKeys.length) {
        log.error('Following required keys are not defined in config: ' + missingKeys.join(', '));
        process.exit(1);
    }

    return config;
}).then(function (config) {
    log.info('2/2 Setting up ' + config.ext_interface + ' interface on port ' + config.ext_port);
    server.listen(config);
    log.info('Server Ready!');
});

