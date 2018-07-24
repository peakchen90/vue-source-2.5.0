/* @flow */

// these helpers produces better vm code in JS engines due to their
// explicitness and function inlining

// 检测一个值是否为 undefined 或 null
export function isUndef (v: any): boolean %checks {
  return v === undefined || v === null
}

// 检测一个值是否不为 undefined 且不为 null，跟上面相反
export function isDef (v: any): boolean %checks {
  return v !== undefined && v !== null
}

// 检测一个值是否为 true
export function isTrue (v: any): boolean %checks {
  return v === true
}

// 检测一个值是否为 false
export function isFalse (v: any): boolean %checks {
  return v === false
}

/**
 * Check if value is primitive
 * 检测一个值是否为基本类型 (string/number/boolean)
 */
export function isPrimitive (value: any): boolean %checks {
  return (
    typeof value === 'string' ||
    typeof value === 'number' ||
    typeof value === 'boolean'
  )
}

/**
 * Quick object check - this is primarily used to tell
 * Objects from primitive values when we know the value
 * is a JSON-compliant type.
 * 检测一个对象是否为一个非 null 的对象
 */
export function isObject (obj: mixed): boolean %checks {
  return obj !== null && typeof obj === 'object'
}

/**
 * Get the raw type string of a value e.g. [object Object]
 */
const _toString = Object.prototype.toString

// 返回一个值的原始类型 (Object/Function/Array/String/Number/Boolean/Symbol/RegExp...)
export function toRawType (value: any): string {
  return _toString.call(value).slice(8, -1)
}

/**
 * Strict object type check. Only returns true
 * for plain JavaScript objects.
 * 检测一个值是否是普通 JavaScript 对象
 */
export function isPlainObject (obj: any): boolean {
  return _toString.call(obj) === '[object Object]'
}

// 检测一个值是否为正则表达式
export function isRegExp (v: any): boolean {
  return _toString.call(v) === '[object RegExp]'
}

/**
 * Check if val is a valid array index.
 */
export function isValidArrayIndex (val: any): boolean {
  const n = parseFloat(String(val))
  return n >= 0 && Math.floor(n) === n && isFinite(val)
}

/**
 * Convert a value to a string that is actually rendered.
 * 将任意值转换为字符串
 */
export function toString (val: any): string {
  // 此处 0 != null, undefined == null
  return val == null
    ? ''
    : typeof val === 'object'
      // 第3个参数表示2个空格缩进
      ? JSON.stringify(val, null, 2)
      : String(val)
}

/**
 * Convert a input value to a number for persistence.
 * If the conversion fails, return original string.
 * 将任意值转换成数字，如果转换失败，返回原值
 */
export function toNumber (val: string): number | string {
  const n = parseFloat(val)
  return isNaN(n) ? val : n
}

/**
 * Make a map and return a function for checking if a key
 * is in that map.
 * 返回一个方法用于检查是否一个值在创建的 Map 里面
 */
export function makeMap (
  str: string,
  expectsLowerCase?: boolean
): (key: string) => true | void {
  // Object.create(null) 与 直接创建 {} 的区别是：前者没有 Object 的原型方法
  const map = Object.create(null)
  const list: Array<string> = str.split(',')
  for (let i = 0; i < list.length; i++) {
    map[list[i]] = true
  }
  return expectsLowerCase
    ? val => map[val.toLowerCase()]
    : val => map[val]
}

/**
 * Check if a tag is a built-in tag.
 * 检测一个标签是否是 Vue 内建标签 (slot/component)
 */
export const isBuiltInTag = makeMap('slot,component', true)

/**
 * Check if a attribute is a reserved attribute.
 * 判断一个属性是否是保留属性
 */
export const isReservedAttribute = makeMap('key,ref,slot,slot-scope,is')

/**
 * Remove an item from an array
 * 从数组中移除一个元素
 */
export function remove (arr: Array<any>, item: any): Array<any> | void {
  if (arr.length) {
    const index = arr.indexOf(item)
    if (index > -1) {
      return arr.splice(index, 1)
    }
  }
}

/**
 * Check whether the object has the property.
 * 检测一个对象是否有这个自有属性（非继承）
 */
const hasOwnProperty = Object.prototype.hasOwnProperty
export function hasOwn (obj: Object | Array<*>, key: string): boolean {
  return hasOwnProperty.call(obj, key)
}

/**
 * Create a cached version of a pure function.
 */
export function cached<F: Function> (fn: F): F {
  const cache = Object.create(null)
  return (function cachedFn (str: string) {
    const hit = cache[str]
    return hit || (cache[str] = fn(str))
  }: any)
}

