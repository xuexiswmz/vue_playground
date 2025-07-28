import type { Ref } from 'vue'
import { simpleHash } from '../utils'

interface IframeManagerOptions {
  previewIframe: Ref<HTMLIFrameElement | null>
  compiledCode: Ref<string>
  error: Ref<string>
  isReloading: Ref<boolean>
  lastUpdateHash: Ref<string>
  resetCount: Ref<number>
  lastResetTime: Ref<number>
  lastUpdateCodeHash: Ref<string>
  files: Ref<Record<string, { value: string } | { [key: string]: unknown }>>
  compilerWorker: Ref<Worker | null>
}

export function useIframeManager({
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
}: IframeManagerOptions) {
  // 创建基础HTML模板
  const createHtmlTemplate = (scriptContent = '') => `
<!DOCTYPE html>
<html>
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <script type="importmap">
      {
        "imports": {
          "vue": "https://unpkg.com/vue@3.5.1/dist/vue.esm-browser.prod.js"
        }
      }
    </script>
    <style>
      body { margin: 0; }
      #app { height: 100%; width: 100%; }
      .error {
        color: red;
        padding: 10px;
        margin: 10px;
        border: 1px solid #ffcccc;
        border-radius: 4px;
      }
    </style>
  </head>
  <body>
    <div id="app"></div>
    <script type="module">
      window.onerror = function(msg, url, line, col, error) {
        const errorDiv = document.createElement('div');
        errorDiv.className = 'error';
        errorDiv.textContent = \`\${msg}\\nLine: \${line}\\nColumn: \${col}\`;
        document.body.appendChild(errorDiv);
        return false;
      };

      // 添加全局错误处理
      window.addEventListener('error', (event) => {
        if (event.message && event.message.includes('inmemory://model')) {
          event.preventDefault();
          return true;
        }
      });

      window.addEventListener('unhandledrejection', (event) => {
        const reason = event.reason?.toString() || '';
        if (reason.includes('inmemory://model')) {
          event.preventDefault();
          return true;
        }
      });

      ${scriptContent}
    </script>
  </body>
</html>`

  // 重置iframe
  const resetIframe = async () => {
    if (!previewIframe.value) return

    const now = Date.now()
    if (now - lastResetTime.value < 3000) {
      resetCount.value++
      if (resetCount.value > 2) {
        error.value = '检测到可能的无限重置循环，请等待几秒后继续'
        compiledCode.value = ''
        lastUpdateHash.value = ''
        setTimeout(() => {
          resetCount.value = 0
          error.value = ''
        }, 5000)
        return
      }
    } else {
      resetCount.value = 0
    }

    lastResetTime.value = now
    isReloading.value = true

    try {
      console.log('重置iframe...')

      // 创建一个空的HTML模板并设置到iframe
      const emptyTemplate = createHtmlTemplate()
      if (previewIframe.value) {
        console.log('设置初始空HTML模板到iframe')
        previewIframe.value.srcdoc = emptyTemplate
      }

      // 清空编译代码，准备重新编译
      compiledCode.value = ''
      lastUpdateCodeHash.value = ''

      isReloading.value = false

      if (compilerWorker.value) {
        console.log('发送编译请求到worker...')
        const filesData = JSON.parse(JSON.stringify(files.value))
        compilerWorker.value.postMessage(filesData)
      }
    } catch (err) {
      error.value = `重置预览窗口失败: ${err instanceof Error ? err.message : String(err)}`
      console.error('重置预览错误:', err)
      isReloading.value = false
    }
  }

  // 更新iframe内容
  const updateIframeContent = async (force = false) => {
    if (!previewIframe.value || isReloading.value) return
    if (!compiledCode.value) {
      console.warn('没有可用的编译代码，无法更新iframe')
      return
    }

    const codeHash = simpleHash(compiledCode.value)
    if (!force && codeHash === lastUpdateCodeHash.value) {
      console.log('代码未变化，跳过更新')
      return
    }

    console.log('更新iframe内容，代码哈希:', codeHash)
    lastUpdateCodeHash.value = codeHash

    try {
      // 使用HTML模板包装编译后的代码
      const htmlContent = createHtmlTemplate(compiledCode.value)
      console.log('生成HTML模板完成，长度:', htmlContent.length)

      // 更新iframe的srcdoc属性
      if (previewIframe.value) {
        console.log('设置iframe.srcdoc...')
        previewIframe.value.srcdoc = htmlContent
      }

      error.value = ''
    } catch (err) {
      error.value = `更新预览内容失败: ${err instanceof Error ? err.message : String(err)}`
      console.error('更新预览错误:', err)
      await resetIframe()
    }
  }

  return {
    resetIframe,
    updateIframeContent,
  }
}
