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
    /**-----删除帖子-----*/
    deleteCard() {
      const { postId, commentId} = this.data.deleteItems;
      let url_post = `${urls._post}/${postId}`;
      let url_comment = `${urls._post}/${postId}/comments/${commentId}`;
      const pages = getCurrentPages();
      const url = !commentId ? url_post : url_comment;
      const method = 'DELETE';
      const loading = '删除中...';
      const success = body => {
        wx.showToast({
          title: '删除成功',
          icon: 'none',
          duration: 500,
        });
        if (!!commentId){
          const beforePage = getCurrentPages()[getCurrentPages().length - 1];
          beforePage.changeData();
        }else{
          wx.navigateBack({
            delta: pages.length - (pages.length - 1),
            success: res => {
              if (pages.length > 1) {
                const beforePage = pages[pages.length - 2];
                beforePage.changeData();
              }
            }
          });
        }
        this.hide();
      };
      const fail = ({
        code
      }) => {
        let errMap = new Map([
          [1044, '删除失败']
        ]);
        wx.showToast({
          title: errMap.get(code) || "删除失败",
          icon: 'none'
        })
      }
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
