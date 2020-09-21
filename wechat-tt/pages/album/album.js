// club/album/album.js
import urls from '../../utils/urls.js';
import { fetch, formatDate, uploadImages, needJoin, isClubMember, getQrcode,login } from '../../utils/utils.js'
import constv from '../../const.js'
Page({

  /**
   * 页面的初始数据
   */
  data: {
    page: 0,
    count: 10,
    showAll:'',
    albums: [],
    filterList: [
      { index: 0, name: '按更新时间',order:'updateAt' },
      { index: 1, name: '按创建时间',order:'createAt'},
      { index: 2, name: '按相册名称',order:'name' }
    ],
    showFilter: false,
    curFilter: 0,
    order:'updateAt',
    images:[],
    clubId:constv.cid,
    shareContent:null
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (ops) {
    this.initPage();
  },
  initPage(){
    this.getPhotos();
    this.getAlbums();
  },
  onShow(){
    const { joinClubState,isDeleteUpdata} = this.data;
    if(joinClubState){
      this.getAlbums(true);
    }
    if (isDeleteUpdata) {
      this.getPhotos();
      this.getAlbums(true);
    }
  },
  onReachBottom() {
    let { page, showAll } = this.data;
    if (!showAll||showAll=='加载中...') {
      this.setData({ page:page+1,showAll:true },
          // this.getAlbums
      );
    }
  },
  getPhotos() {
    const { clubId} = this.data;
    const url=`${urls._verify}/album/${clubId}/photo/1`
    const success = body => {
      this.setData({ photos: body.content,totalPhotoCount: body.total});
    }
    const fail = () => {
      wx.showToast({
        title: '获取信息失败',
        icon: 'none'
      })
    }
    return fetch({ url,success, fail, loading: '加载中...' })
  },
  getAlbums(refresh = false) {
    const { clubId, page, count, albums,order } = this.data;
    let p = refresh ? 0 : page;
    const data = { page: p, count:8,order }
    const url=`${urls._verify}/album/${clubId}/type/1`
    const success = body => {
      let shareContent = {};
      shareContent.cover = body.length > 0 ? body[0].cover : '/images/share-img.jpg';
      shareContent.total = body.length;
      shareContent.type = 'album';
      isClubMember(clubId).then((status) => {
        this.setData({ isClubMember: status })
      })
      if (body.length == 0) {
          this.setData({ showAll: true })
        };
      body.map(item=>{
        item.createAt = formatDate(item.createAt,'.');
        item.updateAt = formatDate(item.updateAt, '.');
        return item;
      })
      let list = refresh ? body : [...albums, ...body];
      this.setData({ albums: list, shareContent });
    }
    const fail = () => {
      wx.showToast({
        title: '获取信息失败',
        icon: 'none'
      })
    }
    return fetch({ url,data, success, fail, loading: '加载中...' })
  },
  showFilter() {
    const { showFilter } = this.data;
    this.setData({ showFilter: !showFilter, curFilter: 0 });
  },
  changeType(e) {
    const { index,order } = e.currentTarget.dataset;
    this.setData({ curFilter: index,showFilter:false,order,albums:[]},this.getAlbums);
  },
  addImages(e) {
    wx.showToast({
      title: '此功能还未开放',
      icon: 'none'
    })
    return;
    let _this = this;
    const { clubId} = this.data;
    const {userId} = wx.getStorageSync('user');
    const albumId = e.currentTarget.dataset.id;
    if(userId){
      wx.chooseImage({
        count:9,
        success: function ({ tempFilePaths }) {
          uploadImages(tempFilePaths, function (albums) {
            _this.uploadAlbum(albums, albumId);
          }, function ({ itemUrl, filePath }) {})
        }
      })
    }else{
      login(e,()=>{
        this.addImages(e);
      })
    }
    
  },
  uploadAlbum(albums,albumId) {
    const {clubId} = this.data;
    const {userId} = wx.getStorageSync('user');
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
          this.setData({ page: 0, albums:[]},this.initPage);
        }, 2000)
      }
    })
  },
  goAlbumDetail(e){
    const {type} = e.currentTarget.dataset;
    const id = e.currentTarget.dataset.id;
    let albumId = id?id:'';
    const {clubId} = this.data;
    wx.navigateTo({
      url: `/pages/album-detail/album-detail?type=photo&clubId=${clubId}&albumId=${albumId}`,
    })
  },
  showShare() {
    const { shareContent,clubId } = this.data;
    getQrcode('ALBUMLIST', clubId).then((qrcode) => {
      shareContent.qrcode = qrcode;
      this.setData({shareContent})
      this.share.showShare();
    })
  },
  onShareAppMessage(res) {
    const { shareContent } = this.data;
    let imageUrl = shareContent.cover||'/images/share-img.jpg';
    let title = 'TripleT机车，专注青少年汽车主题营地教育与儿童汽车文化普及推广...';
    let path = `/pages/album/album`;
    return { title, path, imageUrl}
  },
  onReady(){
    this.share = this.selectComponent('#share');
  }
})