import { getClause, getFragment, isNegativeOperator } from './es'

function transformGroup (group, filters = {}) {
  if (!group) {
    return {}
  }

  const { QB, rules } = group

  if (!rules || rules.length < 1) {
    return {}
  }

  const filter = filters[QB] || transformGroupDefaultFilter

  return {
    bool: filter(group, rules, filters, transformGroupPostFilter)
  }
}

function transformGroupPostFilter (group, rules, filters) {
  return rules
    .map(rule => {
      return {
        clause: getClause(group, rule),
        fragment: transformRule(group, rule, filters)
      }
    })
    .reduce(mergeByClause, {})
}

function transformGroupDefaultFilter (group, rules, filters, postFilter) {
  return postFilter(group, rules, filters)
}

function transformRule (group, rule, filters) {
  const { condition } = group
  const { operator, rules } = rule

  if (rules && rules.length > 0) {
    return transformGroup(rule, filters)
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
