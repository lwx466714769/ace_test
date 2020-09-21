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
    isShow: true,
    deleteStarus:false,
  },
  /*--初始化数据--*/
  ready() {
    console.log('组件',this.data);
  },

  /**
   * 组件的方法列表
   */
  methods: {
    reSubmit() {
      this.hide();
    },
    /**-----删除无效卡-----*/
    deleteCard(){
      const { deleteItems} = this.data;
      const pages = getCurrentPages();
      for (let index = 0; index < deleteItems.length; ++index){
        this.deleteFn(deleteItems[index]);
        if(index+1 == deleteItems.length){
          wx.showToast({
            title: '删除成功',
            icon: 'none',
            duration: 500,
            success() {
              const beforePage = pages[pages.length - 1];
              beforePage.changeData();
            },
          });
        }
      };
      this.hide();
      this.triggerEvent('reApply', this.data);
    },
    deleteFn(consumerCardId) {
      const url = `${urls._consumerCard}/${consumerCardId}`;
      const method = 'DELETE';
      const success = body => {
        console.log('正在删除');
      };
      const fail = body => {
        wx.showToast({
          title: body.message || '删除失败',
        })
      };
      fetch({ url, method, loading: false, success, fail, });
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
