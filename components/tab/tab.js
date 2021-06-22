// components/tab/tab.js
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    tablist: {
      type: Array,
      value: [],
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
    const {tablist} = this.data;
    this.setData({tab:tablist});
  },
  /**
   * 组件的方法列表
   */
  methods: {
    changeTab(e) {
      console.log(e);
      let index;
      // 判断组件间相互调用，传递index，进行跳转tab,例如：资讯福利
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
      if(render.render){
        this.triggerEvent('changeTab', { index, 'state': false });
      }else{
        render.render = true;
        this.setData({tab});
        this.triggerEvent('changeTab', { index, 'state': true });
      }
    }
  }
})
