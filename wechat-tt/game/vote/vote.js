// game/party/party.js
import { dateTimePicker, getMonthDay } from '../../utils/dateTimePicker.js';
import { uploadImages, fetch, toTimestamp, formatDate,msgCheck} from '../../utils/utils.js';
import urls from '../../utils/urls.js'
import constv from '../../const.js'
Page({

  /**
   * 页面的初始数据
   */
  data: {
    dateTime: null,
    startYear: 2019,
    endYear: 2050,
    voteItemType: 'WORDIMAGE',
    wordList:[],  //文字选项
    wordImgList:[],//图文选项
    voteAuth:"ALL",   // 默认投票权限会员
    voteResultOpen: false,//默认查看投票结果显示
    maxSelectItem: 1,//默认最大投票数量
    userAddAuth: false,//默认是否可添加选项
    voteItemImgLimitNum: 9//默认用户上传图片数量
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (ops) {
    this.setData({ clubId: ops.clubId });
    let curDate = new Date();
    curDate = formatDate(curDate, '-');
    const { startYear, endYear } = this.data;
    let obj = dateTimePicker(startYear, endYear);
    console.log(obj);
    console.log(obj.dateTimeArray);
    this.setData({ dateTime: obj.dateTime, dateTimeArray: obj.dateTimeArray,curDate });
  },
  onShow(){
    
  },
  // 投票主题
  changeVoteName(e) {
    const { value } = e.detail;
    this.setData({ name: value });
  },
  // 投票类型
  changeVoteType(e) {
    const { type } = e.currentTarget.dataset;
    this.setData({ voteItemType: type });
  },
  // 添加投票项
  addVoteItem(){
    const { voteItemType} = this.data;
    wx.navigateTo({
      url: `/game/add-voteItem/add-voteItem?type=${voteItemType}`,
    })
  },
  bindColumnChange(e) {
    console.log(e);
    let { dateTime, dateTimeArray } = this.data;
    let { column, value } = e.detail;
    let todayYear = new Date().getFullYear();
    let todayMonth = new Date().getMonth()+1;
    let todayDay = new Date().getDate();
    let todayHour = new Date().getHours();
    if (column == 0) {
      let year = Number(dateTimeArray[0][value].slice(0, 4));
      if (year > todayYear) {
        dateTime[column] = value;
      } else if(year==todayYear) {
        dateTime[column] = value;
        dateTime[1] = todayMonth - 1;
        dateTime[2] = todayDay - 1;
        dateTime[3] = todayHour;
      }
    } else if (column == 1) {
      let fixedYear = Number(dateTimeArray[0][dateTime[0]].slice(0, 4));
      let month = Number(dateTimeArray[1][value].slice(0, 2));
      if (fixedYear > todayYear || fixedYear == todayYear && month > todayMonth) {
        dateTime[column] = value;
      } else if (fixedYear == todayYear && month==todayMonth) {
        dateTime[column] = value;
        dateTime[2] = todayDay - 1;
        dateTime[3] = todayHour;
      }
    } else if (column == 2) {
      let fixedYear = Number(dateTimeArray[0][dateTime[0]].slice(0, 4));
      let month = Number(dateTimeArray[1][dateTime[1]].slice(0, 2));
      let day = Number(dateTimeArray[2][value].slice(0, 2));
      if (fixedYear > todayYear || fixedYear == todayYear && month > todayMonth || day > todayDay) {
        dateTime[column] = value;
      } else if (fixedYear == todayYear && month == todayMonth&&day==todayDay) {
        dateTime[column] = value;
        dateTime[3] = todayHour;
      }
    } else if (column == 3) {
      let fixedYear = Number(dateTimeArray[0][dateTime[0]].slice(0, 4));
      let month = Number(dateTimeArray[1][dateTime[1]].slice(0, 2));
      let day = Number(dateTimeArray[2][dateTime[2]].slice(0, 2));
      let hour = Number(dateTimeArray[3][value].slice(0, 2));
      if (fixedYear > todayYear || fixedYear == todayYear && month > todayMonth || fixedYear == todayYear && month == todayMonth && day > todayDay || hour >= todayHour) {
        dateTime[column] = value;
      }
    }
    let curYear = dateTimeArray[0][dateTime[0]].slice(0, 4);
    let curMonth = dateTimeArray[1][dateTime[1]].slice(0, 2);
    dateTimeArray[2] = getMonthDay(curYear, curMonth);
    this.setData({ dateTime, dateTimeArray });
  },
  changeExpire(e) {
    const { value } = e.detail;
    let joinEndTime = this.getDate(value);
    this.setData({ joinEndTime });
  },
  getDate(value) {
    const { dateTimeArray, dateTime } = this.data;
    let year = dateTimeArray[0][value[0]].slice(0, 4);
    let month = dateTimeArray[1][value[1]].slice(0, 2);
    let day = dateTimeArray[2][value[2]].slice(0, 2);
    let hour = dateTimeArray[3][value[3]].slice(0, 2);
    return year + '-' + month + '-' + day + ' ' + hour + ':00';
  },
  uploadImage() {
    let _this = this;
    wx.chooseImage({
      count: 1,
      success: function ({ tempFilePaths }) {
        uploadImages(tempFilePaths, imgs => {
          _this.setData({ background: imgs[0] })
        })
      },
    })
  },
  delBackground(){
    this.setData({background:''})
  },
  toVoteItem(e){
    const { index } = e.currentTarget.dataset;
    let { voteItemType, wordImgList, wordList } = this.data;
    if (voteItemType == 'WORD') {
      let curWord = wordList.find((item, i) => i == index);
      wx.navigateTo({
        url: `/game/add-voteItem/add-voteItem?type=${voteItemType}&addType=updateItem&word=${curWord.voteItemStr}&index=${index}`
      })
    } else {
      let curWordImg = wordImgList.find((item, i) => i == index);
      console.log(curWordImg);
      wx.navigateTo({
        url: `/game/add-voteItem/add-voteItem?type=${voteItemType}&addType=updateItem&word=${curWordImg.voteItemStr}&imgs=${curWordImg.voteItemImage}&index=${index}`
      })
    }
  },
  delVoteItem(e){
    const {index} = e.currentTarget.dataset;
    let { voteItemType,wordImgList,wordList} = this.data;
    if(voteItemType == 'WORD'){
      wordList = wordList.filter((item, i) => i != index);
      this.setData({wordList})
    }else{
      wordImgList = wordImgList.filter((item,i)=> i != index );
      this.setData({wordImgList})
    }
  },
  goVoteSet(){
    const { voteAuth, voteResultOpen, maxSelectItem, userAddAuth, voteItemImgLimitNum, voteItemType,wordList,wordImgList} = this.data;
    let number = voteItemType == 'WORD' ? wordList.length : wordImgList.length
    wx.navigateTo({
      url: `/game/vote-set/vote-set?voteAuth=${voteAuth}&voteResultOpen=${voteResultOpen}&maxSelectItem=${maxSelectItem}&userAddAuth=${userAddAuth}&voteItemImgLimitNum=${voteItemImgLimitNum}&voteItemType=${voteItemType}&number=${number}`
    })
  },
  submit() {
    const { clubId, name, voteItemType, background, joinEndTime, userAddAuth, wordImgList, wordList, voteAuth, voteResultOpen, voteItemImgLimitNum, maxSelectItem} = this.data;
    let curDate = new Date().getTime();
    let voteItem;
    if (voteItemType == "WORD"){
      voteItem = wordList;
    }else{
      voteItem = wordImgList;
    }
    if (!name) {
      return this.showMessage('描述不能为空');
    } else if (!joinEndTime) {
      return this.showMessage('有效期不能空');
    } else if (toTimestamp(joinEndTime)<curDate){
      return this.showMessage('有效期不能小于当前时间');
    }else if(voteItem.length<2){
      return this.showMessage('请至少添加两个投票选项');
    }
    const data = {
      clubId,
      name,
      voteItemType,
      background,
      voteItem,
      voteAuth,
      voteResultOpen,
      maxSelectItem,
      userAddAuth,
      voteItemImgLimitNum,
      joinEndTime: toTimestamp(joinEndTime)
    }
    console.log(data);
    wx.showModal({
      content: '发布后不能更改，确认发布吗',
      success:res=>{
        if(res.confirm){
          wx.showLoading({
          title: '创建中...',
          mask: true
        })
          let items = JSON.stringify(voteItem);
          let content = data.name + items;
          msgCheck(content).then(()=>{
            fetch({
              url: urls.vote,
              method: 'POST',
              data: data,
              json: true,
              success: body => {
                wx.hideLoading();
                wx.showToast({
                  title: '创建成功',
                })
                const pages = getCurrentPages();
                const prePages = pages[pages.length - 2];
                prePages.setData({ updateParty: true })
                setTimeout(() => {
                  wx.redirectTo({
                    url: `/game/vote-detail/vote-detail?voteId=${body.voteId}&isFrom=create`,
                  })
                }, 500)

              }
            })
          })
        }
      }
    })
    
  },
  // 可选数量
  changeMaxSelect(e) {
    const { value } = e.detail;
    this.setData({ maxSelectItem: value });
  },
  switchMember(e){
    console.log(e)
    let voteAuth = e.detail.value?'MEMBER':'ALL';
    this.setData({voteAuth});
    
  },
  switchResult(e){
    let voteResultOpen = e.detail.value?true:false;
    this.setData({voteResultOpen});
  },
  showMessage(msg) {
    wx.showToast({
      title: msg,
      icon: 'none'
    })
    return;
  }
})