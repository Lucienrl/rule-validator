import { ValidatorResp } from './types'

export function isInvalid([err]: ValidatorResp) {
    return !!err
}

// TODO: 提供工具 解析成功结果