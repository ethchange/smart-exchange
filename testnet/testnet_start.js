var fs = require('fs');
var exec = require('child_process').execSync;
var spawn = require('child_process').spawn;
var log = require('../lib/log');

var addArg = function (cmd, arg) {
    return cmd + " " + arg + " ";
};

var basicCommand = function (config) {
    var cmd = 'geth';
    cmd = addArg(cmd, '--datadir=' + config.datadir + '');
    cmd = addArg(cmd, '--port ' + 30303);
    cmd = addArg(cmd, '--rpc');
    cmd = addArg(cmd, '--rpcport ' + config.jsonrpc_port);
    cmd = addArg(cmd, '--rpccorsdomain "*"');
    //cmd = addArg(cmd, '--mine');
    cmd = addArg(cmd, '--maxpeers=0');
    cmd = addArg(cmd, '--verbosity=0');
    cmd = addArg(cmd, '--password ' + './testnet/password/password');
    
    var networkId = Math.floor((Math.random() * 100000) + 1000);
    cmd = addArg(cmd, '--networkid ' + networkId);

    return cmd;
};

var listCommand = function (config) {
    return addArg(basicCommand(config), 'account list');
};

var newAccountCommand = function (config) {
    return addArg(basicCommand(config), 'account new');
};

var getAddress = function (config) {
    var result;
    try {
        result = exec(listCommand(config));
    } catch (err) {
        result = exec(newAccountCommand(config));
    }
    
    return '0x' + result.toString().match(/{(\w+)}/)[1];
};

// child_process spawn expects args in different format
var toSpawnArgs = function (cmd) {
    return cmd.substr(4).split(' ').filter(function (arg) { return arg !== ''; });
};

var run = function (config, address) {
    var cmd = basicCommand(config);
    cmd = addArg(cmd, '--unlock ' + address);
    cmd = addArg(cmd, 'js ./testnet/scripts/mine.js')

    var args = toSpawnArgs(cmd);

    var geth = spawn('geth', args);

    // that's ugly
    geth.stdout.on('data', function (data) {
        var str = data.toString();
        if (str.match(/===/)) {
            str.split('===').map(function (s) {
                s = s.replace(/===/, '');
                s = s.replace(/\n/, '');
                return s;
            }).filter(function (s) {
                return s !== '';
            }).forEach(function (s) {
                log.info(s);
            });
        }
    });

    geth.on('error', function (data) {
        log.warn(data.toString());
    });

    geth.on('close', function (code) {
        log.warn('child process exited with code ' + code);
    });
};

var createDirectory = function (dir) {
    fs.mkdirSync(dir);
};

var start = function (config) {
    log.info('2/7 Getting address...');
    var address = getAddress(config)
    log.info('3/7 Using address ' + address);
    log.info('4/7 Starting geth')
    run(config, address);
    return address;
};

module.exports = start;
