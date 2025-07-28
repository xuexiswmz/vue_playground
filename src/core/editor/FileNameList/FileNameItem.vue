<template>
  <div :class="['tab-item', actived ? 'actived' : null]" @click="$emit('click')">
    <input
      v-if="editing"
      ref="inputRef"
      class="tabs-item-input"
      v-model="nameValue"
      @blur="handleInputBlur"
    />
    <template v-else>
      <span @dblclick="!readonly ? handleDoubleClick() : undefined">{{ value }}</span>
      <a-popconfirm
        v-if="!readonly"
        title="确认删除该文件吗？"
        ok-text="确定"
        cancel-text="取消"
        @confirm="$emit('remove')"
        @click.stop
      >
        <span style="margin-left: 5px; display: flex">
          <svg width="12" height="12" viewBox="0 0 24 24">
            <line stroke="#999" x1="18" y1="6" x2="6" y2="18"></line>
            <line stroke="#999" x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </span>
      </a-popconfirm>
    </template>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import { Popconfirm as APopconfirm } from 'ant-design-vue'

// 定义组件属性
const props = defineProps<{
  value: string
  actived: boolean
  creating: boolean
  readonly: boolean
}>()

// 定义组件事件
const emit = defineEmits<{
  (e: 'click'): void
  (e: 'edit-complete', name: string): void
  (e: 'remove'): void
}>()

// 组件内部状态
const nameValue = ref(props.value)
const editing = ref(props.creating)
const inputRef = ref<HTMLInputElement | null>(null)

// 监听value变化，更新nameValue
watch(
  () => props.value,
  (newValue) => {
    nameValue.value = newValue
  },
)

// 双击处理函数
const handleDoubleClick = () => {
  editing.value = true
  setTimeout(() => {
    inputRef.value?.focus()
  }, 0)
}

// 输入框失焦处理函数
const handleInputBlur = () => {
  editing.value = false
  emit('edit-complete', nameValue.value)
}

// 如果是新创建的文件，自动聚焦输入框
onMounted(() => {
  if (props.creating) {
    inputRef.value?.focus()
  }
})
</script>

<style scoped>
.tab-item {
  display: inline-flex;
  padding: 8px 10px 6px;
  font-size: 13px;
  line-height: 20px;
  cursor: pointer;
  align-items: center;
  border-bottom: 3px solid transparent;
  color: var(--text);
}

.tab-item.actived {
  color: var(--primary);
  border-bottom: 3px solid var(--primary);
}

.tab-item:first-child {
  cursor: text;
}

.tabs-item-input {
  width: 90px;
  padding: 4px 0 4px 10px;
  font-size: 13px;
  color: var(--text);
  background-color: var(--border);
  border: 1px solid var(--border);
  border-radius: 4px;
  outline: none;
}
</style>
