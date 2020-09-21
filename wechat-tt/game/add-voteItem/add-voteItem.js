// game/add-voteItem/add-voteItem.js
import urls from '../../utils/urls.js';
import { fetch, uploadImages} from '../../utils/utils.js'
Page({

  /**
   * 页面的初始数据
   */
  data: {
    itemName:'',
    images:[]
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (ops) {
    console.log(ops);
    if(ops.addType=='addNewItem'){
      this.setData({ addType:ops.addType, voteItemImgLimitNum: Number(ops.voteItemImgLimitNum)});
    }
    console.log(this.data)
    if (ops.addType == 'updateItem'){
      if(ops.imgs){
        let imgs = ops.imgs.split(',');
        this.setData({images:imgs})
      }
      this.setData({ addType: ops.addType, curIndex: ops.index, itemName:ops.word})
      console.log(this.data);
    }
    if(ops.voteId){
      this.setData({voteId:ops.voteId});
    }
    this.setData({ type: ops.type });
  },
  voteItemName(e){
    const {value} = e.detail;
    this.setData({itemName:value});
  },
  addImages() {
    let _this = this,count;
    let { images, voteItemImgLimitNum} = this.data;
    if(voteItemImgLimitNum){
      count = voteItemImgLimitNum - images.length;
    }else{
      count = 9 - images.length;
    }
    wx.chooseImage({
      count,
      success: function ({ tempFilePaths }) {
        uploadImages(tempFilePaths, function (imgs) {
          let newImg = [...images,...imgs];
          _this.setData({images:newImg})
          console.log(_this.data.images)
        }, function ({ itemUrl, filePath }) {
          console.log(itemUrl);
        });
      }
    })
  },
  delImages(e) {
    const { index } = e.currentTarget.dataset;
    const { images } = this.data;
    const delImgs = images.filter((item,i)=>i != index);
    this.setData({ images: delImgs });
  },
  submit(){
    const { type, images, itemName, voteId, addType,curIndex} = this.data;
    let obj;
    if(itemName==''){
      wx.showToast({
        title: '投票项名不能为空',
        icon:'none'
      })
      return;
    }
    // if(type == 'WORDIMAGE'&& images.length==0){
    //   wx.showToast({
    //     title: '请上传图片',
    //     icon:'none'
    //   })
    //   return;
    // }   
    const pages = getCurrentPages();
    const prePage = pages[pages.length - 2];
    
    if (type == 'WORDIMAGE') {
      obj = { voteItemStr: itemName, voteItemImage: images };
    } else {
      obj = { voteItemStr: itemName };
    }
    console.log(obj);
    // 投票详情添加新选项
    if(addType == 'addNewItem'){
      fetch({
        url:`${urls.vote}/${voteId}/item`,
        method:'POST',
        json:true,
        data:obj,
        success:body=>{
          prePage.setData({voteItemUpdate:true});
          setTimeout(() => {
            wx.navigateBack()
          }, 200);
        }
      })
      // 修改选项
    }else if(addType=='updateItem'){
      let { wordList, wordImgList } = prePage.data;
      if (type == 'WORDIMAGE') {
        wordImgList = wordImgList.map((item, index) => index == curIndex ? obj : item);
      } else {
        wordList = wordList.map((item,index)=>index==curIndex?obj:item);
      }
      prePage.setData({ wordImgList, wordList });
      setTimeout(() => {
        wx.navigateBack()
      }, 200);
    // 添加一个选项
    }else{
      let { wordList, wordImgList } = prePage.data;
      if (type == 'WORDIMAGE') {
        wordImgList = [...wordImgList, obj];
      } else {
        wordList = [...wordList, obj];
      }
      prePage.setData({wordImgList,wordList});
      setTimeout(() => {
        wx.navigateBack()
      }, 200);
    }
    
    
  },
})