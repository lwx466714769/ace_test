import urls from '../../utils/urls.js';
import { uploadImages, fetch, toContentParts, toImages, toVideos, uploadVideo, toVideoContent, msgCheck } from '../../utils/utils.js';
Page({
  data: {
    images: [],
    textarea: '说点什么吧...',
    postId: '',
    uploadType: '',
    isSubmit: false
  },
  onLoad(ops) {
    const clubId = ops.clubId;
    if (ops.type) {
      this.setData({ uploadType: ops.type });
    }
    if (ops.albumId) {
      this.setData({ albumId });
    }
    this.setData({ clubId })
  },
  onHide() {
    this.setData({ isSubmit: false });
  },
  onUnload() {
    this.setData({ isSubmit: false });
  },
  addImages() {
    let _this = this;
    let { images, albums } = this.data;
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
  modifyInput(e) {
    const textarea = e.detail.value;
    this.setData({
      textarea
    })
  },
  submit() {
    let _this = this;
    let area;
    const { images, textarea, uploadType, videoSrc } = this.data;
    if (uploadType == 'video') {
      if (!videoSrc || videoSrc == '') {
        wx.showToast({
          title: '请上传视频',
          icon: 'none'
        })
        return;
      }
    } else {
      if (images.length < 1) {
        wx.showToast({
          title: '请上传图片',
          icon: 'none'
        })
        return;
      }
    }

    if (!textarea) {
      area = '说点什么吧...';
    } else {
      area = textarea;
    }
    msgCheck(area).then(() => {
      _this.toSubmit(area);
    })
    // this.toSubmit(area);
  },

  toSubmit(area) {
    const { submitType, postId, images, clubId, isSubmit, uploadType, videoSrc } = this.data;
    // let contents,type = 2;
    // if (uploadType == 'video'){
    //   contents = toVideoContent(area,videoSrc);
    //   type = 3;
    // }else{
    //   contents = toContentParts(area, images);
    //   type = 2;
    // }
    // const url = `${urls._posts}`;
    // const data = {clubId,type,contents};

    const url = `${urls._posts}`;
    let clubInfo = {
      clubId: clubId,
    }
    let data;
    if (uploadType == 'video') {
      let videos = toVideos(videoSrc);
      let postVideoInfo = {
        text: area,
        video: videos
      }
      data = {
        clubInfo,
        postType: 'VIDEO',
        postVideoInfo
      }
    } else {
      let image = toImages(images);
      let postTextInfo = {
        images: image,
        text: area
      }
      data = {
        clubInfo,
        postType: 'TEXT',
        postTextInfo,
      }
    }
    if (isSubmit) return;
    this.setData({ isSubmit: true });
    const success = body => {
      wx.showToast({
        title: '发表成功',
      })
      let pages = getCurrentPages();
      var prePages = pages[pages.length - 2];
      prePages.setData({ isUpdate: true });
      setTimeout(() => {
        wx.navigateBack()
      }, 1000)
    }
    const fail = body => {
      wx.showToast({
        title: '发贴失败',
        icon: 'none'
      })
    }
    fetch({ url, data, success, fail, method: 'POST', json: true, loading: '正在提交' })
  },
  uploadVideo() {
    wx.chooseVideo({
      success: (res) => {
        console.log(res);
        uploadVideo(res.tempFilePath, (url) => {
          console.log(url);
          this.setData({ videoSrc: url });
        })
      }
    })
  },
  delVideo() {
    this.setData({ videoSrc: '' });
  }
})