// club/order-list/order-list.js
import urls from '../../utils/urls.js';
import { fetch, getOrderState } from '../../utils/utils.js'
import constv from '../../const.js'
Page({

  /**
   * 页面的初始数据
   */
  data: {
    page:0,
    count:10,
    orderList:[],
    showAll:'',
    showTicket:false
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.getOrderList();
  },
  onShow() {
    const { isUpdate } = this.data;
    if (isUpdate) {
      this.setData({page:0,showAll:'',orderList:[]},this.getOrderList);
    }
  },
  onHide() {
    this.setData({ isUpdate: false });
  },
  onReachBottom() {
    const { page, showAll, curProductType, curOrderState } = this.data;
    if (!showAll||showAll=='加载中...') {
      this.setData({ page: page + 1,showAll:'加载中...' });
      this.getOrderList(false, curProductType, curOrderState);
    }
  },
  // 获取类型列表
  getOrderList(refresh = false, type) {
    const { page, count, orderList} = this.data;
    const { userId } = wx.getStorageSync('user');
    // const url = `${urls.order}/page`;
    // /verify/tickets
    const url=`${urls.tickets}`;
    let p = refresh ? 0 : page;
    // let data = { pageNo: p, pageSize: count, productType:1,orderState:5};
    let data = { pageNo: p, pageSize: count, userId,clubId:constv.cid};
    const success = body => {
      refresh && wx.stopPullDownRefresh();
      if (body.length == 0 || body.length < count - 2) {
        this.setData({ showAll: true })
      };
      body.map(item => {
        item.info = item.info && item.info != "string" && JSON.parse(item.info);
      })
      let list = refresh ? body : [...orderList, ...body];
      console.log(list);
      this.setData({ orderList: list });
    }
    const fail = body => {
      wx.showToast({
        title: body.message || "获取失败",
      });
    }
    fetch({ url, data, success, fail, loading: '加载中...' });
  },
  onPullDownRefresh: function () {
      this.setData({page:0,orderList:[],showAll:''},this.getOrderList);     
  },
  goCardDetail(e){
    const {id} = e.currentTarget.dataset;
    wx.navigateTo({
      url: `/club-order/order-detail/order-detail?orderId=${id}`
    })
  },
  showList(){
    const {showList} = this.data;
    this.setData({ showList: !showList});
  },
  // 订单类型选择
  typeChange(e){
    const { types,curProductType } = this.data;
    const { type,title } = e.currentTarget.dataset;
    let curTypeCon = types.find(item => item.productType == type);
    if(curTypeCon.list.length<1){
      this.getOrderList(true, type);
      this.setData({ showList: false, curOrderTitle:''});
    }
    this.setData({ curTypeCon, curProductType: type,page:0,curOrderState:'' });  
  },
  // 订单类型分类选择
  changeOrderState(e){
    const {curOrderState,curProductType} = this.data;
    const { state,title } = e.currentTarget.dataset;
    this.getOrderList(true,curProductType, state);
    this.setData({ curOrderState: state,curOrderTitle:title,showList:false });
  },
  // 查看卡片，进详情
  goMycardDetail(e) {
    const orderId = e.currentTarget.dataset.id;
    const giftCardStatus = e.currentTarget.dataset.status;
    fetch({
      url: `${urls._consumerCard}/${orderId}/orderCheckCard?gift=${giftCardStatus}`,
      loading: '加载中...',
      success: body => {
        if(body.cardTotal==0){
          wx.showToast({
            title: '您的卡片已删除',
            icon:'none'
          })
        }else{
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
  },
  showTicket(e) {
    const { showTicket, orderList } = this.data;
    const { id } = e.currentTarget.dataset;
    if(showTicket){
      this.setData({showTicket:false})
    }else{
      let curOrder = orderList.find(item => item.orderId == id);
      this.setData({ showTicket: !this.data.showTicket, curOrder});
    }
    
  }
})