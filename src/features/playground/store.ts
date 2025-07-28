import { defineStore } from 'pinia'
import { ref, reactive } from 'vue'
import { compress, fileName2Language, uncompress } from '@/common/utils'
import { initFiles, type Files } from './initialFiles'

export interface File {
  name: string
  value: string
  language: string
}

export type Theme = 'light' | 'dark'

const getFilesFromUrl = () => {
  let files: Files | undefined
  try {
    const hashValue = window.location.hash.slice(1)
    if (hashValue && hashValue.length > 0) {
      const hash = uncompress(hashValue)
      const parsedFiles = JSON.parse(hash)
      if (parsedFiles && typeof parsedFiles === 'object') {
        files = {}
        Object.keys(parsedFiles).forEach((fileName) => {
          files![fileName] = {
            name: fileName,
            value: parsedFiles[fileName],
            language: fileName2Language(fileName),
          }
        })
        if (Object.keys(files).length === 0) files = undefined
      }
    }
  } catch (error) {
    console.error('从URL解析文件失败:', error)
    files = undefined
  }
  return files
}

export const usePlaygroundStore = defineStore(
  'playground',
  () => {
    // 状态
    const files = ref<Files>(getFilesFromUrl() || initFiles)
    const selectedFileName = ref('App.vue')
    const theme = ref<Theme>('light')

    // 方法
    function setSelectedFileName(fileName: string) {
      if (files.value[fileName]) {
        selectedFileName.value = fileName
      }
    }

    function setFiles(newFiles: Files) {
      const validatedFiles = reactive<Files>({})
      Object.keys(newFiles).forEach((fileName) => {
        const file = newFiles[fileName]
        if (file && typeof file === 'object' && file.value !== undefined) {
          validatedFiles[fileName] = {
            name: fileName,
            value: file.value,
            language: fileName2Language(fileName),
          }
        }
      })
      files.value = validatedFiles
      if (!files.value[selectedFileName.value]) {
        // 优先选中 App.vue
        if (files.value['App.vue']) {
          selectedFileName.value = 'App.vue'
        } else {
          const availableFiles = Object.keys(files.value)
          if (availableFiles.length > 0) {
            selectedFileName.value = availableFiles[0]
          }
        }
      }
    }

    function addFile(name: string) {
      const newFiles = { ...files.value }
      newFiles[name] = {
        name,
        language: fileName2Language(name),
        value: '',
      }
      setFiles(newFiles)
    }

    function removeFile(name: string) {
      const newFiles = { ...files.value }
      delete newFiles[name]
      // 如果删除的是当前选中的文件，且App.vue还存在，则优先选中App.vue
      const shouldSelectAppVue = selectedFileName.value === name && newFiles['App.vue']
      setFiles(newFiles)
      if (shouldSelectAppVue) {
        selectedFileName.value = 'App.vue'
      }
    }

    function updateFileName(oldFieldName: string, newFieldName: string) {
      if (!files.value[oldFieldName] || newFieldName === undefined || newFieldName === null) return
      const newFiles = { ...files.value }
      const fileData = newFiles[oldFieldName]
      delete newFiles[oldFieldName]
      newFiles[newFieldName] = {
        name: newFieldName,
        value: fileData.value,
        language: fileName2Language(newFieldName),
      }
      setFiles(newFiles)
      if (selectedFileName.value === oldFieldName) {
        selectedFileName.value = newFieldName
      }
    }

    function setTheme(newTheme: Theme) {
      theme.value = newTheme
    }

    // 新增：手动导出 hash
    function exportToHash() {
      const filesForHash: Record<string, string> = {}
      Object.keys(files.value).forEach((fileName) => {
        filesForHash[fileName] = files.value[fileName].value
      })
      const hash = compress(JSON.stringify(filesForHash))
      window.location.hash = hash
    }

    return {
      files,
      selectedFileName,
      theme,
      setSelectedFileName,
      setFiles,
      addFile,
      removeFile,
      updateFileName,
      setTheme,
      exportToHash, // 导出 hash 的方法
    }
  },
  {
    persist: true,
  },
)
