import React from 'react'
import { renderWithProviders } from '../../test-utils'
import { CippHead } from '../../../src/components/CippComponents/CippHead'

describe('CippHead', () => {
  it('sets document.title with tenant appended by default', () => {
    renderWithProviders(<CippHead title="Users" />)
    expect(document.title).toBe('Users - testdomain.com')
  })

  it('sets document.title without tenant when noTenant=true', () => {
    renderWithProviders(<CippHead title="Users" noTenant={true} />)
    expect(document.title).toBe('Users')
  })

  it('sets document.title without tenant when currentTenant is null', () => {
    renderWithProviders(<CippHead title="Users" />, {
      settings: { currentTenant: null, handleUpdate: () => {}, handleReset: () => {}, isCustom: false },
    })
    expect(document.title).toBe('Users')
  })
})
