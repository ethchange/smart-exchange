var log = require('./log');
var workerFarm = require('worker-farm');
var extBalance = require.resolve('./ext_balance');
var extCreate = require.resolve('./ext_create');
var extTransfer = require.resolve('./ext_transfer');
var extTransactions = require.resolve('./ext_transactions');

/**
 * This file exposes 'SmartExchange' API.
 */

/**
 * Before further reading you MUST be familiar with following
 * types definitions
 *
 * IDENTIFIER - unique exchange identifier. 4 alphanumeric chars.
 * USERID - unique user identifier. 9 alphanumeric charactes.
 * ADDRESS - ethereum address. 20 bytes in base 16 representation
 * prefixed by 0x.
 * DIRECT_IBAN - 34 alphanumeric characters.
 * https://github.com/ethereum/wiki/wiki/ICAP:-Inter-exchange-Client-Address-Protocol#direct
 * INDIRECT_IBAN - 20 alphanumeric charactes.
 * https://github.com/ethereum/wiki/wiki/ICAP:-Inter-exchange-Client-Address-Protocol#indirect
 *
 * All functions are asynchronous. They return results in
 * error-first callbacks.
 *
 * Errors described in @throws are not being thrown. Instead they
 * are returned in error-first callback.
 */

/**
 * Should be called to create new exchange on the blockchain.
 * - checks if given identifier is available
 * - loads contract specified by config
 * - creates contract on the blockchain 
 * - registers contract in namereg
 *
 * @method create
 * @param {String} identifier @see IDENTIFIER
 * @param {Function} callback triggered on result
 * @throws CANNOT_CONNECT_TO_CLIENT (100) when connection to client
 * cannot be established
 * @throws IDENTIFIER_IS_INCORRECT (101) when identifier
 * doesn't match requirements
 * @throws IDENTIFIER_IS_UNAVAILABLE (102) when identifier
 * is alread registred in namereg
 * @throws IDENTIFIER_REGISTRATION_FAILED (103) when identifier
 * registration fails
 * @throws CONTRACT_DOESNT_EXIST (104) when contract cannot be loaded
 * @throws CONTRACT_COMPILATION_ERROR (105) when contract cannot be compiled
 * @throws CONTRACT_DEPLOYMENT_ERROR (106) when contract creation fails.
 * May be caused by insufficient funds
 * @throws CONTRACT_REGISTRATION_FAILED (107) when contract fails to register
 * in namereg
 */
var create = function (identifier, overwrite, callback) {
    var createWorker = workerFarm(extCreate);
    createWorker(identifier, overwrite, function (err, result) {
        callback(err, result);
        workerFarm.end(createWorker);
    });
};

/**
 * Should be used to transfer funds from exchange and to record
 * transactions between internal exchange accounts
 *
 * @method transfer
 * @param {String} identifier @see IDENTIFIER
 * @param {String} from @see USERID
 * @param {String} to one of 
 *  @see ADDRESS
 *  @see DIRECT_IBAN
 *  @see INDIRECT_IBAN (transfer to external exchange)
 *  @see USERID (internal transfer)
 * @param {Function} callback triggered on result
 * @throws IDENTIFIER_IS_INCORRECT when identifier
 * doesn't match requirements
 * @throws IDENTIFIER_NOT_OWNED when identifier is not owned
 * @throws IDENTIFIER_NO_ADDRESS when identifier doesn't have
 * any address in namereg
 * @throws FROM_IS_INCORRECT when userid doesn't match
 * requirements
 * @throws TO_IS_INCORRECT when to doesn't match requirements
 * @throws TO_IDENTIFIER_NO_ADDRESS when indirect IBAN identifier
 * cannot be found in namereg
 */
var transfer = function (identifier, from, to, value, callback) {
    var transferWorker = workerFarm(extTransfer);
    transferWorker(identifier, function (err, result) {
        callback(err, result);
        workerFarm.end(transferWorker);
    });
};

/**
 * Should be used to list all exchange transactions
 * Optionaly period of time may be specified
 *
 * @method transactions
 * @param {String} identifier @see IDENTIFIER
 * @param {Object} options (optional) may contain additional
 * fields (fromBlock, toBlock) that should be used to filter
 * exchange transactions
 * @param {Function} callback triggered on result
 * @throws IDENTIFIER_IS_INCORRECT when identifier
 * doesn't match requirements
 * @throws IDENTIFIER_NO_ADDRESS when identifier doesn't
 * have contract address
 */
var transactions = function (identifier, options, callback) {
    var transactionsWorker = workerFarm(extTransactions);
    transactionsWorker(identifier, options, function (err, txs) {
        callback(err, txs);
        workerFarm.end(transactionsWorker);
    });
};

/**
 * Should be used to get current balance of the exchange
 *
 * @method balance
 * @param {String} identifier @see IDENTIFIER
 * @param {Function} callback triggered on result
 * @throws IDENTIFIER_IS_INCORRECT when identifier
 * doesn't match requirements
 * @throws IDENTIFIER_NO_ADDRESS when identifer doesn't
 * have contract address
 */
var balance = function (identifier, callback) {
    var balanceWorker = workerFarm(extBalance);
    balanceWorker(identifier, function (err, balance) {
        callback(err, balance);
        workerFarm.end(balanceWorker);
    });
};

/**
 * Should be used to get single transaction
 *
 * @method transaction
 * @param {String} identifier @see IDENTIFIER
 * @param {String} hash, transactionHash - TODO
 * @param {Function} callback triggered on result
 * @TODO not sure if this needs to be implemented
 */
var transaction = function (identifier, hash, callback) {
};


module.exports = {
    create: create,
    transfer: transfer,
    transactions: transactions,
    transaction: transaction,
    balance: balance
};

