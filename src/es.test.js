import {
  getArrayValue,
  getClause,
  getOperator,
  isNegativeOperator
} from './es'

// getArrayValue
test('array arg to getArrayValue returns self', () => {
  expect(getArrayValue(['1', '2'])).toEqual(['1', '2'])
})

test('string arg to getArrayValue returns comma-split array', () => {
  expect(getArrayValue('1, 2')).toEqual(['1', '2'])
})

test('non-string|array arg to getArrayValue throws', () => {
  expect(() => getArrayValue(true)).toThrow()
})

// getClause
test('default condition + negative to getClause is "must_not"', () => {
  expect(getClause({}, { operator: 'not_equal' })).toBe('must_not')
})

test('default condition + non-negative to getClause is "must"', () => {
  expect(getClause({}, { operator: 'equal' })).toBe('must')
})

test('OR condition + anything to getClause is "should"', () => {
  expect(getClause({ condition: 'or' }, { operator: 'not_equal' }))
    .toBe('should')
})

test('unhandled condition + anything to getClause throws', () => {
  expect(() => getClause({ condition: 'xor' }, { operator: 'not_equal' }))
    .toThrow()
})

// getOperator
test('value containing "*" to getOperator is "wildcard"', () => {
  expect(getOperator({ value: 'hello*' })).toBe('wildcard')
})

test('value containing "?" to getOperator is "wildcard"', () => {
  expect(getOperator({ value: 'hello world?' })).toBe('wildcard')
})

test('operator "contains" to getOperator is "match"', () => {
  expect(getOperator({ operator: 'contains', value: '' })).toBe('match')
})

test('operator unknown to getOperator is "range"', () => {
  expect(getOperator({ operator: '>>>', value: 'hello world' })).toBe('range')
})

// isNegativeOperator
test('is_null to isNegativeOperator is true', () => {
  expect(isNegativeOperator('is_null')).toBe(true)
})

test('greater to isNegativeOperator is false', () => {
  expect(isNegativeOperator('greater')).toBe(false)
})
