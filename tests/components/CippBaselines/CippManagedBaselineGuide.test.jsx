import React from 'react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { renderWithProviders } from '../../test-utils'

vi.mock('../../../src/api/ApiCall', async () =>
  (await import('../../mocks/api-call')).apiCallMock()
)
import { api, getResult } from '../../mocks/api-call'
import { ApiGetCall } from '../../../src/api/ApiCall'
import {
  CippManagedBaselineGuide,
  CippManagedBaselineGuideTabs,
} from '../../../src/components/CippBaselines/CippManagedBaselineGuide'

const guideResult = getResult({
  data: {
    Results: {
      name: 'Email Protection',
      version: '2',
      importedVersion: '1',
      overview: 'List the **devices** that send mail.',
      stages: [
        {
          name: 'Baseline',
          guide: 'Agree on the forwarding exceptions first.',
          // A single example arrives as a bare object.
          communications: {
            title: 'Announcement of the forwarding block',
            audience: 'Client contact',
            body: 'We are going to block automatic forwarding.',
          },
        },
        { name: 'Hardening', guide: '', communications: [] },
      ],
    },
  },
})

describe('CippManagedBaselineGuide', () => {
  beforeEach(() => {
    ApiGetCall.mockClear()
  })

  it('shows the overview, each stage in order and its communication examples', () => {
    api.get = guideResult
    renderWithProviders(<CippManagedBaselineGuide guid="baseline-1" />)

    expect(ApiGetCall.mock.calls[0][0]).toMatchObject({
      url: '/api/ListManagedBaselineGuide',
      data: { GUID: 'baseline-1' },
      waiting: true,
    })
    expect(screen.getByText('devices')).toBeInTheDocument()
    expect(screen.getByText('Stage 1: Baseline')).toBeInTheDocument()
    expect(screen.getByText('Stage 2: Hardening')).toBeInTheDocument()
    expect(
      screen.getByText('Agree on the forwarding exceptions first.')
    ).toBeInTheDocument()
    expect(
      screen.getByText('Announcement of the forwarding block')
    ).toBeInTheDocument()
    expect(screen.getByText('Client contact')).toBeInTheDocument()
    expect(screen.getAllByText('Communication Examples')).toHaveLength(1)
    expect(
      screen.getByText(/This guide is for CyberDrain version 2/)
    ).toBeInTheDocument()
  })

  it('says so when CyberDrain has not written a guide', () => {
    api.get = getResult({
      data: {
        Results: {
          version: '1',
          overview: '',
          stages: [{ name: 'Baseline', guide: '', communications: [] }],
        },
      },
    })
    renderWithProviders(<CippManagedBaselineGuide id="one" />)

    expect(
      screen.getByText(
        'CyberDrain has not published a guide for this baseline yet.'
      )
    ).toBeInTheDocument()
  })

  it('only asks for the guide once the Guide tab is opened', async () => {
    api.get = guideResult
    renderWithProviders(
      <CippManagedBaselineGuideTabs requestId="request-9">
        <div>The details</div>
      </CippManagedBaselineGuideTabs>
    )

    expect(screen.getByText('The details')).toBeInTheDocument()
    expect(ApiGetCall).not.toHaveBeenCalled()

    await userEvent.click(screen.getByRole('tab', { name: 'Guide' }))

    expect(ApiGetCall.mock.calls[0][0]).toMatchObject({
      data: { requestId: 'request-9' },
    })
    expect(screen.getByText('Stage 1: Baseline')).toBeInTheDocument()
  })
})
