// equip/equip-comment/equip-comment.js
import urls from '../../utils/urls.js';
import { fetch, login, formatMsgTime, getTextFromHTML} from '../../utils/utils.js'
import constv from '../../const.js'
Page({

  /**
   * 页面的初始数据
   */
  data: {
    page: 0,
    count: 10,
    showAll: '加载中...',
    comments:[]
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    const {userId} = wx.getStorageSync('user');
    let equipDetail = wx.getStorageSync('equipDetail');
    this.setData({ equipDetail,equipId:equipDetail.id,userId });
    this.getComments();
  },

  getComments(refresh = false) {
    if (refresh) {
      this.setData({ page: 0, comments: [] })
    }
    let { equipId, page, count, comments } = this.data;
    fetch({
      url: `${urls.reply}`,
      data: { relateId: equipId, replyRelateType: 'EQUIP', page, size: count },
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
  goComment(e) {
    const { equipId } = this.data;
    const { userId } = wx.getStorageSync('user');
    if (userId) {
      wx.navigateTo({
        url: `/pages/upload-comment/upload-comment?id=${equipId}&isFrom=EQUIP`,
      })
    } else {
      login(e, () => {
        this.goComment(e);
      });
    }
  },
  //删除评论
  delComment(e) {
    const { equipId, comments } = this.data;
    const commentId = e.currentTarget.dataset.id;
    const url = `${urls.reply}/${commentId}`;
    wx.showModal({
      title: '',
      content: '确认要删除吗？',
      success: (res) => {
        const success = body => {
          wx.showToast({
            title: '删除成功',
            duration: 2000,
            success: res => {
              let comment = comments.filter(item => item.replyId != commentId);
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
          fetch({ url, method: 'DELETE', json: true, loading: '正在删除', success, fail })
        }
      }
    })
  },
  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    const { isUpdate} = this.data;
    if(isUpdate){
      this.getComments(true);
    }
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {
    wx.removeStorageSync('equipDetail');
    this.setData({isUpdate:false})
  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {
    wx.removeStorageSync('equipDetail');
    this.setData({ isUpdate: false })
  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom() {
    let { page, showAll } = this.data;
    if (!showAll || showAll == '加载中...') {
      this.setData({ page: page + 1, showAll: '加载中...' }, this.getComments);
    }
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
})