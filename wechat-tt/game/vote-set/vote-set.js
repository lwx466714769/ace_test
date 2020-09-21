// game/vote-set/vote-set.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    // userAddAuth: true,
    userAdd: ["允许", "不允许"],
    userAddValue: 1,
    // voteAuth:'ALL',
    count:[1,2,3,4,5,6,7,8,9],
    imgCount:8,
    // voteResultOpen:false,
    voteItemImgLimitNum:9,
    maxSelectItem:1
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (ops) {
    console.log(ops)
    this.setData({
      voteAuth: ops.voteAuth,
      voteResultOpen: ops.voteResultOpen,
      maxSelectItem: ops.maxSelectItem,
      userAddAuth: ops.userAddAuth,
      voteItemImgLimitNum: ops.voteItemImgLimitNum,
      imgCount: Number(ops.voteItemImgLimitNum) - 1,
      voteItemType: ops.voteItemType,
      number:Number(ops.number)
    })
    console.log(this.data);
    if(ops.userAddAuth=="true"){
      this.setData({userAddValue:0})
    }else{
      this.setData({ userAddValue:1})
    }
  },
  // 投票权限
  limitChange(e){
    console.log(e)
    const {value} = e.detail;
    this.setData({ voteAuth:value})
  },
  // 查看结果
  resultChange(e) {
    console.log(e)
    const { value } = e.detail;
    if(value == 'open'){
      this.setData({ voteResultOpen: "true" })
    }else{
      this.setData({ voteResultOpen: "false" })
    }
    
  },
  // 可选数量
  changeMaxSelect(e) {
    const { value } = e.detail;
    this.setData({ maxSelectItem: value });   
  },
  // 是否添加选项
  changeUserAdd(e) {
    console.log(e);
    const { value } = e.detail;
    if (value == 0) {
      this.setData({ userAddValue: 0, userAddAuth: "true" })
    } else {
      this.setData({ userAddValue: 1, userAddAuth: "false" })
    }
  },
  // 图片限制
  changeImgCount(e){
    console.log(e);
    const {value} = e.detail;
    this.setData({imgCount:value});
  },
  submit(){
    console.log(this.data);
    const { voteAuth, voteResultOpen, maxSelectItem, userAddAuth, imgCount,number} = this.data;
    if (maxSelectItem%1!=0||maxSelectItem<1){
      wx.showToast({
        title: '可选数量必须是大于0的整数',
        icon:'none'
      })
      return;
    }
    // else if(maxSelectItem>number){
    //   wx.showToast({
    //     title: '可选数量不能大于投票选项数',
    //     icon:'none'
    //   })
    //   return;
    // }
    const pages = getCurrentPages();
    const prePages = pages[pages.length-2];
    prePages.setData({
      voteAuth,
      voteResultOpen,
      maxSelectItem, 
      userAddAuth,
      voteItemImgLimitNum:Number(imgCount)+1
    })
    wx.showToast({
      title: '保存成功',
    })
    setTimeout(()=>{
      wx.navigateBack()
    },500)
    
  }
})