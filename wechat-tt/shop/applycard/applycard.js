import urls from '../../utils/urls.js';
import {
  uploadImages,
  fetch,
  formatPostsAce,
  toPayDLB,
  toDecimal2
} from '../../utils/utils.js';
import constv from '../../const.js'
Page({

  /**
   * 页面的初始数据
   *  intdegAll:16000,//我的积分
      needIntdeg:0,总共需要积分
      discountCode:''//优惠码
   */
  data: {
    intdegAll: 16000, //我的积分
    needIntdeg: 0, //
    needPrice: 200,
    actionticket: 50,
    onePrice: 100,
    addPrice: 0,
    curPayType: 'price',
    discountCode: '',
    discounts: [],
    cardName: '',
    cardId: '',
    cardImg: '/images/id_up@3x.png',
    discountChecked: true,
    orderId: null,
    done: false,
    cardbag: '/images/id_up@3x.png',
    cur_count: 1,
    mailingMethod: 2,
    clubId:constv.cid
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(ops) {

    // let card = JSON.parse(card);
    let card = wx.getStorageSync('card');
    // 价格小数转换
    let price = card.finalPrice * card.cur_count;
    card.finalPriceInt = toDecimal2(price, true);
    card.finalPriceDecimal = toDecimal2(price);
    let benefits = wx.getStorageSync('benefits');
    this.setData({card,benefits,cur_count: card.cur_count,})
  },
  //修改付款方式
  choosePayType(e) {
    const {name} = e.currentTarget.dataset;
    this.setData({curPayType: name});
  },
  //输入优惠码
  modifyDiscount(e) {
    this.setData({
      discountCode: e.detail.value
    });
  },
  getDiscount() {
    const {
      discountCode,
      discounts
    } = this.data;
    const url = `${urls}`;
    return;
    const success = body => {
      if (!discounts.find(o => o.id === body.id)) {
        discounts.concat(body);
      }
      this.setData({
        discounts,
        discountsCode: ''
      });
    }
    const fail = ({
      code
    }) => {
      const codeMap = {
        "1211": "折扣码不存在",
        "1212": "折扣码已过期",
        "1213": "折扣码使用次数达到上限"
      }
      let title = codeMap[code] || '兑换失败';
      wx.showToast({
        title: title,
        icon: 'none'
      });
      fetch({
        url,
        success,
        fail
      })
    }

  },
  //选择优惠券
  chooseDiscount(e) {
    let pid = e.currentTarget.dataset;
    const {
      discounts,
      needPrice
    } = this.data;
    let target = discounts.find(o => o.id === pid);
    let finalPrice = needPrice;
    if (target.checked) {
      target.checked = false;
    } else {
      for (let o of discounts) {
        o.checked = o.id == pid;
      }
      this.setData({
        discounts,
        finalPrice
      });
    }
  },
  modifyCardName(e) {
    let {
      card
    } = this.data;
    const {
      name
    } = e.currentTarget.dataset;
    let info = card.checkMsgs.find(o => o.name == name);
    console.log(info)
    info.value = e.detail.value;
    this.setData({
      card
    });
  },
  modifyPhone(e) {
    let phone = e.detail.value
    this.setData({ mailPhone: phone })
  },
  modifyCardId(e) {
    let {
      card
    } = this.data;
    const {
      name
    } = e.currentTarget.dataset;
    let info = card.checkMsgs.find(o => o.name == name);
    info.value = e.detail.value;
    this.setData({
      card
    });
  },
  //上传身份证
  uploadCardImg(e) {
    const {
      name
    } = e.currentTarget.dataset;
    let _this = this;
    wx.chooseImage({
      count: 1,
      success: function({
        tempFilePaths
      }) {
        const tempImages = tempFilePaths[0];
        // _this.setData({cardImg:tempImages});
        uploadImages(tempFilePaths, function() {}, function({
          itemUrl
        }) {
          let {
            card
          } = _this.data;
          let info = card.checkMsgs.find(o => o.name == name);
          info.value = itemUrl;
          _this.setData({
            card
          });
        })
      },
    })
  },
  // 提交审核信息
  submit() {
    const {
      orderId,
      address,
      mailingMethod,
      mailPhone,
      card
    } = this.data;
    if (card.productType == 2) {
      if (mailingMethod == 1 && !mailPhone) {
        wx.showToast({
          title: '请填写联系电话',
          icon: 'none'
        })
        return;
      } else if (mailingMethod == 2 && !address) {
        wx.showToast({
          title: '请填写收货信息',
          icon: 'none'
        })
        return;
      }
    }
    const {
      checkMsgs,
      finalPrice
    } = this.data.card;
    if (checkMsgs) {
      let lock = checkMsgs.length > 0 ? false : true;
      for (let o in checkMsgs) {
        if (!checkMsgs[o].value) {
          lock = false;
          break;
        } else {
          lock = true;
        }
      }
      if (!lock) {
        wx.showToast({
          title: '请完善信息',
          icon: 'none'
        })
        return;
      }
    }
    if (orderId) {
      wx.showToast({
        title: '订单已创建,请去我的订单继续支付',
        icon: 'none'
      })
    } else {
      this.lockStorage()
    }
  },
  //新创建订单
  createOrder(){
    const { address, mailPhone, mailingMethod } = this.data;
    const {
      checkMsgs,
      id,
      productName,
      finalPrice,
      curCardOrderId,
      cur_count,
      typeStyle,
      productType,
      checked,
      expireAtType,
      expireAt,
      productImg,
      productBrief,
      chooseItem
    } = this.data.card;
    const user = wx.getStorageSync('user');
    let items = [];
    //itemAmount 额度单价
    items.push({ itemId: curCardOrderId, itemTitle: chooseItem.name, itemAmount: chooseItem.currentPrice, itemCount:cur_count})
    let info = {
      productImg: productImg[0],
      avatar: user.avatar,
      nickname: user.nickname,
      phone: user.userPhone.phone,
      userId: user.userId,
      specificationName: chooseItem.name,
      productBrief: productBrief,
      clubLogo: constv.clubLogo,
      clubName: constv.clubName,
      clubId: constv.cid,
      userPhone: user.userPhone.phone,
      mailPhone: mailingMethod == 1 && productType == 2 ? mailPhone : null,
    };
    let data = {
      discountCode: '',
      // signItems,
      items,
      orderAmount: finalPrice*cur_count,
      productId: id,
      productName: productName,
      productType: productType+1,
      verify: checked ? checked : false,//是否审核，实物商品没有审核
      info: JSON.stringify(info),
      verifyMessages: checkMsgs,
      clubId:constv.cid,
      mailingMethod,
      addressId: mailingMethod == 2 && productType == 2 ? address.id : null,
      count: cur_count,
    }
    console.log(data);
    let url = urls.order;
    let success = body => {
      let orderId = body.orderId
      this.setData({ orderId })
      if (finalPrice == 0) {
        this.payed(orderId)
      } else {
        this.toPay(orderId);
      }
    }
    fetch({ url, method: 'POST', data, success, loading: '生成中...', json: true })
  },
  lockStorage() {
    const { curCardOrderId, cur_count, finalPrice, orderId } = this.data.card
    let data = [{
      count: cur_count,
      specificationsId: curCardOrderId
    }]
    let url = urls.lockStorage;
    let success = body => {
      if (body) {
        if (orderId) {
          if (finalPrice == 0) {
            this.payed(orderId);
          } else {
            this.toPay(orderId);
          }
        } else {
          this.createOrder();
        }
      } else {
        wx.showToast({
          title: '商品已没有库存',
          icon: "none",
          duration: 1000
        })
      }
    }
    fetch({ url, method: 'POST', data, success, loading: '生成中...', json: true })
  },
  //获取 用户会员信息
  getBenefits() {
    return new Promise((resolve, reject) => {
      const clubId = wx.getStorageSync('cid');
      const url = `${urls.club}/${clubId}/benefits`;
      const success = body => {
        console.log(body);
        this.setData({
          benefits: body
        });
        resolve(body.userCarIdentity)
      };
      const fail = body => {
        wx.showToast({
          title: !!body.message ? body.message : '获取权益失败',
        })
        reject(body);
      }
      fetch({
        url,
        json: true,
        loading: '加载中...',
        success,
        fail,
      })
    }).catch((e) => {
      console.log('catch', e);
    })

  },
  getAddress() {
    if (this.data.address) {
      wx.navigateTo({
        url: `/pages/address-manage/address-manage?addressId=${this.data.address.id}`,
      })
    } else {
      wx.navigateTo({
        url: '/pages/address-manage/address-manage',
      })
    }
  },
  //需要支付0元，支付完成
  payed(orderId) {
    let _this = this
    const url = `${urls.order}/pay/${orderId}`;
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
  goPayedOrder(orderId){
    let {
      gift,
      productType,
      checked//是否需要审核
    } = this.data.card;
    this.pushClubId();
    const { clubId } = this.data;
    wx.redirectTo({
      url: `/shop/completecard/completecard?gift=${gift}&orderId=${orderId}&productType=${productType}&clubId=${clubId}&checked=${checked}`,
    })
  },
  //去支付
  toPay(orderId) {
    const {productType} = this.data.card;
    toPayDLB(orderId,productType).then(()=>{
      this.goPayedOrder(orderId);
    })
  },
  //购买商品后推送消息至手持机
  pushClubId() {
    const { clubId } = this.data;
    let url = `${urls._verify}/push/${clubId}`;
    let success = body => {

    }
    let fail = body => {
    }
    fetch({ url, method: 'POST', success, fail })
  },
  goods_num(e) {
    const {
      type,
      id
    } = e.currentTarget.dataset;
    let {
      card
    } = this.data;
    let cur_count = card.cur_count;

    let inv = card.curInventory
    let limit = card.curLimitNum
    let record = card.buyRecord && card.buyRecord[card.curCardOrderId] ? card.buyRecord[card.curCardOrderId] : 0

    if (type === 'plus') {
      let msg = checkBuyLimit(inv, limit, cur_count + 1, record)
      if (msg.length > 0) {
        wx.showToast({
          title: msg,
          icon: 'none',
          duration: 1000,
        })
        return
      } else {
        cur_count++
      }
    } else {
      if (cur_count > 1) {
        cur_count--;
      } else {
        console.log('商品都减到倒贴了')
      }
    }

    card.cur_count = cur_count;
    card.commoditySpecifications.map(obj => {
      if (obj.commodityId === id) {
        obj.count = cur_count
      }
    })
    this.setData({
      card,
      cur_count
    });
  },
  showMail() {
    this.setData({ mailingMethod: 2 })
  },
  showPick() {
    this.setData({ mailingMethod: 1 })
  },
  onShow() {
    let {
      done
    } = this.data;
    let address = wx.getStorageSync('address');
    if (address) {
      this.setData({ address });
      wx.removeStorageSync('address');
    }
    let benefits = wx.getStorageSync('benefits');
    this.setData({ benefits });
  },
  onUnload(){
    wx.removeStorageSync('card');
  }
})