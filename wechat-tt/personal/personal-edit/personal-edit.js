import urls from '../../utils/urls.js'
import { fetch, uploadImages } from '../../utils/utils.js'
Page({

  /**
   * 页面的初始数据
   */
  data: {
    title: '',
    oriNickname: ''
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    const { userId, avatar, nickname, title, province } = wx.getStorageSync('user');
    this.setData({ userId, avatar, nickname, title, province });
    this.setData({ oriNickname: nickname })
  },
  saveName(e) {
    const nickname = e.detail.value;
    this.setData({ nickname });
  },
  saveAddress(e) {
    const province = e.detail.value;
    this.setData({ province });
  },
  saveDes(e) {
    const title = e.detail.value;
    this.setData({ title });
  },
  uploadAvatar() {
    let that = this;
    wx.chooseImage({
      count: 1,
      success: function ({ tempFilePaths }) {
        uploadImages(tempFilePaths, function (imgUrl) {
          that.setData({ avatar: imgUrl[0] })
        })
      },
    })
  },
  saveModify() {
    let { userId, avatar, nickname, province, title, oriNickname } = this.data;
    if (!province) {
      province = '';
    }
    if (!title) {
      title = '';
    }
    console.log(title);
    const user = wx.getStorageSync('user');
    let data = {}
    if (oriNickname == nickname) {
      data = {
        userId, avatar, province, title
      }
    } else {
      data = {
        userId, avatar, nickname, province, title
      }
    }

    const url = `${urls.userInfo}/modifyUserInfo`;
    const success = body => {
      wx.setStorageSync('user', Object.assign(user, data));
      let pages = getCurrentPages();
      var prePages = pages[pages.length - 2];
      prePages.setData({ isUpdate: true });
      wx.showToast({
        title: '保存成功'
      })
      setTimeout(() => {
        wx.navigateBack();
      }, 2000)
    }
    const fail = ({ code }) => {
      let errMap = new Map([
        [1019, '昵称已存在，换一个吧！']
      ])
      wx.showToast({
        title: errMap.get(code),
        icon: 'none'
      })
    }
    fetch({ url, data, method: 'PUT', json: true, loading: '加载中...', success, fail })
  }
})