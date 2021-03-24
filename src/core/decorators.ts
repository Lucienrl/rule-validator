import { getOwnPropertyDescriptors, getOwnKeys, createDefaultSetter, bind } from './utils'
import { AnyFunction, AnyConstructor, AnyObject, AutoBindClassProps } from './types'

export function autoBindMethod(
    target: AnyObject,
    key: string,
    { value: fn, configurable, enumerable }: any,
    opts: AutoBindClassProps = {}
) {
    return {
        configurable,
        enumerable,
        get() {
            const { callInterceptor } = opts

            const preCallee: AnyFunction =
                typeof callInterceptor !== 'function' ? fn : callInterceptor.call(this, fn, key, target)

            const boundFn: any = bind(preCallee, this)
            // const boundFn: any =
            //     typeof callInterceptor !== 'function' ? bind(fn, this) : callInterceptor.call(this, bind(fn, this), key)

            boundFn.preCallee = preCallee

            Object.defineProperty(this, key, {
                configurable: true,
                writable: true,
                // NOT enumerable when it's a bound method
                enumerable: false,
                value: boundFn,
            })

            return boundFn
        },
        set: createDefaultSetter(key),
    }
}

export function autoBindClass(param: AutoBindClassProps | AnyConstructor): any {
    const run = (inClass: AnyConstructor, opts?: AutoBindClassProps) => {
        const inClassPrototype = inClass.prototype
        const descriptors = getOwnPropertyDescriptors(inClassPrototype)
        const keys = getOwnKeys(descriptors)

        keys.forEach((key: string) => {
            const desc = descriptors[key]
            if (typeof desc.value !== 'function' || key === 'constructor') {
                return
            }

            Object.defineProperty(inClassPrototype, key, autoBindMethod(inClassPrototype, key, desc, opts))
        })
    }

    return typeof param === 'function'
        ? run(param)
        : (inClass: AnyConstructor) => {
              run(inClass, param)
          }
}
