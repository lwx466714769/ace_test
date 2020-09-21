// equip/my-equip.js
import urls from '../../utils/urls.js';
import { fetch } from '../../utils/utils.js'
import constv from '../../const.js'
Page({

  /**
   * 页面的初始数据
   */
  data: {
    clubId:constv.cid
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (ops) {
    if (ops.isFrom){
      this.setData({ isFrom:ops.isFrom})
    }
  },
  onShow(){
    this.setData({ myEquipList:[]},this.getMyEquip);
  },
  onHide(){
    this.setData({ isLoad:false});
  },
  getMyEquip(){
    const {clubId}= this.data;
    fetch({
      url:`${urls.equip}`,
      data:{clubId},
      loading:'加载中...',
      success:body =>{
        this.setData({isLoad:true});
        this.setData({myEquipList:body})
      }
    })
  },
  shareClub(e){
    console.log(e);
    const { id, replaceBackground} = e.currentTarget.dataset;
    this.setData({curEquipId:id});
      const {myEquipList,clubId} = this.data;
      let myEquip = myEquipList.find(item=>item.id == id);
      wx.showModal({
        title: '',
        content: '确认将该装备添加至俱乐部？',
        success:res=>{
          if(res.confirm){
            fetch({
              url:`${urls.equip}/${id}/audit`,
              data:{clubId},
              method:'POST',
              success:body=>{
                myEquip.equipAuditStatus = 'UNAUDIT';
                let pages = getCurrentPages();
                var prePages = pages[pages.length - 2];
                prePages.setData({ equipUpdate: true });
                this.setData({ myEquipList});
              }
            })
          }
        }
      })
    //}
    
  },
  cancelShareClub(e){
    const { id } = e.currentTarget.dataset;
    const { myEquipList, clubId } = this.data;
    let myEquip = myEquipList.find(item => item.id == id);
    wx.showModal({
      title: '',
      content: '确认取消添加',
       success: res => {
        if (res.confirm) {
          fetch({
            url: `${urls.equip}/${id}/audit?clubId=${clubId}`,
            method: 'DELETE',
            success: body => {
              myEquip.equipAuditStatus = null;
              let pages = getCurrentPages();
              var prePages = pages[pages.length - 2];
              prePages.setData({ equipUpdate: true });
              this.setData({ myEquipList });
            }
          })
        }
      }
    })
  },
  // 获取装备照片
  getEquipPhotos(equipId) {
    fetch({
      url: `${urls.album}/${equipId}/photo/2`,
      data: { pageNo: 0, pageSize: 10 },
      success: body => {
        if (body.content.length < 3) {
          return 'false';
        }else{
          return 'true';
        }
      }
    })
  },
})