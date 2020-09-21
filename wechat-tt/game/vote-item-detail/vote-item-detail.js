// game/vote-item-detail/vote-item-detail.js
import urls from '../../utils/urls.js';
import { fetch, formatDate, needJoin, formatMsgTime, isClubMember, login,shareDrawClub } from '../../utils/utils.js'
import constv from '../../const.js'
Page({

  /**
   * 页面的初始数据
   */
  data: {

  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (ops) {
    console.log(ops);
    let curDate = new Date().getTime();
    let itemId,voteId;
    if(ops.scene){
      let scene = decodeURIComponent(ops.scene);
      let sceneId = scene.split('&');
      console.log(sceneId);
      this.setData({ voteId: sceneId[0], itemId: sceneId[1]})
    }else{
      this.setData({voteId:ops.voteId,itemId:ops.itemId})
    }
    if(ops.isShare){
      this.setData({isShare:true});
    }
    this.setData({ curDate},this.getPartyDetail)
  },
  onReady() {
    this.backendModal = this.selectComponent('#backendModal');
    this.share = this.selectComponent('#share');
  },
  getPartyDetail() {
    const { voteId,itemId} = this.data;
    fetch({
      url: `${urls.vote}/${voteId}`,
      loading: '加载中...',
      success: body => {
        isClubMember(body.clubId).then((status) => {
          this.setData({ isClubMember: status })
        })
        this.setData({ joinEndTime: body.joinEndTime });
        body.createAt = formatMsgTime(body.createAt);
        body.startTime = formatDate(body.startTime, '.', true);
        body.endTime = formatDate(body.endTime, '.', true);
        body.joinEndTime = formatDate(Number(body.joinEndTime), '', true);
        console.log(body)
        let curItem = body.voteItem.find(item=>item.voteItemId == itemId);
        this.setData({ party: body,curItem}, this.getVoteCount);
        this.shareDrawClub();
      }
    })
  },
  getVoteCount() {
    const { voteId,party } = this.data;
    fetch({
      url: `${urls.vote}/${voteId}/Vote`,
      loading: '加载中...',
      success: body => {
        const ticketCount = body.voteinfo;
        party.voteItem.map(o => {
          if (ticketCount[o.voteItemId]) {
            o.ticket = ticketCount[o.voteItemId];//票数
            o.percent = Math.round(ticketCount[o.voteItemId] / body.total * 100);    //占比

            body.optionIds.map(id => {
              if (id == o.voteItemId) {
                o.choose = true;//是否选择
              }
            })
          }
        })
        this.setData({voteCount: body })
      }
    })
  },
  // 去投票
  toVote(e) {
    const { party, isClubMember } = this.data;
    const userId = wx.getStorageSync('user');
    if(userId){
      if (party.voteAuth == "MEMBER" && !isClubMember) {
        needJoin(party.clubId, '投票需加入俱乐部');
      } else {
        if (party.maxSelectItem>1) {
          let modal = {
            modalCon: ['此投票为多选', '确认后将不能再投'],
            confirmFn: ()=>{
              this.confirmFn();
            }
          }
          this.setData({ modal }, () => {
            this.backendModal.show();
          });
        } else {
          this.confirmFn();
        }
      }
    }else{
      login(e,()=>{
        this.getPartyDetail(()=>{
          this.toVote(e);
        })
      })
    }
    
  },
  // 确认投票
  confirmFn() {
    const { voteId, party, curItem, isShare, voteCount} = this.data;
    fetch({
      url: `${urls.party}/Votes/${voteId}`,
      method: 'POST',
      data: [curItem.voteItemId],
      json: true,
      success: body => {
        if(isShare){
          this.setData({
            ['voteCount.partyState']:true
          })
        }else{
          let pages = getCurrentPages();
          let prePage = pages[pages.length - 2];
          prePage.setData({ voteItemUpdate: true })
          wx.showToast({
            title: '投票成功',
          })
          setTimeout(() => {
            wx.navigateBack()
          }, 500)
        }
        
      }
    })
  },
  
  showShare() {
    this.getPartyQrcode().then(() => {
      this.share.showShare();
    })
  },
  onShareAppMessage() {
    const { voteId, itemId, party, shareImg } = this.data;
    let imageUrl = shareImg || 'https://img.acegear.com/382802b55176798524e03f9d0cea96dd4a6c2323/w700_1';
    let title = party.name;
    let path = `/game/vote-item-detail/vote-item-detail?voteId=${voteId}&itemId=${itemId}&isShare=true`;
    return { title, path, imageUrl }
  },
  shareDrawClub() {
    let ctx = wx.createCanvasContext('myCanvas', this);
    const { party } = this.data;
    let background = party.background || 'https://img.acegear.com/382802b55176798524e03f9d0cea96dd4a6c2323/w700_1';
    shareDrawClub(ctx, background, party.clubLogo, party.clubName, (img) => {
      this.setData({ shareImg: img });
    }, '/images/icon-vote-stamp.png')
  },
  getPartyQrcode() {
    const { voteId, itemId, party } = this.data;
    const data = {
      feedType: 'VOTE',
      relateId: voteId,
      childrenId:itemId,
      url: `game/vote-item-detail/vote-item-detail`,
      appType: constv.app_type
    }
    return new Promise((resolve, reject) => {
      fetch({
        url: `${urls.getCode}`,
        data: data,
        loading: '加载中...',
        success: body => {
          party.qrcode = body;
          this.setData({ party });
          resolve();
        },
        fail: body => {
          wx.showToast({ title: body.message, icon: 'none', });
        }
      })
    })
  },
  preview(e) {
    const { url, imgs } = e.currentTarget.dataset;
    // const urls = imgs.map(o => o.type === 'IMAGE' || o.type === 'COVER' ? o.content : '').filter(o => o)
    wx.previewImage({
      urls:imgs,
      current: url
    })
  },
})