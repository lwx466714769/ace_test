import constv from '../const.js';
const base = constv.base
const qiniu = 'https://upload.qiniup.com'
// const new_api = constv.new_api
const new_api = 'http://192.168.8.122:8081'
// /*--测试服--*/

// // const base = 'https://miniapp.acegear.com'

// /*--正式服--*/

// const base = 'https://miniapp.acegear.cn'
const local = 'http://192.168.8.130:8201'
export default {
  qiniu,
  qiniuUpload: new_api + '/verify/token',
  login: new_api + '/exemption/userAuth/wechat/miniApp',
  
  _user: new_api + '/verify/users',
  _club: new_api + '/verify/club',
  _event: new_api + '/events',
  _order: new_api + '/orders',
  _cardList: new_api + '/verify/commodity/shelves',
  _cardDetail: new_api + '/verify/commodity',
  _jwt: new_api + '/verify/userAuth/jwt',//验证jwt是否有效
  _seniorMember: new_api + '/verify/seniorMember',
  checkmsg: new_api + '/auth/msgCheck',//敏感词检查

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