var web3 = require('web3');
var abi = require('./contracts/ICAPRegistrar.json');

module.exports = web3.eth.contract(abi);

