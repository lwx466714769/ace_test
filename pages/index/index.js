import urls from '../../utils/urls.js';
import {fetch} from '../../utils/utils.js'

const app = getApp();
Page({
  data: {
    innerAudioContext:'',
    countList: [{ count: 3 }, { count: 4 }, null, null ,null, { count: 4 },],
    imgs:['111','222'],
    authorized:false,
    list:{
      name:'h&k福利卡',
      id:1
    },
    tabList: [
      { index: 0, name: '热议', render: true },
      {index:1,name:'活动',render:false},
      { index: 2, name: '俱乐部资讯', render: false },
      { index: 3, name: '商城', render: false }
    ],
    curIndex:0,
    height: app.globalData.height*2+88, 
    navdata:{
      showBack:true,
      showHome:true,
      title:'俱乐部平台'
    },
    // nodes: [{
    //   name: 'div',
    //   attrs: {
    //     class: 'div_class',
    //     style: 'line-height: 60px; color: red;'
    //   },
    //   children: [{
    //     type: 'text',
    //     text: 'Hello&nbsp;World!'
    //   }]
    // }],
    nodes: '<div class="media-wrap image-wrap">< img id="xxx" title="xxx" alt="xxx" controls="" src="https://img.acegear.com/97b52a27244e3431e4f579363b108415a04e1a28"/></div><p>汽车文化品牌<br/>在关注汽车生态，传播汽车文化</p >',
    
    arr:['武汉','山西','上海','北京','audi'],
    space:`11\n22\n33`
  },
  onReady(){
    this.tab = this.selectComponent('#tab');
  },
  onReachBottom(){
    console.log('reach')
  },
  onPullDownRefresh(){
    console.log('a')
  },
  confirmArea(e){
    console.log(e)
  },
  tolower(){
    console.log('lower')
  },
  changeTab(e) {
    console.log(e);
    const { index, state } = e.detail;
    this.setData({ curIndex: index });
    if (state) {
      console.log(index)
    }
  },
  swiperChange(e){
    console.log(e);
    this.tab.changeTab({detail:{index:e.detail.current}});
  },
  toPlay(){
    const {innerAudioContext} = this.data;
    console.log(innerAudioContext)
    innerAudioContext.play();
    
    // innerAudioContext.play(() => {
    //   console.log('开始播放')
    // })
    innerAudioContext.onError((res) => {
      console.log(res.errMsg)
      console.log(res.errCode)
    })
  },
  onShow(){
    // innerAudioContext.autoplay = true
    
  },
  onLoad:function(){
    const innerAudioContext = wx.createInnerAudioContext({})
    innerAudioContext.src = '../../01_Opening.m4a'
    console.log(innerAudioContext)
    this.setData({
      innerAudioContext
    })
    console.log(this.data.formList);
    let qq = this.getReturn();
    console.log(qq)
    // console.log(this.getReturn());
    // wx.showLoading({
    //   title: 'title',
    //   mask:true
    // })
    // setTimeout(()=>{
    //   wx.navigateTo({
    //     url:'/pages/benefits/benefits',
    //     success:()=>{
    //       wx.hideLoading();
    //       console.log('a');
    //     }
    //   })
    //   console.log('b')
    // },3000)
    // await this.beforeLoad();
    
    // wx.setStorage({
    //   key:'a',
    //   data:'b',
    //   success:()=>{
    //     console.log('load');
    //   }
    // })
    // setTimeout(function(){
    //   wx.setStorageSync('c', 'f');
    // },2000)
    
    // wx.navigateTo({
    //   url: '/pages/buy/buy',
    // })
    const {userId} = wx.getStorageSync('user');
    const clubId = wx.getStorageSync('cid');
    this.setData({clubId},this.initPage);
    if(userId){
      this.setData({authorized:true});
    }
    const {arr} = this.data;
    // wx.request({
    //   url: 'https://acegear-test.oss-cn-beijing.aliyuncs.com/post1.txt?Expires=1554800855&OSSAccessKeyId=TMP.AQGiTgY0PMzxwq8UQSt40XzZCelYgOw1W6ZGIN2X8_RzKCiFrRvD15aDkwkxAAAwLAIUeAkRc7ioAWpwaJkeCFOL_6yEuNsCFFbRFmGiSVeI2TlomsoxR2wi4Pyf&Signature=t77SGIzSQnlsgCA5nb95M8LakVk%3D',
    //   success:body=>{
    //     this.setData({ nodes: body });
    //   }
    // })
    // fetch({
    //   url:`https://acegear-test.oss-cn-beijing.aliyuncs.com/post1.txt?Expires=1554800855&OSSAccessKeyId=TMP.AQGiTgY0PMzxwq8UQSt40XzZCelYgOw1W6ZGIN2X8_RzKCiFrRvD15aDkwkxAAAwLAIUeAkRc7ioAWpwaJkeCFOL_6yEuNsCFFbRFmGiSVeI2TlomsoxR2wi4Pyf&Signature=t77SGIzSQnlsgCA5nb95M8LakVk%3D`,
    //   success:body=>{
    //     this.setData({nodes:body});
    //   }
    // })
    // let a = arr.sort(function fn(par1,par2){
    //   return par1.localeCompare(par2);
    // });
    
    //String.prototype.localeCompare()
    let a = this.pySegSort(arr);
    console.log(a);
    wx.getSystemInfo({
      success: function(res) {
        console.log(res)
      },
    })
  },
  onEditorReady(){
    let _this = this;
    wx.createSelectorQuery().select('#editor').context(function(res){
      console.log(res)
      _this.editorCtx = res.context;
      _this.editorCtx.insertText({text:'11\n22\n33'})
    }).exec()
    
    
  },
  bindArea(e){
    console.log(e)
  },
  bindEditor(e){
    console.log(e)
    let text = e.detail.text;
    this.setData({text})
  },
  submitSpace(){
    const {text}= this.data;
    let arr = text.split('\n');
    console.log(arr)
  },
  getReturn(){
    let body = false;
    if(body){
      return true;
    }else{
      return false;
    }
    
  },
  beforeLoad(){
    console.log('beforeLoad');
  },
  pySegSort(arr) {
    if(!String.prototype.localeCompare)
        return null;

    var letters = "*abcdefghjklmnopqrstwxyz".split('');
    var zh = "阿八嚓哒妸发旮哈讥咔垃痳拏噢妑七呥扨它穵夕丫帀".split('');

    var segs = [];
    var curr;
    letters.forEach(function (item, i) {
      curr = { letter: item, data: [] };
      arr.forEach(function (item2) {
        //if ((!zh[i - 1] || zh[i - 1].localeCompare(item2) <= 0) && item2.localeCompare(zh[i]) == -1) 
        if((!zh[i - 1] || zh[i - 1].localeCompare(item2, 'zh') <= 0) && item2.localeCompare(zh[i], 'zh') == -1)
        {
          curr.data.push(item2);
        }
      });
      if (curr.data.length) {
        segs.push(curr);
        curr.data.sort(function (a, b) {
          return a.localeCompare(b);
        });
      }
    });
    return segs;
  },
  goLogin(){
    getApp().login().then(res => {
      this.setData({ authorized: true });
      this.initData();
    }).catch(res => {
      let { code, data } = res;
      //this.setData({ registeData: data })
      this.binder.show();
    })
  },
  initPage(){
    const {clubId} = this.data;
    const url = `${urls.home}/clubs/${clubId}`;
  },
  goRelease(){
    //const imgs = this.data.imgs;
    wx.chooseImage({
      count:9,
      success: function (res) {
        var tempFilePaths = res.tempFilePaths;
        const tempImages = tempFilePaths.map(o => ({
          id: o,
          src: o
        }))
        wx.navigateTo({
          url: '/pages/release/release?imgs=' + JSON.stringify(tempImages),
        })
      },
    })
    
  },
  goBuy(){
    const {list} = this.data;
    //let lists = JSON.stringify(encodeURIComponent(list));
    let lists = JSON.stringify(list);
    console.log(lists.replace('&', '/a'));
    let newList = lists.replace('&', '/a')
  //  console.log(lists);
   // console.log(JSON.stringify(list));
   // console.log(JSON.parse(decodeURI(lists)));
    wx.navigateTo({
      url: '/pages/buy/buy?item=' + newList,
    })
  },
  toBenefits(){
    wx.navigateTo({
      url: '/pages/benefits/benefits',
    })
  },
  wxLogin(e){
    console.log(e)
  },
  getPhoneNumber(e){
    console.log(e);
  },
  formSubmit(e){
    console.log(e);
  }
})