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
    bool: rules.map(rule => tranformGroup(group, rule))
  }
}

function transformRule (group, rule) {
  const clause = getClause(group, rule)

  const { condition } = group
  const { field, operator, rules } = rule

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

export default transformGroup
