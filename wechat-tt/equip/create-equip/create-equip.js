// equip/my-equip-new/my-equip-new.js
import urls from '../../utils/urls.js';
import { fetch, uploadImages } from '../../utils/utils.js'
Page({

  /**
   * 页面的初始数据
   */
  data: {
    isFrom: 'myDetail',
    albumId: '',
    photos: [],
    clubs: [],
    isOnce: false,
    showAll: '加载中...',
    moveTop:'',
    animationData:{},
    showPhoto:false,
    showSwiper: false,
    curSwiperIndex: 0,
    isScroll:false,
    appealContent:[],
    createSuccess:false
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (ops) {
    console.log(ops);
    const {nickname,avatar,userId} = wx.getStorageSync('user');
    const appealContent = wx.getStorageSync('appealContent');
    this.setData({appealContent});
    console.log(this.data.appealContent);
    if (ops.createFrom) {
      this.setData({ createFrom: ops.createFrom });
    }
    wx.getSystemInfo({
      success: res =>{
        console.log(res);
        this.setData({screenHeight:res.screenHeight,windowHeight:res.windowHeight});
      },
    });
    // 创建的方式不同，数据不同，
    // 有品牌时
    // let {appealContent} = this.data;
    if(ops.brandId){
      this.setData({
        carTypeId: ops.carTypeId,
        carTypeName: ops.carTypeName,
        brandId: ops.brandId,
        brandName: ops.brandName
      });
      // let obj = { name: '品牌', value: ops.brandName, type: 'TEXT', prescribedType: 'NOTUPDATE' };
      // appealContent.push(obj);
    }
    // 有车系时
    if(ops.seriesId){
      this.setData({
        seriesId: ops.seriesId,
        seriesName: ops.seriesName
      });
      // let obj = { name: '车系', value: ops.seriesName, type: 'TEXT', prescribedType: 'NOTUPDATE' }
      // appealContent.push(obj);
    }
    this.setData({
      isOnce: true,
      nickname,
      avatar,
      userId,
    });
  },
  onHide() {
    this.setData({ isUpdate: false, isOnce: false })
  },
  onUnload() {
    wx.removeStorageSync('appealContent');
    
    const { createFrom, createSuccess} = this.data;
    if (!createSuccess) return;
    // 从车系、无品牌，其它类型无品牌创建装备的返回
    if (createFrom == 'model' || createFrom == 'noBrand' || createFrom == 'otherNoBrand') {
      wx.navigateBack({
        delta: 3
      })
    } else if (createFrom == 'brand'||createFrom == 'other') {
      wx.navigateBack({
        delta: 2
      })
    }else{
      wx.navigateBack({delta: 1})
    }
  },
  // 上传装备背景图
  uploadCarImg() {
    const { equipDetail } = this.data;
    let _this = this;
    var count = 1;
    wx.chooseImage({
      count: 1,
      success: function ({ tempFilePaths }) {
        uploadImages(tempFilePaths, function (imgUrl) {
          _this.setData({background:imgUrl[0]})
        })
      },
    })
  },

  // 上传相册照片
  addImages() {
    let _this = this;
    wx.chooseImage({
      count: 9,
      success: function ({ tempFilePaths }) {
        uploadImages(tempFilePaths, function (img) {
          let {photos} = _this.data;
          let imgs = [...photos,...img];
          console.log(imgs);
          _this.setData({photos:imgs})
        }, function ({ itemUrl, filePath }) {

        });
      }
    })
  },
  previewPhoto(e) {
    const { photos } = this.data;
    const { index } = e.currentTarget.dataset;
    let curPhoto = photos[index];
    this.setData({ curSwiperIndex: index, showSwiper: true, curPhoto });
  },
  hideSwiper() {
    this.setData({ showSwiper: false })
  },
  previewImage(e) {
    const { url } = e.currentTarget.dataset;
    console.log(url);
    const { photos } = this.data;
    let urls = [];
    photos.map(item => {
      urls.push(item.url);
    })
    wx.previewImage({
      urls: urls,
      current: url
    })
  },
  //获取相册
  getAlbum(equipId) {
    fetch({
      url: `${urls._albums}/${equipId}/type/2`,
      success: body => {
        console.log(body);
        this.setData({ albumId: body[0].albumId });
        this.uploadPhoto(body[0].albumId,equipId);
      }
    })
  },
  // 上传照片
  uploadPhoto(albumId,equipId) {
    const { userId } = wx.getStorageSync('user');
    let { photos } = this.data;
    fetch({
      url: `${urls._albums}/photo/${equipId}/${albumId}`,
      method: 'POST',
      data: {
        urls: [...photos],
        userId
      },
      json: true,
      success: body => {
        wx.hideLoading();
        wx.showToast({
          title: '创建成功',
        })
        setTimeout(()=>{
          wx.navigateBack()
        })
      }
    })
  },
  // 删除照片
  deletePhoto(e) {
    wx.showModal({
      content: '确认删除？',
      success: res => {
        if (res.confirm) {
          let { albumId, photos } = this.data;
          const {index} = e.currentTarget.dataset;
          photos = photos.filter((item,i) => i != index);
          this.setData({ photos });
        }
      }
    })
  },
  
  changeName(e) {
    console.log(e);
    const curIndex = e.currentTarget.dataset.index;
    const value = e.detail.value;
    let { appealContent } = this.data;
    let rideType = appealContent.find((item, index) => index == curIndex);
    rideType.name = value;
    this.setData({ appealContent });
  },
  changeContent(e) {
    const curIndex = e.currentTarget.dataset.index;
    const value = e.detail.value;
    let { appealContent } = this.data;
    let rideType = appealContent.find((item, index) => index == curIndex);
    rideType.value = value;
    this.setData({ appealContent });
  },
  addRideType() {
    const { appealContent } = this.data;
    console.log(appealContent);
    let rideType = { name: '', value: '', type: 'TEXT', prescribedType: 'NORMAL' };
    appealContent.push(rideType);
    this.setData({ appealContent });
  },
  delRideType(e) {
    const curIndex = e.currentTarget.dataset.index;
    let { appealContent } = this.data;
    appealContent = appealContent.filter((item, index) => index != curIndex);
    this.setData({ appealContent });
  },
  // 保存
  submit() {
    const { appealContent,background,photos,carTypeId,carTypeName,brandId,brandName,seriesId,seriesName} = this.data;
    const {userId} = wx.getStorageSync('user');
    if(!background){
      return this.showMessage('封面图片不能为空');
    }else if(photos.length<2){
      return this.showMessage('需至少上传两张装备照片');
    }
    let name = appealContent.find(item => item.name == '');
    let value = appealContent.find(item => item.value == '');
    if (name) {
      wx.showToast({
        title: '自定义名称不能为空',
        icon: 'none'
      })
      return;
    }
    if (value) {
      wx.showToast({
        title: '自定义内容不能为空',
        icon: 'none'
      })
      return;
    }
    let data = {carTypeId,carTypeName,brandId,brandName,seriesId,seriesName,background,appealContent,userId};
    wx.showLoading({
      title: '创建中...',
      mask:true
    })
    fetch({
      url: urls.equip,
      method: 'POST',
      json:true,
      data: data,
      loading:'加载中...',
      success: body => {
        this.setData({ equipId: body.id, createSuccess:true});
        this.getAlbum(body.id);
      }
    })
  },
  showMessage(msg){
    wx.showToast({
      title: msg,
      icon:'none'
    })
    return;
  },
  scrollEvent(e){
    console.log(e);
    this.setData({isScroll:true})
    setTimeout(()=>{
      this.setData({isScroll:false})
    },400)
  },
  touchStart(e) {
    console.log(e);
    let startY = e.touches[0].clientY;
    this.setData({ startY });
  },
  touchMove(e) {
    const { startY, moveTop } = this.data;
    let moveY = e.touches[0].clientY;
    const { offsetTop } = e.currentTarget;
  },
  touchEnd(e) {
    let _this = this;
    console.log(e);
    const { isScroll } = this.data;
    if (isScroll) return false;
    let endY = e.changedTouches[0].clientY;
    const { offsetTop } = e.currentTarget;
    const { startY } = this.data;
    if (startY > endY + 5) {
      let query1 = wx.createSelectorQuery();
      query1.select('#detailCon').boundingClientRect();
      query1.exec(function (res) {
        console.log(res);
        _this.setData({ detailConHeight: res[0].height });
      })

      let query = wx.createSelectorQuery();
      query.select('#detailHead').boundingClientRect();
      query.exec(function (res) {
        console.log(res);
        _this.setData({ detailHeight: res[0].height });
      })
      this.animationTop();
      this.setData({ showPhoto: false });
    } else if (startY + 5 < endY) {
      //this.animationBottom();
      setTimeout(() => {
        this.setData({ showPhoto: true })
      }, 500)
    }
  },
  showPhoto() {
    console.log('showPhoto')
    this.animationTop();
    this.setData({ showPhoto: !this.data.showPhoto });
  },
  animationTop() {
    let animation = wx.createAnimation({
      timingFunction: 'ease-in'
    })
    animation.bottom().step();
    this.setData({
      animationData: animation.export()
    })
  },
})