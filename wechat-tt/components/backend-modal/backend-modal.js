// components/backend-modal/backend-modal.js
Component({
  /**
   * 组件的属性列表
   * 自定义弹穿组件，多文字换行，按钮多文字
   * modalCon:显示内容,cancelFn:取消回调，confirmFn:确认回调
   * cancelText:按钮文字，默认取消，confirmText:默认确认
   * modal:{modalCon:[],cancelFn,confirmFn,cancelText,confirmText}
   * 
   */
  properties: {
    modal:{
      type:Object
    },
    show:{
      type:Boolean,
      value:false
    }
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
  detached(){
    this.setData({show:false})
  },
  methods: {
    // 管理员提示
    show() {
      this.setData({ show:true })
    },
    hide(){
      this.setData({show:false})
    },
    confirmFn(){
      const {modal } = this.data;
      if(modal.confirmFn){
        modal.confirmFn();
      }
      this.setData({ show: false })
    },
    cancelFn(){
      const {modal } = this.data;
      if (modal.cancelFn) {
        modal.cancelFn();
      }
      this.setData({ show: false })
    }
  }
})
