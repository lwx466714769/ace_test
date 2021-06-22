// pages/move.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    busArr:[1,2,3],
    x:0,
    y:0
  },
  onLoad(){
    
  },
  tap: function (e) {
    this.setData({
      x: 30,
      y: 30
    });
  },
  // 初始点击
  stratBtn(e) {
    console.log(e);
    let index = e.currentTarget.dataset.index;//获取当前点击的列表
    let busArr = this.data.busArr;//获取列表中的所有数组
    let pageY = Number(e.touches[0].pageY);//初始点击的Y点坐标
    let busActObj = busArr[index];//单独记录当前点击的数据
    this.setData({  //保存数据
      sPageY: pageY,
      mPageY: pageY,
      moveSortBox: true,
      clickIndex: index,
      busActObj: busActObj
    })
  },
  // 开始移动
  moveBtn(e) {
    let pageY = Number(e.touches[0].pageY); //记录移动点的坐标
    this.setData({ //记录
      mPageY: pageY,
      moveSortBox: true,
    })
  },
  // 结束点击
  endBtn(e) {
    console.log(this.data);
    let sPageY = Number(this.data.sPageY); //获取初始点的坐标
    let busArr = this.data.busArr; //获取数组
    let pageY = Number(e.changedTouches[0].pageY);//获取结束点的坐标
    let clickIndex = Number(this.data.clickIndex); //初始点的位置
    let busActObj = this.data.busActObj;//获取初始点的列表单独数据
    let position = parseInt((pageY - sPageY) / 50) + (clickIndex + 1); //每个盒子固定高度90px  (结束点-初始点/盒子高度)+(初始点的位置+1)可以得到移动的位置
    busArr.splice(clickIndex, 1);//删除初始数据
    busArr.splice(position, 0, busActObj);//在移动点重新插入数据
    this.setData({//保存
      moveSortBox: false,
      busArr: busArr
    })
  },
  goBack(){
    wx.navigateBack({
      delta:2
    })
  }
})