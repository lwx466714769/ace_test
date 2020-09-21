// miniwelfare/completecard/completecard.js
Page({

  /**
   * 页面的初始数据
   */
  data: {

  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    const {
      orderId,
      gift,
      productType,
      clubId,
      checked
    } = options
    this.setData({
      orderId,
      gift,
      productType,
      clubId,
      checked
    })
  },
  goCard() {
    const {
      orderId,
      gift,
      productType,
      checked
    } = this.data
    console.log(gift)
    if (productType == 1) { //卡券
      if(checked=="true"){//需审核
        wx.redirectTo({
          url: '/club-order/order-list/order-list',
        })
      }
      else if (gift=="true") {
        wx.redirectTo({
          url: '/personal/personal-mygift/personal-mygift',
        })
      } else {
        wx.redirectTo({
          url: '/personal/personal-mycard/personal-mycard',
        })
      }
    } else if (productType == 2) { //实物
      wx.redirectTo({
        url: '/personal/personal-welfare/personal-welfare',
      })
    }
  },
  goClub() {
    wx.switchTab({
      url: `/pages/index/index`,
    })
  },
  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function() {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function() {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function() {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function() {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function() {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function() {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function() {

  }
})