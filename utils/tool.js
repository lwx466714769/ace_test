
// // param 响应头，上下文，响应数据
// this.setCatchControl(headers, context, response.data)

// class HandleHeaders {
//   static get(headers) {
//     const headersData = {}
//     Object.keys(headers).forEach(key => {
//       headersData[key.toLowerCase()] = headers[key]
//     })
//     return headersData
//   }
//   // param 响应头，上下文，响应数据
//   setCatchControl(responseHeader, context, data) {
//     if (context.request.method.toLowerCase() === "get") {
//       const headers = HandleHeaders.get(responseHeader)
//       const cacheControl = headers["cache-control"]
//       if (cacheControl && cacheControl !== "no-cache") {
//         ApiAgent.cacheData = Object.assign(ApiAgent.cacheData, {
//           [context.request.url]: {
//             data,
//             expireTime: Number(cacheControl.split("=")[1] + '000'),
//             cacheTime: new Date().getTime(),
//           }
//         })
//       }
//     } else {
//       ApiAgent.cacheData = {}
//     }
//   }
//   // 处理网络缓存
//   // 判断缓存是否存在
//   // 判断缓存有没过期，在设置缓存时，比对当前时间和缓存时间，是否小于失效时间
//   // param 请求信息
//   handleCatchControl(request){
//     const cacheArr = ApiAgent.cacheData
//     if (Object.keys(cacheArr).length === 0)
//       return { isRequest: true }
//     let cache = {}
//     Object.keys(cacheArr).forEach(cacheArrKey => {
//       if (cacheArrKey === request.url) {
//         cache = cacheArr[cacheArrKey]
//       }
//     })
//     const newDate = new Date().getTime()
//     if (newDate - cache.cacheTime < expireTime) {
//       return { isRequest: false, data: cache.data }
//     }
//     return { isRequest: true }
//   }
//   handleRange(headers: any, url: string): string {
//     if (!headers)
//       return url

//     const header = HandleHeaders.get(headers)
//     const reg = /(=|\s)([0-9]*[\-][0-9]*)\/?/
//     let range: string = ""

//     if (header.range) {
//       range = header.range.match(reg)[2]
//     } else if (header["content-range"]) {
//       range = header["content-range"].match(reg)[2]
//     }

//     if (range)
//       return `${range}--${url}`
//     return url
//   }

// }
// // 公司项目封装了HTTP请求

// // 拦截请求，如果是GET请求，检查缓存，
// // 如果缓存没过期，将缓存返回出去，不再发请求
// // 如果缓存过期，发请求
// if (request.method.toLowerCase() === "get") {
//   // param 请求信息
//   const cache = this.handleCatchControl(request)
//   if (!cache.isRequest)
//     return this.listener.onApiResponse(request, 200, cache.data), sequence;   //将缓存返回给对应的请求
// }




// // 设置网络请求
// // GET请求缓存数据，其他请求清空数据
// // 数据格式：
// //如果同时发起多个`GET`请求，需要拼接之前缓存数据
// ApiAgent.cacheData = Object.assign(ApiAgent.cacheData, {
//   [context.request.url]: {    //api
//     data,   //响应数据
//     expireTime: Number(cacheControl.split("=")[1] + '000'),   //过期时间
//     cacheTime: new Date().getTime(),    //缓存时间
//   }
// })



