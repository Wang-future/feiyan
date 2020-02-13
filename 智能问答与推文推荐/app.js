App({
  onLaunch: function () {
    // 展示本地存储能力
    var logs = wx.getStorageSync('logs') || []
    logs.unshift(Date.now())
    wx.setStorageSync('logs', logs)

    // 登录
    wx.login({
      success: function (res) {
        var app = getApp()
        console.log('login:code', res.code)          //发送请求          
        wx.request({            
          url: 'http://47.112.189.78:5015/getOpenid', //接口地址            
          data: {'code': res.code},            
          header: {'content-type': 'application/json'},            
        success: function (res) {              
          console.log("record  成功", res.data)              
          if (res.error) { //发生错误

            console.log("获取openid错误：", res.msg);  
            log.error("错误：", res.msg);
            wx.showModal({
              title: '错误提示',
              content: '服务器发生错误，无法获取相关信息',
              showCancel: false,
              success(res) {
                if (res.confirm) {
                }
              }
            })
          }
          else { //返回成功 
            console.log("get openid:" + res.data )              
            app.globalData.openid = res.data
            console.log(app.globalData.openid)
          }            
        },            
        fail: function (err) 
        {              
          console.log("获取openid  失败", err);            
        }          
      })
      }
    })

    // 获取用户信息
    wx.getSetting({
      success: res => {
        if (res.authSetting['scope.userInfo']) {
          // 已经授权，可以直接调用 getUserInfo 获取头像昵称，不会弹框
          wx.getUserInfo({
            success: res => {
              // 可以将 res 发送给后台解码出 unionId
              this.globalData.userInfo = res.userInfo

              // 由于 getUserInfo 是网络请求，可能会在 Page.onLoad 之后才返回
              // 所以此处加入 callback 以防止这种情况
              if (this.userInfoReadyCallback) {
                this.userInfoReadyCallback(res)
              }
            }
          })
        }

      }
    })
  },
  globalData: {
    userInfo: null,
    trueIp: '47.112.189.78',
    backIp: '47.112.189.78',
    backPort: 5015,
    openid: '',
    unionid: '',
    get_articles_url:'http://47.112.189.78:5015/getAllArticles',
    search_url: 'http://47.112.189.78:5015/search',
    rotBackIp:'47.112.189.78',
    rotBackPort:'5000',
    showJsonStr:''
  }
})