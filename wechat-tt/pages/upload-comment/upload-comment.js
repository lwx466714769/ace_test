import urls from '../../utils/urls.js';
import { uploadImages, fetch, toContentParts, msgCheck } from '../../utils/utils.js';
Page({
  data: {
    images: [],
    lock: false,
    textarea: '',
    isSubmit: false
  },
  onLoad(ops) {
    console.log(ops);
    // 活动评论,帖子评论，投票、攒局评论
    this.setData({ isFrom: ops.isFrom, id: ops.id })
  },
  onHide() {
    this.setData({ isSubmit: false })
  },
  onUnload() {
    this.setData({ isSubmit: false })
  },
  // 上传图片
  addImages() {
    let _this = this;
    let { images } = this.data;
    var count = 8 - images.length;
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
        _this.setData({ lock: true, images: [...images, ...tempImages] });

        uploadImages(tempFilePaths, function () {
          _this.setData({ lock: false })
        }, function ({ itemUrl, filePath }) {
          console.log(itemUrl);
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
  modifyInput(e) {
    const textarea = e.detail.value;
    this.setData({
      textarea
    })
  },
  submit() {
    let _this = this;
    const { images, textarea, lock, isFrom } = this.data;
    if (images.length < 1 && !textarea) {
      wx.showToast({
        title: '说点什么吧...',
        icon: 'none'
      })
      return;
    }
    if (textarea && textarea.length > 0) {
      msgCheck(textarea).then(() => {
        this.toSubmitParty();
      })
    }else{
      this.toSubmitParty();
    }
  },
  toSubmitParty() {
    const { userId } = wx.getStorageSync('user');
    const { id, images, textarea, isSubmit, isFrom } = this.data;
    let imgs = images.map(item => {
      return item.src;
    })
    console.log(imgs)
    const url = urls.reply;
    const data = {
      replyRelateType: isFrom,
      relateId: id,
      userId,
      contents: textarea,
      images: imgs,
    };
    if (isSubmit) return;
    this.setData({ isSubmit: true });
    const success = body => {
      let pages = getCurrentPages();
      var prePages = pages[pages.length - 2];
      prePages.setData({ isUpdate: true });
      wx.showToast({
        title: '评论成功'
      })
      setTimeout(() => {
        wx.navigateBack()
      }, 300)
    }
    const fail = body => {
      wx.navigateBack();
    }
    fetch({ url, data, success, fail, method: 'POST', json: true, loading: '正在提交' })
  }
})