import { AnyFunction, AnyObject } from './types'

export function getOwnPropertyDescriptors(obj: AnyObject) {
    return getOwnKeys(obj).reduce((descriptors: AnyObject, key) => {
        descriptors[key] = Object.getOwnPropertyDescriptor(obj, key)
        return descriptors
    }, {})
}

export const getOwnKeys = Object.getOwnPropertySymbols
    ? (object: AnyObject) => {
          return Object.getOwnPropertyNames(object).concat(Object.getOwnPropertySymbols(object) as any[])
      }
    : Object.getOwnPropertyNames

export function createDefaultSetter<T = any>(key: string) {
    return function set(this: T, newValue: any) {
        Object.defineProperty(this, key, {
            configurable: true,
            writable: true,
            // IS enumerable when reassigned by the outside word
            enumerable: true,
            value: newValue,
        })

        return newValue
    }
}

/**
 * Simple bind, faster than native
 * @param  {object} ctx 对应绑定的对象
 */
export function bind(fn: AnyFunction, ctx: any): AnyFunction {
    function boundFn(a: any) {
        const l = arguments.length
        return l ? (l > 1 ? fn.apply(ctx, arguments as any) : fn.call(ctx, a)) : fn.call(ctx)
    }
    // record original fn length
    boundFn._length = fn.length
    return boundFn
}

export function isObject(target: any) {
    return target ? target.constructor === Object : false
}

export function isExtendsObject(target: any): target is object {
    return target instanceof Object
}
