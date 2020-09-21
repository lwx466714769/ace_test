// personal/chat-detail/chat-detail.js
import urls from '../../utils/urls.js'
import { fetch, msgCheck } from '../../utils/utils.js'
import constv from '../../const.js'
let winHeight;
wx.getSystemInfo({
  success: function (res) {
    winHeight = res.windowHeight;
  },
})
Page({

  /**
   * 页面的初始数据
   */
  data: {
    clubId:constv.cid,
    scrollTop:0,
    page:0,
    size:15,
    showAll:false,
    chat:[],
    allHeight:0,
    hasValue:false
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (ops) {
    let _this = this;
    console.log(ops)
    let privateChatedUserId = ops.id;
    const {userId} = wx.getStorageSync('user');
    this.setData({ privateChatedUserId,userId})
    this.getChatDetail();
    
    
  },
  getChatDetail(refresh=false){
    let _this = this;
    const { clubId, privateChatedUserId,page,size,chat} = this.data;
    fetch({
      url: `${urls.privateChat}/selectPrivateChatRecord?`,
      data: { clubId, privateChatedUserId,page,size },
      loading:'加载中...',
      success: body => {
        if (body.content.length < size || body.content.length==0){
          this.setData({showAll:true})
        }
        if(!refresh){
          let content = body.content.reverse();
          let list = [...content,...chat];
          console.log(list);
          
          this.setData({ chat: list},()=>{
            let scrollId = '#scroll' + content.length;
            this.setScrollHeight(scrollId);
          })
        }
        
      }
    })
  },
  changeInput(e){
    const {value} = e.detail;
    this.setData({ content:value})
  },
  submit(){
    let _this = this;
    const { content, chat, clubId, privateChatedUserId,scrollTop} = this.data;
    if (!content||content==''){
      wx.showToast({
        title: '请输入内容',
        icon:'none'
      })
      return;
    }
    msgCheck(content).then(()=>{
      fetch({
        url: `${urls.privateChat}/addPrivateChat`,
        method:'POST',
        json:true,
        data:{
          clubId,
          content,
          privateChatedUserId
        },
        success:body=>{
          let pages = getCurrentPages();
          var prePages = pages[pages.length - 2];
          prePages.setData({ isUpdate: true });
          let list = [...chat,body];
          this.setData({chat:list,content:''},() => {
            let scrollId = '#scroll' + list.length;
            this.setScrollHeight(scrollId);
            
          })
        }
      })
    })
    
  },
  scrollEvent(e){
    const {scrollTop} = e.detail;
    console.log(scrollTop)
    if(scrollTop < 20){ 
      const { showAll, page } = this.data;
      if (!showAll) {
        this.setData({ page: page + 1 }, () => {
          this.getChatDetail(false);
        })
      }
    }
  },
  setScrollHeight(scrollId){
    let _this = this;
    const {scrollTop} = this.data;
    let query = wx.createSelectorQuery()
    query.select(scrollId).boundingClientRect();
    query.exec((res) => {
      console.log(res);
      let endTop = res[0].top;
      _this.setData({ scrollTop: endTop })
    })
  }
})