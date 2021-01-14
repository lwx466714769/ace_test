import {formatDate} from '../utils/utils.js';
// border 矩形
function _rect(height, width) {
  return ({
    type: 'rect',
    css: {
      width: width || '690rpx',
      height: height || '886rpx',
      background: '#fff',
      color: '#fff',
      top: '240rpx',
      left: '30rpx'
    }
  })
}
// 大图
function _coverImage(url) {
  return (
    {
      type: 'image',
      url: url,
      css: {
        top: '276rpx',
        left: '60rpx',
        mode: 'aspectFill',
        width: '630rpx',
        height: '354rpx',
      }
    }
  )
}
// 引号
function _icon(){
  return {
    type: 'image',
    url: '/images/yinhao.png',
    css: {
      top: '590rpx',
      left: '60rpx',
      mode: 'scaleToFill',
      width: '146rpx',
      height: '124rpx',
    }
  }
}
// cover渐变
function _linear(width, height) {
  return ({
    type: 'linear',
    css: {
      top: '190rpx',
      left: '30rpx',
      width: width||'630rpx',
      height: height||'354rpx',
    }
  })
}
// 小图
function _centerImage(url) {
  return (
    {
      type: 'image',
      url: url,
      css: {
        top: '60rpx',
        left: '60rpx',
        mode: 'aspectFill',
        width: '480rpx',
        height: '272rpx',
        borderRadius: '8rpx'
      }
    }
  )
}

// 标题
function _title(text,top,align,size) {
  return ({
    type: 'text',
    text: text,
    css: {
      align:align||'top',
      top: top||'353rpx',
      left: '30rpx',
      width: '536rpx',
      fontSize: size||'28rpx',
      maxLines: 1
    }
  })
}
// 文字描述
function _describe(text,top,lines,color) {
  return ({
    type: 'text',
    text: text,
    css: {
      left: '100rpx',
      width: '550rpx',
      top: top?'836rpx':'746rpx',
      fontSize: '28rpx',
      lineHeight: '50rpx',
      maxLines:lines || 2,
      color:color||'rgb(153,153,153)'
    }
  })
}

function _authorlogo(url) {
  return({
    type:'image',
    url:url,
    css:{
      top: '574rpx',
      left: '70rpx',
      mode: 'aspectFill',
      width: '50rpx',
      height: '50rpx',
      borderRadius: '40rpx'
    }
  })
}

function _authorName(text) {
  return ({
    type: 'text',
    text: text,
    css: {
      left: '140rpx',
      top: '591rpx',
      fontSize: '22rpx',
      color:'#fff',
      maxLines:1,
      width:'200rpx'
    }
  })
}

// logo图标
function _logo(){
  return (
    {
      type: 'image',
      url: '/images/canvas_aomai.png',
      css: {
        top: '80rpx',
        left: '30rpx',
        mode: 'aspectFill',
        width: '160rpx',
        height: '130rpx',
      }
    }
  )
}
// 俱乐部名称
function _clubName(text) {
  return ({
    type: 'text',
    text: text,
    css: {
      left: '130rpx',
      top: '114rpx',
      fontSize: '28rpx',
      color:'#fff',
      maxLines:1,
      width:'200rpx'
    }
  })
}
function _date(text,top){
  return ({
    type: 'text',
    text: text,
    css: {
      left: '100rpx',
      top: top?top:'856rpx',
      fontSize: '28rpx',
      color: 'rgb(153,153,153)'
    }
  })
}
// 俱乐部名称
function _clubName2(text) {
  return ({
    type: 'text',
    text: text,
    css: {
      left: '120rpx',
      top: '110rpx',
      width:'192rpx',
      fontSize: '24rpx',
      maxLines:2,
      lineHeight:'30rpx',
      color: '#fff'
    }
  })
}
function _type(text){
  return ({
    type: 'text',
    text: text,
    css: {
      right: '30rpx',
      top: '100rpx',
      fontSize: '96rpx',
      color: '#377513'
    }
  })
}
function _typeGray(text) {
  return ({
    type: 'text',
    text: text,
    css: {
      right: '30rpx',
      top: '52rpx',
      fontSize: '128rpx',
      color: 'rgba(255,255,255,.2)'
    }
  })
}

