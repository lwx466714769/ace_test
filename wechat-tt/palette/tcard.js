const startTop = 0;
const startLeft = 0;

// 封面
function _coverImage(url) {
  return ({
    type: 'image',
    url: url,
    css: {
      top: '270rpx',
      left: '60rpx',
      mode: 'scaleToFilx',
      width: '630rpx',
      height: '474rpx',
    }
  })
}
// 标题名
function _title(text) {
  return ({
    type: 'text',
    text: text,
    css: {
      top: '860rpx',
      left: '60rpx',
      width: '630rpx',
      fontSize: '28rpx',
      lineHeight: '50rpx'
    }
  })
}

// 描述
function _describe(text, colorType, argumentType) {
  return ({
    type: 'text',
    text: text,
    css: {
      left: '60rpx',
      width: '600rpx',
      top: argumentType ? argumentType: '920rpx',
      fontSize: '24rpx',
      lineHeight: '50rpx',
      letterSpacing: '3rpx',
      color: colorType ? "#000000" : "#666666"
    }
  })
}
//活动描述
function _describeEvent(text, colorType) {
  return ({
    type: 'text',
    text: text,
    css: {
      left: '60rpx',
      width: '600rpx',
      top: '1030rpx',
      fontSize: '24rpx',
      lineHeight: '50rpx',
      letterSpacing: '3rpx',
      color: colorType ? "#000000" : "#666666",
      maxLines: 2,
    }
  })
}

//  成本价格 
function _costPrice(costPrice) {
  return ({
    type: 'text',
    text: "¥" + costPrice,
    css: {
      left: '60rpx',
      width: '600rpx',
      bottom: '488rpx',
      fontSize: '28rpx',
      lineHeight: '50rpx',
      letterSpacing: '3rpx',
      color: '#999',
      textDecoration: 'line-through',
    }
  })
}

//  折扣价格
function _discountPrice(discountPrice) {
  return ({
    type: 'text',
    text: "¥" + discountPrice,
    css: {
      width: '600rpx',
      bottom: '488rpx',
      left: '530rpx',
      fontSize: '28rpx',
      lineHeight: '50rpx',
      letterSpacing: '3rpx',
      color: '#ea2811',
    }
  })
}

// 二维码
function _qrcode(url) {
  return ({
    type: 'image',
    url: url,
    css: {
      width: '128rpx',
      height: '128rpx',
      left: '60rpx',
      bottom: '300rpx'
    }
  })
}
// 短图二维码
function _qrcodeS(url) {
  return ({
    type: 'image',
    url: url,
    css: {
      width: '128rpx',
      height: '128rpx',
      left: '60rpx',
      bottom: '400rpx'
    }
  })
}

// 活动 时间
function _actionTime(text) {
  return ({
    type: 'text',
    text: text,
    css: {
      left: '60rpx',
      width: '403rpx',
      bottom: '220rpx',
      fontSize: '18rpx',
      lineHeight: '34rpx'
    }
  })
}

