// club-order/order-detail/order-detail.js
import urls from '../../utils/urls.js';
import { fetch, getOrderState, formatDate,toPayDLB } from '../../utils/utils.js';
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
    this.setData({orderId:ops.orderId},this.getOrderDetail);
    this.getOpenId()
  },
  //获取openId
  getOpenId() {
    return new Promise(
      (resolve, reject) => {
        const { userId } = wx.getStorageSync('user');
        let data = { userId: userId };
        const url = `${urls.openId}`;
        const success = body => {
          if (body) {
            this.setData({
              openId: body
            })
            resolve(body);
          } else {
            reject();
          }
        };
        const fail = body => {
          wx.showToast({
            title: !!body.message ? body.message : '请求失败',
            icon: 'none',
          })
          reject(body.message);
        }
        fetch({
          url,
          data,
          json: true,
          loading: '加载中...',
          success,
          fail,
        });
      }
    ).catch(
      (e) => {
        console.log('catch:', e)
      }
    )
  },
  getOrderDetail(){
    const {orderId} = this.data;
    fetch({
      url: `${urls._order}/${orderId}`,
      loading: '加载中...',
      success: body => {
        let orderState;
        if (body.state == 'AUDITFAIL') {
          orderState = getOrderState(body.reason);
        } else {
          orderState = getOrderState();
        }
        body.createAt = formatDate(body.createAt);
        body.expireAt = formatDate(body.expireAt);
        this.setData({ order:body, orderState },this.getEventDate);
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
    const {orderId} = this.data;
    wx.showModal({
      title: '提示',
      cancelText:'再想想',
      content: '您确认要取消此订单吗？',
      success: res => {
        if(res.confirm){
          fetch({
            url: `${urls._order}/${orderId}/cancel`,
            method: 'POST',
            loading: '处理中...',
            success: () => {
              let pages = getCurrentPages();
              var prePages = pages[pages.length - 2];
              prePages.setData({ isUpdate: true });
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
    const {orderId} = this.data;
    wx.showModal({
      title: '提示',
      content: '您确认要删除此订单吗？',
      success:res=>{
        if(res.confirm){
          fetch({
            url: `${urls._order}/${orderId}`,
            method: 'DELETE',
            loading: '处理中...',
            success: () => {
              let pages = getCurrentPages();
              var prePages = pages[pages.length - 2];
              prePages.setData({ isUpdate: true });
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
    const { order } = this.data;
    if(order.totalPrice == 0){
      this.payed(order.orderId);
    } else if(this.data.openId){
      this.toPay(order.orderId);
    }else {
      this.getOpenId().then(() => {
        this.toPay(order.orderId)
      }).catch(() => {
        wx.showToast({
          title: '无法获取用户信息',
          icon: 'none'
        });
      })
    }
  },
  //需要支付0元，支付完成
  payed(orderId) {
    fetch({
      url: `${urls._order}/${orderId}/payed`,
      method: 'POST',
      loading: '加载中...',
      success: body => {
        wx.redirectTo({
          url: `/event/event-result/event-result?orderId=${orderId}`,
        })
      }
    })
  },
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