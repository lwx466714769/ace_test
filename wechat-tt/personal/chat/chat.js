// personal/chat/chat.js
import urls from '../../utils/urls.js'
import { fetch, formatMsgTime} from '../../utils/utils.js'
import constv from '../../const.js'
Page({

  /**
   * 页面的初始数据
   */
  data: {
    clubId:constv.cid
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.getChatList();
  },
  getChatList(){
    const {clubId} = this.data;
    fetch({
      url: `${urls.privateChat}/selectPrivateChatList`,
      data:{clubId},
      success:body =>{
        body.map(item=>{
          item.createAt = formatMsgTime(item.createAt)
        })
        this.setData({chatList:body})
      }
    })
  },
  goChatDetail(e){
    console.log(e);
    const {id} = e.currentTarget.dataset;
    wx.navigateTo({
      url: `/personal/chat-detail/chat-detail?id=${id}`,
    })
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    const { isUpdate} = this.data;
    if(isUpdate){
      this.getChatList()
    }
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  },
})