
import urls from '../../utils/urls.js';
import { fetch, bindPhone, formatPosts, getTextFromHTML, formatMsgTime, formatDate, login, shareDrawClub,getQrcode } from '../../utils/utils.js';
import WxParse from "../../utils/wxParse/wxParse";
import constv from '../../const.js';

Page({

  /**
   * 页面的初始数据
   */
  data: {
    authorized: false,
    page: 0,
    size: 10,
    count: 10,
    post: null,
    comments: [],
    img: '../../images/icon-like.png',
    showAll: '',
    reads: [],
    postId: null,
    isClubMember: false,
    longContens: [],
    replyRelateType: 'POST',
    // body:{"userTagName":"张飞,亚瑟","userTagType":{"name":"CHANNEL"},"id":52,"userId":0,"createAt":null},
  },

  onLoad: function (ops) {
    console.log(ops)
    const { userId, userPhone } = wx.getStorageSync('user');
    if (userId) {
      this.setData({ userId });
    }
    if (ops.logo) {
      this.setData({ logo: ops.logo, clubName: ops.clubName })
    }
    if (ops.isFrom == 'club') {
      this.setData({ isFrom: ops.isFrom, isClubMember: ops.isClubMember });
    } else if (ops.isFrom == 'trends') {
      this.setData({ isFrom: ops.isFrom });
    }

    if (ops.clubId) {
      this.setData({ clubId: ops.clubId });
    }
    let postId;
    if (ops.scene) {
      postId = ops.scene;
    } else {
      postId = ops.postId;
    }
    // 是否来自分享页面
    if (ops.scene || ops.isShare) {
      this.setData({ fromScene: true })
      console.log(this.data.fromScene);
    }
    // 是否来自资讯
    if (ops.feedEnum){
      this.setData({ feedEnum: ops.feedEnum})
    }
    // 俱乐部信息用来分享
    this.setData({ postId }, this.initPage);
  },
  onShow() {
    const { isUpdate } = this.data;
    if (isUpdate) {
      this.getComment(true);
    }
  },
  onHide() {
    this.setData({ isUpdate: false });
  },
  initPage() {
    this.getPosts();
    // this.getRead();
    this.getComment(true);
  },
  onReachBottom() {
    const { showAll, page } = this.data
    if (!showAll || showAll == '加载中...') {
      this.setData({ page: page + 1 }, this.getComment);

    }
  },
  getComment(refresh = false) {
    if (refresh) {
      this.setData({ comments: [], page: 0, showAll: '加载中...' })
    }
    const { page, size, replyRelateType, showAll, postId, comments } = this.data;
    fetch({
      url: urls.reply,
      data: {
        relateId: postId,
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
          item.contents = getTextFromHTML(item.contents);
        })
        let list = refresh ? body : [...comments, ...body];
        this.setData({ comments: list });
      }
    })
  },
  // 获取个人信息
  // getProfile() {
  //   const { postUserId } = this.data;
  //   fetch({
  //     url: `${urls._user}/${postUserId}/profile`,
  //     loading: '加载中...',
  //     success: body => {
  //       wx.stopPullDownRefresh();
  //       this.setData({ profile: body })
  //     }
  //   })
  // },
  // 关注粉丝
  // followHandle(e) {
  //   const {postUserId,profile} = this.data;
  //   const { userId } = wx.getStorageSync('user');
  //   if(userId){
  //     fetch({
  //       url: `${urls._user}/${postUserId}/follow`,
  //       method: 'POST',
  //       success: body => {
  //         wx.showToast({
  //           title: '已关注',
  //         })
  //         profile.follow = true;
  //         profile.followerCount++;
  //         this.setData({ profile });
  //       }
  //     })
  //   }else{
  //     login(e, () => {
  //       this.followHandle(e);
  //     });
  //   }
  // },
  // 取消关注
  // followCancel(e) {
  //   const { postUserId, profile } = this.data;
  //   fetch({
  //     url: `${urls._user}/${postUserId}/follow`,
  //     method: 'DELETE',
  //     success: body => {
  //       wx.showToast({
  //         title: '已取消',
  //       })
  //       profile.follow = false;
  //       profile.followerCount--;
  //       this.setData({ profile });
  //     }
  //   })
  // },

  //获取长文中的内容
  getLongContens() {
    const _this = this;
    const { postId } = this.data;
    const url = `${urls._verify}/hotdiscuss/${postId}/getContent?feedType=POST`;
    const data = { feedType: 'POST' };
    const success = body => {
      body = body.replace(/\/n/g, '</p><p>');
      WxParse.wxParse('article', 'html', body, _this, 0);
    }
    fetch({ url, data, success, json: true })
  },

  //获取最新详情
  getPosts() {
    let _this = this;
    const { page, count, postId, userId, clubId, feedEnum} = this.data;
    const url = `${urls._verify}/post/${postId}`;
    const data = { page, count, feedEnum:feedEnum?feedEnum:'' };
    const success = body => {
      if (body.clubInfo.clubId) {
        this.setData({ clubId: body.clubInfo.clubId });
      }
      let toContens;
      if (body.postType == 'LONGTEXT') {
        toContens = this.toLongContents(body);
        console.log(toContens);
        this.getLongContens();
      } else {
        toContens = this.toContents(body)
      }
      this.setData({ postUserId: body.userInfo.userId })
      this.formatPosts(body, toContens)
      let query = wx.createSelectorQuery();
      query.select('#detail').boundingClientRect();
      query.exec(function (res) {
        _this.setData({ detailHeight: (res[0].height) });
      });
      this.getPostNuberm()
    }
    const fail = data => {
      console.log('err', data)
    }
    fetch({ url, data, success, json: true, loading: "加载中", delay: 300 })
  },
  // 获取推荐阅读
  // getRead(){
  //   const {postId} = this.data;
  //   let id = 10;
  //   let comp = true;
  //   let url = `${urls._post}/${postId}/recommendRead`;
  //   const success = body =>{
  //    // let reads = body.feeds.map(this.format);
  //     let reads = body.feeds.map(o=>{
  //       let item = o.body;
  //       if(item.feedType === 'RECOMMEND_READ_POST'){
  //         let {contents,...obj} = item;
  //         let txtObj = contents.find(o=>o.type === 'TITLE'||o.type === 'TEXT');
  //         let imgObj = contents.find(o=>o.type === 'COVER'||o.type === 'IMAGE');
  //         obj.title = getTextFromHTML(txtObj.content);
  //         if(imgObj){
  //           obj.cover = imgObj.content;
  //         }
  //         return obj;
  //       }
  //       return item;
  //     })
  //     for (let o of reads){
  //       o.createAt = formatDate(o.createAt,'.',comp);
  //       o.date = o.createAt.split(' ')[0];
  //       o.time = o.createAt.split(' ')[1];
  //     }
  //     this.setData({reads:reads})
  //   }
  //   fetch({ url, success })
  // },
  // 推荐阅读详情
  // goPostsDetail(e) {
  //   let { id } = e.currentTarget.dataset;
  //   wx.navigateTo({ url: `/pages/post-detail/post-detail?postId=${id}` });
  // },
  preview(e) {
    const { url, imgs } = e.currentTarget.dataset;
    const urls = imgs.map(o => o.type === 'IMAGE' || o.type === 'COVER' ? o.content : '').filter(o => o)
    wx.previewImage({
      urls,
      current: url
    })
  },
  // 格式化数据，<obj | array> => <obj | array>
  // format(data) {
  //   const isArr = Array.isArray(data)
  //   data = isArr ? data : [data]
  //
  //   let results = data.map(o => {
  //     let { contents } = o.body
  //     contents = contents.map(item => {
  //       item.content = getTextFromHTML(item.content)
  //       if(item.extra){
  //         item.extra = JSON.parse(item.extra)
  //       }
  //       return item
  //     })
  //     return o.body
  //   })
  //   return isArr ? results : results[0]
  // },

  //格式化长文中内容，状态要分享的post
  toLongContents(post) {
    let contents = [];
    let pos = 1;
    if (post.postType == 'LONGTEXT') {
      if (post.postLongTextInfo.title) {
        contents.push({
          type: 'TITLE',
          content: post.postLongTextInfo.title,
          extra: null,
          pos: pos++
        })
      }
      if (post.postLongTextInfo.summary) {
        contents.push({
          type: 'SUMMARY',
          content: post.postLongTextInfo.summary,
          extra: null,
          pos: pos++
        })
      }
      if (post.postLongTextInfo.cover) {
        contents.push({
          type: 'IMAGE',
          content: post.postLongTextInfo.cover.url,
          extra: null,
          pos: pos++
        })
      }
    }
    return contents;
  },

  //格式化内容
  toContents(post) {
    let contents = [];
    let pos = 1;
    if (post.postType == 'TEXT') {
      if (post.postTextInfo.text) {
        contents.push({
          type: 'TEXT',
          content: post.postTextInfo.text,
          extra: null,
          pos: pos++
        })
      }
      if (post.postTextInfo.images) {
        let size = post.postTextInfo.images.length;
        for (let i = 0; i < size; i++) {
          contents.push({
            type: 'IMAGE',
            content: post.postTextInfo.images[i].url,
            extra: null,
            pos: pos++
          })
        }
      }
    } else if (post.postType == 'postLongTextInfo') {
      if (post.postLongTextInfo.title) {
        contents.push({
          type: 'TITLE',
          content: post.postLongTextInfo.title,
          extra: null,
          pos: pos++
        })
      }
      if (post.postLongTextInfo.summary) {
        contents.push({
          type: 'SUMMARY',
          content: post.postLongTextInfo.summary,
          extra: null,
          pos: pos++
        })
      }
      if (post.postLongTextInfo.cover) {
        contents.push({
          type: 'IMAGE',
          content: post.postLongTextInfo.cover,
          extra: null,
          pos: pos++
        })
      }
      //长文中的数据
      if (post.postLongTextInfo.contents) {
        //  let size=this.data.longContens.length;
        // for (let i = 0; i < size; i++) {
        //
        //   content={
        //
        //   }
        // }
        contents = [...contents, ...longContens];
      }
    } else if (post.postType == 'VIDEO') {
      if (post.postVideoInfo.text) {
        contents.push({
          type: 'TEXT',
          content: post.postVideoInfo.text,
          extra: null,
          pos: pos++
        })
      }
      if (post.postVideoInfo.video) {
        contents.push({
          type: 'VIDEO',
          content: post.postVideoInfo.video.url,
          extra: { cover: post.postVideoInfo.video.cover },
          pos: pos++
        })
      }
    }
    return contents;
  },

  formatPosts(obj, toContens) {
    const { logo, clubName } = this.data;
    const typeList = ['IMAGE']
    let post = obj;
    post.contents = toContens;
    let contents = post.contents

    // 将发表时间插入到第一个节点后，重置所有的pos
    // let time = formatMsgTime(post.createAt)
    let time = ""
    let timeNode = { type: 'TIME', content: time }
    contents.splice(1, 0, timeNode)
    for (let i = 0, len = contents.length; i < len; i++) {
      contents[i].pos = i
    }

    let images = contents
      .map(o => typeList.includes(o.type) ? o.content : "")
      .filter(o => o)
    let cover = contents.find(item => item.type == 'COVER' || item.type == 'IMAGE');
    let imgVideoMap = {}
    let videos = contents.filter(o => 'VIDEO' === o.type);
    let videoOne, videoOther;
    if (post.postType == 'VIDEO') {
      post.videoOne = videos[0];
      post.videoOther = videos.filter((item, index) => index != 0);
    }
    let videoContexts = videos.map(o => wx.createVideoContext(`v_pos${o.pos}`))
    videos.map(o => {
      imgVideoMap[o.pos] = false
    })
    // 分享需要的内容,头图显示
    if (cover) {
      post.cover = cover.content;
    } else if (images[0]) {
      post.cover = images[0];
    } else if (videos.length > 0 && videos[0].extra.cover) {
      post.cover = videos[0].extra.cover;
    }
    let info;
    info = post.contents.find(item => item.type == 'SUMMARY');
    if (info) {
      post.info = info.content;
    } else {
      info = post.contents.find(item => item.type == 'TEXT' || item.type == 'TITLE');
      if (info) {
        post.info = info.content;
      }
    }
    if (logo || post.clubInfo) {
      post.logo = logo ? logo : post.clubInfo.clubLogo;
      post.clubName = clubName ? clubName : post.clubInfo.clubName;
    }
    let postTitle = post.contents.find(item => item.type == 'TITLE' || item.type == 'TEXT');
    if (postTitle) {
      post.title = postTitle.content;
    }
    this.setData({ post, images, videoContexts, imgVideoMap });
    this.shareDrawClub();
  },
  //获取收藏分享
  getPostNuberm() {
    const { postId, post } = this.data;
    const url = urls.statistics;
    const data = { feedEnum: 'POST', relationId: postId, }
    const success = body => {
      let shareNumber = body.shareNumber;
      if (body.shareNumber >= 10000) { shareNumber = Math.ceil(body.shareNumber / 1000) / 10 + '万'; }
      post.shareNumberK = shareNumber;

      let likeCount = body.collectionNumber;
      if (body.collectionNumber >= 1000) {
        likeCount = Math.ceil(likeCount / 1000) / 10 + '万';
      }
      post.likeCount = likeCount;
      post.like = body.collectionState;
      this.setData({ post });
    }
    fetch({ url, data, success })
  },
  //热议收藏
  postLikeEvent(e) {
    const _this = this;
    const { postId, post } = this.data;
    const { userId } = wx.getStorageSync('user');
    let type = 'POST';
    if(post.posterType == 'MEDIA'){
      type = 'MEDIA_POST';
    }
    if (userId) {
      const data = {
        type,
        userId: userId,
        likedObjectId: postId,
        likeStepType: 'COLLECTION',
        clubId:constv.cid
      }
      const method = 'POST';
      const url = urls.statistics;
      const success = body => {
        post.likeNumberVO.collectionNumber = body.collectionNumber;
        post.likeNumberVO.collectionState = !post.likeNumberVO.collectionState;
        _this.setData({ post });
      }
      const fail = body => {
        // wx.showToast({
        //   title: '您已经赞过啦',
        //   icon: 'none'
        // })
      }
      fetch({ url, method, data, fail, json: true, success })
    } else {
      login(e, () => {
        this.postLikeEvent(e);
      });
    }
  },
  // //posts评论
  goComment(e) {
    const { postId, isClubMember, clubId, isFrom } = this.data;
    const { userId } = wx.getStorageSync('user');
    if (userId) {
      wx.navigateTo({
        url: `/pages/upload-comment/upload-comment?id=${postId}&isFrom=POST`,
      })
    } else {
      login(e, () => {
        this.goComment(e);
      });
    }
  },
  onShareAppMessage(res) {
    const { post, shareImg } = this.data;
    console.log(shareImg);
    const conType = 'IMAGE';
    let imageUrl = '';
    let title = post.contents[0].content;
    let path = `/pages/post-detail/post-detail?postId=${post.postId}&isShare=true`;
    post.contents = post.contents.map(item => {
      if (!imageUrl && (conType.indexOf(item.type) !== -1)) {
        imageUrl = item.content;
      }
      return item;
    })
    this.likeEvent();
    return { title, path, imageUrl: shareImg || imageUrl }
  },
  onReady() {
    this.share = this.selectComponent('#share');
  },
  shareDrawClub() {
    let ctx = wx.createCanvasContext('myCanvas', this);
    const { post } = this.data;
    if (post.logo) {
      shareDrawClub(ctx, post.cover, post.logo, post.clubName, (img) => {
        this.setData({ shareImg: img });
      })
    }
  },
  showShare() {
    const { postId, post } = this.data;
    getQrcode('POST', postId).then((qrcode) => {
      post.qrcode = qrcode;
      this.setData({ post })
      this.share.showShare();
    })
  },
  shareNumTrigger() {
    this.likeEvent();
  },
  likeEvent() {
    const _this = this;
    const { post, postId } = this.data;
    const { userId } = wx.getStorageSync('user');
    const url = urls.statistics;
    const data = {
      type: 'POST',
      userId: userId,
      likedObjectId: postId,
      likeStepType: 'SHARE'
    }
    const success = body => {
      let shareNumber = body.shareNumber;
      if (body.shareNumber >= 10000) {
        shareNumber = Math.ceil(body.shareNumber / 1000) / 10 + '万';
      }
      post.shareNumberK = shareNumber;
      _this.setData({ post });

    }
    const fail = body => {
      wx.showToast({
        title: body.message,
        icon: 'none'
      })
    }
    fetch({ url, method: 'POST', data, fail, json: true, loading: '加载中...', success })
  },
  //删除帖子
  delPost() {
    const { postId } = this.data;
    const url = `${urls._posts}/${postId}`;
    wx.showModal({
      title: '',
      content: '确认要删除吗？',
      success: (res) => {
        const success = body => {
          let pages = getCurrentPages();
          var prePages = pages[pages.length - 2];
          prePages.setData({ isUpdate: true });
          wx.showToast({
            title: '删除成功',
            duration: 2000
          })
          setTimeout(() => {
            wx.navigateBack();
          }, 2000)
        }
        const fail = body => {
          wx.showToast({
            title: '删除失败',
            icon: 'none'
          })
        }
        if (res.confirm) {
          fetch({ url, method: 'DELETE', json: true, loading: '正在删除', success, fail })
        }
      }
    })
  },
  //删除评论
  delComment(e) {
    const { postId, comments, post } = this.data;
    const commentId = e.currentTarget.dataset.id;
    const url = `${urls.reply}/${commentId}`;
    wx.showModal({
      title: '',
      content: '确认要删除吗？',
      success: (res) => {
        const success = body => {
          wx.showToast({
            title: '删除成功',
            duration: 2000,
            success: res => {
              let comment = comments.filter(item => item.replyId != commentId);
              post.commentCount--;
              this.setData({ comments: comment, post });
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
          fetch({ url, method: 'DELETE', json: true, loading: '正在删除', success, fail })
        }
      }
    })
  },
  //举报
  report(e) {
    const { userId } = wx.getStorageSync('user');
    if (userId) {
      const { id } = e.currentTarget.dataset;
      const data = {
        reportType: 'POST',
        reportedObjectId: id,
        userId
      }
      fetch({
        url: `${urls.reports}`,
        method: 'POST',
        data,
        json: true,
        success: body => {
          wx.showToast({
            title: '举报成功',
          })
        }
      })
    } else {
      login(e, () => {
        this.report(e);
      })
    }
  },
  goHomepage() {
    const { post, isFrom } = this.data;
    if (isFrom != 'trends') {
      wx.navigateTo({
        url: `/profile/homepage/homepage?userId=${post.userId}`
      })
    }

  },
  onPageScroll(e) {
    const { post, fromScene, detailHeight } = this.data;
    if (fromScene) {
      if (post.clubs&&post.clubs.length == 1 && post.clubs[0].clubId) {
        if (e.scrollTop > 100 && detailHeight > 650) {
          this.setData({ showBackClub: true });
        } else {
          this.setData({ showBackClub: false });
        }
      }
    }
  }
})