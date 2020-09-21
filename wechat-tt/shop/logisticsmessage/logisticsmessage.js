// shop/goodsdetails/logisticsmessage.js
import urls from '../../utils/urls.js';
import { fetch, getRealOrderState, getGoodsState } from '../../utils/utils.js'
Page({

  /**
   * 页面的初始数据
   */
  data: {
    logShow:"暂无物流信息",
    list:[]
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.setData({
      orderId: options.orderId,
    }, this.initPage)
    
  },
  initPage(){
    this.getGoodsDetail();
  },
  getCompanyCode(){
      const {company}=this.data;
      fetch({
          url: `${urls.company}`,
          data:{companyCode:company},
          loading: '加载中...',
          success: body => {
             this.setData({
                 logisticsName:body.companyName
             })
          }
      })
  },
  getGoodsDetail(){
    const { orderId ,list} = this.data;
    fetch({
      url: `${urls.goods}/${orderId}`,
      loading: '加载中...',
      success: body => {
        body.info = body.info && body.info != "string" && JSON.parse(body.info);
        body.expressage.info = body.expressage.info && body.expressage.info != "string" && JSON.parse(body.expressage.info);
        let logShow = "暂无物流信息"
        if(body.status==1){
          logShow = '待发货'
        }else if(body.status == 2){//已发货
          if(body.expressage&&body.expressage.info){
            logShow = body.expressage.info.lastResult.data[0].context
          }else{
            logShow = '已发货'
          }
        }else if(body.status == 3){//已签收
          logShow = '已签收'
        }
        if (body.expressage&&body.expressage.info!=null){
          body.expressage&&body.expressage.info.lastResult.data.map(item=>{
            item.time=item.time.substring(5,10);
            item.ftime=item.ftime.substring(10,16);
          })
        }
        this.setData({ goods: body, logShow});
        if (body.expressage.info!=null){
          this.setData({
            list:body.expressage.info.lastResult.data
          })
        }
        if (body.expressage.company!=null){
            this.setData({
                company:body.expressage.company
            })
            this.getCompanyCode();
        }
      }
    })
  },
  confirmFn(){
    const _this = this;
    const {goods}=this.data;
    const text = goods.trackingNumber;
    wx.setClipboardData({
      data: text,
      success: function (res) {
        wx.getClipboardData({
          success: function (res) {
            wx.showToast({
              title: '复制成功'
            })
          }
        })
      }
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