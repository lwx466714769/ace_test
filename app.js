import urls from 'utils/urls.js';
import constv from 'const.js';
import {
  fetch,
  checkUserState
} from 'utils/utils.js';

App({
  onLaunch: function({
    scene,
    path,
    query
  }) {
    
    //禁止分享
    wx.hideShareMenu();
    const jwt = wx.getStorageSync('token');
    if (jwt) {
      this.checkJwt(jwt);
    } else {
      wx.clearStorageSync();
    }
    wx.setStorageSync('cid', constv.cid);
    // wx.setStorageSync('cid', 13);
    wx.getSystemInfo({
      success: (res) => {
        this.globalData.height = res.statusBarHeight;
        this.globalData.winHeight = res.windowHeight;
      }
    })
    this.updateApp();
    this.checkIsIPhoneX;
  },
  globalData: {
    isIpX: false,
    height: 20,
    winHeight: 600
  },
  onShow: function({
    scene,
    path,
    query,
    referrerInfo
  }) {
    wx.setStorageSync('shareInfo', {
      scene,
      path,
      referrerInfo,
      ...query
    });
    if (referrerInfo) {
      this.backData = referrerInfo;
    }
  },
  //下载新版本
  updateApp: function () {
    const updateManager = wx.getUpdateManager()
    updateManager.onCheckForUpdate(function (res) {
      // 请求完新版本信息的回调
    })
    updateManager.onUpdateReady(function () {
      wx.showModal({
        title: '更新提示',
        content: '新版本已经准备好，是否重启应用？',
        success: function (res) {
          if (res.confirm) {
            // 新的版本已经下载好，调用 applyUpdate 应用新版本并重启
            updateManager.applyUpdate()
          }
        },
        false: function (e) {
          console.log(e)
        }
      })

    })

    updateManager.onUpdateFailed(function () {
      // 新的版本下载失败
      wx.showModal({
        title: '更新提示',
        content: '新版本下载失败',
        showCancel: false
      })
    })
  },
  //检查jwt合法性
  checkJwt(jwt) {
    wx.request({
      url: `${urls._jwt}`,
      header: this.mixinToken(),
      success: res => {
        if (!res.data.body) {
          wx.clearStorageSync();
          wx.setStorageSync('cid', constv.cid);
        }
      },
      fail: res => {
        wx.clearStorageSync();
        wx.setStorageSync('cid', constv.cid);
      }
    })
  },
  // 为request混入token
  mixinToken(obj) {
    // const token = wx.getStorageSync('token')
    // const header = obj || {}
    // const Authorization = {
    //   'Authorization': `Bearer ${token}`
    // }
    // return { ...header,
    //   ...Authorization
    // }
    let token = wx.getStorageSync('token');
    let Authorization;
    if (token) {
      Authorization = { 'Authorization': `Bearer ${token}` }
    } else {
      token = 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOiIwIiwicm9sZSI6InVzZXIiLCJpc3MiOiIwIiwiZXhwIjo0MDcwODgwMDAwLCJwbGF0Zm9ybSI6IkFQUCJ9.5cFpjbDPW1eNWkaiY9DEWlB-JnfhlrK-zq7oYdQPWbU'
      Authorization = { 'Authorization': `Bearer ${token}` }
    }
    const header = obj || {};
    return { ...header, ...Authorization };
  },
  login: login,
  backData: null, // 返回此小程序时传递的referrerInfo
  postman: null, // 小程序内部父子页面传递的临时信息
  data: {
    userkey: constv.user_key
  }
});


function checkIsIPhoneX() {
  const self = this
  wx.getSystemInfo({
    success: function(res) {
      if (res.model.search('iPhone X') != -1) {
        self.globalData.isIPX = true
      };
    }
  })
}

// 登录
function login() {
  console.log("app login")
  return new Promise((resolve, reject) => {
    wx.login({
      success(response) {
        let code = response.code;
        if (code) {
          // 调用获取用户信息接口 
          wx.getUserInfo({
            success(res) {
              wx.showLoading({
                title: '正在登录',
                mask: true
              })
              let data = {
                encryptedData: res.encryptedData,
                iv: res.iv,
                code: code,
                "type": constv.app_type
              }

              // console.log('成功', data)

              wx.request({
                url: urls.login,
                header: {
                  "content-type": "application/x-www-form-urlencoded"
                },
                method: "POST",
                data: data,
                success(result) {
                  console.log(result);
                  wx.hideLoading()
                  if (result.data.code == 0){
                      const { userInfo, jwt, wechatAuth, userPhone, ...others } = result.data.body;
                      //  if (jwt) {
                      // const user = {
                      //     ...userInfo,
                      //     ...others
                      // }
                      // wx.setStorageSync('user', user)
                      // wx.setStorageSync('token', jwt)
                      // resolve({
                      //     code: 0,
                      //     data: result.data.body
                      // });

                      // }else {
                      // reject({ code:0, data: result.data.body });
                      // }
                      if (userPhone && userPhone.phone) {
                          wx.showToast({
                              title: '登录成功'
                          })
                          const user = { ...userInfo, ...others, userPhone }
                          wx.setStorageSync('user', user)
                          wx.setStorageSync('token', jwt)
                          resolve({ code: 0 ,data: result.data.body});
                          checkUserState();
                      } else {
                          reject({ code: 3, data: result.data.body })
                      }

                  } else {
                      wx.showToast({
                          title:'网络错误,请重试',
                          icon:'none'
                      })
                  }

                },
                fail() {
                  wx.hideLoading()
                  reject({
                    code: 1
                  })
                  wx.showToast({
                    title: '获取信息失败',
                    icon: 'none'
                  })
                }
              })
            },
            fail() {
              wx.hideLoading()
              reject({
                code: 2
              })
            }
          })
        } else {
          console.log('获取用户登录态失败！' + response.errMsg)
        }
      }
    })
  })
}