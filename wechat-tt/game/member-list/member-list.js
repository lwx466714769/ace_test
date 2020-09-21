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
    const {userId} = wx.getStorageSync('user');
    this.setData({ partyId: ops.partyId,userId}, this.getJoinMember);  
  },
  onReachBottom() {
    let { page, showAll } = this.data;
    if (!showAll || showAll == '加载中...') {
      this.setData({ page: page + 1, showAll: '加载中...' }, this.getMembers);
    }
  },
  // 获取立即报名参与人员
  getJoinMember() {
    const { partyId, userId } = this.data;
    fetch({
      url: `${urls.party}/${partyId}/selectState`,
      method: 'GET',
      data: { partyId, userId },
      success: body => {
        this.setData({ joinMember: body.peopleList })
      }
    })
  },
})