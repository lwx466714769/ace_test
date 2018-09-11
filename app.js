import url from 'utils/urls.js';

App({
  onLaunch: function () {
    // 登录
    
  },
  globalData: {
    userInfo: null
  },
  login:login
})

function login(){
  return new Promise((resolve,reject)=>{
    wx.login({
      success: response => {
        console.log(response);
        let code = response.code;
        if (code) {
          wx.getUserInfo({
            success(res) {
              console.log(res);
              wx.setStorageSync('rawData', res.rawData);
              // wx.request({
              //   url: url.login,
              //   header:{
              //     "content-type":"application/x-www-form-urlencoded"
              //   },
              //   method:'POST',
              //   data:{
              //     encryptedData:res.encryptedData,
              //     iv:res.iv,
              //     code:code
              //   },
              //   success(result){
              //     const {userInfo,jwt,wechatAuth,...others} = result.data.body;
              //     if (jwt) {
              //       const user = { ...userInfo, ...others }
              //       wx.setStorageSync('user', user)
              //       wx.setStorageSync('token', jwt)
              //       //resolve({ code: 0 })
              //     } else {
              //       //reject({ code: 3, data: result.data.body })
              //     }

              //   },
              //   fail(){
              //     //reject({code:1})
              //     wx.showToast({
              //       title: '获取信息失败',
              //       icon:'none'
              //     })
              //   }
              // })
            }
          })
        } else {
          wx.showToast({
            title: '获取用户登录状态失败' + response.errMsg,
            icon: 'none'
          })
        }
        // 发送 res.code 到后台换取 openId, sessionKey, unionId
      }
    })
  })
}