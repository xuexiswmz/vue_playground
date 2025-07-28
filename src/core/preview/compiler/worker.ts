import { babelTransform } from '../transform'
import { patchMainCode } from '../transform'
import { ENTRY_FILE_NAME } from '@/features/playground/initialFiles'

export const compile = (files: Record<string, unknown>) => {
  try {
    const main = files[ENTRY_FILE_NAME] as { value: string } | undefined
    if (!main || !main.value) {
      throw new Error(`入口文件 ${ENTRY_FILE_NAME} 不存在或为空`)
    }
    let mainCode = main.value
    mainCode = patchMainCode(mainCode)
    const result = babelTransform(ENTRY_FILE_NAME, mainCode, files)
    return result
  } catch (e) {
    throw new Error(`编译失败: ${e instanceof Error ? e.message : String(e)}`)
  }
}

self.addEventListener('message', async ({ data }) => {
  try {
    if (!data || typeof data !== 'object' || Object.keys(data).length === 0) {
      throw new Error('无效的编译数据')
    }
    const compiledCode = compile(data)
    if (!compiledCode || compiledCode.trim() === '') {
      throw new Error('编译生成的代码为空，请检查入口文件')
    }
    self.postMessage({
      code: compiledCode,
    })
  } catch (e) {
    let errorMessage = e instanceof Error ? e.message : 'Unknown compilation error'
    if (errorMessage.includes('inmemory://model')) {
      errorMessage = '编译错误: 无法找到内存文件引用。请检查导入语句和文件引用是否正确。'
    }
    self.postMessage({
      error: errorMessage,
    })
  }
})
