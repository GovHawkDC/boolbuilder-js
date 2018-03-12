import transform from './transform'

test('QB data -> ES query', () => {
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
