import urls from '../../utils/urls.js'
import { fetch, formatPostsAce,login } from '../../utils/utils.js'
Page({

  /**
   * 页面的初始数据
   */
  data: {
    tabList: [
      { index: 0, name: '发布', render: true },
      { index: 1, name: '参与', render: false },
      { index: 2, name: '装备', render: false },
      { index: 3, name: '活动', render: false },
      // { index: 4, name: '装备', render: false },
    ],
    curIndex: 0,
    clubs:[],
    page: 0,
    count: 10,
    posts: [],
    showAll:'',
    isShare:false,
    isSelf:false,
    isFrom:'homepage'
  },
  onReady() {
    this.clubs = this.selectComponent('#clubs');
    this.follow = this.selectComponent('#follow');
    this.fans = this.selectComponent('#fans');
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (ops) {
    let _this = this;
    const {userId} = wx.getStorageSync('user');
    let receiveUserId;
    if (ops.scene) {
      receiveUserId = ops.scene;
    } else {
      receiveUserId = ops.userId;
    }
    //判断是否为本人，是否显示关注按钮
    if (userId == receiveUserId) {
      this.setData({ isSelf: true });
    }
    //设置当前的userId
    // this.setData({ userId: receiveUserId},this.initPage);
  },
  onShow() {
    const { isUpdate } = this.data;
    if (isUpdate) {
      this.setData({ page: 0, showAll:'',posts:[] },this.getPostsData)
    }
  },
  onHide() {
    this.setData({ isUpdate: false });
  },
  initPage(){
    this.getProfile();
    // this.getFans();
    this.getPostsData();
  },
  // 切换tab
  changeTab(e) {
    let  index = Number(e.currentTarget.dataset.index);
    switch(index){   
      case 0: this.getPostsData(true);break;
    }
    this.setData({ curIndex: index});
  },
  onPageScroll(e) {
    const scrollTop = e.scrollTop;
    this.setData({scrollTop});
    const { barHeight } = this.data;
    if (scrollTop > barHeight) {
      this.setData({ barFixed: true });
    } else {
      this.setData({ barFixed: false });
    }
  },
  // 获取个人信息
  getProfile() {
    let _this = this;
    const { userId } = this.data;
    fetch({
      url: `${urls._user}/${userId}/profile`,
      success: body => {
        this.setData({ profile: body }, this.getQrcode);
      }
    })
  },
  // 获取热议数据
  getPostsData(refresh = false) {
    console.log(refresh);
    if(refresh){
      this.setData({page:0,posts:[],showAll:'加载中...'})
    }
    const { page, count, userId, posts } = this.data;
    const url = `${urls._user}/${userId}/posts`;
    const data = { page, count };
    const success = body => {
      refresh && wx.stopPullDownRefresh();
      if (body.length == 0) {
        this.setData({ showAll: true })
      };
      let list = refresh ? formatPostsAce(body) : posts.concat(formatPostsAce(body));
      this.setData({ posts: list});
    }
    const fail = body => {
      wx.showToast({
        title: body.message,
        icon: 'none'
      })
    }
    fetch({ url, data, loading: '加载中...', success, fail });
  },
  onPostReachBottom() {
    const { showAll, page } = this.data;
    if (!showAll||showAll=='加载中...') {
      this.setData({ page: page + 1,showAll:'加载中...' });
      this.getPostsData();
    }
  },
  onReachBottom() {
    const { curIndex,userId} = this.data;
    switch (curIndex) {
      case 0:this.onPostReachBottom();break;
      case 1: this.clubs.reachBottomData(userId); break;
      case 2: this.follow.reachBottomData(userId); break;
      case 3: this.fans.reachBottomData(userId); break;
    }
  },
  onReady() {
    this.tab = this.selectComponent('#tab');
    this.clubs = this.selectComponent('#clubs');
    this.follow = this.selectComponent('#follow');
    this.fans = this.selectComponent('#fans');
    this.share = this.selectComponent('#share');
  },
  // 根据不同的tab,获取信息
  getData(index) {
    const {userId} = this.data;
    switch (index) {
      case 1: this.clubs.getListData(userId); break;
      case 2: this.follow.getListData(userId); break;
      case 3: this.fans.getListData(userId); break;
    }
  },
  // 关注粉丝
  followHandle(e) {
    const {profile} = this.data;
    const { userId } = wx.getStorageSync('user');
    const curUserId = this.data.userId;
    if(userId){
      fetch({
        url: `${urls._user}/${curUserId}/follow`,
        method: 'POST',
        loading: '加载中...',
        success: body => {
          wx.showToast({
            title: '已关注',
          })
          profile.follow = true;
          this.setData({ profile });
        }
      })
    } else {
      login(e, () => {
        this.followHandle(e);
      })
    }
    
  },
  // 取消关注
  followCancel() {
    const { userId, profile } = this.data;
    fetch({
      url: `${urls._user}/${userId}/follow`,
      method: 'DELETE',
      loading: '加载中...',
      success: body => {
        wx.showToast({
          title: '已取消',
        })
        profile.follow = false;
        this.setData({ profile });
      }
    })
  },
  // 显示分享
  toShare() {
    this.setData({ isShare: !this.data.isShare });
  },
  // 显示分享
  showShare() {
    this.share.showShare();
  },
  // 分享二维码
  getQrcode() {
    const { userId, profile } = this.data;
    const data = {
      feedType: 'USER',
      relateId: userId,
      url: 'profile/homepage/homepage',
      appType: 2
    }
    fetch({
      url: `${urls.getCode}`,
      loading: '加载中...',
      data: data,
      success: body => {
        profile.qrcode = body;
        this.setData({ profile });
      },
      fail: body => {
        wx.showToast({ title: body.message, icon: 'none', })
      }
    })
  },
  // 分享给朋友
  onShareAppMessage(res) {
    if (res.from === 'button') {
      const { profile } = this.data;
      let title = profile.nickname;
      let path = `/profile/homepage/homepage?userId=${profile.userId}`;
      return { title, path }
    }
  },
  goPostDetail(e) {
    const { posts} = this.data;
    const { id } = e.currentTarget.dataset;
    const post = posts.find(item => item.postId == id);
    wx.navigateTo({
      url: `/pages/post-detail/post-detail?postId=${post.postId}`
    }) 
  },
})