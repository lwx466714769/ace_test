// equip/equip/equip.js
import urls from '../../utils/urls.js';
import { fetch, login, getQrcode, shareDrawClub } from '../../utils/utils.js'
import constv from '../../const.js'
Page({
  /**
   * 组件的初始数据
   */
  data: {
    isChecked:false,
    page:0,
    count:10,
    showAll: '加载中...',
    equipList:[],
    equipAuditStatus:'',
    clubId: constv.cid
  },

  /**
   * 组件的方法列表
   */
  onLoad(){
    this.getData();
  },
  onShow(){
    const { equipUpdate} = this.data;
    if (equipUpdate){
      this.getData(true);
    }
  },
  onHide(){
    this.setData({equipUpdate:false})
  },
  onReachBottom(){
    const { page, showAll } = this.data;
    if (showAll == '加载中...') {
      this.setData({ page: page + 1 });
      const { carTypeId, brandId, seriesId, equipAuditStatus } = this.data;
      this.getData(false, carTypeId, brandId, seriesId, equipAuditStatus);
    }
  },
  getData(refresh = false, carTypeId1 = '', brandId1 = '', seriesId1 = '', equipAuditStatus1='') {
    this.setData({ carTypeId: carTypeId1, brandId: brandId1, seriesId: seriesId1,equipAuditStatus:equipAuditStatus1})
    if (equipAuditStatus1==''){
      this.setData({isChecked:false})
    }else{
      this.setData({ isChecked: true })
    }
    const { clubId, page, count} = this.data;
    const { userId } = wx.getStorageSync('user');
    let p = page;
    if(refresh){
      p = 0;
      this.setData({page:0,equipList:[],showAll:'加载中...'})
    }
    const { carTypeId, brandId, seriesId, equipAuditStatus} = this.data;
    let data = {
      userId:userId||'',
      clubId,
      carTypeId: carTypeId||'',
      brandId: brandId||'',
      seriesId: seriesId||'',
      equipAuditStatus: equipAuditStatus||'',
      page:p,
      count
    }
    fetch({
      url:`${urls.equip}/clubEquip`,
      data:data,
      loading:'加载中...',
      success:body =>{
        wx.stopPullDownRefresh();
        const { equipList} =this.data;
        if (body.length == 0||body.length<count-3) {
          this.setData({ showAll: true })
        }
        body.map(item=>{
          let collectionNumber = item.likeNumberVO.collectionNumber;
          let stepNumber = item.likeNumberVO.stepNumber;
          let shareNumber = item.likeNumberVO.shareNumber;
          if (collectionNumber >= 1000) {
            collectionNumber = Math.ceil(collectionNumber / 100) / 10 + 'k';
          }
          if (stepNumber >= 1000) {
            stepNumber = Math.ceil(stepNumber / 100) / 10 + 'k';
          }
          if (shareNumber >= 1000) {
            shareNumber = Math.ceil(shareNumber / 100) / 10 + 'k';
          }
          item.collectionNumberK = collectionNumber;
          item.stepNumberK = stepNumber;
          item.shareNumberK = shareNumber;
          return item;
        })
        let list = [...equipList,...body];
        this.setData({equipList:list})
      }
    })
  },
  changeCheck(){
    const { clubId, page, count, isChecked } = this.data;
    if(isChecked){
      this.setData({ equipAuditStatus: '',isChecked:false })
    }else{
      this.setData({ equipAuditStatus: 'AUDIT',isChecked:true}) 
    }
    const { carTypeId, brandId, seriesId, equipAuditStatus } = this.data;
    this.getData(true, carTypeId, brandId, seriesId, equipAuditStatus);
    
  },
  shareDrawClub() {
    let ctx = wx.createCanvasContext('myCanvas', this);
    const { curEquip } = this.data;
    if (curEquip.clubLogo) {
      shareDrawClub(ctx, curEquip.background, curEquip.clubLogo, curEquip.clubName, (img) => {
        this.setData({ shareImg: img });
      }, '/images/icon-equip-stamp.png')
    }
  },
  showShare(e){
    const {id} = e.currentTarget.dataset;
    this.getEquipDetail(id).then((appealContent)=>{
      const {equipList} = this.data;
      let curEquip = equipList.find(item => item.equipId == id);
      curEquip.appealContent = appealContent;
      this.setData({curId:id});
      getQrcode('EQUIP', id,'equip/my-equip-new/my-equip-new').then((qrcode) => {
        curEquip.qrcode = qrcode;
        this.setData({ curEquip},()=>{
          this.shareDrawClub();
          this.share.showShare();
        })
      })
    })
  },
  // 获取装备详情
  getEquipDetail(equipId) {
    const { userId } = wx.getStorageSync('user');
    let _this = this;
    return new Promise((resolve,reject)=>{
      fetch({
        url: `${urls.equip}/${equipId}`,
        data:{
          userId:userId?userId:''
        },
        success: body => {
          resolve(body.appealContent);
        },
      })
    })
    
  },
  // 删除装备
  delEquip(e) {
    const equipId = e.currentTarget.dataset.id;
    wx.showModal({
      content: '确认删除？',
      success: res => {
        if (res.confirm) {
          fetch({
            url: `${urls.equip}/${equipId}`,
            method: 'DELETE',
            success: body => {
              wx.showToast({
                title: '删除成功',
              })
              this.getData(true);
            }
          })
        }
      }
    })
  },
  //收藏
  likeEvent(e) {
    const _this = this;
    let type = '';
    let curId = '';
    if (e == 'SHARE') {
      curId = this.data.curId;
      type = 'SHARE';
    } else {
      type = e.currentTarget.dataset.type;
      curId = e.currentTarget.dataset.id;
    }
    const { equipList } = this.data;
    let curEquip = equipList.find(item => item.equipId == curId);
    const { userId } = wx.getStorageSync('user');
    if (type=='SHARE'||userId) {
      const url = urls.statistics;
      const data = {
        type: 'EQUIP',
        userId: userId,
        likedObjectId: curEquip.equipId,
        likeStepType: 'COLLECTION',
        clubId:constv.cid
      }
      console.log(data);
      const success = body => {
        curEquip.likeNumberVO.collectionState = !curEquip.likeNumberVO.collectionState;
        // curEquip.likeNumberVO.likeNumber = body.likeNumber;
        // curEquip.likeNumberVO.stepNumber = body.stepNumber;
        // curEquip.likeNumberVO.shareNumber = body.shareNumber;
        let collectionNumber = body.collectionNumber;
        let stepNumber = body.stepNumber;
        let shareNumber = body.shareNumber;
        if (body.collectionNumber >= 1000) {
          collectionNumber = Math.ceil(body.collectionNumber / 100) / 10 + 'k';
          }
        if (body.stepNumber >= 1000) {
          stepNumber = Math.ceil(body.stepNumber / 100) / 10 + 'k';
          }
        if (body.shareNumber >= 1000) {
          shareNumber = Math.ceil(body.shareNumber / 100) / 10 + 'k';
          }
        curEquip.collectionNumberK = collectionNumber;
        curEquip.stepNumberK = stepNumber;
        curEquip.shareNumberK = shareNumber;
        this.setData({ equipList });
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
  goEquipDetail(e) {
    const { clubId, signItems, member, club } = this.data;
    const { id,clubName,clubLogo } = e.currentTarget.dataset;
    wx.navigateTo({
      url: `/equip/my-equip-new/my-equip-new?id=${id}&clubId=${clubId}&clubName=${clubName}&clubLogo=${clubLogo}`,
    })
  },
  toMyEquip(e) {
    const { userId } = wx.getStorageSync('user');
    if (userId) {
      wx.navigateTo({
        url: `/equip/my-equip/my-equip`,
      })
    } else {
      login(e, () => {
        this.toMyEquip(e);
      })
    }
  },
  onReady() {
    this.share = this.selectComponent('#share');
  },
  onShareAppMessage(res){
    const { curEquip,shareImg } = this.data;
    let equipTitle = curEquip.brandName || curEquip.appealContent[0].value + ' ' + curEquip.appealContent[1].value;
    let equipPath = `/equip/my-equip-new/my-equip-new?id=${curEquip.equipId}&isShare=true&clubId=${curEquip.clubId}&clubName=${curEquip.clubName}&clubLogo=${curEquip.clubLogo}`;
    let equipImageUrl = shareImg || curEquip.background;
    this.likeEvent('SHARE');
    return { title: equipTitle, path: equipPath, imageUrl: equipImageUrl }
  }
})