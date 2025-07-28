<template>
  <div :class="theme" style="height: 100vh; width: 100vw">
    <Header />
    <SplitPane direction="row" :default-sizes="[50, 50]">
      <template #pane0>
        <CodeEditor :preview-ref="previewRef" />
      </template>
      <template #pane1>
        <Preview ref="previewRef" />
      </template>
    </SplitPane>
  </div>
</template>

<script setup lang="ts">
import { storeToRefs } from 'pinia'
import { usePlaygroundStore } from '@/features/playground/store'
import Header from '@/layouts/Header/index.vue'
import CodeEditor from '@/core/editor/index.vue'
import { Preview } from '@/core/preview'
import { SplitPane } from '@/common/components/SplitPane'
import { ref } from 'vue'

// 使用Pinia store
const playgroundStore = usePlaygroundStore()
const { theme } = storeToRefs(playgroundStore)

// 创建对Preview组件的引用
const previewRef = ref(null)
</script>

<style>
html,
body,
#app {
  height: 100%;
  width: 100%;
  margin: 0;
  padding: 0;
}
.light {
  --text: #444;
  --bg: #fff;
  --border: #ddd;
  --box-shadow: #00000054;
  --primary: #00d8fe;
  --dialog: #fff;
  --editor-bg: #f5f5f5;
}

.dark {
  --text: #e0e0e0; /* 更亮的文本颜色，提高对比度 */
  --bg: #1a1a1a;
  --border: #383838;
  --box-shadow: #0000;
  --primary: #00d8fe;
  --dialog: #2a2a2a;
  --editor-bg: #1e1e1e; /* VS Code 风格的深色背景 */
}
</style>
