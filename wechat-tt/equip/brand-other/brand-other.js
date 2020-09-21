// equip/equip-type/equip-type.js
import urls from '../../utils/urls.js';
import { fetch } from '../../utils/utils.js';
Page({

  /**
   * 页面的初始数据
   */
  data: {
    brandOtherList:[]
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (ops) {
    this.setData({ carTypeId: ops.carTypeId }, this.getBrandOther);
  },
  getBrandOther(){
    const id = this.data.carTypeId;
    fetch({
      url: `${urls.equip}/Classification/${id}/list`,
      loading: '加载中...',
      success:body =>{
        this.setData({brandOtherList:body});
      }
    })
  },
})