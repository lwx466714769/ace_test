'use strict';
let choose_year = null,
	choose_month = null;

Component({
  properties: {
    countList: {
      type: Object,
      value: {}         // { "3": { cuont: 233 } }  本月3号 233 人
    },
    sole: {             // 唯一的一天，为此附加特殊样式
      type: Object,
      value: {}         // { "2018-01-05": true, "2018-03-03": true }
    },
    limited: {          // 点击今天以前的日期，是否做限制
      type: Boolean,
      value: false
    }
  },
  data: {
    hasEmptyGrid: false,
    showPicker: false,
    days: [],
    // dateJSON: {
    //   "2018" : {
    //     // 月
    //     "3": {
    //       // 日
    //       "2": { count: 99 },
    //       "3": { count: 23 },
    //       "6": { count: 9 },
    //       "9": { count: 10 },
    //       "14": { count: 3 },
    //     },
    //     "4": {
    //       "11": { count: 99 },
    //       "1": { count: 23 },
    //       "3": { count: 9 },
    //       "23": { count: 10 },
    //       "9": { count: 3 },
    //     },
    //   }
    // }
  },
  ready() {
    const date = new Date();
    const cur_year = date.getFullYear();
    const cur_month = date.getMonth() + 1;
    const weeks_ch = ['日', '一', '二', '三', '四', '五', '六'];
    this.calculateEmptyGrids(cur_year, cur_month);
    this.calculateDays(cur_year, cur_month);
    this.setData({
      cur_year,
      cur_month,
      weeks_ch
    });
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
      console.log(firstDayOfWeek);
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
      let days = [];
      const thisMonthDays = this.getThisMonthDays(year, month);
      console.log(thisMonthDays);
      let isPrev = false
      for (let i = 1; i <= thisMonthDays; i++) {
        isPrev = this.compareDate(year + '-' + month + '-' + i)
        days.push({
          day: i,
          choosed: false,
          isPrev: isPrev
        });
      }
      console.log(days);
      this.setData({ days });
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
        cur_month: newMonth
      });

      const date = { year: newYear, month: newMonth, day: 1 }
      const dateString = `${newYear}-${newMonth}-${1}`
      this.onChangeDate(date, dateString)
    },

    // 点击某一天
    tapDayItem(e) {
      // 目前用单个操作
      const { days, cur_year, cur_month, limited } = this.data
      const idx = e.currentTarget.dataset.idx;

      const date = { year: cur_year, month: cur_month, day: idx + 1 }
      const dateString = `${cur_year}-${cur_month}-${idx + 1}`

      // 是否是今日之前
      const isPrev = this.compareDate(dateString) ? true : false

      // 如果限制今日之前，点击今日之前时，组件不做反应
      if (!(limited && isPrev)) {
        days[idx].choosed = !days[idx].choosed;
        this.setData({ days });
      }

      this.onClickDay(date, dateString, isPrev)

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
      let myEventDetail = null
      if (this.data.limited) {
        myEventDetail = { date: obj, dateString: str, isPrev }
      } else {
        myEventDetail = { date: obj, dateString: str }
      }
      this.triggerEvent("onClickDay", myEventDetail)
    },

    // 对外：更换时间
    onChangeDate(obj, str) {
      const myEventDetail = { date: obj, dateString: str }
      this.triggerEvent("onChangeDate", myEventDetail)
    }

  }
})
