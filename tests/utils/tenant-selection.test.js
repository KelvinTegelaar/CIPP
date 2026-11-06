import { describe, it, expect } from 'vitest'
import {
  isMultiTenant,
  isTenantGroup,
  tenantGroupId,
  toTenantGroup,
  tenantScope,
  isMultiTenantScope,
} from '../../src/utils/tenant-selection'

describe('tenant selection kinds', () => {
  it.each([
    ['contoso.com', false, false, null],
    ['AllTenants', true, false, null],
    ['group:g1', true, true, 'g1'],
    [undefined, false, false, null],
  ])('%s', (value, multi, group, id) => {
    expect(isMultiTenant(value)).toBe(multi)
    expect(isTenantGroup(value)).toBe(group)
    expect(tenantGroupId(value)).toBe(id)
  })

  it('round-trips a group id', () => {
    expect(tenantGroupId(toTenantGroup('g1'))).toBe('g1')
  })
})

describe('tenantScope', () => {
  it.each([
    ['contoso.com', { tenantFilter: 'contoso.com' }],
    ['AllTenants', { tenantFilter: 'AllTenants' }],
    ['group:g1', { tenantGroup: 'g1' }],
  ])('%s', (selection, params) => {
    expect(tenantScope(selection)).toEqual(params)
  })

  it.each([
    [{ tenantFilter: 'contoso.com' }, false],
    [{ tenantFilter: 'AllTenants' }, true],
    [{ tenantGroup: 'g1' }, true],
    [undefined, false],
  ])('isMultiTenantScope(%j) is %s', (data, multi) => {
    expect(isMultiTenantScope(data)).toBe(multi)
  })
})
