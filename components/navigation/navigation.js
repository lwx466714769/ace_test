// components/navigation/navigation.js
const app = getApp();
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    navdata:{
      type:Object,
      value:{
        showBack:false,
        showHome:false,
        title:'俱乐部'
      }
    }
  },

  /**
   * 组件的初始数据
   */
  data: {
    height:20
  },
  attached(){
    console.log(this.data)
    this.setData({height:app.globalData.height});
  },
  /**
   * 组件的方法列表
   */
  methods: {
    back(){
      wx.navigateBack()
    },
    goHome(){
      wx.reLaunch({
        url: '/pages/index/index',
      })
    }
  }
})
