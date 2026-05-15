import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import { parseSemicolonCsv } from './parseCsv.js'

describe('parseSemicolonCsv', () => {
  it('parses semicolon CSV and trims whitespace around cells', () => {
    const rows = parseSemicolonCsv(`
      id;name;score
      1; Информатика и вычислительная техника ;4.25
      2;Нефтегазовое дело;3.95
    `)

    assert.deepEqual(rows, [
      {
        id: '1',
        name: 'Информатика и вычислительная техника',
        score: '4.25',
      },
      {
        id: '2',
        name: 'Нефтегазовое дело',
        score: '3.95',
      },
    ])
  })

  it('ignores empty lines', () => {
    const rows = parseSemicolonCsv('id;name\n\n1;ИВТ\n')

    assert.deepEqual(rows, [{ id: '1', name: 'ИВТ' }])
  })
})
