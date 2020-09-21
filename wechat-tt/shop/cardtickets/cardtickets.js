import urls from '../../utils/urls.js';
import {
  fetch,
  formatCards,
  formatDate,
  checkExpire
} from '../../utils/utils.js';
Page({

  /**
   * 页面的初始数据
   */
  data: {
    consumerCard: [],
    giftCardStatus: true,
    currentSwiper: 0,
    autoplay: true,
    indicatorDots: false,
    autoplay: false,
    interval: 5000,
    duration: 500,
    indexs: [0]
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    const currentPackage = wx.getStorageSync('currentPackage')
    currentPackage.consumerCards.map(card => {
      let infoStr = card.info
      let info = JSON.parse(infoStr)
      card.info = info
      let expire = checkExpire(card.createAt, card.expireAtType, card.expireAt)
      card.isExpire = expire
    })
    let hasGet = currentPackage.consumerCards.filter(card => card.presentState==3);
    let gift = currentPackage.consumerCards.filter(card => card.presentState != 3);
    console.log(hasGet);
    let newPackage = [...gift,...hasGet];
    this.setData({
      currentPackage,
      gift:newPackage

    })
  },

  initPage(consumerCardId) {
    // this.gotCard(consumerCardId);
    this.getCardInfo(consumerCardId)
  },
  onPullDownRefresh() {
    this.gotCard(consumerCardId);
  },
  sendGift(e) {

    wx.showToast({
      title: '此卡片您已赠送',
      icon: 'none',
      duration: 3000,
    })

  },
  getCardInfo(consumerCardId) {
    // const { consumerCardId } = this.data;
    const url = `${urls.card}/${consumerCardId}`;
    let data = {

    }
    const success = body => {
      const card = body;
      // const { expireAtType, expireAt} = card;
      // const term = ''
      // if(expireAtType == 1){
      //   const term = '无限期'
      // }
      card.info = JSON.parse(card.info)
      if (card.expensesRecord.length > 0) {
        card.expensesRecord.map(record => {
          record.consumptionTime = formatDate(record.consumptionTime)
        })
      }
      this.setData({
        card
      })
    }
    const fail = body => {
      wx.showToast({
        title: body.message || '请检查网络',
      });
      this.setData({ exitSome: true, });
    }
    fetch({ url, data, success, fail, loading: false });
  },
  /**-----获取消费卡详情-----*/
  gotCard(consumerCardId) {
    const _this = this;
    const url = `${urls._consumerCard}/${consumerCardId}/detail`;
    const success = body => {
      let {
        expensesRecord
      } = body;
      body.beginTime = formatDate(body.beginTime, '.');
      body.endTime = body.endTime === 0 ? 0 : formatDate(body.endTime, '.');
      const term = body.endTime === 0 ? '无期限' : '有效期至' + body.endTime;
      expensesRecord = expensesRecord.map(o => {
        o.consumptionTime = formatDate(o.consumptionTime, '-', true);
        return o;
      })
      _this.setData({
        consumerCard: body,
        term: term,
        orderId: body.orderId,
      })
    }
    fetch({
      url,
      success,
      loading: false
    })
  },
  /**-----订单中获取此卡类型-----*/
  orderMsg() {
  },
  /*--卡片赠送--*/
  onShareAppMessage(res) {
    if (res.from === 'button') {
      let {
        info
      } = this.data.currentPackage;
      let imageUrl = info.productImg;
      let { id, orderid, index } = res.target.dataset;
      let path;
      // let { userId } = wx.getStorageSync('user');
      let success;
      this.shareTap(id, index);
      let auditingStatus
      if (res.target.dataset.type === 'giftCard') {
        //   赠送
        path = `/shop/receivecard/receivecard?cardId=${id}`;
      } else {
        //   分享
        path = `/shop/carddetails/carddetails?cardId=${id}&isShare=true`;
      };

      return {
        title: '您的朋友送给你一张福利卡',
        path,
        imageUrl,
      }
    }
  },
  shareTap(id, index) {
    const { card_item } = this.data;
    const url = `${urls.card}/giving/${id}`;
    const method = "POST";
    console.log(index)
    // const data = {
    //   userId
    // }

    const success = body => {
      if (body) {
        var pS = 'currentPackage.consumerCards[' + index + '].presentState';
        this.setData({
          [pS]: 2
        })
      }
    };
    const fail = body => {
      console.log('赠送路径失败');
    };
    fetch({ url, success, fail, method, loading: false, });
  },
  /**
   *  删除卡片 组件
   */
  delCard(e) {
    const { card_item } = this.data;
    const deleteItems = card_item.map(obj => obj.id);
    this.setData({ deleteItems });
    this.checkAtteste.show();
  },
  attestate(e) {
    console.log('--e-->', e.detail);
  },
  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
    this.checkAtteste = this.selectComponent("#checkAtteste");
  },
  /**
   *  下拉刷新
   */
  onPullDownRefresh: function () {
    this.initPage();
    wx.hideNavigationBarLoading();
    wx.stopPullDownRefresh();
  },

  /**********/
  swiperChange(e) {
    console.log('swiperChange', e.detail.current)
    this.setData({
      currentSwiper: e.detail.current
    })
    /*--根据 e.detail.current 可判断 --*/
  },
  changeData() {
    const pages = getCurrentPages();
    wx.navigateBack({
      delta: pages.length - (pages.length - 1),
      success: res => {
        if (pages.length > 1) {
          const beforePage = pages[pages.length - 2];
          beforePage.changeData();
        }
      }
    });
  },

  wefarelist(e) {
    const consumerCardId = e.currentTarget.dataset.id;
    const quotaId = e.currentTarget.dataset.quotaid
    wx.navigateTo({
      url: `/shop/middlecard/middlecard?consumerCardId=${consumerCardId}&quotaId=${quotaId}`,
    })
  },
})