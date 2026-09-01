import { describe, it, expect } from 'vitest'
import { sortByRiskSeverity } from '../../src/pages/copilot/shadow-ai/index.js'

describe('sortByRiskSeverity', () => {
  it('orders Low, Medium, High regardless of input order', () => {
    const byRisk = [
      { risk: 'High', tools: 3 },
      { risk: 'Low', tools: 5 },
      { risk: 'Medium', tools: 2 },
    ]

    expect(sortByRiskSeverity(byRisk).map((item) => item.risk)).toEqual([
      'Low',
      'Medium',
      'High',
    ])
  })

  it('matches risk case-insensitively while keeping original label text', () => {
    const byRisk = [
      { risk: 'HIGH', tools: 1 },
      { risk: 'low', tools: 4 },
      { risk: 'Medium', tools: 2 },
    ]

    expect(sortByRiskSeverity(byRisk).map((item) => item.risk)).toEqual([
      'low',
      'Medium',
      'HIGH',
    ])
  })

  it('sorts an unrecognized risk value last', () => {
    const byRisk = [
      { risk: 'High', tools: 3 },
      { risk: 'Unknown', tools: 1 },
      { risk: 'Low', tools: 5 },
      { risk: 'Medium', tools: 2 },
    ]

    expect(sortByRiskSeverity(byRisk).map((item) => item.risk)).toEqual([
      'Low',
      'Medium',
      'High',
      'Unknown',
    ])
  })

  it('does not mutate the input array', () => {
    const byRisk = [
      { risk: 'High', tools: 3 },
      { risk: 'Low', tools: 5 },
    ]
    const original = [...byRisk]

    sortByRiskSeverity(byRisk)

    expect(byRisk).toEqual(original)
  })
})
