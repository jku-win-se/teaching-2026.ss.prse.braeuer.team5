[**team5-smart-home**](../../../../README.md)

***

[team5-smart-home](../../../../README.md) / [components/rules/ruleUtils](../README.md) / emptyForm

# Function: emptyForm()

> **emptyForm**(): `object`

Defined in: [components/rules/ruleUtils.ts:35](https://github.com/jku-win-se/teaching-2026.ss.prse.braeuer.team5/blob/main/src/components/rules/ruleUtils.ts#L35)

## Returns

`object`

### action

> **action**: `object`

#### action.device\_id

> **device\_id**: `string` = `''`

#### action.state

> **state**: [`DeviceState`](../../../../types/interfaces/DeviceState.md)

### condition

> **condition**: `object`

#### condition.field

> **field**: keyof [`DeviceState`](../../../../types/interfaces/DeviceState.md)

#### condition.operator

> **operator**: [`TriggerOperator`](../../../../types/type-aliases/TriggerOperator.md)

#### condition.value

> **value**: `string` \| `number` \| `boolean`

### device\_id

> **device\_id**: `string` = `''`

### name

> **name**: `string` = `''`

### room\_id

> **room\_id**: `string` = `''`
