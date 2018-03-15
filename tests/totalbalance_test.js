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


foundationAddr1 = '0x4A2a82864c2Db7091142C2078543FaB0286251a9'
foundationAddr2 = '0x0dA4512bB81fA50891533d9A956238dCC219aBCf'
foundationAddr3 = '0xD209fe3073Ca6B61A1a8A7b895e1F4aD997103E1'

foundationBalance1 = 21000000
foundationBalance2 = 12600000
foundationBalance3 = 5671292

foundationTotal = foundationBalance1 + foundationBalance2 + foundationBalance3

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

        //console.log("got=" + utils.getBalance2(foundationAddr1,curBlockNum).toString())

        balance1 = await utils.getBalance2(foundationAddr1,curBlockNum)
       // console.log("got balance1 =" + balance1.toString())

        balance2 = await utils.getBalance2(foundationAddr2,curBlockNum)
       // console.log("got balance2 =" + balance2.toString())

        balance3 = await utils.getBalance2(foundationAddr3,curBlockNum)
       // console.log("got balance3 =" + balance3.toString())

        //balance1 = parseInt(utils.fromWei(utils.toBig(utils.getBalance2(foundationAddr1,curBlockNum).toString())))
        intbal1 = parseInt(utils.fromWei(utils.toBig(balance1)))
        intbal2 = parseInt(utils.fromWei(utils.toBig(balance2)))
        intbal3 = parseInt(utils.fromWei(utils.toBig(balance3)))

        // balance2 = parseInt(utils.getBalance2(foundationAddr2,curBlockNum))
        // balance3 = parseInt(utils.getBalance2(foundationAddr3,curBlockNum))

        totalGot = intbal1 + intbal2 + intbal3

        if (foundationTotal != totalGot) {
					console.log("foundationTotal=" + foundationTotal + "   totalGot=" + totalGot)
					console.log("not equal log balance1=" + intbal1 + "	balance2=" + intbal2  + "	balance3=" + intbal3 )
          sms.sendFoundationSms(totalGot)
					//break
        } else {
          console.log("equal log balance1=" + intbal1 + "	balance2=" + intbal2  + "	balance3=" + intbal3 )
				}

				curBlockNum++;

				//sms.sendSms(utils.fromWei(totalBalance).toString())
        //sms.sendMyFoundationSms(totalGot)
				//break
			}

      assert(false, "monitor loop can't finish!");

	});
})


