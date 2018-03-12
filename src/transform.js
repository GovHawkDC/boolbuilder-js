import { getClause, getFragment, isNegativeOperator } from './es'

function transformGroup (group, filters = {}) {
  if (!group) {
    return {}
  }

  const { QB, rules } = group

  if (!rules || rules.length < 1) {
    return {}
  }

  /*
  QB, filters{QB:func}

  func (group, rules, next*) {
     return {:bool}
  }
  */

  function nextPostFilter (group, rules) {
    return rules
      .map(rule => {
        return {
          clause: getClause(group, rule),
          fragment: transformRule(group, rule, filters)
        }
      })
      .reduce(mergeByClause, {})
  }

  const filterFunc = filters[QB] || defaultFilterFunc

  return {
    bool: filterFunc(group, rules, nextPostFilter)
  }
}

function defaultFilterFunc (group, rules, nextFunc) {
  return nextFunc(group, rules)
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
