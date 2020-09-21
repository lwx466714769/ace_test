// club/introduce/introduce.js
import urls from '../../utils/urls.js';
import { fetch } from '../../utils/utils.js'
import WxParse from "../../utils/wxParse/wxParse.js";
import constv from '../../const.js'
Page({
  /**
   * 组件的初始数据
   */
  data: {
    qrcode:'',
    clubId:constv.cid
  },
  onLoad(){
    this.initPage();
  },
  initPage(){
    // this.getClub();
    this.getClubInfo();
    this.getClubManager();
    this.getQrcode();
  },
  // 获取基本信息
  getClub() {
    const { clubId } = this.data;
    const url = `${urls._exemption}/club/${clubId}`;
    const success = body => {
      if (body.address){
        if (body.address){
          body.address.address = body.address.address.slice(0, 2);
        }
      }
      if (body.benefit){
          body.newBenefit = body.benefit.split(`\n`);
      }
      if (body.term){
          body.newTerm = body.term.split(`\n`);
      }
      if (!body.info){
        body.info="暂无";
      }
      this.setData({ club: body });
    }
    const fail = () => {
      wx.showToast({
        title: '获取信息失败',
        icon: 'none'
      })
    }
    return fetch({ url, success, fail, loading: '加载中...' })
  },
  // 获取详情信息
  getClubInfo() {
    const { clubId } = this.data;
    const _this=this;
    const  url=`${urls._verify}/club/${clubId}`
    const success = body => {
      // body.introduction = body.introduction.map(item => {
      //   if(item.extra){
      //     item.extra = JSON.parse(item.extra);
      //   }
      //   return item;
      // })
      // this.setData({ introduction: body.introduction });
      if (body.address){
        if (body.address){
          body.address.address = body.address.address.slice(0, 2);
        }
      }
      if (body.benefit){
        body.newBenefit = body.benefit.split(`\n`);
      }
      if (body.term){
        body.newTerm = body.term.split(`\n`);
      }
      if (!body.info){
        body.info="暂无";
      }
      this.setData({ club: body });

        if (body.introduction) {
            body.introduction = body.introduction.replace(/\/n/g,'</p><p>');
            WxParse.wxParse('article', 'html', body.introduction, _this, 0);
        }
    }
    const fail = () => {
      wx.showToast({
        title: '获取信息失败',
        icon: 'none'
      })
    }
    return fetch({ url, success, fail, loading: '加载中...' })
  },
  getClubManager() {
    const { clubId } = this.data;
    const url=`${urls._exemption}/club/founder/${clubId}?page=0&count=10`
    const success = body => {
      this.setData({ manager:body});
    }
    const fail = () => {
      wx.showToast({
        title: '获取信息失败',
        icon: 'none'
      })
    }
    return fetch({ url, success, fail, loading: '加载中...' })
  },
  getQrcode(){
    const {clubId} = this.data;
    fetch({
      url: `${urls._clubs}/${clubId}/wechatqrcode`,
      success:body=>{
        if(body){
          this.setData({ qrcode: body});
        }
      }
    })
  },
  previewQrcode(e){
    const {url} = e.currentTarget.dataset;
    wx.previewImage({
      urls: [url],
      current:url
    })
  }
})
