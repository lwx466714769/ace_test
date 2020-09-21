// pages/login/login.js
import {login} from '../../utils/utils'
Page({

  /**
   * 页面的初始数据
   */
  data: {

  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    // const {userId} = wx.getStorageSync('user');
    // if(userId){
    //   console.log('aa')
    //   wx.redirectTo({
    //     url: '/personal/personal/personal',
    //   })
    // }
  },
  login(e){
    login(e, () => {
      wx.switchTab({
        url: '/pages/personal/personal',
      })
    })
  },
  
})