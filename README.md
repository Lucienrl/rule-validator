# rule-validator

## install

## rule

检测姓名：
```ts
import {CheckerError} from 'rule-validator'
function checkName(name: string, { maxLength = 10 } = {}) {
    if (typeof name !== 'string') {
        // throw error
        throw CheckerError('name must be string')
    }
    
    if (name.length > maxLength) {
        // return error; not recommend, it maybe bug when nested rule
        return CheckerError(`name length no larger than ${maxLength}`)
    }

    return name
}
```

检测手机号：
```ts
import {CheckerError} from 'rule-validator'
const checkMobile = (mobileNumber: string) => {
    if (/^1[0-9]{10}$/.test(mobileNumber)) {
        return mobileNumber
    }
    throw new CheckerError('illegal phone number')
}
```

## async rule

```ts
async function asyncCheck (xx: string) => {
   // await ...
}
```

## nested rule

```ts
const checkSome = (xx: string) => {
   // ...
}

const checkOne = (xx: string) => {
    checkSome()
   // ...
}
```

## sync use

```ts
import {RuleValidator} from 'rule-validator'
const ruleValidator = new RuleValidator()
const [err, resp] = ruleValidator.sync(checkEmail, ['xx@qq.com']).sync(checkName, ['xxx']).end()
if(err){
   // error
}
```

## async use

```ts
import {RuleValidator} from 'rule-validator'
const ruleValidator = new RuleValidator()
// return promise
const [err, resp] = await ruleValidator.sync(checkEmail, ['xx@qq.com']).async(asyncCheck, ['xxx']).end()
if(err){
   // error
}
```

## extra

```ts
function check({ name, email }: { name: string; email: string }) {
    const ruleValidator = new RuleValidator()
    const [err, resp] = ruleValidator.sync(checkEmail, [email]).sync(checkName, [name]).end()

    if (err) {
        return { isValid: false, err }
    }

    return { isValid: true, err: null }
}

```