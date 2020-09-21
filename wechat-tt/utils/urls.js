import constv from '../const.js';
const base = constv.base
const app = constv.app
const qiniu = 'https://upload.qiniup.com'
const new_api = constv.new_api
// const new_api = 'https://devapi.acegear.com'
// /*--测试服--*/

// // const base = 'https://miniapp.acegear.com'
// // const app = 'https://testv2.acegear.com'

// /*--正式服--*/

// const base = 'https://miniapp.acegear.cn'
// const app = 'https://api2.acegear.cn'
const local = 'http://192.168.8.130:8201'
export default {
  qiniu,
  qiniuUpload: new_api + '/verify/token',
  // login: app + '/auth/sso/wechat/miniApp', // 奥麦  小程序
  login: new_api + '/exemption/userAuth/wechat/miniApp',
  notify: base + '/notifycafe',
  user: base + '/users',
  club: base + '/clubs',
  // club: new_api + '/verify/clubs',
  ticket: base + '/coupons',
  home: base + '/home',
  ride: base + '/ride',
  userride:base + '/ride/userride',
  
  _register: app + '/auth/register/sso',  
  _register2: app + '/auth/register/sso2', 
  _getPhone: app + '/auth/register/phoneDecrypt',
  _user: new_api + '/verify/users',
  _bindPhone: app + '/users/phone',
  _club: new_api + '/verify/club',
  _events: app + '/events',
  _comment: app + '/comments',
  _event: new_api + '/events',
  _search: app + '/search',
  _phone: app + '/auth/verify/phone',
  _order: new_api + '/orders',
  _card: app + '/card',
  // _cardList: app + '/card/label',
  // _cardDetail:app + '/card',
  _cardList: new_api + '/verify/commodity/shelves',
  _cardDetail: new_api + '/verify/commodity',
  _consumerCard: app + '/consumerCard',
  _orderCheckCard: app + '/consumerCard',
  _comments: app + '/comments',
  _jwt: new_api + '/verify/userAuth/jwt',//验证jwt是否有效
  _auth: app + '/auth',//微信手机号注册
  _phoneCheck: app + '/users/phone/checking',//绑定手机号
  // _seniorMember: app + '/seniorMember',//高级会员卡
  _seniorMember: new_api + '/verify/seniorMember',

  _car: app + '/car/series',
  _carshop: app + '/car/dealer',
  _carcheck: app +'/car',
  // getCode: app + '/pic/code',

  _qrcode: app + '/pic/code' + '?',
  
  // _qrcode: 'https://testv2.acegear.com' + '/pic/code' + '?' // 测试服
  _infoBanner: app + '/banner', //推荐banner

  
  album: app + '/album',
  
  clubList: app + '/clubApplication/list',
  
  report: app + '/report',
  checkmsg: new_api + '/auth/msgCheck',//敏感词检查
  openId: app+'/auth/wechat/code',

  _cardPackage: new_api + '/consumerCard/cardPackage',
  _verify: new_api + '/verify',
  _clubs: new_api +'/verify/club',
  order: new_api +'/verify/order',
  card: new_api + '/verify/card',
  banner: new_api + '/exemption/banner',
  recommendPosts: new_api + '/verify/hotdiscussrecommend',
  lockStorage: new_api + '/verify/commodity/lock',
  reports: new_api + '/verify/Report',
  _exemption: new_api + '/exemption',
  wxPhoneRegister: new_api + '/exemption/userAuth/wxPhoneRegister',
  getCode: new_api + '/verify/statistics/getCode',
  wxBindPhone: new_api + '/verify/userAuth/binding/phone',//单独绑定手机
  address: new_api + '/verify/goods/address',
  goods: new_api + '/verify/goods',
  company: new_api + '/verify/order/findByCompanyCode',
  clubMedia: new_api + '/verify/club/mediaUser',
  activity: new_api + '/verify/activity',    //活动
  hotdiscuss: new_api + '/verify/hotdiscuss',   //获取活动介绍内容
  tickets: new_api + '/verify/tickets',//活动门票
  _albums: new_api + '/verify/album',  //相册照片集合
  albums: new_api + '/exemption/album',
  party: new_api + '/verify/party',
  vote: new_api + '/verify/vote',
  reply: new_api + '/verify/reply',
  statistics: new_api + '/verify/statistics',
  _posts: new_api + '/verify/post',
  collectionPager: new_api + '/verify/statistics/collectionPager',    //我的收藏
  equip: new_api + '/verify/equip',
  userInfo: new_api + '/verify/userInfo',   //我的发布
  privateChat: new_api + '/verify/privateChat'   //私信
}