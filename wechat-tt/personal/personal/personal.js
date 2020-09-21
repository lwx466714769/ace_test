import urls from '../../utils/urls.js';
import { uploadImages, fetch, formatPostsAce } from '../../utils/utils.js';
const app = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    attestation:'/attestation/pages/attestation/attestation',
    carmodelImg:'/images/default.png',
    benefits:null,
    checkcar:[],
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    const user = wx.getStorageSync('user');
    const { userId} = user;
    const verified = user.userPhone.verified;
    this.setData({ userId, verified},this.initPage);
    wx.showTabBar({
      animation: true,
    })
  },
  initPage(){
    this.getSeniorCard();
    this.getSeniorApplyInfo();
  },
  onShow(){
    const { avatar, nickname } = wx.getStorageSync('user');
    this.setData({ avatar, nickname });
  },
  getSeniorCard() {
    const clubId = wx.getStorageSync('cid');
    fetch({
      url: `${urls._seniorMember}/1/${clubId}`,
      loading: false,
      success: body => {
        const seniorCards = body;
        if (seniorCards.length>0) {
          this.setData({ seniorCard: seniorCards[0] });
        } else {
          //没有卡
        }
      },
      fail: body => {
        wx.showToast({
          icon:'none',
          title: body.message || '获取高级卡信息失败',
        })
      }
    })
  },
  getSeniorApplyInfo() {
    const clubId = wx.getStorageSync('cid');
    fetch({
      url: `${urls._seniorMember}/applicationMember/1/${clubId}`,
      loading: false,
      success: body => {
        if (body[0]) {
          this.setData({ applyInfo: body[body.length - 1]})
        }
      },
      fail: body => {
        wx.showToast({
          icon:'none',
          title: body.message || '获取申请信息失败',
        })
      }
    })
  },
  onTabItemTap(item){
    const {userId} = wx.getStorageSync('user');
    if(!userId){
      console.log('vbb')
      wx.redirectTo({
        url: '/pages/login/login',
      })
    }
    console.log(item);
  },
})