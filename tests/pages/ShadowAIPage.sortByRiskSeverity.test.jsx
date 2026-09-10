import { describe, it, expect } from 'vitest'
import { riskChartColor, sortByRiskSeverity } from '../../src/utils/shadow-ai.js'

const theme = {
  palette: {
    error: { main: '#EF4444' },
    warning: { main: '#F59E0B' },
    info: { main: '#3B82F6' },
    success: { main: '#10B981' },
    neutral: { 200: '#A0AEC0' },
  },
}

describe('sortByRiskSeverity', () => {
  it('orders Informational, Low, Medium, High regardless of input order', () => {
    const byRisk = [
      { risk: 'High', tools: 3 },
      { risk: 'Low', tools: 5 },
      { risk: 'Informational', tools: 1 },
      { risk: 'Medium', tools: 2 },
    ]

    expect(sortByRiskSeverity(byRisk).map((item) => item.risk)).toEqual([
      'Informational',
      'Low',
      'Medium',
      'High',
    ])
  })

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

describe('riskChartColor', () => {
  it('maps each risk level to its semantic colour', () => {
    expect(riskChartColor('High', theme)).toBe('#EF4444')
    expect(riskChartColor('Medium', theme)).toBe('#F59E0B')
    expect(riskChartColor('Low', theme)).toBe('#3B82F6')
    expect(riskChartColor('Informational', theme)).toBe('#10B981')
  })

  it('matches risk case-insensitively', () => {
    expect(riskChartColor('high', theme)).toBe('#EF4444')
    expect(riskChartColor('LOW', theme)).toBe('#3B82F6')
  })

  it('falls back to neutral for unknown risk values', () => {
    expect(riskChartColor('Unknown', theme)).toBe('#A0AEC0')
  })
})
