// pages/upload/upload.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    imageFixed:false,
    imageSrc:'',
    imageNum:''
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {

  },
  onReady(){
    this.cropper = this.selectComponent('#cropper');
  },
  upEwm: function (e) {
    var _this = this
    wx.chooseImage({
      count: 1, // 默认9
      sizeType: ['original', 'compressed'], // 可以指定是原图还是压缩图，默认二者都有
      sourceType: ['album', 'camera'], // 可以指定来源是相册还是相机，默认二者都有
      success: function (res) {
        // 返回选定照片的本地文件路径列表，tempFilePath可以作为img标签的src属性显示图片
        var tempFilePaths = res.tempFilePaths;
        // var mode = parseFloat(e.currentTarget.dataset.current);
        console.log('shangchuan:' + tempFilePaths)
        console.log(e.currentTarget.dataset.which);
        _this.setData({
          imageFixed: true,
          imageSrc: tempFilePaths.join(),
          imageNum: e.currentTarget.dataset.which
        })
        _this.cropper.getImg(tempFilePaths);
      }
    })
    
  },
  submit(e){
    console.log(e);
    this.setData({ headImg:e.detail})
  }
})