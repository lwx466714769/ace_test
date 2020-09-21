// club-order/order-detail/order-detail.js
import urls from '../../utils/urls.js';
import { fetch, getOrderState, formatDate, toDecimal2,toPayDLB } from '../../utils/utils.js'
import constv from '../../const.js';
Page({

  /**
   * 页面的初始数据
   */
  data: {
    
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (ops) {
    console.log(ops);
    this.setData({orderId:ops.orderId},this.getOrderDetail);
  },
  getOrderDetail(){
    const {orderId} = this.data;
    fetch({
      url: `${urls.order}/${orderId}`,
      loading: '加载中...',
      success: body => {
        body.info = body.info && body.info != "string" && JSON.parse(body.info);
        body.verifyMessages = body.verifyMessages && body.verifyMessages != "string" && JSON.parse(body.verifyMessages);
        let productType=body.productType
        let orderState;
        if (body.orderState == 8) {
          orderState = getOrderState(body.verifyMessages);
        } else {
          orderState = getOrderState();
        }
        body.createAt = formatDate(body.createAt);
        body.expireAt = formatDate(body.expireAt);
        // 两位小数化
        let orderDecimal = body.orderAmount;
        body.amountInt = toDecimal2(body.orderAmount, true);
        body.decimal = toDecimal2(orderDecimal);
        body.items.map(obj => {
          let amountDeciaml = obj.itemAmount;
          obj.amountInt = toDecimal2(obj.itemAmount, true);
          obj.decimal = toDecimal2(amountDeciaml);
        })
        this.setData({ order: body, orderState,productType });
        // this.setData({ order:body, orderState },this.getEventDate);
      }
      
    })  
  },
  getEventDate(){
    let {order} = this.data;
    fetch({
      url: `${urls._event}/${order.eventId}`,
      loading: '加载中...',
      success: body => {
        order.startAt = formatDate(body.startAt);
        order.endAt = formatDate(body.endAt);
        console.log(body);
        this.setData({ order});
      }
    })
  },
  preview(e) {
    const { url} = e.currentTarget.dataset;
    wx.previewImage({
      current: url,
      urls:[url]
    })
  },
  // 取消订单
  cancelOrder() {
    const {orderId,productType} = this.data;
    wx.showModal({
      title: '提示',
      cancelText:'再想想',
      content: '您确认要取消此订单吗？',
      success: res => {
        if(res.confirm){
          fetch({
            url: `${urls.order}/cancel/${orderId}`,
            method: 'POST',
            loading: '处理中...',
            success: () => {
              let pages = getCurrentPages();
              var prePages = pages[pages.length - 2];
              prePages.setData({ isUpdate: true,productType});
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
  // 删除订单
  delEvent(e) {
    const {orderId,productType} = this.data;
    wx.showModal({
      title: '提示',
      content: '您确认要删除此订单吗？',
      success:res=>{
        if(res.confirm){
          fetch({
            url: `${urls.order}/${orderId}`,
            method: 'DELETE',
            loading: '处理中...',
            success: () => {
              let pages = getCurrentPages();
              var prePages = pages[pages.length - 2];
              prePages.setData({ isUpdate: true,productType });
              wx.showToast({
                title: '删除成功',
                duration: 3000,
                success: res => {
                  wx.navigateBack();
                }
              })
            },
            fail: body => {
              wx.showToast({
                title: body.message || '删除失败',
              })
            }
          })
        }
      },
    })
  },
  paySubmit(){
    wx.showToast({
      title: '请重新下单',
      icon: 'none'
    })
  },
  //需要支付0元，支付完成
  payed(orderId) {
    fetch({
      url: `${urls.order}/pay/${orderId}`,
      method: 'POST',
      loading: '加载中...',
      success: body => {
        wx.redirectTo({
          url: `/event/event-result/event-result?orderId=${orderId}`,
        })
      }
    })
  },
  //去支付
  toPay(orderId) {
    toPayDLB(orderId).then(() => {
      this.payed(orderId);
    })
  },
  // 查看卡片，进详情
  goEventDetail(e) {
    const orderId = e.currentTarget.dataset.id;
    wx.navigateTo({
      url: `/event/event-ticket/event-ticket?orderId=${orderId}`,
    })
    // fetch({
    //   url: `${urls._consumerCard}/${orderId}/orderCheckCard`,
    //   loading: '加载中...',
    //   success: body => {
    //     if (body.cardTotal == 0) {
    //       wx.showToast({
    //         title: '您的卡片已删除',
    //         icon: 'none'
    //       })
    //     } else{
    //       wx.navigateTo({
    //         url: `/event/event-detail/event-detail?orderId=${orderId}`,
    //       })
    //     }
    //   }
    // })
  }
})