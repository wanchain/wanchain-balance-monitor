const {accounts, protocol, host, port, glueSCAddress, coinSCAddress, stampSCAddress, tokenSCAddress, coinABI, stampABI, tokenABI, glueABI, debug} = require('../config')
const Method = require("web3/lib/web3/method");
const formatters = require('web3/lib/web3/formatters');
const BigNumber = require('bignumber.js')
const util = require('wanchain-util')
const Web3 = require('web3')
const web3 = new Web3(new Web3.providers.HttpProvider(`${protocol}://${host}:${port}`))
web3.wan = new util.web3Wan(web3);
web3.monitor = new util.web3Wan(web3);

var methods = function () {
    var getTotalBalance = new Method({
        name: 'getTotalBalance',
        call: 'personal_getTotalBalance',
        params: 1,
        inputFormatter: [formatters.inputDefaultBlockNumberFormatter],
        outputFormatter: formatters.outputBigNumberFormatter
    });

    return [
        getTotalBalance
    ];
};

var properties = function () {
    return [];
};

methods().forEach(function(method) {
	method.attachToObject(web3.monitor);
	method.setRequestManager(web3.monitor._requestManager);
});

properties().forEach(function(p) {
	p.attachToObject(web3.monitor);
	p.setRequestManager(web3.monitor._requestManager);
});


const promisify = (inner) => 
	new Promise((resolve, reject) =>
    	inner((err, res) => {
      		if (err) { 
      			console.log(err)
      			reject(err) 
      		}

      		resolve(res);
    	})
  	)

const unlockAccount = (account, pwd, duration) => 
	new Promise((resolve) => 
		resolve(web3.personal.unlockAccount(account, pwd, duration))
	)

const getBalance = (account) =>
	new Promise((resolve, reject) => 
		//resolve(web3.eth.getBalance(account))
		web3.eth.getBalance(account, (err, balance) => {
			if (err) {
				console.log('getBalance error: ', err)
				reject(err)
			}
			
			resolve(balance)
		})
	)

const getBalance2 = (account, blockNumber) =>
	new Promise((resolve, reject) =>
		//resolve(web3.eth.getBalance(account, blockNumber))
		web3.eth.getBalance(account, blockNumber, (err, balance) => {
			if (err) {
				console.log('getBalance2 error: ', err)
				reject(err)
			}
			
			resolve(balance)
		})

	)

const getTotalBalance = (blockNumber) =>
	new Promise((resolve, reject) =>
		web3.monitor.getTotalBalance(blockNumber, (err, balance) => {
			if (err) {
				console.log('getTotalBalance error: ', err)
				reject(err)
			}
			
			console.log('getTotalBalance suc')
			resolve(balance)
		})
	)


const getTransactionCount = (account, blockNumber) =>
	new Promise((resolve, reject) => {
		web3.eth.getTransactionCount(account, blockNumber, (err, count) => {
			if (err) {
				console.log('getTransactionCount error: ', err)
				reject(err)
			}
			resolve(count)
		})
	})

const sendTransaction = (obj) =>
	new Promise((resolve, reject) => {
		web3.eth.sendTransaction(obj, (err, hash) => {
			if (err) {
			    if (debug) {
                    console.log('sendTransaction error: ', err)
                }
				reject(err)
			}
			resolve(hash)
		})
	})


const sendRawTransaction = (encodedTx) =>
	new Promise((resolve, reject) => {
		web3.eth.sendRawTransaction(encodedTx, (err, hash) => {
			if (err) {
				console.log('sendRawTransaction error: ', err)
				reject(err)
			}
			resolve(hash)
		})
	})

const sendPrivacyCxtTransaction = (obj, pwd) => 
	new Promise((resolve, reject) => {
		web3.wan.sendPrivacyCxtTransaction(obj, pwd, (err, hash) => {
			if (err) {
				// console.log('sendPrivacyCxtTransaction error: ', err)
				reject(err)
			}

			resolve(hash)
		})
	})

