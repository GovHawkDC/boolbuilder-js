import transform from './transform'

test('(0) QB data -> ES query', () => {
  expect(transform({
    condition: 'AND',
    rules: [
      {
        id: 'name',
        field: 'name',
        type: 'string',
        input: 'text',
        operator: 'contains',
        value: '123'
      }
    ]
  })).toEqual({
    bool: {
      must: [
        { match: { name: '123' } }
      ]
    }
  })
})

test('(1) QB data -> ES query', () => {
  expect(transform({
    condition: 'OR',
    rules: [
      {
        id: 'name',
        field: 'name',
        type: 'string',
        input: 'text',
        operator: 'contains',
        value: '123'
      }
    ]
  })).toEqual({
    bool: {
      should: [
        { match: { name: '123' } }
      ]
    }
  })
})

test('(1) QB data -> ES query', () => {
  expect(transform({
    condition: 'AND',
    rules: [
      {
        id: 'name',
        field: 'name',
        type: 'string',
        input: 'text',
        operator: 'contains',
        value: '123'
      },
      {
        condition: 'or',
        rules: [
          {
            id: 'misc',
            field: 'misc',
            type: 'string',
            input: 'text',
            operator: 'equal',
            value: '123'
          },
          {
            id: 'type',
            field: 'type',
            type: 'string',
            input: 'checkbox',
            operator: 'in',
            value: [
              'book'
            ]
          }
        ]
      }
    ]
  })).toEqual({
    bool: {
      must: [
        { match: { name: '123' } },
        {
          bool: {
            should: [
              { match_phrase: { misc: '123' } },
              { terms: { type: ['book'] } }
            ]
          }
        }
      ]
    }
  })
})
