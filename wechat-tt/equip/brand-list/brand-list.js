// equip/add-equip/add-equip.js
import urls from '../../utils/urls.js';
import { fetch } from '../../utils/utils.js'
let letterLineHeight = 0;
Page({

  /**
   * 页面的初始数据
   */
  data: {
    letters:['A','C'],
    currentIndex:0,
    currentId:'id0'
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (ops) {   
    this.setData({ carTypeId: ops.id, carTypeName: ops.carTypeName},this.getBrandList);    
    const { nickname, avatar } = wx.getStorageSync('user');
    this.setData({ nickname, avatar })
  },
  getBrandList(){
    let that = this;
    const id = this.data.carTypeId;
    fetch({
      url:`${urls.equip}/brand/${id}/list`,
      loading: '加载中...',
      success:body =>{
        var brandList = [];
        for (var key in body) {
          var brandObject = new Object();
          brandObject.letter = key;
          brandObject.brand = body[key];
          brandList.push(brandObject);
        }
        console.log(brandList);
        this.setData({brandList});
        
        wx.getSystemInfo({
          success: (res)=>{
            console.log(res);
            letterLineHeight = (res.windowHeight - 120) / brandList.length;
          },
        })
      }
    })
  },
  slideStart(e){
    console.log(e)
    
    let touchY = e.touches[0].clientY;
    let offsetTop = e.currentTarget.offsetTop;
    let index = parseInt((touchY - offsetTop) / 16);
    console.log(index);
    this.setData({currentIndex:index,currentId:'id'+index})
  },
  slideMove(e){

  },
  slideEnd(e){

  },
  goModel(e) {
    const { id, name,background } = e.currentTarget.dataset;
    this.setData({brandId:id,brandName:name,background})
    const { carTypeId,carTypeName } = this.data;
    if (carTypeId == 1 || carTypeId == 2) {
      wx.navigateTo({
        url: `/equip/brand-model/brand-model?brandId=${id}&carTypeId=${carTypeId}&carTypeName=${carTypeName}&brandName=${name}`,
      })
    } else {
      // this.showCreate();
      let appealContent = [
        { name: '品牌', value: name, type: 'TEXT', prescribedType: 'NOTUPDATE' },
      ]
      wx.setStorageSync('appealContent', appealContent);
      wx.navigateTo({
        url: `/equip/create-equip/create-equip?carTypeId=${carTypeId}&carTypeName=${carTypeName}&brandId=${id}&brandName=${name}&createFrom=other`,
      })
    }

  },
  createEquip(e) {
    const { id, name } = e.currentTarget.dataset;
    const { carTypeId, carTypeName } = this.data;
    let appealContent;
    if (carTypeId == 1 || carTypeId == 2) {
      appealContent = [
        { name: '品牌', value: name, type: 'TEXT', prescribedType: 'NOTUPDATE' },
        { name: '车系', value: '', type: 'TEXT', prescribedType: 'NOTDELETE' }
      ]
    }else{
      appealContent = [
        { name: '品牌', value: name, type: 'TEXT', prescribedType: 'NOTUPDATE' }
      ]
    }
    
    wx.setStorageSync('appealContent', appealContent);
    console.log(`/equip/create-equip/create-equip?carTypeId=${carTypeId}&carTypeName=${carTypeName}&brandId=${id}&brandName=${name}&createFrom=brand`)
    wx.navigateTo({
      url: `/equip/create-equip/create-equip?carTypeId=${carTypeId}&carTypeName=${carTypeName}&brandId=${id}&brandName=${name}&createFrom=brand`
    })
  },
  //从无车系创建
  // createEquip() {
  //   const { carTypeId,brandId} = this.data;
  //   fetch({
  //     url: urls.equip,
  //     method: 'POST',
  //     data: { carTypeId,brandId },
  //     json: true,
  //     success: body => {
  //       wx.navigateTo({
  //         url: `/equip/my-equip-detail/my-equip-detail?id=${body.id}&createFrom=other`,
  //       })
  //     }
  //   })
  // },
  goNoBrand(){
    const {carTypeId,carTypeName} = this.data;
    if (carTypeId == 1 || carTypeId == 2) {
      // wx.navigateTo({
      //   url: `/equip/brand-other/brand-other?carTypeId=${carTypeId}`
      // })
      wx.navigateTo({
        url: `/equip/add-ride/add-ride?carTypeId=${carTypeId}&carTypeName=${carTypeName}&type=noBrand&createFrom=otherNoBrand`
      })
    }else{

      wx.navigateTo({
        url: `/equip/add-ride/add-ride?carTypeId=${carTypeId}&carTypeName=${carTypeName}&isFrom=other&createFrom=otherNoBrand`
      })
    }
  },
  showCreate(){
    this.setData({showCreate:!this.data.showCreate});
  }
})