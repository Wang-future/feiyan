
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

    newslist: [{ message: "hello!", sender: 'bot' }, { sender: 'usr',message: "hello!" }],

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
                            url: '/pages/index/index'
                          })
                        }
                      })
                    },
                })
                },
                fail: res => {
                  wx.reLaunch({     //跳转至指定页面并关闭其他打开的所有页面（这个最好用在返回至首页的的时候）
                    url: '/pages/index/index'
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

    var m_url = 'http://39.108.53.240:6005/conversations/' + app.globalData.openid
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
          var conversationList = res.data.data.conversation
          console.log(conversationList)
          console.log(that.data.newslist)
          that.setData({
            newslist: conversationList,
             toView: "flag"
          })
          
         console.log("lisg:")
          console.log(conversationList)
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
    // 调用信息

    //调通接口

    // wang 此段需要恢复
    // websocket.connect(this.data.userInfo, function (res) {

    //   // console.log(JSON.parse(res.data))

    //   var list = []

    //   list = that.data.newslist

    //   list.push(JSON.parse(res.data))

    //   that.setData({

    //     newslist: list

    //   })

    // })

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
    else {

      setTimeout(function () {

        flag.setData({

          increase: false

        })

      }, 500)
      var send_str = '{ "message": "' + this.data.message + '", "sender": "' +'usr'+ '" }'
      var list = this.data.newslist
      list.push(JSON.parse(send_str))

      this.setData({
        newslist: list
      })

      console.log(" send message:" + this.data.message)
      log.info("send message:" + this.data.message)
     // websocket.send(send_str)

      wx.request({
        url: 'http://39.108.53.240:6005/send',
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
            // 消息数组
            var data = res.data.data
            var messLists = data.messages
            var list = flag.data.newslist
            for(var index = 0; index < messLists.length; ++index)
            {
              var ret_str = '{ "message": "' + messLists[index] + '", "sender": "' + 'bot' + '" }'
              list.push(JSON.parse(ret_str))
            }
            flag.setData({
              newslist: list
            })
            flag.setData({

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
      this.setData({

        toView: "flag"

      })

     //this.bottom()

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
