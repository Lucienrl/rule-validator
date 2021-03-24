import { CODE, STATUS } from './enums'
import { RuleOptions, InstallerParams } from './types'

export default class RuleResp {
    status: STATUS = STATUS.SUCCESS
    code: CODE = CODE.SUCCESS
    key = ''
    opts!: RuleOptions
    installed = false
    // correction为修正过的值，比如删除空格，code===0时应当用这个值修正
    constructor(public value: any = void 0, public context: Record<string, any> = {}) {}

    install({ args, key, id, async }: InstallerParams, opts: RuleOptions = {}) {
        if (this.installed) {
            return this
        }

        Object.assign(this, { id, key, async, args, opts })

        this.installed = true
        return this
    }
}

export const isRuleResp = (res: any): res is RuleResp => res instanceof RuleResp