// 头像
function _avatar(url){
  return({
    type: 'image',
    url:url,
    css: {
      top: '746rpx',
      left: '100rpx',
      mode: 'aspectFill',
      width: '56rpx',
      height: '56rpx',
      borderRadius: '28rpx'
    }
  })
}
        
// 昵称
function _nickName(text,color){
  return({
    type: 'text',
      text: text,
      css: {
        top: '760rpx',
        left: '176rpx',
        fontSize: '28rpx',
        maxLines: 1,
        color: color || 'rgb(153,153,153)'
      },
  })
}
// 指纹
function _finger(url,bottom){
  return({
    type: 'image',
    url: url,
    css: {
      right: '150rpx',
      bottom: bottom||'70rpx',
      width: '60rpx',
      height: '82rpx'
    }
  })
}
// 二维码背景
function _qrcodeArc(){
  return({
    type:'rect',
    css: {
      width: '124rpx',
      height: '124rpx',
      left: '62rpx',
      bottom: '50rpx',
      borderRadius: '62rpx',
      color:'#fff'
    }
  })
}
// 二维码
function _qrcode(url,bottom) {
  return ({
    type: 'image',
    url: url,
    css: {
      width: '120rpx',
      height: '120rpx',
      left: '100rpx',
      bottom: '156rpx',
      borderRadius: '44rpx'
    }
  })
}
// 长按
function _touch() {
  return ({
    type: 'text',
    text: '长按小程序二维码',
    css: {
      bottom: '220rpx',
      left: '258rpx',
      fontSize: '28rpx',
      color: '#333'
    },
  })
}
function _touch2() {
  return ({
    type: 'text',
    text: '进入 TripleT机车 获取更多资讯',
    css: {
      bottom: '180rpx',
      left: '258rpx',
      fontSize: '28rpx',
      color: '#333'
    },
  })
}
// 二维码下方的描述
function _follow(text) {
  return ({
    type: 'text',
    text: text,
    css: {
      bottom: '30rpx',
      right: '30rpx',
      fontSize: '16rpx',
      color: '#666'
    }
  })
}
// 俱乐部名的显示位置
function _getClub(name){
  let curNames;
  if (name) {
    let clubName = name;
    let reg = /[a-z]{6}/;
    let reg1 = /[a-z][A-Z]||{[a-z]||[A-Z]}/;
    let isLower;
    if(!reg1.test(clubName)){
      isLower = 'chinese';
    }else if(reg.test(clubName)){
      isLower = 'true';
    }else if(!reg.test(clubName)){
      isLower = 'false';
    }else{
      isLower = 'other';
    }
    let names = clubName.split('');
    if(isLower == 'chinese'&&names.length>8){
      curNames = _clubName2(name)
    }else if(isLower == 'true'&&names.length>20){
      curNames = _clubName2(name)
    } else if (isLower == 'false' && names.length > 13){
      curNames = _clubName2(name)
    }else{
      curNames = _clubName(name)
    }
    
  } else {
    curNames = '';
  }
  return curNames;
}
function _cardPrice(price){
  return ({
    type: 'text',
    text: price==0?'免费':'￥'+price/100,
    css: {
      bottom: '186rpx',
      left: '30rpx',
      fontSize: '32rpx'
    }
  })
}
function _saveBg(){
  return ({
    type:'rect',
    css:{
      bottom: '0rpx',
      left: '226rpx',
      borderRadius: '50rpx',
      width: '300rpx',
      height: '72rpx',
      color:'#fff'
    }
  })
}
function _saveAngle(){
  return ({
    type: 'rect',
    css: {
      bottom: '60rpx',
      left: '300rpx',
      width: '20rpx',
      height: '20rpx',
      color: '#fff',
      rotate:'45'
    }
  })
}
function _save(){
  return ({
    type:'text',
    text:'长按保存至手机相册',
    css:{
      bottom:'24rpx',
      left:'250rpx',
      color:'#333',
      fontSize:'28rpx'
    }
  })
}
let width = '750rpx';
let height = '1250rpx';
let background = '#000';
let common = [
  _rect(), _logo(), _touch(),_touch2()
]
export default class LastMayday {
  shareCard(params) {
    return ({
      width,height,background,
      views: [   
        ...common,
        _coverImage(params.patternLargeUrl),
        _icon(),
        _typeGray(params.productType ==1?'卡券':'精品'),
        _type(params.productType == 1 ? '卡券' : '精品'),
        _describe(params.synopsis),
        _date(params.chooseItem.currentPrice / 100 == 0 ? "免费" : "￥ " + params.chooseItem.currentPrice/100),
        _qrcode(params.qrcode), 
      ],
    });
  }
  shareClub(params) {
    return ({
      width, height, background,
      views: [
        ...common,
        _coverImage(params.cover),
        _icon(),
        _typeGray('俱乐部'),
        _type('俱乐部'),
        _describe(params.describe,'',4),
        _qrcode(params.qrcode),
      ],
    });
  }
  sharePost(params) {
    return ({
      width, height, background,
      views: [
        ...common,
        _coverImage(params.cover),
        _icon(),
        _typeGray('帖子'),
        _type('帖子'),
        _describe(params.contents&&params.contents[0].content ? params.contents[0].content:params.info,true),
        _qrcode(params.qrcode),
        _avatar(params.userInfo.userLogo),
        _nickName(params.userInfo.userName),
      ],
    });
  }
  shareEquip(params) {
    console.log(params);
    let appealContent=[];
    params.appealContent.map((item,index)=>{
      if(index>1) return;
      let rectBlue = {
        type: 'rect',
        css: {
          width: '4rpx',
          height: '12rpx',
          color: '#3b94fd',
          top: 950+index*48+'rpx',
          left:'100rpx'
        }
      }
      let name = {
        type: 'text',
        text: item.name,
        css: {
          left: '114rpx',
          top: 940+index * 48+'rpx',
          color: '#999',
          fontSize: '24rpx'
        }
      }
      let value = {
        type: 'text',
        text: item.value,
        css: {
          width:'340rpx',
          left: '282rpx',
          top: 940+index * 48 + 'rpx',
          fontSize: '24rpx',
          maxLines: 1,
          color: '#999',
        },
      }
      appealContent = [...appealContent,rectBlue,name,value];
    })
    console.log(appealContent)
    let brandName = params.brandName ? params.brandName : params.appealContent[0]?params.appealContent[0].value:'';
    let seriesName = params.seriesName ? params.seriesName : params.appealContent[1]?params.appealContent[1].value:'';
    return ({
      width, height:'1350rpx', background,
      views: [
        _rect('992rpx'),
        ...common,
        _coverImage(params.background),
        _icon(),
        _typeGray('装备'),
        _type('装备'),
        _describe(brandName+' '+seriesName),
        ...appealContent,
        _avatar(params.userLogo),
        _nickName(params.userName),
        _qrcode(params.qrcode),
      ],
    });
  }
  
