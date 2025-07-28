// 入口 patch 逻辑
export function patchMainCode(mainCode: string): string {
  // 确保导入了createApp
  if (!mainCode.includes('createApp')) {
    mainCode = `import { createApp } from 'vue'\n${mainCode}`
  }
  // 改进挂载逻辑，防止重复挂载
  if (!mainCode.includes('.mount')) {
    mainCode += `
// 确保只挂载一次Vue应用
const appElement = document.querySelector('#app')
if (appElement) {
  // 检查是否已经有Vue实例绑定到这个元素
  // 使用类型断言避免TypeScript警告
  const el = appElement as any
  if (el.__vue_app__) {
    // 卸载现有应用
    el.__vue_app__.unmount()
  }

  // 挂载新应用
  if (typeof App !== 'undefined') {
    const app = createApp(App)
    app.mount('#app')
  }
}`
  } else if (!mainCode.includes('__vue_app__')) {
    mainCode = mainCode.replace(
      /(\s*)(createApp\([^)]+\))\.mount\(['"](#[^'"]+)['"]\)/g,
      `$1const appElement = document.querySelector('$3')
$1// 使用类型断言避免TypeScript警告
$1const el = appElement as any
$1if (el && el.__vue_app__) {
$1  el.__vue_app__.unmount()
$1  console.log('卸载旧的Vue应用实例')
$1}
$1const app = $2
$1app.mount('$3')
$1console.log('挂载新的Vue应用实例')`,
    )
  }
  return mainCode
}
