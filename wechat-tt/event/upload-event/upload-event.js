// event/upload-event/upload-event.js
import urls from '../../utils/urls.js';
import { fetch, uploadImages, formatDate, getTextFromHTML } from '../../utils/utils.js';
import WxParse from '../../utils/wxParse/wxParse.js';
Page({

  /**
   * 页面的初始数据
   */
  data: {
    images:[],
    introduce:'',
    data: { contents: '', clubInfo: {}, coverImg:{}},
    type:''
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (ops) {
    this.setData({clubId:ops.clubId})
    if(ops.type == 'draft'){
      this.setData({ activityId: ops.activityId,type:ops.type},this.getEventDetail);     
    }
  },
  onUnload(){
    wx.removeStorageSync('event');
  },
  getEventDetail(){
    let that = this;
    let { activityId,introduce,images}  = this.data;
    fetch({
      url: `${urls.activity}/${activityId}`,
      success:body=>{
        if (body.startTime){
          body.startTime = formatDate(body.startTime,'-',true);
        }
        if(body.endTime){
          body.endTime = formatDate(body.endTime,'-',true);
        }
        if(body.signEndTime){
          body.signEndTime = formatDate(body.signEndTime,'-',true);
        }
        // if(body.contents){
        //   WxParse.wxParse('article', 'html', body.contents,that,0,(res)=>{
        //     console.log(res);
        //     let text = res.nodes[0].nodes[0].text;
        //     this.setData({introduce:text,images:res.imageUrls});
        //   });
        // }
        this.getIntro();
        wx.setStorageSync('event',body);
        this.setData({data:body})
      }
    })
  },
  // 获取介绍内容
  getIntro() {
    const _this = this;
    const { activityId } = this.data;
    fetch({
      url: `${urls.hotdiscuss}/${activityId}/getContent?feedType=ACTIVITY`,
      success: body => {
        body = body.replace(/\/n/g, '</p><p>');
        WxParse.wxParse('article', 'html', body, _this, 0,(res)=>{
          console.log(res)
          let text = res.nodes[0].nodes[0].text;
          this.setData({introduce:text,images:res.imageUrls});
        });
      }
    })
  },
  getHtmlText(res){
    return res.nodes[0].nodes[0].text;
  },
  // 上传装备背景图
  uploadBackground() {
    let _this = this;
    wx.chooseImage({
      count: 1,
      success: function ({ tempFilePaths }) {
        uploadImages(tempFilePaths, function (imgUrl) {
          _this.setData({ 
            'data.coverImg.url': imgUrl[0]
             })
        })
      },
    })
  },
  delBackground(){
    this.setData({'data.coverImg.url':''});
  },
  addImages() {
    let _this = this, count;
    let { images } = this.data;
    wx.chooseImage({
      count: 9 - images.length,
      success: function ({ tempFilePaths }) {
        uploadImages(tempFilePaths, function (imgUrl) {
          let newImg = [...images, ...imgUrl];
          _this.setData({ images: newImg })
        });
      }
    })
  },
  delImages(e) {
    const { index } = e.currentTarget.dataset;
    const { images } = this.data;
    const delImgs = images.filter((item, i) => i != index);
    this.setData({ images: delImgs });
  },
  changeName(e){
    const {value} = e.detail;
    this.setData({ ['data.activityName']:value})
  },
  changeIntro(e){
    const {value} = e.detail;
    this.setData({introduce:value})
  },
  submit(){
    const {data,clubId,introduce,images,type} = this.data;
    console.log(data);
    if (!data.coverImg.url){
      return this.message('请上传封面图片');
    } else if (!data.activityName){
      return this.message('请输入活动标题');
    } else if (!introduce) {
      return this.message('请输入活动介绍');
    }
    data.contents = `<p>${introduce}</p>`;
    images.map(item=>{
      data.contents += `<img src="${item}"/>`;
    })
    data.clubInfo.clubId = clubId;
    wx.setStorageSync('event', data);
    
    setTimeout(()=>{
       wx.navigateTo({
        url: `/event/upload-event-set/upload-event-set?clubId=${clubId}&type=${type}`,
      })
    },500)
   
  },
  message: function ( msg) {
    wx.showToast({
      title: msg,
      icon:'none'
    })
  },
})