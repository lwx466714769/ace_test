// event/upload-event-result/upload-event-result.js
import urls from '../../utils/urls.js';
import { fetch, shareDrawClub, formatDate} from '../../utils/utils.js'
import constv from '../../const.js'
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
    wx.hideShareMenu();
    let event = wx.getStorageSync('event');
    let clubInfo = wx.getStorageSync('clubInfo');
    event.startTime = formatDate(event.startTime,'.',true);
    event.endTime = formatDate(event.endTime, '.', true);
    event.clubName = clubInfo.clubName;
    event.clubLogo = clubInfo.clubLogo;
    this.setData({ event }, this.shareDrawClub);
  },
  onUnload() {
    wx.removeStorageSync('event');
    let pages = getCurrentPages();
    console.log(pages);
    let prePages = pages[pages.length - 4];
    prePages.setData({ updateEvent: true });
    wx.navigateBack({
      delta: 2
    })
  },
  onHide() {
    wx.removeStorageSync('event');
  },
  onReady() {
    this.share = this.selectComponent('#share');
  },
  onShareAppMessage(res) {
    const { event, shareImg } = this.data;
    if (res.from == 'button') {
      return {
        title: event.activityName,
        path: `/event/event-detail/event-detail?activityId=${event.activityId}`,
        imageUrl: event.coverImg.url
      }
    }
  },
  shareDrawClub() {
    let ctx = wx.createCanvasContext('myCanvas', this);
    const { event } = this.data;
    let background = event.coverImg.url || '/images/banner.png';
    shareDrawClub(ctx, background, event.clubLogo, event.clubName, (img) => {
      this.setData({ shareImg: img });
    })
  },
  showShare() {
    this.getEventQrcode().then(() => {
      this.share.showShare();
    })
  },
  getEventQrcode() {
    const { event } = this.data;
    const data = {
      feedType: 'ACTIVITY',
      relateId: event.activityId,
      url: `event/event-detail/event-detail`,
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
})