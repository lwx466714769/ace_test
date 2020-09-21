// event/apply-event/apply-event.js
import urls from '../../utils/urls.js';
import { fetch,toPayDLB} from '../../utils/utils.js'
import constv from '../../const.js';
Page({

  /**
   * 页面的初始数据
   */
  data: {
    members:[],
    orderId:null,
    memberName:[]
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (ops) {
    const finalStage = wx.getStorageSync('finalStage');
    const event = wx.getStorageSync('event');
    this.setData({ finalStage,event,finalPrice:ops.finalPrice })
  },
  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    
  },
  onUnload(){
    // const checkData = wx.getStorageSync('checkData');
    // fetch({
    //   url: `${urls._verify}/activityBuyCheck/buy?state=reduce`,
    //   method: 'PUT',
    //   data: checkData,
    //   json: true,
    //   success: body => {
    //     wx.removeStorageSync('checkData');
    //     wx.removeStorageSync('finalStage');
    //     // let pages = getCurrentPages();
    //     // console.log(pages);
    //     // let prePages = pages[pages.length - 1];
    //     // prePages.setData({ isUpdate: true })
    //   }
    // })
  },
  addMember(e){
    const {item,type,index} = e.currentTarget.dataset;
    const { signupItems} = this.data.event;
    let updateMember = item || signupItems;
    wx.setStorageSync('updateMember', updateMember);
    wx.navigateTo({
      url: `/event/event-join/event-join?changeType=${type}&index=${index}`,
    })
    this.setData({memberError:false});
  },
  submit(){
    const {finalPrice,event,orderId,members} = this.data;
    if (event.signupItems && event.signupItems.length > 0&&members.length==0){
      this.setData({memberError:true});
      wx.showToast({
        title: '请填写报名信息',
        icon:'none'
      })
      return;
    }
    if(orderId){
      if(finalPrice == 0){
        this.payed(orderId);
      }else{
        this.toPay(orderId);
      }
    }else{
      this.activityCheck();
    }
  },
  createOrder(){
    const { members, finalPrice, event,finalStage} = this.data;
    const {clubInfo} = event;
    let signupItems =  [];
    console.log(members);
    members.map(o=>{
      signupItems = [...signupItems,...o]
    })
    console.log(signupItems);
    let items =[];
    finalStage.map(o => {
      o.activityGroupVOS && o.activityGroupVOS.map(x => {
        x.activityGoodVOS && x.activityGoodVOS.map(item => {
          if (item.count>0) {
            let { goodId, goodName, price, count } = item
            items.push({ itemId: goodId, itemTitle: goodName, itemAmount: price, itemCount:count })
          }
        })
      })
    })
    const user = wx.getStorageSync('user');
    let info = { 
        clubName: event.clubInfo.clubName,
        clubLogo: event.clubInfo.clubLogo,
        clubId: event.clubInfo.clubId,
        coverImg:event.coverImg.url,
        startTime:event.startTime,
        endTime:event.endTime,
        avatar: user.avatar,
        nickname: user.nickname,
        phone: user.userPhone.phone,
        userId: user.userId,
      };
    let data = {
      discountCode: '',
      // signItems,
      verifyMessages: signupItems,
      items,
      orderAmount:finalPrice,
      productId:event.activityId,
      productName: event.activityName,
      productType:1,
      verify:event.payAudit,
      info:JSON.stringify(info),
      clubId: event.clubInfo.clubId
    }
    console.log(data);
    let url = urls.order;
    let success = body =>{
      let orderId = body.orderId
      this.setData({orderId})
      if(finalPrice == 0){
        this.payed(orderId)
      }else{
        this.toPay(orderId);
      }
    }
    fetch({url,method:'POST',data,success,loading:'生成中...',json:true})
  },
  payed(orderId){
    fetch({
      url:`${urls.order}/pay/${orderId}`,
      method:'POST',
      loading:'加载中...',
      success:body =>{
        wx.redirectTo({
          url: `/event/event-result/event-result?orderId=${orderId}`,
        })
      },
      fail:body=>{
        wx.redirectTo({
          url: `/event/event-result/event-result?orderId=${orderId}`,
        })
      }
    })
  },
  toPay(orderId) {
    toPayDLB(orderId).then(() => {
      this.payed(orderId);
    })
  },
  activityCheck() {
    const { finalStage,event,members} = this.data;
    let signTemp =[];
    let signTemplateInfos=[];
    members.map(o=>{
      signTemp = [...signTemp,...o]
    })
    signTemp.map(item=>{
        let obj = {
          name: item.name,
          type: item.type,
          answer: item.value,
        }
        signTemplateInfos.push(obj);
      })

    let checkData = [];
    finalStage.map(stage => {
      stage.activityGroupVOS.map(group => {
        group.activityGoodVOS.map(item => {
          let obj = {
            goodId: item.goodId,
            goodName: item.goodName,
            number: item.count,
          }
          checkData.push(obj);
        })
      })
    });
    fetch({
      url: `${urls._verify}/activityBuyCheck/buy?state=add&activityId=${event.activityId}`,
      method: 'PUT',
      data:{
        activityBuyCheckDTOS:checkData,
        signTemplateInfos
      } ,
      json: true,
      success: body => {
        if (body.checkResult) {
          this.createOrder();
        } else {
          wx.showToast({
            icon: 'none',
            title: '库存不足',
          })
        }
      }
    })
  }
})