import sha1 from './sha1.js';
import urls from './urls.js';
import constv from '../const.js';

function fetch(config) {
  let done = false
  let timer = null

  const {
    mixinToken
  } = getApp();
  const defaultParam = {
    url: "",
    method: "GET",
    data: null,
    delay: 0, // 提示间隔
    json: false, // 是否设置 contentType:'application/json'
    loading: "", // 是否显示并设置加载提示  string => false
    hideLoading: true, // 是否自动关闭加载提示
    success: null,
    fail: null,
    complete: null
  }

  const param = {
    ...defaultParam,
    ...config
  }
  const {
    url,
    method,
    data,
    json,
    delay,
    loading,
    success,
    fail,
    complete,
    hideLoading
  } = param
  const contentType = json ? 'application/json' : 'application/x-www-form-urlencoded'

  if (loading) {
    timer = setTimeout(() => {
      if (!done) {
        wx.showLoading({
          title: loading,
          mask: false
        });
      }
    }, delay)
  }

  return new Promise((resolve, reject) => {
    wx.request({
      url,
      method,
      data,
      header: mixinToken({
        "content-type": contentType,
      }),

      success(res) {
        if (res.statusCode == 401) {
          wx.clearStorageSync();
          wx.setStorageSync('cid', constv.cid);
          wx.showToast({
            title: '用户身份已过期，请重新登录',
            icon: 'none',
            duration: 3000
          })
          setTimeout(() => {
            wx.reLaunch({
              url: '/pages/index/index',
            })
          },3000)
        }else{
          let data = res.data;
          hideLoading && wx.hideLoading()
          if (data) {
            if (typeof data === 'string') {
              console.log('------- data is string, parse to string ------')
              // data = JSON.parse(data.replace(/\n/g, ''));
            }
            if (0 === data.code) {
              console.log('body-->', data.body)
              resolve(data.body);
              !!success && success(data.body);
            } else {
              resolve(data.code);
              if (fail) {
                fail(data);
              } else {
                wx.showToast({
                  title: data.message || '数据获取失败',
                  icon: 'none',
                })
              }

            }
          } else {
            console.log('res.data.body-->', res.data);
            reject(res.data)
          }

        }
      },
      fail(e) {
        hideLoading && wx.hideLoading();
        reject();
        console.log('error: ', e);
        wx.showToast({
          title: '请检查网络',
          icon: 'none'
        })
      },
      complete() {
        done = true;
        timer = null;
        !!complete && complete();
      },
      
    })
  })

};

