import { getOwnKeys } from './utils'
import {
    AnyFunction,
    RuleHandler,
    Parameters,
    RuleOptions,
    ConstructorOpts,
    ValidatorResp,
    InstallerParams,
    RuleThroughParams,
} from './types'
import { autoBindClass } from './decorators'
import { isRuleError } from './RuleError'
import RuleResp, { isRuleResp } from './RuleResp'

interface QueueItem {
    id: number
    async: boolean
    handler: AnyFunction
    args: any[]
    opts: RuleOptions
}

function resolveResp(value: any, respParams: InstallerParams, opts: RuleOptions) {
    const resp = isRuleError(value) || isRuleResp(value) ? value : new RuleResp(value)

    resp.install(respParams, opts)

    return resp
}

// TODO: 支持添加所有规则的拦截器
@autoBindClass
// @ts-ignore
export default class RuleValidator {
    static getKeys = (() => {
        let keys: string[] | null = null
        return () => keys || (keys = getOwnKeys(RuleValidator.prototype))
    })()

    constructor(protected globalOpts: ConstructorOpts = {}) {
        this.globalOpts = Object.assign(
            {
                allowMultiError: false,
                ignoreWhenVoid: false,
            },
            this.globalOpts
        )
    }

    private asyncEmitter = false

    private queue: QueueItem[] = []

    private status = null

    get pending() {
        return this.status === 'pending'
    }

    get fulfilled() {
        return this.status === 'fulfilled'
    }

    private push(handler: AnyFunction, args: any[], opts: RuleOptions, async = false) {
        const queue = this.queue

        queue.push({
            id: queue.length,
            handler,
            async,
            args,
            opts,
        })
    }

    private resolveOpts(opts: RuleOptions): RuleThroughParams {
        return opts ? (typeof opts === 'string' ? { key: opts } : { key: opts.key }) : {}
    }

    private resolveRunnerRuleError(
        resp: any,
        ErrorParams: InstallerParams,
        opts: RuleOptions
    ): 'Ignored' | 'RuleError' | 'None' {
        const { allowMultiError } = this.globalOpts

        const isError = isRuleError(resp)

        if (isError) {
            resp.install(ErrorParams, opts)

            if (!allowMultiError) {
                return 'RuleError'
            }
            return 'Ignored'
        }
        return 'None'
    }

    async<T extends RuleHandler>(handler: T, args: Parameters<T>, opts: RuleOptions = void 0) {
        this.asyncEmitter = true
        this.push(handler, args, opts, true)
        return this
    }

    sync<T extends RuleHandler>(handler: T, args: Parameters<T>, opts: RuleOptions = void 0) {
        this.push(handler, args, opts)
        return this
    }

    parsed() {
        // 成功时直接返回值结果
        return this
    }

    end(): any {
        if (this.pending || this.fulfilled) {
            throw new Error('rule chain is executing or has completed!')
        }

        const queue = this.queue
        const respMap: Record<string, any> = {}

        if (this.asyncEmitter) {
            this.status = 'pending'

            return new Promise<ValidatorResp>(async (resolve, reject) => {
                const lastIndex = queue.length - 1

                let index = 0

                let resp: any
                let occurError = false

                while (lastIndex > index++) {
                    const { handler, opts, async, args, id } = queue.shift()

                    const objOpts = this.resolveOpts(opts)

                    if (objOpts && objOpts.ignore) {
                        continue
                    }

                    const key = objOpts.key || 'undefined'

                    try {
                        // 异步执行
                        resp = await handler(...args)
                    } catch (err) {
                        occurError = true
                        resp = err
                    }

                    const installedParams = { args, async, key, id }

                    const ruleErrorStatus = this.resolveRunnerRuleError(resp, installedParams, opts)

                    if (ruleErrorStatus === 'RuleError') {
                        this.status = 'fulfilled'
                        resolve([resp, null])
                        return
                    } else if (ruleErrorStatus === 'None' && occurError) {
                        this.status = 'fulfilled'
                        // error
                        reject(resp)
                        return
                    }

                    // allowMultiError or ok
                    // continue
                    respMap[key] = resolveResp(resp, installedParams, opts)
                }

                resolve([null, respMap])
            })
        } else {
            this.status = 'fulfilled'

            // execQueue
            while (queue.length) {
                const { handler, opts, async, args, id } = queue.shift()

                const objOpts = this.resolveOpts(opts)

                if (objOpts && objOpts.ignore) {
                    continue
                }

                const key = objOpts.key || `ruler_${handler.name}`

                let resp: any
                let occurError = false
                try {
                    resp = handler(...args)
                } catch (err) {
                    occurError = true
                    resp = err
                }

                const installedParams = { args, async, key, id }

                const ruleErrorStatus = this.resolveRunnerRuleError(resp, installedParams, opts)

                if (ruleErrorStatus === 'RuleError') {
                    return [resp, null]
                } else if (ruleErrorStatus === 'None' && occurError) {
                    throw resp
                }

                // allowMultiError
                respMap[key] = resolveResp(resp, installedParams, opts)
            }

            return [null, respMap]
        }
    }
}
