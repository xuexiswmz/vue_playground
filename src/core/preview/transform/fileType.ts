// 文件类型转换
export function json2Js(file: { value: string }) {
  return `export default ${file.value}`
}

export function css2Js(file: { value: string; name: string }) {
  const randomId = new Date().getTime()
  return `
(() => {
    const stylesheet = document.createElement('style')
    stylesheet.setAttribute('id', 'style_${randomId}_${file.name}')
    document.head.appendChild(stylesheet)
    const styles = document.createTextNode(\`${file.value}\`)
    stylesheet.innerHTML = ''
    stylesheet.appendChild(styles)
})()
  `
}
