<template>
  <div class="split-pane" :style="splitPaneStyle" ref="containerRef">
    <template v-for="idx in panesCount" :key="idx">
      <div class="pane" :style="paneStyle(idx - 1)">
        <slot :name="'pane' + (idx - 1)"></slot>
      </div>
      <div v-if="idx < panesCount" class="splitter" @mousedown="onMouseDown(idx - 1)"></div>
    </template>
  </div>
</template>

<script lang="ts">
import { ref, onMounted, onBeforeUnmount } from 'vue'
import type { CSSProperties } from 'vue'

export default {
  name: 'SplitPane',
  props: {
    direction: {
      type: String,
      default: 'row',
      validator: (v: string) => ['row', 'column'].includes(v),
    },
    defaultSizes: {
      type: Array as () => number[],
      default: () => [50, 50],
    },
    panesCount: {
      type: Number,
      default: 2,
    },
  },
  setup(props) {
    const sizes = ref<number[]>([...props.defaultSizes])
    const containerRef = ref<HTMLElement | null>(null)
    let dragging = false
    let dragIdx = 0

    // 计算 split-pane 的 style
    const splitPaneStyle = {
      flexDirection: props.direction,
    } as CSSProperties

    // 计算每个面板的 style
    const paneStyle = (idx: number) => {
      if (props.direction === 'row') {
        return {
          flexBasis: sizes.value[idx] + '%',
          width: 0,
          minWidth: '10px',
          overflow: 'auto',
        }
      } else {
        return {
          flexBasis: sizes.value[idx] + '%',
          height: 0,
          minHeight: '10px',
          overflow: 'auto',
        }
      }
    }

    // 拖拽开始
    const onMouseDown = (idx: number) => {
      if (!containerRef.value) return

      dragging = true
      dragIdx = idx

      // 添加事件监听
      document.addEventListener('mousemove', onMouseMove)
      document.addEventListener('mouseup', onMouseUp)

      // 设置光标样式
      document.body.style.cursor = props.direction === 'row' ? 'col-resize' : 'row-resize'

      // 阻止默认事件和文本选择
      document.body.style.userSelect = 'none'
      document.body.style.pointerEvents = 'none'
    }

    // 拖拽中
    const onMouseMove = (e: MouseEvent) => {
      if (!dragging || !containerRef.value) return

      const container = containerRef.value
      const containerRect = container.getBoundingClientRect()
      const containerSize =
        props.direction === 'row' ? container.offsetWidth : container.offsetHeight

      // 计算鼠标位置
      const mousePos = props.direction === 'row' ? e.clientX : e.clientY
      const containerStart = props.direction === 'row' ? containerRect.left : containerRect.top

      // 计算鼠标移动距离（像素）
      const delta = mousePos - containerStart

      // 计算鼠标位置占总宽/高的百分比
      const positionPercent = (delta / containerSize) * 100

      // 最小百分比限制
      const minPercent = 30

      // 计算拖拽分割线左侧所有面板的宽度百分比之和
      let beforeSum = 0
      for (let i = 0; i < dragIdx; i++) {
        beforeSum += sizes.value[i]
      }

      // 计算拖拽分割线右侧所有面板的宽度百分比之和
      let afterSum = 0
      for (let i = dragIdx + 2; i < sizes.value.length; i++) {
        afterSum += sizes.value[i]
      }

      // 计算当前可分配的百分比总量（左右两个面板）
      const availablePercent = 100 - beforeSum - afterSum

      // 计算拖拽位置相对于可分配区域的百分比
      const relativePercent = positionPercent - beforeSum

      // 确保左右面板都不小于最小百分比
      const leftPanePercent = Math.max(
        minPercent,
        Math.min(relativePercent, availablePercent - minPercent),
      )
      const rightPanePercent = availablePercent - leftPanePercent

      // 更新面板尺寸
      sizes.value[dragIdx] = leftPanePercent
      sizes.value[dragIdx + 1] = rightPanePercent
    }

    // 拖拽结束
    const onMouseUp = () => {
      dragging = false
      document.removeEventListener('mousemove', onMouseMove)
      document.removeEventListener('mouseup', onMouseUp)
      document.body.style.cursor = ''
      document.body.style.userSelect = ''
      document.body.style.pointerEvents = ''
    }

    // 清理事件监听
    onBeforeUnmount(() => {
      document.removeEventListener('mousemove', onMouseMove)
      document.removeEventListener('mouseup', onMouseUp)
    })

    // 初始化面板数量
    onMounted(() => {
      if (sizes.value.length < props.panesCount) {
        const remain = props.panesCount - sizes.value.length
        const defaultSize = 100 / props.panesCount
        for (let i = 0; i < remain; i++) {
          sizes.value.push(defaultSize)
        }
      }

      // 确保所有面板百分比总和为100
      const sum = sizes.value.reduce((a, b) => a + b, 0)
      if (Math.abs(sum - 100) > 0.1) {
        const factor = 100 / sum
        sizes.value = sizes.value.map((size) => size * factor)
      }
    })

    return {
      sizes,
      containerRef,
      paneStyle,
      onMouseDown,
      splitPaneStyle,
    }
  },
}
</script>

<style scoped>
.split-pane {
  display: flex;
  width: 100%;
  height: 100%;
  overflow: hidden;
  position: relative;
}
.split-pane[style*='column'] {
  flex-direction: column;
}
.pane {
  min-width: 10px;
  min-height: 10px;
  background: transparent;
  overflow: auto;
  width: 100%;
  height: 100%;
  box-sizing: border-box;
  flex-shrink: 0;
}
.splitter {
  background: #eee;
  z-index: 2;
  transition: background 0.2s;
  flex-shrink: 0;
}
.split-pane[style*='row'] .splitter {
  width: 6px;
  cursor: col-resize;
}
.split-pane[style*='column'] .splitter {
  height: 6px;
  cursor: row-resize;
}
.splitter:hover {
  background: #ccc;
}
</style>
