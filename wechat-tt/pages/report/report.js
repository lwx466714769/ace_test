// pages/report/report.js
import urls from '../../utils/urls.js';
import { uploadImages, fetch, toContentParts } from '../../utils/utils.js';
Page({

  /**
   * 页面的初始数据
   */
  data: {
    images:[]
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (ops) {
    console.log(ops)
    this.setData({reportType:ops.type,reportedObjectId:ops.id})
  },
  addImages() {
    let _this = this;
    let { images } = this.data;
    wx.chooseImage({
      count:9-images.length,
      success: function ({ tempFilePaths }) {
        uploadImages(tempFilePaths, function (imgs) {
          let newImg = [...images, ...imgs];
          _this.setData({ images: newImg })
          console.log(_this.data.images)
        }, function ({ itemUrl, filePath }) {
          console.log(itemUrl);
        });
      }
    })
  },
  delImages(e) {
    const { index } = e.currentTarget.dataset;
    const { images } = this.data;
    const delImgs = images.filter((item,i) => i !== index);
    this.setData({ images: delImgs });
  },
  modifyArea(e) {
    const textarea = e.detail.value;
    this.setData({
      textarea
    })
  },
  submit() {
    let _this = this;
    let area;
    const { images, textarea } = this.data;
    if (!textarea) {
      wx.showToast({
        title: '请输入问题描述',
        icon: 'none'
      })
      return;
    }
    if (images.length < 1) {
      wx.showToast({
        title: '请上传图片',
        icon: 'none'
      })
      return;
    }
    this.toSubmit();
  },
  toSubmit(area) {
    const { images, textarea,reportType,reportedObjectId} = this.data;
    fetch({
      url:urls.report,
      method:'POST',
      json:true,
      data:{
        reportType,
        reportedObjectId,
        remarks:textarea,
        images
      },
      success:body=>{
        wx.showToast({
          title: '举报成功',
        })
        setTimeout(()=>{
          wx.navigateBack();
        },300)
        
      }
    })
  },
      
})