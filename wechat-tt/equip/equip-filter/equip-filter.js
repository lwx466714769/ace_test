// equip/equip-filter/equip-filter.js
import urls from '../../utils/urls.js';
import { fetch } from '../../utils/utils.js'
Page({

  /**
   * 页面的初始数据
   */
  data: {
    showCarType:false,
    equipTypeList:['汽车','机车'],
    curTypeIndex:0,
    curTypeItem:'全部',
    curBrandItem:'',
    currentIndex:0,
    carTypeId:'',
    brandId:'',

  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.getEquipType();
  },
  showCarType(e){
    const { item, id} = e.currentTarget.dataset;
    const { carTypeId} = this.data;
    if(!this.data.showCarType){
      this.setData({ curBrandItem: item, brandId: id });
    }
    if (carTypeId == 1 || carTypeId == 2) {
      this.setData({ showCarType: !this.data.showCarType});
      if (this.data.showCarType) {
        this.getCarModel(id);
      }
    }else{
      const { curTypeItem, curBrandItem, carTypeId, brandId } = this.data;
      let pages = getCurrentPages();
      var prePages = pages[pages.length - 2];
      prePages.setData({ filterCon: curTypeItem + ' - ' + curBrandItem, carTypeId, brandId, equipFilter: true });
      setTimeout(() => {
        wx.navigateBack()
      }, 500) 
    } 
  },
  filter(e){
    const {item,id} = e.currentTarget.dataset;
    const { curTypeItem, curBrandItem, carTypeId,brandId} = this.data;
    let pages = getCurrentPages();
    var prePages = pages[pages.length - 2];
    prePages.setData({ filterCon: curTypeItem + ' - ' + curBrandItem + ' - ' + item, carTypeId, brandId, seriesId: id, equipFilter:true});
    setTimeout(()=>{
      wx.navigateBack()
    },500)  
  },
  changeType(e){
    const { item,index,id } = e.currentTarget.dataset;
    this.setData({ curTypeIndex: index, curTypeItem: item, carTypeId:id});
    this.getBrandList(id);
  },
  getEquipType() {
    fetch({
      url: `${urls.equip}/type/getList`,
      success: body => {
        this.setData({ equipTypeList: body});
        if(body.length>0){
          this.setData({curTypeItem: body[0].name,carTypeId:body[0].id })
          this.getBrandList(body[0].id);
        } 
      }
    })
  },
  getBrandList(id) {
    let that = this;
    fetch({
      url: `${urls.equip}/brand/${id}/list`,
      success: body => {
        var brandList = [];
        for (var key in body) {
          var brandObject = new Object();
          brandObject.letter = key;
          brandObject.brand = body[key];
          brandList.push(brandObject);
        }
        this.setData({ brandList });
      }
    })
  },
  getCarModel(id) {
    fetch({
      url: `${urls.equip}/series/${id}/list`,
      success: body => {
        this.setData({ modelList: body })
      }
    })
  },
  allBrand(){
    const { curTypeItem,carTypeId} = this.data;
    let pages = getCurrentPages();
    var prePages = pages[pages.length - 2];
    console.log(carTypeId);
    prePages.setData({ filterCon: curTypeItem + ' - 全部', carTypeId, brandId: '', seriesId: '', equipFilter: true });
    setTimeout(() => {
      wx.navigateBack()
    }, 500)
  },
  allModel() {
    const { curTypeItem, curBrandItem, carTypeId, brandId } = this.data;
    let pages = getCurrentPages();
    var prePages = pages[pages.length - 2];
    prePages.setData({ filterCon: curTypeItem + ' - ' + curBrandItem + ' - 全部', carTypeId, brandId, seriesId: '', equipFilter: true });
    setTimeout(() => {
      wx.navigateBack()
    }, 500)  
  },
  clearFilter(){
    let pages = getCurrentPages();
    var prePages = pages[pages.length - 2];
    prePages.setData({ filterCon: '全部', carTypeId:'',brandId:'',seriesId:'', equipFilter: true });
    setTimeout(() => {
      wx.navigateBack()
    }, 500)  
  },
  slideStart(e) {
    console.log(e)

    let touchY = e.touches[0].clientY;
    let offsetTop = e.currentTarget.offsetTop;
    let index = parseInt((touchY - offsetTop) / 16);
    this.setData({ currentIndex: index, currentId: 'id' + index })
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