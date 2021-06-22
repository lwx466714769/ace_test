const qiniu = 'https://upload.qiniup.com'

const base = 'https://miniapp.acegear.com'
const app = 'https://testv2.acegear.com'

// const base = 'https://miniapp.acegear.cn'
// const app = 'https://api2.acegear.cn'

export default {
  qiniu,
  qiniuUpload: base + '/pic/token',
  login: base + '/auth/sso/wechat/code',
  notify: base + '/notifycafe',
  user: base + '/users',
  club: base + '/clubs',
  ticket: base + '/coupons',
  home: base + '/home',

  _register: app + '/auth/register/sso',
  _user: app + '/users',
  _club: app + '/clubs',
  _post: app + '/posts',
  _comment: app + '/comments',
  _event: app + '/events',
  _search: app + '/search',
  _phone: app + '/auth/verify/phone',
  _order: app + '/orders',
}