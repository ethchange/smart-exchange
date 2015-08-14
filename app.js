var program = require('commander');
var log = require('./lib/log');
var server = require('./lib/server');
var configPath = './config.json';

// Define program options
program
    .version('2.1.6')
    .option('-c, --config <path>', 'set config path. default to ./config.json')
    .parse(process.argv);

configPath = program.config || configPath;

// Load config
log.info('1/2 Loading config file ' + configPath);
var config = require(configPath);

// Validate config
var missingKeys = [
    'contract', 'contract_name', 
    'jsonrpc_host', 'jsonrpc_port',
    'exchange_interface', 'exchange_port',
    'owner'].filter(function (key) {
    return config[key] === undefined;
});

if (missingKeys.length) {
    log.error('Following required keys are not defined in config: ' + missingKeys.join(', '));
    process.exit(1);
}

// Start server
try {
    log.info('2/2 Setting up ' + config.exchange_interface + ' interface on port ' + config.exchange_port);
    server.listen(config);
} catch(err) {
    log.error('Error while settup up jsonrpc server: ' + err.message);
    process.exit(1);
};

log.info('Server Ready!');

