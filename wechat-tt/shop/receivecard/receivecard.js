// miniwelfare/receivecard/receivecard.js
import urls from '../../utils/urls.js';
import {
  fetch,
  login
} from '../../utils/utils.js';
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
    let cardId = options.cardId
    this.getCardInfo(cardId)
  },
  getCardInfo(cardId) {
    const url = `${urls.card}/${cardId}`;
    let data = {}
    const success = body => {
      const card = body;
      // const { expireAtType, expireAt} = card;
      // const term = ''
      // if(expireAtType == 1){
      //   const term = '无限期'
      // }
      card.info = JSON.parse(card.info)
      this.setData({
        card
      })
    }
    const fail = body => {
      wx.showToast({
        title: body.message || '请检查网络',
      });
    }
    fetch({
      url,
      data,
      success,
      fail,
      loading: false
    });
  },
  checkCard(e) {
    if (this.data.card) {
      let card = this.data.card
      if (card.presentState==2) {
        //领取卡片
        login(e, () => {
          const user = wx.getStorageSync('user');
          const receive_userId = user.userId;
          const give_userId = this.data.card.userId;
          if (receive_userId == give_userId) {
            wx.showToast({
              title: '您是礼品卡拥有者,不可以自己领取',
              mask: true,
              icon: 'none',
              duration: 3000,
            })
          } else {
            const {
              id,
            } = this.data.card;
            const url = `${urls.card}/gain/${id}`;
            const data = {
              userId: receive_userId
            };
            const success = body => {
              if (body) {
                this.setData({
                  'card.presentState': 3
                })
              } else {
                wx.showToast({
                  title: '卡片已经被领取',
                  icon: 'none',
                  duration: 300,
                })
              }
            }
            const fail = body => {
              wx.showToast({
                title: body.message || "卡片领取失败",
                icon: 'none'
              })
            }
            fetch({
              url,
              data,
              method: 'POST',
              success,
              fail,
              loading: '加载中...'
            })

          }

        })
      } else {
        login(e, () => {
          wx.redirectTo({
            url: '/personal/personal-mycard/personal-mycard',
          })
        })
        
      }
    }
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