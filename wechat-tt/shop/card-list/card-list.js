// pages/card-list/card-list.js
import urls from '../../utils/urls.js';
// import constv from '../../const.js';
import {
  fetch,
  formatPosts,
  login,
  bindPhone,
  getUserInfo,
  // checkUserState,
  // slideUpAnimation,
  // formatCards,
  formatPostsAce,
  toDecimal2
} from '../../utils/utils.js';
Page({

  /**
   * 页面的初始数据
   */
  data: {
    // clubId:constv.cid
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    if(options.clubId){
      this.setData({clubId:options.clubId});
    }
    this.getCardList()
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
    this.getCardList()
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
  /*--获取所有卡片数据--*/
  getCardList() {
    const _this = this;
    const {
      clubId
    } = this.data;
    // const url = `${urls._cardList}?clubId=${clubId}`;
    const url = `${urls._cardList}?clubId=${clubId}&pageNo=0&pageSize=20`;
    const success = body => {
      body.content.map(item=>{
        item.commodities.map(obj=>{
          obj.commoditySpecifications.map(goods=>{
            goods.priceInt = toDecimal2(goods.currentPrice,true);
            goods.priceDecimal = toDecimal2(goods.currentPrice);
            goods.originalInt = toDecimal2(goods.originalPrice, true);
            goods.originalDecimal = toDecimal2(goods.originalPrice);
          })
        })
      })
      console.log(body);
      _this.setData({
        cardsAll: body.content
      });
    };
    const fail = body => {
      wx.showToast({
        title: body.message,
        icon: 'none',
      });
      wx.hideToast();
    };
    fetch({
      url,
      success,
      fail,
      loading: false,
    })
  },
  welfareCardDetail(e) {
    const {
      id
    } = e.currentTarget.dataset;
          wx.navigateTo({
      url: `/shop/carddetails/carddetails?cardId=${id}`
    })
  },
})