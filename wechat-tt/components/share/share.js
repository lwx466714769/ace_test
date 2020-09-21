// components/share/share.js
import urls from '../../utils/urls.js';
import { fetch} from '../../utils/utils.js'
import Card from '../../palette/card.js';
import Card1 from '../../palette/card1.js';
Component({
  /**
   * 组件的属性列表
   * 自定义分享，分享朋友，分享朋友圈
   * shareparams 分享参数
   * sharetype 分享类型
   */
  properties: {
    shareparams:Object,
    sharetype:String
  },

  /**
   * 组件的初始数据
   */
  data: {
    showShare:false,
    img: '/images/default.png',
    showCanvas: true,
    path:'',
    showImg:false,
  },
  /**
   * 组件的方法列表
   */
  methods: {
    showShare() {
      const { showShare, shareparams, sharetype } = this.data;
      let currentUrl = getCurrentPages()[getCurrentPages().length - 1].route;
      console.log(currentUrl);
      // 页面有tabbar隐藏
      if(currentUrl=='pages/index/index'||currentUrl=='pages/album/album'||currentUrl == 'pages/discuss/discuss'){
        if(!showShare){
          wx.hideTabBar();
        }
      }
      
      
      this.setData({ showShare: !showShare, showCanvas: true, template:'' });
      console.log(shareparams);
      // 设置分享朋友当前分享详情id
      let shareId;
      switch (sharetype){
        case 'equip':shareId = shareparams.equipId?shareparams.equipId:shareparams.id;break;
        case 'post':shareId = shareparams.postId;break;
        case 'event': shareId = shareparams.activityId;break;
        case 'vote': shareId = shareparams.voteId;break;
        case 'party': shareId = shareparams.partyId; break;
        default: shareId = shareparams.id;
      }
      this.setData({shareId});
    },
    getShareImg() {
      const { shareparams,sharetype} = this.data;
      // if(sharetype=='club'){
      //   this.addShareNum();
      // }
      console.log(sharetype)
      this.triggerEvent('shareNum');
      switch(sharetype){
        case 'card': this.setData({ template: new Card1().shareCard(shareparams) });break;
        case 'club': this.setData({ template: new Card1().shareClub(shareparams) });break;
        case 'post': this.setData({ template: new Card1().sharePost(shareparams) });break;
        case 'profile': this.setData({ template: new Card().shareProfile(shareparams) }); break;
        case 'equip': this.setData({ template: new Card1().shareEquip(shareparams) }); break;
        case 'event': this.setData({ template: new Card1().shareEvent(shareparams)});break;
        case 'party': this.setData({ template: new Card1().shareParty(shareparams) }); break;
        case 'vote': this.setData({ template: new Card1().shareVote(shareparams)});break;
        case 'album': this.setData({ template: new Card1().shareAlbum(shareparams) }); break;
      }
    },
    saveLocal(){
      const {path} = this.data;
      wx.saveImageToPhotosAlbum({
        filePath: path,
        success: body => {
          this.showSave();
        }
      });
    },
    showSave() {
      wx.showToast({
        title: '图片已保存至本地',
        duration: 4000,
        icon: 'none'
      })
    },
    imgOk(e){
      console.log(e);
      this.setData({imgUrl:e.detail.path,showImg:true,showShare:false})
      // wx.previewImage({
      //   current:e.detail.path,
      //   urls: [e.detail.path],
      //   success:()=>{
      //     this.setData({ showShare: false });
      //   }
      // }) 
    },
    hideImg(e){
      let currentUrl = getCurrentPages()[getCurrentPages().length - 1].route;
      if(currentUrl=='pages/index/index'||currentUrl=='pages/album/album'||currentUrl == 'pages/discuss/discuss'){
        wx.showTabBar();
      }
      
      console.log(e);
      if (e.type == 'tap') {
        this.setData({ showImg: false })
      }
      
    },
    addShareNum(){
      const { shareparams } = this.data;
      fetch({
        url: `${urls._club}/${shareparams.clubId}/statisticsShare`,
        success: body => {
          this.triggerEvent('shareNum',body.ShareNumber,);
        }
      })
    }
  }
})
