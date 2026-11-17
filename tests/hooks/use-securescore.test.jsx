import { afterEach, describe, expect, it, vi, beforeEach } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { useSecureScore } from '../../src/hooks/use-securescore'

const responses = {}
vi.mock('../../src/api/ApiCall', () => ({
  ApiGetCall: vi.fn(({ url, data }) => {
    const key = data?.Endpoint ?? data?.type ?? url
    if (failures[key]) {
      return { isSuccess: false, isFetching: false, isError: true, ...failures[key] }
    }
    return {
      data: responses[key],
      isSuccess: responses[key] !== undefined,
      isFetching: false,
      isError: false,
      error: null,
      refetch: refetchSpy,
    }
  }),
}))
const failures = {}
const refetchSpy = vi.fn()
const mode = { cached: false }
vi.mock('../../src/components/CippComponents/CippReportDBControls', () => ({
  useCippReportDB: ({ queryKey }) => ({
    useReportDB: mode.cached,
    resolvedQueryKey: `${queryKey}-${mode.cached}`,
    controls: null,
    syncDialog: null,
  }),
}))
vi.mock('../../src/hooks/use-settings', () => ({
  useSettings: () => ({ currentTenant: 'contoso.onmicrosoft.com' }),
}))
vi.mock('../../src/utils/standards-data', () => ({
  getStandards: () => [
    { name: 'standards.SafeAttachmentPolicy', label: 'Default Safe Attachment Policy', tag: ['mdo_commonattachmentsfilter'] },
  ],
}))

const setFlags = (baselinesEnabled) => {
  responses['/api/ListFeatureFlags'] = [{ Id: 'Baselines', Enabled: baselinesEnabled }]
  responses['security/secureScoreControlProfiles'] = {
    Results: [
      { id: 'mdo_commonattachmentsfilter', title: 'Common attachment filter', maxScore: 8, actionUrl: 'https://security.microsoft.com/a' },
      { id: 'mdo_logcollector', title: 'Log collector', actionUrl: 'https://security.microsoft.com/b' },
    ],
  }
  responses['security/secureScores'] = {
    Results: [
      {
        currentScore: 50,
        maxScore: 100,
        averageComparativeScores: [],
        controlScores: [
          { controlName: 'mdo_commonattachmentsfilter', scoreInPercentage: 25, score: 2 },
          { controlName: 'mdo_logcollector', scoreInPercentage: 0 },
        ],
      },
    ],
  }
}

const actionUrlOf = (result, controlName) =>
  result.current.translatedData.controlScores.find((c) => c.controlName === controlName).actionUrl

describe('useSecureScore remediation links', () => {
  beforeEach(() => {
    for (const key of Object.keys(responses)) delete responses[key]
  })

  it('sends a standard-backed control to Baselines when the flag is on', async () => {
    setFlags(true)
    const { result } = renderHook(() => useSecureScore())
    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(actionUrlOf(result, 'mdo_commonattachmentsfilter')).toBe(
      '/tenant/baselines?standard=standards.SafeAttachmentPolicy'
    )
  })

  it('sends a standard-backed control to the classic standards list when the flag is off', async () => {
    setFlags(false)
    const { result } = renderHook(() => useSecureScore())
    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(actionUrlOf(result, 'mdo_commonattachmentsfilter')).toBe(
      '/tenant/standards/templates?standard=standards.SafeAttachmentPolicy'
    )
  })

  it("keeps Microsoft's link for a control with no matching standard", async () => {
    setFlags(true)
    const { result } = renderHook(() => useSecureScore())
    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(actionUrlOf(result, 'mdo_logcollector')).toBe('https://security.microsoft.com/b')
  })
})

describe('useSecureScore points to gain', () => {
  beforeEach(() => {
    for (const key of Object.keys(responses)) delete responses[key]
  })

  it('derives points and overall % to gain from the profile maxScore', async () => {
    setFlags(true)
    const { result } = renderHook(() => useSecureScore())
    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    const control = result.current.translatedData.controlScores.find(
      (c) => c.controlName === 'mdo_commonattachmentsfilter'
    )
    expect(control.pointsToGain).toBe(6)
    expect(control.percentToGain).toBe(6)
  })

  it('leaves the gain empty when the profile has no maxScore', async () => {
    setFlags(true)
    const { result } = renderHook(() => useSecureScore())
    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    const control = result.current.translatedData.controlScores.find(
      (c) => c.controlName === 'mdo_logcollector'
    )
    expect(control.pointsToGain).toBeNull()
    expect(control.percentToGain).toBeNull()
  })
})

describe('useSecureScore failed fetch', () => {
  beforeEach(() => {
    for (const key of Object.keys(responses)) delete responses[key]
    for (const key of Object.keys(failures)) delete failures[key]
    refetchSpy.mockClear()
  })

  it('reports the error and retries only the query that failed', () => {
    setFlags(true)
    const error = new Error('Graph Error: UnknownError')
    const refetchProfiles = vi.fn()
    failures['security/secureScoreControlProfiles'] = { error, refetch: refetchProfiles }

    const { result } = renderHook(() => useSecureScore())

    expect(result.current.isError).toBe(true)
    expect(result.current.error).toBe(error)
    expect(result.current.isSuccess).toBe(false)

    result.current.refetch()
    expect(refetchProfiles).toHaveBeenCalledTimes(1)
    expect(refetchSpy).not.toHaveBeenCalled()
  })
})

describe('useSecureScore cached mode', () => {
  beforeEach(() => {
    for (const key of Object.keys(responses)) delete responses[key]
    for (const key of Object.keys(failures)) delete failures[key]
    mode.cached = true
  })
  afterEach(() => {
    mode.cached = false
  })

  it('reads the cache and takes the newest record, which the cache stores last', async () => {
    setFlags(true)
    const [liveRecord] = responses['security/secureScores'].Results
    responses.SecureScoreControlProfiles = responses['security/secureScoreControlProfiles']
    responses.SecureScore = {
      Results: [
        { ...liveRecord, currentScore: 10, createdDateTime: '2026-11-01T00:00:00Z' },
        { ...liveRecord, currentScore: 80, createdDateTime: '2026-11-14T00:00:00Z' },
      ],
    }
    delete responses['security/secureScores']
    delete responses['security/secureScoreControlProfiles']

    const { result } = renderHook(() => useSecureScore())
    await waitFor(() => expect(result.current.isSuccess).toBe(true))

    expect(result.current.translatedData.currentScore).toBe(80)
    expect(result.current.scores.map((s) => s.currentScore)).toEqual([80, 10])
  })

  it('reports an empty cache as an error instead of crashing', () => {
    setFlags(true)
    responses.SecureScoreControlProfiles = { Results: [] }
    responses.SecureScore = { Results: [] }

    const { result } = renderHook(() => useSecureScore())

    expect(result.current.isError).toBe(true)
    expect(result.current.error.message).toMatch(/No cached data/)
  })
})
