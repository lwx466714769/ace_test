// 大图
function _coverImage(url) {
  return (
    {
      type: 'image',
      url: url,
      css: {
        top: 0,
        left: 0,
        mode: 'aspectFill',
        width: '600rpx',
        height: '300rpx',
        borderRadius:'8rpx'
      }
    }
  )
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
// 白色圆角矩形
function _rect(){
  return({
    type:'rect',
    css:{
      width: '600rpx',
      height: '424rpx',
      borderRadius: '14rpx',
      background: '#f00',
      top: '286rpx'
    }
  })
}
// 标题
function _title(text,top,align,size) {
  return ({
    type: 'text',
    text: text,
    css: {
      align:align||'center',
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
      left: '30rpx',
      width: '536rpx',
      top: top||'420rpx',
      fontSize: '28rpx',
      lineHeight: '50rpx',
      maxLines:lines || 3,
      color:color||'#666'
    }
  })
}
// logo图标
function _logo(url){
  return (
    {
      type: 'image',
      url: url,
      css: {
        bottom: '60rpx',
        left: '30rpx',
        mode: 'aspectFill',
        width: '86rpx',
        height: '86rpx',
        borderRadius: '46rpx'
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
      left: '126rpx',
      bottom: '90rpx',
      fontSize: '28rpx',
    }
  })
}
// 俱乐部名称
function _clubName2(text) {
  return ({
    type: 'text',
    text: text,
    css: {
      left: '126rpx',
      bottom: '64rpx',
      width:'240rpx',
      fontSize: '28rpx',
      maxLines:2,
      lineHeight:'36rpx'
    }
  })
}
// 昵称
function _nickName(text){
  // 昵称
  return({
    type: 'text',
      text: '-- '+text,
      css: {
        width: '300rpx',
        bottom: '200rpx',
        right: '50rpx',
        fontSize: '28rpx',
        align: 'right',
        maxLines: 1
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
// 二维码
function _qrcode(url,bottom) {
  return ({
    type: 'image',
    url: url,
    css: {
      width: '92rpx',
      height: '92rpx',
      right: '30rpx',
      bottom: bottom||'60rpx',
      borderRadius: '40rpx'
    }
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
export default class LastMayday {
  cardDetail(params) {
    return ({
      width: '600rpx',
      height: '800rpx',
      borderRadius:'8rpx',
      background: '#ffffff',
      views: [    
        _coverImage(params.patternLargeUrl),
        _title(params.name),
        _describe(params.synopsis),
        // _cardPrice(params.curPriceType.price),
          _cardPrice(params.curPrice),
        _logo(params.clubCoverUrl),
        _getClub(params.clubName),
        _finger('/images/icon-finger.png'),
        _qrcode(params.qrcode),
        _follow('长按查看更多'),
      ],
    });
  }
  shareClub(params) {
    console.log(params);
    return ({
      width: '600rpx',
      height: '710rpx',
      borderRadius: '8rpx',
      background: '#ffffff',
      views: [
        _coverImage(params.background),
        _rect(),
        _describe(params.info,'350rpx'),
        _logo(params.logo),
        _getClub(params.clubName),
        _finger('/images/icon-finger.png'),
        _qrcode(params.qrcode),
        _follow('长按查看更多')
      ],
    });
  }
  sharePost(params) {
    return ({
      width: '600rpx',
      height: '710rpx',
      borderRadius: '8rpx',
      background: '#ffffff',
      views: [
        _coverImage(params.cover),
        _rect(),
        _describe(params.info, '320rpx'),
        _logo(params.logo),
        _getClub(params.clubName),
        _finger('/images/icon-finger.png'),
        _qrcode(params.qrcode),
        _follow('长按查看更多'),
        _nickName(params.nickname),
        // // 头像
        // {
        //   type: 'image',
        //   url: params.avatar,
        //   css: {
        //     top: '316rpx',
        //     left: '30rpx',
        //     mode: 'aspectFill',
        //     width: '60rpx',
        //     height: '60rpx',
        //     borderRadius: '30rpx'
        //   }
        // },
        // 昵称
        // {
        //   type: 'text',
        //   text: '-- '+params.nickname,
        //   css: {
        //     width:'200rpx',
        //     bottom: '200rpx',
        //     right: '50rpx',
        //     fontSize: '28rpx',
        //     align:'right'
        //   },
        // },
        
        // // 标题
        // {
        //   type: 'text',
        //   text: params.contents[0].content,
        //   css: {
        //     width:'536rpx',
        //     top: '406rpx',
        //     left: '30rpx',
        //     fontSize: '36rpx',
        //     maxLines:2,
        //     lineHeight:'40rpx'
        //   }
        // }
      ],
    });
  }
  shareEquip(params) {
    console.log(params);
    let equipAuditStatus=[];
    if (params.equipAuditStatus == 'AUDIT'){
      equipAuditStatus = [{
        type: 'image',
        url: '/images/icon-equip-confirm.png',
        css: {
          top: '30rpx',
          left: '30rpx',
          mode: 'aspectFill',
          width: '128rpx',
          height: '40rpx',
        }
      }]
    }
    let appealContent=[];
    params.appealContent.map((item,index)=>{
      if(index >2) return;
      let rectBlue = {
        type: 'rect',
        css: {
          width: '4rpx',
          height: '12rpx',
          color: '#3b94fd',
          top: 332+index*48+'rpx',
          left:'30rpx'
        }
      }
      let name = {
        type: 'text',
        text: item.name,
        css: {
          left: '46rpx',
          top: 320+index * 48+'rpx',
          color: '#999',
          fontSize: '28rpx'
        }
      }
      let value = {
        type: 'text',
        text: item.value,
        css: {
          width:'340rpx',
          left: '220rpx',
          top: 320+index * 48 + 'rpx',
          fontSize: '28rpx',
          maxLines: 1
        },
      }
      appealContent = [...appealContent,rectBlue,name,value];
    })
    let brandName = params.brandName ? params.brandName : params.appealContent[0]?params.appealContent[0].value:'';
    let seriesName = params.seriesName ? params.seriesName : params.appealContent[1]?params.appealContent[1].value:'';
    let zan = params.likeNumberK > 0?'获得'+params.likeNumberK+'个赞':'';
    let chooseView;
    if(params.clubName){
      chooseView = [
        _logo(params.clubLogo),
        _getClub(params.clubName)
      ]
    }else{
      chooseView = [{
        type: 'text',
        text: '长按识别小程序二维码',
        css: {
          bottom: '100rpx',
          left: '30rpx',
          fontSize: '24rpx',
          color: '#333'
        },
      },
        {
          type: 'text',
          text: '进入小程序获取更多信息',
          css: {
            bottom: '60rpx',
            left: '30rpx',
            fontSize: '24rpx',
            color: '#333'
          },
        }]
    }
    console.log(chooseView);
    return ({
      width: '600rpx',
      height: '710rpx',
      borderRadius: '8rpx',
      background: '#ffffff',
      views: [
        _coverImage(params.background),
        _rect(),
        // _describe(brandName+' '+seriesName, '320rpx',2,'#333'),
        _finger('/images/icon-finger.png','50rpx'),
        _qrcode(params.qrcode,'50rpx'),
        ...appealContent,
        ...chooseView,
        ...equipAuditStatus,
        _nickName(params.userName),
        // _follow('长按查看更多'),
        // {
        //   type: 'text',
        //   text: zan,
        //   css: {
        //     bottom: '260rpx',
        //     left: '30rpx',
        //     fontSize: '28rpx',
        //     color:'#999'
        //   },
        // },
        // {
        // type: 'image',
        // url: params.userLogo,
        // css: {
        //   left: '280rpx',
        //   bottom: '200rpx',
        //   mode: 'aspectFit',
        //   width: '66rpx',
        //   height: '66rpx',
        //   borderRadius:'33rpx'
        //   }
        // },
        
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
  shareEvent(params) {
    console.log(params);
    let date = params.startAt+' 至 ' + params.endAt;
    let address = params.address.address;
    return ({
      width: '600rpx',
      height: '710rpx',
      borderRadius: '8rpx',
      background: '#ffffff',
      views: [
        _coverImage(params.cover),
        _rect(),
        _describe(params.name, '320rpx',2),
        _logo(params.clubLogo),
        _getClub(params.clubName),
        _finger('/images/icon-finger.png'),
        _qrcode(params.qrcode),
        _follow('长按查看更多'),
        {
          type: 'text',
          text: date,
          css: {
            top: '416rpx',
            left: '30rpx',
            fontSize: '24rpx',
            color: '#999'
          },
        },
        {
          type: 'text',
          text: address,
          css: {
            width: '536rpx',
            top: '456rpx',
            left: '30rpx',
            fontSize: '24rpx',
            color: '#999',
            maxLines: 2,
            lineHeight:'40rpx'
          },
        }
      ],
    });
  }
  shareParty(params) {
    return ({
      width: '600rpx',
      height: '710rpx',
      borderRadius: '8rpx',
      background: '#ffffff',
      views: [
        _coverImage(params.partyInfo && params.partyInfo.background || params.background || '/images/banner.png'),
        _rect(),
        // _title('参与攒局', '320rpx', 'left', '32rpx'),
        _describe(params.partyInfo && params.partyInfo.name || params.name, '320rpx'),
        _finger('/images/icon-finger.png'),
        _qrcode(params.qrcode),
        _logo(params.clubInfo && params.clubInfo.clubLogo || params.clubLogo),
        _getClub(params.clubInfo && params.clubInfo.clubName || params.clubName),
        _nickName(params.userInfo && params.userInfo.userName || params.userName),
        {
          type: 'image',
          url: '/images/icon-party-logo.png',
          css: {
            top: '40rpx',
            right: '40rpx',
            mode: 'aspectFill',
            width: '128rpx',
            height: '40rpx',
          }
        },
        // // 昵称
        // {
        //   type: 'text',
        //   text: params.userInfo && params.userInfo.userName || params.userName,
        //   css: {
        //     width: '300rpx',
        //     bottom: '200rpx',
        //     right: '50rpx',
        //     fontSize: '28rpx',
        //     align: 'right',
        //     maxLines: 1
        //   },
        // },
      ],
    });
  }
  shareVote(params) {
    return ({
      width: '600rpx',
      height: '710rpx',
      borderRadius: '8rpx',
      background: '#ffffff',
      views: [
        _coverImage(params.voteInfo&&params.voteInfo.background||params.background||'/images/banner.png'),
        _rect(),
        // _title('参与投票','320rpx','left','32rpx'),
        _describe(params.voteInfo&&params.voteInfo.name||params.name,'320rpx'),
        _finger('/images/icon-finger.png'),
        _qrcode(params.qrcode),
        _logo(params.clubInfo && params.clubInfo.clubLogo||params.clubLogo),
        _getClub(params.clubInfo && params.clubInfo.clubName||params.clubName),
        _nickName(params.userInfo && params.userInfo.userName || params.userName),
        {
          type: 'image',
          url: '/images/icon-vote-logo.png',
          css: {
            top: '40rpx',
            right: '40rpx',
            mode: 'aspectFill',
            width: '128rpx',
            height: '40rpx',
          }
        },
      ],
    });
  }
}

