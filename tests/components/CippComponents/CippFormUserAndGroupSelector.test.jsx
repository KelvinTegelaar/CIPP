import React from 'react'
import { describe, it, expect, vi } from 'vitest'
import { render } from '@testing-library/react'
import { useForm } from 'react-hook-form'

const captured = vi.hoisted(() => ({ props: null }))
vi.mock('../../../src/components/CippComponents/CippFormComponent', () => ({
  CippFormComponent: (props) => {
    captured.props = props
    return null
  },
}))
vi.mock('../../../src/hooks/use-settings', () => ({
  useSettings: () => ({ currentTenant: 'contoso.onmicrosoft.com' }),
}))

import { CippFormUserAndGroupSelector } from '../../../src/components/CippComponents/CippFormUserAndGroupSelector'

const Harness = () => {
  const formControl = useForm()
  return (
    <CippFormUserAndGroupSelector
      formControl={formControl}
      name="assignees"
      multiple
    />
  )
}

describe('CippFormUserAndGroupSelector', () => {
  it('leaves the tenant to the autocomplete, so the request carries one tenantFilter', () => {
    // A second TenantFilter in api.data made the request carry both casings, and
    // ListUsersAndGroups then returned no users or groups.
    render(<Harness />)
    expect(captured.props.api.url).toBe('/api/ListUsersAndGroups')
    expect(captured.props.api.tenantFilter).toBe('contoso.onmicrosoft.com')
    expect(Object.keys(captured.props.api.data ?? {})).not.toContain(
      'TenantFilter'
    )
  })

  it('leaves the tenant out of the query key, which the autocomplete appends', () => {
    render(<Harness />)
    expect(captured.props.api.queryKey).toBe('ListUsersAndGroups')
  })
})
