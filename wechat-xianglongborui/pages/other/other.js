//index.js
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
  data: {
    cards: [],
    postsTop: [],
    page: 0,
    count: 10,
    currentSwiper: 0,
    clubId: constv.cid,
    share: false
  },
  onLoad: function (options) {
    this.initPage();
  },
  initPage() {
    this.getPostTops(true); //  置顶帖子
    this.getEventData();//  获取置顶活动
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
    const data = {
      page: p,
      size: count,
      relateType: 'POST'
    };
    const success = body => {
      refresh && wx.stopPullDownRefresh();
      let showAll = 0 === body.length;
      let list = refresh ? body : postsTop.concat(body);
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
          } = o;
          return {
            cover,
            title,
            relateId,
            relateType
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
  /*--获得活动数据--*/
  getEventData() {
    const { clubId } = this.data;
    const url = `${urls.recommendPosts}/${clubId}/list/byType?page=0&size=2&relateType=ACTIVITY`;
    const success = body => {
      this.setData({ eventData: body });
    };
    const fail = body => {

    };
    fetch({ url, success, fail, loading: false })
  },
  /*--上拉加载更多--*/
  onReachBottom() {
    const { page, showAll } = this.data;
    if (!showAll) {
      this.setData({
        page: page + 1
      });
      this.getPostTops(false);
    }
  },
})
