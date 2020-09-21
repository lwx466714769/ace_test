// game/party-detail/party-detail.js
import urls from '../../utils/urls.js';
import { fetch,formatDate, needJoin, formatMsgTime,isClubMember,login } from '../../utils/utils.js';
import constv from '../../const.js'
Page({

  /**
   * 页面的初始数据
   */
  data: {
    editDate:false,
    memberList:[],
    clickDay:false,
    comments:[],
    joinMember:[],
    replyRelateType:'PARTY',
    page:0,
    size:10
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (ops) {
    const {userId} = wx.getStorageSync('user');
    let todayDate = new Date().getTime();
    let partyId;
    if (ops.scene) {
      partyId = parseInt(ops.scene);
    } else {
      partyId = ops.partyId;
    }
    if (ops.scene || ops.isShare) {
      this.setData({ fromScene: true });
    }
    this.setData({ partyId, userId, todayDate }, this.initPage);
  },
  initPage(){
    this.getPartyDetail();
    this.getComment(true);
  },
  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onShow: function () {
    const { chooseDate, joinClubState, isUpdate} = this.data;
    if(chooseDate){
      this.initPage();
    }
    if(joinClubState){
      this.getPartyDetail();
    }
    if(isUpdate){
      this.getComment(true);
    }
  },
  onReady(){
    this.share = this.selectComponent('#share');
  },
  onUnload(){
    this.setData({chooseDate:false,joinClubState:false})
  },
  onHide() {
    this.setData({ chooseDate: false, joinClubState: false })
  },
  getPartyDetail(){
    const {partyId} = this.data;
    fetch({
      url:`${urls.party}/${partyId}`,
      loading:'加载中...',
      success:body=>{
        isClubMember(body.clubId).then((status)=>{
          console.log(status)
          this.setData({ isClubMember: status })
        })
        this.setData({joinEndTime:body.joinEndTime});
        body.createAt = formatMsgTime(body.createAt);
        body.startTime = formatDate(body.startTime,'-',true);
        body.endTime = formatDate(body.endTime,'-',true);
        body.joinEndTime = formatDate(Number(body.joinEndTime),'/',true);
        body.defineStartTime = formatDate(body.defineStartTime, '.',true);
        body.defineEndTime = formatDate(body.defineEndTime, '.',true);
        console.log(body)
        if (body.partyType == "JOIN"){
          this.getJoinMember();
        }else{
          this.getPartyDate();
        }
        if(body.timeList){
          let timeList = JSON.parse(JSON.stringify(body.timeList));
          timeList.map(item=>{
            item.startTime = formatDate(item.startTime,'',true);
            item.endTime = formatDate(item.endTime,'',true);
          })
          this.setData({ timeList})
        }
        this.setData({ party: body})
      }
    })
  },
  getPartyDate(){
    const {partyId} = this.data;
    fetch({
      url:`${urls.party}/${partyId}/selectPartyNumber`,
      success:body=>{
        this.setData({ countList: body })
      }
    })
  },
  onClickDay(e){
    console.log(e);
    const {date,dateString} = e.detail;
    const { partyId } = this.data;
    fetch({
      url: `${urls.party}/${partyId}/PeopleList`,
      data: { 
        partyId,
        date:dateString
       },
      success: body => {
        let curDate = `${date.year}年${date.month}月${date.day}日`
        this.setData({memberList:body,clickDay:true,curDate})
      }
    })
  },
  editDate(e){
    const { userId } = wx.getStorageSync('user');
    if (userId) {
      const { party, isClubMember } = this.data;
      if (isClubMember) {
        wx.navigateTo({
          url: `/game/party-detail-change/party-detail-change?partyId=${party.partyId}`
        })
      } else {
        needJoin(party.clubId, '报名需加入俱乐部');
      }
      
    }else{
      login(e,()=>{
        this.initPage(() => {
          this.editDate(e);
        })
      })
    }
  },
  // 获取立即报名参与人员
  getJoinMember(){
    const { partyId,userId } = this.data;
    fetch({
      url: `${urls.party}/${partyId}/selectState`,
      method: 'GET',
      data: { partyId,userId },
      success: body => {
        this.setData({joinMember:body.peopleList,isJoin:body.partyState})
      }
    })
  },
  // 立即参与
  joinParty(e){
    const { userId } = wx.getStorageSync('user');
    if (userId) {
      const { party, joinMember, isClubMember } = this.data;
      if (isClubMember) {
        if (party.maxJoinLimitNum && joinMember.length==party.maxJoinLimitNum){
          wx.showToast({
            title: '已达到参与人数限制',
            icon:'none'
          })
          return;
        }
        wx.showModal({
          content: '参与后不可取消',
          success:res=>{
            if(res.confirm){
              fetch({
                url: `${urls.party}/Party`,
                method: 'POST',
                data: { partyId:party.partyId },
                success: body => {
                  wx.showToast({
                    title: '参与成功',
                  })
                  this.getJoinMember();
                }
              })
            }
          }
        })
      } else {
        needJoin(party.clubId, '报名需加入俱乐部');
      }
    }else{
      login(e,()=>{
        this.getPartyDetail(()=>{
          this.joinParty(e);
        })
      })
    }
  },
  delParty(){
    wx.showModal({
      content: '确定要删除吗',
      success:res =>{
        if(res.confirm){
          const {partyId} = this.data;
          fetch({
            url:`${urls.party}/${partyId}`,
            method:'DELETE',
            success:body=>{
              let pages = getCurrentPages();
              let prePage = pages[pages.length-2];
              prePage.setData({updateParty:true})
              wx.showToast({
                title: '删除成功',
              })
              setTimeout(()=>{
                wx.navigateBack()
              },500)
            }
          })
        }
      }
    })
    
  },
  goMemberList(){
    const {partyId} = this.data;
    wx.navigateTo({
      url: `/game/member-list/member-list?partyId=${partyId}`
    })
  },
  //点赞
  likeEvent(e) {
    console.log(e);
    const _this = this;
    let type = '';
    if (e == 'SHARE') {
      type = 'SHARE';
    } else {
      type = e.currentTarget.dataset.type;
    }
    const { partyId, party} = this.data;
    const { userId } = wx.getStorageSync('user');
    if (userId) {
        const url = urls.statistics;
        const data = {
          type: 'PARTY',
          userId: userId,
          likedObjectId: partyId,
          likeStepType: type
        }
        const success = body => {
          if (party.likeNumberVO.collectionState) {
            party.likeNumberVO.collectionState = false;
            wx.showToast({
              title: '取消收藏',
              icon: 'none'
            })
          } else {
            party.likeNumberVO.collectionState = true;
            wx.showToast({
              title: '收藏成功',
              icon: 'none'
            })
          }
          _this.setData({ party });

        }
        const fail = body => {
          wx.showToast({
            title: '请检查网络',
            icon: 'none'
          })
        }
        fetch({ url, method: 'POST', data, fail, json: true, success })
    } else {
      login(e, () => {
        this.initPage(() => {
          this.likeEvent(e);
        })
      });
    }
  },
  /**
   * 用户点击右上角分享
   */
  onShareAppMessage() {
    const { partyId, party } = this.data;
    let imageUrl = party.background || '/images/banner.png';
    let title = party.name;
    let path = `/game/party-detail/party-detail?partyId=${partyId}&isShare=true`;
    return { title, path, imageUrl }
  },
  getPartyQrcode() {
    const { partyId, party } = this.data;
    const data = {
      feedType: 'PARTY',
      relateId: partyId,
      url: `game/party-detail/party-detail`,
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
  showShare() {
    this.getPartyQrcode().then(() => {
      this.share.showShare();
    })
  },
  getComment(refresh = false) {
    console.log(refresh);
    if (refresh) {
      this.setData({ comments: [], page: 0, showAll: '加载中...' })
    }
    const { page, size, replyRelateType, showAll, partyId, comments } = this.data;
    fetch({
      url: urls.reply,
      data: {
        relateId: partyId,
        replyRelateType,
        page,
        size
      },
      success: body => {
        if (body.length == 0) {
          this.setData({ showAll: true });
        }
        body.map(item => {
          item.createAt = formatMsgTime(item.createAt);
        })
        let list = refresh ? body : [...comments, ...body];
        this.setData({ comments: list });
      }
    })
  },
  onReachBottom() {
    const { showAll, page } = this.data
    if (!showAll || showAll == '加载中...') {
      this.setData({ page: page + 1 }, this.getComment);

    }
  },
  // 评论
  goComment(e) {
    const { party, isClubMember } = this.data;
    const { userId } = wx.getStorageSync('user');
    if (userId) {
      if (isClubMember) {
        wx.navigateTo({
          url: `/pages/upload-comment/upload-comment?id=${party.partyId}&isFrom=PARTY`,
        })
      } else {
        needJoin(party.clubId, '评论该帖需加入俱乐部');
      }
    } else {
      login(e, () => {
        this.initPage(()=>{
          this.goComment(e);
        })
      })
    }
  },
  //删除评论
  delComment(e) {
    const { comments, party } = this.data;
    const replyId = e.currentTarget.dataset.id;
    const url = `${urls.reply}/${replyId}`;
    wx.showModal({
      title: '',
      content: '确认要删除吗？',
      success: (res) => {
        const success = body => {
          wx.showToast({
            title: '删除成功',
            duration: 2000,
            success: res => {
              let comment = comments.filter(item => item.replyId != replyId);
              this.setData({ comments: comment });
            }
          })
        }
        const fail = body => {
          wx.showToast({
            title: '删除失败',
            icon: 'none'
          })
        }
        if (res.confirm) {
          fetch({ url, method: 'DELETE', loading: '正在删除', success, fail })
        }
      }
    })
  },
  preview(e) {
    const { url, imgs } = e.currentTarget.dataset;
    wx.previewImage({
      urls: imgs,
      current: url
    })
  },
  // 举报
  toReport(){
    const {partyId} = this.data;
    wx.navigateTo({
      url: `/pages/report/report?id=${partyId}&type=PARTY`,
    })
  },
  onPageScroll(e) {
    const { fromScene } = this.data;
    if (fromScene) {
        if (e.scrollTop > 100) {
          this.setData({ showBackClub: true });
        } else {
          this.setData({ showBackClub: false });
        }
    }
  }
})