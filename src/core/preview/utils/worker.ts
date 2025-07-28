import { simpleHash } from './hash'

export function toDataURL(code: string, mimeType = 'application/javascript') {
  const base64 = btoa(unescape(encodeURIComponent(code)))
  return `data:${mimeType};base64,${base64}`
}

export { simpleHash }
