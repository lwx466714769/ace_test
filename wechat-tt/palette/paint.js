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
      mode: 'scaleToFilt',
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
      width: '640rpx',
      top: argumentType ? '990rpx' : '920rpx',
      fontSize: '28rpx',
      lineHeight: '50rpx',
      letterSpacing: '3rpx',
      color: colorType ? "#000000" : "#555555"
    }
  })
}

//  成本价格 
function _costPrice(costPrice) {
  return ({
    type: 'text',
    text: costPrice,
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
    text: discountPrice,
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
  palette(cover, title, describe, qrcode, costPrice, discountPrice, colorType, argumentType) {
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
        !!cover ? _coverImage(cover) : '', !!title ? _title(title) : '', !!describe ? _describe(describe, colorType, argumentType) : '', !!qrcode ? _qrcode(qrcode) : '', !!costPrice ? _costPrice(costPrice) : '', !!discountPrice ? _discountPrice(discountPrice) : '',
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
}