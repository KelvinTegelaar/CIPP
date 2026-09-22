import { describe, it, expect } from 'vitest'
import {
  describeAge,
  describeAlertStatus,
  isFlapping,
  sortAlertItems,
  summarizeAlertItems,
} from '../../src/utils/alert-lifecycle'

const now = new Date('2026-09-22T12:00:00Z')

describe('describeAge', () => {
  it('returns an empty string for missing or invalid values', () => {
    expect(describeAge(undefined, now)).toBe('')
    expect(describeAge('not a date', now)).toBe('')
  })

  it('rounds to the coarsest useful unit', () => {
    expect(describeAge('2026-09-22T11:59:40Z', now)).toBe('just now')
    expect(describeAge('2026-09-22T11:35:00Z', now)).toBe('25m ago')
    expect(describeAge('2026-09-22T09:00:00Z', now)).toBe('3h ago')
    expect(describeAge('2026-09-19T12:00:00Z', now)).toBe('3d ago')
  })
})

describe('summarizeAlertItems', () => {
  it('counts each status and ignores unknown ones', () => {
    const counts = summarizeAlertItems([
      { Status: 'Open' },
      { Status: 'Open' },
      { Status: 'Acknowledged' },
      { Status: 'Snoozed' },
      { Status: 'Resolved' },
      { Status: 'Bogus' },
    ])
    expect(counts).toEqual({
      Open: 2,
      Acknowledged: 1,
      Snoozed: 1,
      Resolved: 1,
    })
  })

  it('copes with a non-array', () => {
    expect(summarizeAlertItems(undefined)).toEqual({
      Open: 0,
      Acknowledged: 0,
      Snoozed: 0,
      Resolved: 0,
    })
  })
})

describe('sortAlertItems', () => {
  it('orders open before acknowledged, snoozed and resolved, with flapping items first', () => {
    const sorted = sortAlertItems([
      {
        RowKey: 'resolved',
        Status: 'Resolved',
        ResolvedAt: '2026-09-22T11:00:00Z',
      },
      {
        RowKey: 'snoozed',
        Status: 'Snoozed',
        LastSeen: '2026-09-22T11:00:00Z',
      },
      {
        RowKey: 'open-old',
        Status: 'Open',
        LastSeen: '2026-09-20T11:00:00Z',
        ReopenCount: 0,
      },
      {
        RowKey: 'ack',
        Status: 'Acknowledged',
        LastSeen: '2026-09-22T11:00:00Z',
      },
      {
        RowKey: 'open-new',
        Status: 'Open',
        LastSeen: '2026-09-22T11:00:00Z',
        ReopenCount: 0,
      },
      {
        RowKey: 'open-flap',
        Status: 'Open',
        LastSeen: '2026-09-18T11:00:00Z',
        ReopenCount: 4,
      },
    ])
    expect(sorted.map((item) => item.RowKey)).toEqual([
      'open-flap',
      'open-new',
      'open-old',
      'ack',
      'snoozed',
      'resolved',
    ])
  })

  it('does not mutate its input', () => {
    const input = [{ Status: 'Resolved' }, { Status: 'Open' }]
    sortAlertItems(input)
    expect(input[0].Status).toBe('Resolved')
  })
})

describe('isFlapping', () => {
  it('flags three or more reopens', () => {
    expect(isFlapping({ ReopenCount: 2 })).toBe(false)
    expect(isFlapping({ ReopenCount: 3 })).toBe(true)
    expect(isFlapping({ ReopenCount: '5' })).toBe(true)
    expect(isFlapping({})).toBe(false)
  })
})

describe('describeAlertStatus', () => {
  it('describes an open item by age and last check', () => {
    expect(
      describeAlertStatus(
        {
          Status: 'Open',
          FirstSeen: '2026-09-19T12:00:00Z',
          LastChecked: '2026-09-22T10:00:00Z',
        },
        now
      )
    ).toBe('First seen 3d ago · checked 2h ago')
  })

  it('describes an acknowledged item by who acknowledged it', () => {
    expect(
      describeAlertStatus(
        {
          Status: 'Acknowledged',
          AcknowledgedBy: 'ops@example.com',
          AcknowledgedAt: '2026-09-22T11:00:00Z',
          LastChecked: '2026-09-22T11:30:00Z',
        },
        now
      )
    ).toBe('Acknowledged by ops@example.com · 1h ago · checked 30m ago')
  })

  it('describes an indefinite snooze', () => {
    expect(
      describeAlertStatus(
        { Status: 'Snoozed', SnoozeUntil: '-1', SnoozedBy: 'ops@example.com' },
        now
      )
    ).toBe('Snoozed indefinitely · by ops@example.com')
  })

  it('describes a resolved item without a last-check age', () => {
    expect(
      describeAlertStatus(
        {
          Status: 'Resolved',
          ResolvedAt: '2026-09-22T06:00:00Z',
          LastChecked: '2026-09-22T06:00:00Z',
        },
        now
      )
    ).toBe('Resolved 6h ago')
  })
})
