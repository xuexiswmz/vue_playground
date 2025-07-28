<!-- Preview.vue -->
<script setup lang="ts">
defineOptions({ name: 'PreviewComponent' })
import { storeToRefs } from 'pinia'
import { ref, onMounted, onBeforeUnmount, watch, nextTick } from 'vue'
import { usePlaygroundStore } from '@/features/playground/store'
import Message from '@/common/components/Message/index.vue'
import { useIframeManager } from '../iframe'
import { useCompilerManager } from '../compiler'

const playgroundStore = usePlaygroundStore()
const { files } = storeToRefs(playgroundStore)

// 状态
const previewIframe = ref<HTMLIFrameElement | null>(null)
const compiledCode = ref('')
const error = ref('')
const isReloading = ref(false)
const lastUpdateHash = ref('')
const resetCount = ref(0)
const lastResetTime = ref(0)
const lastUpdateCodeHash = ref('')
const compilerWorker = ref<Worker | null>(null)
const lastCompilationTime = ref(0)
const compilationCount = ref(0)
const compileTimeout = ref<number | null>(null)
const isUpdating = ref(false)

// 编译管理
const { debouncedTriggerCompilation, triggerCompilation } = useCompilerManager({
  files,
  compiledCode,
  error,
  compilerWorker,
  compileTimeout,
  lastUpdateHash,
  lastCompilationTime,
  compilationCount,
})

// iframe 管理
const { resetIframe, updateIframeContent } = useIframeManager({
  previewIframe,
  compiledCode,
  error,
  isReloading,
  lastUpdateHash,
  resetCount,
  lastResetTime,
  lastUpdateCodeHash,
  files,
  compilerWorker,
})

// 强制刷新预览的方法
const refreshPreview = async () => {
  if (!compilerWorker.value || isUpdating.value) return

  isUpdating.value = true
  try {
    console.log('开始强制刷新预览...')
    // 先重置iframe
    await resetIframe()
    await nextTick()
    // 然后强制触发编译
    triggerCompilation(true)
    console.log('强制编译触发完成')
  } catch (err) {
    console.error('刷新预览时出错:', err)
  } finally {
    isUpdating.value = false
  }
}

// 暴露方法给外部组件使用
defineExpose({
  refreshPreview,
})

// 监听文件变化
watch(
  () => files.value,
  async () => {
    if (isUpdating.value || !compilerWorker.value) return
    isUpdating.value = true
    try {
      await nextTick()
      debouncedTriggerCompilation()
    } finally {
      isUpdating.value = false
    }
  },
  {
    deep: true,
  },
)

// 监听编译结果
watch(compiledCode, async (newCode) => {
  if (!newCode || error.value || isUpdating.value) return
  console.log('编译代码已更新，准备更新预览...')
  isUpdating.value = true
  try {
    await nextTick()
    await updateIframeContent()
    console.log('预览更新完成')
  } catch (err) {
    console.error('更新预览时出错:', err)
  } finally {
    isUpdating.value = false
  }
})

// 生命周期
onMounted(async () => {
  // 创建编译器 Worker
  compilerWorker.value = new Worker(new URL('../compiler/worker.ts', import.meta.url), {
    type: 'module',
  })

  // 监听编译结果
  compilerWorker.value.addEventListener('message', async (event) => {
    const { code, error: compileError } = event.data
    if (compileError) {
      error.value = compileError
      console.error('编译错误:', compileError)
      return
    }
    if (code && !isUpdating.value) {
      console.log('收到编译结果，代码长度:', code.length)
      isUpdating.value = true
      try {
        await nextTick()
        compiledCode.value = code
      } finally {
        isUpdating.value = false
      }
    }
  })

  // 初始化 iframe
  await resetIframe()
})

onBeforeUnmount(() => {
  if (compilerWorker.value) {
    compilerWorker.value.terminate()
  }
  if (compileTimeout.value) {
    clearTimeout(compileTimeout.value)
  }
})
</script>

<template>
  <div class="preview-container">
    <iframe
      ref="previewIframe"
      sandbox="allow-scripts allow-forms allow-modals allow-popups"
      class="preview-iframe"
    ></iframe>
    <Message v-if="error" type="error" :content="error"></Message>
  </div>
</template>

<style scoped>
.preview-container {
  height: 100%;
  width: 100%;
  position: relative;
  background-color: white;
}

.preview-iframe {
  height: 100%;
  width: 100%;
  border: none;
}
</style>
