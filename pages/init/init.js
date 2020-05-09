//index.js
//获取应用实例
const app = getApp()

Page({
  data: {
    authorized: false,
    motto: '11'
  },
  onLoad: function (e) {
    var rawData = wx.getStorageSync('rawData');
    console.log(rawData);

    if (rawData) {
      getApp().login().then(res => {
        this.setData({ authorized: true });
        this.initData();
      }).catch(res => {
        let { code, data } = res;
        this.setData({ registeData: data })
        this.binder.show();
      })

    }

  },
  onReady() {
    this.binder = this.selectComponent('#binder');
    //this.binder.show();
  },

})
