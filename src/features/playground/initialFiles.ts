import { fileName2Language } from '@/common/utils'

// 文件名常量
export const APP_COMPONENT_FILE_NAME = 'App.vue'
export const IMPORT_MAP_FILE_NAME = 'import-map.json'
export const ENTRY_FILE_NAME = 'main.ts'
export const APP_CSS_FILE_NAME = 'App.css'

// 定义文件接口
export interface File {
  name: string
  value: string
  language: string
}

export interface Files {
  [key: string]: File
}

// 模板内容
const importMapContent = `{
  "imports": {
    "vue": "https://unpkg.com/vue@3/dist/vue.esm-browser.prod.js",
    "vue-router": "https://unpkg.com/vue-router@4/dist/vue-router.esm-browser.js"
  }
}`

const mainContent = `import { createApp } from 'vue'
import App from './App.vue'
import './App.css'

// 获取挂载容器
const appContainer = document.querySelector('#app')

// 检查是否已有Vue应用实例挂载
if (appContainer && appContainer.__vue_app__) {
  // 卸载已存在的Vue应用实例
  appContainer.__vue_app__.unmount()
}

// 创建并挂载新的Vue应用实例
const app = createApp(App)
app.mount('#app')
`

const appContent = `<template>
  <div class="app">
    <img src="https://vuejs.org/images/logo.png" class="logo" alt="Vue logo" />
    <h1>Vue Playground</h1>
    <p>编辑 <code>App.vue</code> 开始使用</p>
  </div>
</template>

<script setup>
// 这里是组件逻辑
</script>

<style>
.app {
  text-align: center;
  padding: 2rem;
}

.logo {
  height: 6em;
  padding: 1.5em;
}

h1 {
  font-size: 2.5em;
  line-height: 1.1;
}
</style>
`

const appCssContent = `body {
  margin: 0;
  font-family: Inter, system-ui, Avenir, Helvetica, Arial, sans-serif;
  color: #213547;
  background-color: #ffffff;
}

#app {
  max-width: 1280px;
  margin: 0 auto;
  padding: 2rem;
}
`

// 初始文件
export const initFiles: Files = {
  [ENTRY_FILE_NAME]: {
    name: ENTRY_FILE_NAME,
    language: fileName2Language(ENTRY_FILE_NAME),
    value: mainContent,
  },
  [APP_COMPONENT_FILE_NAME]: {
    name: APP_COMPONENT_FILE_NAME,
    language: fileName2Language(APP_COMPONENT_FILE_NAME),
    value: appContent,
  },
  [APP_CSS_FILE_NAME]: {
    name: APP_CSS_FILE_NAME,
    language: fileName2Language(APP_CSS_FILE_NAME),
    value: appCssContent,
  },
  [IMPORT_MAP_FILE_NAME]: {
    name: IMPORT_MAP_FILE_NAME,
    language: fileName2Language(IMPORT_MAP_FILE_NAME),
    value: importMapContent,
  },
}
