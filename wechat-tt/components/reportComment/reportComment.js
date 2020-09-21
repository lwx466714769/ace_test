import urls from '../../utils/urls.js';
import { fetch, uploadImages, } from '../../utils/utils.js';
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    mustItem: {
      type: null,
      value: '',
      observer(newData, oldData) {
        console.log('newData-->', newData)
      },
    },
  },

  /**
   * 组件的初始数据
   */
  data: {
    isShow: true,
  },
  /*--初始化数据--*/
  ready() {
    console.log('举报组件',this.data);
  },

  /**
   * 组件的方法列表
   */
  methods: {
    reSubmit() {
      this.hide();
    },
    confirm(){
      this.setData({ report: false}, this.hide)
    },
    /**-----举报 评论-----*/
    deleteCard() {
      const consumerCardId = this.data.deleteItems;
      const { commentId, report} = this.data.mustItem;
      const pages = getCurrentPages();
      const url = `${urls._comments}/${commentId}/report`;
      const method = 'POST';
      const data = this.data.mustItem;
      const loading = '处理中...';
      const success = body => {
        console.log('举报',body)
        this.setData({ report: true});
        console.log('举报组价',this.data)
      };
      const fail = body => {
        wx.showToast({
          title: body.message || '天选之人,举报失败',
        })
      };
      fetch({ url, method, loading, success, fail, data });
    },
    show() {
      this.setData({ isShow: false });
    },
    hide() {
      this.setData({ isShow: true });
    },
    selectHIde() {
      this.setData({report: false },this.hide);
    },
  }
})
