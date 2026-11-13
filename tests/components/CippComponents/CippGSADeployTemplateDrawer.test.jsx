import React from 'react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render } from '@testing-library/react'

const captured = vi.hoisted(() => ({ field: null, tenants: null }))
vi.mock('../../../src/components/CippComponents/CippFormComponent', () => ({
  default: (props) => {
    captured.field = props
    return null
  },
}))
vi.mock(
  '../../../src/components/CippComponents/CippFormTenantSelector',
  () => ({
    CippFormTenantSelector: (props) => {
      captured.tenants = props
      return null
    },
  })
)
vi.mock('../../../src/components/CippComponents/CippOffCanvas', () => ({
  CippOffCanvas: ({ children }) => <div>{children}</div>,
}))
vi.mock('../../../src/components/CippComponents/CippApiResults', () => ({
  CippApiResults: () => null,
}))
vi.mock('../../../src/api/ApiCall', () => ({
  ApiPostCall: () => ({ mutate: vi.fn(), reset: vi.fn(), isPending: false }),
}))

import { CippGSADeployTemplateDrawer } from '../../../src/components/CippComponents/CippGSADeployTemplateDrawer'

describe('CippGSADeployTemplateDrawer', () => {
  beforeEach(() => {
    captured.field = null
    captured.tenants = null
  })

  it('locks the template from a templates page row and leaves the tenants to pick', () => {
    render(
      <CippGSADeployTemplateDrawer
        kind="filteringPolicy"
        open
        template={{ GUID: 'tpl-1', name: 'Block risky' }}
        onClose={() => {}}
      />
    )
    expect(captured.field.disabled).toBe(true)
    expect(captured.field.options).toEqual([
      { value: 'tpl-1', label: 'Block risky' },
    ])
    expect(captured.tenants.preselectedEnabled).toBe(false)
  })

  it('lists templates without the tenant on a live page and preselects the tenant', () => {
    render(
      <CippGSADeployTemplateDrawer
        kind="securityProfile"
        open
        onClose={() => {}}
      />
    )
    expect(captured.field.api.url).toBe('/api/ListGSASecurityProfileTemplates')
    expect(captured.field.api.excludeTenantFilter).toBe(true)
    expect(captured.tenants.preselectedEnabled).toBe(true)
  })
})
