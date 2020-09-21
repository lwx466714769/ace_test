// game/final-date/final-date.js
import urls from '../../utils/urls.js'
import { fetch, toTimestamp} from '../../utils/utils.js'
import { dateTimePicker } from '../../utils/dateTimePicker.js';
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
    const { startYear, endYear } = this.data;
    let obj = dateTimePicker(startYear, endYear);
    this.setData({ partyId:ops.id,dateTime: obj.dateTime, dateTimeArray: obj.dateTimeArray });
  },
  // 开始时间
  changeStart(e) {
    console.log(e);
    const { value } = e.detail;
    let startTime = this.getDate(value);
    this.setData({ startTime });

  },
  changeEnd(e) {
    const { value } = e.detail;
    let endTime = this.getDate(value);
    this.setData({ endTime });
  },
  getDate(value) {
    const { dateTimeArray, dateTime } = this.data;
    let year = dateTimeArray[0][value[0]].slice(0, 4);
    let month = dateTimeArray[1][value[1]].slice(0, 2);
    let day = dateTimeArray[2][value[2]].slice(0, 2);
    let hour = dateTimeArray[3][value[3]].slice(0, 2);
    return year + '-' + month + '-' + day + ' ' + hour + ':00';
  },
  submit(){
    const {startTime,endTime,partyId} = this.data;
    if (toTimestamp(startTime) > toTimestamp(endTime)) {
      wx.showToast({
        title: '开始时间应早于结束时间',
        icon:'none'
      })
      return;
    }
    console.log(this.data);
    wx.showModal({
      content: '活动日期选定后不能更改',
      success: res=>{
        if(res.confirm){
          fetch({
            url: `${urls.party}/${partyId}/defineTime`,
            method: 'POST',
            data: {
              defineStartTime:toTimestamp(startTime),
              defineEndTime:toTimestamp(endTime)
            },
            success: body => {
              let pages = getCurrentPages();
              var prePages = pages[pages.length - 2];
              prePages.setData({ chooseDate: true });
              wx.showToast({
                title: '选择成功',
              })
              setTimeout(() => {
                wx.navigateBack()
              }, 500)

            }
          })
        }
      }
    })
  }
})