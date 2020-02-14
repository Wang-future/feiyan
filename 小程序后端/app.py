#coding:utf-8
from flask import Flask, jsonify,request
import requests
import pymongo
import json
import random
import os
import time
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
        if ('sourceUrl' in item) and item['sourceUrl'] != "":
            referenceLink.append(item['sourceUrl'])
        dict['referenceLink'] = referenceLink

        if 'rumorType' in item:
            dict['rumorType'] = item['rumorType']
            if (item['rumorType'] == 0):
                dict['imgUrl'] = "/images/yaoyan.jpg"
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

def todayDate():
    return time.strftime("%Y-%m-%d",time.localtime(time.time()))
def judgeCode(str):
    if str == 'iais':
        return True
    return False

def loadArticles():
    file = "./articles/articles.json"
    if os.path.getsize(file):
        with open(file, 'r', encoding='UTF-8') as f:
            content = f.read()
            content_json = json.loads(content)
            return content_json
    # 告警
    return []

def addId(list):
    y  = 1
    for x in list:
        x['id'] = y
        y+=1
def addArticles(list):
    # list 的一个item格式
    # {
    #     "author": 'str',
    #     "title":'str',
    #     'text':'str',
    #     'type':'int',
    #     'imgUrl':'str',
    #     'date':'str',
    #     'referenceLink':'List'
    # }
    articleList = loadArticles()
    newArticles = list #request.json.get('articles')
    if len(newArticles) > 0:
        newList = newArticles + articleList
        with open("./articles/articles.json", 'w', encoding='UTF-8') as f:
            jsonList = json.dumps(newList)
            f.write(jsonList)

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

def test(str):
    searchStr = str
    # 小程序用户的搜索字符串
    print("searchstr:" + searchStr)
    headers = {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/70.0.3538.67 Safari/537.36'}
    murl = "http://47.112.189.78:5025/search" + "?searchStr=" + searchStr
    idlis = requests.get(murl, headers=headers)
    # 调用谣言代码 得到list 返回list
    repJson = json.loads(idlis.text)
    ret = {}
    if 'idlist' not in repJson:
        ret['code'] = 1
    else:
        ret['code'] = 0
        ret['articles'] = repJson['idlist']
        print(ret)
    return ret

@app.route('/search',methods=['POST'])
def search():
    searchStr = request.json.get('searchStr')
    #小程序用户的搜索字符串
    print("searchstr:"+searchStr)
    headers = {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/70.0.3538.67 Safari/537.36'}
    murl = "http://47.112.189.78:5025/search" + "?searchStr=" + searchStr
    idlis = requests.get(murl,headers=headers)
    # 调用谣言代码 得到list 返回list
    repJson =  json.loads(idlis.text)

    ret = {}

    if 'idlist' not in repJson:
        ret['code'] = 1
        ret['articles'] = {}
        return ret
    else:
        ret['code'] = 0
        articles = get_dataset_for_db(repJson['idlist'])
        ret['articles'] = articles
    return ret

@app.route('/getAllArticles',methods=['GET'])
def getAllArticles():
    print("in getAllArticles")
    ret_dict = {}
    ret_dict['code'] = 1
    articles = loadArticles()
    addId(articles)
    if len(articles) > 0:
        ret_dict['code'] = 0
        ret_dict['articles'] = articles
    else:
        ret_dict['articles'] =[]
    print(ret_dict)
    return ret_dict

@app.route('/addArticle',methods=['POST'])
def addArticle():
    ret_dict = {}
    ret_dict['code'] = 0 # 0成功 1未知错误 2邀请码错误
    # input
    # {
    #     "author": 'str',
    #     "title":'str',
    #     'text':'str',
    #     'type':'int',
    #     'referenceLink':'List'
    #     'invcode':'str'
    # }

    article = request.json.get('article')
    print("article")
    print(article)
    if 'invcode' not in article:
        ret_dict['code']=2
        #告警
        return ret_dict

    invcode = article['invcode']

    if not judgeCode(invcode):
        ret_dict['code'] = 2
        # 告警
        return ret_dict
    # article
    if (article['type'] == 0):
        article['imgUrl'] = '/images/keben.jpg'
    else:
        article['imgUrl'] = '/images/tongzhi.jpg'

    article['date'] = todayDate()
    list = [article]
    addArticles(list)
    ret_dict['code'] = 0
    return ret_dict

if __name__ == '__main__':
    # jsonstr = {
    #     "id": 3,
    #     "imgUrl": "../../images/ali.jpg",
    #     "title": "阿里巴巴 京东 Apple苹果...你想要的实习",
    #     "star_count": 51,
    #     "home_image_star": "../../images/chat.png",
    #     "date": "2017-25-250",
    #     "author": "正为东2",
    #     "text": "2大家都知道，再过几个月，即将在俄罗斯举行的2018世界杯就要开幕了。而这之后则是2022年的卡塔尔世界杯。那么2026年的世界杯又要在哪里举办呢？    目前的最新消息是，美国想要争夺这8年后的世界杯的举办权了，而且美国还拉上了加拿大和墨西哥这两个北美洲的国家，组成了一个北美联队！    可就在昨天晚上，美国总统特朗普为了支持美国申办这届世界杯，而在自己推特上写下的一番话，却几乎毁掉了整个北美洲举办这届世界杯的希望！"
    # }
    # Articles = []
    # Articles.append(jsonstr)
    # addArticles(Articles)
    #print(loadArticles())
    app.run(host='0.0.0.0', port=5015, ssl_context=('./zhengshu/secret.pem', './zhengshu/secret.key'))
