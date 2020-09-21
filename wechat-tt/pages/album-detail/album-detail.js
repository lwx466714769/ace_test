// club/album-detail/album-detail.js
import urls from '../../utils/urls.js';
import { fetch, formatDate, uploadImages, getQrcode,login } from '../../utils/utils.js'
import constv from '../../const.js'
Page({

  /**
   * 页面的初始数据
   */
  data: {
    page: 0,
    count: 32,
    showAll:'加载中...',
    photos:[],
    showSwiper:false,
    curSwiperIndex:0,
    images:[],
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (ops) {
    let albumId;
    if (ops.scene) {
      albumId = parseInt(ops.scene);
    } else {
      albumId = ops.albumId;
    }
    this.setData({albumId})
    const {userId} = wx.getStorageSync('user');
    this.setData({userId,clubId: constv.cid,type: ops.type},this.getPhotos);  
  },
  onShow(){
    const { isUpdate } = this.data;
    if (isUpdate) {
      this.setData({ page:0,photos:[]}, this.getPhotos);
    }
  },
  onHide() {
    this.setData({ isUpdate: false });
  },
  onReachBottom() {
    let { page, showAll,type } = this.data;
    if(type == 'photo'){
      if (!showAll||showAll=='加载中...') {
        this.setData({ page:page+1,showAll:'加载中...' },this.getPhotos);
      }
    }
    
  },
  getPhotos(refresh = false) {
    const { clubId, page, count, photos,type,albumId } = this.data;
    let url;
    if(type=='photo'){
      url=`${urls._verify}/album/${clubId}/photo/1`
    }else{
      url=`${urls._verify}/album/photos/${albumId}`
    }
    let p = refresh ? 0 : page;
    const data = { pageNo: p, pageSize:count }
    const success = body => {
      let photoList;
      let total;
      if(type=='photo'){
        photoList = body.content;
        total = body.total;
      }else{
        photoList = body.photos;
        total = body.photoCount;
      }
      let shareContent={};
      shareContent.cover = photoList.length > 0 ? photoList[0].url : '/images/share-img.jpg';
      shareContent.total = total;
       if (photoList.length == 0||photoList.length<30){
        this.setData({showAll:true});
       }
      let list = refresh ? photoList : [...photos, ...photoList];
      if(type=='album'){
        body.createAt = formatDate(body.createAt, '.');
        body.updateAt = formatDate(body.updateAt, '.');
        this.setData({createAt:body.createAt,updateAt:body.updateAt});
      }
      if(body.name){
        this.setData({photoName: body.name})
      }
      photoList.map(item=>{
        item.createAt = formatDate(item.createAt, '.');
      })
      this.setData({ photos: list, totalPhotoCount: total,shareContent});
    }
    const fail = () => {
      wx.showToast({
        title: '获取信息失败',
        icon: 'none'
      })
    }
    return fetch({ url,data,success, fail, loading: '加载中...' })
  },
  previewPhoto(e){
    const {photos} = this.data;
    const {index} = e.currentTarget.dataset;
    // let photoSwiperLength = 30;
    // let photos2 = [...photos];
    // let tempPrePhotos = photos2.splice(0, index);
    // let prePhotos, curIndex;
    // if (index < photoSwiperLength) {
    //   prePhotos = [...tempPrePhotos];
    //   curIndex = tempPrePhotos.length;
    // } else {
    //   prePhotos = tempPrePhotos.splice(tempPrePhotos.length - photoSwiperLength);
    //   curIndex = photoSwiperLength;
    // }
    let curPhotos = [...photos]; //[...prePhotos, ...photos2.splice(0, photoSwiperLength)];
    let curPhoto = curPhotos[index];
    let curPage = photos.findIndex((item) => item.photoId == curPhoto.photoId);
    this.setData({ curSwiperIndex: index, showSwiper: true, curPhotos, curPhoto, curPage });
  },
  hideSwiper(e){
    console.log(e);
    if(e.type == 'tap'){
      this.setData({showSwiper:!this.data.showSwiper})
    }
  },
  swiperChange(e){
    console.log(e);
    let { photos, curPhotos } = this.data;
    const index = e.detail.current;
    // 解决多照片预览，ios崩溃
    let curPhoto = curPhotos[index];
    let curPage = photos.findIndex((item) => item.photoId == curPhoto.photoId);
    this.setData({ curPhoto, curSwiperIndex: index, curPhotos, curPage })
  },
  previewImage(e){
    const {url} = e.currentTarget.dataset;
    console.log(url);
    const {photos} = this.data;
    let urls = [];
    photos.map(item=>{
      urls.push(item.url);
    })
    // wx.previewImage({
    //   urls: urls,
    //   current:url
    // })
    // this.setData({showSwiper:false})
  },
  //举报
  report(e) {
    const { userId } = wx.getStorageSync('user');
    if (userId) {
      const { id } = e.currentTarget.dataset;
      const data={
        reportType:'PHOTO',
        reportedObjectId:id,
        userId
      }
      fetch({
        url:`${urls.reports}`,
        method: 'POST',
        data,
        json:true,
        success: body => {
          wx.showToast({
            title: '举报成功',
          })
        }
      })
    }else{
      login(e,()=>{
        this.report(e);
      })
    }
  },
  addImages(e) {
    wx.showToast({
      title: '此功能还未开放',
      icon: 'none'
    })
    return;
    const {clubId} = this.data;
    const {userId} = wx.getStorageSync('user');
    if(userId){
      let _this = this;
      wx.chooseImage({
        count: 9,
        success: function ({ tempFilePaths }) {
          uploadImages(tempFilePaths, function (albums) {
            _this.uploadAlbum(albums);
          }, function ({ itemUrl, filePath }) { })
        }
      })
    }else{
      login(e,()=>{
        this.addImages(e);
      })
    }
    
  },
  uploadAlbum(albums) {
    const { userId } = wx.getStorageSync('user');
    const { clubId,albumId} = this.data;
    if (albums.length < 1) {
      wx.showToast({
        title: '您还没有上传照片',
        icon: 'none'
      })
      return;
    }
    fetch({
      url:`${urls._verify}/album/photo/${clubId}/${albumId}`,
      data: { userId,urls: albums },
      method: 'POST',
      json: true,
      loading: '上传中...',
      success: body => {
        wx.showToast({
          title: '上传成功',
        })
        setTimeout(() => {
          this.setData({ page: 0, photos: [] }, this.getPhotos);
        }, 2000)
      }
    })
  },
  // 删除照片
  delPhoto(e){
    const {id} = e.currentTarget.dataset;
    const {photos} = this.data;
    let photo = photos.find(item=>item.photoId == id);
    let albumId=photo.albumId;
    fetch({
      url:`${urls._verify}/album/${albumId}/photo/${id}`,
      method:'DELETE',
      loading:'加载中...',
      success:body =>{
        wx.showToast({
          title: '删除成功',
        })
        let photo = photos.filter(item=>item.photoId != id);
        this.setData({photos:photo});
        let pages = getCurrentPages();
        var prePages = pages[pages.length - 2];
        prePages.setData({ isDeleteUpdata: true });
        setTimeout(()=>{
          this.setData({ showSwiper:false});
        },2000)
      }
    })
  },
  showShare() {
    const { shareContent, albumId } = this.data;
    getQrcode('ALBUM', albumId).then((qrcode) => {
      shareContent.qrcode = qrcode;
      this.setData({ shareContent })
      this.share.showShare();
    })
  },
  onShareAppMessage(res) {
    const { shareContent,albumId } = this.data;
    let imageUrl = shareContent.cover || '/images/share-img.jpg';
    let title = 'TripleT机车，专注青少年汽车主题营地教育与儿童汽车文化普及推广...';
    let path = `/pages/album-detail/album-detail?albumId=${albumId}`;
    return { title, path, imageUrl }
  },
  onReady() {
    this.share = this.selectComponent('#share');
  }
})