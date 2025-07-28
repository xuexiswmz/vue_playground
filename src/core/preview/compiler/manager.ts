import type { Ref } from 'vue'
import { simpleHash } from '../utils'

interface CompilerManagerOptions {
  files: Ref<Record<string, { value: string } | { [key: string]: unknown }>>
  compiledCode: Ref<string>
  error: Ref<string>
  compilerWorker: Ref<Worker | null>
  compileTimeout: Ref<number | null>
  lastUpdateHash: Ref<string>
  lastCompilationTime: Ref<number>
  compilationCount: Ref<number>
}

export function useCompilerManager({
  files,
  compiledCode,
  error,
  compilerWorker,
  compileTimeout,
  lastUpdateHash,
  lastCompilationTime,
  compilationCount,
}: CompilerManagerOptions) {
  // 防抖触发编译
  const debouncedTriggerCompilation = (force = false) => {
    if (compileTimeout.value !== null) {
      clearTimeout(compileTimeout.value)
    }
    compileTimeout.value = window.setTimeout(() => {
      triggerCompilation(force)
      compileTimeout.value = null
    }, 200) // 进一步减少延迟时间
  }

  // 触发编译
  const triggerCompilation = (force = false) => {
    if (!compilerWorker.value) {
      error.value = '编译器未就绪，请刷新页面重试'
      return
    }

    try {
      console.log('触发编译，force =', force)
      const now = Date.now()
      // 重置编译计数器的时间间隔改为1秒
      if (now - lastCompilationTime.value < 1000) {
        compilationCount.value++
        if (compilationCount.value > 10) {
          // 增加允许的编译次数
          error.value = '检测到可能的编译循环，请等待几秒后继续'
          setTimeout(() => {
            compilationCount.value = 0
            error.value = ''
          }, 2000)
          return
        }
      } else {
        compilationCount.value = 0
      }

      lastCompilationTime.value = now

      // 计算当前文件内容的哈希值
      const filesData = JSON.parse(JSON.stringify(files.value))
      const currentHash = simpleHash(JSON.stringify(filesData))
      console.log('文件内容哈希:', currentHash)

      // 检查内容是否发生变化
      const contentChanged = !lastUpdateHash.value || currentHash !== lastUpdateHash.value
      console.log('内容是否变化:', contentChanged, '上次哈希:', lastUpdateHash.value)

      if (contentChanged || force) {
        console.log('发送编译请求到worker...')
        lastUpdateHash.value = currentHash
        compiledCode.value = '' // 清空之前的编译结果
        compilerWorker.value.postMessage(filesData)
      } else {
        console.log('内容未变化且非强制编译，跳过')
      }
    } catch (postError) {
      error.value = `编译请求失败: ${postError instanceof Error ? postError.message : String(postError)}`
      console.error('编译错误:', postError)
    }
  }

  return {
    debouncedTriggerCompilation,
    triggerCompilation,
  }
}
