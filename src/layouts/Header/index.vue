<template>
  <div class="header">
    <div class="logo">
      <img alt="logo" src="../../assets/logo.svg" />
      <span>Vue Playground</span>
    </div>
    <div class="links">
      <BulbOutlined
        v-if="theme === 'light'"
        title="切换暗色主题"
        class="theme"
        @click="playgroundStore.setTheme('dark')"
      />
      <BulbFilled
        v-if="theme === 'dark'"
        title="切换亮色主题"
        class="theme"
        @click="playgroundStore.setTheme('light')"
      />
      <ShareAltOutlined style="margin-left: 10px" @click="shareLink" />
      <DownloadOutlined style="margin-left: 10px" @click="download" />
    </div>
  </div>
</template>

<script setup lang="ts">
// 定义组件名称
defineOptions({
  name: 'HeaderComponent',
})

import { storeToRefs } from 'pinia'
import { usePlaygroundStore } from '@/features/playground/store'
import { BulbOutlined, BulbFilled, ShareAltOutlined, DownloadOutlined } from '@ant-design/icons-vue'
import { message } from 'ant-design-vue'
import copy from 'copy-to-clipboard'
import { downloadFiles } from '@/common/utils'

// 使用Pinia store
const playgroundStore = usePlaygroundStore()
const { theme, files } = storeToRefs(playgroundStore)

// 分享链接
const shareLink = () => {
  playgroundStore.exportToHash() // 先导出 hash
  setTimeout(() => {
    copy(window.location.href)
    message.success('分享链接已复制。')
  }, 100) // 稍微延迟，确保 hash 已更新
}

// 下载文件
const download = async () => {
  await downloadFiles(files.value)
  message.success('下载完成')
}
</script>

<style scoped>
.header {
  height: 50px;
  min-height: 50px;
  flex-shrink: 0;
  padding: 0 20px;
  box-sizing: border-box;
  border-bottom: 1px solid var(--border);
  background-color: var(--bg);
  color: var(--text);

  display: flex;
  align-items: center;
  justify-content: space-between;
}

.logo {
  display: flex;
  font-size: 20px;
  align-items: center;
}

.logo img {
  height: 24px;
  margin-right: 10px;
}

.theme {
  cursor: pointer;
}
</style>
