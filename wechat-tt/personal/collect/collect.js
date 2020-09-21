// profile/collect/collect.js
import urls from '../../utils/urls.js'
import { fetch, formatPostsAce, formatDate, getTextFromHTML } from '../../utils/utils.js'
import constv from '../../const.js'
Page({

  /**
   * 页面的初始数据
   */
  data: {
    tabList: [
      { index: 0, name: '科普', render: true,type:'post' },
      { index: 1, name: '活动', render: false, type: 'event' },
      // { index: 2, name: '装备', render: false, type: 'equip' },
      // { index: 3, name: '商品', render: false, type: 'goods' },
      // { index: 4, name: '卡券', render: false, type: 'card' },
      // { index: 3, name: '资讯', render: false, type: 'media' }
    ],
    page:0,
    count:10,
    showAll:'加载中...',
    list:[],
    curIndex:0,
    loadData:false
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    const {userId} = wx.getStorageSync('user');
    this.setData({ userId,curUserId:userId });
    this.getListData('POST');
  },
  // 切换tab
  changeTab(e) {
    console.log(e)
    let { index, state,type} = e.detail;
    this.setData({ curIndex: index, list: [], page: 0, showAll: '加载中...', loadData:false });
    this.getData(type);
  },
  // 根据不同的tab,获取信息
  getData(type) {
    const { userId } = this.data;
    switch (type) {
      case 'post': this.getListData('POST');break;
      case 'event': this.getListData('ACTIVITY'); break;
      case 'equip': this.getListData('EQUIP'); break;
      // case 'club': this.getListData('CLUB'); break;
      case 'goods': this.getListData('goods'); break;
      case 'card': this.getListData('card'); break;
      case 'media': this.getListData('MEDIA_POST'); break;
    }
  },
  onReachBottom() {
    const { showAll, page,curIndex } = this.data;
    if (!showAll||showAll=='加载中...') {
      this.setData({ page: page + 1,showAll:'加载中...' });
      this.getData(curIndex);
    }
  },
  // 获取热议数据
  getListData(params, refresh = false) {
    const { page, count, userId, list } = this.data;
    let p = refresh ? 0 : page;
    const url = `${urls.collectionPager}?type=${params}`;
    const data = { page: p, count,clubId:constv.cid};
    const success = body => {
      refresh && wx.stopPullDownRefresh();
      if (body.length == 0||body.length<count-2) {
        this.setData({ showAll: true })
      };
      if (params == 'ACTIVITY') {
        body.map(item => {
          item.startTime = formatDate(item.startTime);
          let tempItem = item.startTime.split('月');
          item.month = tempItem[0].split('年')[1];
          item.day = tempItem[1].split('日')[0];
        })
      }
      // body.map(item => {
      //   if(item.feedEnum == 'POST'){

      //     if (item.body.postType == 'TEXT') {
      //       item.body.postTextInfo.text = getTextFromHTML(item.body.postTextInfo.text);
      //     } else if (item.body.postType == 'LONGTEXT') {
      //       item.body.postLongTextInfo.summary = getTextFromHTML(item.body.postLongTextInfo.summary);
      //     }else if(item.body.postType == 'VIDEO'){
      //       item.body.postVideoInfo.text = getTextFromHTML(item.body.postVideoInfo.text);
      //     }
      //   }
      // })
      console.log(body);
      let newList = refresh ? body : [...list, ...body];
      this.setData({ list: newList,loadData: true});
    }
    const fail = body => {
      wx.showToast({
        title: body.message,
        icon: 'none'
      })
    }
    fetch({ url, data, loading: '加载中...', success, fail });
  },
  getEquipData(refresh=false){
    const { page, count, userId, list } = this.data;
    let p = refresh ? 0 : page;
    const url = `${urls.statistics}/pager`;
    const data = { page: p, count };
    const success = body => {
      refresh && wx.stopPullDownRefresh();
      if (body.length == 0) {
        this.setData({ showAll: true })
      };
      body.map(item=>{
        item.likeNumberVO = {};
        item.likeNumberVO.likeState = true;
      })
      let newList = refresh ? body : [...list, ...body];
      this.setData({ list: newList, loadData: true});
    }
    const fail = body => {
      wx.showToast({
        title: body.message,
        icon: 'none'
      })
    }
    fetch({ url, data, loading: '加载中...', success, fail });
  },
  
})