import urls from '../../utils/urls.js';
import { uploadImages, fetch} from '../../utils/utils.js';
const app = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    miniImg: '/images/default.png',
    bottomState: 0,//0: 申请  1: 提交 2: 审核中 3: 拒绝
    bottomLabel:["申请","提交","审核中","重新提交审核"],
    signItems:[],
    showForm:false
  },
  onLoad: function (options) {
    const user = wx.getStorageSync('user');
    const { userId } = user;
    // const verified = user.userPhone.verified;
    this.setData({ userId }, this.initPage);
    this.setData({user: user});
    let windowHeight = wx.getSystemInfoSync().windowHeight // 屏幕的高度
    let windowWidth = wx.getSystemInfoSync().windowWidth // 屏幕的宽度
    this.setData({
      height: windowHeight * 750 / windowWidth - (48) - 40
    })
  },
  initPage() {
    this.getSeniorCard();
    
  },
  onShow() {
    // const { avatar, nickname } = wx.getStorageSync('user');
    // this.setData({ avatar, nickname });
    // this.userhascar();
  },
  getSeniorCard() {
    const clubId = wx.getStorageSync('cid');
    fetch({
      url: `${urls._seniorMember}/1/${clubId}`,
      loading: false,
      success: body => {
        const  seniorCards  = body;
        if(seniorCards){
          this.setData({ seniorCard: seniorCards[0] });
          const json = JSON.parse(seniorCards[0].verifyMessage)
          this.setData({signItems: json});
          this.setData({ advantages: seniorCards[0].synopsis.split("\n")})
          this.getSeniorApplyInfo();
        }else{
          //没有卡
        }
      },
      fail: body => {
        wx.showToast({
          title: body.message || '获取高级卡信息失败',
        })
      }
    })
  },
  getSeniorApplyInfo() {
    const clubId = wx.getStorageSync('cid');
    fetch({
      url: `${urls._seniorMember}/applicationMember/1/${clubId}`,
      loading: false,
      success: body => {
        if(body[0]){
          this.setData({applyInfo: body[body.length-1]})
          const { result } = this.data.applyInfo;
          if(result == 1){//审核中
            this.setData({bottomState:2})
          }else if(result == 2){//拒绝
            this.parseLastApplyIntoSign()
            this.setData({bottomState:3})
          }else if(result == 3){//通过
            this.getUserSeniorInfo();
          }
        }else{

        }
        this.setData({loadApplyInfo: true})
        // this.setData({ applyInfo : body });
        // if(body){//有审核信息
        //   const {result} = body;
        //   if(result == 1){//审核中
        //     this.setData({bottomState:2})
        //   }else if(result == 2){//拒绝
        //     this.setData({bottomState:3})
        //   }else if(result == 3){//通过
        //     this.getUserSeniorInfo();
        //   }
        // }else{//没提交过申请

        // }
       
      },
      fail: body => {
        wx.showToast({
          title: body.message || '获取申请信息失败',
        })
      }
    })
  },
  parseLastApplyIntoSign(){
    var n
    for(n in this.data.signItems){
      console.log(this.data.signItems[n]["name"])
      let name = this.data.signItems[n]["name"]
      let json = JSON.parse(this.data.applyInfo.verifyMessage)
      var m
      for (m in json){
        if(json[m]["name"]==name){
          console.log(json[m]["value"])
          this.data.signItems[n]["value"] = json[m]["value"]
          this.setData({ ['data.' + name]: json[m]["value"]})
        } 
      }
      
    }
    this.setData({signItems: this.data.signItems})
  },
  getUserSeniorInfo(){
    const clubId = wx.getStorageSync('cid');
    fetch({
      url: `${urls._seniorMember}/card/1/${clubId}`,
      loading: false,
      success: body => {
        this.setData({ userCard: body });
        const{qrCode, cardNumber} = body;
      },
      fail: body => {
        wx.showToast({
          title: body.message || '获取用户高级卡失败',
        })
      }
    })
  },
  getInput: function (e) {
    var name = e.currentTarget.dataset.name;
    var value = e.detail.value
    this.setData({
      ['data.' + name]: value
    });
  },
  uploadImg(e) {
    const {
      name
    } = e.currentTarget.dataset;
    let _this = this;
    wx.chooseImage({
      count: 1,
      success: function ({
        tempFilePaths
      }) {
        const tempImages = tempFilePaths[0];
        // _this.setData({cardImg:tempImages});
        uploadImages(tempFilePaths, function () { }, function ({
          itemUrl
        }) {
          _this.setData({
            ['data.' + name]: itemUrl
          });
        })
      },
    })
  },
  submitForm(){
    if (this.data.bottomState == 0 || this.data.bottomState == 3){
      this.setData({bottomState : 1, showForm: true})
    }else if(this.data.bottomState == 1){
      let _this = this;
      let checkThrough = true
      this.setData({signItems:this.data.signItems.map(obj => {
        obj.value = this.data.data[obj.name]
        if(!obj.value)checkThrough = false
        return obj
      })})
      //check legal
      if(!checkThrough){
        wx.showToast({
          title: '请填写完整信息',
        })
        return
      }
      wx.showLoading({
        title: '正在上传信息',
      })
      let msgStr = JSON.stringify(this.data.signItems);
      console.log(msgStr)
      let data = {
        "relationId": this.data.seniorCard.relationId,
        "seniorMemberId": this.data.seniorCard.id,
        "type": 1,
        // "verifyMessage": "用户添加"
        "verifyMessage": msgStr,
        "userInfo": this.data.user.nickname,
      }
      const {
        mixinToken
      } = getApp();
      wx.request({
        url: `${urls._seniorMember}/applicationMember`,
        header: mixinToken({
          "content-type": "application/json"
        }),
        method: "POST",
        data: data,
        success(result) {
          console.log(result);
          wx.hideLoading()
          if (result.data.code == 0) {
            wx.showToast({
              title: '已提交审核',
            })
            wx.redirectTo({
              url: '/personal/personal-advancecard/personal-advancecard',
            })
            // _this.setData({bottomState:2,showForm:false})
          } else {
            wx.showToast({
              title: '网络错误,请重试',
              icon: 'none'
            })
          }
        },
        fail() {
          wx.hideLoading()
          wx.showToast({
            title: '上传失败',
            icon: 'none'
          })
        }
      })
    }else{

    }
  }
})