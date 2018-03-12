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
      .map(rule => {
        return {
          clause: getClause(group, rule),
          fragment: transformRule(group, rule)
        }
      })
      .reduce(mergeByClause, {})
  }
}

function transformRule (group, rule) {
  const { condition } = group
  const { operator, rules } = rule

  if (rules && rules.length > 0) {
    return transformGroup(rule)
  }

  const fragment = getFragment(rule)

  // this is a corner case, when we have an "or" group and a negative operator,
  // we express this with a sub boolean query and must_not
  if (condition.toUpperCase() === 'OR' && isNegativeOperator(operator)) {
    return {
      bool: {
        must_not: [fragment]
      }
    }
  }

  return fragment
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
