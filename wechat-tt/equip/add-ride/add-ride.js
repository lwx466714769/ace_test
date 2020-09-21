// equip/add-ride/add-ride.js
import urls from '../../utils/urls.js';
import { fetch } from '../../utils/utils.js'
Page({

  /**
   * 页面的初始数据
   */
  data: {
    tabList: [
      { index: 0, name: '选择类型', render: true },
      { index: 1, name: '录入车型', render: true },
    ],
    curIndex: 0,
    appealContent:[],
    carTypeId:'',
    brandId:'',
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (ops) {
    console.log(ops);
    let equipAppeal = wx.getStorageSync('equipAppeal');
    if (equipAppeal){
      this.setData({ appealContent:equipAppeal});
    }
    if (ops.equipId){
      this.setData({ equipId:ops.equipId});
    }
    this.setData({ carTypeId: ops.carTypeId,carTypeName:ops.carTypeName});
    // 除汽车和机车外，其它类型
    if(ops.isFrom == 'other'){
      const { appealContent } = this.data;
      let objBrand = { name: "品牌", value: '', type: 'TEXT', prescribedType: 'NOTDELETE' };
      appealContent.push(objBrand);
      this.setData({  type: 'other', appealContent,type:ops.createFrom });
    }
    // 无系列进入时
    if (ops.type == 'noModel'){
      const {appealContent} = this.data;
      let objBrand = { name: "品牌", value: ops.brandName, type: 'TEXT', prescribedType:'NOTUPDATE'};
      let objModel = { name: "车系", value: '', type: 'TEXT', prescribedType: 'NOTDELETE' };
      appealContent.push(objBrand);
      appealContent.push(objModel);
      this.setData({ brandId: ops.brandId,brandName:ops.brandName,type:ops.type,appealContent});
    } 
    // 无品牌进入时
    if (ops.type == 'noBrand'){
      const { appealContent } = this.data;
      let objBrand = { name: "品牌", value: '', type: 'TEXT', prescribedType: 'NOTDELETE' };
      let objModel = { name: "车系", value: '', type: 'TEXT', prescribedType: 'NOTDELETE' };
      appealContent.push(objBrand);
      appealContent.push(objModel);
      console.log(appealContent);
      this.setData({ type: ops.type, appealContent });
    }    
  },
  onHide(){
    wx.removeStorageSync('equipAppeal')
  },
  onUnload() {
    wx.removeStorageSync('equipAppeal')
  },
  changeTab(e) {
    const { index } = e.currentTarget.dataset;
    this.setData({ curIndex: index });
  },
  changeName(e){
    const curIndex = e.currentTarget.dataset.index;
    const value = e.detail.value;
    let { appealContent } = this.data;
    let rideType = appealContent.find((item, index) => index == curIndex);
    rideType.name = value;
    this.setData({ appealContent});
  },
  changeContent(e){
    const curIndex = e.currentTarget.dataset.index;
    const value = e.detail.value;
    let { appealContent } = this.data;
    let rideType = appealContent.find((item, index) => index == curIndex);
    rideType.value = value;
    this.setData({ appealContent });
  },
  addRideType(){
    const { appealContent} = this.data;
    let rideType = { name: '', value: '', type: 'TEXT', prescribedType:'NORMAL'};
    appealContent.push(rideType);
    this.setData({ appealContent});
  },
  delRideType(e){
    const curIndex = e.currentTarget.dataset.index;
    let { appealContent} = this.data;
    appealContent = appealContent.filter((item, index) => index != curIndex);
    this.setData({ appealContent});
  },
  submit(){
    const { appealContent, equipId,type,carTypeId,carTypeName,brandId,brandName} = this.data;
    let name = appealContent.find(item => item.name == '');
    let value = appealContent.find(item => item.value == '');
    if (name) {
      wx.showToast({
        title: '自定义名称不能为空',
        icon:'none'
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
    wx.setStorageSync('appealContent', appealContent);
    if(type == 'noModel'||type == 'noBrand'||type=='otherNoBrand'){
      wx.navigateTo({
        url: `/equip/create-equip/create-equip?carTypeId=${carTypeId}&carTypeName=${carTypeName}&brandId=${brandId}&brandName=${brandName}&createFrom=${type}`,
      })
      // const { brandId, carTypeId } = this.data;
      // wx.showModal({
      //   content: '确定创建此装备吗',
      //   success: res => {
      //     if (res.confirm) {
      //       fetch({
      //         url: urls.equip,
      //         method: 'POST',
      //         data: { carTypeId, brandId,appealContent },
      //         json: true,
      //         success: body => {
      //           wx.navigateTo({
      //             url: `/equip/my-equip-detail/my-equip-detail?id=${body.id}&createFrom=${type}`,
      //           })
      //         }
      //       })
      //     }
      //   }
      // })
      
    }else{
      fetch({
        url:`${urls.equip}/${equipId}/detailInfo`,
        method:'PUT',
        json:true,
        data: { appealContent },
        success:body =>{
          let pages = getCurrentPages();
          var prePages = pages[pages.length - 2];
          prePages.setData({ isUpdate: true });
          wx.showToast({
            title: '修改成功',
          })
          setTimeout(() => {
            wx.navigateBack();
          }, 1000) 
        }
      })
    }    
  }
})