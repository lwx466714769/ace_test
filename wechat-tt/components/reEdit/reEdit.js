import urls from '../../utils/urls.js';
import { fetch, uploadImages, } from '../../utils/utils.js';
Component({
  behaviors:[],
  /**
   * 组件的属性列表
   */
  properties: {
    signItem:{
      type: null,
      value:'',
      observer(newData,oldData){
        console.log('删除newData-->',newData);
      },
    },
  },

  /**
   * 组件的初始数据
   */
  data: {
    isShow: false,
    delMsg:false,
  },
  ready(){
    console.log('删除-->',this.data);
  },
  /**
   * 组件的方法列表
   */
  methods: {
    /*--确认申请信息--*/
    identificationMsg(){
      const {signItem} = this.data;
      const exitsignItem = signItem.some(obj => obj.value === "");
      if (exitsignItem){
        wx.showToast({
          title: '信息不完整',
          duration:2000,
          icon:'none',
        })
      }else{
        console.log('signItem-->', signItem)
        this.triggerEvent('toEdit', this.data);
        this.isHide();
      };
    },
    /*--身份证(图片类)--*/
    upLoadFront(e) {
      const { name } = e.currentTarget.dataset;
      let { signItem } = this.data;
      let _this = this;
      wx.chooseImage({
        count: 1,
        success: function ({ tempFilePaths }) {
          const tempImages = tempFilePaths[0];
          uploadImages(tempFilePaths, function () { }, function ({ itemUrl }) {
            console.log('signItem-->', signItem, 'name-->', name);
            let info = signItem.find(o => o.name == name);
            info.value = itemUrl;
            _this.setData({ signItem });
          })
        },
      })
    },
    /*--名字(文字类)--*/
    applyUser(e){
      let { signItem } = this.data;
      const { name } = e.currentTarget.dataset;
      console.log('signItem-->', signItem, 'name-->', name);
      let info = signItem.find(o => o.name == name);
      info.value = e.detail.value;
      this.setData({ signItem });
    },
    /*--电话(数字类)--*/
    applyUserPhone(e) {
      let { signItem } = this.data;
      const { name } = e.currentTarget.dataset;
      console.log('signItem-->', signItem, 'name-->', name);
      let info = signItem.find(o => o.name == name);
      info.value = e.detail.value;
      this.setData({ signItem });
    },
    isShow() {
      this.setData({ isShow: true });
    },
    isHide() {
      this.setData({ isShow: false });
    },
    toDelete(){
      this.setData({ isShow: false, delMsg: true, signItem:null });
      this.triggerEvent('toEdit', this.data);
    }
  }
})
