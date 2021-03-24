// TODO
// 支持添加所有规则的拦截器; 提供工具 解析成功结果

export * from './core/types'
export * from './core/helperProvider'
import RuleError, { isRuleError } from './core/RuleError'
import RuleResp, { isRuleResp } from './core/RuleResp'
import RuleValidator from './core/RuleValidator'

export default RuleValidator

export { RuleValidator, RuleError, isRuleError, RuleResp, isRuleResp }
