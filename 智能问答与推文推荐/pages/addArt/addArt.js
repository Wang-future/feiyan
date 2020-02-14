
var app = getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    invcode:'',
    title:'',
    author:'',
    referenceLink:[],
    invcode:'',
    choices:['文章','通知'],
    index:0,
    text:''
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {

  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {

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

  //获取用户输入的标题名
  titleInput: function (e) {
    this.setData({
      title: e.detail.value
    })
  },

  authorInput: function (e) {
    this.setData({
      author: e.detail.value
    })
  },

  textInput: function (e) {
    this.setData({
      text: e.detail.value
    })
  },

  refInput: function (e) {
    // split
    var arr = e.detail.value.split(',');
    console.log(arr)
    this.setData({
      referenceLink: arr
    })
  },

  invcodeInput: function (e) {
    this.setData({
      invcode: e.detail.value
    })
  },

  bindPickerChange: function (e) {
    console.log('picker发送选择改变，携带值为', e.detail.value)
    this.setData({
      index: e.detail.value
    })
  },

  goToFirm:function(e)
  {
    var that = this
    // title
    if (this.data.title.trim() == "") 
    {
     
      wx.showToast({
        title: '标题不能为空哦',
        icon: "none",
        duration: 2000
      })
    }
    else 
    {
      if (this.data.text.trim() == "") {

        wx.showToast({
          title: '正文不能为空哦',
          icon: "none",
          duration: 2000
        })
      }
      else {
        if (this.data.invcode.trim() == "") {
          
          wx.showToast({
            title: '邀请码不能为空哦',
            icon: "none",
            duration: 2000
          })
        }
        else {
          // 合法的输入了
  
          var article ={}
          article['title'] = that.data.title
          article['author'] = that.data.author
          article['text'] = that.data.text
          article['referenceLink'] = that.data.referenceLink
          article['type'] = that.data.index // 注意这里的更改
          article['invcode'] = that.data.invcode
          var murl = 'http://' + app.globalData.backIp + ':' + app.globalData.backPort + '/' + 'addArticle'
          wx.request({
            url: murl,
            data: {
              seqId: "fjl",
              article: article,
            },
            method: 'POST',
            header: {
              'content-type': 'application/json' // 默认值
            },
            success(res) {
              console.log("获取到返回值:")
              console.log(res.data.code)
              if (res.data.code == 0) 
              {
                wx.showToast({
                  title: '发布成功',
                })
                // wx.switchTab({
                //   url: '/pages/homes/home',
                // })
              }
              else
              {
                if (res.data.code == 2) 
                {
                  wx.showModal({
                    title: '发布不成功',
                    content: '邀请码错误',
                    showCancel:false,
                    success(res) {
                      if (res.confirm) {
                        
                      }
                    }
                  })
                }
                else
                {
                  wx.showModal({
                    title: '发布不成功',
                    content: '服务器出现错误',
                    showCancel: false,
                    success(res) {
                      if (res.confirm) {

                      }
                    }
                  })
                }
              }

            },
            fail(res) {
              wx.showModal({
                title: '发布不成功',
                content: '网络出现错误',
                showCancel: false,
                success(res) {
                  if (res.confirm) {

                  }
                }
              })
            }
          })
        }
      }
    }
  
  }
})