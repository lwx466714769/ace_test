import urls from '../../utils/urls.js';
import {
  fetch,
  login,
  bindPhone,
  getUserInfo
} from '../../utils/utils.js';
Page({

  /**
   * 页面的初始数据
   */
  data: {
    cardImg: '',
    auditingStatus: false,
    cardlogo: '/images/logo.png',
  },

  /**
   * 生命周期函数--监听页面加载  
   */
  onLoad: function(ops) {
    wx.hideShareMenu();
     const clubId = wx.getStorageSync('cid');
    this.setData({
      isRealObj: ops.isRealObj?ops.isRealObj:false,
      cardImg: ops.cardImg,
      auditingStatus: ops.auditingStatus,
      cardId: ops.cardId,
      giftCardStatus: ops.giftCardStatus,
       clubId,
    })
    /**
     * 判断分享页面 传值  consumerCardId
     */
    if (ops.consumerCardId) {
      this.setData({
        cardType: 'giftCard',
        consumerCardId: ops.consumerCardId,
        orderId: ops.orderId,
         clubId
      });
    } else {
      // console.log('----赠送者信息---->', wx.getStorageSync('user'));
      const user = wx.getStorageSync('user');
      this.setData({
        userId: user.userId,
        orderId: ops.orderId,
         clubId
      }, this.initPageShare);
      // console.log('----赠送者ID---->', this.data.userId);
    }
  },
  initPageShare() {
    this.checkOrder();
    this.getCardData();
  },
  onBackHome() {
    // const timer = setTimeout(function() {
    // const {
    //   consumerCardId,
    //   quotaId,
    // } = this.data;

    wx.redirectTo({
      url: '/personal/personal-welfare/personal-welfare',
    })
  },
  /**
   *   分享或者赠送卡片
   */

  onShareAppMessage(res) {
    if (res.from === 'button') {
      const {
        cardImg,
        consumerCardId,
        cardId,
        orderId,
        auditingStatus,
        giftCardStatus,
      } = this.data;
      let path;
      let success;
      let {userId} = wx.getStorageSync('user');
      if (res.target.dataset.type === 'giftCard') {
        //   赠送
        path = `/shop/getcard/getcard?consumerCardId=${consumerCardId}&cardType=giftCard&cardImg=${cardImg}&auditingStatus=${auditingStatus}&giftCardStatus=${giftCardStatus}&cardId=${cardId}&orderId=${orderId}`;
        this.shareTap(consumerCardId, userId);
      } else {
        //   分享
        path = `/shop/carddetails/carddetails?cardId=${cardId}&isShare=true`;
      };
      let imageUrl = cardImg;
      return {
        title: '您的朋友送给你一张福利卡',
        path,
        imageUrl,
      }
    }
  },

  /**
   *  领取卡片  认领卡片接口  以及输送consumerCardId 值。
   */

  ImmediatelyReceive(e) {
    login(e,() => {
      const user = wx.getStorageSync('user');
      const old_userId = user.userId;
      const orderId = this.data.orderId;
      const cur_userId = this.data.cur_userId;
      if (cur_userId == old_userId) {
        wx.showToast({
          title: '您是礼品卡拥有者,不可以自己领取',
          mask: true,
          icon: 'none',
          duration: 3000,
        })
      } else {
        const {
          consumerCardId,
        } = this.data;
        const {
          userId
        } = wx.getStorageSync('user');
        const url = `${urls._consumerCard}/${consumerCardId}/chang?userId=${userId}`;
        const data = {
          userId
        };
        const success = body => {
          if (body){
            wx.redirectTo({
              url: `/personal/personal-welfare/personal-welfare?consumerCardId=${consumerCardId}&showHomeBtn=1`,
            })
          }else{
            wx.showToast({
              title: '卡片已经被领取',
              icon:'none',
              duration:300,
            })
          }
        }
        const fail = body => {
          wx.showToast({
            title: body.message || "卡片领取失败",
            icon: 'none'
          })
        }
        fetch({
          url,
          data,
          method: 'PUT',
          success,
          fail,
          loading: '加载中...'
        })

      }

    })
  },

  /**
   *分享页面进来初步   登录   
   */
  loginSubmit(e) {
    let _this = this;
    bindPhone.call(this, e).then(() => {
      getUserInfo.call(this);
    });
  },
  /**
   *   检查  成功订单 是否 已生成 消费卡片 查询值是订单id  { '包含consumerCardId'和‘orderId’}；
   */
  checkorder() {
    const { orderId, giftCardStatus} = this.data;
    const url = `${urls._orderCheckCard}/${orderId}/orderCheckCard`;
    const data = {
      gift: giftCardStatus
    };
    const success = body => {
      if (!body) {
        console.log('此订单需要审核');
      } else {
        let cur_gift_card = body.consumerCards.find(obj => obj.orderId == orderId);
        this.setData({
          isVerified: !!cur_gift_card,
          cur_userId: cur_gift_card.userId,
          quotaId: cur_gift_card.quotaId,
        })

        this.setData({
          consumerCardId: body.consumerCards.find(obj => obj.orderId === orderId).id,
        })
      }
    };
    const fail = body => {
      wx.showToast({
        title: '此订单查询失败',
        icon: 'none',
      });
    };
    fetch({
      url,
      success,
      fail,
      loading: '查询中...',
      data
    });
  },
  checkOrder(){
    const {
      userId,
      clubId,
      orderId
    } = this.data;
    const url = `${urls.card}/page`;
    let data = {
      userId,
      clubId,
      orderId
    };
    const success = body => {
      if (!body.content) {
        console.log('此订单需要审核');
      } else {
        let cur_gift_card = body.content.find(obj => obj.orderId == orderId);
        this.setData({
          isVerified: !!cur_gift_card,
        })
        this.setData({
          consumerCardId: body.content.find(obj => obj.orderId === orderId).id,
        })
      }
    }
    const fail = body => {
      wx.showToast({
        title: '此订单查询失败',
        icon: 'none',
      });
      this.setData({ exitSome: true, });
    }
    fetch({ url, data, success, fail, loading: false });
  },
  onReady() {
    this.binder = this.selectComponent("#binder");
  },
  /**
   * 获取卡包所有卡片
   */ 
  getCardData() {
    const {
      userId,
      clubId
    } = this.data;
    const url = `${urls._cardPackage}`;
    let data = {
      userId,
      clubId
    };
    const success = body => {
      const _list = body.false;
      const _gift = body.true;
      const val_list = Object.values(_list);
      const val_gift = Object.values(_gift);
      this.setData({
        card_list: val_list.map(obj => ({ ...obj, tapSign: false, clubId: obj.consumerCards[0].clubId })).filter(object => object.clubId == clubId),
        card_gift: val_gift.map(obj => ({ ...obj, clubId: obj.consumerCards[0].clubId })).filter(object => object.clubId == clubId),
        exitSome: false,
        val_list,
        val_gift,
      });
    }
    const fail = body => {
      wx.showToast({
        title: body.message || '请检查网络',
      });
      this.setData({ exitSome: true, });
    }
    fetch({ url, data, success, fail, loading: false });
  },
  initCheck() {//去商品详情
    const { consumerCardId } = this.data
    wx.navigateTo({
      url: `/shop/middlecard/middlecard?consumerCardId=${consumerCardId}`,
    })
    // const {
    //   consumerCardId,
    //   quotaId,
    //   giftCardStatus,
    // } = this.data;
    // ///shop/cardtickets/cardtickets
    // if (giftCardStatus == "false"){
    //     wx.redirectTo({
    //     url: `/shop/middlecard/middlecard?quotaId=${quotaId}&consumerCardId=${consumerCardId}`,
    //     })
    // }else{
    //   const {
    //     val_list,
    //     val_gift,
    //   } = this.data;
    //   let card_of_list = val_gift;
    //   let consumer_cards = card_of_list.filter(obj => obj.id == quotaId);
    //   wx.setStorageSync('card_list', card_of_list.filter(obj => obj.id == quotaId)[0].consumerCards);
    //   wx.setStorageSync('card_lists', card_of_list);
    //   wx.navigateTo({
    //     url: `/shop/cardtickets/cardtickets?quotaId=${quotaId}&consumerCardId=${consumerCardId}`,
    //   })
    // }
  },
  back_check(){
    if (this.data.consumerCardId) {
      wx.redirectTo({
        url: '/personal/personal-welfare/personal-welfare',
      })
    } else {
      wx.redirectTo({
        url: `/club-order/order-list/order-list`,
      })
    }
  },
  shareTap(id, userId) {
    const { card_item } = this.data;
    const url = `${urls._consumerCard}/${id}/giftCard?userId=${userId}`;
    const method = "PUT";
    const success = body => {
      console.log('赠送结果',body);
    };
    const fail = body => {
      console.log('赠送路径失败');
    };
    fetch({ url, success, fail, method, loading: false, });
  },
})