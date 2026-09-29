import { describe, expect, it, vi, beforeEach } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { useSecureScore } from '../../src/hooks/use-securescore'

const responses = {}
vi.mock('../../src/api/ApiCall', () => ({
  ApiGetCall: vi.fn(({ url, data }) => {
    const key = url === '/api/ListGraphRequest' ? data.Endpoint : url
    return { data: responses[key], isSuccess: responses[key] !== undefined, isFetching: false }
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
      { id: 'mdo_commonattachmentsfilter', title: 'Common attachment filter', actionUrl: 'https://security.microsoft.com/a' },
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
          { controlName: 'mdo_commonattachmentsfilter', scoreInPercentage: 0 },
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
