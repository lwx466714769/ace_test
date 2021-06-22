// pages/map/map.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    markers: [{
      iconPath: "/images/icon-marker.png",
      id: 0,
      latitude: '',
      longitude: '',
      width: 36,
      height: 40
    }],
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    let _this = this;
    const { markers } = this.data;
    
    wx.getLocation({
      success: function(res) {
        markers[0].latitude = res.latitude;
        markers[0].longitude = res.longitude;
        _this.setData({latitude:res.latitude,longitude:res.longitude,markers})
      },
    })
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
    this.mapCtx = wx.createMapContext('map', this)
  },
  chooseLocation: function (e) {

    wx.chooseLocation({

      success: function (res) {

        console.log(res);

      },

    })

  }
})