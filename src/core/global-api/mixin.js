/* @flow */

import { mergeOptions } from '../util/index'

/**
 * 初始化 Vue.mixin 方法
 * @param Vue
 */
export function initMixin (Vue: GlobalAPI) {
  Vue.mixin = function (mixin: Object) {
    this.options = mergeOptions(this.options, mixin)
    return this
  }
}
