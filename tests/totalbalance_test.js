const {protocol, host, port} = require('../config')
const sms = require('./sendSms')
const utils = require('../utils')
const assert = require('chai').assert
const expect = require('chai').expect
const should = require('chai').should()

let beginBlockNum,
	curBlockNum,
	totalAccount,
	totalBalanceOrg,
	totalBalancePre,
	totalBalance,
	errAlarm,
	maxTotalBalanceInc,
	maxTotalBalanceOneStepInc,
	maxOrgTotalBalanceRedu,
	maxTotalBalanceOneStepRedu
	
let sleep = function (time) {
  return new Promise(function (resolve, reject) {
    setTimeout(function () {
      resolve();
    }, time);
  })
};


async function IsBlockTotalBalanceEquilibrium(blockNum)  {
	totalBalancePre = totalBalance;
	totalBalance = await utils.getTotalBalance(blockNum);
	///////////////////////test
	//totalBalance = utils.plus(totalBalance, utils.toBig('100000000000000000000'));
	///////////////////////test
	console.log('blockNum:' + blockNum + ', totalBalance:' + utils.fromWei(totalBalance).toString() + ' wan');

	// totalInc = utils.minus(totalBalance, totalBalanceOrg);
	// if (utils.gt(totalInc, maxTotalBalanceInc)) {
	// 	errAlarm = 'too many wancoin over constant value. blockNum:' + blockNum + ', total:' + utils.fromWei(totalBalance).toString() + ' wan, constant:' + utils.fromWei(totalBalanceOrg).toString() + ' wan, over:' +  utils.fromWei(totalInc).toString() + ' wan';
	// 	return false;
	// }
	//
	// ///////////////////////test
	// //totalBalance = utils.plus(totalBalance, utils.toBig('10000000000000000000000000'));
	// ///////////////////////test
	// onStepInc = utils.minus(totalBalance, totalBalancePre);
	// if (utils.gt(onStepInc, maxTotalBalanceOneStepInc)) {
	// 	errAlarm = 'too many wancoin increment one block. blockNum:' + blockNum + ', total:' + utils.fromWei(totalBalance).toString() + 'wan, preblock total:' + utils.fromWei(totalBalancePre).toString() + ' wan, over:' +  utils.fromWei(onStepInc).toString() + ' wan';
	// 	return false;
	// }


	if (utils.le(utils.toBig(totalBalance),utils.toBig(totalBalanceOrg).add(utils.toBig(maxTotalBalanceInc)))
	     &&utils.ge(utils.toBig(totalBalance),utils.toBig(totalBalanceOrg))
	   ){
	 	  return true
	}
	
	return false;
}


describe('total balance equilibrium', function() {
    before(async() => {
		var oneWan = utils.toBig("1000000000000000000");
		totalBalanceOrg = utils.times('210000000', oneWan);
		totalBalancePre = totalBalanceOrg;
		totalBalance = totalBalanceOrg;
		
		maxTotalBalanceInc = utils.times("10", oneWan);
		maxTotalBalanceOneStepInc = utils.times("1000000", oneWan);
		maxOrgTotalBalanceRedu = utils.times("1000000", oneWan);
		maxTotalBalanceOneStepRedu = utils.times("500000", oneWan);
		
		console.log('totalBalanceOrg:' + utils.fromWei(totalBalanceOrg).toString() + ' wan');
		console.log('totalBalancePre:' + utils.fromWei(totalBalancePre).toString() + ' wan');
		console.log('totalBalance:' + utils.fromWei(totalBalance).toString() + ' wan');

		console.log('maxTotalBalanceInc:' + utils.fromWei(maxTotalBalanceInc).toString() + ' wan');
		console.log('maxTotalBalanceOneStepInc:' + utils.fromWei(maxTotalBalanceOneStepInc).toString() + ' wan');
		console.log('maxOrgTotalBalanceRedu:' + utils.fromWei(maxOrgTotalBalanceRedu).toString() + ' wan');
		console.log('maxTotalBalanceOneStepRedu:' + utils.fromWei(maxTotalBalanceOneStepRedu).toString() + ' wan');
	})

    beforeEach(async() => {
	})

    it('total balance equilibrium', async() => {

	    beginBlockNum = utils.getBlockNumber();
		  curBlockNum = beginBlockNum;

		  let warnCount = 0

			while (true) {
				if (curBlockNum > utils.getBlockNumber()) {
					 sleep(5);
					 continue;
				}

				var isEquilibrium = await IsBlockTotalBalanceEquilibrium(curBlockNum);
				if (!isEquilibrium) {
					// release the alarm
					console.log("exception! total balance equilibrium alarm.");

					if (warnCount < 3) {
             sms.sendSms(utils.fromWei(totalBalance).toString())
          } else {
						 break
					}

          warnCount++

				} else {
           warnCount = 0
					 console.log("tranquil. curBlockNum:" + curBlockNum.toString() + ", totalBalancePre:" + utils.fromWei(totalBalancePre).toString() + " wan, totalBalance:" + utils.fromWei(totalBalance).toString() + " wan");
				}

				curBlockNum++;

				//sms.sendSms(utils.fromWei(totalBalance).toString())

				//break
			}

      assert(false, "monitor loop can't finish!");

	});
})


