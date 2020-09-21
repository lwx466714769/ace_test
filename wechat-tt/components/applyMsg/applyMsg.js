import urls from '../../utils/urls.js';
import { fetch, uploadImages, } from '../../utils/utils.js';
Component({
  behaviors:[],
  /**
   * 组件的属性列表
   */
  properties: {
    signItems:{
      type: null,
      value:'',
      observer(newData,oldData){},
    },
  },

  /**
   * 组件的初始数据
   */
  data: {
    isShow: false,
  },
  ready(){
    console.log('申请-->',this.data)
    const { signItems} = this.data;
    this.setData({ signItems:signItems.map(obj => ({ ...obj, name: obj.name, type: obj.type, value: '' }))});
  },
  /**
   * 组件的方法列表
   */
  methods: {
    /*--确认申请信息--*/
    identificationMsg(){
      const {signItems} = this.data;
      const exitSignItems = signItems.some(obj => obj.value == "");
      if (exitSignItems){
        wx.showToast({
          title: '信息不完整',
          duration:2000,
          icon:'none',
        })
      }else{
        this.triggerEvent('toApply', this.data);
        this.hide();
      };
    },
    /*--获取 身份证 照片--*/ 
    upLoadFront(e) {
      const { name } = e.currentTarget.dataset;
      let { signItems } = this.data;
      let _this = this;
      wx.chooseImage({
        count: 1,
        success: function ({ tempFilePaths }) {
          const tempImages = tempFilePaths[0];
          uploadImages(tempFilePaths, function () { }, function ({ itemUrl }) {
            console.log('signItems-->', signItems, 'name-->', name);
            let info = signItems.find(o => o.name == name);
            info.value = itemUrl;
            _this.setData({ signItems });
          })
        },
      })
    },
    upLoadBeyonce(e) {
      const { name } = e.currentTarget.dataset;
      let _this = this;
      wx.chooseImage({
        count: 1,
        success: function ({ tempFilePaths }) {
          const tempImages = tempFilePaths[0];
          uploadImages(tempFilePaths, function () { }, function ({ itemUrl }) {
            const { signItems } = this.data;
            const { name } = e.currentTarget.dataset;
            const list = signItems.find(o => o.name == name);
            list.value = e.detail.value;
            _this.setData({ signItems});
          })
        },
      })
    },
    /*--获取 申请人 名字--*/
    applyUser(e){
      let { signItems } = this.data;
      const { name } = e.currentTarget.dataset;
      console.log('signItems-->', signItems, 'name-->', name);
      let info = signItems.find(o => o.name == name);
      info.value = e.detail.value;
      this.setData({ signItems });
    },
    /*--获取 申请人 电话--*/
    applyUserPhone(e) {
      let { signItems } = this.data;
      const { name } = e.currentTarget.dataset;
      console.log('signItems-->', signItems,'name-->',name);
      let info = signItems.find(o => o.name == name);
      info.value = e.detail.value;
      this.setData({ signItems });
    },
    show() {
      this.setData({ isShow: true });
    },
    hide() {
      this.setData({ isShow: false });
    },
    toDelete(){
      this.setData({ isShow: false });
    }
  }
})
