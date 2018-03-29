function getArrayValue (value) {
  if (Array.isArray(value)) {
    return value
  }

  if (typeof value === 'string') {
    return value.split(',').map(v => v.trim())
  }

  throw new Error(
    `Unable to build ES bool query with value type: "${typeof value}"`
  )
}

function getClause (group, rule) {
  const { condition = 'AND' } = group
  const { operator } = rule

  switch (condition.toUpperCase()) {
    case 'OR':
      return 'should'
    case 'AND':
      return isNegativeOperator(operator) ? 'must_not' : 'must'
    default:
      throw new Error(
        `Unable to build ES bool query with condition: "${condition}"`
      )
  }
}

function getFragment (rule) {
  const { field, operator } = rule

  switch (operator) {
    case 'is_not_null':
    case 'is_null':
      return { exists: { field } }
    default:
      return {
        [getOperator(rule)]: {
          [field]: getValue(rule)
        }
      }
  }
}

function getOperator (rule) {
  const { operator, value } = rule

  // HACK: This accepts most types and seems to convert to string; however,
  // it might be better to do something like `JSON.parse` to explicitly
  // convert to a string
  if (/.(\*|\?)/.test(value)) {
    return 'wildcard'
  }

  switch (operator) {
    case 'contains':
      return 'match'
    case 'equal':
    case 'not_equal':
    case 'proximity':
      return 'match_phrase'
    case 'in':
    case 'not_in':
      return 'terms'
    default:
      return 'range'
  }
}

function getValue (rule) {
  const { operator, value } = rule

  switch (operator) {
    case 'between':
      const [gte, lte] = value
      return { gte, lte }
    case 'contains':
    case 'equal':
    case 'is_not_null':
    case 'is_null':
    case 'not_equal':
      return value
    case 'greater':
      return { gt: value }
    case 'greater_or_equal':
      return { gte: value }
    case 'in':
    case 'not_in':
      return getArrayValue(value)
    case 'less':
      return { lt: value }
    case 'less_or_equal':
      return { lte: value }
    case 'proximity':
      const [query, slop] = value
      return { query, slop }
    default:
      throw new Error(
        `Unable to build ES bool query with operator: "${operator}"`
      )
  }
}

function isNegativeOperator (operator) {
  switch (operator) {
    case 'is_null':
    case 'not_equal':
    case 'not_in':
      return true
    default:
      return false
  }
}

export {
  getArrayValue,
  getClause,
  getFragment,
  getOperator,
  getValue,
  isNegativeOperator
}
