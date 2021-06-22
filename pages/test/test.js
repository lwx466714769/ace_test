// pages/test/test.js
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
    this.initPage();
    
  },
  toA(){
    // wx.showActionSheet({
    //   itemList: ['aaa','bbb'],
    //   success:(res)=>{
    //     console.log(res)
    //   },
    //   fail:res=>{
    //     console.log(res)
    //   }

    // })
    // wx.showTabBarRedDot({
    //   index: 1,
    // })
    wx.setTabBarBadge({
      index:1,
      text:'999'
    })
    wx.navigateTo({
      url: '/pages/a/a',
    })
  }, 
  onPageNotFound(res) {
    console.log(res);
  },
  initPage(fn){
    let obj = wx.getMenuButtonBoundingClientRect()
    console.log(obj)
    // wx.setNavigationBarTitle({
    //   title: 'hah',
    // })
    // wx.setBackgroundTextStyle({
    //   textStyle:'light'
    // })
    // wx.setBackgroundColor({
    //   backgroundColor: '#00ff00',
    //   backgroundColorTop:'#ff0000'
    // })
    function outer() {
      var result = [];
      for (var i = 0;i< 10; i++){
        result[i] = function () {
          console.log(i)
          return i;
        }
      }
      return result
    }
    // function outer() {
    //   var result = [];
    //   for (var i = 0; i < 10; i++) {
    //     result[i] = function (num) {
    //       return function () {
    //         console.info(num);    // 此时访问的num，是上层函数执行环境的num，数组有10个函数对象，每个对象的执行环境下的number都不一样
    //       }
    //     }(i)
    //   }
    //   return result
    // }
    outer();
  }
})