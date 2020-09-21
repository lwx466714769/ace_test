// game/party/party.js
import urls from '../../utils/urls.js'
import { uploadImages, fetch, toTimestamp,msgCheck} from '../../utils/utils.js'
import { dateTimePicker, getMonthDay} from '../../utils/dateTimePicker.js';
import constv from '../../const.js'
Page({

  /**
   * 页面的初始数据
   */
  data: {
    dateTime:null,
    startYear:2019,
    endYear:2050,
    partyType:'JOIN',
    timeList:[{startTime:'',endTime:''}]
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (ops) {
    console.log(ops);
    this.setData({clubId:ops.clubId});
    // 初始化日期
    const {startYear,endYear} = this.data;
    let obj = dateTimePicker(startYear,endYear);
    console.log(obj);
    console.log(obj.dateTimeArray);
    this.setData({dateTime:obj.dateTime,dateTimeArray:obj.dateTimeArray});
  },
  changePartyName(e){
    const {value} = e.detail;
    this.setData({name:value});
  },
  changePartyType(e){
    const {type} = e.currentTarget.dataset;
    this.setData({ partyType:type});
  },
  changeExpire(e){
    const { value } = e.detail;
    let joinEndTime = this.getDate(value);
    this.setData({ joinEndTime });
  },
  uploadImage(){
    let _this = this;
    wx.chooseImage({
      count:1,
      success: function({tempFilePaths}) {
        uploadImages(tempFilePaths,imgs =>{
          console.log(imgs);
          _this.setData({ background:imgs[0]})
        })
      },
    })
  }, 
  uplodelBackground() {
    this.setData({ background: '' })
  },
  bindColumnChange(e) {
    const {dateTime,dateTimeArray} = this.data;
    const {column,value} = e.detail;
    let todayYear = new Date().getFullYear();
    let todayMonth = new Date().getMonth() + 1;
    let todayDay = new Date().getDate();
    let todayHour = new Date().getHours();
    if (column == 0) {
      let year = Number(dateTimeArray[0][value].slice(0, 4));
      if (year > todayYear) {
        dateTime[column] = value;
      } else if (year == todayYear) {
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
      } else if (fixedYear == todayYear && month == todayMonth) {
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
      } else if (fixedYear == todayYear && month == todayMonth && day == todayDay) {
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
    this.setData({dateTime,dateTimeArray});
  },
  // 开始时间
  changeStart(e){
    const {value} = e.detail;
    const {index} = e.currentTarget.dataset;
    const { partyType,timeList} = this.data;
    let startTime = this.getDate(value);
    if (partyType == 'DISCUSS'){
      let curTime = timeList.find((item,i)=>i==index);
      curTime.startTime = startTime;
      this.setData({timeList})
    }else{
      this.setData({startTime});
    }  
  },
  changeEnd(e) {
    const { value } = e.detail;
    const { index } = e.currentTarget.dataset;
    const { partyType, timeList } = this.data;
    let endTime = this.getDate(value);
    if (partyType == 'DISCUSS') {
      let curTime = timeList.find((item, i) => i == index);
      curTime.endTime = endTime;
      this.setData({ timeList })
    } else {
      this.setData({ endTime });
    }
  },
  getDate(value){
    const { dateTimeArray, dateTime } = this.data;
    let year = dateTimeArray[0][value[0]].slice(0,4);
    let month = dateTimeArray[1][value[1]].slice(0,2);
    let day = dateTimeArray[2][value[2]].slice(0,2);
    let hour = dateTimeArray[3][value[3]].slice(0,2);
    return year+'-'+month+'-'+day+' '+hour+':00';
  },
  addDate(){
    const obj = {startTime:'',endTime:''};
    const {timeList} = this.data;
    timeList.push(obj);
    this.setData({timeList});
  },
  delDate(e){
    const {index} = e.currentTarget.dataset;
    let { timeList } = this.data;
    timeList = timeList.filter((item,i)=>i!=index);
    this.setData({timeList});
  },
  memberLimit(e){
    const {value} = e.detail;
    this.setData({maxJoinLimitNum:value});
  },
  
  submit(){
    let { clubId, name, partyType, background, maxJoinLimitNum, startTime, endTime,timeList} = this.data;
    timeList = JSON.parse(JSON.stringify(timeList));
    console.log(timeList);
    let curDate = new Date().getTime();
    if(!name){
      return this.showMessage('标题不能为空');
    }
    // else if(!joinEndTime){
    //   return this.showMessage('有效期不能空');
    // } else if (toTimestamp(joinEndTime) < curDate) {
    //   return this.showMessage('有效期不能小于当前时间');
    // }
    let data,lock=false;
    if (partyType == 'DISCUSS'){
      timeList.map(item=>{
        if(!item.startTime){
          lock = false;
          return this.showMessage('开始时间不能为空');
        }else if(!item.endTime){
          lock = false;
          return this.showMessage('结束时间不能为空');
        }else if (toTimestamp(item.startTime) > toTimestamp(item.endTime)) {
          lock = false;
          return this.showMessage('开始时间应早于结束时间');
        }else{
          item.startTime = toTimestamp(item.startTime);
          item.endTime = toTimestamp(item.endTime)
          lock = true;
        }
      })
      data = {
        clubId,
        name,
        partyType,
        background,
        timeList,
        joinEndTime: toTimestamp(joinEndTime)
      }
    }else{
      if (!startTime) {
        return this.showMessage('开始时间不能为空');
      } else if (!endTime) {
        return this.showMessage('结束时间不能为空');
      } else if (toTimestamp(startTime) > toTimestamp(endTime)) {
        return this.showMessage('开始时间应早于结束时间');
      } else if (toTimestamp(endTime) < curDate ) {
        return this.showMessage('结束时间应晚于当前时间');
      } else {
        startTime = toTimestamp(startTime);
        endTime = toTimestamp(endTime)
        lock = true;
      }
      data = {
        clubId,
        name,
        partyType,
        background,
        maxJoinLimitNum,
        startTime,
        endTime,
        joinEndTime: endTime
      }
    }
    console.log(data);
    if(!lock) return;
    wx.showModal({
      content: '发布后不能更改，确认发布吗',
      success: res => {
        if (res.confirm) {
           wx.showLoading({
            title: '创建中...',
            mask:true
          })
          let content = data.name;
          msgCheck(content).then(() => {
            fetch({
              url: urls.party,
              method: 'POST',
              data: data,
              json: true,
              success: body => {
                wx.hideLoading();
                const pages = getCurrentPages();
                const prePages = pages[pages.length - 2];
                prePages.setData({ updateParty: true })
                wx.showToast({
                  title: '创建成功',
                })
                wx.redirectTo({
                  url: `/game/party-detail-join/party-detail-join?partyId=${body.partyId}`,
                })
              }
            })
          })          
        }
      }
    })
   
  },
  showMessage(msg){
    wx.showToast({
      title: msg,
      icon:'none'
    })
    return;
  }
})