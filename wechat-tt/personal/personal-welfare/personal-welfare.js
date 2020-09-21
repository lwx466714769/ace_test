import urls from '../../utils/urls.js';
import {fetch, toDecimal2, getGoodsState} from '../../utils/utils.js';
Page({

  /**
   * 页面的初始数据
   */
  data: {
    card: '/images/image2018-9-16_20-23-33.png',
    page: 0,
    count: 10,
    showAll: false,
    showHomeBtn: false,
    exitSome: '',//领取福利卡相关
    num: 0,
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (ops) {
    let orderState2 = getGoodsState();
    const {
      userId
    } = wx.getStorageSync('user');
    const clubId = wx.getStorageSync('cid');
    this.setData({
      userId,
      clubId,
      orderState2
    }, this.initPage);
    if (ops.showHomeBtn === undefined) {
      this.setData({
        showHomeBtn: false,
      })
    } else {
      this.setData({
        showHomeBtn: ops.showHomeBtn
      })
    };
  },
  initPage() {
    // this.getCardData();
    this.wdHeight();
  },
  onShow() {
    this.getCardData();
  },
  goHome() {
    wx.switchTab({
      url: '/pages/index/index',
    })
  },
  getCardData() {
    const {
      userId,
      clubId
    } = this.data;
    const url = `${urls.goods}/page`;
    let data = {
      pageNo: 0,
      pageSize: 100,
      clubId
    };
    const success = body => {
      if (body.content) {
        body.content.map(item => {
          let infoStr = item.info
          let info = JSON.parse(infoStr)
          item.info = info;
          // let orderDecimal = item.orderAmount;
          // item.orderAmount = toDecimal2(item.orderAmount, true);
          // item.decimal = toDecimal2(orderDecimal);
        })
      }
      this.setData({
        card_list: body.content
      })
    }
    const fail = body => {
      wx.showToast({
        title: body.message || '请检查网络',
      });
      this.setData({ exitSome: true, });
    }
    fetch({ url, success, data, fail, loading: false });
  },
  wefarelist(e) {
    // const quotaId = e.currentTarget.dataset.quotaid;
    const id = e.currentTarget.dataset.id;
    const orderId = e.currentTarget.dataset.order;
    const gift = e.currentTarget.dataset.gift;
    if (e.currentTarget.dataset.type == 2) {
      if (gift) {
        wx.navigateTo({
          url: `/shop/cardtickets/cardtickets?consumerCardId=${id}`,
        })
      } else {
        wx.navigateTo({
          url: `/shop/middlecard/middlecard?consumerCardId=${id}`,
        })
      }

    } else if (e.currentTarget.dataset.type == 3) {
      wx.navigateTo({
        url: `/shop/goodsdetails/goodsdetails?orderId=${orderId}`
      })
    }

  },
  wefarelist_gift(e) {
    const quotaId = e.currentTarget.dataset.quotaid;
    const { id, is } = e.currentTarget.dataset;
    const {
      val_list,
      val_gift,
    } = this.data;
    let card_of_list = is == 'false' ? card_of_list = val_list : card_of_list = val_gift;
    let consumer_cards = card_of_list.filter(obj => obj.id == quotaId);
    wx.setStorageSync('card_list', card_of_list.filter(obj => obj.id == quotaId)[0].consumerCards);
    wx.setStorageSync('card_lists', card_of_list);
    wx.navigateTo({
      url: `/shop/cardtickets/cardtickets?quotaId=${quotaId}&consumerCardId=${id}`,
    })
  },
  changeData() {
    this.setData({ page: 0, exitSome: '' }, this.initPage);
  },
  changeClear() {
    // 这是个空函数 有意义 没作用；
  },
  wdHeight() {
    try {
      const res = wx.getSystemInfoSync()
      this.setData({ windowHeight: res.windowHeight })
    } catch (e) {
      // Do something when catch error
    }
  },
  tabtap_gift(e) {
    const { num } = e.currentTarget.dataset;
    this.setData({ num })
  },
})