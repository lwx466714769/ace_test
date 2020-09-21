// shop/goodsdetails/goodsdetails.js
import urls from '../../utils/urls.js';
import { fetch, getRealOrderState, getGoodsState, toPayDLB, toDecimal2 } from '../../utils/utils.js'
Page({

  /**
   * 页面的初始数据
   */
  data: {
    logShow:"暂无物流信息"
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    let orderState = getGoodsState();
    let orderState2 = getRealOrderState();
    this.setData({
      orderId: options.orderId,
      orderState,
      orderState2
    })
    
  },
  initPage(){
    this.getOrderDetail();
    this.getRefundInfo();
  },
  getOrderDetail() {
    const { orderId } = this.data;
    let _this = this
    fetch({
      url: `${urls.order}/${orderId}`,
      loading: '加载中...',
      success: body => {
        body.info = body.info && body.info != "string" && JSON.parse(body.info);
        let productType = body.productType
        let orderState;
        let goodStates = [5,9,10,11]
        if (goodStates.indexOf(body.orderState)>-1) { 
          _this.getGoodsDetail()
        } else {
          
        }
        body.cardImg = body.info.productImg;
        // 两位小数化，合计直接转换，单价保留原价，整数部分单独转换
        let orderDecimal = body.orderAmount;
        body.orderDecimal = toDecimal2(orderDecimal, true);

        body.decimal = toDecimal2(orderDecimal);
        body.items.map(obj => {
          let amountDeciaml = obj.itemAmount;
          obj.amountInt = toDecimal2(obj.itemAmount, true);
          obj.decimal = toDecimal2(amountDeciaml);
        })
        this.setData({ order: body, productType, curCardOrderId: body.items[0].itemId, cur_count: body.items[0].itemCount, finalPrice: body.orderAmount });
        wx.setStorageSync('order', body)
      }

    })
  },
  getRefundInfo(){
    const {
      orderId
    } = this.data;
    const url = `${urls.goods}/aRefund/${orderId}`;
    const success = body => {
      if(body){
        let refundState = ''
        if(body.status == 0) refundState = '退款申请中'
        else if(body.status == 1) refundState = '退款已撤销'
        else if (body.status == 2) refundState = '退款成功'
        else if (body.status == 1) refundState = '退款被拒绝'
        this.setData({
          refundInfo:body,
          refundState
        })
      }
    }
    const fail = body => {
      wx.showToast({
        title: body.message || '请检查网络',
      });
    }
    fetch({ url, success, fail, loading: false });
  },
  getGoodsDetail(){
    const { orderId } = this.data;
    fetch({
      url: `${urls.goods}/${orderId}`,
      loading: '加载中...',
      success: body => {
        body.info = body.info && body.info != "string" && JSON.parse(body.info);
        if(body.expressage){
          body.expressage.info = body.expressage.info && body.expressage.info != "string" && JSON.parse(body.expressage.info);
        }
        
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
        }else if(body.status == 7){
          if (body.expressage && body.expressage.info) {
            logShow = body.expressage.info.lastResult.data[0].context
          } else {
            logShow = '已确认收货'
          }
        }
        this.setData({ goods: body, logShow });
        wx.setStorageSync('goods', body)
      }
    })
  },
  goMessage(){
    const { orderId } = this.data;
    wx.navigateTo({
      url:`/shop/logisticsmessage/logisticsmessage?orderId=${orderId}`,
    })
  },
  goRefund(){
    const { orderId } = this.data;
    wx.navigateTo({
      url: `/shop/refunddetail/refunddetail?orderId=${orderId}`,
    })
  },
  goApplyRefund(){
    const { orderId } = this.data;
    wx.navigateTo({
      url: `/shop/applyrefund/applyrefund?orderId=${orderId}`,
    })
  },
  confirmGoods(){
    wx.showModal({
      title:'确认收货？',
      content: '请确定您已收到商品',
      success:res =>{
        if(res.confirm){
          const {orderId} = this.data;
          const url = `${urls.goods}/affirm/${orderId}`;
          const success = body => {
            wx.showToast({
              title: '确认成功',
            });
            wx.navigateBack()
          }
          const fail = body => {
            wx.showToast({
              title: body.message || '请检查网络',
            });
          }
          fetch({ url, success,method:'POST', fail, loading: false });
        }
      }
    })
    
  },
  cancelRefund(){
    const {
      orderId
    } = this.data;
    const url = `${urls.goods}/aRefund/${orderId}`;
    const success = body => {
      wx.showToast({
        title: '撤销成功',
      })
      wx.navigateBack({
        
      })
    }
    const fail = body => {
      wx.showToast({
        title: '撤销失败',
        icon: 'none'
      })
    }
    fetch({ url, success, fail, method: 'DELETE', loading: '正在撤销' })
  },
  //取消订单
  cancelOrder() {
    const { orderId, productType } = this.data;
    wx.showModal({
      title: '提示',
      cancelText: '再想想',
      content: '您确认要取消此订单吗？',
      success: res => {
        if (res.confirm) {
          fetch({
            url: `${urls.order}/cancel/${orderId}`,
            method: 'POST',
            loading: '处理中...',
            success: () => {
              let pages = getCurrentPages();
              var prePages = pages[pages.length - 2];
              prePages.setData({ isUpdate: true, productType });
              wx.showToast({
                title: '取消成功',
                duration: 3000,
                success: res => {
                  wx.navigateBack();
                }
              })
            },
            fail: body => {
              wx.showToast({
                title: body.message || '取消失败',
              })
            }
          })
        }
      },
    })
  },
  applyCard() {
    const { orderId } = this.data;
    const { curCardOrderId, cur_count, finalPrice } = this.data
    // let data = [{
    //   count: cur_count,
    //   specificationsId: curCardOrderId
    // }]
    if (finalPrice == 0) {
      this.payed(orderId)
    } else {
      this.toPay(orderId);
    }
  },
  //需要支付0元，支付完成
  payed(orderId) {
    const url = `${urls.order}/pay/${orderId}`;
    let _this = this
    const success = body => {
      _this.goPayedOrder(_this.orderId)
    };
    fetch({
      url,
      success,
      method: 'POST',
      loading: '正在处理',
    })
  },
  //去支付
  toPay(orderId) {
    const { productType } = this.data.order;
    toPayDLB(orderId, productType).then(() => {
      this.goPayedOrder(orderId);
    })
  },
  goPayedOrder(orderId) {
    let {
      isVerify,
      productType,
      info,
      clubId
    } = this.data.order;
    this.pushClubId();
    wx.redirectTo({
      url: `/shop/completecard/completecard?gift=${info.gift}&orderId=${orderId}&productType=2&clubId=${clubId}&checked=${isVerify}`,
    })
  },
  //购买商品后推送消息至手持机
  pushClubId() {
    const { clubId } = this.data.order;
    let url = `${urls._verify}/push/${clubId}`;
    let success = body => {

    }
    let fail = body => {
    }
    fetch({ url, method: 'POST', success, fail })
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
    this.initPage()
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