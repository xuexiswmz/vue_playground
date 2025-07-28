<template>
  <div class="code-editor-container">
    <FileNameList :preview-ref="previewRef" />
    <Editor v-if="currentFile" :file="currentFile" @change="onEditorChange" />
    <div v-else style="padding: 20px; color: red">无法加载文件</div>
  </div>
</template>

<script setup lang="ts">
// 定义组件名称
defineOptions({
  name: 'CodeEditorComponent',
})

import { computed, watch, ref } from 'vue'
import { storeToRefs } from 'pinia'
import { usePlaygroundStore } from '@/features/playground/store'
import Editor from './Editor/index.vue'
import FileNameList from './FileNameList/index.vue'

// 接收预览组件引用
defineProps({
  previewRef: {
    type: Object,
    default: null,
  },
})

// 使用Pinia store
const playgroundStore = usePlaygroundStore()
const { files, selectedFileName } = storeToRefs(playgroundStore)

// 防抖计时器
let debounceTimer: number | null = null
// 当前编辑内容暂存
const pendingContent = ref<string | undefined>(undefined)
// 防抖延迟时间 (毫秒)
const DEBOUNCE_DELAY = 800

// 当前选中的文件
const currentFile = computed(() => {
  // 确保选中的文件存在
  if (!files.value[selectedFileName.value]) {
    console.warn(`选中的文件不存在: ${selectedFileName.value}`)
    return null
  }

  // 再次确认文件名和对象的name属性一致
  const file = files.value[selectedFileName.value]
  if (file.name !== selectedFileName.value) {
    console.warn(`文件名不匹配: ${file.name} != ${selectedFileName.value}`)
  }

  return files.value[selectedFileName.value]
})

// 实际应用内容变化的函数
const applyContentChange = (value: string) => {
  if (currentFile.value && value !== currentFile.value.value) {
    // 直接更新文件内容，保持响应式
    const newFiles = { ...files.value }
    newFiles[currentFile.value.name] = {
      name: currentFile.value.name,
      value: value,
      language: currentFile.value.language,
    }
    playgroundStore.setFiles(newFiles)
  }
}

// 编辑器内容变化处理函数 (带防抖)
const onEditorChange = (value?: string) => {
  if (value === undefined || !currentFile.value) return

  // 保存当前编辑内容
  pendingContent.value = value

  // 清除之前的防抖计时器
  if (debounceTimer !== null) {
    clearTimeout(debounceTimer)
  }

  // 设置新的防抖计时器
  debounceTimer = window.setTimeout(() => {
    // 确保在切换文件时也应用最后的更改
    if (pendingContent.value !== undefined) {
      applyContentChange(pendingContent.value)
      pendingContent.value = undefined
    }
    debounceTimer = null
  }, DEBOUNCE_DELAY)
}

// 监听文件选择变化，确保文件存在
watch(
  selectedFileName,
  (newFileName) => {
    if (!files.value[newFileName]) {
      const availableFiles = Object.keys(files.value)
      if (availableFiles.length > 0) {
        playgroundStore.setSelectedFileName(availableFiles[0])
      }
    }

    // 在切换文件前，确保应用任何待处理的更改
    if (debounceTimer !== null) {
      clearTimeout(debounceTimer)
      debounceTimer = null
      if (pendingContent.value !== undefined) {
        applyContentChange(pendingContent.value)
        pendingContent.value = undefined
      }
    }
  },
  { immediate: true },
)
</script>

<style scoped>
/* 让 Editor 区域填满剩余空间 */
.code-editor-container {
  display: flex;
  flex-direction: column;
  height: 100%;
  width: 100%;
  background-color: var(--editor-bg);
}
</style>
