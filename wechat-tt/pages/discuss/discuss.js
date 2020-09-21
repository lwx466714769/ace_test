// pages/discuss/discuss.js
import urls from '../../utils/urls.js';
import {
  fetch,
  formatPostsAce,
  getTextFromHTML,
  formatDate,
  postData,
  login,
  formatMsgTime,
  needJoin,
  shareDrawClub
} from '../../utils/utils.js'
import constv from '../../const.js'
Page({

  /**
   * 页面的初始数据
   */
  data: {
    clubId: constv.cid,
    posts: [],
    page: 0,
    count: 10,
    showAll: '加载中...',
    isClubMember: false,
    isFrom: 'club',
    clearUser: 'off', //用户信息是否更新
    showUpload: false, //热议是否显示视频，上传按钮
    isOnLoad: false,
    voteItemColor: ['#D0021B', '#7ED321', '#F5A623', '#4A90E2'],
    voteImages: [
      'https://img.acegear.com/228bc0ebba9a5017ee0a751d89d2798bda6cafd3/w700_1', 'https://img.acegear.com/764d8165964530dccff252461dcbaa568942298b/w700_1', 'https://img.acegear.com/382802b55176798524e03f9d0cea96dd4a6c2323/w700_1'
    ],
    partyImages: [
      'https://img.acegear.com/bb9b9787b294b435fa45d198e809fa71983a2699/w700_1', 'https://img.acegear.com/d20e16bb0095fef5753fc2a1087a1f3f9e72448d/w700_1', 'https://img.acegear.com/d1b977aa0e9587269a205370b73062a7c401b229/w700_1'
    ],
    tabList: [
      { index: 0, name: '热议', render: true }
      // { index: 1, name: '资讯', render: false }
    ],
    curIndex:0
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    this.getPostData(true);
  },
  onReady() {
    this.trends = this.selectComponent('#trends');
    this.share = this.selectComponent('#share');
  },
  onShow(){
    let { updateParty, updateEvent, isUpdate} = this.data;
    if(updateParty||updateEvent,isUpdate){
      this.getPostData(true);
    } 
  },
  getPostData(refresh = false) {
    if (refresh) {
      this.setData({
        posts: [],
        page: 0,
        showAll: '加载中...'
      })
    }
    const {
      page,
      count,
      posts,
      clubId,
      logo,
      clubName,
      voteImages,
      partyImages
    } = this.data;
    const {userId} = wx.getStorageSync('user');
    const url = `${urls._verify}/hotdiscuss/${clubId}`;
    const data = {
      page,
      count,
      userId:userId?userId:''
    };
    const success = body => {
      this.setData({
        loadPostData: true
      })
      wx.stopPullDownRefresh();
      if (body.length == 0) {
        this.setData({
          showAll: true
        })
      }
      body.map(item => {
        item.logo = item.clubInfo.clubLogo ? item.clubInfo.clubLogo : logo;
        item.clubName = item.clubInfo.clubName ? item.clubInfo.clubName : clubName;
        item.clubId = item.clubInfo.clubId ? item.clubInfo.clubId : clubId;
        item.createAt = formatMsgTime(item.createAt);
        item.commentInfoList && item.commentInfoList.map(o => {
          o.content = getTextFromHTML(o.content);
        })
        if (item.postType == 'TEXT') {
          item.postTextInfo.text = getTextFromHTML(item.postTextInfo.text);
        } else if (item.postType == 'LONGTEXT') {
          item.postLongTextInfo.summary = getTextFromHTML(item.postLongTextInfo.summary);
        } else if (item.postType == 'VIDEO') {
          item.postVideoInfo.text = getTextFromHTML(item.postVideoInfo.text);
        }
        if (item.relateType == 'VOTE' && !item.voteInfo.background) {
          let randomNum = parseInt(Math.random() * 3);
          item.voteInfo.background = voteImages[randomNum];
        }
        if (item.relateType == 'PARTY') {
          if (item.partyInfo.startTime) {
            let startTime = formatDate(item.partyInfo.startTime, '-', true);
            startTime = startTime.split(' ');
            let endTime = formatDate(item.partyInfo.endTime, '-', true);
            endTime = endTime.split(' ');
            item.startDate = startTime[0];
            item.startTime = startTime[1];
            item.endDate = endTime[0];
            item.endTime = endTime[1];
          }
          if (!item.partyInfo.background) {
            let randomNum = parseInt(Math.random() * 3);
            item.partyInfo.background = partyImages[randomNum];
          }
        }
        return item;
      })
      let list = refresh ? body : [...posts, ...body];
      console.log(list);
      this.setData({
        posts: list
      });
    }
    const fail = body => {
      wx.showToast({
        title: body.message,
        icon: 'icon'
      })
    }
    fetch({
      url,
      data,
      success,
      fail,
      loading: '加载中...'
    });
  },
  goPostDetail(e) {
    const {
      posts,
      isClubMember,
      isFrom
    } = this.data;
    const {
      id
    } = e.currentTarget.dataset;
    const post = posts.find(item => item.relateId == id);
    wx.navigateTo({
      url: `/pages/post-detail/post-detail?postId=${post.relateId}&clubId=${post.clubInfo.clubId}&logo=${post.clubInfo.clubLogo}&clubName=${post.clubInfo.clubName}&isClubMember=${isClubMember}&isFrom=${isFrom}`
    })
  },
  goVoteDetail(e) {
    const {
      posts,
      isClubMember,
      isFrom
    } = this.data;
    const {
      id
    } = e.currentTarget.dataset;

    const post = posts.find(item => item.relateId == id);
    wx.navigateTo({
      url: `/game/vote-detail/vote-detail?voteId=${post.relateId}&clubId=${post.clubInfo.clubId}&logo=${post.clubInfo.clubLogo}&clubName=${post.clubInfo.clubName}&isClubMember=${isClubMember}&isFrom=${isFrom}`
    })

  },
  goPartyDetail(e) {
    const {
      posts,
      isClubMember,
      isFrom
    } = this.data;
    const {
      id
    } = e.currentTarget.dataset;

    const post = posts.find(item => item.relateId == id);
    wx.navigateTo({
      url: `/game/party-detail-join/party-detail-join?partyId=${post.relateId}&clubId=${post.clubInfo.clubId}&logo=${post.clubInfo.clubLogo}&clubName=${post.clubInfo.clubName}&isClubMember=${isClubMember}&isFrom=${isFrom}`
    })

  },
  showMember(e) {
    const {clubId} = this.data;
    wx.navigateTo({
      url: `/club/member/member?clubId=${clubId}`
    })
  },
  showUpload(e) {
    const { userId } = wx.getStorageSync('user');
    if (userId) {
        this.setData({ showUpload: !this.data.showUpload });
    } else {
      login(e, () => {
        this.setData({ clearUser: 'on' });
        this.showUpload(e);
      })
    }
  },
  onReachBottom() {
    const { showAll, page,curIndex } = this.data;
    if (showAll == '加载中...') {
      this.setData({ page: page + 1 }, ()=>{
        if(curIndex == 0){
          this.getPostData();
        }else{
          this.trends.reachBottomData();
        }
      })
    };
  },
  onPullDownRefresh() {
    this.setData({ loadPostData: false });
    this.setData({ posts: [], page: 0, showAll: '加载中...' }, this.getPostData);
  },
  //热议点赞
  postLikeEvent(e) {
    const _this = this;
    const { posts } = this.data;
    const { userId } = wx.getStorageSync('user');
    if (userId) {
      const { id, like } = e.currentTarget.dataset;
      // const method = like ? 'DELETE' : 'POST';
      // const url = `${urls._post}/${id}/like`;
      const method = 'POST';
      const url = urls.statistics;
      const data = {
        type: 'POST',
        userId: userId,
        likedObjectId: id,
        likeStepType: 'COLLECTION',
        clubId:constv.cid
      }
      const success = body => {
        let post = posts.find(item => item.relateId == id);
        post.likeNumberVO.collectionNumber = body.collectionNumber;
        if (post.likeNumberVO.collectionState) {
          post.likeNumberVO.collectionState = false;
          post.likeNumberVO.likeState = false
          wx.showToast({
            title: '取消收藏',
            icon: 'none'
          })
        } else {
          post.likeNumberVO.collectionState = true;
          post.likeNumberVO.likeState = true
          wx.showToast({
            title: '收藏成功',
            icon: 'none'
          })
        }
        console.log("完成后", JSON.stringify(post));
        _this.setData({ posts });
      }
      const fail = body => {
        wx.showToast({
          title: body.message,
          icon: 'none'
        })
      }
      fetch({ url, method, data, fail, json: true, loading: '加载中...', success })
    } else {
      login(e, () => {
        this.setData({ clearUser: 'on' }, () => {
          this.getPostData(true, () => {
            this.postLikeEvent(e);
          })
        });
      }, 'club')
    }
  },
  // 投票收藏
  partyLikeEvent(e) {
    const _this = this;
    const { posts } = this.data;
    const { userId } = wx.getStorageSync('user');
    const { id, type } = e.currentTarget.dataset;
    if (userId) {
      const url = urls.statistics;
      const data = {
        type: type,
        userId: userId,
        likedObjectId: id,
        likeStepType: 'COLLECTION',
        clubId:constv.cid
      }
      const success = body => {
        let post = posts.find(item => item.relateId == id);
        if (post.likeNumberVO.collectionState) {
          post.likeNumberVO.collectionState = false;
          wx.showToast({
            title: '取消收藏',
            icon: 'none'
          })
        } else {
          post.likeNumberVO.collectionState = true;
          wx.showToast({
            title: '收藏成功',
            icon: 'none'
          })
        }
        _this.setData({ posts });

      }
      const fail = body => {
        wx.showToast({
          title: body.message,
          icon: 'none'
        })
      }
      fetch({ url, method: 'POST', data, fail, json: true, loading: '加载中...', success })
    } else {
      login(e, () => {
        this.setData({ clearUser: 'on' }, () => {
          this.getPostData(true, () => {
            this.voteLikeEvent(e);
          })
        });
      })
    }
  },
  // //posts评论
  goComment(e) {
    console.log(e);
    const { id, type } = e.currentTarget.dataset;
    const { userId } = wx.getStorageSync('user');
    if (userId) {
      wx.navigateTo({
        url: `/pages/upload-comment/upload-comment?id=${id}&isFrom=${type}`,
      })
    } else {
      login(e, () => {
        this.setData({ clearUser: 'on' }, () => {
          this.getPostData(true, () => {
            this.goComment(e);
          })
        });
      })
    }
  }, 
  changeTab(e){
    const { index, state } = e.detail;
    this.setData({ curIndex: index,page:0 });
    console.log(state);
    if(state){
      if(index == 0){
        this.getPostData();
      }else{
        this.trends.getData();
      }
    }
    
  },
  showShare(e) {
    console.log(e);
    const { type, id } = e.currentTarget.dataset;
    const shareId = e.target.id;
    const equip = e.detail;
    const { posts } = this.data;
    let ctx = wx.createCanvasContext('myCanvas', this);
    let data;
    wx.showLoading({
      title: '加载中...',
    })
    // media 为资讯的验证
    if (type == 'post'|| shareId == 'media') {
      let post;
      if (shareId == 'media') {
        post = e.detail;
      } else {
        post = posts.find(item => item.relateId == id);
      }
      console.log(post);
      if (post.postType == 'TEXT') {
        post.info = post.postTextInfo.text;
        post.cover = post.postTextInfo.images[0].url;
      } else if (post.postType == 'LONGTEXT') {
        post.info = post.postLongTextInfo.title;
        post.cover = post.postLongTextInfo.cover.url;
      } else if (post.postType == 'VIDEO') {
        post.info = post.postVideoInfo.text;
        post.cover = post.postVideoInfo.video.cover;
      }
      post.nickname = post.userInfo.userName;
      post.avatar = post.userInfo.userLogo;
      this.setData({ shareType: 'post', post }, () => {
        data = {
          feedType: 'POST',
          relateId: post.relateId,
          url: 'pages/post-detail/post-detail',
          appType: constv.app_type
        }
        shareDrawClub(ctx, post.cover, post.clubInfo.clubLogo, post.clubInfo.clubName, (img) => {
          this.setData({ shareImg: img });
          this.getQrcode(data, 'post').then(() => {
            wx.hideLoading();
            this.share.showShare();
          })
        })
      });
    } else if (type == 'vote') {
      let vote = posts.find(item => item.relateId == id);
      this.setData({ shareType: 'vote', vote, shareparams: vote }, () => {
        data = {
          feedType: 'VOTE',
          relateId: vote.relateId,
          url: 'game/vote-detail/vote-detail',
          appType: constv.app_type
        }
        shareDrawClub(ctx, vote.voteInfo.background, vote.clubInfo.clubLogo, vote.clubInfo.clubName, (img) => {
          console.log(img);
          this.setData({ shareImg: img });
          this.getQrcode(data, 'vote').then(() => {
            wx.hideLoading();
            this.share.showShare();
          })
        }, '/images/icon-vote-stamp.png')
      });
    } else if (type == 'party') {
      let party = posts.find(item => item.relateId == id);
      this.setData({ shareType: 'party', party, shareparams: party }, () => {
        data = {
          feedType: 'PARTY',
          relateId: party.relateId,
          url: 'game/party-detail-join/party-detail-join',
          appType: constv.app_type
        }
        shareDrawClub(ctx, party.partyInfo.background, party.clubInfo.clubLogo, party.clubInfo.clubName, (img) => {
          this.setData({ shareImg: img });
          this.getQrcode(data, 'party').then(() => {
            wx.hideLoading();
            this.share.showShare();
          })
        }, '/images/icon-party-stamp.png')
      });
    } else if (shareId == 'equip') {
      this.setData({ shareType: 'equip', equip, shareparams: equip }, () => {
        data = {
          feedType: 'EQUIP',
          relateId: equip.equipId,
          url: 'equip/my-equip-new/my-equip-new',
          // url: 'equip/equip-detail/equip-detail',
          appType: constv.app_type
        }
        shareDrawClub(ctx, equip.background, equip.clubLogo, equip.clubName, (img) => {
          this.setData({ shareImg: img });
          this.getQrcode(data, 'equip').then(() => {
            wx.hideLoading();
            this.share.showShare();
          })
        }, '/images/icon-equip-stamp.png')
      });
    }
  },
  getQrcode(data, type) {
    const { post, vote, equip, party } = this.data;
    return new Promise((resolve, reject) => {
      fetch({
        url: `${urls.getCode}`,
        data: data,
        loading: '加载中...',
        success: body => {
          console.log("得到的二维码", body.toString());
          switch (type) {
            case 'post': post.qrcode = body; this.setData({ shareparams: post }); break;
            case 'equip': equip.qrcode = body; this.setData({ shareparams: equip }); break;
            case 'vote': vote.qrcode = body; this.setData({ shareparams: vote }); break;
            case 'party': party.qrcode = body; this.setData({ shareparams: party }); break;
          }
          resolve();
        },
        fail: body => {
          wx.showToast({ title: body.message, icon: 'none', });
        }
      })
    })
  },
  // 分享给朋友
  onShareAppMessage(res) {
    let type, id;
    if (res.target) {
      type = res.target.dataset.type;
      id = res.target.dataset.id;
    }
    let { shareImg } = this.data;
    if (type == 'post') {
      if (res.from === 'button') {
        const { post } = this.data;
        console.log(post);
        let imageUrl, title;
        if (post.postType == 'TEXT') {
          title = post.postTextInfo.text;
          imageUrl = post.postTextInfo.images[0].url;
        } else if (post.postType == 'LONGTEXT') {
          title = post.postLongTextInfo.title;
          imageUrl = post.postLongTextInfo.cover.url;
        } else if (post.postType == 'VIDEO') {
          title = post.postVideoInfo.text;
          imageUrl = post.postVideoInfo.video.cover;
        }
        let path = `/pages/post-detail/post-detail?postId=${post.relateId}&isShare=true`;
        return { title, path, imageUrl: shareImg || imageUrl }
      }
    } else if (type == 'equip') {
      if (res.from === 'button') {
        const { equip } = this.data;
        console.log(equip);
        let equipTitle = equip.brandName || equip.appealContent[0].value + ' ' + equip.appealContent[1].value;
        let equipPath = `/equip/my-equip-new/my-equip-new?id=${equip.equipId}&isShare=true&clubId=${equip.clubId}&clubName=${equip.clubName}&clubLogo=${equip.clubLogo}`;
        let equipImageUrl = shareImg || equip.background;
        this.equip.likeEvent('SHARE');
        return { title: equipTitle, path: equipPath, imageUrl: equipImageUrl }
      }
    } else if (type == 'vote') {
      if (res.from === 'button') {
        const { vote } = this.data;
        let voteImageUrl = shareImg || '/images/banner.png';
        let voteTitle = vote.voteInfo.name;
        let votePath = `/game/vote-detail/vote-detail?voteId=${vote.relateId}&isShare=true`;
        return { title: voteTitle, path: votePath, imageUrl: voteImageUrl }
      }
    } else if (type == 'party') {
      if (res.from === 'button') {
        const { party } = this.data;
        let partyImageUrl = shareImg || '/images/banner.png';
        let partyTitle = party.partyInfo.name;
        let partyPath = `/game/party-detail-join/party-detail-join?partyId=${party.relateId}&isShare=true`;
        return { title: partyTitle, path: partyPath, imageUrl: partyImageUrl }
      }
    }
  },
})