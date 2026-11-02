import { describe, it, expect } from 'vitest'
import {
  describeAge,
  describeAlertStatus,
  describeSnooze,
  isActiveAlert,
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
      { Status: 'Snoozed' },
      { Status: 'Resolved' },
      { Status: 'Bogus' },
    ])
    expect(counts).toEqual({ Open: 2, Snoozed: 1, Resolved: 1 })
  })

  it('copes with a non-array', () => {
    expect(summarizeAlertItems(undefined)).toEqual({
      Open: 0,
      Snoozed: 0,
      Resolved: 0,
    })
  })
})

describe('sortAlertItems', () => {
  it('orders open before snoozed and resolved, with flapping items first', () => {
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

describe('isActiveAlert', () => {
  it('keeps open items and visible snoozes in the main list', () => {
    expect(isActiveAlert({ Status: 'Open' })).toBe(true)
    expect(isActiveAlert({ Status: 'Snoozed', SnoozeVisible: true })).toBe(true)
    expect(isActiveAlert({ Status: 'Snoozed', SnoozeVisible: false })).toBe(
      false
    )
    expect(isActiveAlert({ Status: 'Resolved' })).toBe(false)
  })
})

describe('describeSnooze', () => {
  it('describes an until-resolved snooze', () => {
    expect(
      describeSnooze({
        Status: 'Snoozed',
        SnoozeUntilResolved: true,
        SnoozedBy: 'ops@example.com',
      })
    ).toBe('Snoozed until it resolves · by ops@example.com')
  })

  it('describes a timed snooze by its end date', () => {
    const until = Math.round(new Date('2026-10-03T12:00:00Z').getTime() / 1000)
    const text = describeSnooze({
      Status: 'Snoozed',
      SnoozeUntil: String(until),
    })
    expect(text).toMatch(/^Snoozed until /)
    expect(text).toMatch(/2026/)
  })

  it('falls back to a plain label when the expiry is unusable', () => {
    expect(describeSnooze({ Status: 'Snoozed', SnoozeUntil: '' })).toBe(
      'Snoozed'
    )
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

  it('describes a snoozed item with its reason and last check', () => {
    expect(
      describeAlertStatus(
        {
          Status: 'Snoozed',
          SnoozeUntilResolved: true,
          SnoozedBy: 'ops@example.com',
          SnoozeReason: 'ticket 42',
          LastChecked: '2026-09-22T11:30:00Z',
        },
        now
      )
    ).toBe(
      'Snoozed until it resolves · by ops@example.com · ticket 42 · checked 30m ago'
    )
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
