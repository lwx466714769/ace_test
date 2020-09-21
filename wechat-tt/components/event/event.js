import urls from '../../utils/urls.js';
import { fetch, formatDateCN, needJoin, login} from '../../utils/utils.js'
Component({
  properties: {
    clubId: Number,
    clubProperty: Boolean,
    signItems:Boolean,
    member: Boolean,
    curUserId: Number,
    filterCon: {
      type: String,
      value: '全部'
    }
  },
  /**
   * 页面的初始数据
   */
  data: {
    types: [
      {index:0,name:'分类',type:'classify',list:[]},
      {inex: 1, name: '时间', type:'time',list: [
        { index: 0, name: '全部' },
        { index: 1, name: '本周' },
        { index: 2, name: '当月' },
        { index: 3, name: '当月后' }
      ]}      
    ],
    curType: '',//当前选择的类型
    curTypeCon:'',//当前所选类型的内容
    eventList:[],
    page:0,
    count:10,
    showAll:'加载中...'
  },
  methods: {
    // 选择不同类型的俱乐部
    typeChange(e) {
      const { curType,types} = this.data;
      const { type } = e.currentTarget.dataset;
      if (curType == type) {
        this.setData({curType:''})
      }else{
        let info = types.find(item=>item.type==type);
        this.setData({ curType: type,curTypeCon:info });
      }
    },
    reachBottomData() {
      const { page, showAll } = this.data;
      if (showAll == '加载中...') {
        this.setData({ page: page + 1 },this.getData);
      }
    },
    getData(refresh = false) {
      const { clubId, page, count } = this.data;
      let p = page;
      if (refresh) {
        p = 0;
        this.setData({ page: 0, eventList: [], showAll: '加载中...' })
      }
      let data = {
        page: p,
        count
      }
      fetch({
        url: `${urls._club}/${clubId}/events`,
        data: data,
        loading: '加载中...',
        success: body => {
          wx.stopPullDownRefresh();
          const { eventList } = this.data;
          if (body.length == 0 || body.length < 3) {
            this.setData({ showAll: true })
          }
          body.map(item=>{
            item.startAt = formatDateCN(item.startAt);
            console.log(item.startAt)
            let tempItem = item.startAt.split('月');
            item.month = tempItem[0].split('年')[1];
            item.day = tempItem[1].split('日')[0];
          })
          
          let list = [...eventList, ...body];
          this.setData({ eventList: list })
        }
      })
    },
    goEventDetail(e){
      console.log(this.data);
      const { eventList} = this.data;
      const { id } = e.currentTarget.dataset;
      // if (signItems>0 && !member) {
      //   needJoin(clubId);
      // } else {
      //   const event = eventList.find(item => item.eventId == id);
      //   wx.navigateTo({
      //     url: `/event/event-detail/event-detail?eventId=${event.eventId}&clubId=${clubId}`
      //   })
      // }
      const event = eventList.find(item => item.eventId == id);
      wx.navigateTo({
        url: `/event/event-detail/event-detail?eventId=${event.eventId}&clubId=${this.data.clubId}`
      })
    },
    goParty(e){
      const { clubId,member } = this.data;
      const { userId } = wx.getStorageSync('user');
      if (userId) {
        if (member) {
          wx.navigateTo({
            url: `/game/party/party?clubId=${clubId}`
          })
        } else {
          needJoin(clubId, '发布攒局需加入俱乐部')
        }

      } else {
        login(e, () => {
          this.goParty(e);
        })
      }
    },
    uploadEvent() {
      const { clubId } = this.data;
      const { userId } = wx.getStorageSync('user');
      if (userId) {
        wx.navigateTo({
          url: `/event/upload-event/upload-event?clubId=${clubId}`,
        })
      } else {
        login(e, () => {
          // this.setData({ clearUser: 'on' })
        })
      }
    }
  },
  
})