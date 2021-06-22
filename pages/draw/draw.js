// pages/draw/draw.js
import { shareDrawClub} from '../../utils/utils.js'
Page({

  /**
   * 页面的初始数据
   */
  data: {

  },
  onLoad(){
    let page = getCurrentPages().pop();
    console.log(page);
    console.log(page.route);
  },
  draw(){
    let ctx = wx.createCanvasContext('myCanvas', this);
    let img1 = 'https://img.acegear.com/382802b55176798524e03f9d0cea96dd4a6c2323/w700_1';
    let img2 = 'https://img.acegear.com/0a6fa14f30cc290a09a3629997107fdbf1fe442b/w700_1';
    let text = '俱乐部'
    // this.startDraw(ctx,img1,img2,text).then((img)=>{
    //   console.log(img);
    //   this.setData({img})
    // })
    let _this = this;
    let promises = [img1,img2].map((img)=>{
      return new Promise((resolve, reject) => {
        wx.getImageInfo({
          src: img,
          success: function (res) {
            resolve(res.path);
          }
        })
      })
    })
    console.log(promises);
    Promise.all(promises).then((img)=>{
      this.startDraw(ctx,img[0],img[1],text);
    })
    // this.getImageInfo(img1).then((img)=>{

    // })
    // this.startDraw1()
  },
  getImgInfo(img){
    
    
  },
  startDraw1() {
    let _this = this;
    let ctx = wx.createCanvasContext('myCanvas', this);
    // let img1 = 'https://img.acegear.com/382802b55176798524e03f9d0cea96dd4a6c2323/w700_1';
    // let img2 = 'https://img.acegear.com/0a6fa14f30cc290a09a3629997107fdbf1fe442b/w700_1';
    wx.getImageInfo({
      src: img1,
      success:function(res){
        console.log(res);
        img1 = res.path;
        let text = '俱乐部'
        let logo_w = 26;
        let logo_x = 15;
        let canvas_w = 375;
        let canvas_h = 210;
        console.log(ctx);
        ctx.drawImage(img1, 0, 0, canvas_w, canvas_h);
        ctx.setGlobalAlpha(0.5);
        ctx.rect(0, 0, canvas_w, canvas_h);
        ctx.setFillStyle('#000');
        ctx.fill();
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
        ctx.setFontSize(12);
        ctx.setFillStyle('#fff');
        ctx.fillText(text, logo_x * 2 + logo_w - 2, logo_x + logo_w / 2 + 6);
        

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
              console.log(res);
              // resolve(res.tempFilePath);
              _this.setData({ img: res.tempFilePath })
            }
          }, this)
        }, 1000)
      }
    })
      
  },
  startDraw(ctx,img1,img2,text){
    let _this = this;
    return new Promise((resolve,reject)=>{
      let logo_w = 26;
      let logo_x = 15;
      let canvas_w = 375;
      let canvas_h = 210;
      console.log(ctx);
      ctx.drawImage(img1, 0, 0, canvas_w, canvas_h);
      ctx.setGlobalAlpha(0.5);
      ctx.rect(0, 0, canvas_w,canvas_h);
      ctx.setFillStyle('#000');
      ctx.fill();
      ctx.setGlobalAlpha(1);
      ctx.beginPath();
      ctx.save();
      ctx.arc(logo_x + logo_w/2, logo_x + logo_w/2, logo_w/2,0, Math.PI * 2);
      ctx.setFillStyle('#f00');
      ctx.fill();
      ctx.clip();
      ctx.drawImage(img2, logo_x, logo_x, logo_w, logo_w);
      ctx.restore();
      ctx.beginPath();
      ctx.setFontSize(12);
      ctx.setFillStyle('#fff');
      ctx.fillText(text,logo_x*2+logo_w-2,logo_x+logo_w/2+6);
      ctx.drawImage('/images/icon-vote-stamp.png', 200, 150, 44, 44);
      ctx.setStrokeStyle('red')
      ctx.strokeRect(30, 30, 150, 200)
      ctx.draw();
      setTimeout(()=>{
        wx.canvasToTempFilePath({
          canvasId: 'myCanvas',
          x: 0,
          y: 0,
          width: 375,
          height: 210,
          destWidth: 750,
          destHeight: 420,
          success(res) {
            console.log(res);
            // resolve(res.tempFilePath);
             _this.setData({ img: res.tempFilePath })
          }
        }, this)
      },1000)
    })
    
      
  },
  onShareAppMessage: function () {
    let {img} = this.data;
    console.log(this.data.img);
    return {
      title:'攒局',
      imageUrl:img,
      path:'/pages/draw/draw'
    }
  }
})