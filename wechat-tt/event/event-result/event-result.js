// event/event-result/event-result.js
import urls from '../../utils/urls.js';
import { fetch, shareDrawClub} from '../../utils/utils.js'
import constv from '../../const.js'
Page({

  /**
   * 页面的初始数据
   */
  data: {
    showTicket:false
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (ops) {
    const event = wx.getStorageSync('event');
    console.log(event);
    this.setData({ orderId: ops.orderId, event });
    if (!event.payAudit){
      this.getQrcode();
    }
    this.shareDrawClub();
  },
  onReady() {
    this.share = this.selectComponent('#share');
  },
  onUnload(){
    wx.removeStorageSync('event');
  },
  shareDrawClub(){
    let ctx = wx.createCanvasContext('myCanvas', this);
    const { event } = this.data;
    if (event.clubInfo.clubLogo) {
      shareDrawClub(ctx, event.coverImg.url, event.clubInfo.clubLogo, event.clubInfo.clubName, (img) => {
        this.setData({ shareImg: img });
      })
    }
  },

  // 获取分享二维码
  getEventQrcode() {
    const { event } = this.data;
    const data = {
      feedType: 'ACTIVITY',
      relateId: event.activityId,
      url: 'event/event-detail/event-detail',
      appType: constv.app_type
    }
    return new Promise((resolve, reject) => {
      fetch({
        url: `${urls.getCode}`,
        data: data,
        loading: '加载中...',
        success: body => {
          event.qrcode = body;
          this.setData({ event });
          resolve();
        },
        fail: body => {
          wx.showToast({ title: body.message, icon: 'none', });
        }
      })
    })
  },
  showShare() {
    this.getEventQrcode().then(() => {
      this.share.showShare();
    })
  },
  onShareAppMessage(res){
    const {event,shareImg} = this.data;
    return {
      title: event.activityName,
      imageUrl: shareImg||event.coverImg.url,
      path:`/event/event-detail/event-detail?activityId=${event.activityId}`
    }
  },

  // 获取消费二维码
  getQrcode() {
    const {orderId} = this.data;
    fetch({
      url: `${urls.order}/${orderId}`,
      success: body => {
        this.setData({ qrcode: body.qrCode });
      }
    })
  },
  showTicket(e) {
    this.setData({ showTicket: !this.data.showTicket });
  }
})