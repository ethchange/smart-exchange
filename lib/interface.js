

module.exports = {
    createNewExchange: createNewExchange,
    transfer: transfer,
    transactions: transactions,
    transaction: transaction,
    balance: balance
};

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
 * @method createNewExchange
 * @param {String} identifier @see IDENTIFIER
 * @param {Function} callback triggered on result
 * @throws IDENTIFIER_IS_INCORRECT when identifier
 * doesn't match requirements
 * @throws IDENTIFIER_IS_UNAVAILABLE when identifier
 * is alread registred in namereg
 * @throws CONTRACT_DOESNT_EXIST when contract cannot be loaded
 * @throws CONTRACT_COMPILATION_ERROR when contract cannot be compiled
 * @throws CONTRACT_CREATION_ERROR when contract creation fails.
 * May be caused by insufficient funds
 */
var createNewExchange = function (identifier, callback) {
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
 * @throws IDENTIFIER_DOESNT_EXIST when identifier
 * doesn't exist in namereg
 * @throws FROM_IS_INCORRECT when userid doesn't match
 * requirements
 * @throws TO_IS_INCORRECT when to doesn't match requirements
 */
var transfer = function (identifier, from, to, callback) {
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
 * @throws IDENTIFIER_DOESNT_EXIST when identifier
 * doesn't exist in namereg
 * @throws INCORRECT_OPTIONS when options are not correct
 */
var transactions = function (identifier, options, callback) {
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

/**
 * Should be used to get current balance of the exchange
 *
 * @method balance
 * @param {String} identifier @see IDENTIFIER
 * @param {Function} callback triggered on result
 * @throws IDENTIFIER_IS_INCORRECT when identifier
 * doesn't match requirements
 * @throws IDENTIFIER_DOESNT_EXIST when identifier
 * doesn't exist in namereg
 */
var balance = function (identifier) {
};


