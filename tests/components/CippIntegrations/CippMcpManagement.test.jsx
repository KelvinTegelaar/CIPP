import React from 'react'
import { describe, it, expect, vi } from 'vitest'
import { screen } from '@testing-library/react'
import { renderWithProviders } from '../../test-utils'
import { McpFeatureDisabledAlert } from '../../../src/components/CippIntegrations/CippMcpManagement'
import { api, getResult } from '../../mocks/api-call'

vi.mock('../../../src/api/ApiCall', async () =>
  (await import('../../mocks/api-call')).apiCallMock()
)
// Shape of a Get-CIPPFeatureFlag row as ListFeatureFlags returns it.
const flagsResult = (enabled) =>
  getResult({
    data: [
      {
        Id: 'MCPServer',
        Name: 'MCP Server',
        Description: 'Model Context Protocol (MCP) server endpoint.',
        AllowUserToggle: true,
        Timers: [],
        Endpoints: ['ExecMcp'],
        Pages: [],
        HidesPages: null,
        Hidden: false,
        Enabled: enabled,
      },
    ],
  })

describe('McpFeatureDisabledAlert', () => {
  it('stays hidden while the flags load and when MCPServer is enabled', () => {
    api.get = getResult({ isSuccess: false, isLoading: true })
    const { rerender } = renderWithProviders(<McpFeatureDisabledAlert />)
    expect(screen.queryByText(/MCP Server feature is disabled/)).toBeNull()

    api.get = flagsResult(true)
    rerender(<McpFeatureDisabledAlert />)
    expect(screen.queryByText(/MCP Server feature is disabled/)).toBeNull()
  })

  it('directs the user to the Features page when MCPServer is disabled', () => {
    api.get = flagsResult(false)
    renderWithProviders(<McpFeatureDisabledAlert />)
    expect(screen.getByText(/MCP Server feature is disabled/)).toBeTruthy()
    expect(
      screen.getByRole('link', { name: 'Open Features' }).getAttribute('href')
    ).toBe('/cipp/settings/features')
  })
})
