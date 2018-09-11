import { fetch } from '../../utils/utils.js'
import urls from '../../utils/urls.js'

Component({
  options: {
    multipleSlots: true // 在组件定义时的选项中启用多slot支持
  },
  
  properties: {
    mask: {
      type: Boolean,
      value: false
    },
  },

  data: {
    // 弹窗显示控制
    isShow: false,
    lock: false,
    phone: null,
    code: null,
    animation: false,
    countdown: 0,
    hide_error_phone: true,
    hide_error_code: true,
    animationData: {},
  },

  methods: {
    hide() {
      var animation = wx.createAnimation({
        duration: 80,
        timingFunction: 'ease-in'
      })
      animation.opacity(1).step()
      this.setData({
        animationData: animation.export()
      })
      animation.opacity(0).step()
      this.setData({ animationData: animation.export() })
      setTimeout(function () {
        this.setData({
          isShow: false,
          phone: null,
          code: null,
          lock: false,
          hide_error_phone: true,
          hide_error_code: true,
        })
      }.bind(this), 80)
    },

    show() {
      var animation = wx.createAnimation({
        duration: 80,
        timingFunction: 'ease-in'
      })
      animation.opacity(0.6).step()
      // 用setData改变当前动画
      this.setData({
        // 通过export()方法导出数据
        animationData: animation.export(),
        isShow: true
      })
      // 动画结束时
      animation.opacity(1).step()
      setTimeout(function() {
        this.setData({
          animationData: animation.export()
        })
      }.bind(this), 10)
    },

    // 登录
    login(e) {
      if (e.detail.rawData) {
        let { phone, code, hide_error_phone } = this.data
        if (phone && code && hide_error_phone) {
          this.verifyPhone(res => this.triggerEvent('login', res))
        }
      }
    },

    // 验证手机号
    verifyPhone(cb) {
      let { phone, code } = this.data
      let url = `${urls._phone}/${phone}`
      let data = { code: code + '' }
      let success = body => {
        this.hide()
        !!cb && cb({ phone, code })
      }
      let fail = body => {
        if (body.code === 1012) {
          this.setData({ hide_error_code: false })
        }
      }
      return fetch({ url, method: 'PUT', data, success, fail })
    },

    sendVerifyCode(e) {
      let { lock, countdown } = this.data
      if (lock || countdown) { return }

      let phone = this.data.phone + ''
      let testPhone = /^[1][3,4,5,7,8][0-9]{9}$/.test(phone)
      if (!testPhone) {
        return this.setData({ hide_error_phone: false })
      } else {
        this.setData({ hide_error_phone: true })
      }
      this.setData({ countdown: '正在发送', lock: true })

      let url = urls._phone
      let data = { phone }
      let success = body => {
        let countdown = 60
        let timer = setInterval(() => {
          if (countdown > 0) {
            countdown -= 1
            this.setData({ countdown })
          } else {
            this.setData({ lock: false, countdown: 100 })
            clearInterval(timer)
          }
        }, 1000)
      }
      let fail = body => {
        this.setData({ lock: false, countdown: 100 })
        wx.showToast({
          title: '发送失败',
          icon: 'none',
          duration: 800
        })
      }

      fetch({ url, method: 'POST', data, success, fail })
    },
    modifyPhone(e) {
      let phone = e.detail.value
      this.setData({ phone })
    },
    modifyCode(e) {
      let code = e.detail.value
      this.setData({ code })
    },
    
    cancel() {
      this.hide()
      //触发取消回调
      this.triggerEvent("cancel")
    },
    confirm(e) {
      this.hide()
      this.triggerEvent("confirm")
    }
  }
})