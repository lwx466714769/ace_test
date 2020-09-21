import urls from '../../utils/urls.js';
import { fetch, uploadImages, } from '../../utils/utils.js';
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    oDrivers: {
      type: null,
      value: [],
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
    oDrivers:[],
  },
  /*--初始化数据--*/ 
  ready() {
    console.log(this.data);
  },

  /**
   * 组件的方法列表
   */
  methods: {
    uploadCardImg() {
      var that = this;
      wx.chooseImage({
        count: 1,
        success: ({ tempFilePaths }) => {
          uploadImages(tempFilePaths,
            function (filsUrl) { 
              that.setData({ oDrivers: filsUrl});
              that.triggerEvent('reApply', that.data); 
              },
            function (itemUrl) { }
            );
        },
      });
      this.hide();
    },
    reSubmit(){
      this.hide();
    },
    deleteCar(){
    },
    show() {
      this.setData({ isShow: false });
    },
    hide() {
      this.setData({ isShow: true });
    }
  }
})
