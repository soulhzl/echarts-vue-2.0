import Vue from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'
import axios from 'axios'
import * as echarts from 'echarts'
import 'echarts/theme/vintage'
import './assets/theme/chalk'
import './assets/iconfont/iconfont.css'
import socketService from '@/utils/socket_service.js'
// 连接服务端
socketService.Instance.connect()

// axios.defaults.baseURL = 'http://127.0.0.1:7001/'
// axios.defaults.baseURL = 'http://soulhzl.top:8001/'
axios.defaults.baseURL = 'http://1.15.65.175:8001/'
Vue.prototype.ws = socketService.Instance
Vue.prototype.axios = axios
Vue.prototype.echarts = echarts
Vue.config.productionTip = false

new Vue({
  router,
  store,
  render: h => h(App)
}).$mount('#app')
