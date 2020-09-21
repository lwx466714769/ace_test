// pages/bind-phone/bind-phone.js
import { fetch,toLogin,login,checkUserState} from '../../utils/utils.js'
import urls from '../../utils/urls.js'
import constv from '../../const.js'
Page({
  /**
   * 页面的初始数据
   */
  data: {
    showLogin: false,
    bindPhone: false
  },
  onLoad(ops){
    console.log(ops);
    if(ops.eventId){
      this.setData({eventId:ops.eventId});
    }
    if (ops.bind) {
      this.setData({ bindPhone: true })
    }
    let regData = wx.getStorageSync('tempRegData');
    console.log(regData);
    this.setData({regData});
  },
  getPhoneNumber(e){
    console.log(e);
    let regData = wx.getStorageSync('tempRegData');
    console.log(regData);
    if (e.detail.errMsg == 'getPhoneNumber:fail user deny') {
      wx.showToast({
        title: '您拒绝了授权',
        icon: 'none'
      })
    } else {//用户同意授权手机号
      if (this.data.bindPhone == true) {
        this.bindPhone(e);
      } else {
        this.register(e);
      }
      // if(regData.regist){
      //   //注册新账号
      //   this.register(e);
      // }else{
      //   //绑定流程
      //   wx.setStorageSync('token', regData.jwt);
      //   this.bind(e);
      // }
    }
    
  },
  register(e){
    console.log(e);
    const {eventId} = this.data;
    wx.login({
      success:res=>{
        let code = res.code;
        let regData = wx.getStorageSync('tempRegData');
        const url = `${urls.wxPhoneRegister}`;
        const data = {
          nickname: regData.userInfo.nickname,
          avatar: regData.userInfo.avatar,
          unionId: regData.wechatAuth.unionId,
          openId: regData.wechatAuth.openId,
          type: regData.wechatAuth.type,
          encrypted: e.detail.encryptedData,
          iv: e.detail.iv,
          code:code
        }
        console.log(data);
        let success = body => {
          console.log(body);
          const { userInfo, jwt, wechatAuth, ...others } = body;
          const user = { ...userInfo, ...others };
          wx.setStorageSync('user', user);
          wx.setStorageSync('token', jwt);
          wx.setStorageSync('userUpdate', 'on');
          wx.removeStorageSync('tempRegData');
          //wx.navigateBack();

          if(eventId){
            let pages = getCurrentPages();
            let prePages = pages[pages.length - 2];
            prePages.setData({ joinClubState: true })
            wx.navigateBack();
            // wx.redirectTo({
            //   url: `/event/event-detail/event-detail?eventId=${eventId}`,
            // })
          }else{//注册成功
            checkUserState()
            wx.showToast({
              title: '注册成功',
              icon: 'none'
            })
            wx.navigateBack();
            // wx.reLaunch({
            //   url: '/about/interest/interest',
            // })
          } 
        }
        let fail = body => {
          console.log(body);
          if (body.code == 1172) {
            this.changeAuth(body.body);
          } else if (body.code == 1005) {
            wx.showToast({
              title: '当前人数较多,请稍后再试',
              icon: 'none'
            })
          } else {
            let errMap = new Map([
              [1001, '安全错误'],
              [1016, '手机号已被使用'],
              [1004, '绑定失败']
            ])
            wx.showToast({
              title: errMap.get(body.code),
              icon: 'none'
            })
          }
        }
        fetch({ url: url, data, method: 'POST', success, fail, loading: '请稍后...' });
      }
    })
    
  },
  bindPhone(e) {
    console.log(e);
    const { eventId } = this.data;
    wx.login({
      success: res => {
        let code = res.code;
        let regData = wx.getStorageSync('tempRegData');
        const url = `${urls.wxBindPhone}`;
        const data = {
          type: constv.app_type,
          encrypted: e.detail.encryptedData,
          iv: e.detail.iv,
          code: code
        }
        let success = body => {
          wx.removeStorageSync('tempRegData');
          toLogin().then(() => {
            if (eventId) {
              let pages = getCurrentPages();
              let prePages = pages[pages.length - 2];
              prePages.setData({ joinClubState: true })
              wx.navigateBack();
              // wx.redirectTo({
              //   url: `/event/event-detail/event-detail?eventId=${eventId}`,
              // })
            } else {//注册成功
              checkUserState()
              wx.showToast({
                title: '注册成功',
                icon: 'none'
              })
              wx.navigateBack();
              // wx.reLaunch({
              //   url: '/about/interest/interest',
              // })
            }
          })
        }
        let fail = body => {
          console.log('fail' + JSON.stringify(body));
          if (body.code == 1172) {
            this.changeAuth(body.body);
          } else if (body.code == 1005) {
            wx.showToast({
              title: '当前人数较多,请稍后再试',
              icon: 'none'
            })
          } else if (body.code == 2026 || 999) {
            wx.showToast({
              title: '网络错误,请重试',
              icon: 'none'
            })
            setTimeout(() => {
              wx.reLaunch({
                url: '/'
              })
            }, 2000)
          } else {
            let errMap = new Map([
              [1001, '安全错误'],
              [1016, '手机号已被使用'],
              [1004, '绑定失败'],
              [2029, '手机号已绑定']
            ])
            wx.showToast({
              title: errMap.get(body.code),
              icon: 'none'
            })
          }
        }
        fetch({ url: url, data, method: 'POST', success, fail, loading: '请稍后...' });
      }
    })

  },
  changeAuth(phone){
    let regData = wx.getStorageSync('tempRegData');
    let data = {
      ...regData.wechatAuth,
      phone
    }
    fetch({
      url: `${urls._auth}/wxBind`,
      method:'POST',
      data:data,
      success:body=>{
        const { userInfo, jwt, wechatAuth, userPhone, ...others } = body;
        const user = { ...userInfo, ...others, userPhone };
        wx.setStorageSync('user', user);
        wx.setStorageSync('token', jwt);
        checkUserState;
        wx.navigateBack();
        // wx.reLaunch({
        //   url: '/about/interest/interest',
        // })
      }
    })
  },
  bind(e){
    console.log(e);
    const {eventId} = this.data;
    let regData = wx.getStorageSync('tempRegData');
    wx.login({
      success:res=>{
        let code = res.code;
        fetch({
          url:`${urls._phoneCheck}`,
          method:'POST',
          data: {
            encrypted: e.detail.encryptedData,
            iv: e.detail.iv,
            code:code,
            type:constv.app_type
          },
          loading:'加载中...',
          success:body =>{
            console.log(body);
            regData.userPhone = Object.assign(regData.userPhone,body);
            console.log(regData);
            const { userInfo, jwt, wechatAuth, ...others } = regData;
            const user = { ...userInfo, ...others };
            wx.setStorageSync('user', user);
            wx.setStorageSync('token', jwt);
            wx.setStorageSync('userUpdate', 'on');
            wx.removeStorageSync('tempRegData');
            //wx.navigateBack();
            if (eventId) {
              let pages = getCurrentPages();
              let prePages = pages[pages.length - 2];
              prePages.setData({ joinClubState: true })
              wx.navigateBack();
            } else {
              checkUserState
              wx.showToast({
                title: '绑定成功',
                icon: 'none'
              })
              wx.navigateBack();
              // wx.reLaunch({
              //   url: '/about/interest/interest',
              // })
            }
          },
          fail:body =>{
            console.log(body)
            if (body.code == 9003) {//手机号可以合并
              wx.showModal({
                title: '提示',
                content: '该手机已存在，是否要进行账号合并',
                success: res => {
                  if (res.confirm) {
                    this.mergeUser(body.body);
                  }
                }
              })
            } else if (body.code == 1005) {
              wx.showToast({
                title: '当前人数较多,请稍后再试',
                icon: 'none'
              })
            }else{
              let errMap = new Map([
                [1001, '安全错误'],
                [1016, '手机号已被使用'],
                [1004, '绑定失败']
              ])
              wx.showToast({
                title: errMap.get(body.code),
                icon: 'none'
              })
            }
          }
        })
      }
    })
    
    
  },
  // 合并手机号与微信
  mergeUser(ops){
    fetch({
      url:`${urls._user}/merge`,
      method: 'POST',
      data: { sourceUserId: ops.userId, secureToken: ops.secureToken },
      success: body => {
        this.setData({ showLogin: true });
      },
      fail: body => {
        wx.showToast({
          title: body.message,
          icon: 'none'
        })
      }
    })
  },
  login(e) {
    login(e,()=>{
      wx.navigateBack();
    })
  }
})