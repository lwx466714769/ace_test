// miniwelfare/refunddetail/refunddetail.js
import urls from '../../utils/urls.js';
import { fetch} from '../../utils/utils.js'
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
    let goods = wx.getStorageSync('goods')
    this.setData({
      goods
    })
    this.getRefundData()
  },
  getRefundData() {
    const {
      orderId
    } = this.data.goods;
    const url = `${urls.goods}/aRefund/${orderId}`;
    const success = body => {
      this.setData({
        refundInfo:body
      })
    }
    const fail = body => {
      wx.showToast({
        title: body.message || '请检查网络',
      });
    }
    fetch({ url, success, fail, loading: false });
  },
  cancelRefund(){
    const {
      orderId
    } = this.data.goods;
    const url = `${urls.goods}/aRefund/${orderId}`;
    const success = body => {
      wx.showToast({
        title: '撤销成功',
      });
      wx.navigateBack({
        
      })
    }
    const fail = body => {
      wx.showToast({
        title: body.message || '请检查网络',
      });
    }
    fetch({ url, success, fail, method: 'DELETE', loading: false });
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