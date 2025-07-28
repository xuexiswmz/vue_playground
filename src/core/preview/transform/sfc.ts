// SFC 相关处理
export function beforeTransformCode(filename: string, code: string) {
  if (filename.endsWith('.vue')) {
    const templateMatch = code.match(/<template>([\s\S]*?)<\/template>/i)
    const scriptMatch = code.match(/<script[^>]*>([\s\S]*?)<\/script>/i)
    const styleMatch = code.match(/<style[^>]*>([\s\S]*?)<\/style>/i)
    const template = templateMatch ? templateMatch[1].trim() : ''
    const script = scriptMatch ? scriptMatch[1].trim() : ''
    const style = styleMatch ? styleMatch[1].trim() : ''
    const isSetupScript = scriptMatch ? scriptMatch[0].includes('setup') : false
    let componentCode = ''
    if (script) {
      if (isSetupScript) {
        componentCode = `\nimport { h } from 'vue'\n${script}\n\nexport default {\n  setup() {\n    return () => h('div', {\n      innerHTML: \`${template.replace(/`/g, '\\`').replace(/\$/g, '\\$')}\`\n    })\n  }\n}\n`
      } else {
        const hasImportVue = script.includes('import') && script.includes('vue')
        const importVue = hasImportVue ? '' : "import { h } from 'vue'\n"
        componentCode = `\n${importVue}${script.replace(
          'export default {',
          `export default {\n  render() {\n    return h('div', {\n      innerHTML: \`${template.replace(/`/g, '\\`').replace(/\$/g, '\\$')}\`\n    })\n  },`,
        )}\n`
      }
    } else {
      componentCode = `\nimport { h } from 'vue'\n\nexport default {\n  render() {\n    return h('div', {\n      innerHTML: \`${template.replace(/`/g, '\\`').replace(/\$/g, '\\$')}\`\n    })\n  }\n}\n`
    }
    if (style) {
      const randomId = new Date().getTime()
      componentCode += `\n;(() => {\n  const style = document.createElement('style')\n  style.textContent = \`${style.replace(/`/g, '\\`').replace(/\$/g, '\\$')}\`\n  style.setAttribute('data-vue-component', '${filename}-${randomId}')\n  document.head.appendChild(style)\n})()\n`
    }
    return componentCode
  }
  return code
}
