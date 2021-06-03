import Vue from 'vue'
import App from './App.vue'
import router from './router'
import './plugins/element.js'
import './assets/css/bace.css'
import './assets/font-awesome-4.7.0/css/font-awesome.min.css'
import TreeTable from 'vue-table-with-tree-grid'

// 富文本编译器
import VueQuillEditor from 'vue-quill-editor'
// 富文本编译器的样式
import 'quill/dist/quill.core.css' // import styles
import 'quill/dist/quill.snow.css' // for snow theme
import 'quill/dist/quill.bubble.css' // for bubble theme

import axios from 'axios'
axios.defaults.baseURL = 'http://127.0.0.1:8888/api/private/v1/'
// 通过axios请求拦截器添加token，保证拥有获取数据的权限
axios.interceptors.request.use(config => {
  // console.log(config)
  config.headers.Authorization = window.sessionStorage.getItem('token')
  return config
})
Vue.prototype.$http = axios

Vue.component('tree-table', TreeTable)
// 将富文本编辑器，注册为全局可用组件
Vue.use(VueQuillEditor)

Vue.config.productionTip = false

// 时间过滤器
Vue.filter('dataFormat', function(originVal) {
  const dt = new Date(originVal)

  // .padStart(2, '0') 当字符串不足两位时，在前面加0
  const y = dt.getFullYear()
  const m = (dt.getMonth() + 1 + '').padStart(2, '0')
  const d = (dt.getDate() + '').padStart(2, '0')

  const hh = (dt.getHours() + '').padStart(2, '0')
  const mm = (dt.getMinutes() + '').padStart(2, '0')
  const ss = (dt.getSeconds() + '').padStart(2, '0')

  return `${y}-${m}-${d} ${hh}:${mm}:${ss}`
})

new Vue({
  router,
  render: h => h(App)
}).$mount('#app')
