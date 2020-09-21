// club/order-list/order-list.js
import urls from '../../utils/urls.js';
import { fetch, getOrderState, getRealOrderState, toDecimal2} from '../../utils/utils.js'
import constv from '../../const.js'
Page({

  /**
   * 页面的初始数据
   */
  data: {
    types: [
      {
        index: 0, name: '实物', productType: 3, render: false,
        list: [{index:0,title:'全部',state:''}]
      },
      {
        index: 1, name: '卡券', productType: 2, render:false ,
        list: [{ index: 0, title: '全部', state: '' }]
      },  
      {
        index: 2, name: '活动', productType: 1, render: true, list: [
          { index: 0, title: '全部', state: '' }]
      },
    ],
    curOrderState:'',//当前的订单状态
    curOrderTitle:'',
    curProductType:3,//当前类型
    curTypeCon:'',//当前所选类型的内容
    showList:false,//是否显示下拉框
    page:0,
    count:10,
    orderList:[],
    showAll:'',
    showTicket:false,
    scrollLeft:0
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    //活动订单状态
    let orderState = getOrderState().filter(item => item.state != 'UNSETTLED');
    //实物订单状态
    let orderState2 = getRealOrderState().filter(item => item.state != 6 && item.state != 8);
    //卡券订单状态
    let orderState3 = getOrderState().filter(item => item.state != 'UNSETTLED'  )
    this.setData({orderState, orderState2 , orderState3});
    const { types, curProductType} = this.data;
    // 渲染卡券类型列表
    // 实物list
    let commodity = types.find(item => item.productType == 3);
    commodity.list = [...commodity.list, ...orderState2];
    // 卡券list
    let welfare = types.find(item => item.productType == 2);
    welfare.list = [...welfare.list, ...orderState3];
    // 活动list
    let event = types.find(item => item.productType == 1);
    event.list = [...event.list, ...orderState];
    console.log(types);
    this.setData({ types, curTypeCon: event});
    this.getOrderList(true, curProductType);
  },
  onShow() {
    const { isUpdate ,productType} = this.data;
    if (isUpdate) {
      this.setData({page:0,showAll:'',orderList:[]},()=>{
        this.getOrderList(true,productType);
      });
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
  getOrderList(refresh = false, type,orderState) {
    const { page, count, orderList} = this.data;
    const url = `${urls.order}/page`;
    let p = refresh ? 0 : page;
    let productType = type?type:'';//哪种类型的订单
    let state = orderState ? orderState:'';//哪个状态的订单
    let data = { pageNo: p, pageSize:count,productType,orderState:state,clubId: constv.cid} ;
    const success = body => {
      refresh && wx.stopPullDownRefresh();
      if(body.content.length == 0||body.content.length<count-2) {
        this.setData({ showAll: true })
      };
      body.content.map(item=>{
        item.info = item.info&&item.info!="string"&&JSON.parse(item.info);
        // 两位小数化，合计直接转换，单价保留原价，整数部分单独转换
        let orderDecimal = item.orderAmount;
        item.orderAmount = toDecimal2(item.orderAmount, true);
        item.decimal = toDecimal2(orderDecimal);
        item.items.map(obj=>{
          let amountDeciaml = obj.itemAmount;
          obj.amountInt = toDecimal2(obj.itemAmount, true);
          obj.decimal = toDecimal2(amountDeciaml);
        })
      })
      let list = refresh ? body.content : [...orderList,...body.content];
      console.log(list);
      this.setData({ orderList: list});
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
    console.log(e)
    const { types, curProductType } = this.data;
    const { type} = e.detail;
    if (type == curProductType) return;
    this.getOrderList(true, type);
    let curTypeCon = types.find(item => item.productType == type);
    console.log(curTypeCon);
    this.setData({ curTypeCon, curProductType: type, page: 0, curOrderState: '', scrollLeft:0});
  },
  // 订单类型分类选择
  changeOrderState(e){
    const {curOrderState,curProductType} = this.data;
    const { state } = e.currentTarget.dataset;
    this.getOrderList(true,curProductType, state);
    this.setData({ curOrderState: state,showList:false });
    wx.pageScrollTo({
      scrollTop: 0,
    })
  },
  // 查看卡片，进详情
  goMycardDetail(e) {
    const orderId = e.currentTarget.dataset.id;
    // const giftCardStatus = e.currentTarget.dataset.status;
    // fetch({
    //   url: `${urls._consumerCard}/${orderId}/orderCheckCard?gift=${giftCardStatus}`,
    //   loading: '加载中...',
    //   success: body => {
    //     if(body.cardTotal==0){
    //       wx.showToast({
    //         title: '您的卡片已删除',
    //         icon:'none'
    //       })
    //     }else{
    //       if (body.consumerCards[0].gift) {
    //         wx.navigateTo({
    //           url: `/club-card/mycard-gift-detail/mycard-gift-detail?orderId=${orderId}`,
    //         })
    //       } else {
    //         wx.navigateTo({
    //           url: `/club-card/mycard-detail/mycard-detail?orderId=${orderId}`,
    //         })
    //       }
    //     }
        
    //   }
    // })
  },
  showTicket(e){
    const { showTicket, orderList} = this.data;
    const {id} = e.currentTarget.dataset;
    let curOrder = orderList.find(item =>item.orderId==id);
    this.setData({showTicket: !this.data.showTicket,curOrder});
  }
})