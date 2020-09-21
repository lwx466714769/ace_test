import urls from '../../utils/urls.js';
import Painter from '../../palette/paint.js';
import constv from '../../const.js';
import {
  fetch,
  getTextFromHTML,
  login,
  bindPhone,
  formatDate,
  getUserInfo,
  toDecimal2,
  getQrcode
} from '../../utils/utils.js';
import WxParse from "../../utils/wxParse/wxParse";

Page({

  /**
   * 页面的初始数据
   */
  data: {
    cardbag: '/images/default.png',
    card: null,
    curCardOrderId: '',
    cardError: '',
    chooseSize: true,
    indicatorDots:true,
    onShown:false,
    buyLimits: [], //有限购的额度id,
    needRecord: false, //是否有限购商品
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    let scene = options.scene;
    options.share_success ? this.setData({
      share_success: options.share_success
    }) : {};
    !!scene ? this.setData({
      cardId: scene,
      share_success: true
    }, this.initPage) : this.setData({
      cardId: options.cardId
    });
  },
  selectItem(e) {
    let curCardOrderId = e.currentTarget.dataset.id;
    let {stock} = e.currentTarget.dataset;
    let typeStyle = e.currentTarget.dataset.type;
    this.setData({curCardOrderId,typeStyle,stock})
  },
  confirmFilter(){
    let { card,curCardOrderId,typeStyle } = this.data;
    let curQuota = card.commoditySpecifications.find(o => o.id === curCardOrderId);
    card.chooseItem = curQuota;
    switch (curQuota.discountGroup) {
      case 1:
        typeStyle = "UNLIMITED"
        break;
      case 2:
        typeStyle = "MEMBER"
        break;
      case 3:
        typeStyle = "SENIORMEMBER"
        break;
      case 4:
        typeStyle = "OWNER"
        break;
      default:
        typeStyle = "UNLIMITED"
    }
    card.mostTime = curQuota.purchaseLimit < curQuota.stock && curQuota.purchaseLimit > 0 ? curQuota.purchaseLimit : curQuota.stock;
    card.originalPrice = curQuota.originalPrice;
    card.curCardOrderId = curCardOrderId;
    this.setData({
      card,
      onShown: !this.data.onShown,
      qrcode_item: {
        title: card.productName,
        synopsis: card.productBrief,
        cover: card.productImg[0],
        path: getCurrentPages()[getCurrentPages().length - 1].route,
        name: "welfare",
        style: 'CARD',
        id: card.id,
      },
    })
  },
  swiperChange(e) {
    const index = e.detail.current;
    this.setData({
      curSwiperIndex: index
    })
  },
  changeSelectItem() {
    this.setData({
      onShown: !this.data.onShown,
    })
  },
  checkDiscount(){
    const {
      typeStyle
    } = this.data.card;
    if(typeStyle === 'SENIORMEMBER' && this.data.seniorResult != 3){
      this.seniorMemberDiscount();
      
    } 
    else{
      this.goToBuy()
    }
  },
  //discountGroup, purchaseGroup 1所有人 2会员 3高级会员 4车主
  //checklimit(purchaseGroup) checkdiscount(discountGroup) checkpurchaselimit(0不限,加减时判断一遍，apply时再判断一遍，与库存可以一起判断) checkinventory(stock)
  //
  applycard(e) {
    const {card} = this.data;
    const {typeStyle} = this.data.card;
    const _this = this;
    
    try {
      //discountGroup, purchaseGroup 1所有人 2会员 3高级会员 4车主
      login(e, () => {
        const limit = card.chooseItem.limitTimes;
        if (card.mostTime == 0) {
          wx.showToast({
            icon: 'none',
            title: '已经没有库存了',
            duration: 3000,
          })
          return;
        }
        if (card.cur_count > limit && limit) {
          wx.showToast({
            icon: 'none',
            title: '您购买的次数已达上限',
            duration: 3000,
          })
          return;
        }
        let p1 = this.getSeniorApplyInfo()
        p1.then(()=>{
          console.log("all finish-->")
          // const {
          //   userCarIdentity
          // } = this.data.benefits
          const userCarIdentity = 'OWNER'
          const {
            purchaseGroup
          } = this.data.card
          if (purchaseGroup){//新字段
            if (purchaseGroup<3) {
              //check 面额
              this.checkDiscount()
            } else {
              if (purchaseGroup>2) {//高级会员可买
                if (this.data.seniorResult && this.data.seniorResult == 3) {
                  //check 面额
                  this.checkDiscount()
                } else {
                  this.seniorMemberLimit()
                }
              } else {
                //check 车主
                if (types.indexOf('OWNER') > -1) {
                  if (userCarIdentity === 'OWNER') {
                    //check 面额
                    this.checkDiscount()
                  } else {
                    this.canMemeber()
                  }
                } else {//没有人能买

                }
              }
            }
          }
        })
      })
    } catch (e) {
      console.log('err-->', e);
    }
  },
  //检查卡片限制条件
  checkBuyLimit() {
    console.log('check limit-->', this.data.card.type);
    let _this = this
    if (this.data.card.types.indexOf('MEMBER')>-1){
      //通过
      this.goToBuy()
    }
    else if(this.data.card.types.indexOf('SENIORMEMBER')>-1){
      this.getSeniorApplyInfo().then(() => {
        if (this.data.result && this.data.result == 3) {
            //通过
          this.goToBuy()
         } else {
          //没有高级会员卡，看有没有车主的可能
          if (this.data.card.types.indexOf('OWNER')>-1){
            this.getBenefits().then(() => {
              if (this.data.benefits.userCarIdentity === "ONLOOKER") {
                //不是车主
                this.canMemeber();
                return
              }else{
                //是车主，通过
                this.goToBuy()
              }
            })
          }else{
            this.seniorMemberLimit();
          }
        }
      })
    }else{
      //最后一种是只针对车主限制的卡
      this.getBenefits().then(() => {
        if (this.data.benefits.userCarIdentity === "ONLOOKER") {
          //不是车主
          this.canMemeber();
          return
        } else {
          //是车主，通过
          this.goToBuy()
        }
      })
    }
  },
  goToBuy(){
    const {
      card
    } = this.data;
    if (card.limitTimes && card.limitTimes == 0) {
      wx.showToast({
        icon:'none',
        title: '您购买的次数已达上限',
        duration: 3000,
      })
      return;
    }else{
      card.finalPrice = card.chooseItem.currentPrice;
      wx.setStorageSync('card', card);
      wx.navigateTo({
        url: '/shop/applycard/applycard'
      })
    }
  },
  //车主打折时，选择不用折扣
  alsoApplyCard() {
    const {
      card,
      benefits
    } = this.data;
    let limit = card.chooseItem.limitTimes;
    if (card.mostTime == card.cur_count || card.cur_count > limit && limit) {
      wx.showToast({
        icon: 'none',
        title: '您购买的次数已达上限',
        duration: 3000,
      })
      return;
    }
    card.finalPrice = card.originalPrice;
    wx.setStorageSync('card', card);
    wx.navigateTo({
      url: '/shop/applycard/applycard'
    })
  },
  //限制车主时，取消申请车主
  notApplyCard() {
    const {card,benefits} = this.data;
    card.finalPrice = card.chooseItem.currentPrice;
  },
  //获取高级会员卡申请信息
  getSeniorApplyInfo() {
    return new Promise(
      (resolve, reject) => {
        const clubId = wx.getStorageSync('cid');
        const url = `${urls._seniorMember}/applicationMember/1/${clubId}`;
        const success = body => {
          if (body[0]) {
            this.setData({
              applyInfo: body[body.length - 1]
            })
            const {
              result
            } = this.data.applyInfo;
            this.setData({
              seniorResult: result
            });
            resolve(result);
          } else {
            resolve(-1);
          }
        };
        const fail = body => {
          wx.showToast({
            title: !!body.message ? body.message : '获取高级会员失败',
            icon: 'none',
          })
          reject(body.message);
        }
        fetch({
          url,
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
  /*--获取用户权益--*/
  getBenefits() {
    return new Promise(
      (resolve, reject) => {
        const clubId = wx.getStorageSync('cid');
        const url = `${urls.club}/${clubId}/benefits`;
        const success = body => {
          this.setData({
            benefits: body
          });
          wx.setStorageSync('benefits', body);
          resolve(body.userCarIdentity)
        };
        const fail = body => {
          wx.showToast({
            title: !!body.message ? body.message : '获取权益失败',
            icon: 'none',
          })
          reject(body.message);
        }
        fetch({
          url,
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
  initPage() {
    this.getCardDetail();
    this.wdHeight();
    
  },
  getCardDetail() {
    let _this = this;
    let { cardId, curCardOrderId} = this.data;
    const url = `${urls._cardDetail}/${cardId}`;
    const success = body => {
      let {
        productDescription,
        commoditySpecifications,
        productName,
        productType
      } = body;
      body.productDescription = productDescription.replace(/\/n/g, '</p><p>');
      WxParse.wxParse('article', 'html', body.productDescription, _this, 0);
      let quotaList = commoditySpecifications.map(item => {
        if (item.purchaseLimit > 0) {
          this.data.buyLimits.push(item.id)
        }
        // 价格小数转换
        item.priceInt = toDecimal2(item.currentPrice, true);
        item.priceDecimal = toDecimal2(item.currentPrice);
        item.originalInt = toDecimal2(item.originalPrice, true);
        item.originalDecimal = toDecimal2(item.originalPrice);
        if(!item.name) item.name = productName
        item.showName = item.name;
        item.count = 1;
        return item;
      })
      body.chooseItem = quotaList[0];
      curCardOrderId = quotaList[0].id;
      body.curCardOrderId = quotaList[0].id;
      let typeStyle;
      switch (quotaList[0].discountGroup) {
        case 1:
          typeStyle = "UNLIMITED"
          break;
        case 2:
          typeStyle = "MEMBER"
          break;
        case 3:
          typeStyle = "SENIORMEMBER"
          break;
        case 4:
          typeStyle = "OWNER"
          break;
        default:
          typeStyle = "UNLIMITED"
      }
      body.typeStyle = typeStyle;
      body.originalPrice = quotaList[0].originalPrice;

      body.mostTime = quotaList[0].purchaseLimit < quotaList[0].stock && quotaList[0].purchaseLimit > 0 ? quotaList[0].purchaseLimit : quotaList[0].stock;
      body.limitString = body.expireAtType == 2 ? ("有效期至：" + body.expireAt + "天") : "有效期至：" + formatDate(body.expireAt);
      body.cur_count = quotaList[0].count;
      body.patternLargeUrl = body.productImg[0];
      body.synopsis = body.productName;
      
      this.setData({
        card: body,
        cardError: false,
        curCardOrderId,
        stock: quotaList[0].stock
      })
      if (this.data.buyLimits.length > 0) {
        this.getCardBuyRecord()
      }
    }
    const fail = body => {
      wx.showToast({
        title: body.message,
        icon: 'none',
        success: () => {
          this.setData({
            cardError: true
          });
        }
      })
    }
    fetch({
      url,
      success,
      fail,
    });
  },
  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function() {
    this.painter = this.selectComponent("#painter");
    this.backendModal = this.selectComponent('#backendModal');
    this.share = this.selectComponent('#share');
  },
  previewImg(e) {
    const {
      url,
      imgs
    } = e.currentTarget.dataset;
    const urls = imgs.map(o => o.type === 'IMAGE' ? o.content : '').filter(o => o);
    wx.previewImage({
      current: url,
      urls: urls,
    })
  },
  goods_num(e) {
    const {type,id,input} = e.currentTarget.dataset;
    let {card} = this.data;
    let count = card.cur_count;
    if (input =='numInput'){
      const { inputValue} = this.data;
      count = inputValue;
    }
    const mostTime = card.mostTime;
    let {limitTimes} = card.chooseItem;
    if (mostTime == null || mostTime == 0&&limitTimes && count<limitTimes) {
      if (type === 'plus') {
        count++;
      } else {
        if (count > 1) {
          count--;
        } else {
          console.log('商品都减到倒贴了')
        }
      }
    } else if (mostTime !== 0) {
      console.log(count);
      if (type === 'plus') {
        if (mostTime === count || limitTimes && limitTimes<=count ){
          wx.showToast({
            title: '已达上限',
            icon: 'none',
            duration: 1000,
          })
        }else{
          count++;
        }
      } else {
        if (count > 1) {
          count--;
        } else {
          console.log('商品都减到倒贴了')
        }
      }
    };

    card.commoditySpecifications.map(obj => {
      if (obj.id === id) {
        obj.count = count
      }
    })
    if (input != 'numInput'){
      card.cur_count = count
    }
    this.setData({ card, inputValue: count});
    wx.setStorageSync('card', card)
  },
  show_share() {
    this.setData({
      share: !this.data.share
    })
  },
  wdHeight() {
    try {
      const res = wx.getSystemInfoSync()
      this.setData({
        windowHeight: res.windowHeight,
        windowWidth: res.windowWidth
      })
    } catch (e) {
      // Do something when catch error
    }
  },
  /*--分享给好友--*/
  onShareAppMessage: function(res) {
    let {productName,patternLargeUrl,id} = this.data.card;
    return {
      title: productName,
      path: `/shop/carddetails/carddetails?cardId=${id}&share_success=true`,
      imageUrl: patternLargeUrl,
    }
  },
  chooseSezi() {
    let that = this;
    // 创建一个动画实例
    let animation = wx.createAnimation({
      duration: 300,
      timingFunction: 'linear'
    })
    // 将该变量赋值给当前动画
    that.animation = animation
    // 先在y轴偏移，然后用step()完成一个动画
    animation.translateY(200).step()
    that.setData({
      // 通过export()方法导出数据
      animationData: animation.export(),
      // 改变view里面的Wx：if
      chooseSize: !this.data.chooseSize,
    })
    // 设置setTimeout来改变y轴偏移量，实现有感觉的滑动
    setTimeout(function() {
      animation.translateY(0).step()
      that.setData({
        animationData: animation.export()
      })
    }, 100);
  },
  share_cancel() {
    this.painter.component_body();
    this.setData({
      chooseSize: true
    });
  },
  backhome() {
    wx.navigateBack({
      delta: 1,
    })
  },
  homeTap() {
    wx.swithchTab({
      url: '/pages/index/index',
    })
  },
  onShow: function() {
    this.initPage();
  },
  copyText: function (e) {
    console.log(e)
    wx.setClipboardData({
      data: e.currentTarget.dataset.text,
      success: function (res) {
        wx.getClipboardData({
          success: function (res) {
            wx.showToast({
              title: '复制成功'
            })
          }
        })
      }
    })
  },
  showShare() {
    const {card} = this.data;
    getQrcode('CARD',card.id).then((qrcode) => {
      card.qrcode = qrcode;
      this.setData({card});
      this.share.showShare();
    })
  },
  showService() {
    this.setData({ showService: !this.data.showService })
  },
  makePhone(e){
    const {phone} = e.currentTarget.dataset;
    wx.makePhoneCall({
      phoneNumber: phone,
    })
  },
  // 收藏
  collectEvent(e) {
    const _this = this;
    const { id } = this.data.card;
    const { userId } = wx.getStorageSync('user');
    if (userId) {
      const data = {
        type:'COMMODITY',
        userId: userId,
        likedObjectId: id,
        likeStepType: 'COLLECTION',
        clubId: constv.cid
      }
      const method = 'POST';
      const url = urls.statistics;
      const success = body => {
        
      }
      fetch({ url, method, data, json: true, success })
    } else {
      login(e, () => {
        this.collectEvent(e);
      });
    }
  },
  // 弹窗加减
  changeInput(e){
    let {value} = e.detail;
    this.setData({inputValue:value});
  },
  showNumInput(){
    const {card} = this.data;
    let count = card.cur_count;
    this.setData({ showNumInput: !this.data.showNumInput,inputValue:count});
  },
  confirmNum(){
    let { inputValue, card, onShown} = this.data;
    if (inputValue == '' || inputValue < 1) {
      inputValue = 1;
    }
    const limit = card.chooseItem.limitTimes;
    if (card.mostTime < inputValue || limit && limit>inputValue){
      wx.showToast({
        title: '已达上限',
        icon: 'none',
        duration: 1000,
      })
      return;
    }
    inputValue = Math.floor(inputValue);
    card.cur_count = inputValue;
    this.setData({card, showNumInput: !this.data.showNumInput});
  },
  onUnload(){
    wx.removeStorageSync('card');
  },
  // 高级会员才有折扣
  seniorMemberDiscount(){
    let modal = {
      modalCon: ['您不是高级会员', '将以原价购买'],
      confirmText: '高级会员认证',
      cancelText: '继续购买',
      confirmFn: () => {
        wx.navigateTo({
          url: '/personal/personal-advancecard/personal-advancecard',
        })
      },
      cancelFn: () => {
        this.alsoApplyCard()
      }
    }
    this.setData({ modal }, () => {
      this.backendModal.show();
    });
  },
  // 高级会员限购
  seniorMemberLimit(){
    let modal = {
      modalCon: ['您不是高级会员', '请先去申请高级会员'],
      confirmText: '高级会员认证',
      confirmFn: () => {
        wx.navigateTo({
          url: '/personal/personal-advancecard/personal-advancecard',
        })
      }
    }
    this.setData({ modal }, () => {
      this.backendModal.show();
    });
  },
  // 认证车主折扣
  canMemeber(){
    let modal = {
      modalCon: ['您不是认证车主', '请先去认证车辆'],
      confirmText: '车主认证',
      confirmFn: () => {
        wx.navigateTo({
          url: '/personal/personal/personal',
        })
      },
      cancelFn:()=>{
        this.notApplyCard();
      }
    }
    this.setData({ modal }, () => {
      this.backendModal.show();
    });
  },
  // 获取已经购买几次
  getCardBuyRecord() {
    const {card} = this.data;
    const url = `${urls.order}/record?productId=${this.data.cardId}`;
    const data = JSON.stringify(this.data.buyLimits)
    const success = body => {
      card.commoditySpecifications.map(item=>{
        item.limitTimes = item.purchaseLimit - body[item.id];
      })
      card.chooseItem = card.commoditySpecifications[0];
      console.log(card);
      this.setData({card});
    }
    fetch({url,success,data,method: 'POST',json: true});
  },
})