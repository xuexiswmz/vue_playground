// import './assets/main.css'

import { createApp } from 'vue'
import { createPinia } from 'pinia'
import piniaPluginPersistedstate from 'pinia-plugin-persistedstate'

// 添加全局错误处理
window.addEventListener('error', (event) => {
  // 忽略内存文件错误
  if (event.message && event.message.includes('inmemory://model')) {
    event.preventDefault()
    event.stopPropagation()
    return true
  }
  return false
})

// 添加未处理的 Promise 错误处理
window.addEventListener('unhandledrejection', (event) => {
  const reason = event.reason?.toString() || ''
  if (reason.includes('inmemory://model')) {
    event.preventDefault()
    return true
  }
  return false
})

import App from './App.vue'

const app = createApp(App)

const pinia = createPinia()
pinia.use(piniaPluginPersistedstate)
app.use(pinia)

app.mount('#app')
