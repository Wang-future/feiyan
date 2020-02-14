
// pages/chat/chat.js

const app = getApp()

var websocket = require('../../utils/websocket.js');

var utils = require('../../utils/util.js');
var log = require('../../utils/log.js');

Page({

  /**
  * 页面的初始数据
  */

  data: {

    newslist: [],

    userInfo: {},

    scrollTop: 0,

    increase: false,//图片添加区域隐藏

    aniStyle: true,//动画效果

    message: "",

    previewImgList: [],

    toView:''

  },

  /**
  * 生命周期函数--监听页面加载
  */

  onLoad: function () {

    var that = this

    wx.getSetting({
      success: res => {
        console.log(res)
        if (res.authSetting['scope.userInfo'] === true) { // 成功授权
          // 已经授权，可以直接调用 getUserInfo 获取头像昵称，不会弹框
          wx.getUserInfo({
            success: res => {
              app.globalData.userInfo = res.userInfo
            },
            fail: res => {
              console.log(res)
              wx.reLaunch({     //跳转至指定页面并关闭其他打开的所有页面（这个最好用在返回至首页的的时候）
                url: '/pages/homes/home'
              })
            }
          })
        } else if (res.authSetting['scope.userInfo'] === false) { // 授权弹窗被拒绝
          console.log(res + "wang jujue")
          wx.openSetting({
            success: res => {
              wx.getUserInfo({
                success: res => {
                  app.globalData.userInfo = res.userInfo
                },
                fail: res => {
                  console.log(res)
                  wx.reLaunch({     //跳转至指定页面并关闭其他打开的所有页面（这个最好用在返回至首页的的时候）
                    url: '/pages/index/index'
                  })
                }
              })
            },
            fail: res => {
              wx.reLaunch({     //跳转至指定页面并关闭其他打开的所有页面（这个最好用在返回至首页的的时候）
                url: '/pages/homes/home'
              })
            }
          })
        } else { // 没有弹出过授权弹窗
          wx.getUserInfo({
            success: res => {
              console.log(res)
              app.globalData.userInfo = res.userInfo
            },
            fail: res => {
              console.log(res)
              wx.openSetting({
                success: res => {
                  wx.openSetting({
                    success: res => {
                      wx.getUserInfo({
                        success: res => {
                          app.globalData.userInfo = res.userInfo
                        },
                        fail: res => {
                          console.log(res)
                          wx.reLaunch({     //跳转至指定页面并关闭其他打开的所有页面（这个最好用在返回至首页的的时候）
                            url: '/pages/homes/home'
                          })
                        }
                      })
                    },
                })
                },
                fail: res => {
                  wx.reLaunch({     //跳转至指定页面并关闭其他打开的所有页面（这个最好用在返回至首页的的时候）
                    url: '/pages/homes/home'
                  })
                }
              })
            }
          })
        }
      }
    })

    if (app.globalData.userInfo) {
      this.setData({
        userInfo: app.globalData.userInfo
      })

    }
    else
    {
      log.error("logic error!")
    }

    var m_url ='http://' + app.globalData.rotBackIp + ':' + app.globalData.rotBackPort + '/conversations/' + app.globalData.openid
    // 获取历史信息
    wx.request({
      url: m_url, //仅为示例，并非真实的接口地址
      method: 'GET',
      header: {
        'content-type': 'application/json' // 默认值
      },
      success(res) {
        console.log("获取历史数据成功，get return, data:")
        console.log( res.data)
        var ret_code = res.data.code
        if (ret_code == 1)
        {
          // 没有历史信息
          console.log("无历史信息:" + app.globalData.openid)
          log.info("无历史信息:" + app.globalData.openid)
        }
        else
        {
          var data = res.data.data
          console.log(data)
          console.log(res.data.data)
          var list = []
          var conversationList = res.data.data.conversation
          var messageStr = ''
          // 消息数组
          for (var index = 0; index < conversationList.length; ++index) {
            var get_str = conversationList[index];
            console.log("get_str:" + get_str)

            // 转换为json
            var strJson = get_str['message']
            if (strJson['type'] == 'other') {
              console.log("in texttype")
              var ret_str = '{ "message": "' + strJson['text'] + '", "sender": "' + get_str['sender'] + '" }'
              ret_str = ret_str.replace(/\n/g, "\\n");
              list.push(JSON.parse(ret_str))
            }
            else {
                var noticeList = strJson['notice']
                var rumorList = strJson['rumor']
                if (noticeList.length > 0) {
                  messageStr += '下面展示一些新闻通告:' + '\n' 
                  var ret_str = '{ "message": "' + messageStr + '", "sender": "' + get_str['sender'] + '" }'
                  // ret_str = ret_str.replace(/\n/g, "\\n");
                  // list.push(JSON.parse(ret_str))
                
                  for (var x = 0; x < noticeList.length; ++x) {
                    var tempJson = noticeList[x]
                    var tempStr = '[标题]:' + tempJson.title + '\n' + '[发布者]:' + tempJson.source + '\n' + '[详情链接]:' + tempJson.sourceUrl + '\n' 
                    messageStr +=tempStr
                    // var ret_str = '{ "message": "' + tempStr + '", "sender": "' + 'bot' + '" }'
                    // ret_str = ret_str.replace(/\n/g, "\\n");
                    // list.push(JSON.parse(ret_str))
                  }
                }
                if (rumorList.length > 0) {
                  messageStr += '下面展示一些谣言:' + '\n' 
                  // var ret_str = '{ "message": "' + messageStr + '", "sender": "' + 'bot' + '" }'
                  // ret_str = ret_str.replace(/\n/g, "\\n");
                  // list.push(JSON.parse(ret_str))
                
                  for (var x = 0; x < rumorList.length; ++x) {
                    var tempJson = rumorList[x]
                    var tempStr = '[标题]:' + tempJson.title + '\n' + '[发布者]:' + tempJson.source + '\n' + '[谣传内容]:' + tempJson.body + '\n' + '[结论]:' + tempJson.mainSummary + '\n' 
                    messageStr += tempStr
                    // var ret_str = '{ "message": "' + tempStr + '", "sender": "' + 'bot' + '" }'
                    // ret_str = ret_str.replace(/\n/g, "\\n");
                  
                  }
                }
              messageStr = messageStr.replace(/\n/g, "\\n");
              console.log(messageStr)
              var ret_str = '{ "message": "' + messageStr + '", "sender": "' + get_str['sender'] + '" }'
              ret_str = ret_str.replace(/\n/g, "\\n");
              list.push(JSON.parse(ret_str))
             }

            }

          that.setData({
            newslist: list,
             toView: "flag"
          })
          console.log(that.data.newslist)
       
        }
       
      },
      fail(res)
      {
        console.log("获取历史数据失败，get return, data:" + res.data)
        log.error("获取历史数据失败，get return, data:" + res.data)
        // wang 恢复
        // wx.navigateBack({
        //   delta: 2,
        // })//返回上一页面
        wx.showModal({
          title: '错误提示',
          content: '服务器未响应，请稍候再试',
          showCancel:false,
          success(res) {
            if (res.confirm) {
              log.error('服务器发生错误！')
            } 
          }
        })
      }
    })

  },

  // 页面卸载

  onUnload() {

    wx.closeSocket();

    wx.showToast({

      title: '连接已断开~',

      icon: "none",

      duration: 2000

    })

  },

  //事件处理函数

  send: function () {

    var flag = this

    if (this.data.message.trim() == "") {

      wx.showToast({

        title: '消息不能为空哦~',

        icon: "none",

        duration: 2000

      })

    }
    else
    {

      setTimeout(function () {

        flag.setData({

          increase: false

        })

      }, 500)
      var send_str = '{ "message": "' + this.data.message + '", "sender": "' +'user'+ '" }'
      var list = this.data.newslist
      list.push(JSON.parse(send_str))

      flag.setData({
        newslist: list,
        toView: "flag"
      })

      console.log(" send message:" + this.data.message)
      log.info("send message:" + this.data.message)
     // websocket.send(send_str)

      wx.request({
        url: 'http://' + app.globalData.rotBackIp + ':' + app.globalData.rotBackPort + '/send',
        data: {
          sender: app.globalData.openid,
          message: this.data.message,
        },
        method: 'POST',
        header: {
          'content-type': 'application/json' // 默认值
        },
        success(res) {
          console.log("send "+ ", 返回:") 
          console.log(res.data)
          var ret_code = res.data.code
          if (ret_code == 0) {
            var data = res.data.data
            console.log(data)
            console.log(res.data.data)
            var list = flag.data.newslist
            var conversationList = res.data.data.messages
            var messageStr = ''
            // 消息数组
            for (var index = 0; index < conversationList.length; ++index) 
            {
              var get_str = conversationList[index];
              console.log("get_str:" + get_str)

              // 转换为json
              var strJson = get_str
              if (strJson['type'] == 'other') {
                console.log("in texttype")
                var ret_str = '{ "message": "' + strJson['text'] + '", "sender": "' + 'bot' + '" }'
                ret_str = ret_str.replace(/\n/g, "\\n");
                list.push(JSON.parse(ret_str))
              }
              else 
              {
                console.log("in notice rumor")
                var noticeList = strJson['notice']
                var rumorList = strJson['rumor']
                if (noticeList.length > 0) 
                {
                  messageStr += '下面展示一些新闻通告:' + '\n'
                  var ret_str = '{ "message": "' + messageStr + '", "sender": "' + 'bot' + '" }'
                  // ret_str = ret_str.replace(/\n/g, "\\n");
                  // list.push(JSON.parse(ret_str))

                  for (var x = 0; x < noticeList.length; ++x) {
                    var tempJson = noticeList[x]
                    var tempStr = '[标题]:' + tempJson.title + '\n' + '[发布者]:' + tempJson.source + '\n' + '[详情链接]:' + tempJson.sourceUrl + '\n'
                    messageStr += tempStr
                    // var ret_str = '{ "message": "' + tempStr + '", "sender": "' + 'bot' + '" }'
                    // ret_str = ret_str.replace(/\n/g, "\\n");
                    // list.push(JSON.parse(ret_str))
                  }
                }

                if (rumorList.length > 0) 
                {
                  messageStr += '下面展示一些谣言:' + '\n'
                  for (var x = 0; x < rumorList.length; ++x) {
                    var tempJson = rumorList[x]
                    var tempStr = '[标题]:' + tempJson.title + '\n' + '[发布者]:' + tempJson.source + '\n' + '[谣传内容]:' + tempJson.body + '\n' + '[结论]:' + tempJson.mainSummary + '\n'
                    messageStr += tempStr
                    // var ret_str = '{ "message": "' + tempStr + '", "sender": "' + 'bot' + '" }'
                    // ret_str = ret_str.replace(/\n/g, "\\n");

                  }
                }
                messageStr = messageStr.replace(/\n/g, "\\n");
                console.log(messageStr)
                var ret_str = '{ "message": "' + messageStr + '", "sender": "' + 'bot' + '" }'
                ret_str = ret_str.replace(/\n/g, "\\n");
                list.push(JSON.parse(ret_str))
              }

            }

            flag.setData({
              newslist: list,
              toView: "flag"
            })

          }
          else {
            log.error("发生未知错误，用户发送消息，机器人返回code为1.")
            wx.showToast({
              title: '未知错误',
              duration:3000,
            })
          }
          flag.setData({
            toView: "flag"
          })
        },
        fail(res) {
          wx.showModal({
            title: '错误提示',
            content: '服务器未响应，请稍候再试',
            showCancel: false,
            success(res) {
              if (res.confirm) {
                    // wang 此段需要恢复
                // log.error('服务器发生错误！')
                // wx.navigateBack({
                //   delta: 2,
                //});//返回上一页面
              }
            }
          })
        }
      })

      // console.log("in test clear iput")
      flag.setData({
        toView: "flag"
      })

    }

  },

  //监听input值的改变

  bindChange(res) {

    this.setData({

      message: res.detail.value

    })

  },

  cleanInput() {

    //button会自动清空，所以不能再次清空而是应该给他设置目前的input值

    this.setData({

      message: this.data.message

    })

  },

  increase() {

    this.setData({

      increase: true,

      aniStyle: true

    })

  },

  //点击空白隐藏message下选框

  outbtn() {

    this.setData({

      increase: false,

      aniStyle: true

    })

  },


  //聊天消息始终显示最底端

  bottom: function () {

    var query = wx.createSelectorQuery()

    query.select('#flag').boundingClientRect()

    query.selectViewport().scrollOffset()

    query.exec(function (res) {

      wx.pageScrollTo({

        scrollTop: res[0].bottom // #the-id节点的下边界坐标

      })

      res[1].scrollTop // 显示区域的竖直滚动位置

    })

  },

})
