// components/form/form.js

import {uploadImages} from '../../utils/utils'
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    list:{
      type:Array,
      value:[]
    }
  },

  /**
   * 组件的初始数据
   */
  data: {
    showFilter:false,//选择上拉框是否显示
    submitData:{},//提交的数据
    tempName:{},//临时选择的上拉选择框名字
    filterList:[],//上拉筛选列表
    images:[]
  },
  attached: function() {
    // 在组件实例进入页面节点树时执行
    console.log(this.data.list)
    this.setData({initData:this.data.list})
  },
  /**
   * 组件的方法列表
   */
  methods: {
    // 文本框
    bindInput(e){
      const {name} = e.currentTarget.dataset;
      this.setData({['submitData.'+name]:e.detail.value})
    },
    // 选择器
    bindPickerChange(e){
      console.log(e)
      const {name,options} = e.currentTarget.dataset;
      this.setData({['submitData.'+name]:options[e.detail.value]})
    },
    // radio
    showFilterWrap(e){
      const {options,name} = e.currentTarget.dataset;
      this.setData({showFilter:!this.data.showFilter,filterList:options,tempName:name});
    },
    // 上拉选择
    changeType(e){
      const {tempName} = this.data;
      const {value} = e.currentTarget.dataset;
      this.setData({['submitData.'+tempName]:value,showFilter:false});
    },
    // switch
    bindSwitch(e){
      const {name} = e.currentTarget.dataset;
      this.setData({['submitData.'+name]:e.detail.value})
    },
    // 上传图片
    addImages(e) {
      console.log(e);
      const { name,count } = e.currentTarget.dataset;
      wx.chooseImage({
        count,
        success: function ({ tempFilePaths }) {
          // 生成预览列表
          // 上传到服务器
          uploadImages(tempFilePaths, function () {},
          ({ img}) => {
            const { images } = _this.data
            let imgs = [...images,...img];
            console.log(imgs);
            this.setData({images:imgs,['submitData'+name]:images})
          })
        },
      })
    },
    // 删除一张图片
    delImages(e) {
      wx.showModal({
        content: '确认删除？',
        success: res => {
          if (res.confirm) {
            let { images } = this.data;
            const {index,name} = e.currentTarget.dataset;
            images = images.filter((item,i) => i != index);
            this.setData({ images,['submitData'+name]:images });
          }
        }
      })
    },
    // 提交
    submit(){
      const {submitData} = this.data;
      let lock = false;
      for (let i in submitData) {
        if (submitData.require && !submitData[i].value) {
          lock = false;
          break;
        } else {
          lock = true;
        }
      }
      console.log(submitData)
    },
    formSubmit(e){
      console.log(e)
    }
  }
})
