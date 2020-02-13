//var contentAll = require("../../data/homedata.js")
var util = require('../../utils/util.js');
var log = require('../../utils/log.js');
var seqId = util.wxuuid();
var app=getApp()
Page({
  /**
  * 页面的初始数据
  */
  data: {
    inputValue: '', //搜索的内容
    articles: []
  },


  onPostDetail: function (event) {
    var newsId = event.currentTarget.dataset.newsId;
    var getJson = this.data.articles[newsId - 1]
    app.globalData.showJsonStr = JSON.stringify(getJson)
    wx.navigateTo({
      url: '../details/details'
    })
  },

  //搜索框文本内容显示
  inputBind: function (event) {
    this.setData({
      inputValue: event.detail.value
    })
    console.log('bindInput' + this.data.inputValue)

  },
  /**
  * 搜索执行按钮
  */
  query: function (event) {

    var that = this
    var murl = 'http://' +app.globalData.backIp + ':' + app.globalData.backPort + '/search'
    console.log(murl)
    wx.showLoading({
      title: '正在查询,请稍候',
    })
    wx.request({
      url: murl, //仅为示例，并非真实的接口地址
      data: {
        searchStr: this.data.inputValue,
      },
      method: 'POST',
      header: {
        'content-type': 'application/json' // 默认值
      },
      success(res) {
        wx.hideLoading()
        console.log("获取搜索结果成功，get return, data:")
        console.log(res)
        var ret_code = res.data.code
        if (ret_code == 1) {
          // 没有历史信息
          console.log("无搜索结果:" + app.globalData.openid)
          log.info("无搜索结果:" + app.globalData.openid)
        }
        else {
          var artList = res.data.articles
          that.setData({
            articles: artList,
          })

        }

      },
      fail(res) {
        console.log("获取搜索结果失败")
        log.error("获取搜索结果失败")
        wx.showModal({
          title: '错误提示',
          content: '服务器未响应，请稍候再试',
          showCancel: false,
          success(res) {
            if (res.confirm) {
              log.error('服务器发生错误！')
            }
          }
        })
      }
    })
   
  }
})
