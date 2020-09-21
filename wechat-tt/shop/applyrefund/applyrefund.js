// shop/applyrefund/applyrefund.js
import urls from '../../utils/urls.js';
import { uploadImages, fetch, toContentParts, toImages, toVideos, uploadVideo, toVideoContent, msgCheck } from '../../utils/utils.js';
Page({

  /**
   * 页面的初始数据
   */
  data: {
    isSubmit:false,
    images:[]
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    let goods = wx.getStorageSync('goods')
    let order = wx.getStorageSync('order')
    this.setData({goods,order})
  },
  submit(){
    if (!this.data.textarea || this.data.textarea.length<1){
      wx.showToast({
        title: '请输入退款原因',
      })
    }else{
      this.toSubmit(this.data.textarea)
    }
  },
  modifyInput(e) {
    const textarea = e.detail.value;
    this.setData({
      textarea
    })
  },
  addImages() {
    let _this = this;
    let { images} = this.data;
    var count = 9 - images.length;
    wx.chooseImage({
      count,
      success: function ({ tempFilePaths }) {
        console.log(tempFilePaths);
        const tempImages = tempFilePaths.map(o => ({
          id: o,
          uploading: true,
          src: o
        })
        )
        const { images } = _this.data;
        console.log(images);
        _this.setData({ images: [...images, ...tempImages] });

        uploadImages(tempFilePaths, function () {
          console.log("all finish")
          const { images } = _this.data;
          const imgs = images.filter(o => {
            return o.uploading == false && o.id != o.src;
          })
          _this.setData({ images: imgs })
        }, function ({ itemUrl, filePath }) {
          const { images } = _this.data;
          const imgs = images.map(o => {
            let item = {
              ...o,
              uploading: false
            }
            if (itemUrl) {
              o.id === filePath && (item.src = itemUrl);
            } else {
              o.id === filePath && (item.fail = true);
            }
            return item;
          })
          _this.setData({ images: imgs })
        });
      }
    })
  },
  delImages(e) {
    const { id } = e.currentTarget.dataset;
    const { images } = this.data;
    const delImgs = images.filter(o => o.id !== id);
    this.setData({ images: delImgs });
  },
  toSubmit(area) {
    const { images, isSubmit } = this.data;
    const url = `${urls.goods}/aRefund/${this.data.goods.orderId}?cause=${area}`;
    let image = toImages(images);
    let imgArray = []
    images.map((img)=>{
      imgArray.push(img.src)
    })
    let data = imgArray
    if (isSubmit) return;
    this.setData({ isSubmit: true });
    const success = body => {
      wx.showToast({
        title: '申请成功',
      })
      setTimeout(() => {
        wx.navigateBack()
      }, 1000)
    }
    const fail = body => {
      wx.showToast({
        title: '申请失败',
        icon: 'none'
      })
    }
    fetch({ url, data, success, fail, method: 'POST', json: true, loading: '正在提交' })
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

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
})