<template>
  <vue-monaco-editor
    v-model:value="modelValue"
    :language="getLanguage()"
    :theme="isDarkTheme ? 'vs-dark' : 'vs'"
    :options="MONACO_EDITOR_OPTIONS"
    @mount="handleMount"
    class="monaco-editor-wrapper"
    style="height: 100%; width: 100%"
  />
</template>

<script lang="ts" setup>
import { ref, shallowRef, watch, computed } from 'vue'
import { storeToRefs } from 'pinia'
import { usePlaygroundStore } from '@/features/playground/store'
import { VueMonacoEditor } from '@guolao/vue-monaco-editor'
import type * as monaco from 'monaco-editor'

defineOptions({ name: 'MonacoEditorComponent' })

const playgroundStore = usePlaygroundStore()
const { theme } = storeToRefs(playgroundStore)

export interface EditorFile {
  name: string
  value: string
  language: string
}

const props = defineProps<{
  file: EditorFile
  options?: Record<string, unknown>
}>()

const emit = defineEmits<{
  (e: 'change', value?: string): void
}>()

const modelValue = ref(props.file.value)
const editorRef = shallowRef<monaco.editor.IStandaloneCodeEditor | null>(null)

watch(
  () => props.file,
  (newFile) => {
    modelValue.value = newFile.value
  },
  { immediate: true },
)

watch(modelValue, (newValue) => {
  if (newValue !== props.file.value) {
    emit('change', newValue)
  }
})

const isDarkTheme = computed(() => theme.value === 'dark')

const MONACO_EDITOR_OPTIONS = {
  automaticLayout: true,
  formatOnType: true,
  formatOnPaste: true,
  minimap: { enabled: false },
  fontSize: 15,
  scrollBeyondLastLine: false,
  ...props.options,
}

function getLanguage() {
  const name = props.file.name.toLowerCase()
  if (name.endsWith('.vue')) return 'html'
  if (name.endsWith('.tsx') || name.endsWith('.ts')) return 'typescript'
  if (name.endsWith('.jsx') || name.endsWith('.js')) return 'javascript'
  const lang = props.file.language.toLowerCase()
  switch (lang) {
    case 'javascript':
    case 'js':
      return 'javascript'
    case 'html':
      return 'html'
    case 'css':
      return 'css'
    case 'json':
      return 'json'
    case 'typescript':
    case 'ts':
      return 'typescript'
    default:
      return 'javascript'
  }
}

function handleMount(editor: monaco.editor.IStandaloneCodeEditor) {
  editorRef.value = editor
}
</script>

<style>
.monaco-editor-wrapper {
  height: 100%;
  width: 100%;
}
</style>
