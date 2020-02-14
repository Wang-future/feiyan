var types = ['default', 'primary', 'warn']
var app = getApp()
var log = require('../../utils/log.js');
var pageObject = {
  data: {
    defaultSize: 'default',
    primarySize: 'default',
    warnSize: 'default',
    disabled: false,
    plain: false,
    loading: false
  },
  setDisabled: function (e) {
    this.setData({
      disabled: !this.data.disabled
    })
  },
  setPlain: function (e) {
    this.setData({
      plain: !this.data.plain
    })
  },
  setLoading: function (e) {
    this.setData({
      loading: !this.data.loading
    })
  },
  onLoad:function(e){
    if (!app.globalData.openid) {
      console.log("in test")
      wx.showModal({
        title: '错误提示',
        content: '服务器未响应,暂时无法使用机器人聊天',
        showCancel: false,
        success(res) {
          if (res.confirm) {
            wx.reLaunch({     //跳转至指定页面并关闭其他打开的所有页面（这个最好用在返回至首页的的时候）
              url: '/pages/homes/home'
            })
            log.error('没有获取到用户openid！')
          }
        }
      })
    }
  },
  onGotUserInfo: function (e) {
    if (!app.globalData.openid) {
      console.log("in test")
      wx.showModal({
        title: '错误提示',
        content: '服务器未响应,暂时无法使用机器人聊天',
        showCancel: false,
        success(res) {
          if (res.confirm) {
            wx.reLaunch({     //跳转至指定页面并关闭其他打开的所有页面（这个最好用在返回至首页的的时候）
              url: '/pages/homes/home'
            })
            log.error('没有获取到用户openid！')
          }
        }
      })
      wx.showToast({
        title: '服务器未响应,暂时无法使用机器人聊天',
      })
    }
    if (!e.detail.userInfo) {
      //用户按了拒绝按钮
      wx.showModal({
        title: '提示',
        showCancel: false,
        content: '不授权图像与昵称将无法进入人机问答',
      })
    } 
    else{
      console.log("in inner ")
      wx.navigateTo({
        url: '../chat/chat',
      })
    }
  },
}

for (var i = 0; i < types.length; ++i) {
  (function (type) {
    pageObject[type] = function (e) {
      var key = type + 'Size'
      var changedData = {}
      changedData[key] =
        this.data[key] === 'default' ? 'mini' : 'default'
      this.setData(changedData)
    }
  })(types[i])
}

Page(pageObject)