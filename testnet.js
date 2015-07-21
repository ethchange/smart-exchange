var program = require('commander');
var log = require('./lib/log');
var testnetStart = require('./testnet/testnet_start');
var testnetDeploy = require('./testnet/testnet_deploy');


var configPath = './testnet_config.json';
var updatePath = './config.json';
var deploy = false;


var selectedOption;

program
    .version('0.1.0')
    .option('-c, --config <path>', 'set config. default to ./testnet_config.json')
    .option('-d, --deploy', 'deploy new namereg. default to false', function () { return true; } )
    .option('-u, --update <path>', 'path with the config that should be updated. default to ./config.json');

program.parse(process.argv);

configPath = program.config || configPath;
updatePath = program.update || updatePath;
deploy = program.deploy;

log.info('1/5 Loading config file ' + configPath);
var config = require(configPath);

var address = testnetStart(config);

if (!deploy) {
    log.info('5/5 Ready!');
} else {
    testnetDeploy(config, address, function (err, nameregAddress) {
        log.info('5/5 namereg address is ' + nameregAddress);
    });
}

// prevent from being killed
setInterval(function () {}, 1000)

