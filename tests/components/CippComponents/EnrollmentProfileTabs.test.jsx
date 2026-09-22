import React from 'react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { renderWithProviders, settingsWith } from '../../test-utils'
import {
  AppleADEEnrollmentProfiles,
  WindowsAutopilotEnrollmentProfiles,
} from '../../../src/components/CippComponents/EnrollmentProfileTabs.jsx'

// appleFilters presets must carry type: 'column', untyped presets land the
// [{id, value}] array in the global filter slot ("[object Object]", zero rows)

vi.mock('../../../src/api/ApiCall', async () => (await import('../../mocks/api-call')).apiCallMock())
import { api, getResult, postResult } from '../../mocks/api-call'

// fixture mirrors Invoke-ListAppleEnrollmentProfiles.ps1: Results.Tokens from graph
// depOnboardingSettings (+daysUntilExpiration/isExpired), Results.Profiles from
// enrollmentProfiles (+platform/profileType/token fields)
// stable refs, see GraphExplorerPage.test.jsx (fresh literals per call loop the data-sync effects)
const appleResult = getResult({
  data: {
    Results: {
      Tokens: [
        {
          id: 'f7a2c1d0-1111-2222-3333-444455556666',
          tokenName: 'Contoso ABM',
          tokenType: 'dep',
          appleIdentifier: 'abm-admin@contoso.com',
          tokenExpirationDateTime: '2027-01-15T00:00:00Z',
          lastSuccessfulSyncDateTime: '2026-07-30T06:00:00Z',
          lastSyncErrorCode: 0,
          syncedDeviceCount: 12,
          shareTokenWithSchoolDataSyncService: false,
          dataSharingConsentGranted: true,
          roleScopeTagIds: ['0'],
          daysUntilExpiration: 167,
          isExpired: false,
        },
      ],
      Profiles: [
        {
          '@odata.type': '#microsoft.graph.depMacOSEnrollmentProfile',
          id: 'a1b2c3d4-0001-0001-0001-000000000001',
          displayName: 'Mac Default',
          description: 'macOS ADE profile',
          requiresUserAuthentication: true,
          isDefault: true,
          supervisedModeEnabled: true,
          profileRemovalDisabled: true,
          deviceNameTemplate: '',
          platform: 'macOS',
          profileType: 'apple',
          tokenId: 'f7a2c1d0-1111-2222-3333-444455556666',
          tokenName: 'Contoso ABM',
          appleIdentifier: 'abm-admin@contoso.com',
          tokenExpirationDateTime: '2027-01-15T00:00:00Z',
          tokenType: 'dep',
        },
        {
          '@odata.type': '#microsoft.graph.depMacOSEnrollmentProfile',
          id: 'a1b2c3d4-0002-0002-0002-000000000002',
          displayName: 'Mac Kiosk',
          description: 'shared mac carts',
          requiresUserAuthentication: false,
          isDefault: false,
          supervisedModeEnabled: true,
          profileRemovalDisabled: true,
          deviceNameTemplate: '',
          platform: 'macOS',
          profileType: 'apple',
          tokenId: 'f7a2c1d0-1111-2222-3333-444455556666',
          tokenName: 'Contoso ABM',
          appleIdentifier: 'abm-admin@contoso.com',
          tokenExpirationDateTime: '2027-01-15T00:00:00Z',
          tokenType: 'dep',
        },
        {
          '@odata.type': '#microsoft.graph.depIOSEnrollmentProfile',
          id: 'a1b2c3d4-0003-0003-0003-000000000003',
          displayName: 'iPad Classroom',
          description: 'supervised ipads',
          requiresUserAuthentication: true,
          isDefault: false,
          supervisedModeEnabled: true,
          profileRemovalDisabled: true,
          deviceNameTemplate: '',
          platform: 'iOS/iPadOS',
          profileType: 'apple',
          tokenId: 'f7a2c1d0-1111-2222-3333-444455556666',
          tokenName: 'Contoso ABM',
          appleIdentifier: 'abm-admin@contoso.com',
          tokenExpirationDateTime: '2027-01-15T00:00:00Z',
          tokenType: 'dep',
        },
      ],
    },
  },
})

const emptyGetResult = getResult({ isSuccess: false })

