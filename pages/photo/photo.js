// pages/photo/photo.js
import urls from '../../utils/urls.js';
import { fetch, formatDate, uploadImages, getQrcode,login,tapDownloadImg } from '../../utils/utils.js'
// import constv from '../../const.js'
Page({

  /**
   * 页面的初始数据
   */
  data: {
    page:0,
    count:32,
    albumId:4423,
    type:'album',
    photos:[]
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.getPhotos();
  },
  getPhotos(refresh = false) {
    const { clubId, page, count, photos,type,albumId } = this.data;
    let url;
    if(type=='photo'){
      url=`https://testapi.acegear.com/verify/album/${clubId}/photo/1`
    }else{
      url=`https://testapi.acegear.com/verify/album/photos/${albumId}`
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
      shareContent.cover = photoList.length > 0 ? photoList[0].url : '/images/share-img.png';
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
        item.listSrc = item.url;
        item.previewSrc = item.url;
        item.src = item.url.replace('/w700_1','');
        item.downloadUrl = item.url.replace('/w700_1','');
      })
      console.log(photoList)
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
  like(){

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