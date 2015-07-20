var workerFarm = require('worker-farm');
var log = require('./log');
var extBalance = require.resolve('./exchange_balance');
var extCreate = require.resolve('./exchange_create');
var extTransfer = require.resolve('./exchange_transfer');
var extTransaction = require.resolve('./exchange_transaction');
var extTransactions = require.resolve('./exchange_transactions');

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
 * @method runInProcess
 * @param {String} file which should be run in new process
 * @param {Array} input for function exposed in the file
 * @param {Function} callback
 */
var runInProcess = function(file, args, callback) {
    var worker = workerFarm(file);
    args.push(function (err, result) {
        callback(err, result);
        workerFarm.end(worker);
    });
    worker.apply(worker, args);
};

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
 * @throws UNKNOWN_ERROR
 * @throws IDENTIFIER_IS_INCORRECT
 * @throws IDENTIFIER_NO_OWNED 
 * @throws IDENTIFIER_CANNOT_OVERWRITE
 * @throws CONTRACT_DEPLOYMENT_ERROR
 */
var create = function (config, identifier, overwrite, callback) {
    runInProcess(extCreate, [config, identifier, overwrite], callback);
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
 * @throws UNKNOWN_ERROR
 * @throws IDENTIFIER_IS_INCORRECT
 * @throws IDENTIFIER_NOT_OWNED
 * @throws IDENTIFIER_NO_ADDRESS 
 * @throws FROM_IS_INCORRECT
 * @throws TO_IS_INCORRECT
 * @throws TO_IDENTIFIER_NO_ADDRESS
 */
var transfer = function (config, identifier, from, to, value, callback) {
    runInProcess(extTransfer, [config, identifier, from, to, value], callback);
};

/**
 * Should be used to list all exchange transactions
 * options fromBlock, toBlock should be specified
 *
 * @method transactions
 * @param {String} identifier @see IDENTIFIER
 * @param {Object} options (optional) may contain additional
 * fields (fromBlock, toBlock) that should be used to filter
 * exchange transactions
 * @param {Function} callback triggered on result
 * @throws UNKNOWN_ERROR
 * @throws IDENTIFIER_IS_INCORRECT
 * @throws IDENTIFIER_NO_ADDRESS 
 */
var transactions = function (config, identifier, options, callback) {
    runInProcess(extTransactions, [config, identifier, options], callback);
};

/**
 * Should be used to get current balance of the exchange
 *
 * @method balance
 * @param {String} identifier @see IDENTIFIER
 * @param {Function} callback triggered on result
 * @throws UNKNOWN_ERROR
 * @throws IDENTIFIER_IS_INCORRECT
 * @throws IDENTIFIER_NO_ADDRESS
 */
var balance = function (config, identifier, callback) {
    runInProcess(extBalance, [config, identifier], callback);
};

/**
 * Should be used to get single transaction
 *
 * @method transaction
 * @param {String} identifier @see IDENTIFIER
 * @param {String} hash, transactionHash - TODO
 * @param {Function} callback triggered on result
 * @throws UNKNOWN_ERROR
 * @throws IDENTIFIER_IS_INCORRECT
 * @throws IDENTIFIER_NO_ADDRESS
 */
var transaction = function (config, identifier, hash, callback) {
    runInProcess(extTransaction, [config, identifier, hash], callback);
};


module.exports = {
    create: create,
    transfer: transfer,
    transactions: transactions,
    transaction: transaction,
    balance: balance
};