// 上传图片
function uploadImages(filePath, cb1, cb2) {
  const urlList = []
  if ("string" === typeof filePath) {
    filePath = [filePath];
  }
  wx.showLoading({
    title: '正在上传...',
    mask: true
  });
  const promiseList = filePath.map(item => getToken(item, urlList, cb2));
  Promise.all(promiseList).then(() => {
    wx.hideLoading();
    !!cb1 && cb1(urlList);
  }).catch(() => {
    wx.hideLoading();
    !!cb1 && cb1(urlList);
    wx.showToast({
      title: '上传失败，请重试',
      icon: 'none',
    })
  })

};
// 获取token
function getToken(filePath, urlList, cb) {
  const { mixinToken } = getApp()
  let timestamp = parseInt((new Date().valueOf()));
  let key = sha1.sha1("" + timestamp);
  console.log('key-->', key);
  return new Promise((resolve, reject) => {
    wx.request({
      url: `${urls.qiniuUpload}/${key}`,
      header: mixinToken({
        "content-type": "application/json"
      }),
      method: "POST",
      data: {},
      // 上传
      success(result) {
        if (!result.data.body) {
          reject({
          })
          return
        }
        const {
          token,
          url,
        } = result.data.body;
        wx.uploadFile({
          url: urls.qiniu,
          filePath: filePath,
          name: 'file',
          formData: {
            token,
            key
          },
          success(res) {
            const itemUrl = `${url}/w700_1`;
            urlList.push(itemUrl);
            resolve({
              itemUrl,
              filePath
            });
          },
          fail(res) {
            reject()
            console.warn('上传失败', res);
          }
        })
      },
      fail(e) {
        reject({
          filePath
        })
        console.warn(e);
      },
    })
  }).then(cb)
};

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
};
function toImages(images) {
  let data = []
  if (images) {
    for (let i = 0, len = images.length; i < len; i++) {
      data.push({
        url: images[i]['src'],
      })
    }
  }
  return data
}
function toVideos(url) {
  let data;
  if (url) {
    data = ({
      url: url
    })
  }
  return data
}
// 格式化帖子
function formatPosts(arr, simple = false) {
  const types = ['IMAGE', 'COVER']
  return arr.map(o => {
    let {
      contents,
      nickname,
      avatar
    } = o;
    let cover = '';
    contents = contents.map(item => {
      item.content = getTextFromHTML(item.content)
      item.extra = JSON.parse(item.extra)
      // 如果有cover或者image，第一个作为封面，否则若有视频，视频封面作为封面
      if (!cover && (types.indexOf(item.type) !== -1)) {
        cover = item.content
      } else if (!cover && item.type === 'VIDEO') {
        cover = item.extra.cover
      }
      return item
    })
    let title = contents.find(o => 'TEXT' === o.type || 'TITLE' === o.type);
    o.createAt = formatMsgTime(o.createAt);
    o.cover = cover
    if (simple) {
      let {
        postId,
        userId,
        createAt,
        cover,
        nickname,
        avatar
      } = o
      return {
        postId,
        userId,
        createAt,
        cover,
        title: title.content,
        nickname,
        avatar
      }
    } else {
      return o
    }
  })
};
// 格式化帖子--new Ace
function formatPostsAce(arr) {
  const types = ['IMAGE', 'COVER']
  return arr.map((o, index) => {
    let cover = '',
      images = [],
      title, summary;
    let {
      avatar,
      nickname,
      contents,
      postType
    } = o;
    contents = contents.map(item => {
      item.content = getTextFromHTML(item.content);
      if (!cover && (types.indexOf(item.type) !== -1)) {
        cover = item.content;
      } else if (!cover && item.type === 'VIDEO') {
        let _extra = item.extra;
        let extra = JSON.parse(_extra);
        cover = extra.cover;
        item.extra = cover;
      }
      if (item.type === 'IMAGE') {
        images.push(item.content)
      }
      return item;
    })
    title = contents.find(o => 'TEXT' === o.type || 'TITLE' === o.type || '');
    if (title) {
      title = title.content.replace(/\n/g, '');
    } else {
      title = '';
    }
    summary = contents.find(o => o.type === 'SUMMARY');
    o.images = images;
    o.title = title;
    o.summary = summary ? summary.content : '';
    o.cover = cover;
    o.createAt = formatMsgTime(o.createAt);
    //return { title,postType,cover,images,avatar,clubName,summary};
    return o;
  })
};
/*--格式化 卡片列表--*/
function formatCards(arr) {
  return arr.map(o => {
    let {
      cardList
    } = o;
    cardList.map(item => {
      let {
        introduction
      } = item;
      introduction = introduction.map(con => {
        con.content = getTextFromHTML(con.content);
        return con;
      })
      return item;
    })
    return o;
  })
};
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
  return {
    input,
    images
  }
};

// 时间戳 --> 时间2018-9-11日
function formatDate(ts, devide, comp = false) {
  if (!ts) return;
  var d = new Date(ts);
  let year = d.getFullYear();
  let month = d.getMonth() + 1;
  let day = d.getDate();
  var dformat = ''

  // 补0
  function fix(num) {
    return num < 10 ? '0' + num.toString() : num.toString()
  }

  if (devide) {
    dformat = [d.getFullYear(), d.getMonth() + 1, d.getDate()].join(devide)
  } else {
    dformat = year + '年' + month + '月' + day + '日'
  }
  if (comp) {
    dformat += (' ' + [d.getHours(), fix(d.getMinutes())].join(':'))
  }
  return dformat
};
function formatDateCN(ts, devide, comp = false, zero = false) {
  if (!ts) return;
  var d = new Date(ts);
  let year = d.getFullYear();
  let month = d.getMonth() + 1;
  let day = d.getDate();
  var dformat = ''

  // 补0
  function fix(num) {
    return num < 10 ? '0' + num.toString() : num.toString()
  }
  if (zero) {
    month = month < 10 ? '0' + month : month;
    day = day < 10 ? '0' + day : day;
  }
  if (devide) {
    dformat = [year, month, day].join(devide)
  } else {
    dformat = year + '年' + month + '月' + day + '日'
  }
  if (comp) {
    dformat += (' ' + [d.getHours(), fix(d.getMinutes())].join(':'))
  }
  return dformat
}
// 工具：获取月份
function getMonth(timestamp) {
  if (!timestamp) {
    return timestamp
  }
  let monthMap = ['一', '二', '三', '四', '五', '六', '七', '八', '九', '十', '十一', '十二']
  let date = new Date(timestamp)
  return monthMap[date.getMonth()] + '月'
};

