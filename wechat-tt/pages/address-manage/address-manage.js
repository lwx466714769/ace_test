// pages/address-manage/address-manage.js
import urls from '../../utils/urls.js';
import {
  uploadImages,
  fetch,
  formatPostsAce,
  checkBuyLimit
} from '../../utils/utils.js';
Page({

  /**
   * 页面的初始数据
   */
  data: {

  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.setData({
      defaultAddressId: parseInt(options.addressId)
    })
    this.getAddressList()
  },
  selectAddress(e){
    const {id} = e.currentTarget.dataset;
    const {addressList} = this.data;
    let item = addressList.find(o=>o.id === id);
    item.pitchOn = true;
    let items=addressList.filter(o=>o.id!==id);
    items.map(item=>{
      item.pitchOn=false;
    })
    this.setData({addressList,currentId:id});
  },
  pickDefaultAddress(id) {
    const { addressList } = this.data;
    let item = addressList.find(o => o.id == id);
    item.pitchOn = true;
    let items = addressList.filter(o => o.id !== id);
    items.map(item => {
      item.pitchOn = false;
    })
    this.setData({ addressList, currentId: id, defaultAddressId:null });
  },
  sure(e){
    const {currentId}=this.data;
    this.data.addressList.map((ad)=>{
      if(currentId == ad.id){
        wx.setStorageSync('address', ad)
        wx.navigateBack({

        })
      }
    })
  },
  delAddress(e){
    let id = e.currentTarget.dataset.id
    let _this = this
    const url = `${urls.address}/${id}`;
    const success = body => {
      _this.getAddressList()
    };
    fetch({
      url,
      success,
      json: true,
      method: 'DELETE',
      loading: '正在处理',
    })
  },
  getAddressList(){
    let _this = this
    let data = {
      page:0,
      pageSize:50,
    }
    const url = `${urls.address}`;
    const success = body => {
        body.content.map(item=>{
            if (item.pitchOn){
                _this.setData({currentId:item.id})
            }
        })
      _this.setData({
        addressList: body.content
      })
      if (_this.data.defaultAddressId){
        _this.pickDefaultAddress(_this.data.defaultAddressId)
      }
    };
    fetch({
      url,
      success,
      data,
      json: true,
      method: 'GET',
      loading: '正在处理',
    })
  },
  getAddress() {
    let _this = this;
    wx.getSetting({
      success:(res)=>{
        if(res.authSetting['scope.address'] == false){
          wx.showModal({
            title: '提示',
            content: '您的通讯地址未授权,请点击确定重新获取授权',
            success:(res)=>{
              if(res.confirm){
                wx.openSetting({
                  success:res=>{
                    if(res.authSetting['scope.address']){
                      this.chooseAddress();
                    }
                  }
                })
              }
            }
          })
        }else{
          this.chooseAddress();
        }
      }
    })
    
  },
  chooseAddress(){
    let _this = this;
    wx.chooseAddress({
      success: (res) => {
        let isPitchOn;
        wx.showModal({
          title: '',
          content: '是否设置为默认收货地址？',
          success: ress => {
            if (ress.confirm) {
              isPitchOn = true;
            } else {
              isPitchOn = false;
            }
            const { userId } = wx.getStorageSync('user');
            let data = {
              userId,   //用户id
              country: '中国',
              provinceName: res.provinceName,   //省
              cityName: res.cityName,  //市
              countyName: res.countyName,   //区
              nationalCode: res.nationalCode,    //国家编码
              postalCode: res.postalCode,     //邮政编码
              detailInfo: res.detailInfo,    //详细地址
              userName: res.userName,    //收货人姓名
              telNumber: res.telNumber,    //手机号
              pitchOn: isPitchOn       //默认选择
            }
            const url = `${urls.address}`;

            const success = body => {
              _this.getAddressList()
            };
            fetch({
              url,
              success,
              data,
              json: true,
              method: 'POST',
              loading: '正在处理',
            })
          }
        })
      },
      fail: (res) => {
        console.log(res)
      }
    })
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