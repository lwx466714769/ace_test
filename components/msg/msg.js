// components/msg.js
Component({
  
  options:{
    multipleSlots: true,
  },
  
  /**
   * 组件的属性列表
   */
  properties: {

  },

  /**
   * 组件的初始数据
   */
  data: {
    show:false
  },
  
  /**
   * 组件的方法列表
   */
  methods: {
    showMsg() {
      this.setData({
        show: !this.data.show
      })
    }, 
  }
})
