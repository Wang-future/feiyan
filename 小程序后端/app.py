from flask import Flask, jsonify,request
import requests
import pymongo
import json
import random
app = Flask(__name__)

def get_dataset_for_db(idlist):
    MONGOHOST = "ncov.lureiny.xyz" #linux下通过ifconfig命令，找ip
    MONGOPORT = 7000
    MONGODB = "ncov" # mongodb下的一个db

    # 创建client连接mongodb
    myclient = pymongo.MongoClient(MONGOHOST, MONGOPORT)
    db = myclient[MONGODB]
    db.authenticate("ncov", "scutncov", mechanism='SCRAM-SHA-1')  # 认证密码登录
    myclo = db['rumors']
    retList = []
    for item in idlist:
        myquery = {"_id": item}
        mydoc = myclo.find(myquery)
        for x in mydoc:
            retList.append(x)
    # 转换retList
    articles = []
    x = 1
    for item in retList:
        dict = {}

        dict['id'] = x
        x+=1
        #title
        if 'title' in item:
            dict['title'] = item['title']
        else:
            dict['title'] = '未知标题'

        if 'author' in item:
            dict['author'] = item['author']
        else:
            dict['author'] = '未知作者'

        if 'date' in item:
            dict['date'] = item['date']
        else:
            dict['date'] = '未知时间'

        if 'body' in item:
            dict['text'] = item['body']
        else:
            dict['text'] = ''

        referenceLink = []
        if 'sourceUrl' in item:
            referenceLink.append(item['sourceUrl'])
        dict['referenceLink'] = referenceLink

        if 'rumorType' in item:
            dict['rumorType'] = item['rumorType']
            if (item['rumorType'] == 0):
                dict['imgUrl'] = "/images/yaoyan.gif"
            else:
                dict['imgUrl'] = "/images/zhenxiang.jpg"
        else:
            #逻辑错误
            continue
        articles.append(dict)

    print(articles)
    return articles
def test_doc(str1, str2):
    return random.randint(0,9)

def search(searchStr):
    # 获取所有id及其title
    MONGOHOST = "ncov.lureiny.xyz"  # linux下通过ifconfig命令，找ip
    MONGOPORT = 7000
    MONGODB = "ncov"  # mongodb下的一个db

    # 创建client连接mongodb 并读取每一条数据 此处应该使用定时器较为合理
    myclient = pymongo.MongoClient(MONGOHOST, MONGOPORT)
    db = myclient[MONGODB]
    db.authenticate("ncov", "scutncov", mechanism='SCRAM-SHA-1')  # 认证密码登录
    myclo = db['rumors']
    simList = [0,0,0]
    idList=['0','0','0']
    minSimIndex = 0
    dataList = myclo.find()

    # 遍历每一条数据
    for x in dataList:
        # print(x)
        #每一条数据
        title = x['title']
        id = x['_id']
        body = x['body']
        sim1 = test_doc(searchStr, title)
        sim2 = test_doc(searchStr, body)
        sim = 0
        if(sim1>sim2):
            sim = sim1
        else:
            sim = sim2
        if(sim > simList[minSimIndex]):
            simList[minSimIndex] = sim
            idList[minSimIndex] = id
            # 更新最下sim值的索引
            if((simList[0] < simList[1]) and (simList[0]<simList[2])):
                minSimIndex = 0
            elif(simList[1] < simList[2]):
                minSimIndex = 1
            else:
                minSimIndex = 2
    return idList
@app.route('/')
def hello_world():
    return 'Hello World!'

@app.route('/getOpenid',methods=['GET'])
def getOpenid():
    # url一定要拼接，不可用传参方式
    url = "https://api.weixin.qq.com/sns/jscode2session"
    appid = "wxf97cbaa326d3510b"
    secret = "75080e518deceb0d0526a00286482a0e"
    jscode = request.args.get("code") #获取get请求参数
    murl = url + "?appid=" + appid + "&secret=" + secret + "&js_code=" + jscode + "&grant_type=authorization_code"
    r = requests.get(murl)
    print(r.json())
    openid = r.json()['openid']
    return openid


@app.route('/search',methods=['POST'])
def search():
    searchStr = request.json.get('searchStr')
    #小程序用户的搜索字符串
    print("searchstr:"+searchStr)
    murl = "https://47.112.189.78:5025/search"+ "?searchStr=" + searchStr
    idlis = requests.get(murl)
    # 调用谣言代码 得到list 返回list
    articles = get_dataset_for_db(idlis)
    ret = {}
    ret['code'] = 0
    ret['articles'] = articles
    return ret



if __name__ == '__main__':
    app.run(port=5015)
