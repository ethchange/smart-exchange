var bn = web3.eth.blockNumber;

setInterval(function() {
    var miner_var = admin.miner === undefined ? miner : admin.miner;

    var newBn = web3.eth.blockNumber;
    if (bn != newBn) {
        bn = newBn; 
        console.log('===Mined block: ' + bn);
    }

    var minimalAmount = (web3.eth.getBalance(web3.eth.coinbase) >= 30000000000000000000);
    var pendingTransactions = txpool.status.pending || txpool.status.queued;

    if (!web3.eth.mining && (!minimalAmount || pendingTransactions)) {
        console.log("===Start mining");
        miner_var.start();
  } else if (web3.eth.mining && minimalAmount && !pendingTransactions) {
        console.log("===Stop mining");
        miner_var.stop();
    }
}, 1000)

