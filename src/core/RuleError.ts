import { CODE, STATUS } from './enums'
import { isExtendsObject } from './utils'
import { RuleOptions, InstallerParams } from './types'

type MsgOptions =
    | string
    | {
          msg: string
          code?: CODE
          [name: string]: any
      }

export default class RuleError extends Error {
    status: STATUS = STATUS.ERROR

    id = -1
    key = ''
    args: any[] | void = undefined

    installed = false
    msg!: string
    opts!: RuleOptions
    async!: boolean

    constructor(msg: string, code?: CODE)
    constructor(msgOptions: MsgOptions)
    constructor(
        msgOptions: MsgOptions = { msg: '' },
        public code: CODE = CODE.UNKNOWN_TYPE,
        public context: Record<string, any> = {}
    ) {
        super((typeof msgOptions === 'string' ? msgOptions : msgOptions && msgOptions.msg) || 'unknown error')

        // note: 在继承Error等原生类的时候，es6转es5过程中，this会出现直接指向Error的情况（取决于babel编译的版本）;
        // 所以在super之后需要手动设置原型链
        if (Object.getPrototypeOf(this) !== RuleError.prototype) {
            Object.setPrototypeOf(this, RuleError.prototype)
        }

        this.name = this.constructor.name

        if (isExtendsObject(msgOptions)) {
            const { code: errorCode = CODE.UNKNOWN_TYPE, msg, ...errorContext } = msgOptions
            this.msg = msg
            this.code = errorCode
            this.context = errorContext
        } else {
            this.msg = msgOptions + ''
        }
    }

    install({ args, key, id, async }: InstallerParams, opts: RuleOptions = {}) {
        if (this.installed) {
            return this
        }

        Object.assign(this, { id, key, async, args, opts })

        this.installed = true

        return this
    }
}

export const isRuleError = (err: any): err is RuleError => err && err.constructor === RuleError
