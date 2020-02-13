var contentAll = require("../../data/homedata.js")
var util = require('../../utils/util.js');
var log = require('../../utils/log.js');
var seqId = util.wxuuid();
var app = getApp()
Page({

    /**
     * 页面的初始数据
     */
    data: {
      articles2: [{ "id": 1, "title": "标题", "author": "作者", "date": "日期", "text": "正文", "imgUrl": "/images/iais.jpg", "referenceLink": ["url1", "url2"] }],
      articles: []
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {

      this.getAllArticles()
      var imagesPath = [
          {
              "header_id": 1,
              "header_image": "../../images/iais.jpg"
          },
          {
              "header_id": 2,
              "header_image": "../../images/rot.jpg"
          },
          {
              "header_id": 3,
            "header_image": "../../images/yaoyansearch.jpg"
          }
      ];
      this.setData({
          content: contentAll.content,
          imagesPath: imagesPath
      });
    },

  searchClick: function (event){
    // wx.navigateTo({
    //   url: '../search/search',
    // })
    wx.navigateTo({
      url: '../search/search',
    })
  },
  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh() {
    console.log("i m")
    var that = this
    that.getAllArticles()
  },

    /**
     * 页面上拉触底事件的处理函数
     */
    onReachBottom: function () {

    },

    /**
     * 用户点击右上角分享
     */
    onShareAppMessage: function () {

    },

    onPostDetail: function (event) {
      var newsId = event.currentTarget.dataset.newsId;
      var jsonStr = this.data.articles[newsId - 1]
      app.globalData.showJsonStr = JSON.stringify(jsonStr)
      console.log("gggg:")
      console.log(app.globalData.showJsonStr)
      wx.navigateTo({
        url: '../details/details'
      })
    },


    onJumpPublish(){
        wx.navigateTo({
          url: '../addArt/addArt'
        })
    },

    getAllArticles:function()
    {
      var that = this
      var murl = 'http://' + app.globalData.backIp + ':' + app.globalData.backPort + '/' + 'getAllArticles'
      console.log("拉取文章url" + murl)
      wx.request({
        url: murl,
        data: {
          seqId: "fjl"
        },
        method: 'GET',
        header: {
          'content-type': 'application/json' // 默认值
        },
        success(res) {
          console.log("获取文章成功，get return, data:")
          console.log(res)
          var ret_code = res.data.code
          if (ret_code == 1) {
            // 没有历史信息
            console.log("获取不到热门文章::" + app.globalData.openid)
            log.error("获取不到热门文章:" + app.globalData.openid)
          }
          else {
            var artList = res.data.articles
            that.setData({
              articles: artList,
            })

          }

        },
        fail(res) {
          console.log("获取热门文章失败，get return, data:" + res.data)
          log.error("获取热门文章失败，get return, data:" + res.data)
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