// equip/my-equip-new/my-equip-new.js
import urls from '../../utils/urls.js';
import { fetch, uploadImages } from '../../utils/utils.js'
import constv from '../../const.js'
Page({

  /**
   * 页面的初始数据
   */
  data: {
    tabList: [
      { index: 0, name: '相册', render: true },
      { index: 1, name: '详情', render: true },
    ],
    curIndex: 0,
    border: false,
    isFrom: 'myDetail',
    albumId: '',
    photos: [],
    clubs: [],
    isOnce: false,
    page: 0,
    count: 50,
    showAll: '加载中...',
    moveTop:'',
    animationData:{},
    showPhoto:true,
    editEquip:true,
    showSwiper: false,
    curSwiperIndex: 0,
    isScroll:false
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (ops) {
    console.log(ops);
    const curUserId = wx.getStorageSync('user').userId;
    if (ops.createFrom) {
      wx.showToast({
        title: '装备创建成功，请及时补充装备信息',
        icon: 'none',
        duration: 3000
      })
      this.setData({ createFrom: ops.createFrom });
    }
    let equipId;
    if (ops.scene) {
      equipId = parseInt(ops.scene);
    } else {
      equipId = ops.id;
    }
    console.log(equipId);
    wx.getSystemInfo({
      success: res =>{
        console.log(res);
        this.setData({screenHeight:res.screenHeight,windowHeight:res.windowHeight});
      },
    })
    this.setData({ equipId, curUserId, isOnce: true }, this.initPage);
  },
  onShow() {
    const { isUpdate } = this.data;
    if (isUpdate) {
      let pages = getCurrentPages();
      var prePages = pages[pages.length - 2];
      prePages.setData({ equipUpdate: true });
      this.getEquipDetail();
    }
  },
  onHide() {
    this.setData({ isUpdate: false, isOnce: false })
  },
  onReady() {
    this.share = this.selectComponent('#share');
  },
  onUnload() {
    const { createFrom} = this.data;
    // 从车系、无品牌，其它类型无品牌创建装备的返回
    if (createFrom == 'model' || createFrom == 'noBrand' || createFrom == 'otherNoBrand') {
      wx.navigateBack({
        delta: 3
      })
      // 从无车系创建装备的返回
    } else if (createFrom == 'noModel') {
      wx.navigateBack({
        delta: 4
      })
      // 从其它类型选择装备后，直接创建装备的返回
    } else if (createFrom == 'other') {
      wx.navigateBack({
        delta: 2
      })
    }
  },
  onReachBottom() {
    const { curIndex, showAll, page } = this.data;
    if (curIndex == 0 && showAll == '加载中...') {
      this.setData({ page: page + 1 }, this.getEquipPhotos);
    }
  },
  initPage() {
    this.getEquipDetail();
    this.getEquipPhotos();
    this.getAlbum();
  },
  changeTab(e) {
    const { index } = e.currentTarget.dataset;
    this.setData({ curIndex: index });
  },
  // 获取装备详情
  getEquipDetail() {
    let _this = this;
    const { equipId, curUserId, tabList } = this.data;
    const {userId}=wx.getStorageSync('user')
    fetch({
      url: `${urls.equip}/${equipId}`,
      data:userId,
      success: body => {
        if (body.userId == curUserId) {
          const { isOnce } = this.data;
          if (isOnce) {
            tabList.push({ index: 2, name: '认证', render: true });
            this.setData({ tabList });
          }
          this.getChangeClub();
        }
        let likeNumber = body.likeNumberVO.likeNumber;
        let stepNumber = body.likeNumberVO.stepNumber;
        let shareNumber = body.likeNumberVO.shareNumber;
        if (body.likeNumberVO.likeNumber >= 10000) {
          likeNumber = Math.ceil(body.likeNumberVO.likeNumber / 1000) / 10 + '万';
        }
        if (body.likeNumberVO.stepNumber >= 10000) {
          stepNumber = Math.ceil(body.likeNumberVO.stepNumber / 1000) / 10 + '万';
        }
        if (body.likeNumberVO.shareNumber >= 10000) {
          shareNumber = Math.ceil(body.likeNumberVO.shareNumber / 1000) / 10 + '万';
        }
        body.likeNumberK = likeNumber;
        body.stepNumberK = stepNumber;
        body.shareNumberK = shareNumber;
        this.setData({ equipDetail: body, appealContent: body.appealContent});
      },
      fail: body => {
        console.log(body);
        if (body.code == 1901008) {
          this.setData({ delState: true })
        }
      }
    })
  },

  // 编辑详情
  editEquip() {
    this.setData({editEquip:true});
  },
  // 删除装备
  delEquip() {
    wx.showModal({
      content: '确认删除？',
      success: res => {
        if (res.confirm) {
          const { equipId } = this.data;
          fetch({
            url: `${urls.equip}/${equipId}`,
            method: 'DELETE',
            success: body => {
              let pages = getCurrentPages();
              var prePages = pages[pages.length - 3];
              prePages.setData({ equipUpdate: true });
              wx.showToast({
                title: '删除成功',
              })
              setTimeout(function () {
                wx.navigateBack({
                  delta:2
                })
              }, 1000)
            }
          })
        }
      }
    })
  },
  //点赞
  likeEvent(e) {
    console.log(e);
    const _this = this;
    let type = '';
    if (e == 'SHARE') {
      type = 'SHARE';
    } else {
      type = e.currentTarget.dataset.type;
    }
    const { equipId, equipDetail } = this.data;
    if (type == 'LIKE' && equipDetail.likeNumberVO.stepState) {
      wx.showToast({
        title: '您已经踩过了',
        icon: 'none'
      })
      return;
    }
    if (type == 'STEP' && equipDetail.likeNumberVO.likeState) {
      wx.showToast({
        title: '您已经赞过了',
        icon: 'none'
      })
      return;
    }
    const { userId } = wx.getStorageSync('user');
    if (userId) {
      const url = urls.statistics;
      const data = {
        type: 'EQUIP',
        userId: userId,
        likedObjectId: equipId,
        likeStepType: type
      }
      const success = body => {
        if (type == 'LIKE') {
          equipDetail.likeNumberVO.likeState = !equipDetail.likeNumberVO.likeState;
        } else if (type == 'STEP') {
          equipDetail.likeNumberVO.stepState = !equipDetail.likeNumberVO.stepState;
        }
        let likeNumber = body.likeNumber;
        let stepNumber = body.stepNumber;
        let shareNumber = body.shareNumber;
        if (body.likeNumber >= 10000) {
          likeNumber = Math.ceil(body.likeNumber / 1000) / 10 + '万';
        }
        if (body.stepNumber >= 10000) {
          stepNumber = Math.ceil(body.stepNumber / 1000) / 10 + '万';
        }
        if (body.shareNumber >= 10000) {
          shareNumber = Math.ceil(body.shareNumber / 1000) / 10 + '万';
        }
        equipDetail.likeNumberK = likeNumber;
        equipDetail.stepNumberK = stepNumber;
        equipDetail.shareNumberK = shareNumber;
        this.setData({ equipDetail });
      }
      const fail = body => {
        wx.showToast({
          title: '请检查网络',
          icon: 'none'
        })
      }
      fetch({ url, method: 'POST', data, fail, json: true, success })
    } else {
      login(e, () => {
        this.likeEvent(e);
      });
    }
  },
  showEquipShare() {
    this.getEquipQrcode().then(() => {
      this.share.showShare();
    })
  },
  getEquipQrcode() {
    const { equipDetail } = this.data;
    const data = {
      feedType: 'EQUIP',
      relateId: equipDetail.id,
      url: 'equip/my-equip-new/my-equip-new',
      appType: constv.cid
    }
    return new Promise((resolve, reject) => {
      fetch({
        url: `${urls.getCode}`,
        data: data,
        loading: '加载中...',
        success: body => {
          equipDetail.qrcode = body;
          this.setData({ equipDetail });
          resolve();
        },
        fail: body => {
          wx.showToast({ title: body.message, icon: 'none', });
        }
      })
    })
  },
  shareNumTrigger() {
    this.likeEvent('SHARE');
  },
  // 分享给朋友
  onShareAppMessage(res) {
    const { equipDetail, equipId } = this.data;
    let title = equipDetail.brandName + ' ' + equipDetail.seriesName;
    let path = `/equip/my-equip-new/my-equip-new?id=${equipId}`;
    let imageUrl = equipDetail.background;
    this.likeEvent('SHARE');
    return { title, path, imageUrl }
  },
  // 获取认证装备的俱乐部
  getChangeClub() {
    const { equipId } = this.data;
    fetch({
      url: `${urls.equip}/${equipId}/club`,
      loading: '加载中...',
      success: body => {
        this.setData({ clubs: body })
      }
    })
  },
  // 上传装备背景图
  uploadCarImg() {
    const { equipDetail, equipId } = this.data;
    let _this = this;
    var count = 1;
    wx.chooseImage({
      count: 1,
      success: function ({ tempFilePaths }) {
        uploadImages(tempFilePaths, function (imgUrl) {
          fetch({
            url: `${urls.equip}/${equipId}/background`,
            method: 'PUT',
            json: true,
            data: { background: imgUrl[0] },
            success: body => {
              equipDetail.background = imgUrl[0];
              _this.setData({ equipDetail });
            }
          })
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
          wx.showLoading({
            title: '正在上传...',
            mask: true
          })
          _this.uploadPhoto(img);
        }, function ({ itemUrl, filePath }) {

        });
      }
    })
  },
  // 获取装备照片
  getEquipPhotos() {
    const { equipId, page, count, photos, showAll } = this.data;
    fetch({
      url: `${urls._albums}/${equipId}/photo/2`,
      data: { pageNo: page, pageSize: count },
      success: body => {
        if (body.content.length == 0) {
          this.setData({ showAll: true });
        }
        const list = [...photos, ...body.content];
        this.setData({ photos: list })
      }
    })
  },
  //获取相册
  getAlbum() {
    const { equipId } = this.data;
    fetch({
      url: `${urls._albums}/${equipId}/type/2`,
      success: body => {
        console.log(body);
        this.setData({ albumId: body[0].albumId });
      }
    })
  },
  // 上传照片
  uploadPhoto(imgs) {
    const { userId } = wx.getStorageSync('user');
    let { albumId, photos , equipId} = this.data;
    fetch({
      url: `${urls._albums}/photo/${equipId}/${albumId}`,
      method: 'POST',
      data: {
        urls: [...imgs],
        userId
      },
      json: true,
      success: body => {
        wx.hideLoading();
        let newPhotos = [...body, ...photos];
        this.setData({ photos: newPhotos });
      }
    })
  },
  // 删除照片
  deletePhoto(e) {
    wx.showModal({
      content: '确认删除？',
      success: res => {
        if (res.confirm) {
          const { equipId } = this.data;
          let { albumId, photos } = this.data;
          const photoId = e.currentTarget.dataset.id;
          fetch({
            url: `${urls._albums}/${albumId}/photo/${photoId}`,
            method: 'DELETE',
            success: body => {
              photos = photos.filter(item => item.photoId != photoId);
              this.setData({ photos });
            }
          })
        }
      }
    })
  },
  // previewImage(e) {
  //   const { url } = e.currentTarget.dataset;
  //   console.log(url);
  //   const { photos } = this.data;
  //   let urls = [];
  //   photos.map(item => {
  //     urls.push(item.url);
  //   })
  //   wx.previewImage({
  //     urls: urls,
  //     current: url
  //   })
  // },
  touchStart(e){
    console.log(e);
    let startY = e.touches[0].clientY;
    this.setData({ startY});
  },
  touchMove(e){
   // console.log(e);
    const {startY,moveTop} = this.data;
    let moveY = e.touches[0].clientY;
    const {offsetTop} = e.currentTarget;
    // if(offsetTop<200){
    //   this.setData({moveTop:200})
    // }else if(offsetTop>400){
    //   this.setData({moveTop:400})
    // }else{
    //   this.setData({ moveTop: moveTop-(startY-moveY)*2});
    // }
  },
  touchEnd(e){
    let _this = this;
    console.log(e);
    const {isScroll} = this.data;
    if(isScroll) return false;
    let endY = e.changedTouches[0].clientY;
    const { offsetTop } = e.currentTarget;
    const {startY} = this.data;
    if (startY>endY+5){
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
    }else if(startY+5<endY){
      //this.animationBottom();
      setTimeout(()=>{
        this.setData({ showPhoto: true })
      },500)
    }
  },
  showPhoto() {
    console.log('showPhoto')
    this.animationTop();
    this.setData({ showPhoto: !this.data.showPhoto });
  },
  animationTop(){
    let animation = wx.createAnimation({
      timingFunction:'ease-in'
    })
    animation.bottom().step();
    this.setData({
      animationData:animation.export()
    })
  },
  // animationBottom() {
  //   let animation = wx.createAnimation({
  //     timingFunction: 'ease-in'
  //   })
  //   animation.bottom('180rpx').step();
  //   this.setData({
  //     animationData: animation.export()
  //   })
  // },
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
    const { appealContent, equipId} = this.data;
    let name = appealContent.find(item => item.name == '');
    let value = appealContent.find(item => item.value == '');
    if (name) {
      wx.showToast({
        title: '描述名称不能为空',
        icon: 'none'
      })
      return;
    }
    if (value) {
      wx.showToast({
        title: '描述内容不能为空',
        icon: 'none'
      })
      return;
    }
    fetch({
      url: `${urls.equip}/${equipId}/detailInfo`,
      method: 'PUT',
      json: true,
      data: { appealContent },
      success: body => {
        let pages = getCurrentPages();
        var prePages = pages[pages.length - 2];
        prePages.setData({ isUpdate: true });
        wx.showToast({
          title: '修改成功',
        })
        this.setData({editEquip:false});
        setTimeout(() => {
          wx.navigateBack();
        }, 1000)
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
  scrollEvent(e){
    console.log(e);
    this.setData({isScroll:true})
    setTimeout(()=>{
      this.setData({isScroll:false})
    },400)
  }
})