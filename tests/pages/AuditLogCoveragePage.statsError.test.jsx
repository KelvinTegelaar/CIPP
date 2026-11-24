import React from 'react'
import { describe, it, expect, vi } from 'vitest'
import { screen } from '@testing-library/react'
import { renderWithProviders } from '../test-utils'

vi.mock('../../src/api/ApiCall', async () => (await import('../mocks/api-call')).apiCallMock())
import { api, getResult } from '../mocks/api-call'

// the detail table fetches on its own, the chart lib needs a canvas
vi.mock('../../src/components/CippTable/CippDataTable', () => ({ CippDataTable: () => null }))
vi.mock('../../src/components/chart', () => ({ Chart: () => null }))

import Page from '../../src/pages/tenant/administration/audit-logs/coverage.jsx'

describe('Audit log search coverage page - stats fetch failure', () => {
  it('shows a load error instead of healthy KPIs and an all-clear problems card', () => {
    api.get = getResult({ isSuccess: false, isError: true, error: { message: 'Request failed with status code 500' } })
    renderWithProviders(<Page />)

    expect(screen.getByText(/Could not load search coverage/)).toBeInTheDocument()
    expect(screen.queryByText('Needs attention')).not.toBeInTheDocument()
    expect(screen.queryByText(/No problems in this period/)).not.toBeInTheDocument()
    expect(screen.queryByText(/No search windows in this period/)).not.toBeInTheDocument()
  })
})