/**
 * Camelize a hyphen-delimited string.
 * 定义一个方法，将连字符转换成驼峰（通过缓存，同一个字符串只会替换一次，第二次直接读取缓存）
 */
const camelizeRE = /-(\w)/g
export const camelize = cached((str: string): string => {
  return str.replace(camelizeRE, (_, c) => c ? c.toUpperCase() : '')
})

/**
 * Capitalize a string.
 * 将字符串第一个字符变成大写
 */
export const capitalize = cached((str: string): string => {
  return str.charAt(0).toUpperCase() + str.slice(1)
})

/**
 * Hyphenate a camelCase string.
 * 定义一个方法，将驼峰的字符串变成连字符（类似 camelize）
 */
const hyphenateRE = /\B([A-Z])/g
export const hyphenate = cached((str: string): string => {
  return str.replace(hyphenateRE, '-$1').toLowerCase()
})

/**
 * Simple bind, faster than native
 * 函数绑定上下文
 */
export function bind (fn: Function, ctx: Object): Function {
  function boundFn (a) {
    const l: number = arguments.length
    return l
      ? l > 1
        ? fn.apply(ctx, arguments)
        : fn.call(ctx, a)
      : fn.call(ctx)
  }
  // record original fn length
  boundFn._length = fn.length
  return boundFn
}

/**
 * Convert an Array-like object to a real Array.
 * 将类数组转换成真实的数组
 */
export function toArray (list: any, start?: number): Array<any> {
  start = start || 0
  let i = list.length - start
  const ret: Array<any> = new Array(i)
  while (i--) {
    ret[i] = list[i + start]
  }
  return ret
}

/**
 * Mix properties into target object.
 * 混合属性到目标对象（一个简化版的 Object.assign）
 */
export function extend (to: Object, _from: ?Object): Object {
  for (const key in _from) {
    to[key] = _from[key]
  }
  return to
}

/**
 * Merge an Array of Objects into a single Object.
 * 一个数组的元素是对象，将对象的属性合并到一个新对象里并返回
 */
export function toObject (arr: Array<any>): Object {
  const res = {}
  for (let i = 0; i < arr.length; i++) {
    if (arr[i]) {
      extend(res, arr[i])
    }
  }
  return res
}

/**
 * Perform no operation.
 * Stubbing args to make Flow happy without leaving useless transpiled code
 * with ...rest (https://flow.org/blog/2017/05/07/Strict-Function-Call-Arity/)
 * 空操作函数
 */
export function noop (a?: any, b?: any, c?: any) {}

/**
 * Always return false.
 * 总是返回 false
 */
export const no = (a?: any, b?: any, c?: any) => false

/**
 * Return same value
 * 返回相同的值
 */
export const identity = (_: any) => _

/**
 * Generate a static keys string from compiler modules.
 */
export function genStaticKeys (modules: Array<ModuleOptions>): string {
  return modules.reduce((keys, m) => {
    return keys.concat(m.staticKeys || [])
  }, []).join(',')
}

/**
 * Check if two values are loosely equal - that is,
 * if they are plain objects, do they have the same shape?
 * 判断2个值是否弱相等，如果2个都是对象，判断他们的属性是否相同
 */
export function looseEqual (a: any, b: any): boolean {
  if (a === b) return true
  const isObjectA = isObject(a)
  const isObjectB = isObject(b)
  if (isObjectA && isObjectB) {
    try {
      const isArrayA = Array.isArray(a)
      const isArrayB = Array.isArray(b)
      if (isArrayA && isArrayB) {
        return a.length === b.length && a.every((e, i) => {
          return looseEqual(e, b[i])
        })
      } else if (!isArrayA && !isArrayB) {
        const keysA = Object.keys(a)
        const keysB = Object.keys(b)
        return keysA.length === keysB.length && keysA.every(key => {
          return looseEqual(a[key], b[key])
        })
      } else {
        /* istanbul ignore next */
        return false
      }
    } catch (e) {
      /* istanbul ignore next */
      return false
    }
  } else if (!isObjectA && !isObjectB) {
    return String(a) === String(b)
  } else {
    return false
  }
}

// 通过 looseEqual 找到一个值是数组的第几个元素，没找到返回 -1
export function looseIndexOf (arr: Array<mixed>, val: mixed): number {
  for (let i = 0; i < arr.length; i++) {
    if (looseEqual(arr[i], val)) return i
  }
  return -1
}

/**
 * Ensure a function is called only once.
 * 确保一个函数只会执行一次
 */
export function once (fn: Function): Function {
  let called = false
  return function () {
    if (!called) {
      called = true
      fn.apply(this, arguments)
    }
  }
}
