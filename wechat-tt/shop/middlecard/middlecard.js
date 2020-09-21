import urls from '../../utils/urls.js';
import {
  fetch,
  formatCards,
  formatDate,
  formDateTime,
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
    autoplay: false,
    indicatorDots: false,
    interval: 5000,
    duration: 500,
    deleteItems: [],
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    console.log('当前', options);
    const { userId } = wx.getStorageSync('user');
    const {
      // quotaId,
      consumerCardId,
    } = options;

    this.setData({
      // quotaId,
      userId,
      consumerCardId,
    }, this.initPage);
  },

  initPage() {
    // this.gotCard();
    // this.getCardData();
    // this.getCardInfo();

    if (this.data.consumerCardId) {
      //从getCard跳入需要获取全部卡包再筛选
      this.getCardPackages()
    } else {
      //此为从卡包列表跳入
      this.setCurrentPackage(wx.getStorageSync('currentPackage'))
    }
  },
  setCurrentPackage(currentPackage) {
    currentPackage.consumerCards.map(card => {
      let infoStr = card.info
      let info = JSON.parse(infoStr)
      card.info = info
      let expire = checkExpire(card.createAt, card.expireAtType, card.expireAt)
      // let expire = checkExpire(card.createAt, 3, 1572766730000)
      // console.log(expire)
      card.isExpire = expire
      if (card.expireAtType && card.expireAtType != 1) {
        if (card.expireAtType == 2) {
          card.expireShow = "有效期至" + formatDate(card.createAt + card.expireAt * 24 * 60 * 60 * 1000)
        } else {
          card.expireShow = "有效期至" + formatDate(card.expireAt)
        }
      }
    })
    currentPackage.consumerCards.map(card => {
      card.expensesRecord.map(record => {
        record.consumptionTime = formDateTime(record.consumptionTime)
      })
    })
    let club = JSON.parse(currentPackage.patternUrl)
    this.setData({
      val_list: currentPackage.consumerCards,
      card: currentPackage.consumerCards[0],
      club
      // clubLogo:club.clubLogo,
      // clubName:club.clubName,
      // clubId:club.clubId
    })
  },
  getCardPackages() {
    const url = `${urls.card}/cardPackage`;
    const success = body => {
      if (body.false) {
        body.false.map(p => {
          for (card in p.consumerCards) {
            if (card.id == this.data.consumerCardId) {
              setCurrentPackage(p)
              return
            }
          }
        })
      }
      this.setData({
        packages: body.false
      })
    }
    const fail = body => {
      wx.showToast({
        title: body.message || '请检查网络',
      });
      this.setData({ exitSome: true, });
    }
    fetch({ url, success, fail, loading: false });
  },
  getCardInfo() {
    const { consumerCardId } = this.data;
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
  /*--所有卡片--*/
  getCardData() {
    const { userId, quotaId, clubId } = this.data;
    const url = `${urls._cardPackage}`;
    let data = {
      userId,
      clubId,
    };
    const success = body => {
      const _list = body.false;
      const _gift = body.true;
      const _exsit = Object.values(_list).some(obj => obj.id == quotaId);
      const val_list = _exsit ? Object.values(_list).find(obj => obj.id == quotaId).consumerCards : [];
      this.setData({
        val_list: val_list != [] ? val_list.map(obj => ({
          ...obj, expensesRecord: obj.expensesRecord != [] ? obj.expensesRecord.map(item => ({ ...item, consumptionTime: formatDate(item.consumptionTime) })) : []
        })) : [],
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
  onPullDownRefresh() {
    this.gotCard();
  },
  /**-----获取消费卡详情-----*/
  gotCard() {
    const consumerCardId = this.data.consumerCardId;
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
    const { orderId } = this.data;
  },
  /**
   *  删除卡片 组件
   */
  delCard(e) {
    const updata = this.data.updata ? this.data.updata : false;
    const { val_list } = this.data;
    if (updata) {
      const { consumerCardId } = this.data;
      const deleteItems = [consumerCardId];
      this.setData({ deleteItems: deleteItems, updata: false, curr_consumercardId: deleteItems[0] });
    } else {
      const deleteItems = [e.currentTarget.dataset.consumercardid];
      this.setData({ deleteItems: deleteItems, curr_consumercardId: deleteItems[0] });
    }
    this.checkAtteste.show();
  },
  change() {
    getCurrentPages()[getCurrentPages().length - 2].changeData();
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

  /*--*/
  swiperChange(e) {
    this.setData({
      currentSwiper: e.detail.current,
      card: this.data.val_list[e.detail.current]
    })
    /*--根据 e.detail.current 可判断 --*/
  },
  changeData() {
    const { curr_consumercardId, val_list } = this.data;
    if (!!curr_consumercardId) {
      this.setData({ val_list: val_list.filter(obj => obj.id != curr_consumercardId) }, this.initPage);
      this.change();
    };
    console.log('val_list.length', val_list.length)
    if (val_list.length == 1) {
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
    };
  },
})