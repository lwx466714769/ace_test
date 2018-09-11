import sha1 from './sha1.js'
import urls from './urls.js'

function fetch(config) {
  const { mixinToken } = getApp()
  const defaultParam = {
    url: "",
    method: "GET",
    data: null,
    json: false,                  // 是否设置 contentType:'application/json'
    loading: "",                  // 是否显示并设置加载提示
    hideLoading: true,            // 是否自动关闭加载提示
    success: null,
    fail: null,
    complete: null
  }

  const param = { ...defaultParam, ...config }
  const { url, method, data, json, loading, success, fail, complete, hideLoading } = param
  const contentType = json ? 'application/json' : 'application/x-www-form-urlencoded'

  if (loading) {
    wx.showLoading({
      title: loading,
      mask: true
    })
  }

  return new Promise((resolve, reject) => {
    wx.request({
      url, method, data,
      header: mixinToken({
        "content-type": contentType
      }),

      success(res) {
        let data = res.data
        hideLoading && wx.hideLoading()
        if (typeof data === 'string') {
          console.log('------- data is string, parse to string ------')
          data = JSON.parse(data.replace(/\n/g, ''))
        }
        if (0 === data.code) {
          console.log('body-->', data.body)
          resolve(data.body)
          !!success && success(data.body)
        } else {
          console.log('data-->', data)
          reject(data.body)
          if (fail) {
            fail(data)
          } else {
            wx.showToast({
              title: data.message || 'opps...网络不畅哦...再试一下吧',
              icon: 'none',
            })
          }
        }
      },
      fail(e) {
        hideLoading && wx.hideLoading()
        reject()
        console.log('error: ', e);
        wx.showToast({
          title: 'opps...网络不畅哦...再试一下吧',
          icon: 'none'
        })
      },
      complete(data) {
        !!complete && complete(data)
      }

    })
  })

}


// 上传图片
function uploadImages(filePath, cb1, cb2) {
  const urlList = []
  let flag = true
  if ("string" === typeof filePath) {
    filePath = [filePath]
  }
  const promiseList = filePath.map(item => getToken(item, urlList, cb2))
  Promise.all(promiseList).then(() => {
    !!cb1 && cb1(urlList)
  })
}
// 获取token
function getToken(filePath, urlList, cb) {
  let timestamp = parseInt((new Date().valueOf()));
  let key = sha1.sha1("" + timestamp);
  console.log('key-->' ,key)
  return new Promise((resolve, reject) => {
    wx.request({
      url: `${urls.qiniuUpload}/${key}`,
      header: {
        "content-type": "application/json"
      },
      method: "POST",
      data: {},
      // 上传
      success(result) {
        const { token, url } = result.data.body
        wx.uploadFile({
          url: urls.qiniu,
          filePath: filePath,
          name: 'file',
          formData: { token, key },
          success(res) {
            const itemUrl = `${url}/w700_1`
            urlList.push(itemUrl)
            resolve({ itemUrl, filePath })
          },
          fail(res) {
            reject()
            console.warn('上传图片失败', res);
          }
        })
      },
      fail(e) {
        reject({ filePath })
        console.warn(e);
      },
    })
  }).then(cb)
}

// input + imageObjList => contentparts
function toContentParts(input, images) {
  let data = []
  data.push({
    pos: 1,
    content: input,
    type: "TEXT",
  })
  if (images) {
    for (let i = 0, len = images.length; i < len; i++) {
      data.push({
        pos: i + 2,
        content: images[i]['src'],
        type: "IMAGE",
      })
    }
  }
  return data
}

// contentparts => input + images
function analyzeContentParts(cp) {
  let input = ''
  let images = []
  for (let i = 0, len = cp.length; i < len; i++) {
    if (i === 0) {
      input = getTextFromHTML(cp[i].content)
    } else {
      images.push(getTextFromHTML(cp[i].content))
    }
  }
  return { input, images }
}

// 时间戳 --> 多久之前
function formatMsgTime(timestamp) {
  var dateTime = new Date(timestamp);
  var year = dateTime.getFullYear();
  var month = dateTime.getMonth() + 1;
  var day = dateTime.getDate();
  var hour = dateTime.getHours();
  var minute = dateTime.getMinutes();
  var second = dateTime.getSeconds();
  var now = new Date();
  var now_new = Date.now()

  var milliseconds = 0;
  var timestampStr;

  milliseconds = now_new - timestamp;

  if (milliseconds <= 1000 * 60 * 1) {
    timestampStr = '刚刚';
  } else if (1000 * 60 * 1 < milliseconds && milliseconds <= 1000 * 60 * 60) {
    timestampStr = Math.round((milliseconds / (1000 * 60))) + '分钟前';
  } else if (1000 * 60 * 60 * 1 < milliseconds && milliseconds <= 1000 * 60 * 60 * 24) {
    timestampStr = Math.round(milliseconds / (1000 * 60 * 60)) + '小时前';
  } else if (1000 * 60 * 60 * 24 < milliseconds && milliseconds <= 1000 * 60 * 60 * 24 * 15) {
    timestampStr = Math.round(milliseconds / (1000 * 60 * 60 * 24)) + '天前';
  } else if (milliseconds > 1000 * 60 * 60 * 24 * 15 && year == now.getFullYear()) {
    timestampStr = month + '-' + day + ' ' + hour + ':' + minute;
  } else {
    timestampStr = year + '-' + month + '-' + day + ' ' + hour + ':' + minute;
  }
  return timestampStr;
}

function getTextFromHTML(str) {
  if (!str) { return '' }
  return str.replace(/<\/?[^>]*>/g, '')      // 取出tags
    .replace(/[ | ]*\n/g, '\n')     // 去除行尾空白
    .replace(/&nbsp;/ig, '')        // 去掉&nbsp;
    .replace(/\s/g, '');            // 将空格去掉
}

// 防抖
function debounce(fn, delay) {
  var last = null
  var __this = this
  var args = arguments
  return function () {
    clearTimeout(last)
    last = setTimeout(function () {
      fn.apply(__this, args)
    }, delay)
  }
}

// 新用户绑定手机号才能登录成功: 绑定手机号，提供给Login组件使用
function bindPhone(e) {
  let { phone, code } = e.detail
  let { nickname, avatar } = this.data.registeData.userInfo
  let url = urls._register
  let method = 'POST'
  let data = {
    phone, code, nickname, avatar,
    source: 0,
    ...this.data.registeData.wechatAuth
  }
  let success = body => {
    const { userInfo, jwt, wechatAuth, ...others } = body
    const user = { ...userInfo, ...others }
    wx.setStorageSync('user', user)
    wx.setStorageSync('token', jwt)
    this.setData({ authorized: true })
  }
  let fail = ({ code }) => {
    let errMap = {
      "1019": "昵称已存在",
      "1004": "手机号存在冲突",
      "1061": "验证码错误"
    }
    wx.showToast({
      title: errMap[code + ''],
      icon: 'none'
    })
  }
  return fetch({ url, method, data, success, fail, loading: '请稍后...' })
}


module.exports = {
  fetch,
  getToken,
  uploadImages,
  toContentParts,
  analyzeContentParts,
  formatMsgTime,
  getTextFromHTML,
  debounce,
  bindPhone,
}