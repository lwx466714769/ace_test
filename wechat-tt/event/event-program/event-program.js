// event/event-program/event-program.js
import urls from '../../utils/urls.js';
import { fetch, formatDate, getTextFromHTML } from '../../utils/utils.js'
Page({

  /**
   * 页面的初始数据
   */
  data: {
    count:0,
    finalPrice:0,
    discount:0
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (ops) {
    console.log(ops);
    this.setData({ activityId: ops.activityId, discount: ops.discount });
  },
  onUnload(){
    this.setData({isUpdate:false});
    wx.removeStorageSync('finalStage');
  },
  onShow(){
    const { isUpdate} = this.data;
    console.log(isUpdate);
    if(isUpdate){
      
    }
    this.getEventProgram();
  },
  onHide(){
    this.setData({ isUpdate: false });
  },
  getEventProgram(activityCheckInfos){
    const { activityId,discount} = this.data;
    fetch({
      url: `${urls.activity}/${activityId}/getStageAndGroupAndGood`,
      loading: '加载中...',
      success: body => {
        let list = body.map(stage=>{
          console.log(stage)
          stage.activityGroupVOS.map(group=>{
            group.activityGoodVOS.map(item=>{
              item.count = 0;
              if (discount > 0) {
                item.initPrice = Math.floor(item.price / discount * 100) / 100;
              } else {
                item.initPrice = item.price;
              }
              activityCheckInfos&&activityCheckInfos.map(check => {
                if(item.goodId == check.goodId&&!check.checkResult){
                  item.inventoryState = true;
                }
              })
            })
          })
          return stage;
        })
        console.log(list);
        this.setData({ program: list })
      }
    })
  },
  changeNumber(e) {
    const {stageId,groupId,goodId,type} = e.currentTarget.dataset;
    let { program,finalPrice} = this.data;
    let curStage = program.find(item=>item.stageId == stageId);
    let curGroup = curStage.activityGroupVOS.find(item=>item.groupId == groupId);
    let curItem = curGroup.activityGoodVOS.find(item=>item.goodId == goodId);
    if(type == 'add'){
      // 如果为单选
      if(curGroup.groupType == 'RADIO'){
        let otherItem = curGroup.activityGoodVOS.filter(item=>item.goodId !=goodId);
        otherItem.map(item=>{
          finalPrice = finalPrice - item.count * item.price;
          item.count = 0;  
        });
      }
      // 已达到购买数量
      if(curItem.limitHint||curItem.restriction==0){
        wx.showToast({
          title: '您的购买次数已达上限',
          icon: 'none'
        })
        return;
      }else if(curItem.inventory==0){
        wx.showToast({
          title: '库存不足',
          icon: 'none'
        })
        return;
      }else{

        // 数量小于限购数量
        if (curItem.count!=0&&curItem.count >= curItem.restriction){
          wx.showToast({
            title: '您的购买次数已达上限',
            icon:'none'
          })
          return;
        } else if (curItem.count != 0 && curItem.count >= curItem.inventory){
          wx.showToast({
            title: '库存不足',
            icon: 'none'
          })
          return;
        }else{
          curItem.count ++;
          finalPrice = curItem.count * curItem.price;
        }
      }
      
      // 算价格
      
    }else{
      curItem.count --; 
      finalPrice = curItem.count * curItem.price;
    }
    // 除了当前选择项的，其它项目的价格
    program.map(stage => {
      stage.activityGroupVOS.map(group => {
        group.activityGoodVOS.map(item => {
          if(item.goodId != curItem.goodId){
            finalPrice = finalPrice + item.count * item.price;
          }
        })
      })
    })
    console.log(program);
    this.setData({program,finalPrice});
  },
  submit(){
    let { finalPrice,program} = this.data; 
    let flag = false;
    let finalStage = JSON.parse(JSON.stringify(program));
    finalStage.map((stage)=>{
      stage.activityGroupVOS && stage.activityGroupVOS.map((group,key)=>{
        let isEmpty = true;
        group.activityGoodVOS && group.activityGoodVOS.map((item,index)=>{
          if (item.count > 0){
            isEmpty = false;
            flag = true;
          }else{
            group.activityGoodVOS[index] = null;
          }
        })
        if(isEmpty){
          stage.activityGroupVOS[key] = null;
        }
        group.activityGoodVOS = group.activityGoodVOS.filter(o=>o);
      })
      stage.activityGroupVOS = stage.activityGroupVOS.filter(o=>o);
    })
    finalStage = finalStage.filter(o => o.activityGroupVOS.length != 0);
    console.log(finalStage);
    if(flag){
      wx.setStorageSync('finalStage', finalStage);
      wx.navigateTo({
        url: `/event/apply-event/apply-event?finalPrice=${finalPrice}`,
      })
      //  this.activityCheck(finalStage,finalPrice); 
    }else{
      wx.showToast({
        title: '请选择项目',
        icon:'none'
      })
    }     
  },
  activityCheck(finalStage,finalPrice){
    const {program} = this.data;
    let checkData = [];
    finalStage.map(stage=>{
      stage.activityGroupVOS.map(group=>{
        group.activityGoodVOS.map(item=>{
          let obj = {
            goodId:item.goodId,
            goodName:item.goodName,
            number:item.count
          }
          checkData.push(obj);
        })
      })
    });
    fetch({
      url: `${urls._verify}/activityBuyCheck/buy?state=add`,
      method:'PUT',
      data: checkData,
      json:true,
      success:body=>{
        if(body.checkResult){
          wx.setStorageSync('checkData', checkData);
          wx.setStorageSync('finalStage', finalStage);
          wx.navigateTo({
            url: `/event/apply-event/apply-event?finalPrice=${finalPrice}`,
          })
        }else{
          wx.showToast({
            icon:'none',
            title: '库存不足',
          })
          this.getEventProgram(body.activityCheckInfos);
        } 
      }
    })
  }
})