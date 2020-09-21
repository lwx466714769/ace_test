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
    reSubmit(){
      this.redelete();
      this.hide();
    },
    redelete(){
      const { id } = this.data.deleteItems;
      const url = `${urls._carcheck}/${id}`;
      const method = "DELETE";
      const success = body => {
        setTimeout(function () {
          wx.navigateTo({
            url: '/attestation/pages/attestation/attestation',
          });
        }, 500);
        success: res => {
          this.changeParentData();
        }
        this.setData({ deleteId: id });
        this.triggerEvent('reApply');
        this.hide();
      };
      const fail = body => {
          wx.showToast({
            title: '删除失败',
            icon: 'none',
            duration: 2000,
          })
        };
        fetch({ success, url, fail, loading: '正在删除...', method });
    },
    // DELETE
    deleteCar(){
      const { id } = this.data.deleteItems;
      const url = `${urls._carcheck}/${id}`;
      const method = "DELETE";
      const success = body => {
        wx.showToast({
          title: '删除成功',
          icon: 'none',
          duration: 500,
        });
        this.changeParentData();
        this.setData({deleteId:id});
        this.triggerEvent('reApply');
        this.hide();
      };
      const fail = body => { 
        wx.showToast({
          title: '删除失败',
          icon:'none',
          duration:2000,
        })
      };
      fetch({ success, url, fail, loading: '正在删除...', method});
    },
    show() {
      this.setData({ isShow: false });
    },
    hide() {
      this.setData({ isShow: true });
    },
    selectHIde(){
      this.setData({ isShow: true });
    },
    changeParentData() {

      console.log('这是组件传的信息')
      const pages = getCurrentPages();

      if (pages.length > 1) {

        const beforePage = pages[pages.length - 1];
        console.log('beforePage-->', beforePage)
        beforePage.changeData();

      }

    }
  }
})