api.get = (opts) => (opts.url === '/api/ListAppleEnrollmentProfiles' ? appleResult : emptyGetResult)
api.post = postResult()

// fixture mirrors Invoke-ListAutopilotconfig.ps1 type=ApProfile: graph
// windowsAutopilotDeploymentProfiles rows (bare array, no Results wrapper) with the
// CIPP-computed PolicyAssignment string; graph itself only carries target.groupId
const autopilotResult = getResult({
  data: {
    pages: [
      [
        {
          '@odata.type': '#microsoft.graph.azureADWindowsAutopilotDeploymentProfile',
          id: '6800d733-8bf8-4b51-8251-e2f0385ad307',
          displayName: 'Windows machines',
          description: '',
          language: 'os-default',
          extractHardwareHash: true,
          deviceNameTemplate: 'CONTOSO-%SERIAL%',
          assignments: [
            {
              id: '6800d733-8bf8-4b51-8251-e2f0385ad307_a1b2c3d4-0001-0001-0001-000000000001',
              target: {
                '@odata.type': '#microsoft.graph.groupAssignmentTarget',
                groupId: 'a1b2c3d4-0001-0001-0001-000000000001',
              },
            },
          ],
          PolicyTypeName: 'Autopilot Profile',
          URLName: 'windowsAutopilotDeploymentProfiles',
          PolicyAssignment: 'Autopilot Devices',
          PolicyExclude: '',
        },
      ],
    ],
  },
  fetchNextPage: vi.fn(),
})
api.paginated = (opts) =>
  opts.url === '/api/ListAutopilotConfig' && opts.data?.type === 'ApProfile'
    ? autopilotResult
    : emptyGetResult

describe('AppleADEEnrollmentProfiles - platform preset filters', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('macOS preset lands in the column filter slot and narrows to macOS rows', async () => {
    const user = userEvent.setup()
    renderWithProviders(<AppleADEEnrollmentProfiles />)
    await screen.findByText('1-3 of 3')

    await user.click(screen.getByRole('button', { name: 'Filters' }))
    await user.click(await screen.findByRole('menuitem', { name: 'macOS' }))

    await waitFor(() => {
      expect(screen.getByText('1-2 of 2')).toBeInTheDocument()
    })
  })

  it('iOS/iPadOS preset narrows to the iOS row instead of blanking the table', async () => {
    const user = userEvent.setup()
    renderWithProviders(<AppleADEEnrollmentProfiles />)
    await screen.findByText('1-3 of 3')

    await user.click(screen.getByRole('button', { name: 'Filters' }))
    await user.click(await screen.findByRole('menuitem', { name: 'iOS/iPadOS' }))

    await waitFor(() => {
      expect(screen.getByText('1-1 of 1')).toBeInTheDocument()
    })
  })

  it('All preset clears the platform column filter, not just the global slot', async () => {
    const user = userEvent.setup()
    renderWithProviders(<AppleADEEnrollmentProfiles />)
    await screen.findByText('1-3 of 3')

    await user.click(screen.getByRole('button', { name: 'Filters' }))
    await user.click(await screen.findByRole('menuitem', { name: 'macOS' }))
    await waitFor(() => {
      expect(screen.getByText('1-2 of 2')).toBeInTheDocument()
    })

    // untyped All would setGlobalFilter([]) and leave the column filter live at 2 rows
    // macOS preset is active here, button label is 'Filters (1)'
    await user.click(screen.getByRole('button', { name: /Filters/ }))
    await user.click(await screen.findByRole('menuitem', { name: 'All' }))
    await waitFor(() => {
      expect(screen.getByText('1-3 of 3')).toBeInTheDocument()
    })
  })
})

describe('WindowsAutopilotEnrollmentProfiles - assignment names', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  // card view: MRT's virtualizer renders zero rows in jsdom, cards show the first
  // three non-status columns as detail rows so the column value is reachable
  it('shows the resolved group name on the row instead of only the target groupId', async () => {
    renderWithProviders(<WindowsAutopilotEnrollmentProfiles />, {
      settings: settingsWith({ tableViewMode: 'cards' }),
    })

    // falling back to the raw /api/ListGraphRequest passthrough, or dropping the
    // PolicyAssignment column, leaves the user with a guid in Extended Info and nothing here
    expect(await screen.findByText('Autopilot Devices')).toBeInTheDocument()
  })
})
