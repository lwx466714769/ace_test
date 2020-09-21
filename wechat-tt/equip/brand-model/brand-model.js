// equip/brand-model/brand-model.js
import urls from '../../utils/urls.js';
import { fetch } from '../../utils/utils.js'
Page({

  /**
   * 页面的初始数据
   */
  data: {
    
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (ops) {
    console.log(ops);
    this.setData({ brandId: ops.brandId, carTypeId: ops.carTypeId,carTypeName:ops.carTypeName, brandName: ops.brandName},this.getCarModel);
    const {nickname,avatar} = wx.getStorageSync('user');
    this.setData({nickname,avatar})
  },
  getCarModel(){
    const { brandId} = this.data;
    fetch({
      url: `${urls.equip}/series/${brandId}/list`,
      success:body =>{
        this.setData({modelList:body})
      }
    })
  },
  createAlbum(id){
    fetch({
      url:urls.album,
      method:'POST',
      data:{
        relevanceId:id,
        type:2
      },
      success:body =>{
        
      }
    })
  },
  createEquip(e){ 
    const {id,name} = e.currentTarget.dataset;
    const { brandId,brandName, carTypeId,carTypeName} = this.data;
    let appealContent = [
      { name: '品牌', value: brandName, type: 'TEXT', prescribedType: 'NOTUPDATE' },
      { name: '车系', value: name, type: 'TEXT', prescribedType: 'NOTUPDATE' }
    ]
    wx.setStorageSync('appealContent', appealContent);
    wx.navigateTo({
      url: `/equip/create-equip/create-equip?carTypeId=${carTypeId}&carTypeName=${carTypeName}&brandId=${brandId}&brandName=${brandName}&seriesId=${id}&seriesName=${name}&createFrom=model`,
    })
    // fetch({
    //   url:urls.equip,
    //   method:'POST',
    //   data:{carTypeId,brandId,seriesId},
    //   json:true,
    //   success:body =>{
    //     wx.navigateTo({
    //       url: `/equip/create-equip/create-equip?id=${body.id}&createFrom=model`,
    //     })
    //   }
    // }) 
  },
  delEquip(){
    wx.showModal({
      content: '确认删除？',
      success:res=>{
        if(res.confirm){

        }
      }
    })
  },
  showCreate(e) {
    const {showCreate} = this.data;
    const seriesId = e.currentTarget.dataset.id;
    const { background, name } = e.currentTarget.dataset;
    if(!showCreate){
      this.setData({ seriesId, background, seriesName:name});
    } 
    this.setData({ showCreate: !showCreate });
  }
})