// 活动地址
function _address(text) {
  return ({
    type: 'text',
    text: text,
    css: {
      left: '60rpx',
      width: '403rpx',
      bottom: '152rpx',
      fontSize: '18rpx',
      lineHeight: '34rpx'
    }
  })
}
export default class LastMayday {
  shareEvent(params) {
    console.log(params);
    let date = params.startTime + ' 至 ' + params.endTime;
    let address = params.addresses.address;
    return ({
      width: '750rpx',
      height: '1624rpx',
      background: '#000',
      views: [
        // 标题
        {
          type: 'image',
          url: '/images/share_bg.png',
          css: {
            top: '0rpx',
            left: '0rpx',
            mode: 'scaleToFilx',
            width: '750rpx',
            height: '1624rpx',
          }
        },
        !!params.coverImg.url ? _coverImage(params.coverImg.url) : '',
        !!params.activityName ? _title(params.activityName) : '',
        !!date ? _describe(date,'','970rpx') : '',
        !!address ? _describeEvent(address) : '',
        !!params.qrcode ? _qrcode(params.qrcode) : '',
        {
          type: 'text',
          text: '长按小程序二维码',
          css: {
            bottom: '374rpx',
            left: '248rpx',
            fontSize: '28rpx',
            color: '#343434',
          }
        },
        // 文本
        {
          type: 'text',
          text: '进入 TripleT机车 获取更多资讯',
          css: {
            bottom: '324rpx',
            left: '248rpx',
            fontSize: '28rpx',
            color: '#343434',
          }
        },
        // 引号
        {
          type: 'image',
          url: '/images/yinhao.png',
          css: {
            top: '700rpx',
            left: '60rpx',
            mode: 'scaleToFilx',
            width: '146rpx',
            height: '124rpx',
          }
        }
      ],
    });
  }
  shareCard(params) {
    console.log('商品分享' + JSON.stringify(params));
    return ({
      width: '750rpx',
      height: '1624rpx',
      background: '#000',
      views: [
        // 标题
        {
          type: 'image',
          url: '/images/share_bg.png',
          css: {
            top: '0rpx',
            left: '0rpx',
            mode: 'scaleToFilx',
            width: '750rpx',
            height: '1624rpx',
          }
        },
        !!params.patternLargeUrl ? _coverImage(params.patternLargeUrl) : '',
        !!params.curName ? _title(params.curName) : '',
        !!params.synopsis ? _describe(params.synopsis) : '',
        !!params.initPrice && params.curPrice != params.initPrice ? _costPrice(params.initPrice / 100) : '',
        !!params.curPrice ? _discountPrice(params.curPrice / 100) : '',
        !!params.qrcode ? _qrcode(params.qrcode) : '',
        {
          type: 'text',
          text: '长按小程序二维码',
          css: {
            bottom: '374rpx',
            left: '248rpx',
            fontSize: '28rpx',
            color: '#343434',
          }
        },
        // 文本
        {
          type: 'text',
          text: '进入 TripleT机车 获取更多资讯',
          css: {
            bottom: '324rpx',
            left: '248rpx',
            fontSize: '28rpx',
            color: '#343434',
          }
        },
        // 引号
        {
          type: 'image',
          url: '/images/yinhao.png',
          css: {
            top: '700rpx',
            left: '60rpx',
            mode: 'scaleToFilx',
            width: '146rpx',
            height: '124rpx',
          }
        }
      ],
    });
  };
  sharePost(params) {
    console.log(params);
    return ({
      width: '750rpx',
      height: '1624rpx',
      background: '#000',
      views: [
        // 标题
        {
          type: 'image',
          url: '/images/share_bg.png',
          css: {
            top: '0rpx',
            left: '0rpx',
            mode: 'scaleToFilx',
            width: '750rpx',
            height: '1624rpx',
          }
        },
        !!params.cover ? _coverImage(params.cover) : '',
        !!params.title ? _title(params.title) : '',
        !!params.info ? _describe(params.info) : '',
        !!params.qrcode ? _qrcode(params.qrcode) : '',
        {
          type: 'text',
          text: '长按小程序二维码',
          css: {
            bottom: '374rpx',
            left: '248rpx',
            fontSize: '28rpx',
            color: '#343434',
          }
        },
        // 文本
        {
          type: 'text',
          text: '进入 TripleT机车 获取更多资讯',
          css: {
            bottom: '324rpx',
            left: '248rpx',
            fontSize: '28rpx',
            color: '#343434',
          }
        },
        // 引号
        {
          type: 'image',
          url: '/images/yinhao.png',
          css: {
            top: '700rpx',
            left: '60rpx',
            mode: 'scaleToFilx',
            width: '146rpx',
            height: '124rpx',
          }
        }
      ],
    });
  }
  shareVote(params) {
    console.log(params);
    return ({
      width: '750rpx',
      height: '1524rpx',
      background: '#000',
      views: [
        // 标题
        {
          type: 'image',
          url: '/images/share_bg.png',
          css: {
            top: '0rpx',
            left: '0rpx',
            mode: 'scaleToFilx',
            width: '750rpx',
            height: '1524rpx',
          }
        },
        _coverImage(params.voteInfo && params.voteInfo.background || params.background || 'https://img.acegear.com/382802b55176798524e03f9d0cea96dd4a6c2323/w700_1'),
        _title(params.voteInfo && params.voteInfo.name || params.name),
        // !!params.name ? _title(params.name) : '',
        !!params.joinEndTime ? _describe("有效期：" + params.joinEndTime) : '',
        // !!address ? _describeEvent(address) : '',
        // !!params.qrcode ? _qrcodeS(params.qrcode) : '',
        // !!costPrice ? _costPrice(costPrice) : '', 
        // !!discountPrice ? _discountPrice(discountPrice) : '',
        {
          type: 'text',
          text: '长按小程序二维码',
          css: {
            bottom: '454rpx',
            left: '248rpx',
            fontSize: '28rpx',
            color: '#343434',
          }
        },
        // 文本
        {
          type: 'text',
          text: '进入 TripleT机车 获取更多资讯',
          css: {
            bottom: '404rpx',
            left: '248rpx',
            fontSize: '28rpx',
            color: '#343434',
          }
        },
        // 引号
        {
          type: 'image',
          url: '/images/yinhao.png',
          css: {
            top: '700rpx',
            left: '60rpx',
            mode: 'scaleToFilx',
            width: '146rpx',
            height: '124rpx',
          }
        }
      ],
    });
  }
  shareParty(params) {
    console.log(params);
    let startTime = params.partyInfo && params.partyInfo.startTime || params.startTime;
    let endTime = params.partyInfo && params.partyInfo.endTime || params.endTime;
    let date;
    if (params.partyInfo) {
      date = formatDate(startTime, '.', true) + ' - ' + formatDate(endTime, '.', true);
    } else {
      date = startTime + ' - ' + endTime;
    }
    return ({
      width: '750rpx',
      height: '1524rpx',
      background: '#000',
      views: [
        // 标题
        {
          type: 'image',
          url: '/images/share_bg.png',
          css: {
            top: '0rpx',
            left: '0rpx',
            mode: 'scaleToFilx',
            width: '750rpx',
            height: '1524rpx',
          }
        },
        _coverImage(params.partyInfo && params.partyInfo.background || params.background || 'https://img.acegear.com/d20e16bb0095fef5753fc2a1087a1f3f9e72448d/w700_1'),
        _title(params.partyInfo && params.partyInfo.name || params.name),
        _describe(date),
        // !!params.cover ? _coverImage(params.cover) : '',
        // !!params.info ? _title(params.info) : '',
        // !!date ? _describe(date) : '',
        // !!address ? _describeEvent(address) : '',
        !!params.qrcode ? _qrcodeS(params.qrcode) : '',
        // !!costPrice ? _costPrice(costPrice) : '', 
        // !!discountPrice ? _discountPrice(discountPrice) : '',
        {
          type: 'text',
          text: '长按小程序二维码',
          css: {
            bottom: '454rpx',
            left: '248rpx',
            fontSize: '28rpx',
            color: '#343434',
          }
        },
        // 文本
        {
          type: 'text',
          text: '进入 TripleT机车 获取更多资讯',
          css: {
            bottom: '404rpx',
            left: '248rpx',
            fontSize: '28rpx',
            color: '#343434',
          }
        },
        // 引号
        {
          type: 'image',
          url: '/images/yinhao.png',
          css: {
            top: '700rpx',
            left: '60rpx',
            mode: 'scaleToFilx',
            width: '146rpx',
            height: '124rpx',
          }
        }
      ],
    });
  }
  shareAlbum(params) {
    console.log(params);
    let total = params.total + ' 张照片';
    return ({
      width: '750rpx',
      height: '1624rpx',
      background: '#000',
      views: [
        // 标题
        {
          type: 'image',
          url: '/images/share_bg.png',
          css: {
            top: '0rpx',
            left: '0rpx',
            mode: 'scaleToFilx',
            width: '750rpx',
            height: '1624rpx',
          }
        },
         _coverImage(params.cover),
        _title('【中国首个汽车文化潮流品牌】 Since 2010 ★Show Goes On★'),
        !!total ? total(date) : '',
        !!params.qrcode ? _qrcode(params.qrcode) : '',
        {
          type: 'text',
          text: '长按小程序二维码',
          css: {
            bottom: '374rpx',
            left: '248rpx',
            fontSize: '28rpx',
            color: '#343434',
          }
        },
        // 文本
        {
          type: 'text',
          text: '进入 TripleT机车 获取更多资讯',
          css: {
            bottom: '324rpx',
            left: '248rpx',
            fontSize: '28rpx',
            color: '#343434',
          }
        },
        // 引号
        {
          type: 'image',
          url: '/images/yinhao.png',
          css: {
            top: '700rpx',
            left: '60rpx',
            mode: 'scaleToFilx',
            width: '146rpx',
            height: '124rpx',
          }
        }
      ],
    });
  }
}