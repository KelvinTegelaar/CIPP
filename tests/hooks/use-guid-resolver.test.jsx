import { describe, it, expect, beforeEach, vi } from 'vitest'
import { renderHook } from '@testing-library/react'
import { useGuidResolver } from '../../src/hooks/use-guid-resolver'

const mutate = vi.hoisted(() => vi.fn())
const settings = vi.hoisted(() => ({ currentTenant: 'AllTenants' }))
vi.mock('../../src/api/ApiCall', () => ({ ApiPostCall: () => ({ mutate }) }))
vi.mock('../../src/hooks/use-settings', () => ({ useSettings: () => settings }))

const guid = '0b902083-d218-471f-a359-7639f714ac00'

describe('useGuidResolver tenant', () => {
  beforeEach(() => mutate.mockClear())

  it('does not look GUIDs up when the only tenant is AllTenants', () => {
    const { result } = renderHook(() => useGuidResolver())
    result.current.resolveGuids({ excludeUsers: [guid] })
    expect(mutate).not.toHaveBeenCalled()
  })

  it('looks GUIDs up in the tenant it was given, not the selected one', () => {
    const { result } = renderHook(() =>
      useGuidResolver('contoso.onmicrosoft.com')
    )
    result.current.resolveGuids({ excludeUsers: [guid] })
    expect(mutate).toHaveBeenCalledWith(
      expect.objectContaining({
        url: '/api/ListDirectoryObjects',
        data: expect.objectContaining({
          tenantFilter: 'contoso.onmicrosoft.com',
          ids: [guid],
        }),
      })
    )
  })
})
