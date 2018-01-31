'use strict';

const DysmsapiClient = require('@alicloud/dysmsapi')
const DybaseapiClient = require('@alicloud/dybaseapi')
const MNSClient = require('@alicloud/mns')

// 短信回执报告：SmsReport，短信上行：SmsUp
const msgTypeList = ["SmsReport", "SmsUp"]

const DYSMSAPI_ENDPOINT = 'http://dysmsapi.aliyuncs.com'
const DYBASEAPI_ENDPOINT = 'http://dybaseapi.aliyuncs.com'
// ACCESS_KEY_ID/ACCESS_KEY_SECRET 根据实际申请的账号信息进行替换
const accessKeyId = ''
const secretAccessKey = ''
 
//在云通信页面开通相应业务消息后，就能在页面上获得对应的queueName,不用填最后面一段
const queueName = ''
 
class SMSClient {
    constructor(options) {
        let {accessKeyId, secretAccessKey}=options
        if (!accessKeyId) {
            throw new TypeError('parameter "accessKeyId" is required');
        }
        if (!secretAccessKey) {
            throw new TypeError('parameter "secretAccessKey" is required');
        }
        this.dysmsapiClient = new DysmsapiClient({accessKeyId, secretAccessKey, endpoint: DYSMSAPI_ENDPOINT})
        this.dybaseClient = new DybaseapiClient({accessKeyId, secretAccessKey, endpoint: DYBASEAPI_ENDPOINT})
        this.expire = []
        this.mnsClient = []
    }

    //发送短信
    sendSMS(params) {
        return this.dysmsapiClient.sendSms(params)
    }

    //查询详情
    queryDetail(params) {
        return this.dysmsapiClient.querySendDetails(params)
    }

    //失效时间与当前系统时间比较，提前2分钟刷新token
    _refresh(type) {
        return this.expire[type] - new Date().getTime() > 2 * 60 * 1000
    }

    //获取token
    _getToken(type) {
        let msgType = msgTypeList[type]
        return this.dybaseClient.queryTokenForMnsQueue({MessageType: msgType})
    }

    //根据类型获取mnsclient实例
    async _getMNSClient(type) {
        if (this.mnsClient && (this.mnsClient[type] instanceof MNSClient) && this._refresh(type)) {
            return this.mnsClient[type]
        }

        let {
            MessageTokenDTO:{
                SecurityToken,
                AccessKeyId,
                AccessKeySecret
            }
        }=await this._getToken(type)


        if (!(AccessKeyId && AccessKeySecret && SecurityToken)) {
            throw new TypeError('get token fail')
        }


        let mnsClient = new MNSClient('1943695596114318', {
            securityToken: SecurityToken,
            region: 'cn-hangzhou',
            accessKeyId: AccessKeyId,
            accessKeySecret: AccessKeySecret,
            // optional & default
            secure: false, // use https or http
            internal: false, // use internal endpoint
            vpc: false // use vpc endpoint
        })
        this.mnsClient[type] = mnsClient
        this.expire[type] = (new Date().getTime() + 10 * 60 * 1000)
        return mnsClient
    }

    //typeIndex :0 为回执,1为上行
    async receiveMsg(typeIndex = 0, preQueueName, waitSeconds = 10) {
        let mnsClient = await this._getMNSClient(typeIndex)
        return await mnsClient.receiveMessage(preQueueName + msgTypeList[typeIndex], waitSeconds)
    }
}

//初始化sms_client
let smsClient = new SMSClient({accessKeyId, secretAccessKey})

function  sendMySms(cionNumber) {
	smsClient.sendSMS({
    PhoneNumbers: '1500000000',
    SignName: '云通信产品',
    TemplateCode: 'SMS_000000',
    TemplateParam: '{"code":"12345","product":"云通信"}'
}).then(function (res) {
    let {Code}=res
    if (Code === 'OK') {
        //处理返回参数
        console.log(res)
    }
}, function (err) {
    console.log(err)
})

}

function  sendSms(cionNumber)
{
	smsClient.sendSMS({
    PhoneNumbers: '1500000000',
    SignName: '云通信产品',
    TemplateCode: 'SMS_000000',
    TemplateParam: '{"code":"12345","product":"云通信"}'
}).then(function (res) {
    let {Code}=res
    if (Code === 'OK') {
        //处理返回参数
        console.log(res)
    }
}, function (err) {
    console.log(err)
})

  
}


exports.sendSms = sendSms;
exports.sendMySms = sendMySms;