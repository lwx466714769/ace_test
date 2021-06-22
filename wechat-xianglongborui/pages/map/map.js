// event/event-map/event-map.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    markers: [{
      iconPath: "/images/icon-marker.png",
      id: 0,
      latitude: '39.156245',
      longitude: '117.407638',
      width: 36,
      height: 40
    }],
    circle:[{
      latitude: '',
      longitude: '',
      color: '#FF0000DD',
      fillColor: '#d1edff88',
      radius: 500,//定位点半径
    }],
    lat: '39.156245',
    lng: '117.407638',
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (ops) {
    console.log(ops);
    const { markers, circle} = this.data;
    if(markers){
      markers[0].latitude = ops.latitude;
      markers[0].longitude = ops.longitude;
      circle[0].latitude = ops.latitude;
      circle[0].longitude = ops.longitude;
      this.setData({
        lng:ops.longitude,
        lat:ops.latitude,
        markers,
        circle
      })
    }
    
    this.location();
  },
  //两点间距离的计算（KM）
  //进行经纬度转换为距离的计算
  rad(d){
    return d * Math.PI / 180.0;//经纬度转换成三角函数中度分表形式。
  },
  //计算距离，参数分别为第一点的纬度，经度；第二点的纬度，经度
  getDistance(lat1, lng1, lat2, lng2) {

    var radLat1 = this.rad(lat1);
    var radLat2 = this.rad(lat2);
    var a = radLat1 - radLat2;
    var b = this.rad(lng1) - this.rad(lng2);
    var s = 2 * Math.asin(Math.sqrt(Math.pow(Math.sin(a / 2), 2) +
    Math.cos(radLat1) * Math.cos(radLat2) * Math.pow(Math.sin(b / 2), 2)));
    s = s * 6378137;// EARTH_RADIUS;   //默认单位为米
   // s = Math.round(s * 10000) / 10000; //输出为公里
  //s=s.toFixed(2);
    return s;
  },
  location(){
    let that = this;
    const {lng,lat} = this.data;
    wx.getLocation({
      success: function (res) {
        console.log(res);
        let s = that.getDistance(res.latitude,res.longitude,lat,lng);
        console.log(s);
       },
    })
  }
})