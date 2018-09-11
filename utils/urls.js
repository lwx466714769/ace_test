const qiniu = 'https://upload.qiniup.com'
const share = 'https://share-api.acegear.com'

const base = 'https://miniapp.acegear.com'
const app = 'https://testv2.acegear.com'

// const base = 'https://miniapp.acegear.cn'
// const app = 'https://api2.acegear.cn'

export default {
  qiniu,
  qiniuUpload: base + '/pic/token',
  notify: base + '/notify',
  login: base + '/auth/sso/wechat/code',
  user: base + '/users',
  club: base + '/clubs',
  qrcode: share + '/wechat/4/qrcode',

  _register: app + '/auth/register/sso',
  _event: app + '/events',
  _order: app + '/orders',
  _phone: app + '/auth/verify/phone',
}