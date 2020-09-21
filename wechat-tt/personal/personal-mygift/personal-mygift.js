// personal/personal-mygift/personal-mygift.js
import urls from '../../utils/urls.js';
import {
  fetch
} from '../../utils/utils.js';
import constv from '../../const.js'
Page({

  /**
   * 页面的初始数据
   */
  data: {
    showHomeBtn: false
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.initPage()
  },
  initPage() {
    this.getCardPackages();
  },
  /**
   * 获取礼品卡包列表
   */
  getCardPackages(){
    const url = `${urls.card}/cardPackage`;
    let data = {
      clubId: constv.cid
    };
    const success = body => {
      if (body.true) {
        body.true.map(p => {
          let infoStr = p.patternUrl
          let info = JSON.parse(infoStr)
          p.info = info
        })
      }
      this.setData({
        packages: body.true
      })
    }
    const fail = body => {
      wx.showToast({
        title: body.message || '请检查网络',
      });
      this.setData({ exitSome: true, });
    }
    fetch({ url,data, success, fail, loading: false });
  },
  go_gift(e){
    const index = e.currentTarget.dataset.index;
    const { packages }= this.data
    wx.setStorage({
      key: 'currentPackage',
      data: packages[index],
    })
    wx.navigateTo({
      url: `/shop/cardtickets/cardtickets`,
    })
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

  }
})