// pages/addimg/addimg.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    images:[],
    lock:false,
    textarea:'说点什么吧...',
  },
  onLoad(ops){
    var imgs = JSON.parse(ops.imgs);
    console.log(imgs);
    this.setData({
      images:imgs
    })
    //this.addImages();
  },
  onReady(){
    
  },
  addImages(){
    var _this = this;
    var {images} = this.data;
    var count = 9-images.length;
    // wx.chooseVideo({
    //   success: function () {

    //   }
    // })
    wx.chooseImage({
      count,
      success: function(res) {      
        var tempFilePaths = res.tempFilePaths;
        const tempImages = tempFilePaths.map(o=>({
          id:o,
          uploading:true,
          src:o
        }))
        const {images} = _this.data;
        _this.setData({lock:true,images:[...images,...tempImages]});
        
      },
    })
    
  },
  delImages(e){
    const {id} = e.currentTarget.dataset;
    const {images} = this.data;
    const imgs = images.filter(o=> o.id !== id);
    this.setData({images:imgs});
    if(imgs.length<1){
      this.setData({lock:false})
    }
  },
  submit(){
    const {lock} = this.data;
    if(!lock) return;
    console.log()
  },
  modifyInput(e){
    const textarea = e.detail.value;
    if(value.length<1){
      this.setData({
        textarea:'说点什么吧...'
      })
    }else{
      this.setData({
        textarea
      })
    }
  },
  submit(){
    const {images,textarea,lock} = this.data;
    if(!lock) return;
    console.log(images);
    console.log(textarea);
    wx.showToast({
      title:'发布成功',
      icon:'success',
      duration:2000
    })
  }
})