// import { STATUS } from './enums'
import RuleError from './RuleError'
import RuleResp from './RuleResp'

export type ValuesOf<T> = T[keyof T]

export type AnyFunction = (...args: any[]) => any

export type AnyConstructor = new (...args: any[]) => any

export type AnyObject = Record<string, any>

export type IterationMap = Record<string, RuleError | RuleResp>

export interface CheckerCorrection<T = AnyObject> {
    map: IterationMap
    value: T
}

export type ValidatorResp = [RuleError | null, any | null]

export type RuleHandler = (...args: any[]) => RuleError | any

export interface CommonOpts {
    // 当传入值为undefined时，自动忽略，不进行检测
    // ignoreWhenVoid?: boolean

    // 当失败的时候继续，在map查看错误(根据key值映射结果)
    allowMultiError?: boolean
}

export type ConstructorOpts = CommonOpts & {
    // 出错时不中断进程，返回所有检测结果
    // multi?: boolean
}

// 单独的rule包含了ConstructorOpts的所有配置项
export type RuleOpts = CommonOpts & {
    // 是否直接忽略
    ignore?: boolean

    // // async仅在fireImmediately下有效,默认为false
    // async?: boolean
}

export type RuleThroughParams = RuleOpts & { key?: string } & { [name: string]: any }

export type RuleOptions = RuleThroughParams | void | string

export interface CheckingContext {
    key: string
    value: any
    opts: RuleOpts
}

export interface AutoBindClassProps {
    callInterceptor?: (call: AnyFunction, callName: string, target: any) => AnyFunction
}

// 获取函数的参数
export type Parameters<T extends AnyFunction> = T extends (...args: infer P) => any ? P : never

export type InstallerParams = { args: any[]; key: string; id: number; async: boolean }
