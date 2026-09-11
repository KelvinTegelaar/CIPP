import {
  aggregateDiagnosticsClients,
  sortDiagnosticsChecks,
  buildClientLogQuery,
  buildRequestSeries,
  getCheckLabel,
  formatBytes,
} from '../../src/utils/instance-diagnostics'

describe('instance-diagnostics', () => {
  describe('aggregateDiagnosticsClients', () => {
    it('sums Count per AppId across buckets and computes share%', () => {
      const buckets = [
        { Clients: [{ AppId: 'a', AppName: 'App A', IP: '1.1.1.1', Count: 10 }] },
        { Clients: [{ AppId: 'a', AppName: 'App A', IP: '1.1.1.1', Count: 5 }, { AppId: 'b', AppName: 'App B', IP: '2.2.2.2', Count: 5 }] },
      ]
      const result = aggregateDiagnosticsClients(buckets)
      expect(result).toEqual([
        { AppId: 'a', AppName: 'App A', IP: '1.1.1.1', Count: 15, SharePct: 75 },
        { AppId: 'b', AppName: 'App B', IP: '2.2.2.2', Count: 5, SharePct: 25 },
      ])
    })

    it('rounds SharePct to one decimal place', () => {
      const buckets = [{ Clients: [{ AppId: 'a', Count: 2 }, { AppId: 'b', Count: 1 }] }]
      const result = aggregateDiagnosticsClients(buckets)
      expect(result).toEqual([
        { AppId: 'a', AppName: undefined, IP: undefined, Count: 2, SharePct: 66.7 },
        { AppId: 'b', AppName: undefined, IP: undefined, Count: 1, SharePct: 33.3 },
      ])
    })

    it('handles empty/missing input without throwing', () => {
      expect(aggregateDiagnosticsClients(undefined)).toEqual([])
      expect(aggregateDiagnosticsClients([])).toEqual([])
      expect(aggregateDiagnosticsClients([{}])).toEqual([])
    })
  })

  describe('buildRequestSeries', () => {
    it('splits 5 clients into 4 named series plus Other', () => {
      const buckets = [
        {
          Bucket: '2026-09-10T10:00',
          Clients: [
            { AppId: 'a', AppName: 'App A', Count: 50 },
            { AppId: 'b', AppName: 'App B', Count: 40 },
            { AppId: 'c', AppName: 'App C', Count: 30 },
            { AppId: 'd', AppName: 'App D', Count: 20 },
            { AppId: 'e', AppName: 'App E', Count: 10 },
          ],
        },
      ]
      const { data, series } = buildRequestSeries(buckets, 4)
      expect(series).toEqual([
        { AppId: 'a', AppName: 'App A' },
        { AppId: 'b', AppName: 'App B' },
        { AppId: 'c', AppName: 'App C' },
        { AppId: 'd', AppName: 'App D' },
      ])
      expect(data).toEqual([{ Bucket: '2026-09-10T10:00', a: 50, b: 40, c: 30, d: 20, Other: 10 }])
    })

    it('emits only the series present with no Other key when nothing is left over', () => {
      const buckets = [
        {
          Bucket: '2026-09-10T10:00',
          Clients: [
            { AppId: 'a', AppName: 'App A', Count: 5 },
            { AppId: 'b', AppName: 'App B', Count: 3 },
          ],
        },
      ]
      const { data, series } = buildRequestSeries(buckets, 4)
      expect(series).toEqual([
        { AppId: 'a', AppName: 'App A' },
        { AppId: 'b', AppName: 'App B' },
      ])
      expect(data).toEqual([{ Bucket: '2026-09-10T10:00', a: 5, b: 3 }])
    })
  })

  describe('sortDiagnosticsChecks', () => {
    it('orders FAIL, WARN, INFO, PASS', () => {
      const checks = [
        { Check: 'a', Status: 'PASS' },
        { Check: 'b', Status: 'FAIL' },
        { Check: 'c', Status: 'INFO' },
        { Check: 'd', Status: 'WARN' },
      ]
      expect(sortDiagnosticsChecks(checks).map((c) => c.Status)).toEqual([
        'FAIL',
        'WARN',
        'INFO',
        'PASS',
      ])
    })
  })

  describe('getCheckLabel', () => {
    it('maps known check ids to readable labels and passes unknown ids through', () => {
      expect(getCheckLabel('api-clients')).toBe('API clients')
      expect(getCheckLabel('some-future-check')).toBe('some-future-check')
    })
  })

  describe('formatBytes', () => {
    it('picks the right unit with one decimal place', () => {
      expect(formatBytes(512)).toBe('512.0 B')
      expect(formatBytes(2048)).toBe('2.0 KB')
      expect(formatBytes(5 * 1024 * 1024)).toBe('5.0 MB')
      expect(formatBytes(1.5 * 1024 * 1024 * 1024)).toBe('1.5 GB')
    })
  })

  describe('buildClientLogQuery', () => {
    it('builds a search-all-files KQL query scoped to the AppId and window', () => {
      expect(buildClientLogQuery('11111111-2222-3333-4444-555555555555', 24)).toBe(
        'search all files\n| where Message contains "AppId=11111111-2222-3333-4444-555555555555"\n| where Timestamp > ago(24h)\n| take 1000\n| sort by Timestamp desc'
      )
    })
  })
})
