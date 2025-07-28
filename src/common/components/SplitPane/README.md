# SplitPane 组件（自定义分割面板）

这是一个支持拖拽调整大小的 Vue3 分割面板组件，支持横向/纵向分割，slot 方式传递内容，样式美观，易于扩展。

## ✨ 主要特性

- 支持横向（row）和纵向（column）分割
- 拖拽分割线动态调整面板大小
- slot 方式传递内容，灵活嵌套
- 分割线美观，悬停高亮，圆角阴影

## 🚀 基本用法

```vue
<template>
  <SplitPane direction="row" :default-sizes="[60, 40]">
    <template #pane0>
      <div>左侧内容</div>
    </template>
    <template #pane1>
      <div>右侧内容</div>
    </template>
  </SplitPane>
</template>

<script setup>
import { SplitPane } from './components/SplitPane'
</script>
```

## 🔧 属性说明

| 属性          | 类型     | 默认值   | 说明                       |
| ------------- | -------- | -------- | -------------------------- |
| direction     | String   | 'row'    | 分割方向 row/column        |
| default-sizes | Number[] | [50, 50] | 各面板初始百分比           |
| panesCount    | Number   | 2        | 面板数量（slot数量需对应） |

## 🎨 分割线样式自定义

- 分割线宽度、颜色、圆角、阴影、悬停高亮等可在 `SplitPane.vue` 的 `<style scoped>` 中自定义。
- 默认分割线宽度 10px，圆角 6px，悬停高亮绿色。

## 🖱️ 拖拽效果

- 鼠标悬停分割线变色，拖拽可动态调整左右/上下面板宽高。
- 支持多面板（panesCount > 2）和嵌套分割。

## ⚠️ 旧用法说明

- 旧版的 `<SplitPanePanel>` 组件已废弃，全部用 slot 方式传递内容。
- 旧用法：
  ```vue
  <SplitPane>
    <SplitPanePanel>...</SplitPanePanel>
    <SplitPanePanel>...</SplitPanePanel>
  </SplitPane>
  ```
  请改为新版 slot 方式。

---

如需更多自定义或嵌套用法，请参考 SplitPane.vue 源码或联系开发者。
