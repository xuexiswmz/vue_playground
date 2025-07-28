import { transform } from '@babel/standalone'
import type { PluginObj } from '@babel/core'
import { beforeTransformCode } from './sfc'
import { json2Js, css2Js } from './fileType'
import { simpleHash, toDataURL } from '../utils'

export function babelTransform(filename: string, code: string, files: Record<string, unknown>) {
  const _code = beforeTransformCode(filename, code)
  let result = ''
  try {
    result = transform(_code, {
      presets: ['typescript'],
      filename,
      plugins: [customResolver(files)],
      retainLines: true,
      sourceType: 'module',
      sourceMaps: false,
    }).code!
  } catch (e) {
    const errorMsg = e instanceof Error ? e.message : String(e)
    if (errorMsg.includes('inmemory://model')) {
      try {
        result = transform(_code, {
          presets: ['typescript'],
          filename,
          retainLines: true,
          sourceType: 'module',
          sourceMaps: false,
        }).code!
      } catch {
        throw new Error(`编译失败: ${errorMsg}. 请检查代码语法或导入语句。`)
      }
    } else {
      throw e
    }
  }
  return result
}

const compiledModules: Record<string, string> = {}
const fileHashes: Record<string, string> = {}

export function customResolver(files: Record<string, unknown>): PluginObj {
  return {
    visitor: {
      ImportDeclaration(path) {
        const modulePath = path.node.source.value
        if (modulePath.startsWith('.')) {
          const file = getModuleFile(files, modulePath)
          if (!file) return
          try {
            // @ts-expect-error file.value is string, ensured by worker logic
            const currentHash = simpleHash(file.value)
            // @ts-expect-error file.name is string, ensured by worker logic
            if (!compiledModules[file.name] || fileHashes[file.name] !== currentHash) {
              // @ts-expect-error file.name is string, ensured by worker logic
              if (file.name.endsWith('.css')) {
                // @ts-expect-error file is { value, name }, ensured by worker logic
                const cssJs = css2Js(file)
                // @ts-expect-error file.name is string, ensured by worker logic
                compiledModules[file.name] = toDataURL(cssJs)
                // @ts-expect-error file.name is string, ensured by worker logic
              } else if (file.name.endsWith('.json')) {
                // @ts-expect-error file is { value }, ensured by worker logic
                const jsonJs = json2Js(file)
                // @ts-expect-error file.name is string, ensured by worker logic
                compiledModules[file.name] = toDataURL(jsonJs)
              } else {
                // @ts-expect-error file.value is string, ensured by worker logic
                const transformedCode = babelTransform(file.name, file.value, files)
                // @ts-expect-error file.name is string, ensured by worker logic
                compiledModules[file.name] = toDataURL(transformedCode)
              }
              // @ts-expect-error file.name is string, ensured by worker logic
              fileHashes[file.name] = currentHash
            }
            // @ts-expect-error file.name is string, ensured by worker logic
            path.node.source.value = compiledModules[file.name]
          } catch {
            // ignore, fallback to original import
          }
        }
      },
    },
  }
}
function getModuleFile(files: Record<string, unknown>, modulePath: string) {
  let moduleName = modulePath.split('./').pop() || ''
  if (!moduleName.includes('.')) {
    const realModuleName = Object.keys(files)
      .filter((key) => key.endsWith('.ts') || key.endsWith('.vue') || key.endsWith('.js'))
      .find((key) => key.split('.').includes(moduleName))
    if (realModuleName) {
      moduleName = realModuleName
    }
  }
  return files[moduleName]
}
