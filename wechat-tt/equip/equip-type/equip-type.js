// equip/equip-type/equip-type.js
import urls from '../../utils/urls.js';
import { fetch } from '../../utils/utils.js';
Page({

  /**
   * 页面的初始数据
   */
  data: {
    equipTypeList:[]
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.getEquipType();
  },
  getEquipType(){
    fetch({
      url: `${urls.equip}/type/getList`,
      loading: '加载中...',
      success:body =>{
        body.map(item=>{
          if(item.name.length==2){
            let name = item.name.split('');
            item.name = name[0]+' '+ name[1];
          }
        })
        this.setData({equipTypeList:body});
      }
    })
  },
  goBrand(e){
    const {id,name} = e.currentTarget.dataset;
    if(id == 6){
      let appealContent = [
        { name: '品牌', value: '', type: 'TEXT', prescribedType: 'NOTDELETE'}
      ]
      wx.setStorageSync('appealContent', appealContent);
      wx.navigateTo({
        url: `/equip/create-equip/create-equip?carTypeId=${id}&carTypeName=${name}`,
      })
    }else{
      wx.navigateTo({
        url: `/equip/brand-list/brand-list?id=${id}&carTypeName=${name}`
      })
    } 
  },
  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
})