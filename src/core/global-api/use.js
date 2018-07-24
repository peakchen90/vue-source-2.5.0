/* @flow */

import { toArray } from '../util/index'

/**
 * 初始化 Vue.use 注册插件方法
 * @param Vue
 */
export function initUse (Vue: GlobalAPI) {
  Vue.use = function (plugin: Function | Object) {
    // 如果安装过插件，直接返回（确保同一个插件只注册一次）
    // this 表示 Vue 对象
    const installedPlugins = (this._installedPlugins || (this._installedPlugins = []))
    if (installedPlugins.indexOf(plugin) > -1) {
      return this
    }

    // additional parameters
    // 第二个开始的参数为附加参数
    const args = toArray(arguments, 1)
    args.unshift(this)

    // 如果 plugin.install 是一个方法，则执行 plugin.install
    // 否则如果 plugin 是一个方法，执行 plugin
    if (typeof plugin.install === 'function') {
      plugin.install.apply(plugin, args)
    } else if (typeof plugin === 'function') {
      plugin.apply(null, args)
    }

    // 保存已经注册的插件
    installedPlugins.push(plugin)
    return this
  }
}