const getReceipt = (txHash) => 
	new Promise((resolve, reject) => {
		web3.eth.getTransactionReceipt(txHash, (err, receipt) => {
			if (err) {
				console.log('getReceipt error: ', err)
				reject(err)
			}

			resolve(receipt)
		})
	})

const getTransaction = (txHash) => 
	new Promise((resolve, reject) => {
		web3.eth.getTransaction(txHash, (err, ret) => {
			if (err) {
				console.log('getTransaction error: ', err)
				reject(err)
			}

			resolve(ret)
		})
	})

const getBlock = (state) => 
	new Promise((resolve, reject) => {
		web3.eth.getBlock(state, (err, ret) => {
			if (err) {
				console.log(err)
				reject(err)
			}

			resolve(ret)
		})
	})

const fromWei = (balance) => web3.fromWei(balance.toNumber())

const toWei = (value) => web3.toWei(value)

const getWanAddress = (addr) => 
	new Promise((resolve) => {
		resolve(web3.wan.getWanAddress(addr))
	})

const genOTA = (wanAddr) => 
	new Promise((resolve, reject) => {
		web3.wan.generateOneTimeAddress(wanAddr, (err, ret) => {
			if (err) {
				console.log("genOTA error: ", err)
				reject(err)
			}

			resolve(ret)
		})
	})

const getOTABalance = (ota, blockNumber) => 
	new Promise((resolve, reject) => {
		web3.wan.getOTABalance(ota, blockNumber, (err, ret) => {
			if (err) {
				console.log('getOTABalance error: ', err)
				reject(err)
			}

			resolve(ret)
		})
	})

const getOTAMixSet = (ota, qty) => 
	new Promise((resolve, reject) => {
		web3.wan.getOTAMixSet(ota, qty, (err, ret) => {
			if (err) {
				if (debug) {
                    console.log('getOTAMixSet error: ', err)
				}
				reject(err)
			}

			resolve(ret)
		})
	})	

const computeOTAPPKeys = (address, ota) => 
	new Promise((resolve, reject) => {
		web3.wan.computeOTAPPKeys(address, ota, (err, ret) => {
			if (err) {
				// console.log('computeOTAPPKeys error: ', err)
				reject(err)
			}

			resolve(ret)
		})
	})

const genRingSignData = (msg, sk, data) => 
	new Promise((resolve, reject) => {
		web3.wan.genRingSignData(msg, sk, data, (err, ret) => {
			if (err) {
				// console.log('genRingSignData error: ', err)
				reject(err)
			}

			resolve(ret)
		})
	})


const sleepBlocks = (blockCount) => 
	new Promise((resolve, reject) => {
		web3.admin.sleepBlocks(blockCount, (bSuc) => {
			resolve(bSuc)
		})
	})


const getBlockNumber = () => web3.eth.blockNumber

const plus = (a, b) => new BigNumber(a).plus(new BigNumber(b))

const minus = (a, b) => new BigNumber(a).minus(new BigNumber(b))

const times = (a, b) => new BigNumber(a).times(new BigNumber(b))

const gt = (a, b) => new BigNumber(a).gt(new BigNumber(b))

const le = (a, b) => new BigNumber(a).lessThanOrEqualTo(new BigNumber(b))
const ge = (a, b) => new BigNumber(a).greaterThanOrEqualTo(new BigNumber(b))

const toBig = (n) => {
	return new BigNumber(n)
}

const filter = web3.eth.filter('latest')

module.exports = {
	promisify,
	unlockAccount,
	sendTransaction,
    sendRawTransaction,
	sendPrivacyCxtTransaction, 
	computeOTAPPKeys,
	getBalance,
    getBalance2,
	getTotalBalance,
    getTransactionCount,
	getWanAddress,
	genOTA,
	getOTABalance,
	getOTAMixSet,
	genRingSignData, 
	getReceipt,
	getTransaction,
	getBlock,
	getBlockNumber, 
	sleepBlocks,
	fromWei,
	toWei,
	filter,
	plus,
	minus,
	times,
	gt,
	le,
	ge,
	toBig
}