// event/event-join/event-join.js
import {uploadImages} from '../../utils/utils.js'
Page({

  /**
   * 页面的初始数据
   */
  data: {

  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (ops) {
    console.log(ops);
    const updateMember = wx.getStorageSync('updateMember');
    this.setData({ updateMember,changeType:ops.changeType,curIndex:ops.index});
  },
  onUnload(){
    wx.removeStorageSync('updateMember');
  },
  changeInput(e) {
    let { updateMember } = this.data;
    const { name } = e.currentTarget.dataset;
    let info = updateMember.find(o => o.name == name);
    info.value = e.detail.value;
    this.setData({ updateMember });
  },
  addImages(e){
    const {name} = e.currentTarget.dataset;
    const { updateMember} = this.data;
    wx.chooseImage({
      count:1,
      success: ({tempFilePaths})=>{
        uploadImages(tempFilePaths,(urls)=>{
          let curImage = updateMember.find(item => item.name == name);
          curImage.value = urls[0];
          this.setData({ updateMember});
        })
      }
    })
  },
  saveMember(){
    const { updateMember, changeType, curIndex} = this.data; 
    console.log(updateMember);
    let lock = false;
    for (let i in updateMember) {
      if (!updateMember[i].value) {
        lock = false;
        break;
      } else {
        lock = true;
      }
    }
    if (!lock) {
      wx.showToast({
        title: '好像少了点什么',
        icon: 'none'
      })
      return;
    }
    let pages = getCurrentPages();
    var prePages = pages[pages.length - 2];
    let members = prePages.data.members;
    // let memberName = prepages.data.memberName;
    let memberName = [];
    console.log(members);
    if (changeType == 'CREATE') {
      members = [...members,updateMember];
    }else if (changeType == 'UPDATE') {
      members = members.map((o, index) => index == curIndex ? updateMember : o);
    }
    for(var i=0;i<members.length;i++){
      for(var j=0;j<members[i].length;j++){
        if (members[i][j].name == '姓名') {
          memberName.push(members[i][j].value); break;
        } else if (members[i][j].type == 'TEXT' || members[i][j].type == 'NUMBER') {
          memberName.push(members[i][j].value); break;
        }else{
          memberName.push(i+1);
        }
      }
    }   
    prePages.setData({ members,memberName});
    wx.navigateBack()
  },
  delMember(){
    const { updateMember, changeType, curIndex} = this.data;
    let pages = getCurrentPages();
    var prePages = pages[pages.length - 2];
    let members = prePages.data.members;
    members = members.filter((o, index) => index != curIndex);
    prePages.setData({ members });
    wx.navigateBack()
  }
})