// pages/main/main.js
import urls from '../../utils/urls.js';
import {fetch,login} from '../../utils/utils.js';
Page({

  /**
   * 页面的初始数据
   */
  data: {
    showJoinForm:true
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {

  },
  goJoin(e){
    console.log(e)
    // login(e,()=>{})
    this.setData({showJoinForm:true})
  },
  goPersonal(){
    wx.navigateTo({
      url: '/personal/personal/personal',
    })
  },
  goSponsorList(){
    wx.navigateTo({
      url: '/pages/sponsor-list/sponsor-list',
    })
  },
  showJoinForm(){
    this.setData({showJoinForm:false});
  },
  bingInputName(e){
    const {vaule} = e.detail;
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
})