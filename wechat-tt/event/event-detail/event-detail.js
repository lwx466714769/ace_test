// event/event-detail/event-detail.js
import urls from '../../utils/urls.js';
import { fetch, formatDate, getTextFromHTML, formatMsgTime, login, needJoin, shareDrawClub, isClubMember, toDecimal2, getQrcode } from '../../utils/utils.js';
import WxParse from '../../utils/wxParse/wxParse.js';
import constv from '../../const.js'
Page({

  /**
   * 页面的初始数据
   */
  data: {
    tabList: [
      { index: 0, name: '介绍', render: true },
      { index: 1, name: '相册', render: true },
      // { index: 2, name: '评论', render: true },
    ],
    curIndex: 0,
    page: 0,
    pagePhoto: 0,
    count: 10,
    showAll: '加载中...',
    showAll1: '加载中...',
    comments: [],
    photos: [],
    orderList: [],
    isPrivate: false,
    fromScene: false
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (ops) {
    console.log(ops);
    const { userId } = wx.getStorageSync('user');
    let activityId;
    if (ops.scene) {
      activityId = parseInt(ops.scene);
    } else {
      activityId = ops.activityId;
    }
    if (ops.scene || ops.isShare) {
      this.setData({ fromScene: true });
    }
    this.setData({ activityId, userId }, this.initPage);
  },
  onHide() {
    this.setData({ joinClubState: false, updateComment: false })
  },
  onUnload() {
    wx.removeStorageSync('event');
    this.setData({ joinClubState: false, updateComment: false })
  },
  initPage() {
    this.getEventDetail();
    this.getIntro();
    this.getOrderList();
    this.getPhotos();
    // this.getComments(true);
  },
  onReady() {
    this.share = this.selectComponent('#share');
  },
  onShow() {
    const { joinClubState, isUpdate } = this.data;
    // 从加入俱乐部成功页返回或者从登录绑定手机号返回 
    if (joinClubState) {
      this.initPage();
    }
    if (isUpdate) {
      this.getComments(true);
    }
  },
  shareDrawClub() {
    let ctx = wx.createCanvasContext('myCanvas', this);
    const { eventDetail } = this.data;
    if (eventDetail.clubInfo.clubLogo) {
      shareDrawClub(ctx, eventDetail.coverImg.url, eventDetail.clubInfo.clubLogo, eventDetail.clubInfo.clubName, (img) => {
        console.log(img);
        this.setData({ shareImg: img });
      })
    }
  },
  showShare() {
    const { activityId, eventDetail } = this.data;
    getQrcode('ACTIVITY', activityId).then((qrcode) => {
      eventDetail.qrcode = qrcode;
      this.setData({ eventDetail})
      this.share.showShare();
    })
  },
  onReachBottom() {
    const { curIndex, page, showAll, pagePhoto, showAll1 } = this.data;
    if (curIndex == 1 && showAll1 == '加载中...') {
      this.setData({ pagePhoto: pagePhoto + 1 }, this.getPhotos);
    } else if (curIndex == 2 && showAll == '加载中...') {
      this.setData({ page: page + 1 }, this.getComments);
    }
  },
  // 获取活动详情
  getEventDetail() {
    const _this = this;
    const { activityId, fromScene } = this.data;
    const { userId } = wx.getStorageSync('user');
    fetch({
      url: `${urls._verify}/activity/${activityId}?draftOrFormal=true&userId=${userId || ''}`,
      loading: '加载中...',
      success: body => {
        if (body.signEndTime) {
          let now = new Date().getTime();
          if (now > body.signEndTime && now < body.endTime) {
            body.state = 'signEnd';
          }
          body.signEndTime = formatDate(body.signEndTime, '.', true);
        }
        body.startTime = formatDate(body.startTime, '.', true);
        body.endTime = formatDate(body.endTime, '.', true);

        if (body.discount > 0) {
          body.initMinPrice = Math.floor(body.minPrice / body.discount * 100) / 100;
          body.initMaxPrice = Math.floor(body.maxPrice / body.discount * 100) / 100;
        } else {
          body.initMinPrice = body.minPrice;
          body.initMaxPrice = body.maxPrice;
        }
        body.minPriceInt = toDecimal2(body.minPrice, true);
        body.minPriceDecimal = toDecimal2(body.minPrice);
        body.maxPriceInt = toDecimal2(body.maxPrice, true);
        body.maxPriceDecimal = toDecimal2(body.maxPrice);
        isClubMember(body.clubInfo.clubId).then((status) => {
          this.setData({ isClubMember: status })
        })
        this.setData({ eventDetail: body, clubId: body.clubInfo.clubId });
        this.shareDrawClub();
        let query = wx.createSelectorQuery();
        query.select('#detail').boundingClientRect();
        query.exec(function (res) {
          console.log(res);
          _this.setData({ detailHeight: (res[0].height) });
        })
      },
      fail: body => {
        console.log(body);
        if (body.code == 999) {
          this.setData({ delState: true })
        }
      },
    })
  },
  // 获取介绍内容
  getIntro() {
    const _this = this;
    const { activityId } = this.data;
    fetch({
      url: `${urls.hotdiscuss}/${activityId}/getContent?feedType=ACTIVITY`,
      success: body => {
        body = body.replace(/\/n/g, '</p><p>');
        WxParse.wxParse('article', 'html', body, _this, 0);
      }
    })
  },
  changeTab(e) {
    const { index } = e.currentTarget.dataset;
    this.setData({ curIndex: index });
  },
  getAlbum() {
    const { activityId } = this.data;
    fetch({
      url: `${urls._albums}/${activityId}/type/3`,
      success: body => {
        this.getPhotos(true, body[0].albumId);
      }
    })
  },
  getPhotos(refresh = false) {
    if (refresh) {
      this.setData({ pagePhoto: 0, photos: [] })
    }
    const { activityId, pagePhoto, count, photos } = this.data;
    fetch({
      url: `${urls._albums}/${activityId}/photo/3`,
      data: { pageNo: pagePhoto, pageSize: count },
      loading: '加载中...',
      success: body => {
        if (body.content.length == 0) {
          this.setData({ showAll1: true });
        }       
        let list = [...photos, ...body.content];
        if(body.total>0){
          let { tabList} = this.data;
          tabList[1].name = '相册('+body.total+')';
          this.setData({tabList})
        }
        this.setData({ photos: list})
      }
    })
  },
  previewImage(e) {
    const { url, type, imgs } = e.currentTarget.dataset;
    console.log(imgs);
    console.log(url);
    let urls = [];
    if (type == 'comment') {
      urls = imgs.map(o => o.type === 'IMAGE' || o.type === 'COVER' ? o.content : '').filter(o => o)
    } else {
      const { photos } = this.data;
      urls = photos.map(item => item.url);
    }
    wx.previewImage({
      urls: urls,
      current: url
    })
  },
  getComments(refresh = false) {
    if (refresh) {
      this.setData({ page: 0, comments: [] })
    }
    let { activityId, page, count, comments } = this.data;
    fetch({
      url: `${urls.reply}`,
      data: { relateId: activityId, replyRelateType: 'ACTIVITY', page, size: count },
      loading: '加载中...',
      success: body => {
        if (body.length == 0 || body.length < count - 2) {
          this.setData({ showAll: true });
        }
        body.map(o => {
          o.createAt = formatMsgTime(o.createAt);
          o.contents = getTextFromHTML(o.contents);
        })
        let list = [...comments, ...body];
        console.log(list);
        this.setData({ comments: list })
      }
    })
  },
  //删除评论
  delComment(e) {
    const { activityId, comments } = this.data;
    const replyId = e.currentTarget.dataset.id;
    const url = `${urls.reply}/${replyId}`;
    wx.showModal({
      title: '',
      content: '确认要删除吗？',
      success: (res) => {
        const success = body => {
          wx.showToast({
            title: '删除成功',
            duration: 2000,
            success: res => {
              let comment = comments.filter(item => item.replyId != replyId);
              this.setData({ comments: comment });
            }
          })
        }
        const fail = body => {
          wx.showToast({
            title: '删除失败',
            icon: 'none'
          })
        }
        if (res.confirm) {
          fetch({ url, method: 'DELETE', loading: '正在删除', success, fail })
        }
      }
    })
  },
  onShareAppMessage(res) {
    const { activityId, eventDetail, shareImg } = this.data;
    let imageUrl = eventDetail.coverImg.url;
    let title = eventDetail.activityName;
    let path = `/event/event-detail/event-detail?activityId=${activityId}&isShare=true`;
    return { title, path, imageUrl: shareImg || imageUrl }
  },
  // 报名
  joinEvent(e) {
    const { activityId, eventDetail, isClubMember } = this.data;
    const { userId } = wx.getStorageSync('user');
    if (userId) {
      // 是否限制会员才能报名
      if (eventDetail.entryLimit == 1) {
        if (isClubMember) {
          wx.setStorageSync('event', eventDetail);
          wx.navigateTo({
            url: `/event/event-program/event-program?activityId=${activityId}&discount=${eventDetail.discount}`,
          })
        } else {
          needJoin(eventDetail.clubInfo.clubId, '报名该活动需加入俱乐部');
        }
      } else {
        wx.setStorageSync('event', eventDetail);
        wx.navigateTo({
          url: `/event/event-program/event-program?activityId=${activityId}&discount=${eventDetail.discount}`,
        })
      }
    } else {
      login(e, () => {
        this.getEventDetail();
        this.joinEvent(e);
      }, 'event')
    }
  },
  // 评论
  goComment(e) {
    const { userId } = wx.getStorageSync('user');
    const { activityId, isClubMember, eventDetail } = this.data;
    if (userId) {
      if (isClubMember) {
        wx.navigateTo({
          url: `/pages/upload-comment/upload-comment?id=${activityId}&isFrom=ACTIVITY`
        })
      } else {
        needJoin(eventDetail.clubInfo.clubId, '评论该活动需加入俱乐部');
      }
    } else {
      login(e, () => {
        this.getEventDetail();
        this.goComment(e);
      })
    }
  },
  toCollect(e, type = 'COLLECTION') {
    const { userId } = wx.getStorageSync('user');
    let { eventDetail } = this.data
    if (userId || type == 'COLLECTION') {
      const url = urls.statistics;
      const data = {
        type: 'ACTIVITY',
        userId: userId,
        likedObjectId: eventDetail.activityId,
        likeStepType: type,
        clubId:constv.cid
      }
      fetch({
        url,
        method: 'POST',
        data,
        json: true,
        success: body => {
          this.setData({ 'eventDetail.likeNumberVO.collectionState': !eventDetail.likeNumberVO.collectionState })
        }
      })
    } else {
      login(e, () => {
        this.getEventDetail();
        this.toCollect(e);
      })
    }
  },
  // 获取俱乐部基本信息
  // getClubInfo(clubId) {
  //   wx.showLoading({
  //     title: '加载中...',
  //     mask:true
  //   })
  //   const url = `${urls._club}/${clubId}/isClubMember`;
  //   const success = body => {
  //     wx.hideLoading();
  //     if (body) {
  //       this.setData({ isClubMember: true });
  //     }else{
  //       this.setData({ isClubMember: false });
  //     }
  //     this.setData({ loadIsMember: true});
  //   }
  //   const fail = () => {
  //     wx.showToast({
  //       title: '获取信息失败',
  //       icon: 'none'
  //     })
  //   }
  //   return fetch({ url, success, fail})
  // },
  toCheckIn(e) {
    const { eventDetail, isClubMember } = this.data;
    // let checkState = ['所有人都可签到','只有报名人员可签到','只有会员可签到'];
    const { userId } = wx.getStorageSync('user');
    if (userId) {
      const { radius, latitude, longitude } = eventDetail.checkInLocation;
      wx.getLocation({
        success: (res) => {
          console.log(res);
          if (radius > 0) {
            let s = this.getDistance(res.latitude, res.longitude, latitude, longitude);
            console.log(s);
            if (s > radius) {
              wx.showToast({
                title: '您还不在签到范围内',
                icon: 'none'
              })
              return;
            } else {
              this.checkSubmit(res.latitude, res.longitude);
            }
          } else {
            this.checkSubmit(res.latitude, res.longitude);
          }
        },
        fail: () => {
          wx.showToast({
            title: '获取位置失败',
            icon: 'none'
          })
        }
      })

    } else {
      login(e, () => {
        this.toCheckIn(e);
      })
    }
  },
  checkSubmit(latitude, longitude) {
    console.log(latitude)
    const { eventDetail } = this.data;
    console.log(`${urls._event}/${eventDetail.activityId}/checkIn`)
    fetch({
      url: `${urls._event}/${eventDetail.activityId}/checkIn`,
      method: 'POST',
      json: true,
      data: { latitude: latitude, longitude: longitude },
      success: body => {
        wx.showToast({
          title: '签到成功',
          icon: 'none'
        })
        eventDetail.canCheckIn = 2;
        this.setData({ eventDetail });
      },
      fail: body => {
        wx.showToast({
          title: body.message,
          icon: 'none'
        })
      }
    })
  },
  getDistance(lat1, lng1, lat2, lng2) {
    var radLat1 = lat1 * Math.PI / 180.0;
    var radLat2 = lat2 * Math.PI / 180.0;
    var a = radLat1 - radLat2;
    var b = lng1 * Math.PI / 180.0 - lng2 * Math.PI / 180.0;
    var s = 2 * Math.asin(Math.sqrt(Math.pow(Math.sin(a / 2), 2) +
      Math.cos(radLat1) * Math.cos(radLat2) * Math.pow(Math.sin(b / 2), 2)));
    s = s * 6378137;// EARTH_RADIUS;   //默认单位为米
    // s = Math.round(s * 10000) / 10000; //输出为公里
    //s=s.toFixed(2);
    return s;
  },
  // 分享显示返回俱乐部
  onPageScroll(e) {
    const { fromScene, detailHeight } = this.data;
    if (fromScene) {
      if (e.scrollTop > 100 && detailHeight > 650) {
        this.setData({ showBackClub: true });
      } else {
        this.setData({ showBackClub: false });
      }
    }
  },
  // 获取类型列表
  getOrderList() {
    const { activityId, delState } = this.data;
    const url = `${urls.order}/user/product`;
    let data = {
      productType: 1,
      productId: activityId
    };
    const success = body => {
      if(body.length>0){
        wx.showModal({
          content: '你已拥有该活动门票',
          confirmText:'立即查看',
          cancelText:'知道了',
          success:res=>{
            if(res.confirm){
              this.goTicket();
            }
          }
        })
      }
      this.setData({ orderList: body });
    }
    const fail = body => {
      wx.showToast({
        title: body.message || "获取失败",
      });
    }
    fetch({ url, data, success, fail, loading: '加载中...' });
  },
  goTicket() {
    const { orderList } = this.data;
    if (orderList.length == 1) {
      wx.navigateTo({
        url: `/event/event-ticket/event-ticket?orderId=${orderList[0].orderId}`,
      })
    } else {
      wx.navigateTo({
        url: `/event/event-ticket-list/event-ticket-list`,
      })
    }
  }
})