// game/party-detail/party-detail.js
import urls from '../../utils/urls.js';
import { fetch, formatDate, needJoin, formatMsgTime, isClubMember, login, shareDrawClub,getTextFromHTML } from '../../utils/utils.js'
import constv from '../../const.js'
Page({

  /**
   * 页面的初始数据
   */
  data: {
    page: 0,
    size: 10,
    replyRelateType: 'VOTE',
    comments: [],
    showVoteInfo: false,
    isPrivate: false,
    fromScene: false
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (ops) {
    console.log(ops);
    if (ops.isFrom) {
      this.setData({ isFrom: ops.isFrom })
    }
    let todayDate = new Date().getTime();
    const { userId } = wx.getStorageSync('user');
    let voteId;
    if (ops.scene) {
      voteId = parseInt(ops.scene);
    } else {
      voteId = ops.voteId;
    }
    if (ops.scene || ops.isShare) {
      this.setData({ fromScene: true });
    }
    this.setData({ voteId, userId, todayDate }, this.initPage)
  },
  initPage() {
    this.getPartyDetail();
    this.getComment(true);
  },
  onShow() {
    const { voteItemUpdate, isUpdate, joinClubState } = this.data;
    if (voteItemUpdate || joinClubState) {
      this.getPartyDetail();
    }
    if (isUpdate) {
      this.getComment(true);
    }
  },
  onHide() {
    this.setData({ voteItemUpdate: false, joinClubState: false })
  },
  onUnload() {
    this.setData({ voteItemUpdate: false, joinClubState: false })
  },
  onReady() {
    this.backendModal = this.selectComponent('#backendModal');
    this.share = this.selectComponent('#share');
  },
  getPartyDetail() {
    const { voteId, fromScene } = this.data;
    const { userId } = wx.getStorageSync('user');
    fetch({
      url: `${urls.vote}/${voteId}`,
      data: userId,
      loading: '加载中...',
      success: body => {
        isClubMember(body.clubId).then((status) => {
          this.setData({ isClubMember: status, })
        })
        this.setData({ joinEndTime: body.joinEndTime, clubId: body.clubId });
        body.createAt = formatMsgTime(body.createAt);
        body.startTime = formatDate(body.startTime, '.', true);
        body.endTime = formatDate(body.endTime, '.', true);
        body.joinEndTime = formatDate(Number(body.joinEndTime), '.', true);
        let collectionNumber = body.likeNumberVO.collectionNumber;
        let shareNumber = body.likeNumberVO.shareNumber;
        if (body.likeNumberVO.collectionNumber >= 10000) {
          collectionNumber = Math.ceil(body.likeNumberVO.collectionNumber / 1000) / 10 + '万';
        }
        if (body.likeNumberVO.shareNumber >= 10000) {
          shareNumber = Math.ceil(body.likeNumberVO.shareNumber / 1000) / 10 + '万';
        }
        body.collectionNumberK = collectionNumber;
        body.shareNumberK = shareNumber;
        this.setData({ party: body, voteItem: body.voteItem }, this.getVoteCount);
        this.shareDrawClub();
      }
    })
  },
  getVoteCount() {
    const { userId } = wx.getStorageSync('user');
    if (userId) {
      this.setData({ userId });
    }
    const { voteId, voteItem, todayDate, joinEndTime } = this.data;
    fetch({
      url: `${urls.vote}/${voteId}/Vote`,
      loading: '加载中...',
      success: body => {
        const ticketCount = body.voteinfo;
        let newList;
        voteItem.map((o, index) => {
          o.index = index + 1;
          if (ticketCount[o.voteItemId]) {
            o.ticket = ticketCount[o.voteItemId];//票数
            o.percent = Math.round(ticketCount[o.voteItemId] / body.optionTotal * 100);    //占比

            body.optionIds.map(id => {
              if (id == o.voteItemId) {
                o.choose = true;//是否选择
              }
            })
          } else {
            o.ticket = 0;
            o.percent = 0;
          }
        })
        if (body.partyState || todayDate > joinEndTime) {
          voteItem.sort(function (a, b) {
            return (b.ticket - a.ticket);
          })
        }
        this.setData({ voteItem, voteCount: body })
      }
    })
  },
  // 选项详情
  goItemDetail(e) {
    const { id } = e.currentTarget.dataset;
    const { party } = this.data;
    const curItem = party.voteItem.find(item => item.voteItemId == id);
    wx.navigateTo({
      url: `/game/vote-item-detail/vote-item-detail?voteId=${party.voteId}&itemId=${id}`
    })
  },
  checkboxChange(e) {
    const { id } = e.currentTarget.dataset;
    const { voteItem, party } = this.data;
    let hasChecked = voteItem.filter(item => item.checked == true);
    let checkItem = voteItem.find(item => item.voteItemId == id);
    if (checkItem.checked) {
      checkItem.checked = false;
    } else {
      if (hasChecked.length == party.maxSelectItem) {
        wx.showToast({
          title: `最多选择${party.maxSelectItem}项`,
          icon: 'none'
        })
      } else {
        checkItem.checked = true;
      }
    }
    this.setData({ voteItem })
  },
  // 去投票
  toVote(e) {
    const { userId } = wx.getStorageSync('user');
    if (userId) {
      const { voteItem, party, isClubMember } = this.data;
      let voteItemList = voteItem.filter(item => item.checked == true);
      if (party.voteAuth == "MEMBER" && !isClubMember) {
        needJoin(party.clubId, '投票需加入俱乐部');
      } else {
        if (voteItemList.length == 0) {
          wx.showToast({
            title: '请至少选择一个投票项',
            icon: 'none'
          })
          return;
        } else if (voteItemList.length < party.maxSelectItem) {
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
    } else {
      login(e, () => {
        this.initPage(() => {
          this.toVote(e);
        })
      })
    }

  },
  // 确认投票
  confirmFn() {
    const { voteId, voteItem, party } = this.data;
    let voteItemList = voteItem.filter(item => item.checked == true);
    let ids = voteItemList.map(item => {
      return item.voteItemId;
    })
    wx.showLoading({
      title: '投票中...',
      mask: true
    })
    fetch({
      url: `${urls.vote}/Votes/${voteId}`,
      method: 'POST',
      data: ids,
      json: true,
      success: body => {
        wx.showToast({
          title: '投票成功',
          icon: 'none'
        });
        this.initPage();
      }
    })
  },
  addVoteItem() {
    const { party, isClubMember } = this.data;
    if (party.voteAuth == "MEMBER" && !isClubMember) {
      needJoin(party.clubId, '添加选项需加入俱乐部');
    } else {
      wx.navigateTo({
        url: `/game/add-voteItem/add-voteItem?addType=addNewItem&type=${party.voteItemType}&voteId=${party.voteId}&voteItemImgLimitNum=${party.voteItemImgLimitNum}`
      })
    }

  },
  // 删除投票项目
  delParty() {
    wx.showModal({
      content: '确定要删除吗',
      success: res => {
        if (res.confirm) {
          const { voteId } = this.data;
          fetch({
            url: `${urls.vote}/${voteId}`,
            method: 'DELETE',
            success: body => {
              let pages = getCurrentPages();
              let prePage = pages[pages.length - 2];
              prePage.setData({ updateParty: true })
              wx.showToast({
                title: '删除成功',
              })
              setTimeout(() => {
                wx.navigateBack()
              }, 500)
            }
          })
        }
      }
    })

  },
  /**
   * 用户点击右上角分享
   */
  onShareAppMessage() {
    const { voteId, party, shareImg } = this.data;
    let imageUrl = shareImg || 'https://img.acegear.com/382802b55176798524e03f9d0cea96dd4a6c2323/w700_1';
    let title = party.name;
    let path = `/game/vote-detail/vote-detail?voteId=${voteId}&isShare=true`;
    this.likeEvent('SHARE');
    return { title, path, imageUrl }
  },
  getPartyQrcode() {
    const { voteId, party } = this.data;
    const data = {
      feedType: 'VOTE',
      relateId: voteId,
      url: `game/vote-detail/vote-detail`,
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
  shareDrawClub() {
    let ctx = wx.createCanvasContext('myCanvas', this);
    const { party } = this.data;
    let background = party.background || 'https://img.acegear.com/382802b55176798524e03f9d0cea96dd4a6c2323/w700_1';
    shareDrawClub(ctx, background, party.clubLogo, party.clubName, (img) => {
      this.setData({ shareImg: img });
    }, '/images/icon-vote-stamp.png')
  },
  showPartyShare() {
    this.getPartyQrcode().then(() => {
      this.share.showShare();
    })
  },
  shareNumTrigger() {
    this.likeEvent('SHARE');
  },
  getComment(refresh = false) {
    if (refresh) {
      this.setData({ comments: [], page: 0, showAll: '加载中...' })
    }
    const { page, size, replyRelateType, showAll, voteId, comments } = this.data;
    fetch({
      url: urls.reply,
      data: {
        relateId: voteId,
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
          url: `/pages/upload-comment/upload-comment?id=${party.voteId}&isFrom=VOTE`,
        })
      } else {
        needJoin(party.clubId, '评论该帖需加入俱乐部');
      }
    } else {
      login(e, () => {
        this.initPage(() => {
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
  // 投票收藏
  likeEvent(e) {
    const _this = this;
    let type = e == 'SHARE' ? 'SHARE' : 'COLLECTION'
    const { party, isClubMember } = this.data;
    const { userId } = wx.getStorageSync('user');
    if (type == "SHARE" || userId) {
      const url = urls.statistics;
      const data = {
        type: 'VOTE',
        userId: userId,
        likedObjectId: party.voteId,
        likeStepType: type
      }
      const success = body => {
        if (type == 'COLLECTION') {
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
        }
        let collectionNumber = body.collectionNumber;
        let shareNumber = body.shareNumber;
        if (body.collectionNumber >= 10000) {
          collectionNumber = Math.ceil(body.collectionNumber / 1000) / 10 + '万';
        }
        if (body.shareNumber >= 10000) {
          shareNumber = Math.ceil(body.shareNumber / 1000) / 10 + '万';
        }
        party.collectionNumberK = collectionNumber;
        party.shareNumberK = shareNumber;
        _this.setData({ party });

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
        this.setData({ clearUser: 'on' }, this.initPage);
        this.likeEvent(e);
      })
    }
  },
  preview(e) {
    const { url, imgs } = e.currentTarget.dataset;
    wx.previewImage({
      urls: imgs,
      current: url
    })
  },
  // 举报
  toReport() {
    const { voteId } = this.data;
    wx.navigateTo({
      url: `/pages/report/report?id=${voteId}&type=VOTE`,
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
  },
  showVoteInfo() {
    this.setData({ showVoteInfo: !this.data.showVoteInfo })
  },
  hideVoteInfo() {
    this.setData({ showVoteInfo: false })
  }
})