// components/tab/tab.js
Component({
  /**
   * 组件的属性列表
   * tab切换组件
   * 选项列表:index下标,name名字，type 类型,render为false重新加载
   * tablList:[{index:0,name:'',type:'',render:true}]
   * blue 是否为蓝色指示选项，默认黑色
   */
  properties: {
    tablist: {
      type: Array,
      value: [],
      observer:function(newVal,oldVal){
        this.getNewVal(newVal);
      }
    },
    border:{
      type:Boolean,
      value:true
    },
    blue:{
      type:Boolean
    }
  },
  externalClasses:['tab-class'],
  /**
   * 组件的初始数据
   */
  data: {
    curIndex:0,
    tab:[]
    
  },
  attached(){
    console.log(this.data.tab)
  },
  /**
   * 组件的方法列表
   */
  methods: {
    getNewVal(newVal){
      // let val = newVal.map(item=>{
      //   item.render = false;
      //   return item;
      // })
      this.setData({ tab: newVal});
    },
    changeTab(e) {
      console.log(e);
      console.log(this.data.tab)
      let index;
      // 判断组件间相互调用，传递index，进行跳转tab,例如：资讯卡券
      if(e.detail.index||e.detail.index==0){
        index = e.detail.index;
      }else{
        index = e.currentTarget.dataset.index;
      }
      index = Number(index);
      const { curIndex } = this.data;
      if (index === curIndex) return;
      const {tab} = this.data;
      this.setData({ curIndex: index });
      let render = tab.find(item=>item.index ==index);
      let type='';
      if(e.currentTarget.dataset.type){
        type = e.currentTarget.dataset.type;
      }
      if(render.render){
        this.triggerEvent('changeTab', { index, 'state': false,type });
      }else{
        render.render = true;
        this.setData({tab});
        this.triggerEvent('changeTab', { index, 'state': true,type });
      }
    }
  }
})
