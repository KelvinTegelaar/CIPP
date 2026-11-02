import { describe, it, expect } from 'vitest'
import {
  buildImpactChart,
  filterImpactSamples,
  getImpactResultKeys,
  getImpactResultLabel,
  getImpactSegmentCount,
  mergeImpactSegments,
  summarizeImpact,
} from '../../src/utils/ca-policy-impact'

const days = [
  {
    date: '2026-10-11',
    success: 3,
    failure: 1,
    notApplied: 0,
    reportOnlySuccess: 0,
    total: 4,
  },
  {
    date: '2026-10-12',
    success: 0,
    failure: 0,
    notApplied: 0,
    reportOnlySuccess: 0,
    total: 0,
  },
  {
    date: '2026-10-13',
    success: 1,
    failure: 0,
    notApplied: 1,
    reportOnlySuccess: 2,
    total: 4,
  },
]

describe('getImpactResultKeys', () => {
  it('shows enforced results for an enabled policy', () => {
    expect(getImpactResultKeys('enabled', {})).toEqual([
      'success',
      'failure',
      'notApplied',
    ])
  })

  it('shows the four report-only results for a report-only policy', () => {
    expect(
      getImpactResultKeys('enabledForReportingButNotEnforced', {})
    ).toEqual([
      'reportOnlySuccess',
      'reportOnlyFailure',
      'reportOnlyInterrupted',
      'reportOnlyNotApplied',
    ])
  })

  it('appends results from a previous state when they still have sign-ins', () => {
    const keys = getImpactResultKeys('enabled', {
      reportOnlySuccess: 2,
      notEnabled: 0,
    })
    expect(keys).toEqual([
      'success',
      'failure',
      'notApplied',
      'reportOnlySuccess',
    ])
  })

  it('falls back to the enforced set for an unknown state', () => {
    expect(getImpactResultKeys(undefined, {})).toEqual([
      'success',
      'failure',
      'notApplied',
    ])
  })
})

describe('getImpactSegmentCount', () => {
  it('reads 1 and 7 day windows in one segment and 30 days in three', () => {
    expect(getImpactSegmentCount(1)).toBe(1)
    expect(getImpactSegmentCount(7)).toBe(1)
    expect(getImpactSegmentCount(30)).toBe(3)
  })
})

describe('mergeImpactSegments', () => {
  const segment0 = {
    id: 'p1',
    displayName: 'MFA for all',
    state: 'enabled',
    windowDays: 30,
    source: 'signInLogs',
    signInCount: 5,
    partial: false,
    oldestSignInSeen: '2026-10-04T08:00:00Z',
    days: [
      { date: '2026-10-03', success: 1, failure: 0, total: 1 },
      { date: '2026-10-04', success: 4, failure: 0, total: 4 },
    ],
    totals: { success: 5, failure: 0, total: 5 },
    samples: [
      {
        id: 's-new',
        day: '2026-10-04',
        createdDateTime: '2026-10-04T08:00:00Z',
      },
    ],
  }
  const segment1 = {
    id: 'p1',
    displayName: 'MFA for all',
    state: 'enabled',
    windowDays: 30,
    source: 'signInLogs',
    signInCount: 3,
    partial: true,
    partialReason: 'continuation page returned 429',
    oldestSignInSeen: '2026-09-25T01:00:00Z',
    days: [
      { date: '2026-09-25', success: 0, failure: 1, total: 1 },
      { date: '2026-10-03', success: 2, failure: 0, total: 2 },
    ],
    totals: { success: 2, failure: 1, total: 3 },
    samples: [
      {
        id: 's-old',
        day: '2026-09-25',
        createdDateTime: '2026-09-25T01:00:00Z',
      },
    ],
  }

  it('returns null until a segment has arrived', () => {
    expect(mergeImpactSegments([])).toBeNull()
    expect(mergeImpactSegments([undefined, null])).toBeNull()
  })

  it('passes a single segment through intact', () => {
    const merged = mergeImpactSegments([segment0])
    expect(merged.loadedSegments).toBe(1)
    expect(merged.days).toEqual(segment0.days)
    expect(merged.totals).toEqual(segment0.totals)
    expect(merged.signInCount).toBe(5)
    expect(merged.partial).toBe(false)
  })

  it('sums the shared boundary day instead of dropping one side of it', () => {
    const merged = mergeImpactSegments([segment0, segment1])
    const boundary = merged.days.find((row) => row.date === '2026-10-03')
    expect(boundary).toEqual({
      date: '2026-10-03',
      success: 3,
      failure: 0,
      total: 3,
    })
    expect(merged.days.map((row) => row.date)).toEqual([
      '2026-09-25',
      '2026-10-03',
      '2026-10-04',
    ])
  })

  it('sums totals and sign-in counts and keeps the oldest sign-in seen', () => {
    const merged = mergeImpactSegments([segment1, segment0])
    expect(merged.totals).toEqual({ success: 7, failure: 1, total: 8 })
    expect(merged.signInCount).toBe(8)
    expect(merged.oldestSignInSeen).toBe('2026-09-25T01:00:00Z')
    expect(merged.displayName).toBe('MFA for all')
  })

  it('carries partial and its reason from any segment', () => {
    const merged = mergeImpactSegments([segment0, segment1])
    expect(merged.partial).toBe(true)
    expect(merged.partialReason).toBe('continuation page returned 429')
  })

  it('orders samples newest first across segments', () => {
    const merged = mergeImpactSegments([segment1, segment0])
    expect(merged.samples.map((s) => s.id)).toEqual(['s-new', 's-old'])
  })

  it('ignores holes for segments still loading', () => {
    const merged = mergeImpactSegments([segment0, undefined, segment1])
    expect(merged.loadedSegments).toBe(2)
  })
})

