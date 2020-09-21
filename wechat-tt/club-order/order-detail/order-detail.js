// club-order/order-detail/order-detail.js
import urls from '../../utils/urls.js';
import { fetch, getRealOrderState, getOrderState, toPayDLB, toDecimal2 } from '../../utils/utils.js';
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
  },
  // 获取订单详情
  getOrderDetail(){
    const {orderId} = this.data;
    fetch({
      url: `${urls.order}/${orderId}`,
      loading: '加载中...',
      success: body => {
        body.info = body.info && body.info != "string" && JSON.parse(body.info);
        body.verifyMessages = body.verifyMessages && body.verifyMessages != "string" && JSON.parse(body.verifyMessages);
        let productType = body.productType
        let orderState;
        if (body.orderState == 8) {
          orderState = getRealOrderState(body.reason);
        } else {
          if(productType == 3){
            orderState = getRealOrderState();
          }else{
            orderState = getOrderState()
          }
        }
        body.cardImg=body.info.productImg;
        // 两位小数化
        let orderDecimal = body.orderAmount;
        body.amountInt = toDecimal2(body.orderAmount, true);
        body.decimal = toDecimal2(orderDecimal);
        body.items.map(obj => {
          let amountDeciaml = obj.itemAmount;
          obj.amountInt = toDecimal2(obj.itemAmount, true);
          obj.decimal = toDecimal2(amountDeciaml);
        })
        console.log(body);
        this.setData({ order:body, orderState,productType,curCardOrderId:body.items[0].itemId,cur_count:body.items[0].itemCount,finalPrice:body.orderAmount});
      }
      
    })  
  },
  // 申请信息图片预览
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
              prePages.setData({ isUpdate: true ,productType});
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
  delCard(e) {
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
  // 支付验证
  applyCard(){
    const {orderId}=this.data;
    const { curCardOrderId, cur_count, finalPrice } = this.data
    let data = [{
      count: cur_count,
      specificationsId: curCardOrderId
    }]
    if (finalPrice == 0) {
      this.payed(orderId)
    } else {
      this.toPay(orderId);
    }
  },
  //需要支付0元，支付完成
  payed(orderId) {
    const url=`${urls.order}/pay/${orderId}`;
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
  // 支付完成页面
  goPayedOrder(orderId){
    let {
      isVerify,
      productType,
      info,
      clubId
    } = this.data.order;
    this.pushClubId();
    wx.redirectTo({
      url: `/shop/completecard/completecard?gift=${info.gift}&orderId=${orderId}&productType=${productType}&clubId=${clubId}&checked=${isVerify}`,
    })
  },
  //购买商品后推送消息至手持机
  pushClubId(){
    const {clubId}=this.data.order;
    let url = `${urls._verify}/push/${clubId}`;
    let success = body =>{

    }
    let fail = body =>{
    }
    fetch({url,method:'POST',success,fail})
  },
  // 查看卡片，进详情
  goMycardDetail(e) {
    const orderId = e.currentTarget.dataset.id;
    const giftCardStatus = e.currentTarget.dataset.status;
    fetch({
      url: `${urls._consumerCard}/${orderId}/orderCheckCard?gift=${giftCardStatus}`,
      loading: '加载中...',
      success: body => {
        if (body.cardTotal == 0) {
          wx.showToast({
            title: '您的卡片已删除',
            icon: 'none'
          })
        } else{
          if (body.consumerCards[0].gift) {
            wx.navigateTo({
              url: `/club-card/mycard-gift-detail/mycard-gift-detail?orderId=${orderId}`,
            })
          } else {
            wx.navigateTo({
              url: `/club-card/mycard-detail/mycard-detail?orderId=${orderId}`,
            })
          }
        }
      }
    })
  }
})