import { getClause, getFragment, isNegativeOperator } from './es'

function transformGroup (group) {
  if (!group) {
    return {}
  }

  const { rules } = group

  if (!rules || rules.length < 1) {
    return {}
  }

  return {
    bool: rules
      .map(rule => transformRule(group, rule))
      .reduce(mergeByClause, {})
  }
}

function transformRule (group, rule) {
  const clause = getClause(group, rule)

  const { condition } = group
  const { operator, rules } = rule

  if (rules && rules.length > 0) {
    return { clause, fragment: transformGroup(rule) }
  }

  const fragment = getFragment(rule)

  if (condition.toUpperCase() === 'OR' && isNegativeOperator(operator)) {
    return {
      clause,
      fragment: {
        bool: {
          must_not: [fragment]
        }
      }
    }
  }

  return { clause, fragment }
}

function mergeByClause (accumulator, data) {
  const { clause, fragment } = data
  const existingFragments = accumulator[clause] || []

  return {
    ...accumulator,
    [clause]: [...existingFragments, fragment]
  }
}

export default transformGroup
