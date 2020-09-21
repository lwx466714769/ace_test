import urls from '../../utils/urls.js'
import {fetch,formatPostsAce} from '../../utils/utils.js'
// 资讯页面组件
Component({
  properties:{},
  data:{
    posts:[],
    page:0,
    size:10,
    showAll:'加载中...'
  },
  attached(){
    
  },
  methods:{
    reachBottomData() {
      const { page, showAll } = this.data;
      if (showAll=='加载中...') {
        this.setData({ page: page + 1});
        this.getData();
      }
    },
    getData(refresh = false){
      const {page,size,posts} = this.data;
      let p = refresh ? 0:page;
      const url = `${urls._verify}/channel/items`;
      const data = {page:p,size};
      const success = body =>{
        refresh && wx.stopPullDownRefresh();
        if(body.length == 0||body.length<size-2){
          this.setData({showAll:true})
        }
        let list = refresh ? posts : posts.concat(body);
        this.setData({posts:list});
      }
      const fail = body =>{
        wx.showToast({
          title: body.message,
          icon:'icon'
        })
      }
      fetch({url,data,loading:'加载中...',success,fail});
    }
  }
})