// 获取星期
function getWeek(date) {
  var week = null
  if (typeof date === 'string' || typeof date === 'number') {
    date = new Date(date)
  } else {
    return date
  }
  var c = date.getDay()
  if (c == 0) week = "星期日"
  if (c == 1) week = "星期一"
  if (c == 2) week = "星期二"
  if (c == 3) week = "星期三"
  if (c == 4) week = "星期四"
  if (c == 5) week = "星期五"
  if (c == 6) week = "星期六"
  return week;
};

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
};

function getTextFromHTML(str) {
  if (!str) {
    return ''
  }
  return str
    // .replace(/<\/?[^>]*>/g, '')
    .replace(/[ | ]*\n/g, '\n')
    .replace(/\n/g, '')
    .replace(/<br>/g, '\n')
    .replace(/\<\/?[^\<\>]+\>/g, '')
    // .replace(/&nbsp;/ig, '')
    // .replace(/\s/g, '')
    .replace(/&lt;/g, '')
    .replace(/&gt;/g, '')
    .replace(/&amp;/g, '&')
    .replace(/style=\"\/?[^>]*\"/g, '');
};

// 深层合并对象
function deepMerge(obj1, obj2) {
  var key;
  for (key in obj2) {
    // 如果target(也就是obj1[key])存在，且是对象的话再去调用deepMerge
    // 否则就是obj1[key]里面没这个对象，需要与obj2[key]合并
    obj1[key] = obj1[key] && obj1[key].toString() === "[object Object]" ?
      deepMerge(obj1[key], obj2[key]) : obj1[key] = obj2[key];
  }
  return obj1;
};

// 新用户绑定手机号才能登录成功: 绑定手机号，提供给Login组件使用
function bindPhone(e) {
  let {
    phone,
    code
  } = e.detail
  let {
    nickname,
    avatar
  } = this.data.registeData.userInfo;

  let url = urls._register;
  let method = 'POST'
  let data = {
    phone,
    code,
    nickname,
    avatar,
    source: 0,
    ...this.data.registeData.wechatAuth
  }
  let success = body => {
    const {
      userInfo,
      jwt,
      wechatAuth,
      ...others
    } = body;
    const user = {
      ...userInfo,
      ...others
    };
    wx.setStorageSync('user', user);
    wx.setStorageSync('token', jwt);
    checkUserState();
    this.setData({
      authorized: true,
    })
  }
  let fail = ({
    code
  }) => {
    let errMap = new Map([
      [1019, '昵称已存在'],
      [1004, '手机号已存在'],
      [1061, '验证码错误']
    ]);
    wx.showToast({
      title: errMap.get(code),
      icon: 'none'
    });
  }
  return fetch({
    url,
    method,
    data,
    success,
    fail,
    loading: '请稍后...'
  })
};

function getPhone(e, cb) {
  return new Promise((resolve, reject) => {
    wx.login({
      success: res => {
        let code = res.code;
        console.log(code);
        if (code) {
          const url = `${urls._getPhone}`;
          let data = {
            encryptedData: e.detail.encryptedData,
            iv: e.detail.iv,
            code: code,
            miniAppId: constv.app_type
          }
          const success = body => {
            if (body) {
              resolve({
                code: 0,
                phone: body.phoneNumber
              });
            } else {
              reject({
                code: 2
              });
            }
            code = null;
          }
          const fail = body => {
            wx.showToast({
              title: '手机号获取失败'
            });
            return;
          }
          return fetch({
            url,
            method: 'POST',
            data,
            success,
            fail,
            loading: '请稍后...'
          })
        }
      }
    })
  })

};

function newBindPhone(tel, initData, cb) {
  let {
    nickname,
    avatar
  } = initData.userInfo;
  let url = urls._register;
  let method = 'POST'
  let data = {
    phone: tel,
    code: 'ACE@7*%3',
    nickname,
    avatar,
    source: 0,
    ...initData.wechatAuth,
  }
  let success = body => {
    const {
      userInfo,
      jwt,
      wechatAuth,
      ...others
    } = body
    const user = {
      ...userInfo,
      ...others
    }
    wx.setStorageSync('user', user)
    wx.setStorageSync('token', jwt)
    cb();
  }
  let fail = ({
    code
  }) => {
    let errMap = new Map([
      [1019, '昵称已存在'],
      [1004, '手机号存在冲突'],
      [1061, '验证码错误']
    ])
    wx.showToast({
      title: errMap.get(code),
      icon: 'none'
    })
  }
  return fetch({
    url,
    method,
    data,
    success,
    fail,
    loading: '请稍后...'
  })
};

// function toLogin() {
//   const {
//     userId,
//     userPhone
//   } = wx.getStorageSync('user');
//   return new Promise((resolve, reject) => {
//     if (userPhone) {
//       resolve();
//     } else {
//       getApp().login().then(res => {
//         let {
//           userPhone
//         } = res.data;
//         if (userPhone) {
//           checkUserState();
//           resolve();
//         } else {
//           this.setData({
//             registeData: res.data
//           });
//           console.log('login', res)
//           this.binder.show();
//         }
//       }, fail => {

//       }).catch(res => {
//         let { code, data } = res;
//         if (code === 3 && data) {
//           let { code, data } = res;
//           // this.setData({ registeData: data });
//           console.log(data);
//           wx.setStorageSync('tempRegData',data);
//             wx.navigateTo({
//               url: `/pages/bind-phone/bind-phone`,
//             })
//         }
//       })
//     }
//   }).catch((e) => {
//     console.log('catch', e)
//   })
// };
// 提示需要加入俱乐部
function needJoin(clubId, content) {
  wx.showModal({
    content: content || '查看该内容需加入俱乐部',
    success: res => {
      if (res.confirm) {
        wx.navigateTo({
          url: `/about/about/about?clubId=${clubId}`,
        })
      }
    }
  })
}
// 是否为俱乐部会员单独接口
function isClubMember(clubId) {
  wx.showLoading({
    title: '加载中...',
    mask: true
  })
  return new Promise((resolve, reject) => {
    const url = `${urls._club}/${clubId}/isClubMember`;
    const success = body => {
      wx.hideLoading();
      resolve(body);
    }
    const fail = () => {
      wx.showToast({
        title: '获取信息失败',
        icon: 'none'
      })
    }
    fetch({ url, success, fail })
  })
}
// 检测用户是否加入俱乐部
function checkUserState() {
  // const clubId = wx.getStorageSync('cid');
  // const {
  //   clubBases
  // } = wx.getStorageSync('user');

  // if (clubBases) {
  //   //验证是否成为俱乐部会员，否，加入
  //   let isMember = clubBases.some(o => o.clubId == clubId);
  //   isMember || joinClub();
  // } else {
  //   joinClub();
  // }
  
  const {
    userId
  } = wx.getStorageSync('user');
  if (userId) {
    const clubId = constv.cid;
    const url = `${urls._club}/${clubId}/isClubMember`;
    const success = body => {
      let isMember = body;
      if(!isMember){
        joinClub();
      }
    }
    fetch({
      url,
      method: 'GET',
      success
    })
  }

};

// 用户加入俱乐部
function joinClub() {
  // let content = "";
  // let signItems = [];
  // fetch({
  //   url: `${urls._clubs}/joinClub/${club.clubId}`,
  //   method: 'POST',
  //   data: { content, signItems },
  //   json: true,
  //   success: body => {
  //     this.setData({ joinClub: false });
  //     wx.navigateTo({
  //       url: `/about/join-result/join-result?clubId=${club.clubId}&joinVerify=false`,
  //     })
  //   }
  // })
  
  // const {
  //   userId
  // } = wx.getStorageSync('user');
  let content = ""
  let signItems = []
  let data = {content, signItems}
  const clubId = wx.getStorageSync('cid');
  const url = `${urls._clubs}/joinClub/${clubId}`;
  const success = body => {
    // 同步到clubBases
    // const itemClub = clubId;
    // console.log(itemClub)
    // const {
    //   clubBases,
    //   ...others
    // } = wx.getStorageSync('user');
    // console.log("get")
    // if(clubBases){
    //   const user = {
    //     clubBases: [itemClub, ...clubBases],
    //     ...others,
    //   }
    // }else{
    //   const user = {
    //     clubBases: [itemClub],
    //     ...others,
    //   }
    // }
    // const user = {
    //   clubBase : itemClub,

    // }
    // console.log(user)
    // wx.setStorageSync('user', user)
  }
  const fail = body => {
    
  }
  fetch({
    url,
    method: 'POST',
    success,
    fail,
    json: true,
    data
  })
};

function getUserInfo() {
  let _this = this;
  const user = wx.getStorageSync('user');
  const url = `${urls.user}/${user.userId}/info`;
  const data = {
    type: 7
  };
  return new Promise((resolve, reject) => {
    const success = body => {
      const {
        userInfo,
        notifyCount
      } = body;
      const {
        userId,
        nickname,
        avatar
      } = userInfo;
      _this.setData({
        userId,
        nickname,
        avatar,
        notifyCount
      })
      wx.setStorageSync('user', Object.assign(user, userInfo));
      resolve();
    };
    const fail = error => {
      console.log('获取用户信息', error)
    }
    fetch({
      url,
      data,
      success,
      fail
    });
  })
};

/*--动画效果--*/
function showAnimation(that, param, opacity) {
  let animation = wx.createAnimation({
    duration: 800, //持续时间800ms
    timingFunction: 'ease',
  });
  animation.opacity(opacity).step();
  let json = '{"' + param + '":""}';
  json = JSON.parse(json);
  json[param] = animation.export();
  that.setData(json); //设置动画
};

function slideUpAnimation(that, param, px, opacity) {
  var animation = wx.createAnimation({
    duration: 800,
    timingFunction: 'ease',
  });
  animation.translateY(px).opacity(opacity).step();
  var json = '{"' + param + '":""}'; //将param转换为key
  json = JSON.parse(json);
  json[param] = animation.export()
  that.setData(json);
};

function login(e, fn) {
  const {
    userId
  } = wx.getStorageSync('user');
  if (userId) { //已经登录
    !!fn && fn();
  } else { //未登录
    if (e.detail.errMsg == 'getUserInfo:fail auth deny') {
      wx.showToast({
        title: '您拒绝了授权',
        icon: 'none'
      })
    } else {
      toLogin().then(() => { //登录成功
        checkUserState();
        wx.setStorageSync('userUpdate', 'on');
        !!fn && fn();
      }).catch(res => {
        let { code, data } = res;
        if (code === 3 && data) {
          let { code, data } = res;
          // this.setData({ registeData: data });
          console.log(data);
          wx.setStorageSync('tempRegData', data);
          // if (isFrom) {
          //   wx.navigateTo({
          //     url: `/pages/bind-phone/bind-phone?isFrom=${isFrom}`,
          //   })
          // } else {
            wx.navigateTo({
              url: `/pages/bind-phone/bind-phone`,
            })
          // }
        } else if (code === 4 && data) {
          let { code, data } = res;
          // this.setData({ registeData: data });
          console.log(data);
          wx.setStorageSync('tempRegData', data);
          // if (isFrom) {
          //   wx.navigateTo({
          //     url: `/pages/bind-phone/bind-phone?isFrom=${isFrom}&bind=true`,
          //   })
          // } else {
            wx.navigateTo({
              url: `/pages/bind-phone/bind-phone?bind=true`,
            })
          // }
        }
      })

    }
  }
}

function toLogin() { //verify是否为发送验证码，如果是，不提示未绑定手机
      wx.showLoading({
        title: '加载中...'
      });
      return new Promise((resolve, reject) => {
        wx.login({
          success(response) {
            wx.getUserInfo({
              withCredentials: true,
              success(re){
                let data = {
                  encryptedData: re.encryptedData,
                  iv: re.iv,
                  code: response.code,
                  miniAppId: constv.app_type
                }
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
                    if (result.data.code == 0) {
                      const {
                        userId,
                        userInfo,
                        jwt,
                        wechatAuth,
                        userPhone,
                        ...others
                      } = result.data.body;
                      if (userId && userPhone && userPhone.phone) {
                        const user = {
                          ...userInfo,
                          ...others,
                          userPhone
                        }
                        wx.setStorageSync('user', user)
                        wx.setStorageSync('token', jwt)
                        resolve({
                          code: 0
                        });
                      } else {
                        if (userId) {//有用户无手机
                          wx.setStorageSync('token', jwt);
                          reject({ code: 4, data: result.data.body })
                        } else {//无用户无手机
                          reject({ code: 3, data: result.data.body })
                        }
                      }
                    } else {
                      wx.showToast({
                        title: '网络错误,请重试',
                        icon: 'none'
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
      })
}
function shareDrawClub(ctx, img1, img2, text, cb, img3) {
  let promises = [img1, img2].map((img) => {
    return new Promise((resolve, reject) => {
      wx.getImageInfo({
        src: img,
        success: function (res) {
          resolve(res.path);
        }
      })
    })
  })
  Promise.all(promises).then((img) => {
    startDraw(ctx, img[0], img[1], text, cb, img3);
  })
}
function startDraw(ctx, img1, img2, text, cb, img3) {
  if (/images/.test(img1)) {
    img1 = '/' + img1;
  }
  return new Promise((resolve, reject) => {
    let logo_w = 32;
    let logo_x = 15;
    let canvas_w = 375;
    let canvas_h = 210;

    ctx.drawImage(img1, 0, 0, canvas_w, canvas_h);
    const grd = ctx.createLinearGradient(0, 0, 0, canvas_h);
    grd.addColorStop(0, 'rgba(0,0,0,0.7)');
    grd.addColorStop(1, 'rgba(0,0,0,0)');
    // ctx.setGlobalAlpha(0.5);
    // ctx.rect(0, 0, canvas_w, canvas_h);
    // ctx.setFillStyle('#000');
    ctx.setFillStyle(grd);
    ctx.fillRect(0, 0, canvas_w, canvas_h);
    ctx.setGlobalAlpha(1);
    ctx.beginPath();
    ctx.save();
    ctx.arc(logo_x + logo_w / 2, logo_x + logo_w / 2, logo_w / 2, 0, Math.PI * 2);
    ctx.setFillStyle('#f00');
    ctx.fill();
    ctx.clip();
    ctx.drawImage(img2, logo_x, logo_x, logo_w, logo_w);
    ctx.restore();
    ctx.beginPath();
    ctx.setFontSize(14);
    ctx.setFillStyle('#fff');
    ctx.fillText(text, logo_x * 2 + logo_w - 2, logo_x + logo_w / 2 + 6);
    if (img3) {
      ctx.drawImage(img3, 204, 150, 44, 44);
    }
    ctx.draw();
    setTimeout(() => {
      wx.canvasToTempFilePath({
        canvasId: 'myCanvas',
        x: 0,
        y: 0,
        width: 375,
        height: 210,
        destWidth: 750,
        destHeight: 420,
        success(res) {
          resolve(res.tempFilePath);
        }
      }, this)
    }, 1000)
  }).then(cb)
}
// 日期转时间戳
function toTimestamp(d) {
  let day = d.split(' ');
  let hour = day[1].split(':')[0];
  let date = day[0].split('-');
  return new Date(date[0], Number(date[1]) - 1, date[2], hour).getTime();
}
// 上传视频
function uploadVideo(filePath, cb1, cb2) {
  wx.showLoading({
    title: '正在上传...',
    mask: true
  })
  getVideoToken(filePath).then((itemUrl) => {
    console.log(itemUrl);
    wx.hideLoading();
    cb1(itemUrl);
  })
}
function getVideoToken(filePath, urlList, cb) {
  let timestamp = parseInt((new Date().valueOf()));
  let key = sha1.sha1("" + timestamp);
  console.log('key-->', key);
  return new Promise((resolve, reject) => {
    wx.request({
      url: `${urls.qiniuUpload}/${key}`,
      header: {
        'Authorization': 'Bearer ' + wx.getStorageSync("token"),
        "content-type": "application/json"
      },
      method: "POST",
      data: {},
      // 上传
      success(result) {
        const { token, url } = result.data.body;
        wx.uploadFile({
          url: urls.qiniu,
          filePath: filePath,
          name: 'file',
          formData: { token, key },
          success(res) {
            resolve(url);
          },
          fail(res) {
            reject()
            console.warn('上传视频失败', res);
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
// input + video 发贴格式化
function toVideoContent(input, url) {
  let data = []
  data.push({
    pos: 1,
    content: input,
    type: "TEXT",
  })
  if (url) {
    data.push({
      pos: 2,
      content: url,
      type: "VIDEO",
    })
  }
  return data
} 
function getOrderState(reasonState) {
  return [
    { index: 1, state: 'PAYED', title: '待消费', content: '已存入个人中心' },
    { index: 2, state: 'CREATED', title: '待支付', content: '请继续支付' },
    { index: 3, state: 'CONSUMED', title: '已完成', content: '' },
    { index: 4, state: 'AUDIT', title: '审核中', content: '请耐心等待' },
    { index: 5, state: 'AUDITFAIL', title: '未通过', content: reasonState ? "原因:" + reasonState + "" : "" },
    { index: 6, state: 'CANCELED', title: '已取消', content: '该订单已取消' },
    { index: 7, state: 'TIMEOUT', title: '支付超时', content: '请您重新下单' },
    { index: 8, state: 'UNSETTLED', title: '已支付待确认', content: '请稍等' },
  ]
}
function getOrderState1(reasonState) {
  return [
    { index: 1, state: 5, title: '待消费', content: '已存入个人中心' },
    { index: 2, state: 1, title: '待支付', content: '请继续支付' },
    { index: 3, state: 7, title: '订单完成', content: '' },
    { index: 4, state: 6, title: '审核中', content: '请耐心等待' },
    { index: 5, state: 8, title: '未通过', content: reasonState ? "原因:" + reasonState + "" : "" },
    { index: 6, state: 4, title: '已取消', content: '该订单已取消' },
    { index: 7, state: 2, title: '支付超时', content: '请您重新下单' },
    { index: 8, state: 3, title: '已完成', content: '' },
  ]
}
// 订单状态
function getRealOrderState(reasonState) {//实物商品
  return [
    { index: 1, state: 5, title: '支付成功', content: '请领取商品' },
    { index: 2, state: 1, title: '待支付', content: '请继续支付' },
    { index: 3, state: 7, title: '订单完成', content: '' },
    { index: 4, state: 6, title: '审核中', content: '请耐心等待' },
    { index: 5, state: 8, title: '未通过', content: reasonState ? "原因:" + reasonState + "" : "" },
    { index: 6, state: 4, title: '已取消', content: '该订单已取消' },
    { index: 7, state: 2, title: '支付超时', content: '请您重新下单' },
    { index: 8, state: 3, title: '已完成', content: '' },
    { index: 9, state: 9, title: '已领取', content: '该商品已领取' },
    { index: 10, state: 10, title: '已签收', content: '该商品已签收' },
    { index: 11, state: 11, title: '已确认', content: '该商品已确认收货' },
  ]
}
// 商品状态
function getGoodsState() {
  return [
    { index: 1, state: 1, title: '已付款', content: '请等待商家发货' },
    { index: 2, state: 2, title: '已发货', content: '卖家已发货' },
    { index: 3, state: 3, title: '已签收', content: '商品已被签收' },
    { index: 4, state: 4, title: '申请退款', content: '正在申请退款' },
    { index: 5, state: 5, title: '退款成功', content: '退款申请成功' },
    { index: 6, state: 6, title: '商家拒绝退款', content: '退款申请已被拒绝' },
    { index: 7, state: 7, title: '订单成功', content: '您已确认收货' },
  ]
}
//false 未过期 true 已过期
function checkExpire(createTime, exType, exTime) {//type 
  console.log(`${createTime}:${exType}:${exTime}`)
  if (exType) {
    var now = Date.now()
    if (exType == 1) {//不限
      return false
    } else if (exType == 2) {//天数 ms
      if (createTime) {
        if (createTime + exTime * 24 * 60 * 60 * 1000 > now) {
          return false
        } else {
          return true
        }
      } else {//还未购买
        return false
      }
    } else if (exType == 3) {//日期
      if (exTime > now) {
        return false
      } else {
        return true
      }
    }
  } else {
    return false
  }
}
//检查是否超出限购或库存
//stock库存limit限购（0为不限购）count要购买的数量hasCount已购买数量
function checkBuyLimit(stock, limit, count, hasCount) {
  console.log(`${stock}-${limit}-${count}-${hasCount}`)
  if (stock == 0) return '已经没有库存'
  // if(!limit||limit == 0||!stock) return ''

  let inv = stock
  let record = hasCount ? hasCount : 0
  if (count > inv) {//库存
    return '购买超出库存'
  } else if (!limit || limit == 0) {
    return ''
  } else if (count > limit - record) {//限购
    return '购买数量超过限购'
  } else {
    return ''
  }
}

// 发布内容验证
function msgCheck(area) {
  return new Promise((resolve, reject) => {
    fetch({
      url: `${urls._exemption}/msgCheck`,
      method: 'POST',
      data: { type: constv.app_type, content: area },
      success: body => {
        if (body.body && body.body == true) {
          resolve();
        } else {
          wx.showToast({
            title: '您发的内容包含敏感信息，请修改后再发',
            icon: 'none',
            duration: 2000
          })
        }
      }
    })
  })
}
//时间戳转换成日期时间
function formDateTime(unixtime) {
  var date = new Date(unixtime);
  var y = date.getFullYear();
  var m = date.getMonth() + 1;
  m = m < 10 ? ('0' + m) : m;
  var d = date.getDate();
  d = d < 10 ? ('0' + d) : d;
  var h = date.getHours();
  h = h < 10 ? ('0' + h) : h;
  var minute = date.getMinutes();
  var second = date.getSeconds();
  minute = minute < 10 ? ('0' + minute) : minute;
  second = second < 10 ? ('0' + second) : second;
  // return y + '-' + m + '-' + d + ' ' + h + ':' + minute + ':' + second;//年月日时分秒
  return y + '.' + m + '.' + d + '  ' + h + ':' + minute;

}

// 支付
function toPay(orderId, productType) {
  return new Promise((resolve,reject)=>{
    let url = `${urls.order}/charge`;
    let data = {
      orderId,
      channelId: constv.app_type,
      // platform: false
    }
    let success = body => {
      let pingpp = require('./pingpp.js');
      pingpp.createPayment(body, (res) => {
        console.log(body);
        console.log(res);
        if (res == 'success') {
          wx.showToast({
            title: '支付成功',
          })
          resolve();
        } else {
          wx.showToast({
            title: '取消支付',
          })
          if(productType){
            if (productType == 2) {
              wx.redirectTo({
                url: `/shop/goodsdetails/goodsdetails?orderId=${orderId}`,
              })
            } else {
              wx.redirectTo({
                url: `/club-order/order-detail/order-detail?orderId=${orderId}`,
              })
            }
          }
          
        }
      })
    }
    let fail = body => {
      // wx.showToast({
      //   title: data.message || '请检查网络',
      //   icon: 'none'
      // })
      wx.showToast({
        title: body.code == 2031 ? "超过限购次数" : "支付失败",
        icon: 'none'
      });
    }
    fetch({ url, method: 'POST', data, success, fail, loading: '准备支付...' })
  })
  
}
function toDecimal2(x,intNum=false) {
  var f = Math.round(x) / 100; 
  var s = f.toString();  
  var rs = s.indexOf('.');
  let res;
  let ints;
  if (rs < 0) { //找不到
    res = '.00';
    ints = s;
  }else{
    let right = s.split('.');
    if(right[1].length==1){
      res = '.' + right[1] + '0';
    }else{
      res = '.'+right[1];
    }
    ints = right[0];
  }
  if(intNum){
    return ints;
  }else{
    return res;
  }
}
// 分享获取二维码
function getQrcode(feedType,relateId,url) {
  const data = {
    feedType,
    relateId,
    url: url?url:getCurrentPages()[getCurrentPages().length - 1].route,
    appType: constv.app_type
  }
  console.log(data);
  return new Promise((resolve, reject) => {
    fetch({
      url: `${urls.getCode}`,
      data: data,
      loading: '加载中...',
      success: body => {
        resolve(body);
      },
      fail: body => {
        wx.showToast({ title: body.message, icon: 'none', });
      }
    })
  })
}
//获取俱乐部详情
function getClubProperty(clubId) {
  return new Promise((resolve, reject) => {
    fetch({
      url: `${urls._clubs}/${clubId}`,
      success: body => {
        console.log('member');
        if (body.clubProperty) {
          if (!body.member) {
            resolve();
          } else {
            reject();
          }
        } else {
          reject();
        }
      }
    })
  })
}
module.exports = {
  fetch,
  getToken,
  uploadImages,
  toContentParts,
  toImages,
  toVideos,
  analyzeContentParts,
  getMonth,
  getWeek,
  formatDate,
  formatDateCN,
  formatMsgTime,
  formatPosts,
  getTextFromHTML,
  deepMerge,
  bindPhone,
  formatPostsAce,
  newBindPhone,
  getPhone,
  toLogin,
  login,
  getUserInfo,
  formatCards,
  checkUserState,
  showAnimation,
  slideUpAnimation,
  shareDrawClub,
  isClubMember,
  toTimestamp,
  uploadVideo,
  toVideoContent,
  getOrderState: getOrderState1,
  getRealOrderState,
  getGoodsState,
  checkExpire,
  checkBuyLimit,
  msgCheck,
  formDateTime,
  toPay,
  toDecimal2,
  getQrcode,
  getClubProperty
}