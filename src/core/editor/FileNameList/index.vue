<template>
  <div class="tabs">
    <div
      v-for="name in displayTabs"
      :key="name"
      :class="['tab-item', selectedFileName === name ? 'actived' : '']"
      @click="setSelectedFileName(name)"
      @dblclick="handleDoubleClick(name)"
    >
      <template v-if="editingName === name">
        <input
          ref="inputRef"
          class="tabs-item-input"
          v-model="inputValue"
          @blur="handleBlur(name)"
          @keyup.enter="handleRename(name)"
        />
      </template>
      <template v-else>
        <span>{{ name }}</span>
        <span v-if="canClose(name)" class="close" @click.stop="removeFile(name)" title="关闭"
          >×</span
        >
      </template>
    </div>
    <div class="add" @click="addTab">+</div>
  </div>
</template>

<script setup lang="ts">
defineOptions({
  name: 'FileNameListComponent',
})
import { ref, computed, nextTick } from 'vue'
import { storeToRefs } from 'pinia'
import { usePlaygroundStore } from '@/features/playground/store'
import { APP_COMPONENT_FILE_NAME, IMPORT_MAP_FILE_NAME } from '@/features/playground/initialFiles'
import { message } from 'ant-design-vue'

// 接收预览组件引用
const props = defineProps({
  previewRef: {
    type: Object,
    default: null,
  },
})

// 刷新预览的方法
const refreshPreview = () => {
  if (props.previewRef && props.previewRef.refreshPreview) {
    console.log('准备刷新预览...')
    // 增加延迟时间，确保文件操作已完成
    setTimeout(() => {
      console.log('调用预览组件的刷新方法')
      props.previewRef.refreshPreview()
    }, 500) // 增加到500ms
  } else {
    console.warn('预览组件引用不可用，无法刷新预览')
  }
}

const playgroundStore = usePlaygroundStore()
const { files, selectedFileName } = storeToRefs(playgroundStore)

const HIDDEN_FILES = ['main.ts', 'App.css']

const displayTabs = computed(() =>
  Object.keys(files.value).filter((name) => !HIDDEN_FILES.includes(name)),
)

const setSelectedFileName = (name: string) => {
  playgroundStore.setSelectedFileName(name)
}

const VUE_TEMPLATE = `<template>\n  <div>\n    <slot />\n  </div>\n</template>\n\n<script setup>\n<\/script>\n`

const SUPPORTED_EXTS = ['.vue', '.js', '.ts', '.json', '.css', '.jsx', '.tsx']

const addTab = () => {
  const newName = window.prompt('请输入新文件名（如 Comp1.vue 或 Comp1.js）')
  if (!newName) return
  if (files.value[newName]) {
    alert('文件名已存在！')
    return
  }
  const ext = SUPPORTED_EXTS.find((ext) => newName.endsWith(ext))
  if (!ext) {
    message.warning('只支持 .vue, .js, .ts, .json, .css, .tsx, .jsx 文件')
    return
  }

  // 根据文件类型设置初始内容
  let value = ''
  if (newName.endsWith('.vue')) {
    value = VUE_TEMPLATE
  } else if (newName.endsWith('.js') || newName.endsWith('.ts')) {
    value = '// 在这里编写代码\n\n'
  } else if (newName.endsWith('.json')) {
    value = '{\n  \n}'
  } else if (newName.endsWith('.css')) {
    value = '/* 在这里编写样式 */\n\n'
  }

  console.log('添加新文件:', newName)

  // 先添加空文件
  playgroundStore.addFile(newName)

  // 然后设置文件内容
  playgroundStore.setFiles({
    ...files.value,
    [newName]: {
      name: newName,
      value,
      language: newName.split('.').pop() || '',
    },
  })

  // 选中新文件
  playgroundStore.setSelectedFileName(newName)

  // 导出当前状态到URL hash
  playgroundStore.exportToHash()

  console.log('文件添加完成，准备刷新预览')

  // 刷新预览 - 增加延迟确保文件操作完成
  setTimeout(() => {
    refreshPreview()
  }, 100)
}

// 只有非 App.vue 的 .vue 文件可以关闭
const canClose = (name: string) => name !== APP_COMPONENT_FILE_NAME && name !== IMPORT_MAP_FILE_NAME

const removeFile = (name: string) => {
  if (window.confirm(`你确定要删除 ${name}吗?`)) {
    playgroundStore.removeFile(name)

    // 导出当前状态到URL hash
    playgroundStore.exportToHash()

    // 刷新预览
    refreshPreview()
  }
}

const editingName = ref<string | null>(null)
const inputValue = ref('')
const inputRef = ref<HTMLInputElement | null>(null)

function handleDoubleClick(name: string) {
  editingName.value = name
  inputValue.value = name
  nextTick(() => {
    inputRef.value?.focus()
    inputRef.value?.select()
  })
}

function handleRename(name: string) {
  const newName = inputValue.value.trim()
  if (!newName || newName === name || files.value[newName]) {
    editingName.value = null
    return
  }
  const ext = SUPPORTED_EXTS.find((ext) => newName.endsWith(ext))
  if (!ext) {
    message.warning('只支持 .vue, .js, .ts, .json, .css, .jsx, .tsx 文件')
    return
  }
  playgroundStore.updateFileName(name, newName)
  editingName.value = null

  // 导出当前状态到URL hash
  playgroundStore.exportToHash()

  // 刷新预览
  refreshPreview()
}

function handleBlur(name: string) {
  handleRename(name)
  editingName.value = null
}
</script>

<style scoped>
.tabs {
  display: flex;
  align-items: center;
  height: 38px;
  border-bottom: 1px solid var(--border);
  background: var(--editor-bg);
  color: var(--text);
  overflow-x: auto;
  overflow-y: hidden;
  white-space: nowrap;
  scrollbar-width: thin;
  scrollbar-color: var(--border) transparent;
  max-height: 38px;
}
.tabs::-webkit-scrollbar {
  height: 6px;
  background: transparent;
}
.tabs::-webkit-scrollbar-thumb {
  background: var(--border);
  border-radius: 3px;
}
.tabs::-webkit-scrollbar-vertical {
  display: none;
}
.tab-item {
  display: inline-flex;
  padding: 0 16px;
  height: 100%;
  align-items: center;
  cursor: pointer;
  border-bottom: 2px solid transparent;
  position: relative;
  font-size: 15px;
}
.tab-item.actived {
  color: var(--primary);
  font-weight: bold;
  border-bottom: 2px solid var(--primary);
  background: color-mix(in srgb, var(--editor-bg) 90%, var(--border));
}
.close {
  margin-left: 8px;
  color: #aaa;
  cursor: pointer;
  font-size: 14px;
}
.dark .close {
  color: #ddd; /* 暗色主题下更亮的关闭按钮颜色 */
}
.add {
  margin-left: 8px;
  font-size: 18px;
  cursor: pointer;
  color: var(--primary);
  user-select: none;
}
</style>
