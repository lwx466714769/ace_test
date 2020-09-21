import urls from '../../utils/urls.js';
import constv from '../../const.js';
import {
  fetch,
  formatPosts,
  login,
  bindPhone,
  getUserInfo,
  checkUserState,
  slideUpAnimation,
  formatCards,
  formatPostsAce,
  toDecimal2
} from '../../utils/utils.js';
Page({

  /**
   * 页面的初始数据
   */
  data: {
    cardbag: '/images/default.png',
    cardMiddle: '/images/default.png',
    cards: [],
    postsTop: [],
    page: 0,
    count: 10,
    currentSwiper: 0,
    clubId:constv.cid,
    share:false
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    wx.setStorageSync('userUpdate', 'off');
    this.initPage();
    slideUpAnimation(this, 'Ace-login', -200, 1); 
  },
  onShow(){
    const { userId, avatar, nickname } = wx.getStorageSync('user');
    if (userId) {
      this.setData({ userId, avatar, nickname });
    }
  },
  initPage() {
    this.getCardData(); //  推荐福利卡
    this.getInfoBanner(); // 首页banner 轮播图
    // this.getCardList(); //  所有卡片
    this.getPostTops(true); //  置顶帖子
    this.wdHeight(); // 获取手机高
    this.getEventData();//  获取置顶活动
    this.getEquipList();
  },
  /*--获得活动数据--*/
  getEventData() {
    const { clubId } = this.data;
    const url = `${urls.recommendPosts}/${clubId}/list/byType?page=0&size=2&relateType=ACTIVITY`;
    const success = body => {
      this.setData({ eventData: body });
    };
    const fail = body => {

    };
    fetch({ url, success, fail })
  },
  /*--获得装备数据--*/
  getEquipData() {
    const { clubId } = this.data;
    fetch({
      url: `${urls._verify}/equipRecommend`,
      data:{clubId,page:0,size:2},
      success:body=>{
        this.setData({ equipData: body.content });
      }
    })
  },
  /*--获取所有卡片数据--*/
  getCardList() {
    const _this = this;
    const {
      clubId
    } = this.data;
    const url = `${urls._cardList}?clubId=${clubId}&pageNo=0&pageSize=20`;
    const success = body => {
      _this.setData({
        cardsAll: body.content
      });
    };
    const fail = body => {
      wx.showToast({
        title: body.message,
        icon: 'none',
      });
    };
    fetch({
      url,
      success,
      fail,
    })
  },
  /*--获得卡片数据--*/
  getCardData() {
    const _this = this;
    const {
      clubId
    } = this.data;
    fetch({
      // url: `${urls._card}?clubId=${clubId}`,
      url: `${urls._cardList}?shelfTyp=3&clubId=${clubId}&pageNo=0&pageSize=20`,
      success: body => {
        if(body){
          let delta = body.content.length>0&&body.content[0].commodities.length - 4;
          body.content.length>0&&body.content[0].commodities.map(item=>{
            item.commoditySpecifications.map(obj=>{
              let price = obj.currentPrice;
              obj.currentPrice = toDecimal2(obj.currentPrice,true);
              obj.decimal = toDecimal2(price);
            })
          })
          if(delta >= 0){
            _this.setData({
              cards: body.content.length>0&&body.content[0].commodities.slice(0,4)
            });
          }else{
            _this.setData({
              cards: body.content.length>0&&body.content[0].commodities
            });
          }
        }
      }
    })
  },
  // 获取热议数据
  getPostTops(refresh) {
    const {
      page,
      count,
      clubId,
      postsTop
    } = this.data;
    let p = refresh ? 0 : page;
    const url = `${urls.recommendPosts}/${clubId}/list/byType`;
    // const url = `${urls._club}/${clubId}/posts`;
    const data = {
      page: p,
      size: count,
      relateType:'POST'
    };
    const success = body => {
      refresh && wx.stopPullDownRefresh();
      let showAll = 0 === body.length;
      let list = refresh ? body : postsTop.concat(body);
      // let list = refresh ? formatPostsAce(body) : postsTop.concat(formatPostsAce(body));
      this.setData({
        postsTop: formatIndexPosts(list),
        showAll,
      });
      // 格式化首页帖子 setData 不能超过 1024k 
      function formatIndexPosts(arr) {
        return arr.map(o => {
          let {
            cover,
            title,
            relateId,
            relateType
            // postId,
            // nickname
          } = o;
          return {
            cover,
            title,
            relateId,
            relateType
            // postId,
            // nickname
          };
        })
      };
    }
    const fail = body => {
      wx.showToast({
        title: body.message,
        icon: 'none'
      })
    }
    fetch({
      url,
      data,
      loading: '加载中...',
      success,
      fail
    });
  },
  // 获取推荐banner
  getInfoBanner() {
    const {
      clubId
    } = this.data;
    fetch({
      url: `${urls.banner}/?clubId=${clubId}&sortString=sort`,
      success: body => {
        this.setData({
          infoBanner: body.content
        });
      }
    })
  },
  // template_information点击详情
  information_onTap(e) {
    const {
      id,
      type
    } = e.currentTarget.dataset;
    console.log(e)
    switch (type){
      case 'VOTE': wx.navigateTo({ url: `/game/vote-detail/vote-detail?voteId=${id}` }); break;
      case 'PARTY': wx.navigateTo({ url: `/game/party-detail-join/party-detail-join?partyId=${id}` }); break;
      case 'POST': wx.navigateTo({ url: `/pages/post-detail/post-detail?postId=${id}` }); break;
      case 'ACTIVITY': wx.navigateTo({ url: `/event/event-detail/event-detail?activityId=${id}` }); break;
      case 'EVENT': wx.navigateTo({ url: `/event/event-detail/event-detail?activityId=${id}` }); break;
    }
  },
  middlecarddetails(e) {
    wx.navigateTo({
      url: "/shop/middlecard/middlecard",
    })
  },
  /*--轮播图 指示器--*/
  swiperChange(e) {
    this.setData({
      currentSwiper: e.detail.current
    })
  },
  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function() {
    this.share = this.selectComponent('#share');
  },
  personalTap(e) {
    login(e, () => {
      wx.navigateTo({
        url: "/personal/personal/personal",
      })
    })
  },
  /**
   *  下拉刷新
   */
  onPullDownRefresh: function() {
    this.initPage();
    wx.hideNavigationBarLoading();
    wx.stopPullDownRefresh();
  },
  /*--上拉加载更多--*/
  onReachBottom() {
    const {page,showAll} = this.data;
    if (!showAll) {
      this.setData({
        page: page + 1
      });
      this.getPostTops(false);
    }
  },
  wdHeight() {
    try {
      const res = wx.getSystemInfoSync()
      this.setData({
        windowHeight: res.windowHeight
      })
    } catch (e) {}
  },
  /*--分享传值--*/
  showShare() {
    let clubParams = {};
    clubParams.cover = '/images/share-img.jpg';
    clubParams.describe = '这是个性能车的园地，性能不是「必需品」，是个「必备品」，你可以拥有高性能车，或去改装车，让车恢复应该有的性能，而不是停在车库或者趴在路边当个展品！';
    clubParams.qrcode = '/images/qrcode.jpg';
    this.setData({clubParams});
    this.share.showShare();
  },
  goDiscussList(){
    wx.switchTab({
      url: "/pages/discuss/discuss",
    })
  },
  goEventList(e){
    wx.switchTab({ url: "/pages/event-list/event-list" })
  },
  goCardList(e){
    wx.navigateTo({ url: `/shop/card-list/card-list?clubId=${constv.cid}` })
  },
  // 获取装备
  getEquipList(refresh = false, carTypeId1 = '', brandId1 = '', seriesId1 = '', equipAuditStatus1 = 'AUDIT') {
    this.setData({ carTypeId: carTypeId1, brandId: brandId1, seriesId: seriesId1, equipAuditStatus: equipAuditStatus1 })
    if (equipAuditStatus1 == '') {
      this.setData({ isChecked: false })
    } else {
      this.setData({ isChecked: true })
    }
    const { clubId, page, count } = this.data;
    const { userId } = wx.getStorageSync('user');
    let p = page;
    const { carTypeId, brandId, seriesId, equipAuditStatus } = this.data;
    let data = {
      userId: userId || '',
      clubId,
      carTypeId: carTypeId || '',
      brandId: brandId || '',
      seriesId: seriesId || '',
      equipAuditStatus: equipAuditStatus || '',
      page: 0,
      count:2
    }
    fetch({
      url: `${urls.equip}/clubEquip`,
      data: data,
      loading: '加载中...',
      success: body => {
        this.setData({ equipData: body })
      }
    })
  },
  onShareAppMessage(){
    
  },
  
})