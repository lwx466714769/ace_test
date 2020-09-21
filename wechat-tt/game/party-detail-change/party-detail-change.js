// game/party-detail/party-detail.js
import urls from '../../utils/urls.js';
import { fetch, formatDate, needJoin, formatMsgTime } from '../../utils/utils.js'
Page({

  /**
   * 页面的初始数据
   */
  data: {
    dateList:[],
    dateSection: [{ start: 1556899200000, end: 1556985600000 }, { start: 1557504000000, end: 1558108800000 }]
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (ops) {
    this.setData({ partyId: ops.partyId }, this.initPage)
  },
  initPage() {
    this.getPartyDetail();
    this.getPartyDate();
  },
  getPartyDetail() {
    const { partyId } = this.data;
    fetch({
      url: `${urls.party}/${partyId}`,
      loading: '加载中...',
      success: body => {
        body.createAt = formatMsgTime(body.createAt);
        body.startTime = formatDate(body.startTime, '-', true);
        body.endTime = formatDate(body.endTime, '-', true);
        body.joinEndTime = formatDate(Number(body.joinEndTime), '', true);
        this.setData({ party: body })
      }
    })
  },
  getPartyDate() {
    const { partyId } = this.data;
    fetch({
      url: `${urls.party}/${partyId}/selectPartyNumber`,
      success: body => {
        body.owner = {}
        body.dateList.map(item => {
          body.owner[item] = 1;
        })
        console.log(body);
        this.setData({ countList: body })
      }
    })
  },
  onClickDay(e){
    console.log(e);
    const {dateString} = e.detail;
    let {dateList} = this.data;
    let isExist = dateList.find(item=>item==dateString);
    if(isExist){
      dateList = dateList.filter(item=>item != dateString);
    }else{
      dateList.push(dateString);
    }
    this.setData({dateList});
  },
  editDate(){
    this.setData({editDate:true});
  },
  // 保存日期
  onSaveDate(e){
    console.log(e);
    const {partyId} = this.data;
    const dateList = e.detail;
    if(dateList.length==0){
      wx.showToast({
        title: '请选择日期',
        icon:'none'
      })
    }else{
      fetch({
        url:`${urls.party}/Partys?partyId=${partyId}`,
        method:'POST',
        json:true,
        data:dateList,
        success:body=>{
          let pages = getCurrentPages();
          var prePages = pages[pages.length - 2];
          prePages.setData({ chooseDate: true });
          wx.showToast({
            title: '选择成功',
          })
          setTimeout(()=>{
            wx.navigateBack()
          },500)
          
        }
      })
    }
    
  },
  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
})