describe('buildImpactChart', () => {
  it('builds one stacked series per key with one point per day', () => {
    const { labels, series } = buildImpactChart(days, ['success', 'failure'])
    expect(labels).toEqual(['2026-10-11', '2026-10-12', '2026-10-13'])
    expect(series).toEqual([
      { name: 'Success', data: [3, 0, 1] },
      { name: 'Failure', data: [1, 0, 0] },
    ])
  })

  it('charts percentages of each day and leaves quiet days at zero', () => {
    const { series } = buildImpactChart(days, ['success', 'failure'], {
      percent: true,
    })
    expect(series[0].data).toEqual([75, 0, 25])
    expect(series[1].data).toEqual([25, 0, 0])
  })

  it('uses the label formatter when given', () => {
    const { labels } = buildImpactChart(days, ['success'], {
      formatLabel: (d) => d.slice(5),
    })
    expect(labels).toEqual(['10-11', '10-12', '10-13'])
  })

  it('treats missing counts as zero', () => {
    const { series } = buildImpactChart(
      [{ date: '2026-10-11', total: 2 }],
      ['success']
    )
    expect(series[0].data).toEqual([0])
  })
})

describe('summarizeImpact', () => {
  it('returns count and share of all evaluated sign-ins per key', () => {
    const rows = summarizeImpact({ success: 6, failure: 2, total: 8 }, [
      'success',
      'failure',
    ])
    expect(rows).toEqual([
      {
        key: 'success',
        label: 'Success',
        color: 'success',
        count: 6,
        percent: 75,
      },
      {
        key: 'failure',
        label: 'Failure',
        color: 'error',
        count: 2,
        percent: 25,
      },
    ])
  })

  it('reports zero percent when nothing was evaluated', () => {
    expect(summarizeImpact({ total: 0 }, ['success'])[0].percent).toBe(0)
  })
})

describe('filterImpactSamples', () => {
  const samples = [
    { id: 'a', day: '2026-10-11' },
    { id: 'b', day: '2026-10-13' },
  ]

  it('returns everything when no day is selected', () => {
    expect(filterImpactSamples(samples)).toHaveLength(2)
  })

  it('keeps only the selected day', () => {
    expect(filterImpactSamples(samples, '2026-10-13').map((s) => s.id)).toEqual(
      ['b']
    )
  })
})

describe('getImpactResultLabel', () => {
  it('falls back to the raw key for a value Graph adds later', () => {
    expect(getImpactResultLabel('unknownFutureValue')).toBe(
      'unknownFutureValue'
    )
  })
})