  shareEvent(params) {
    let date;
    let startTime = params.startTime.split(' ');
    let endTime = params.endTime.split(' ');
    if(startTime[0] == endTime[0]){
      date = params.startTime +'-'+ endTime[1];
    }else{
      date = params.startTime+' - ' + params.endTime;
    }
    return ({
      width, height, background,
      views: [
        ...common,
        _coverImage(params.coverImg.url),
        _icon(),
        _typeGray('活动'),
        _type('活动'),
        _describe(params.activityName),
        _date(date),
        _qrcode(params.qrcode),
      ],
    });
  }
  shareParty(params) {
    console.log(params);
    let startTime = params.partyInfo&&params.partyInfo.startTime||params.startTime;
    let endTime = params.partyInfo && params.partyInfo.endTime || params.endTime;
    let date;
    if (params.partyInfo){
      date = formatDate(startTime, '.', true) + ' - ' + formatDate(endTime, '.', true);     
    }else{
      date = startTime + ' - ' + endTime;
    }
    console.log(date);
    return ({
      width, height, background,
      views: [
        ...common,
        _coverImage(params.partyInfo && params.partyInfo.background || params.background || 'https://img.acegear.com/d20e16bb0095fef5753fc2a1087a1f3f9e72448d/w700_1'),
        _icon(),
        _typeGray('攒局'),
        _type('攒局'),
        _describe(params.partyInfo && params.partyInfo.name || params.name),
        _date(date),
        _qrcode(params.qrcode?params.qrcode:''),
      ],
    });
  }
  shareVote(params) {
    return ({
      width, height, background,
      views: [
        ...common,
        _coverImage(params.voteInfo && params.voteInfo.background || params.background ||'https://img.acegear.com/382802b55176798524e03f9d0cea96dd4a6c2323/w700_1'),
        _icon(),
        _typeGray('投票'),
        _type('投票'),
        _describe(params.voteInfo&&params.voteInfo.name||params.name),
        _qrcode(params.qrcode),
        _avatar(params.userLogo?params.userLogo:params.userInfo.userLogo),
        _nickName(params.userName?params.userName:params.userInfo.userName),
      ],
    });
  }
  shareAlbum(params) {
    console.log(params);
    let total = params.total + (params.type=="album"?" 个相册":' 张照片');
    if(params.cover.indexOf('/w700_1') == -1){
      params.cover = params.cover+'/w700_1'
    }
    return ({
      width, height, background,
      views: [
        ...common,
        _coverImage(params.cover||'/images/share-img.jpg'),
        _icon(),
        _typeGray('相册'),
        _type('相册'),
        _describe('这是个性能车的园地，性能不是「必需品」，是个「必备品」，你可以拥有高性能车，或去改装车，让车恢复应该有的性能，而不是停在车库或者趴在路边当个展品！','',2),
        _date(total||0),
        _qrcode(params.qrcode),
      ],
    });
  }
  shareProfile(params) {
    return ({
      width: '600rpx',
      height: '800rpx',
      borderRadius: '8rpx',
      background: '#ffffff',
      views: [
        _describe(params.title,'340rpx'),
        //_logo(params.clubCoverUrl),
        //curNames,
        _finger('/images/icon-finger.png'),
        _qrcode(params.qrcode),
        _follow('长按查看更多'),
        // 头像
        {
          type: 'image',
          url: params.avatar,
          css: {
            top: '60rpx',
            left: '30rpx',
            mode: 'aspectFill',
            width: '120rpx',
            height: '120rpx',
            borderRadius: '30rpx'
          }
        },
        // 昵称
        {
          type: 'text',
          text: params.nickname,
          css: {
            top: '210rpx',
            left: '30rpx',
            fontSize: '40rpx'
          }
        },
        // 地址
        {
          type: 'text',
          text: params.province,
          css: {
            top: '266rpx',
            left: '30rpx',
            fontSize: '24rpx',
            color:'#999'
          }
        },
        // 关注
        {
          type: 'text',
          text: '关注',
          css: {
            top: '528rpx',
            right: '200rpx',
            fontSize: '24rpx',
            width: '84rpx',
            align: 'center'
          }
        },
        // 关注数量
        {
          type: 'text',
          text: '' + params.followeeCount + '',
          css: {
            top: '576rpx',
            right: '200rpx',
            fontSize: '32rpx',
            width:'84rpx',
            align:'center'
          }
        },
        // 粉丝
        {
          type: 'text',
          text: '粉丝',
          css: {
            top: '528rpx',
            right: '80rpx',
            fontSize: '24rpx',
            width: '84rpx',
            align: 'center'
          }
        },
        
        // 粉丝数量
        {
          type: 'text',
          text: ''+params.followerCount+'',
          css: {
            top: '576rpx',
            right: '80rpx',
            fontSize: '32rpx',
            width: '84rpx',
            align: 'center'
          }
        },
      ],
    });
  }
}

