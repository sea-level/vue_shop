import Vue from 'vue'
import App from './App.vue'
import router from './router'
import './plugins/element.js'
// import './assets/css/normalize.css'
import './assets/fonts/iconfont.css'
import './assets/css/global.css'
import TreeTable from 'vue-table-with-tree-grid'

// 导入富文本编辑器
import VueQuillEditor from 'vue-quill-editor'
// 导入富文本编辑器对应的样式
import 'quill/dist/quill.core.css'
import 'quill/dist/quill.snow.css'
import 'quill/dist/quill.bubble.css'

import axios from 'axios'
// 配置请求根路径
axios.defaults.baseURL = 'http://127.0.0.1:8888/api/private/v1/'
// 请求拦截器 自动为请求添加token
axios.interceptors.request.use(config => {
  // console.log(config)
  config.headers.Authorization = window.sessionStorage.getItem('token')
  return config
})
Vue.prototype.$http = axios

Vue.config.productionTip = false
// 注册为全局可用的组件
Vue.component('tree-table',TreeTable)
// 将富文本编辑器 注册为全局可用的组件
Vue.use(VueQuillEditor)

// 时间格式化过滤器
Vue.filter('dateFormat',function(originVal){
  const dt = new Date(originVal)
 const y = dt.getFullYear()
//  padStart(总长度,如果不足总长度用这个来填充)
// getMonth()是时间数值 + '' 转换成字符串
 const m = (dt.getMonth() + 1 + '').padStart(2,'0')
 const d =(dt.getDate() + '').padStart(2,'0')
 const hh= (dt.getHours() + '').padStart(2,'0')
 const mm = (dt.getMinutes() + '').padStart(2,'0')
 const ss = (dt.getSeconds() + '').padStart(2,'0')

 return `${y}-${m}-${d} ${hh}:${mm}:${ss}`
})

new Vue({
  router,
  render: h => h(App)
}).$mount('#app')
