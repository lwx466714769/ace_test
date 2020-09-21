import urls from '../../utils/urls.js';
import { fetch, uploadImages, } from '../../utils/utils.js';
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    deleteItems: {
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
    isShow: true
  },
  /*--初始化数据--*/
  ready() {
    console.log(this.data);
  },

  /**
   * 组件的方法列表
   */
  methods: {
    reSubmit() {
      this.hide();
    },
    /**-----删除无效卡-----*/
    deleteCard() {
      const consumerCardId = this.data.deleteItems;
      const pages = getCurrentPages();
      const url = `${urls._order}/${consumerCardId}`;
      const method = 'DELETE';
      const loading = '处理中...';
      const success = body => {
        wx.showToast({
          title: '删除成功',
          icon: 'none',
          duration: 500,
        });
        wx.navigateBack({
          delta: pages.length - (pages.length - 1),
          success: res => {
            if (pages.length > 1) {
              const beforePage = pages[pages.length - 2];
              beforePage.changeData();
            }
          }
        });
        this.hide();
      };
      const fail = body => {
        wx.showToast({
          title: body.message || '删除失败',
        })
      };
      fetch({ url, method, loading, success, fail, });
    },
    show() {
      this.setData({ isShow: false });
    },
    hide() {
      this.setData({ isShow: true });
    },
    selectHIde() {
      this.setData({ isShow: true });
    },
  }
})
