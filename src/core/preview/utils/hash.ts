// 工具函数：简单哈希
export function simpleHash(str: string): string {
  let hash = 0
  if (str.length === 0) return hash.toString()
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i)
    hash = (hash << 5) - hash + char
    hash = hash & hash // Convert to 32bit integer
  }
  return hash.toString()
}

// 工具函数：创建 blob URL
export function createBlobUrl(iframeRaw: string) {
  return URL.createObjectURL(new Blob([iframeRaw], { type: 'text/html' }))
}
