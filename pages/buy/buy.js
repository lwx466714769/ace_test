// pages/buy/buy.js
import urls from '../../utils/urls.js';
import { uploadImages} from '../../utils/utils.js'
Page({

  /**
   * 页面的初始数据
   */
  data: {
    images:'',
    videos: [
      {index:1, src:'https://img.acegear.com/lo18P1tdi6nqaYL_bxK40LYNUJlW'},{index:2,src:'https://img.acegear.com/lo18P1tdi6nqaYL_bxK40LYNUJlW'}
    ]
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    console.log(options.item);
    let list = options.item.replace('/a', '&')
    console.log(list);
    console.log(JSON.parse(list));
    //let news = JSON.parse(decodeURI((options.item)));
    //console.log(decodeURI(options.item))
   // console.log(JSON.parse(news))
   // console.log(decodeURI(JSON.parse(options.item)));
    let sys = wx.getSystemInfo({
      success: function(res) {
        console.log(res);
      },
    })
    let videoContext1 = wx.createVideoContext('video_1', this);
    console.log(videoContext1);
    //videoContext.requestFullScreen();
   //videoContext.play();
    //this.createVideoContext();
    this.wdHeight();
  },
  uploadCard(){
    wx.chooseImage({
      count:1,
      success: function({tempFilePaths}) {
        uploadImage(tempFilePaths,function(){

        },function(itemUrl){
          const {images} = this.data;
          _this.setData({images:itemUrl})
        })
      },
    })
  },
  createVideoContext(){
    let {videos} = this.data;
    // let videoContext = videos.map(o=>wx.createVideoContext(`video_${o.index}`));
    // console.log(videoContext[0]);
    // this.setData({videoContext});
  },
  videoPlay(e){
    let {id} = e.target;
    console.log(id);
   let videoContext =  wx.createVideoContext(id);
    //let {videoContext} = this.data;
    // videoContext.map((o)=>{
    //   console.log(o);
    // })
    //let vc = videoContext.find(o=>id === o.domId);
   // console.log(vc);
    videoContext.requestFullScreen();
    videoContext.play();
   // vc.hideStatusBar();
  },
  wdHeight() {
    try {
      const res = wx.getSystemInfoSync()
      this.setData({ windowHeight: res.windowHeight })
    } catch (e) {
      // Do something when catch error
    }
  }
})