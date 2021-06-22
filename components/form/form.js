// components/form/form.js

import {uploadImages} from '../../utils/utils'
import WxValidate from '../../utils/WxValidate'
// 1  required: true	这是必填字段。
// 2	email: true	请输入有效的电子邮件地址。
// 3	tel: true	请输入11位的手机号码。
// 4	url: true	请输入有效的网址。
// 5	date: true	请输入有效的日期。
// 6	dateISO: true	请输入有效的日期（ISO），例如：2009-06-23，1998/01/22。
// 7	number: true	请输入有效的数字。
// 8	digits: true	只能输入数字。
// 9	idcard: true	请输入18位的有效身份证。
// 10	equalTo: 'field'	输入值必须和 field 相同。
// 11	contains: 'ABC'	输入值必须包含 ABC。
// 12	minlength: 5	最少要输入 5 个字符。
// 13	maxlength: 10	最多可以输入 10 个字符。
// 14	rangelength: [5, 10]	请输入长度在 5 到 10 之间的字符。
// 15	min: 5	请输入不小于 5 的数值。
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
    const initData = this.data.list;
    console.log(initData);
    this.setData({initData})
    let rules = {};
    let messages = {};
    initData.map(item =>{
      rules[item.name] = {};messages[item.name] = {};
      rules[item.name].required = item.required;
      rules[item.name][item.name] = item.required;
      messages[item.name].required = item.requiredMessage;
      messages[item.name][item.name] = item.ruleMessage;
    })
    console.log(rules);
    // console.log(messages);
    this.WxValidate = new WxValidate(rules,messages);
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
      this.setData({['submitData.'+name]:e.detail.value})
    },
    //多列选择器
    bindMultiPickerChange(e){
      console.log(e)
    },
    bindMultiPickerColumnChange(e){
      console.log(e)
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
      console.log(e);
      const {initData,submitData} = this.data;
      // const params = e.detail.value;
      const params = submitData;
      console.log(params);
      if(!this.WxValidate.checkForm(params)){
        const error = this.WxValidate.errorList;
        console.log(error);
        wx.showToast({
          title: error[0].msg,
          icon:'none'
        })
        return;
      }
      console.log('成功')
    }
  }
})
