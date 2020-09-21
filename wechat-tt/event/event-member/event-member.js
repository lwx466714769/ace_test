// event/event-member/event-member.js
import urls from '../../utils/urls.js';
import { fetch } from '../../utils/utils.js'
Page({

  /**
   * 页面的初始数据
   */
  data: {
    members:[],
    page:0,
    count:20,
    showAll:'加载中...'
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (ops) {
    if(ops.type){
      this.setData({type:ops.type});
    }
    this.setData({ activityId: ops.activityId},this.getMembers);  
  },
  onReachBottom() {
    // let { page, showAll } = this.data;
    // if (!showAll || showAll == '加载中...') {
    //   this.setData({ page: page + 1, showAll: '加载中...' }, this.getMembers);
    // }
  },
  getMembers(refresh = false) {
    if(refresh){
      this.setData({page:0,members:[]});
    }
    const { activityId, page, count, members,type } = this.data;
    // const data = { page, count }
    let url;
    if(type == 'checkIn'){
      url = `${ urls._event }/${activityId}/checkIn`;
    }else{
      url = `${urls._verify}/activityBuyCheck/peoples?activityId=${activityId}`;
    }
    const success = body => {
      if (body.length == 0) {
        this.setData({ showAll: true })
      }
      // let list = refresh ? body : [...members, ...body];
      this.setData({ members: body });
    }
    const fail = () => {
      wx.showToast({
        title: '获取信息失败',
        icon: 'none'
      })
    }
    return fetch({ url, success, fail, loading: '加载中...' })
  },
})