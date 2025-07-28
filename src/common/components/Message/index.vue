<template>
  <div v-if="visible" :class="['msg', type]">
    <pre v-html="content"></pre>
    <button class="dismiss" @click="visible = false">✕</button>
  </div>
</template>

<script setup lang="ts">
// 定义组件名称
defineOptions({
  name: 'MessageComponent',
})

import { ref, watch } from 'vue'

// 定义组件属性
const props = defineProps<{
  type: 'error' | 'warn'
  content: string
}>()

// 组件内部状态
const visible = ref(false)

// 监听content变化，更新visible状态
watch(
  () => props.content,
  (newContent) => {
    visible.value = !!newContent
  },
  { immediate: true },
)
</script>

<style scoped>
.msg {
  position: absolute;
  right: 8px;
  bottom: 0;
  left: 8px;
  z-index: 10;

  display: flex;
  max-height: calc(100% - 300px);
  min-height: 40px;
  margin-bottom: 8px;
  color: var(--color);

  background-color: var(--bg-color);
  border: 2px solid #fff;
  border-radius: 6px;

  align-items: stretch;
  border-color: var(--color);
}

.msg.error {
  --color: #f56c6c;
  --bg-color: #fef0f0;
}

.msg.warn {
  --color: #e6a23c;
  --bg-color: #fdf6ec;
}

pre {
  padding: 12px 20px;
  margin: 0;
  overflow: auto;
  white-space: break-spaces;
}

.dismiss {
  position: absolute;
  top: 2px;
  right: 2px;

  display: block;
  width: 18px;
  height: 18px;
  padding: 0;

  font-size: 9px;
  line-height: 18px;
  color: var(--bg-color);

  text-align: center;
  cursor: pointer;
  background-color: var(--color);
  border: none;
  border-radius: 9px;
}
</style>
