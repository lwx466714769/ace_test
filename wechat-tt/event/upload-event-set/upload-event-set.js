// event/upload-event/upload-event.js
import urls from '../../utils/urls.js';
import { fetch,toTimestamp } from '../../utils/utils.js';
import { dateTimePicker, getMonthDay } from '../../utils/dateTimePicker.js';
Page({

  /**
   * 页面的初始数据
   */
  data: {
    eventType: [],
    startYear: 2019,
    endYear: 2050,
    showWrap:false

  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (ops) {
    console.log(ops);
    this.setData({clubId:ops.clubId,type:ops.type});
    const data = wx.getStorageSync('event');
    const club = wx.getStorageSync('clubInfo');
    data.location = data.location || {};
    data.addresses = data.addresses||{};
    if (ops.type == 'draft' && data.activityGoodVO){
      let itemGroup = data.activityGoodVO;
      data.stageId = itemGroup.stageId;
      data.goodId = itemGroup.goodId;
      data.goodName = itemGroup.goodName;
      data.inventory = itemGroup.inventory;
      data.price = itemGroup.price/100;
      data.restriction = itemGroup.restriction;
      console.log(data);
    }
    console.log(data);
    const { startYear, endYear } = this.data;
    let obj = dateTimePicker(startYear, endYear);
    this.setData({ dateTime: obj.dateTime, dateTimeArray: obj.dateTimeArray,data, club },this.getEventType);
  },
  onUnload(){
    const {data} = this.data;
    wx.setStorageSync('event', data);
  },
  getEventType(){
    const {type,data} = this.data;
    fetch({
      url: `${urls.activity}/activityType`,
      success:body=>{
        this.setData({ eventType: body});
        if(type == 'draft'){
          this.setData({ 'data.activityTypeId': data.activityTypeId})
        }else{
          this.setData({ 'data.activityTypeId': body[0].id })
        }
      }
    })
  },
  changeEventType(e){
    const {id} = e.currentTarget.dataset;
    this.setData({ 'data.activityTypeId':id})
  },
  bindColumnChange(e) {
    const { dateTime, dateTimeArray } = this.data;
    const { column, value } = e.detail;
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
    this.setData({ dateTime, dateTimeArray });
  },
  // 开始时间
  changeStart(e) {
    const { value } = e.detail;
    let startTime = this.getDate(value);
    this.setData({ 'data.startTime':startTime });
  },
  changeEnd(e) {
    const { value } = e.detail;
    let endTime = this.getDate(value);
    this.setData({ 'data.endTime': endTime,'data.signEndTime':endTime});
  },
  changeExpire(e) {
    const { value } = e.detail;
    let signEndTime = this.getDate(value);
    this.setData({ 'data.signEndTime': signEndTime });
  },
  getDate(value) {
    const { dateTimeArray, dateTime } = this.data;
    let year = dateTimeArray[0][value[0]].slice(0, 4);
    let month = dateTimeArray[1][value[1]].slice(0, 2);
    let day = dateTimeArray[2][value[2]].slice(0, 2);
    let hour = dateTimeArray[3][value[3]].slice(0, 2);
    return year + '-' + month + '-' + day + ' ' + hour + ':00';
  },
  chooseLocation(){  
    let _this = this;
    wx.chooseLocation({
      success: function(res) {
        console.log(res);
        _this.setData({
          'data.location.address':res.address,
          'data.location.latitude':res.latitude,
          'data.location.longitude':res.longitude
        });
      },
    })
  },
  changeAddress(e){
    const {value} = e.detail;
    this.setData({'data.location.address':value})
  },
  priceBlur(e){
    const { value } = e.detail;
    let price = Math.floor(value * 100) / 100;
    this.setData({ ['data.price']: price });
  },
  changeNumberBlur(e){
    const { name } = e.currentTarget.dataset;
    const { value } = e.detail;
    let number = Math.round(value);
    this.setData({ ['data.' + name]: number });
  },
  // 发布验证
  validate(){
    const {data,clubId,type} = this.data;
    if(!data.startTime){
      return this.message('请选择开始时间');
    }else if(!data.endTime){
      return this.message('请选择结束时间');
    } else if ((typeof(data.startTime) == 'string' ? toTimestamp(data.startTime) : data.startTime) > (typeof(data.endTime) == 'string'?toTimestamp(data.endTime):data.endTime)) {
      return this.showMessage('开始时间应早于结束时间');
    } else if (!data.location.address) {
      return this.message('请设置地理位置');
    }
    //  else if (data.price!==0&&!data.price) {
    //   return this.message('请设置活动价格');
    // } else if (!data.inventory) {
    //   return this.message('请设置活动库存');
    // } else if (!data.restriction) {
    //   return this.message('请设置限购');
    // }
     else {
      data.startTime = typeof(data.startTime) == 'string' ?toTimestamp(data.startTime):data.startTime;
      data.endTime = typeof(data.endTime) == 'string' ?toTimestamp(data.endTime):data.endTime;
      data.signEndTime = typeof(data.signEndTime) == 'string' ? toTimestamp(data.signEndTime):data.signEndTime;
    }
    if (!data.addresses.address){
      data.addresses.address = data.location.address;
    }
    data.draftOrFormal = true;
    
    console.log(this.data.data);
    if(type == 'draft'){
      this.draftSubmit(data);
    }else{
      data.ownerId = clubId;
      this.submit(data);
    }
  },
  // 保存草稿
  saveDraft(){
    let {data,clubId,type} = this.data;
    data.startTime = data.startTime && typeof (data.startTime) == 'string' ? toTimestamp(data.startTime) : data.startTime;
    data.endTime = data.endTime && typeof (data.endTime) == 'string' ? toTimestamp(data.endTime) : data.endTime;
    data.signEndTime = data.signEndTime && typeof (data.signEndTime) == 'string' ? toTimestamp(data.signEndTime) : data.signEndTime;
    // draftOrFormal:false,判断是草稿，true还是直接发布
    data.draftOrFormal = false;
    // 修改草稿
    if(type == 'draft'){
      this.draftSubmit(data);
    // 新建草稿
    }else{
      this.submit(data);
    }
  },
  // 草稿提交
  draftSubmit(data){
    wx.showLoading({
      title: '保存中...',
      mask: true
    })
    fetch({
      url: `${urls.activity}?activityId=${data.activityId}&stageId=${data.stageId}&goodId=${data.goodId}&goodName=${data.goodName}&restriction=${data.restriction}&price=${data.price * 100}&inventory=${data.inventory}&draftOrFormal=${data.draftOrFormal}`,
      method:'PUT',
      data: data,
      json:true,
      success:body=>{
        wx.hideLoading();
        if (data.draftOrFormal){
          wx.setStorageSync('event', body);
          wx.showLoading({
            title: '正在创建活动',
            mask: true
          })
          setTimeout(() => {
            wx.showLoading({
              title: '正在生成活动页面',
              mask: true
            })
          }, 1500)
          setTimeout(() => {
            wx.navigateTo({
              url: `/event/upload-event-result/upload-event-result?type=draft`,
            })
          }, 3000)
        }else{
          wx.showModal({
            content: '成功保存至草稿箱',
            confirmText:'退出',
            cancelText:'返回',
            confirmColor:'#999',
            cancelColor:'#999',
            success:res=>{
              if (res.cancel){
                this.setData({ showWrap: false });
              }
              if (res.confirm){
                this.exitWrap();
              }
            }
          })
        }
        
      }
    })
  },
  // 发布活动
  submit(data){
    const {clubId} = this.data;
    data.ownerId = clubId;
    wx.showLoading({
      title: '保存中...',
      mask:true
    })
    let price = data.price||0?data.price*100:'';
    let restriction = data.restriction?data.restriction:'';
    let inventory = data.inventory?data.inventory:'';
    fetch({
      url: `${urls.activity}?clubId=${clubId}&price=${price}&restriction=${restriction}&inventory=${inventory}&draftOrFormal=${data.draftOrFormal}`,
      method: 'POST',
      json: true,
      data: data,
      success: body => {
        wx.hideLoading();
        if (data.draftOrFormal){
          wx.setStorageSync('event', body);
          wx.showLoading({
            title: '正在创建活动',
            mask:true
          })
          setTimeout(()=>{
            wx.showLoading({
              title: '正在生成活动页面',
              mask: true
            })
          },1500)
          setTimeout(()=>{
            wx.navigateTo({
              url: `/event/upload-event-result/upload-event-result`,
            }) 
          },3000)
          
        }else{
          this.setData({showWrap:true});
        }
        
      }
    })
  },
  showWrap(){
    this.setData({showWrap:false});
  },
  exitWrap(){
    wx.removeStorageSync('event');
    let pages = getCurrentPages();
    let prePage = pages[pages.length - 3];
    prePage.setData({ updateEvent: true });
    wx.navigateBack({
      delta:2
    })
  },
  message: function (msg) {
    wx.showToast({
      title: msg,
      icon: 'none'
    })
  },
})