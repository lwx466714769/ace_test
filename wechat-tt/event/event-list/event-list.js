// event/event-list/event-list.js
import urls from '../../utils/urls.js';
import Painter from '../../palette/paint.js';
import constv from '../../const.js';
import {fetch,login,formatDate} from '../../utils/utils.js';
Page({
  data: {
    types: [
      { index: 0, name: '分类', type: 'classify', list: [] },
      {
        inex: 1, name: '时间', type: 'time', list: [
          { index: 0, name: '全部' },
          { index: 1, name: '本周' },
          { index: 2, name: '当月' },
          { index: 3, name: '当月后' }
        ]
      }
    ],
    curType: '',//当前选择的类型
    curTypeCon: '',//当前所选类型的内容
    eventList: [],
    page: 0,
    count: 10,
    showAll: '加载中...',
    clubId: constv.cid,
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.getData();
  },
  // 选择不同类型的俱乐部
  typeChange(e) {
    const { curType, types } = this.data;
    const { type } = e.currentTarget.dataset;
    if (curType == type) {
      this.setData({ curType: '' })
    } else {
      let info = types.find(item => item.type == type);
      this.setData({ curType: type, curTypeCon: info });
    }
  },
  getData(refresh = false) {
    const { clubId, page, count } = this.data;
    let p = page;
    if (refresh) {
      p = 0;
      this.setData({ page: 0, eventList: [], showAll: '加载中...' })
    }
    let data = {
      clubId,
      page: p,
      size:count,
      draftOrFormal: true
    }
    fetch({
      url: `${urls.activity}/activityList`,
      data: data,
      loading: '加载中...',
      success: body => {
        wx.stopPullDownRefresh();
        const { eventList } = this.data;
        if (body.content.length == 0 || body.content.length < 3) {
          this.setData({ showAll: true })
        }
        let todayDate = new Date().getTime();
        body.content.map(item => {
          if(todayDate<item.startTime){
            item.state = 'noStart';
          }else if (todayDate > item.endTime) {
            item.state = 'end';
          } else {
            item.state = true;
          }
          item.startTime = formatDate(item.startTime);
          let tempItem = item.startTime.split('月');
          item.month = tempItem[0].split('年')[1];
          item.day = tempItem[1].split('日')[0];
        })

        let list = [...eventList, ...body.content];
        this.setData({ eventList: list })
      }
    })
  },
  goEventDetail(e) {
    const { eventList } = this.data;
    const { id } = e.currentTarget.dataset;
    const event = eventList.find(item => item.activityId == id);
    wx.navigateTo({
      url: `/event/event-detail/event-detail?activityId=${event.activityId}`
    })
  },
  uploadEvent(e) {
    const { clubId } = this.data;
    const { userId } = wx.getStorageSync('user');
    if (userId) {
      wx.navigateTo({
        url: `/event/upload-event/upload-event?clubId=${clubId}`,
      })
    } else {
      login(e, () => {
        this.uploadEvent(e);
      })
    }
  },
  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {
    // this.event.getData(true);
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {
    const { page, showAll } = this.data;
    if (showAll == '加载中...') {
      this.setData({ page: page + 1 }, this.getData);
    }
  },
})