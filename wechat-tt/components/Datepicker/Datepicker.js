'use strict';
import { formatDate} from '../../utils/utils.js'
let choose_year = null,
	choose_month = null;

Component({
  properties: {
    countList: {
      type: Object,
      value: {},
      observer: function (newVal, oldVal) {
        console.log(newVal);
        if (newVal) {
          const date = new Date();
          const cur_year = date.getFullYear();
          const cur_month = date.getMonth() + 1;
          this.calculateDays(cur_year, cur_month);
        }
      }        
    },
    sole: {             // 唯一的一天，为此附加特殊样式
      type: Object,
      value: {}         // { "2018-01-05": true, "2018-03-03": true }
    },
    limited: {          // 点击今天以前的日期，是否做限制
      type: Boolean,
      value: false
    },
    editDate:{
      type:Boolean,
      value:false
    },
    timeList:{
      type:Array,
      value:[]
    }
  },
  data: {
    hasEmptyGrid: false,
    showPicker: false,
    days: [],
    curChooseDay:null,
    
  },
  ready() {
    const date = new Date();
    const cur_year = date.getFullYear();
    //const cur_month = date.getMonth() + 1;
    const weeks_ch = ['日', '一', '二', '三', '四', '五', '六'];
    let startMonth = this.data.timeList[0].startTime
    let cur_month = new Date(startMonth).getMonth()+1;
    console.log(startMonth);
    this.setData({
      cur_year,
      cur_month,
      cur_month0:this.addZero(cur_month),
      weeks_ch
    });
      this.calculateEmptyGrids(cur_year, cur_month);
      this.calculateDays(cur_year, cur_month);
  },
  methods: {
    getThisMonthDays(year, month) {
      return new Date(year, month, 0).getDate();
    },
    getFirstDayOfWeek(year, month) {
      return new Date(Date.UTC(year, month - 1, 1)).getDay();
    },
    calculateEmptyGrids(year, month) {
      const firstDayOfWeek = this.getFirstDayOfWeek(year, month);
      let empytGrids = [];
      if (firstDayOfWeek > 0) {
        for (let i = 0; i < firstDayOfWeek; i++) {
          empytGrids.push(i);
        }
        this.setData({
          hasEmptyGrid: true,
          empytGrids
        });
      } else {
        this.setData({
          hasEmptyGrid: false,
          empytGrids: []
        });
      }
    },
    calculateDays(year, month) {
      let myChoose = this.data.countList.dateList;
      console.log(myChoose);
      let limited = this.data.limited;
      let days = [];
      // 当月有多少天
      const thisMonthDays = this.getThisMonthDays(year, month);
      let isPrev=true;
      let choosed;     
      for (let i = 1; i <= thisMonthDays; i++) {
        //isPrev = this.compareDate(year + '-' + month + '-' + i)
        let curDay = year + '-' + this.addZero(month) + '-' + this.addZero(i);
        // 可选的时间段
        isPrev = this.expireDate(curDay);
        let isExsit = myChoose.find(item=>item == curDay);
        choosed = isExsit?true:false;
        days.push({
          day: i,
          day0:this.addZero(i),
          choosed: choosed,
          isPrev: isPrev
        });
      }
      console.log(days);
      this.setData({ days,curChooseDay:null });
    },
    expireDate(curDay){
      const { timeList } = this.data;
      let expireDay = [];
      timeList.map(item => {
        let start = item.startTime;
        let end = item.endTime;
        while(start<=end){
         // console.log(new Date(start).toLocaleDateString());
          expireDay.push(formatDate(start,'-',false,true));
          start = start + 24 * 60 * 60 * 1000;
        }
      })

      let canChoose = expireDay.find(item => item == curDay);
      this.setData({expireDay});
      return canChoose ? false : true;
    },
    // 上一月  ||  下一月
    handleCalendar(e) {
      const handle = e.currentTarget.dataset.handle;
      const cur_year = this.data.cur_year;
      const cur_month = this.data.cur_month;
      let newYear = null
      let newMonth = null
      const num = handle === 'prev' ? -1 : 1

      newMonth = cur_month + num;
      newYear = cur_year;
      if (newMonth < 1) {
        newYear = cur_year - 1;
        newMonth = 12;
      }
      if (newMonth > 12) {
        newYear = cur_year + 1;
        newMonth = 1;
      }

      this.calculateDays(newYear, newMonth);
      this.calculateEmptyGrids(newYear, newMonth);

      this.setData({
        cur_year: newYear,
        cur_month: newMonth,
        cur_month0:this.addZero(newMonth)
      });

      const date = { year: newYear, month: newMonth, day: 1 }
      const dateString = `${newYear}-${newMonth}-${1}`
      this.onChangeDate(date, dateString)
    },
    // 点击某一天
    tapDayItem(e) {
      console.log(e);
      // 目前用单个操作
      let { days, cur_year, cur_month, limited,editDate } = this.data
      let idx = e.currentTarget.dataset.idx;

      const date = { year: cur_year, month: cur_month, day: idx + 1};
     // const dateString = `${cur_year}- ${cur_month}-${idx+1}`

      // 是否是今日之前
      //const isPrev = this.compareDate(dateString) ? true : false
      let dateString = cur_year + '-' + this.addZero(cur_month) + '-' + this.addZero(idx+1);
      const isPrev = this.expireDate(dateString);
      // 如果限制今日之前，点击今日之前时，组件不做反应
      if (!(limited && isPrev)) {
        // 修改日期
        if (editDate){
          days[idx].choosed = !days[idx].choosed;
          
        }else{
          // 选择日期
          let curDay = days.find((item,index)=>index==idx);
          console.log(curDay);
          this.setData({curChooseDay:idx});
          //curDay.choosed = !days[idx].choosed;
        }
        
        this.setData({ days });
        this.onClickDay(date, dateString, isPrev)
      }
      

      // 批量操作时... dataJSON
    },

    // 选择年月
    chooseYearAndMonth() {
      const cur_year = this.data.cur_year;
      const cur_month = this.data.cur_month;
      let picker_year = [],
        picker_month = [];
      for (let i = 1900; i <= 2100; i++) {
        picker_year.push(i);
      }
      for (let i = 1; i <= 12; i++) {
        picker_month.push(i);
      }
      const idx_year = picker_year.indexOf(cur_year);
      const idx_month = picker_month.indexOf(cur_month);
      this.setData({
        picker_value: [idx_year, idx_month],
        picker_year,
        picker_month,
        showPicker: true,
      });
    },
    pickerChange(e) {
      const val = e.detail.value;
      choose_year = this.data.picker_year[val[0]];
      choose_month = this.data.picker_month[val[1]];
    },
    tapPickerBtn(e) {
      console.log(this.data)
      const type = e.currentTarget.dataset.type;
      const o = { showPicker: false };
      if (type === 'confirm' && choose_year && choose_month) {
        console.log(choose_year, choose_month, this.data)
        o.cur_year = choose_year;
        o.cur_month = choose_month;
        this.calculateEmptyGrids(choose_year, choose_month);
        this.calculateDays(choose_year, choose_month);
        this.setData({ cur_month0: this.addZero(choose_month)})
      }
      this.setData(o);
      
      const date = { year: choose_year, month: choose_month, day: 1 }
      const dateString = `${choose_year}-${choose_month}-${1}`
      this.onChangeDate(date, dateString)
    },

    // 比较指定日期是否在今天之前
    compareDate(dateString) {
      if (dateString) {
        const today = new Date()
        const todayStr = today.toLocaleDateString()
        const dateTimestamp = new Date(dateString).getTime()
        const curTimeStamp = new Date(todayStr).getTime()

        return dateTimestamp < curTimeStamp
      }
    },


    // 对外：单击某一天
    onClickDay(obj, str, isPrev) {
      // 触发 onClickDay date 数据传过去
      let myEventDetail = null;
      const { cur_year, cur_month } = this.data;
      const curDate = cur_year + '-' + cur_month;
      if (this.data.limited) {
        myEventDetail = { date: obj, dateString: str, isPrev,curDate }
      } else {
        myEventDetail = { date: obj, dateString: str,curDate }
      }
      
      this.triggerEvent("onClickDay", myEventDetail)
    },

    // 对外：更换时间
    onChangeDate(obj, str) {
      console.log(this.data);
      const {cur_year,cur_month} = this.data;
      // const myEventDetail = { date: obj, dateString: str }
      const curDate = cur_year + '-' + cur_month;
      this.triggerEvent("onChangeDate", curDate);
    },
    onSaveDate(){
      const {days,cur_year,cur_month} = this.data;
      let chooseDays = days.filter(item=>item.choosed == true);
      let detail = chooseDays.map(item=>{
        return `${cur_year}-${this.addZero(cur_month)}-${this.addZero(item.day)}`
      })
      console.log(detail);
      this.triggerEvent('onSaveDate',detail);
     // console.log(chooseDays);
    },
    addZero(day){
      if(day<10){
        return '0'+day;
      }else{
        return day;
      }
    }

  }
})
